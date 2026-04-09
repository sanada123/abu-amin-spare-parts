import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  setAdminSession,
  clearAdminSession,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { password?: string };
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const valid = await verifyAdminPassword(password);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 },
      );
    }

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
