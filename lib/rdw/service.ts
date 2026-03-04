import {
  rdwUrl,
  rdwSoqlUrl,
  DATASETS,
  NON_PLATE_FILTERABLE_DATASETS
} from "@/lib/rdw/endpoints";
import { fetchRdwDataset } from "@/lib/rdw/client";
import { toVehicleProfile } from "@/lib/rdw/mapper";
import { connectMongo } from "@/lib/db/mongodb";
import { VehicleCacheModel } from "@/models/VehicleCache";
import type { VehicleCacheDoc } from "@/models/VehicleCache";
import type { RdwRecord, VehicleProfile } from "@/lib/rdw/types";
import { ApiError } from "@/lib/api/api-error";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type PlateLookupDatasetKey =
  | "main" | "fuel" | "apk" | "defects" | "recalls" | "body" | "typeApprovals";

type PlateLookupOptions = {
  allowErrorStatuses?: number[];
  returnEmptyIfNotPlateFilterable?: boolean;
};

/**
 * Re-hydrate a cached profile by re-running the mapper over its raw data.
 * This ensures any mapper improvements apply automatically without clearing cache.
 */
function rehydrateFromRaw(plate: string, raw: VehicleProfile["raw"]): VehicleProfile {
  return toVehicleProfile({
    plate,
    fromCache: true,
    main: raw.main ?? [],
    fuel: raw.fuel ?? [],
    apk: raw.apk ?? [],
    defects: raw.defects ?? [],
    recalls: raw.recalls ?? [],
    body: raw.body ?? [],
    typeApprovals: raw.typeApprovals ?? []
  });
}

function withProfileDefaults(profile: Partial<VehicleProfile>): VehicleProfile {
  const raw = profile.raw ?? ({} as VehicleProfile["raw"]);
  const v = profile.vehicle ?? ({} as VehicleProfile["vehicle"]);
  return {
    plate: profile.plate ?? "",
    displayPlate: profile.displayPlate ?? profile.plate ?? "",
    fromCache: Boolean(profile.fromCache),
    vehicle: {
      brand: v.brand ?? null,
      tradeName: v.tradeName ?? null,
      year: v.year ?? null,
      color: {
        primary: v.color?.primary ?? null,
        secondary: v.color?.secondary ?? null
      },
      bodyType: v.bodyType ?? null,
      doors: v.doors ?? null,
      seats: v.seats ?? null,
      axles: v.axles ?? null,
      fuelType: v.fuelType ?? null,
      co2: v.co2 ?? null,
      energyLabel: v.energyLabel ?? null,
      consumptionCombined: v.consumptionCombined ?? null,
      emissionStandard: v.emissionStandard ?? null,

      engine: {
        displacement: v.engine?.displacement ?? null,
        cylinders: v.engine?.cylinders ?? null,
        powerKw: v.engine?.powerKw ?? null
      },
      weight: {
        empty: v.weight?.empty ?? null,
        max: v.weight?.max ?? null,
        payload: v.weight?.payload ?? null
      },
      apkExpiryDate: v.apkExpiryDate ?? null,
      owners: { count: v.owners?.count ?? null },
      firstRegistrationNL: v.firstRegistrationNL ?? null,
      firstRegistrationWorld: v.firstRegistrationWorld ?? null,
      wok: Boolean(v.wok),
      exportIndicator: Boolean(v.exportIndicator),
      transferPossible: Boolean(v.transferPossible),
      insured: Boolean(v.insured),
      isTaxi: Boolean(v.isTaxi),
      hasOpenRecall: Boolean(v.hasOpenRecall),
      napVerdict: v.napVerdict ?? null,
      napLastYear: v.napLastYear ?? null,
      cataloguePrice: v.cataloguePrice ?? null,
      recallsCount: v.recallsCount ?? 0
    },
    inspections: profile.inspections ?? [],
    defects: profile.defects ?? raw.defects ?? [],
    recalls: profile.recalls ?? [],
    typeApprovals: profile.typeApprovals ?? [],
    raw: {
      main: raw.main ?? [],
      fuel: raw.fuel ?? [],
      apk: raw.apk ?? [],
      defects: raw.defects ?? [],
      recalls: raw.recalls ?? [],
      body: raw.body ?? [],
      typeApprovals: raw.typeApprovals ?? []
    }
  };
}

