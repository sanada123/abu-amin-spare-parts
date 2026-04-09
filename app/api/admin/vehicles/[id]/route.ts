import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { isNotFoundError } from '@/lib/prisma-error';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const vehicleId = parseInt(id, 10);

    const body = (await request.json()) as Partial<{
      make: string;
      makeHe: string;
      model: string;
      modelHe: string;
      year: number;
      engine: string;
      isActive: boolean;
    }>;

    const vehicle = await prisma!.vehicle.update({
      where: { id: vehicleId },
      data: body,
    });

    return NextResponse.json({ vehicle });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const vehicleId = parseInt(id, 10);

    await prisma!.vehicle.update({
      where: { id: vehicleId },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
