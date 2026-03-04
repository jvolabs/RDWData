"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePlateOrThrow = parsePlateOrThrow;
exports.parseDatasetOrThrow = parseDatasetOrThrow;
const normalize_1 = require("../rdw/normalize");
const api_error_1 = require("./api-error");
const DATASET_ALIASES = {
    main: "main",
    fuel: "fuel",
    apk: "apk",
    defects: "defects",
    recalls: "recalls",
    body: "body"
};
function parsePlateOrThrow(input) {
    const plate = (0, normalize_1.normalizePlate)(input);
    if (!(0, normalize_1.validateDutchPlate)(plate)) {
        throw new api_error_1.ApiError(400, "INVALID_PLATE", "Invalid Dutch license plate format.");
    }
    return plate;
}
function parseDatasetOrThrow(input) {
    const datasetKey = DATASET_ALIASES[input.trim().toLowerCase()];
    if (!datasetKey) {
        throw new api_error_1.ApiError(400, "INVALID_DATASET", "Invalid dataset. Use one of: main, fuel, apk, defects, recalls, body.");
    }
    return datasetKey;
}
