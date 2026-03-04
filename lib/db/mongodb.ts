import dns from "node:dns";
import mongoose from "mongoose";

const MONGO_DNS_SERVERS = process.env.MONGO_DNS_SERVERS ?? "8.8.8.8,8.8.4.4";

const MONGODB_URI =
  process.env.MONGODB_URI_DIRECT ?? process.env.MONGODB_URI ?? process.env.DATABASE_URL;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

/** Which env var was actually used — exported for the /api/health endpoint (dev only). */
export const MONGO_URI_SOURCE = process.env.MONGODB_URI_DIRECT
  ? "MONGODB_URI_DIRECT"
  : process.env.MONGODB_URI
    ? "MONGODB_URI"
    : process.env.DATABASE_URL
      ? "DATABASE_URL"
      : "none";

if (MONGODB_URI?.startsWith("mongodb+srv://")) {
  const servers = MONGO_DNS_SERVERS.split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
  if (servers.length > 0) {
    dns.setServers(servers);
  }
}

type GlobalMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: GlobalMongoose;
};

const cache: GlobalMongoose = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null
};

globalForMongoose.mongooseCache = cache;

export async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI (or DATABASE_URL) in environment.");
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      ...(MONGODB_DB_NAME ? { dbName: MONGODB_DB_NAME } : {}),
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
