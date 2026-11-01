import mongoose from 'mongoose';
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 2 && globalThis.__taskauraMongo) {
    return globalThis.__taskauraMongo;
  }
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');

  const connection = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    .then((mongooseInstance) => mongooseInstance.connection)
    .catch((error) => {
      if (globalThis.__taskauraMongo === connection) globalThis.__taskauraMongo = undefined;
      throw error;
    });
  globalThis.__taskauraMongo = connection;
  return connection;
}
