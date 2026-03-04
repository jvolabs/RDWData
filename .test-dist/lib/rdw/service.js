"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRdwDatasetByPlate = getRdwDatasetByPlate;
exports.getVehicleProfile = getVehicleProfile;
const endpoints_1 = require("@/lib/rdw/endpoints");
const client_1 = require("@/lib/rdw/client");
const mapper_1 = require("@/lib/rdw/mapper");
const mongodb_1 = require("@/lib/db/mongodb");
const VehicleCache_1 = require("@/models/VehicleCache");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
function withProfileDefaults(profile) {
    const raw = profile.raw ?? {};
    return {
        plate: profile.plate ?? "",
        displayPlate: profile.displayPlate ?? profile.plate ?? "",
        fromCache: Boolean(profile.fromCache),
        vehicle: {
            brand: profile.vehicle?.brand ?? null,
            tradeName: profile.vehicle?.tradeName ?? null,
            year: profile.vehicle?.year ?? null,
            fuelType: profile.vehicle?.fuelType ?? null,
            apkExpiryDate: profile.vehicle?.apkExpiryDate ?? null,
            recallsCount: profile.vehicle?.recallsCount ?? 0
        },
        inspections: profile.inspections ?? [],
        defects: profile.defects ?? raw.defects ?? [],
        recalls: profile.recalls ?? [],
        raw: {
            main: raw.main ?? [],
            fuel: raw.fuel ?? [],
            apk: raw.apk ?? [],
            defects: raw.defects ?? [],
            recalls: raw.recalls ?? [],
            body: raw.body ?? []
        }
    };
}
async function getRdwDatasetByPlate(dataset, plate) {
    return (0, client_1.fetchRdwDataset)((0, endpoints_1.rdwUrl)(endpoints_1.DATASETS[dataset], plate));
}
async function getVehicleProfile(plate) {
    await (0, mongodb_1.connectMongo)();
    const cached = await VehicleCache_1.VehicleCacheModel.findById(plate).lean();
    const now = Date.now();
    if (cached && cached.expiresAt.getTime() > now) {
        const hydrated = withProfileDefaults(cached.data);
        return {
            ...hydrated,
            fromCache: true
        };
    }
    const [main, fuel, apk, defects, recalls, body] = await Promise.all([
        getRdwDatasetByPlate("main", plate),
        getRdwDatasetByPlate("fuel", plate),
        getRdwDatasetByPlate("apk", plate),
        getRdwDatasetByPlate("defects", plate),
        getRdwDatasetByPlate("recalls", plate),
        getRdwDatasetByPlate("body", plate)
    ]);
    const profile = (0, mapper_1.toVehicleProfile)({
        plate,
        fromCache: false,
        main,
        fuel,
        apk,
        defects,
        recalls,
        body
    });
    await VehicleCache_1.VehicleCacheModel.findByIdAndUpdate(plate, {
        _id: plate,
        data: profile,
        cachedAt: new Date(now),
        expiresAt: new Date(now + CACHE_TTL_MS)
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return profile;
}
