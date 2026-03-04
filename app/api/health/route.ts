import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo, MONGO_URI_SOURCE } from "@/lib/db/mongodb";

export async function GET() {
  try {
    await connectMongo();
    const dbState = mongoose.connection.readyState === 1 ? "ok" : "degraded";

    return NextResponse.json({
      status: dbState === "ok" ? "ok" : "degraded",
      db: dbState,
      redis: "not_checked",
      rdw: "not_checked",
      ...(process.env.NODE_ENV !== "production" ? { uriSource: MONGO_URI_SOURCE } : {})
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database connection error";

    return NextResponse.json(
      {
        status: "error",
        db: "error",
        redis: "not_checked",
        rdw: "not_checked",
        ...(process.env.NODE_ENV !== "production"
          ? { reason: message, uriSource: MONGO_URI_SOURCE }
          : {})
      },
      { status: 500 }
    );
  }
}
