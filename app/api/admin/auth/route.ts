import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  setAdminSession,
  clearAdminSession,
} from '@/lib/admin-auth';

// ── In-memory rate limiter for login attempts ────────────────────────────────
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count++;
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// Clean up stale entries periodically (every 100 requests)
let _cleanupCounter = 0;
function maybeCleanup(): void {
  if (++_cleanupCounter % 100 !== 0) return;
  const now = Date.now();
  for (const [ip, entry] of loginAttempts.entries()) {
    if (now > entry.resetAt) loginAttempts.delete(ip);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  maybeCleanup();

  try {
    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again in 15 minutes.' },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { password?: string };
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const valid = await verifyAdminPassword(password);
    if (!valid) {
      recordAttempt(ip);
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 },
      );
    }

    clearAttempts(ip);
    const response = NextResponse.json({ ok: true });
    return await setAdminSession(response);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  return clearAdminSession(response);
}