export async function getRdwDatasetByPlate(
  dataset: PlateLookupDatasetKey,
  plate: string,
  options?: PlateLookupOptions
): Promise<RdwRecord[]> {
  const datasetId = DATASETS[dataset as keyof typeof DATASETS];
  if (NON_PLATE_FILTERABLE_DATASETS.has(datasetId)) {
    if (options?.returnEmptyIfNotPlateFilterable) return [];
    throw new ApiError(
      422,
      "DATASET_NOT_PLATE_FILTERABLE",
      `Dataset '${dataset}' is not directly searchable by kenteken.`
    );
  }
  return fetchRdwDataset(rdwUrl(datasetId, plate), options);
}

/**
 * Fetches recall campaigns for a plate using SoQL ($where) because the
 * af5r-44mf dataset rejects simple ?kenteken= queries with 400.
 * Returns [] on any error (recalls are best-effort).
 */
async function fetchRecallsSafe(plate: string): Promise<RdwRecord[]> {
  try {
    return await fetchRdwDataset(
      rdwSoqlUrl(DATASETS.recalls, plate),
      { allowErrorStatuses: [400, 404] }
    );
  } catch {
    return [];
  }
}

/**
 * Fetches EU type-approval data for a plate.
 * 55kv-xf7m may return 404 for some plates — treat as empty.
 */
async function fetchTypeApprovalsSafe(plate: string): Promise<RdwRecord[]> {
  try {
    return await fetchRdwDataset(
      rdwUrl(DATASETS.typeApprovals, plate),
      { allowErrorStatuses: [400, 404] }
    );
  } catch {
    return [];
  }
}

export async function getVehicleProfile(plate: string): Promise<VehicleProfile> {
  const now = Date.now();

  // --- Cache read ---
  try {
    await connectMongo();
    const cached = await VehicleCacheModel.findById(plate).lean<VehicleCacheDoc | null>();
    if (cached && cached.expiresAt?.getTime() > now) {
      const cachedData = cached.data as Partial<VehicleProfile>;
      const raw = cachedData.raw;
      if (raw?.main?.length) {
        return { ...rehydrateFromRaw(plate, raw as VehicleProfile["raw"]), fromCache: true };
      }
      return { ...withProfileDefaults(cachedData), fromCache: true };
    }
  } catch (error) {
    console.warn("Vehicle cache read unavailable; falling back to live RDW fetch.", error);
  }

  // --- Live fetch: 7 datasets fetched in parallel ---
  const [main, fuel, apk, defects, recalls, body, typeApprovals] = await Promise.all([
    getRdwDatasetByPlate("main", plate),
    getRdwDatasetByPlate("fuel", plate),
    getRdwDatasetByPlate("apk", plate),
    getRdwDatasetByPlate("defects", plate, { returnEmptyIfNotPlateFilterable: true }),
    fetchRecallsSafe(plate),
    getRdwDatasetByPlate("body", plate),
    fetchTypeApprovalsSafe(plate)
  ]);

  const profile = toVehicleProfile({
    plate, fromCache: false,
    main, fuel, apk, defects, recalls, body, typeApprovals
  });

  // --- Cache write ---
  try {
    await connectMongo();
    await VehicleCacheModel.findByIdAndUpdate(
      plate,
      { _id: plate, data: profile, cachedAt: new Date(now), expiresAt: new Date(now + CACHE_TTL_MS) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.warn("Vehicle cache write skipped.", error);
  }

  return profile;
}
