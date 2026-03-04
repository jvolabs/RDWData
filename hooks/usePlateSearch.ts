"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDisplayPlate, normalizePlate, validateDutchPlate } from "@/lib/rdw/normalize";

export function usePlateSearch() {
  const router = useRouter();
  const [plateInput, setPlateInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalized = useMemo(() => normalizePlate(plateInput).slice(0, 7), [plateInput]);
  const preview = useMemo(() => formatDisplayPlate(normalized), [normalized]);
  const isValid = useMemo(() => validateDutchPlate(normalized), [normalized]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const plate = normalizePlate(plateInput);

    if (!plate) {
      setError("Enter a Dutch plate.");
      return;
    }

    if (!validateDutchPlate(plate)) {
      setError("Invalid Dutch plate format. Example: 16-RSL-9");
      return;
    }

    setError(null);
    router.push(`/search/${encodeURIComponent(plate)}`);
  };

  return {
    plateInput,
    setPlateInput,
    error,
    setError,
    normalized,
    preview,
    isValid,
    onSubmit
  };
}

