import { NextResponse } from "next/server";
import { toApiError } from "./api-error";

export function errorResponse(error: unknown, fallbackMessage?: string) {
  const apiError = toApiError(error, fallbackMessage);
  return NextResponse.json(
    {
      error: apiError.message,
      code: apiError.code,
      ...(apiError.details !== undefined ? { details: apiError.details } : {})
    },
    { status: apiError.status }
  );
}
