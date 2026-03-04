import test from "node:test";
import assert from "node:assert/strict";
import {
  formatDisplayPlate,
  normalizePlate,
  validateDutchPlate
} from "../lib/rdw/normalize";

test("normalizePlate strips separators and uppercases", () => {
  assert.equal(normalizePlate(" 16-rsl-9 "), "16RSL9");
  assert.equal(normalizePlate("ab 12 34"), "AB1234");
});

test("validateDutchPlate accepts known valid series", () => {
  assert.equal(validateDutchPlate("16RSL9"), true);
  assert.equal(validateDutchPlate("AB1234"), true);
  assert.equal(validateDutchPlate("12AB34"), true);
});

test("validateDutchPlate rejects invalid format", () => {
  assert.equal(validateDutchPlate("INVALID"), false);
  assert.equal(validateDutchPlate("12345678"), false);
});

test("formatDisplayPlate uses hyphenated Dutch format", () => {
  assert.equal(formatDisplayPlate("16RSL9"), "16-RSL-9");
  assert.equal(formatDisplayPlate("AB1234"), "AB-12-34");
});
