"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.toApiError = toApiError;
class ApiError extends Error {
    status;
    code;
    details;
    constructor(status, code, message, details) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
exports.ApiError = ApiError;
function toApiError(error, fallbackMessage = "Unexpected server error.") {
    if (error instanceof ApiError)
        return error;
    if (error instanceof Error) {
        return new ApiError(500, "INTERNAL_ERROR", error.message);
    }
    return new ApiError(500, "INTERNAL_ERROR", fallbackMessage);
}
