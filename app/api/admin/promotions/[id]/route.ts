import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { isNotFoundError } from '@/lib/prisma-error';

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
    const promotionId = parseInt(id, 10);

    const promotion = await prisma!.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ promotion });
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
    const promotionId = parseInt(id, 10);

    const body = (await request.json()) as Partial<{
      name: string;
      type: string;
      value: number;
      buyX: number;
      getY: number;
      minOrder: number;
      code: string;
      appliesToAll: boolean;
      categoryIds: number[];
      productIds: number[];
      brandIds: number[];
      customerTypes: string[];
      startDate: string;
      endDate: string;
      maxUses: number;
      isActive: boolean;
    }>;

    const data: any = {
      ...body,
    };
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    delete (data as Record<string, unknown>).startDate;
    delete (data as Record<string, unknown>).endDate;
    if (body.startDate)
      (data as Record<string, unknown>).startDate = new Date(body.startDate);
    if (body.endDate)
      (data as Record<string, unknown>).endDate = new Date(body.endDate);

    const promotion = await prisma!.promotion.update({
      where: { id: promotionId },
      data,
    });

    return NextResponse.json({ promotion });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json(
        { error: 'Promotion not found' },
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
    const promotionId = parseInt(id, 10);

    await prisma!.promotion.delete({ where: { id: promotionId } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
