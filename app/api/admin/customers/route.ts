import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { isUniqueConstraintError } from '@/lib/prisma-error';

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
    const search = searchParams.get('search') ?? '';

    const where: Prisma.CustomerWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { garageName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
          orders: { select: { total: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const customersWithStats = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      type: c.type,
      garageName: c.garageName,
      notes: c.notes,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      totalSpent: c.orders.reduce(
        (sum: number, o: { total: number }) => sum + o.total,
        0,
      ),
    }));

    return NextResponse.json({
      customers: customersWithStats,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
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
      phone?: string;
      type?: string;
      garageName?: string;
      notes?: string;
    };

    if (!body.name || !body.phone || !body.type) {
      return NextResponse.json(
        { error: 'name, phone, and type are required' },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        phone: body.phone,
        type: body.type,
        garageName: body.garageName,
        notes: body.notes,
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (err) {
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
