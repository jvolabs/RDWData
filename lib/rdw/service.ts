import {
  rdwUrl,
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
export type PlateLookupDatasetKey = "main" | "fuel" | "apk" | "defects" | "recalls" | "body";
type PlateLookupOptions = {
  allowErrorStatuses?: number[];
  returnEmptyIfNotPlateFilterable?: boolean;
};

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
      fuelType: v.fuelType ?? null,
      co2: v.co2 ?? null,
      energyLabel: v.energyLabel ?? null,
      consumptionCombined: v.consumptionCombined ?? null,
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
      previousOwners: v.previousOwners ?? null,
      firstRegistrationNL: v.firstRegistrationNL ?? null,
      firstRegistrationWorld: v.firstRegistrationWorld ?? null,
      wok: Boolean(v.wok),
      exportIndicator: Boolean(v.exportIndicator),
      transferPossible: Boolean(v.transferPossible),
      recallsCount: v.recallsCount ?? 0
    },
    inspections: profile.inspections ?? [],
    defects: profile.defects ?? raw.defects ?? [],
    recalls: profile.recalls ?? [],
    raw: {
      main: raw.main ?? [],
      fuel: raw.fuel ?? [],
      apk: raw.apk ?? [],
      defects: raw.defects ?? [],
      recalls: raw.recalls ?? [],
      body: raw.body ?? []
    }
  };
}


export async function getRdwDatasetByPlate(
  dataset: PlateLookupDatasetKey,
  plate: string,
  options?: PlateLookupOptions
): Promise<RdwRecord[]> {
  const datasetId = DATASETS[dataset];
  if (NON_PLATE_FILTERABLE_DATASETS.has(datasetId)) {
    if (options?.returnEmptyIfNotPlateFilterable) {
      return [];
    }
    throw new ApiError(
      422,
      "DATASET_NOT_PLATE_FILTERABLE",
      `Dataset '${dataset}' is not directly searchable by kenteken in RDW open data.`
    );
  }
  return fetchRdwDataset(rdwUrl(datasetId, plate), options);
}

export async function getVehicleProfile(plate: string): Promise<VehicleProfile> {
  const now = Date.now();
  try {
    await connectMongo();
    const cached = await VehicleCacheModel.findById(plate).lean<VehicleCacheDoc | null>();
    if (cached && cached.expiresAt?.getTime() > now) {
      // Re-run the mapper on the cached raw data so any mapper
      // improvements automatically apply to already-cached records.
      const cachedData = cached.data as Partial<VehicleProfile>;
      const raw = cachedData.raw;
      if (raw?.main?.length) {
        return {
          ...toVehicleProfile({
            plate,
            fromCache: true,
            main: raw.main ?? [],
            fuel: raw.fuel ?? [],
            apk: raw.apk ?? [],
            defects: raw.defects ?? [],
            recalls: raw.recalls ?? [],
            body: raw.body ?? []
          }),
          fromCache: true
        };
      }
      // Fallback: no raw data in cache, use stored profile
      return { ...withProfileDefaults(cachedData), fromCache: true };
    }
  } catch (error) {
    console.warn("Vehicle cache read unavailable; falling back to live RDW fetch.", error);
  }

  const [main, fuel, apk, defects, recalls, body] = await Promise.all([
    getRdwDatasetByPlate("main", plate),
    getRdwDatasetByPlate("fuel", plate),
    getRdwDatasetByPlate("apk", plate),
    getRdwDatasetByPlate("defects", plate, { returnEmptyIfNotPlateFilterable: true }),
    getRdwDatasetByPlate("recalls", plate, { returnEmptyIfNotPlateFilterable: true }),
    getRdwDatasetByPlate("body", plate)
  ]);

  const profile = toVehicleProfile({
    plate,
    fromCache: false,
    main,
    fuel,
    apk,
    defects,
    recalls,
    body
  });

  try {
    await connectMongo();
    await VehicleCacheModel.findByIdAndUpdate(
      plate,
      {
        _id: plate,
        data: profile,
        cachedAt: new Date(now),
        expiresAt: new Date(now + CACHE_TTL_MS)
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.warn("Vehicle cache write skipped due to Mongo availability/auth.", error);
  }

  return profile;
}
