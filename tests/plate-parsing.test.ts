import test from "node:test";
import assert from "node:assert/strict";
import { parseDatasetOrThrow, parsePlateOrThrow } from "../lib/api/plate";
import { ApiError } from "../lib/api/api-error";

test("parsePlateOrThrow returns normalized plate", () => {
  assert.equal(parsePlateOrThrow("16-rsl-9"), "16RSL9");
});

test("parsePlateOrThrow throws ApiError for invalid plate", () => {
  assert.throws(
    () => parsePlateOrThrow("bad-plate"),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 400 &&
      error.code === "INVALID_PLATE"
  );
});

test("parseDatasetOrThrow supports expected dataset keys", () => {
  assert.equal(parseDatasetOrThrow("main"), "main");
  assert.equal(parseDatasetOrThrow("DEFECTS"), "defects");
});

test("parseDatasetOrThrow throws ApiError for unknown dataset", () => {
  assert.throws(
    () => parseDatasetOrThrow("unknown"),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 400 &&
      error.code === "INVALID_DATASET"
  );
});
