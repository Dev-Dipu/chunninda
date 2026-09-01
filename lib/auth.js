import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SECRET = process.env.ADMIN_SECRET_KEY || 'chunniindia_default_secret_key_2026';

export function checkPassword(inputPassword) {
  return inputPassword === ADMIN_PASSWORD;
}

export function generateSessionToken() {
  const payload = `admin_${Date.now()}`;
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, hmac] = parts;
  const expectedHmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return hmac === expectedHmac;
}

export async function isAuthenticated(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    return verifySessionToken(token);
  } catch {
    return false;
  }
}
