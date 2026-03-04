import { formatDisplayPlate } from "./normalize";
import type { RdwRecord, VehicleProfile } from "./types";

function str(v: unknown): string | null {
  if (v == null || v === "") return null;
  return String(v);
}
function num(v: unknown): number | null {
  const n = Number(v);
  return v != null && v !== "" && Number.isFinite(n) ? n : null;
}
function bool(v: unknown): boolean {
  const s = String(v ?? "").toLowerCase();
  return s === "ja" || s === "j" || v === true || s === "yes";
}
function dateStr(v: unknown): string | null {
  const s = str(v);
  if (!s || s.length < 8) return null;
  // RDW dates are YYYYMMDD → format as YYYY-MM-DD
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  return s;
}

export function toVehicleProfile(input: {
  plate: string;
  fromCache: boolean;
  main: RdwRecord[];
  fuel: RdwRecord[];
  apk: RdwRecord[];
  defects: RdwRecord[];
  recalls: RdwRecord[];
  body: RdwRecord[];
}): VehicleProfile {
  const m = input.main[0] ?? {};
  const f = input.fuel[0] ?? {};

  const yearRaw = str(m.datum_eerste_toelating);
  const year = yearRaw ? Number(yearRaw.slice(0, 4)) : null;

  // APK date: RDW stores as YYYYMMDD number
  const apkRaw = str(m.vervaldatum_apk);
  const apkDisplay = dateStr(apkRaw);

  return {
    plate: input.plate,
    displayPlate: formatDisplayPlate(input.plate),
    fromCache: input.fromCache,

    vehicle: {
      // Identity
      brand: str(m.merk),
      tradeName: str(m.handelsbenaming),
      year: Number.isFinite(year) ? year : null,
      color: {
        primary: str(m.eerste_kleur),
        secondary: str(m.tweede_kleur)
      },

      // Body
      bodyType: str(m.inrichting),
      doors: num(m.aantal_deuren),
      seats: num(m.aantal_zitplaatsen),

      // Fuel & Emissions
      fuelType: str(f.brandstof_omschrijving),
      co2: num(f.co2_uitstoot_gecombineerd),
      energyLabel: str(f.zuinigheidsclassificatie),
      consumptionCombined: num(f.brandstofverbruik_gecombineerd),

      // Engine
      engine: {
        displacement: num(f.cilinderinhoud ?? m.cilinderinhoud),
        cylinders: num(m.aantal_cilinders),
        powerKw: num(f.nettomaximumvermogen ?? m.vermogen_massarijklaar)
      },

      // Weight
      weight: {
        empty: num(m.massa_ledig_voertuig),
        max: num(m.toegestane_maximum_massa_voertuig),
        payload: num(m.laadvermogen)
      },

      // APK
      apkExpiryDate: apkDisplay,

      // Ownership
      owners: { count: num(m.aantal_houders) },
      previousOwners: num(m.aantal_houders),

      // Import
      firstRegistrationNL: dateStr(m.datum_eerste_tenaamstelling_in_nederland),
      firstRegistrationWorld: dateStr(m.datum_eerste_toelating),

      // Flags
      wok: bool(m.wacht_op_keuren),
      exportIndicator: bool(m.exportindicator),
      transferPossible: bool(m.tenaamstellen_mogelijk),

      recallsCount: input.recalls.length
    },

    inspections: input.apk,
    defects: input.defects,
    recalls: input.recalls,

    raw: {
      main: input.main,
      fuel: input.fuel,
      apk: input.apk,
      defects: input.defects,
      recalls: input.recalls,
      body: input.body
    }
  };
}
