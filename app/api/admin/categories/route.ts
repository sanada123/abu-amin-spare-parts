import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { isUniqueConstraintError } from '@/lib/prisma-error';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getAdminSession(request);
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    return NextResponse.json({ categories });
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
      icon?: string;
      parentId?: number;
      group?: string;
      position?: number;
    };

    if (!body.slug || !body.name) {
      return NextResponse.json(
        { error: 'slug and name are required' },
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: {
        slug: body.slug,
        name: body.name,
        icon: body.icon,
        parentId: body.parentId,
        group: body.group,
        position: body.position ?? 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
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
