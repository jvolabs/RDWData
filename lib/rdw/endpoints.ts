const RDW_BASE_URL = process.env.RDW_BASE_URL || "https://opendata.rdw.nl/resource";

export const DATASETS = {
  main: "m9d7-ebf2",
  fuel: "8ys7-d773",
  apk: "a34c-vvps",
  defects: "hx2c-gt7k",
  recalls: "af5r-44mf",
  body: "vezc-m2t6",
  typeApprovals: "55kv-xf7m",
  approvedGarages: "5k74-3jha"
} as const;

export const NON_PLATE_FILTERABLE_DATASETS = new Set<string>([
  DATASETS.defects,
  DATASETS.recalls
]);

export function rdwUrl(datasetId: string, plate: string) {
  const url = new URL(`${RDW_BASE_URL}/${datasetId}.json`);
  url.searchParams.set("kenteken", plate);
  return url.toString();
}
