"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const normalize_1 = require("../lib/rdw/normalize");
(0, node_test_1.default)("normalizePlate strips separators and uppercases", () => {
    strict_1.default.equal((0, normalize_1.normalizePlate)(" 16-rsl-9 "), "16RSL9");
    strict_1.default.equal((0, normalize_1.normalizePlate)("ab 12 34"), "AB1234");
});
(0, node_test_1.default)("validateDutchPlate accepts known valid series", () => {
    strict_1.default.equal((0, normalize_1.validateDutchPlate)("16RSL9"), true);
    strict_1.default.equal((0, normalize_1.validateDutchPlate)("AB1234"), true);
    strict_1.default.equal((0, normalize_1.validateDutchPlate)("12AB34"), true);
});
(0, node_test_1.default)("validateDutchPlate rejects invalid format", () => {
    strict_1.default.equal((0, normalize_1.validateDutchPlate)("INVALID"), false);
    strict_1.default.equal((0, normalize_1.validateDutchPlate)("12345678"), false);
});
(0, node_test_1.default)("formatDisplayPlate uses hyphenated Dutch format", () => {
    strict_1.default.equal((0, normalize_1.formatDisplayPlate)("16RSL9"), "16-RSL-9");
    strict_1.default.equal((0, normalize_1.formatDisplayPlate)("AB1234"), "AB-12-34");
});
