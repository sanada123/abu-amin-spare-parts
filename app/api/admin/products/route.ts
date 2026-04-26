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
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const status = searchParams.get('status');

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    if (brandId) {
      where.skus = { some: { brandId: parseInt(brandId, 10) } };
    }

    const [products, total] = await Promise.all([
      prisma!.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          slug: true,
          name: true,
          categoryId: true,
          category: { select: { name: true } },
          isFeatured: true,
          isActive: true,
          position: true,
          createdAt: true,
          _count: { select: { skus: true } },
          skus: {
            select: { priceIls: true },
            orderBy: { priceIls: 'asc' },
            take: 1,
          },
        },
      }),
      prisma!.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
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
      slug?: string;
      name?: string;
      description?: string;
      categoryId?: number;
      images?: string[];
      isFeatured?: boolean;
      position?: number;
    };

    if (!body.slug || !body.name || !body.categoryId) {
      return NextResponse.json(
        { error: 'slug, name, and categoryId are required' },
        { status: 400 },
      );
    }

    // Validate field types and lengths
    if (typeof body.slug !== 'string' || body.slug.length > 200 || !/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json({ error: 'Invalid slug (lowercase alphanumeric + hyphens, max 200)' }, { status: 400 });
    }
    if (typeof body.name !== 'string' || body.name.length > 500) {
      return NextResponse.json({ error: 'Invalid name (max 500 chars)' }, { status: 400 });
    }
    if (body.description && (typeof body.description !== 'string' || body.description.length > 5000)) {
      return NextResponse.json({ error: 'Description too long (max 5000 chars)' }, { status: 400 });
    }
    if (typeof body.categoryId !== 'number' || body.categoryId < 1) {
      return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 });
    }
    if (body.images && (!Array.isArray(body.images) || body.images.length > 20)) {
      return NextResponse.json({ error: 'Invalid images (max 20)' }, { status: 400 });
    }

    const product = await prisma!.product.create({
      data: {
        slug: body.slug.trim(),
        name: body.name.trim(),
        description: body.description?.trim(),
        categoryId: body.categoryId,
        images: body.images ?? [],
        isFeatured: body.isFeatured ?? false,
        position: body.position ?? 0,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
