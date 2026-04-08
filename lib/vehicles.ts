/**
 * Vehicle data: real Israeli market data from data.gov.il (Ministry of Transport)
 * Generated via scripts/fetch-israel-vehicles.ts
 * 30 makes, 400+ models, years 2015–2026
 */

import { israelMakes, getLogoUrl } from "./vehicles-israel";

export interface Vehicle {
  id: number;
  year: number;
  makeSlug: string;
  makeName: { he: string; ar: string; en: string };
  makeLogoUrl: string;
  modelSlug: string;
  modelName: { he: string; ar: string; en: string };
  engine: string;
}

// Build vehicles array from israelMakes
const VEHICLES: Vehicle[] = israelMakes.flatMap((make, makeIndex) =>
  make.years.flatMap((year, yearIndex) =>
    make.models.map((model, modelIndex) => ({
      id: makeIndex * 100000 + yearIndex * 1000 + modelIndex + 1,
      year,
      makeSlug: make.slug,
      makeName: { he: make.nameHe, ar: make.nameHe, en: make.nameEn },
      makeLogoUrl: getLogoUrl(make.logoSlug),
      modelSlug: model.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      modelName: { he: model, ar: model, en: model },
      engine: "1.6L",
    }))
  )
);

export function getAllVehicles(): Vehicle[] {
  return VEHICLES;
}

export function getUniqueMakes(): { slug: string; name: { he: string; ar: string; en: string }; logoUrl: string }[] {
  const seen = new Set<string>();
  return VEHICLES
    .filter(v => { if (seen.has(v.makeSlug)) return false; seen.add(v.makeSlug); return true; })
    .map(v => ({ slug: v.makeSlug, name: v.makeName, logoUrl: v.makeLogoUrl }));
}

export function getYearsForMake(makeSlug: string): number[] {
  return [...new Set(VEHICLES.filter(v => v.makeSlug === makeSlug).map(v => v.year))].sort((a, b) => b - a);
}

export function getModelsForMakeYear(makeSlug: string, year: number): { slug: string; name: { he: string; ar: string; en: string } }[] {
  const seen = new Set<string>();
  return VEHICLES
    .filter(v => v.makeSlug === makeSlug && v.year === year)
    .filter(v => { if (seen.has(v.modelSlug)) return false; seen.add(v.modelSlug); return true; })
    .map(v => ({ slug: v.modelSlug, name: v.modelName }));
}

export function getEnginesForMakeYearModel(makeSlug: string, year: number, modelSlug: string): Vehicle[] {
  return VEHICLES.filter(v => v.makeSlug === makeSlug && v.year === year && v.modelSlug === modelSlug);
}

export function getVehicleById(id: number): Vehicle | undefined {
  return VEHICLES.find(v => v.id === id);
}
