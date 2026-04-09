import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

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

    const body = (await request.json()) as { vehicleIds?: number[] };

    if (!Array.isArray(body.vehicleIds)) {
      return NextResponse.json(
        { error: 'vehicleIds array is required' },
        { status: 400 },
      );
    }

    const vehicleIds = body.vehicleIds;

    // Replace all fitments in a transaction
    const fitments = await prisma!.$transaction(async (tx) => {
      await tx.fitment.deleteMany({ where: { productId } });

      if (vehicleIds.length === 0) {
        return [];
      }

      await tx.fitment.createMany({
        data: vehicleIds.map((vehicleId) => ({ productId, vehicleId })),
        skipDuplicates: true,
      });

      return tx.fitment.findMany({
        where: { productId },
        include: { vehicle: true },
      });
    });

    return NextResponse.json({ fitments }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
