const DUTCH_PLATE_SERIES: Array<{ regex: RegExp; chunks: number[] }> = [
  { regex: /^[A-Z]{2}\d{2}\d{2}$/, chunks: [2, 2, 2] }, // AB-12-34
  { regex: /^\d{2}[A-Z]{2}\d{2}$/, chunks: [2, 2, 2] }, // 12-AB-34
  { regex: /^\d{2}\d{2}[A-Z]{2}$/, chunks: [2, 2, 2] }, // 12-34-AB
  { regex: /^[A-Z]{2}\d{2}[A-Z]{2}$/, chunks: [2, 2, 2] }, // AB-12-CD
  { regex: /^[A-Z]{2}[A-Z]{2}\d{2}$/, chunks: [2, 2, 2] }, // AB-CD-12
  { regex: /^\d{2}[A-Z]{2}[A-Z]{2}$/, chunks: [2, 2, 2] }, // 12-AB-CD
  { regex: /^\d{2}[A-Z]{3}\d$/, chunks: [2, 3, 1] }, // 12-ABC-3 (e.g. 16-RSL-9)
  { regex: /^\d[A-Z]{3}\d{2}$/, chunks: [1, 3, 2] }, // 1-ABC-23
  { regex: /^[A-Z]{3}\d{2}\d$/, chunks: [3, 2, 1] }, // ABC-12-3
  { regex: /^\d[A-Z]{2}\d{3}$/, chunks: [1, 2, 3] }, // 1-AB-234
  { regex: /^[A-Z]{2}\d{3}[A-Z]$/, chunks: [2, 3, 1] }, // AB-123-C
  { regex: /^[A-Z]\d{3}[A-Z]{2}$/, chunks: [1, 3, 2] }, // A-123-BC
  { regex: /^\d{3}[A-Z]{2}\d$/, chunks: [3, 2, 1] } // 123-AB-4
];

export function normalizePlate(input: string): string {
  return input.replace(/-/g, "").replace(/\s+/g, "").toUpperCase().trim();
}

export function validateDutchPlate(plate: string): boolean {
  return DUTCH_PLATE_SERIES.some((series) => series.regex.test(plate));
}

export function formatDisplayPlate(plate: string): string {
  const series = DUTCH_PLATE_SERIES.find((item) => item.regex.test(plate));
  if (series) {
    let index = 0;
    return series.chunks
      .map((size) => {
        const chunk = plate.slice(index, index + size);
        index += size;
        return chunk;
      })
      .join("-");
  }
  return plate;
}
