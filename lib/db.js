import fs from 'fs';
import path from 'path';
import { connectToDatabase } from './mongodb.js';
import Subscriber from './models/Subscriber.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'subscribers.json');

// Helper for local file fallback
function ensureLocalDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function getLocalSubscribers() {
  ensureLocalDatabase();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error reading local subscribers JSON:', error);
    return [];
  }
}

function saveLocalSubscribers(subscribers) {
  ensureLocalDatabase();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(subscribers, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving local subscribers JSON:', error);
    return false;
  }
}

let migrationChecked = false;
async function autoMigrateIfEmpty() {
  if (migrationChecked) return;
  migrationChecked = true;

  try {
    const count = await Subscriber.countDocuments();
    if (count === 0) {
      const localSubs = getLocalSubscribers();
      if (localSubs.length > 0) {
        console.log(`[MongoDB Migration] Migrating ${localSubs.length} existing local subscribers to MongoDB...`);
        const docs = localSubs.map((sub) => ({
          customId: sub.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email: (sub.email || '').toLowerCase().trim(),
          formattedDate: sub.formattedDate || '',
          formattedTime: sub.formattedTime || '',
          emailSent: !!sub.emailSent,
          emailLog: sub.emailLog || '',
          userAgent: sub.userAgent || '',
          ip: sub.ip || '',
          createdAt: sub.createdAt ? new Date(sub.createdAt) : new Date(),
        }));
        await Subscriber.insertMany(docs, { ordered: false }).catch((e) => {
          console.warn('[MongoDB Migration] Partial insert warning (some duplicates ignored):', e.message);
        });
        console.log('[MongoDB Migration] Migration complete.');
      }
    }
  } catch (err) {
    console.warn('[MongoDB Migration] Auto-migration check skipped:', err.message);
  }
}

function formatSubscriberDoc(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj.customId || obj._id?.toString() || obj.id,
    email: obj.email,
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
    formattedDate: obj.formattedDate || '',
    formattedTime: obj.formattedTime || '',
    emailSent: !!obj.emailSent,
    emailLog: obj.emailLog || '',
    userAgent: obj.userAgent || '',
    ip: obj.ip || '',
  };
}

/**
 * Get all subscribers (sorted by newest first)
 */
export async function getAllSubscribers() {
  const isConnected = await connectToDatabase().catch(() => null);

  if (isConnected) {
    await autoMigrateIfEmpty();
    try {
      const docs = await Subscriber.find({}).sort({ createdAt: -1 }).lean();
      return docs.map((doc) => ({
        id: doc.customId || doc._id.toString(),
        email: doc.email,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        formattedDate: doc.formattedDate || '',
        formattedTime: doc.formattedTime || '',
        emailSent: !!doc.emailSent,
        emailLog: doc.emailLog || '',
        userAgent: doc.userAgent || '',
        ip: doc.ip || '',
      }));
    } catch (error) {
      console.error('Error fetching subscribers from MongoDB:', error);
    }
  }

  // Fallback to local file
  return getLocalSubscribers();
}

/**
 * Add a new subscriber
 */
export async function addSubscriber(email, metadata = {}) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Invalid email address' };
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const customId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const isConnected = await connectToDatabase().catch(() => null);

  if (isConnected) {
    await autoMigrateIfEmpty();
    try {
      // Check existing in MongoDB
      const existing = await Subscriber.findOne({ email: cleanEmail });
      if (existing) {
        return {
          success: false,
          duplicate: true,
          error: 'This email is already on our exclusive launch list.',
          subscriber: formatSubscriberDoc(existing),
        };
      }

      const newDoc = await Subscriber.create({
        customId,
        email: cleanEmail,
        formattedDate,
        formattedTime,
        emailSent: false,
        userAgent: metadata.userAgent || '',
        ip: metadata.ip || '',
      });

      return {
        success: true,
        subscriber: formatSubscriberDoc(newDoc),
      };
    } catch (error) {
      if (error.code === 11000) {
        return {
          success: false,
          duplicate: true,
          error: 'This email is already on our exclusive launch list.',
        };
      }
      console.error('MongoDB addSubscriber error:', error);
      return { success: false, error: 'Failed to save subscriber record in database' };
    }
  }

  // Fallback to local file
  const subscribers = getLocalSubscribers();
  const existing = subscribers.find((sub) => sub.email.toLowerCase() === cleanEmail);

  if (existing) {
    return {
      success: false,
      duplicate: true,
      error: 'This email is already on our exclusive launch list.',
      subscriber: existing,
    };
  }

  const newSubscriber = {
    id: customId,
    email: cleanEmail,
    createdAt: now.toISOString(),
    formattedDate,
    formattedTime,
    emailSent: false,
    userAgent: metadata.userAgent || '',
    ip: metadata.ip || '',
  };

  subscribers.unshift(newSubscriber);
  const saved = saveLocalSubscribers(subscribers);

  if (saved) {
    return { success: true, subscriber: newSubscriber };
  } else {
    return { success: false, error: 'Failed to save subscriber record locally' };
  }
}

/**
 * Update subscriber email delivery status
 */
export async function updateSubscriberEmailStatus(id, sent = true, log = '') {
  const isConnected = await connectToDatabase().catch(() => null);

  if (isConnected) {
    try {
      await Subscriber.findOneAndUpdate(
        { $or: [{ customId: id }, { email: id }] },
        { $set: { emailSent: sent, ...(log ? { emailLog: log } : {}) } }
      );
      return;
    } catch (error) {
      console.error('MongoDB updateSubscriberEmailStatus error:', error);
    }
  }

  // Fallback to local file
  const subscribers = getLocalSubscribers();
  const index = subscribers.findIndex((sub) => sub.id === id || sub.email === id);
  if (index !== -1) {
    subscribers[index].emailSent = sent;
    if (log) subscribers[index].emailLog = log;
    saveLocalSubscribers(subscribers);
  }
}

/**
 * Delete a subscriber by ID
 */
export async function deleteSubscriber(id) {
  const isConnected = await connectToDatabase().catch(() => null);

  if (isConnected) {
    try {
      const res = await Subscriber.deleteOne({
        $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
      const total = await Subscriber.countDocuments();
      return { success: true, count: total, deletedCount: res.deletedCount };
    } catch (error) {
      console.error('MongoDB deleteSubscriber error:', error);
      return { success: false, error: 'Failed to delete subscriber from database' };
    }
  }

  // Fallback to local file
  const subscribers = getLocalSubscribers();
  const filtered = subscribers.filter((sub) => sub.id !== id);
  const saved = saveLocalSubscribers(filtered);
  if (saved) {
    return { success: true, count: filtered.length };
  } else {
    return { success: false, error: 'Failed to delete subscriber locally' };
  }
}

/**
 * Get subscriber statistics
 */
export async function getSubscriberStats() {
  const isConnected = await connectToDatabase().catch(() => null);

  if (isConnected) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [total, today, emailsSent] = await Promise.all([
        Subscriber.countDocuments(),
        Subscriber.countDocuments({ createdAt: { $gte: todayStart } }),
        Subscriber.countDocuments({ emailSent: true }),
      ]);

      return { total, today, emailsSent };
    } catch (error) {
      console.error('MongoDB getSubscriberStats error:', error);
    }
  }

  // Fallback to local file
  const subscribers = getLocalSubscribers();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = subscribers.filter((s) => s.createdAt && s.createdAt.slice(0, 10) === todayStr).length;

  return {
    total: subscribers.length,
    today: todayCount,
    emailsSent: subscribers.filter((s) => s.emailSent).length,
  };
}
