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
    const brands = await prisma!.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { skus: true } },
      },
    });

    return NextResponse.json({ brands });
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
      slug?: string;
      logo?: string;
      country?: string;
    };

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'name and slug are required' },
        { status: 400 },
      );
    }

    const brand = await prisma!.brand.create({
      data: {
        name: body.name,
        slug: body.slug,
        logo: body.logo,
        country: body.country,
      },
    });

    return NextResponse.json({ brand }, { status: 201 });
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
