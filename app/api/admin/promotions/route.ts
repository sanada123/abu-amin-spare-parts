import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

function computePromotionStatus(
  startDate: Date,
  endDate: Date,
  isActive: boolean,
): 'active' | 'scheduled' | 'expired' | 'disabled' {
  if (!isActive) return 'disabled';
  const now = new Date();
  if (now < startDate) return 'scheduled';
  if (now > endDate) return 'expired';
  return 'active';
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const promotions = await prisma!.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const withStatus = promotions.map(
      (p: (typeof promotions)[number]) => ({
        ...p,
        status: computePromotionStatus(p.startDate, p.endDate, p.isActive),
      }),
    );

    return NextResponse.json({ promotions: withStatus });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      type?: string;
      value?: number;
      buyX?: number;
      getY?: number;
      minOrder?: number;
      code?: string;
      appliesToAll?: boolean;
      categoryIds?: number[];
      productIds?: number[];
      brandIds?: number[];
      customerTypes?: string[];
      startDate?: string;
      endDate?: string;
      maxUses?: number;
      isActive?: boolean;
    };

    if (
      !body.name ||
      !body.type ||
      body.value == null ||
      !body.startDate ||
      !body.endDate
    ) {
      return NextResponse.json(
        { error: 'name, type, value, startDate, endDate are required' },
        { status: 400 },
      );
    }

    const promotion = await prisma!.promotion.create({
      data: {
        name: body.name,
        type: body.type,
        value: body.value,
        buyX: body.buyX,
        getY: body.getY,
        minOrder: body.minOrder,
        code: body.code,
        appliesToAll: body.appliesToAll ?? true,
        categoryIds: body.categoryIds ?? [],
        productIds: body.productIds ?? [],
        brandIds: body.brandIds ?? [],
        customerTypes: body.customerTypes ?? [],
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        maxUses: body.maxUses,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ promotion }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
