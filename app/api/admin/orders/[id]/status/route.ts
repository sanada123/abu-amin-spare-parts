import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { isNotFoundError } from '@/lib/prisma-error';

type RouteContext = { params: Promise<{ id: string }> };

const VALID_STATUSES = [
  'new',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: ['cancelled'],
  cancelled: [],
};

function isValidStatus(value: string): value is OrderStatus {
  return VALID_STATUSES.includes(value as OrderStatus);
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
    const orderId = parseInt(id, 10);

    const body = (await request.json()) as { status?: string };

    if (!body.status || !isValidStatus(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const newStatus = body.status;

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = existing.status;

    if (isValidStatus(currentStatus)) {
      const allowed = VALID_TRANSITIONS[currentStatus];
      if (!allowed.includes(newStatus)) {
        return NextResponse.json(
          {
            error: `Cannot transition from '${currentStatus}' to '${newStatus}'`,
          },
          { status: 422 },
        );
      }
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    return NextResponse.json({ order });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
