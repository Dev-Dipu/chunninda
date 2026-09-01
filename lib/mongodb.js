import mongoose from 'mongoose';
import dns from 'dns';

// Ensure reliable DNS resolution for MongoDB Atlas SRV records across local and cloud environments
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // ignore if not supported in environment
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless function invocations in production (e.g. Vercel).
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    const attemptConnect = async () => {
      try {
        return await mongoose.connect(uri, opts);
      } catch (firstErr) {
        // If ECONNREFUSED or SRV lookup failure on local machine DNS, configure reliable DNS and retry
        if (firstErr.message && (firstErr.message.includes('querySrv') || firstErr.message.includes('ECONNREFUSED'))) {
          try {
            dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
            return await mongoose.connect(uri, opts);
          } catch (retryErr) {
            throw retryErr;
          }
        }
        throw firstErr;
      }
    };

    cached.promise = attemptConnect();
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
