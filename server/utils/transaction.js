import mongoose from "mongoose";

const isTransactionUnsupported = (error) => {
  const message = error?.message || "";
  return (
    error?.codeName === "IllegalOperation" ||
    message.includes("Transaction numbers are only allowed") ||
    message.includes("replica set")
  );
};

// MongoDB transactions need a replica set. Local standalone MongoDB is common
// in development, so fall back to the same idempotent work without a session.
export const runWithTransaction = async (work) => {
  if (mongoose.connection.readyState !== 1) {
    return work(null);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      return work(null);
    }
    throw error;
  } finally {
    await session.endSession();
  }
};
