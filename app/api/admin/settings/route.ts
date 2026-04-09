import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });

    const result = settings.reduce<Record<string, string>>(
      (acc: Record<string, string>, s: { key: string; value: string }) => {
        // Never expose the password hash
        if (s.key === 'admin_password_hash') return acc;
        acc[s.key] = s.value;
        return acc;
      },
      {},
    );

    return NextResponse.json({ settings: result });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { key?: string; value?: string };

    if (!body.key || body.value == null) {
      return NextResponse.json(
        { error: 'key and value are required' },
        { status: 400 },
      );
    }

    // Protect password hash from being set via this endpoint
    if (body.key === 'admin_password_hash') {
      return NextResponse.json(
        { error: 'Use the dedicated password change endpoint' },
        { status: 403 },
      );
    }

    const setting = await prisma.setting.upsert({
      where: { key: body.key },
      create: { key: body.key, value: String(body.value) },
      update: { value: String(body.value) },
    });

    return NextResponse.json({ setting });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
