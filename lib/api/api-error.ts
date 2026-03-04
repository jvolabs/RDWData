export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function toApiError(
  error: unknown,
  fallbackMessage = "Unexpected server error."
): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) {
    return new ApiError(500, "INTERNAL_ERROR", error.message);
  }
  return new ApiError(500, "INTERNAL_ERROR", fallbackMessage);
}
