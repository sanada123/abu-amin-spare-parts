import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { isNotFoundError, isUniqueConstraintError } from '@/lib/prisma-error';

type RouteContext = { params: Promise<{ id: string }> };

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
    const categoryId = parseInt(id, 10);

    const body = (await request.json()) as Partial<{
      slug: string;
      name: string;
      icon: string;
      parentId: number | null;
      group: string;
      position: number;
      isActive: boolean;
    }>;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: body,
    });

    return NextResponse.json({ category });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }
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
    const categoryId = parseInt(id, 10);

    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isNotFoundError(err)) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
