import { normalizePlate, validateDutchPlate } from "../rdw/normalize";
import { ApiError } from "./api-error";

export type PlateDatasetKey = "main" | "fuel" | "apk" | "defects" | "recalls" | "body";

const DATASET_ALIASES: Record<string, PlateDatasetKey> = {
  main: "main",
  fuel: "fuel",
  apk: "apk",
  defects: "defects",
  recalls: "recalls",
  body: "body"
};

export function parsePlateOrThrow(input: string): string {
  const plate = normalizePlate(input);
  if (!validateDutchPlate(plate)) {
    throw new ApiError(
      400,
      "INVALID_PLATE",
      "Invalid Dutch license plate format."
    );
  }
  return plate;
}

export function parseDatasetOrThrow(input: string): PlateDatasetKey {
  const datasetKey = DATASET_ALIASES[input.trim().toLowerCase()];
  if (!datasetKey) {
    throw new ApiError(
      400,
      "INVALID_DATASET",
      "Invalid dataset. Use one of: main, fuel, apk, defects, recalls, body."
    );
  }
  return datasetKey;
}
