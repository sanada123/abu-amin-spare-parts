import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Vehicle Selector API
 *
 * GET /api/vehicle-selector
 *   → returns distinct makes with slug, makeHe, year range
 *
 * GET /api/vehicle-selector?make=toyota
 *   → returns distinct years for that make (desc)
 *
 * GET /api/vehicle-selector?make=toyota&year=2020
 *   → returns distinct models for make+year
 *
 * GET /api/vehicle-selector?make=toyota&year=2020&model=corolla
 *   → returns engines (vehicle id + engine string)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const make = searchParams.get('make');
  const yearParam = searchParams.get('year');
  const model = searchParams.get('model');
  const year = yearParam ? parseInt(yearParam, 10) : null;

  try {
    // Level 3: engines for make+year+model
    if (make && year && model) {
      const vehicles = await prisma.vehicle.findMany({
        where: { make, year, model, isActive: true },
        select: { id: true, engine: true },
        orderBy: { engine: 'asc' },
      });
      return NextResponse.json({ engines: vehicles });
    }

    // Level 2: models for make+year
    if (make && year) {
      const rows = await prisma.vehicle.findMany({
        where: { make, year, isActive: true },
        select: { model: true, modelHe: true },
        distinct: ['model'],
        orderBy: { model: 'asc' },
      });
      return NextResponse.json({ models: rows });
    }

    // Level 1: years for make
    if (make) {
      const rows = await prisma.vehicle.findMany({
        where: { make, isActive: true },
        select: { year: true },
        distinct: ['year'],
        orderBy: { year: 'desc' },
      });
      return NextResponse.json({ years: rows.map((r) => r.year) });
    }

    // Level 0: all makes with slug + makeHe + year range
    const makes = await prisma.vehicle.findMany({
      where: { isActive: true },
      select: { make: true, makeHe: true, year: true },
      distinct: ['make'],
      orderBy: { make: 'asc' },
    });

    // Compute year range per make
    const yearRanges = await prisma.vehicle.groupBy({
      by: ['make'],
      where: { isActive: true },
      _min: { year: true },
      _max: { year: true },
    });
    const rangeMap = new Map(
      yearRanges.map((r) => [r.make, { min: r._min.year, max: r._max.year }])
    );

    const result = makes.map((m) => {
      const range = rangeMap.get(m.make);
      return {
        slug: m.make,
        name: m.makeHe,
        yearMin: range?.min ?? null,
        yearMax: range?.max ?? null,
      };
    });

    return NextResponse.json({ makes: result });
  } catch (err) {
    console.error('[vehicle-selector]', err);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
