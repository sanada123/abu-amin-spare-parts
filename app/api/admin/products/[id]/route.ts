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
    const productId = parseInt(id, 10);

    const product = await prisma!.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        skus: {
          include: { brand: true },
          orderBy: { createdAt: 'asc' },
        },
        fitments: {
          include: { vehicle: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
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
    const productId = parseInt(id, 10);
    const body = (await request.json()) as Partial<{
      slug: string;
      name: string;
      description: string;
      categoryId: number;
      images: string[];
      isFeatured: boolean;
      isActive: boolean;
      position: number;
    }>;

    const product = await prisma!.product.update({
      where: { id: productId },
      data: body,
    });

    return NextResponse.json({ product });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
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
    const productId = parseInt(id, 10);

    await prisma!.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
