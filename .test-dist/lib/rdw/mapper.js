"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toVehicleProfile = toVehicleProfile;
const normalize_1 = require("./normalize");
function toVehicleProfile(input) {
    const firstMain = input.main[0] ?? {};
    const firstFuel = input.fuel[0] ?? {};
    const yearRaw = firstMain.datum_eerste_toelating;
    const year = yearRaw ? Number(yearRaw.slice(0, 4)) : null;
    return {
        plate: input.plate,
        displayPlate: (0, normalize_1.formatDisplayPlate)(input.plate),
        fromCache: input.fromCache,
        vehicle: {
            brand: firstMain.merk ?? null,
            tradeName: firstMain.handelsbenaming ?? null,
            year: Number.isFinite(year) ? year : null,
            fuelType: firstFuel.brandstof_omschrijving ?? null,
            apkExpiryDate: firstMain.vervaldatum_apk ?? null,
            recallsCount: input.recalls.length
        },
        inspections: input.apk,
        defects: input.defects,
        recalls: input.recalls,
        raw: {
            main: input.main,
            fuel: input.fuel,
            apk: input.apk,
            defects: input.defects,
            recalls: input.recalls,
            body: input.body
        }
    };
}
