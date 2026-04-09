import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { isUniqueConstraintError } from '@/lib/prisma-error';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const productId = parseInt(id, 10);

    const body = (await request.json()) as {
      partNumber?: string;
      brandId?: number;
      tier?: string;
      priceIls?: number;
      costIls?: number;
      stock?: number;
      minStock?: number;
      deliveryDays?: number;
      warrantyMonths?: number;
      weight?: number;
    };

    if (!body.partNumber || !body.brandId || !body.tier || body.priceIls == null) {
      return NextResponse.json(
        { error: 'partNumber, brandId, tier, and priceIls are required' },
        { status: 400 },
      );
    }

    const sku = await prisma.sku.create({
      data: {
        partNumber: body.partNumber,
        productId,
        brandId: body.brandId,
        tier: body.tier,
        priceIls: body.priceIls,
        costIls: body.costIls,
        stock: body.stock ?? 0,
        minStock: body.minStock ?? 5,
        deliveryDays: body.deliveryDays ?? 3,
        warrantyMonths: body.warrantyMonths ?? 12,
        weight: body.weight,
      },
      include: { brand: true },
    });

    return NextResponse.json({ sku }, { status: 201 });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return NextResponse.json(
        { error: 'Part number already exists' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
