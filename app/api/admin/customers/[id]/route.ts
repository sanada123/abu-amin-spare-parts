import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { isNotFoundError, isUniqueConstraintError } from '@/lib/prisma-error';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const customerId = parseInt(id, 10);

    const customer = await prisma!.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { items: true } },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

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
    const customerId = parseInt(id, 10);

    const body = (await request.json()) as Partial<{
      name: string;
      phone: string;
      type: string;
      garageName: string;
      notes: string;
    }>;

    // Whitelist allowed fields to prevent mass assignment
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.type !== undefined) data.type = body.type;
    if (body.garageName !== undefined) data.garageName = body.garageName;
    if (body.notes !== undefined) data.notes = body.notes;

    const customer = await prisma!.customer.update({
      where: { id: customerId },
      data,
    });

    return NextResponse.json({ customer });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }
    if (isUniqueConstraintError(err)) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 },
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
    const customerId = parseInt(id, 10);

    const existing = await prisma!.customer.findUnique({
      where: { id: customerId },
      select: { notes: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }

    const updatedNotes = existing.notes
      ? `${existing.notes} [deactivated]`
      : '[deactivated]';

    await prisma!.customer.update({
      where: { id: customerId },
      data: { notes: updatedNotes },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
