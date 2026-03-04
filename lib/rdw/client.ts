import type { RdwRecord } from "./types";
import { ApiError } from "../api/api-error";

const RDW_TIMEOUT_MS = Number(process.env.RDW_TIMEOUT_MS ?? 7000);
const RDW_MAX_RETRIES = Number(process.env.RDW_MAX_RETRIES ?? 2);
type FetchRdwOptions = {
  allowErrorStatuses?: number[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status: number) {
  return status === 429 || status >= 500;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RDW_TIMEOUT_MS);
  try {
    return await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRdwDataset(
  url: string,
  options?: FetchRdwOptions
): Promise<RdwRecord[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RDW_MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url);
      if (response.ok) {
        return (await response.json()) as RdwRecord[];
      }
      if (options?.allowErrorStatuses?.includes(response.status)) {
        return [];
      }

      if (!shouldRetry(response.status) || attempt === RDW_MAX_RETRIES) {
        throw new ApiError(
          502,
          "RDW_REQUEST_FAILED",
          `RDW request failed with status ${response.status}.`,
          { url, status: response.status }
        );
      }
      await sleep(200 * (attempt + 1));
    } catch (error) {
      lastError = error;
      const isAbort = error instanceof Error && error.name === "AbortError";
      if (attempt === RDW_MAX_RETRIES) break;
      if (!isAbort) {
        await sleep(200 * (attempt + 1));
      }
    }
  }

  if (lastError instanceof ApiError) {
    throw lastError;
  }
  if (lastError instanceof Error && lastError.name !== "AbortError") {
    throw new ApiError(502, "RDW_UNAVAILABLE", "RDW service is currently unreachable.", {
      url,
      reason: lastError.message
    });
  }
  throw new ApiError(504, "RDW_TIMEOUT", "RDW service did not respond in time.", {
    url
  });
}
