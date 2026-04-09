import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION_S = 7 * 24 * 60 * 60; // 7 days in seconds
const SESSION_DURATION_MS = SESSION_DURATION_S * 1000;

// ---------------------------------------------------------------------------
// Web Crypto HMAC helpers (Edge + Node compatible)
// ---------------------------------------------------------------------------

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Buffer.from(sig).toString('hex');
}

async function verifyPayload(
  payload: string,
  sig: string,
  secret: string,
): Promise<boolean> {
  const key = await getKey(secret);
  const enc = new TextEncoder();
  const sigBytes = Buffer.from(sig, 'hex');
  return crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload));
}

// ---------------------------------------------------------------------------
// Cookie value: base64( "admin:" + timestamp + ":" + hmac-hex )
// ---------------------------------------------------------------------------

async function buildCookieValue(timestamp: number): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  const payload = `admin:${timestamp}`;
  const sig = await signPayload(payload, secret);
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

async function parseCookieValue(
  cookie: string,
): Promise<{ valid: boolean }> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return { valid: false };

  try {
    const raw = Buffer.from(cookie, 'base64').toString('utf8');
    const firstColon = raw.indexOf(':');
    const secondColon = raw.indexOf(':', firstColon + 1);
    if (firstColon === -1 || secondColon === -1) return { valid: false };

    const prefix = raw.slice(0, firstColon);
    const tsStr = raw.slice(firstColon + 1, secondColon);
    const sig = raw.slice(secondColon + 1);

    if (prefix !== 'admin') return { valid: false };

    const timestamp = parseInt(tsStr, 10);
    if (isNaN(timestamp)) return { valid: false };

    if (Date.now() - timestamp > SESSION_DURATION_MS) return { valid: false };

    const payload = `admin:${timestamp}`;
    const ok = await verifyPayload(payload, sig, secret);
    return { valid: ok };
  } catch {
    return { valid: false };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getAdminSession(
  request: NextRequest,
): Promise<{ valid: boolean }> {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return { valid: false };
  return parseCookieValue(cookie.value);
}

export async function setAdminSession(
  response: NextResponse,
): Promise<NextResponse> {
  const value = await buildCookieValue(Date.now());
  response.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_S,
  });
  return response;
}

export function clearAdminSession(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const setting = await prisma!.setting.findUnique({
    where: { key: 'admin_password_hash' },
  });
  if (!setting) return false;
  return bcrypt.compare(password, setting.value);
}
