export type RdwRecord = Record<string, string | number | null>;

export type VehicleProfile = {
  plate: string;
  displayPlate: string;
  fromCache: boolean;
  vehicle: {
    // Identity
    brand: string | null;
    tradeName: string | null;
    year: number | null;
    color: {
      primary: string | null;
      secondary: string | null;
    };
    // Body
    bodyType: string | null;
    doors: number | null;
    seats: number | null;

    // Fuel & Emissions
    fuelType: string | null;
    co2: number | null;
    energyLabel: string | null;
    consumptionCombined: number | null;

    // Engine
    engine: {
      displacement: number | null;
      cylinders: number | null;
      powerKw: number | null;
    };

    // Weight
    weight: {
      empty: number | null;
      max: number | null;
      payload: number | null;
    };

    // APK
    apkExpiryDate: string | null;

    // Ownership
    owners: { count: number | null };
    previousOwners: number | null;

    // Import
    firstRegistrationNL: string | null;
    firstRegistrationWorld: string | null;

    // Flags
    wok: boolean;
    exportIndicator: boolean;
    transferPossible: boolean;

    recallsCount: number;
  };
  inspections: RdwRecord[];
  defects: RdwRecord[];
  recalls: RdwRecord[];
  raw: {
    main: RdwRecord[];
    fuel: RdwRecord[];
    apk: RdwRecord[];
    defects: RdwRecord[];
    recalls: RdwRecord[];
    body: RdwRecord[];
  };
};
