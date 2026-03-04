import { model, models, Schema, type Model } from "mongoose";
import type { VehicleProfile } from "@/lib/rdw/types";

export type VehicleCacheDoc = {
  _id: string;
  data: VehicleProfile;
  cachedAt: Date;
  expiresAt: Date;
};

const vehicleCacheSchema = new Schema(
  {
    _id: { type: String, required: true }, // normalized plate
    data: { type: Schema.Types.Mixed, required: true },
    cachedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true }
  },
  {
    versionKey: false
  }
);

export const VehicleCacheModel: Model<VehicleCacheDoc> =
  (models.VehicleCache as Model<VehicleCacheDoc> | undefined) ||
  model<VehicleCacheDoc>("VehicleCache", vehicleCacheSchema);
