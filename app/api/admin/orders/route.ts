import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const todayCount = await prisma!.order.count({
    where: { createdAt: { gte: startOfDay, lt: endOfDay } },
  });

  const seq = String(todayCount + 1).padStart(3, '0');
  return `AA-${datePart}-${seq}`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)),
    );
    const status = searchParams.get('status');
    const search = searchParams.get('search') ?? '';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Prisma.OrderWhereInput = {};

    if (status) where.status = status;

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(from);
      if (to) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(to);
    }

    const [orders, total] = await Promise.all([
      prisma!.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true, type: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma!.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[admin/orders GET]', err);
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
      customerId?: number;
      customerData?: {
        name: string;
        phone: string;
        type: string;
        garageName?: string;
      };
      vehicleInfo?: string;
      channel?: string;
      notes?: string;
      items: Array<{ skuId: number; qty: number; unitPrice: number }>;
    };

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must have at least one item' },
        { status: 400 },
      );
    }

    if (!body.customerId && !body.customerData) {
      return NextResponse.json(
        { error: 'customerId or customerData is required' },
        { status: 400 },
      );
    }

    const order = await prisma!.$transaction(async (tx) => {
      let customerId = body.customerId;

      if (!customerId && body.customerData) {
        const customer = await tx.customer.upsert({
          where: { phone: body.customerData.phone },
          create: body.customerData,
          update: { name: body.customerData.name },
        });
        customerId = customer.id;
      }

      const orderNumber = await generateOrderNumber();
      const subtotal = body.items.reduce(
        (sum: number, item: { qty: number; unitPrice: number }) =>
          sum + item.qty * item.unitPrice,
        0,
      );
      const vatRate = 17;
      const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
      const total = Math.round((subtotal + vatAmount) * 100) / 100;

      return tx.order.create({
        data: {
          orderNumber,
          customerId: customerId!,
          vehicleInfo: body.vehicleInfo,
          channel: body.channel ?? 'whatsapp',
          notes: body.notes,
          subtotal,
          vatRate,
          vatAmount,
          total,
          items: {
            create: body.items.map((item) => ({
              skuId: item.skuId,
              qty: item.qty,
              unitPrice: item.unitPrice,
              total: Math.round(item.qty * item.unitPrice * 100) / 100,
            })),
          },
        },
        include: {
          customer: true,
          items: { include: { sku: { include: { brand: true } } } },
        },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error('[admin/orders POST]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
