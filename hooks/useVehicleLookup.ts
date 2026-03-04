"use client";

import { useMemo } from "react";
import { normalizePlate, validateDutchPlate } from "@/lib/rdw/normalize";
import { useGetVehicleByPlateQuery } from "@/lib/store/services/vehicleApi";

export function useVehicleLookup(rawPlate: string) {
  const normalized = useMemo(() => normalizePlate(rawPlate), [rawPlate]);
  const isValid = useMemo(() => validateDutchPlate(normalized), [normalized]);

  const query = useGetVehicleByPlateQuery(normalized, {
    skip: !isValid
  });

  return {
    normalized,
    isValid,
    ...query
  };
}

