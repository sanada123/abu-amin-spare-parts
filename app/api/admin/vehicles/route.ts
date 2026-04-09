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
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      orderBy: [{ make: 'asc' }, { model: 'asc' }, { year: 'desc' }],
    });

    // Group by make
    type VehicleRow = (typeof vehicles)[number];
    const grouped = vehicles.reduce<Record<string, VehicleRow[]>>(
      (acc, vehicle) => {
        const key = vehicle.make;
        if (!acc[key]) acc[key] = [];
        acc[key].push(vehicle);
        return acc;
      },
      {},
    );

    return NextResponse.json({ vehicles: grouped, total: vehicles.length });
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
      bulk?: boolean;
      make?: string;
      makeHe?: string;
      model?: string;
      modelHe?: string;
      year?: number;
      yearFrom?: number;
      yearTo?: number;
      engine?: string;
    };

    if (body.bulk) {
      // Bulk create: one record per year in [yearFrom..yearTo]
      if (
        !body.make ||
        !body.makeHe ||
        !body.model ||
        !body.modelHe ||
        body.yearFrom == null ||
        body.yearTo == null
      ) {
        return NextResponse.json(
          {
            error:
              'make, makeHe, model, modelHe, yearFrom, yearTo are required for bulk create',
          },
          { status: 400 },
        );
      }

      const years: number[] = [];
      for (let y = body.yearFrom; y <= body.yearTo; y++) {
        years.push(y);
      }

      const result = await prisma.vehicle.createMany({
        data: years.map((year) => ({
          make: body.make!,
          makeHe: body.makeHe!,
          model: body.model!,
          modelHe: body.modelHe!,
          year,
          engine: body.engine,
        })),
        skipDuplicates: true,
      });

      return NextResponse.json({ created: result.count }, { status: 201 });
    }

    // Single create
    if (
      !body.make ||
      !body.makeHe ||
      !body.model ||
      !body.modelHe ||
      body.year == null
    ) {
      return NextResponse.json(
        { error: 'make, makeHe, model, modelHe, year are required' },
        { status: 400 },
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        make: body.make,
        makeHe: body.makeHe,
        model: body.model,
        modelHe: body.modelHe,
        year: body.year,
        engine: body.engine,
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return NextResponse.json(
        { error: 'Vehicle with same make/model/year/engine already exists' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
