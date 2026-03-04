"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const plate_1 = require("../lib/api/plate");
const api_error_1 = require("../lib/api/api-error");
(0, node_test_1.default)("parsePlateOrThrow returns normalized plate", () => {
    strict_1.default.equal((0, plate_1.parsePlateOrThrow)("16-rsl-9"), "16RSL9");
});
(0, node_test_1.default)("parsePlateOrThrow throws ApiError for invalid plate", () => {
    strict_1.default.throws(() => (0, plate_1.parsePlateOrThrow)("bad-plate"), (error) => error instanceof api_error_1.ApiError &&
        error.status === 400 &&
        error.code === "INVALID_PLATE");
});
(0, node_test_1.default)("parseDatasetOrThrow supports expected dataset keys", () => {
    strict_1.default.equal((0, plate_1.parseDatasetOrThrow)("main"), "main");
    strict_1.default.equal((0, plate_1.parseDatasetOrThrow)("DEFECTS"), "defects");
});
(0, node_test_1.default)("parseDatasetOrThrow throws ApiError for unknown dataset", () => {
    strict_1.default.throws(() => (0, plate_1.parseDatasetOrThrow)("unknown"), (error) => error instanceof api_error_1.ApiError &&
        error.status === 400 &&
        error.code === "INVALID_DATASET");
});
