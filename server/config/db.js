import mongoose from "mongoose";
import dns from "dns";

// Override DNS servers to bypass VPN/proxy resolvers that fail on SRV lookups.
// This fixes ECONNREFUSED errors with mongodb+srv:// connections when a local
// VPN (e.g. neko-tun) intercepts DNS but can't handle SRV record queries.
// Only applied in non-production to avoid interfering with Vercel's DNS.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
}

const connectionStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

if (!globalThis.__mongooseCache) {
  globalThis.__mongooseCache = {
    conn: null,
    promise: null,
  };
}

const cached = globalThis.__mongooseCache;

export const getDatabaseStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    state: connectionStates[stateCode] || "unknown",
    stateCode,
    hasMongoUri: Boolean(process.env.MONGODB_URI),
  };
};

export const connectToDatabase = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    (process.env.NODE_ENV !== "production"
      ? "mongodb://localhost:27017/expense-tracker"
      : null);

  if (cached.conn) {
    return cached.conn;
  }

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};
