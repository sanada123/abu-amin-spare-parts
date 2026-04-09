import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

type LowStockRow = {
  id: number;
  partNumber: string;
  stock: number;
  minStock: number;
  productName: string;
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      todayOrdersRaw,
      pendingOrders,
      lowStockSkus,
      recentOrders,
      ordersLast30,
      customerBreakdown,
    ] = await Promise.all([
      // Today's orders
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfToday, lt: endOfToday },
          status: { not: 'cancelled' },
        },
        select: { total: true },
      }),

      // Pending orders (new + confirmed + preparing)
      prisma.order.count({
        where: { status: { in: ['new', 'confirmed', 'preparing'] } },
      }),

      // Low stock SKUs via raw query (stock <= minStock)
      prisma.$queryRaw<LowStockRow[]>`
        SELECT s.id, s."partNumber", s.stock, s."minStock", p.name AS "productName"
        FROM "Sku" s
        JOIN "Product" p ON p.id = s."productId"
        WHERE s."isActive" = true AND s.stock <= s."minStock"
        ORDER BY s.stock ASC
        LIMIT 20
      `,

      // Recent 10 orders
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: { select: { name: true, phone: true } },
          _count: { select: { items: true } },
        },
      }),

      // Orders in last 30 days
      prisma.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'cancelled' },
        },
        select: {
          createdAt: true,
          total: true,
          items: {
            select: {
              qty: true,
              sku: { select: { product: { select: { name: true } } } },
            },
          },
        },
      }),

      // Customer type breakdown
      prisma.customer.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
    ]);

    const todayOrders = todayOrdersRaw.length;
    const todayRevenue = todayOrdersRaw.reduce(
      (sum: number, o: { total: number }) => sum + o.total,
      0,
    );

    // Revenue by day (last 30 days)
    const revByDay = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      revByDay.set(d.toISOString().slice(0, 10), 0);
    }

    // Top products aggregation
    const productOrderCount = new Map<string, number>();

    for (const order of ordersLast30) {
      const dateKey = order.createdAt.toISOString().slice(0, 10);
      revByDay.set(dateKey, (revByDay.get(dateKey) ?? 0) + order.total);

      for (const item of order.items) {
        const name = item.sku.product.name;
        productOrderCount.set(
          name,
          (productOrderCount.get(name) ?? 0) + item.qty,
        );
      }
    }

    const revenueByDay = Array.from(revByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date,
        revenue: Math.round(revenue * 100) / 100,
      }));

    const topProducts = Array.from(productOrderCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, orderCount]) => ({ name, orderCount }));

    const customerBreakdownResult: Record<string, number> = {
      private: 0,
      garage: 0,
    };
    for (const row of customerBreakdown) {
      customerBreakdownResult[row.type] = row._count.type;
    }

    return NextResponse.json({
      todayOrders,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      pendingOrders,
      lowStockSkus,
      recentOrders,
      topProducts,
      revenueByDay,
      customerBreakdown: customerBreakdownResult,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
