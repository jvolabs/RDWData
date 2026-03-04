import dns from "node:dns";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";

function loadEnvFromFile(fileName) {
  const filePath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromFile(".env");
loadEnvFromFile(".env.local");

const uri = process.env.MONGODB_URI_DIRECT || process.env.MONGODB_URI || process.env.DATABASE_URL;
const dnsServers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,8.8.4.4")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (uri?.startsWith("mongodb+srv://") && dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

if (!uri) {
  console.log("[DB CHECK] MONGODB_URI not set. Skipping startup check.");
  process.exit(0);
}

try {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000
  });
  console.log("[DB CHECK] MongoDB connection OK.");
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.log(`[DB CHECK] MongoDB connection FAILED: ${message}`);
} finally {
  await mongoose.disconnect().catch(() => {});
}
