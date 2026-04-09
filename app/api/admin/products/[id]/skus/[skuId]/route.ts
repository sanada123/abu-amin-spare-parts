import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { isNotFoundError } from '@/lib/prisma-error';

type RouteContext = { params: Promise<{ id: string; skuId: string }> };

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, skuId } = await context.params;
    const productId = parseInt(id, 10);
    const skuIdNum = parseInt(skuId, 10);

    const body = (await request.json()) as Partial<{
      partNumber: string;
      brandId: number;
      tier: string;
      priceIls: number;
      costIls: number;
      stock: number;
      minStock: number;
      deliveryDays: number;
      warrantyMonths: number;
      weight: number;
      isActive: boolean;
    }>;

    const sku = await prisma.sku.update({
      where: { id: skuIdNum, productId },
      data: body,
      include: { brand: true },
    });

    return NextResponse.json({ sku });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
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
    const { id, skuId } = await context.params;
    const productId = parseInt(id, 10);
    const skuIdNum = parseInt(skuId, 10);

    await prisma.sku.delete({
      where: { id: skuIdNum, productId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
