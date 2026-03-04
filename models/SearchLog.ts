import { model, models, Schema } from "mongoose";

const searchLogSchema = new Schema(
  {
    plate: { type: String, required: true, index: true },
    userId: { type: String, required: false, index: true },
    ipHash: { type: String, required: true },
    resultFrom: { type: String, enum: ["cache", "api"], required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

export const SearchLogModel =
  models.SearchLog || model("SearchLog", searchLogSchema);

