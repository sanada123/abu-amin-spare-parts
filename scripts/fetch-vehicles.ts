/**
 * Build-time script: fetch vehicle data from NHTSA vPIC API
 * + logo URLs from filippofilip95/car-logos-dataset
 *
 * Run: npx tsx scripts/fetch-vehicles.ts
 * Output: lib/vehicles.generated.json
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";

// Popular makes in Israel (covers ~95% of road fleet)
const POPULAR_MAKES = [
  "toyota", "hyundai", "kia", "mazda", "skoda", "volkswagen",
  "bmw", "mercedes-benz", "honda", "nissan", "mitsubishi", "suzuki",
  "ford", "chevrolet", "opel", "peugeot", "renault", "citroen",
  "fiat", "seat", "audi", "volvo", "subaru", "lexus", "mini", "jeep",
];

// Hebrew / Arabic transliterations for popular makes
const MAKE_I18N: Record<string, { he: string; ar: string; en: string }> = {
  "toyota":        { he: "טויוטה",     ar: "تويوتا",       en: "Toyota" },
  "hyundai":       { he: "יונדאי",     ar: "هيونداي",      en: "Hyundai" },
  "kia":           { he: "קיה",         ar: "كيا",          en: "Kia" },
  "mazda":         { he: "מאזדה",       ar: "مازدا",        en: "Mazda" },
  "skoda":         { he: "סקודה",       ar: "سكودا",        en: "Skoda" },
  "volkswagen":    { he: "פולקסווגן",   ar: "فولكس فاجن",   en: "Volkswagen" },
  "bmw":           { he: "ב.מ.וו",      ar: "بي إم دبليو",  en: "BMW" },
  "mercedes-benz": { he: "מרצדס",       ar: "مرسيدس",       en: "Mercedes-Benz" },
  "honda":         { he: "הונדה",       ar: "هوندا",        en: "Honda" },
  "nissan":        { he: "ניסאן",       ar: "نيسان",        en: "Nissan" },
  "mitsubishi":    { he: "מיצובישי",    ar: "ميتسوبيشي",    en: "Mitsubishi" },
  "suzuki":        { he: "סוזוקי",      ar: "سوزوكي",       en: "Suzuki" },
  "ford":          { he: "פורד",        ar: "فورد",         en: "Ford" },
  "chevrolet":     { he: "שברולט",      ar: "شيفروليه",     en: "Chevrolet" },
  "opel":          { he: "אופל",        ar: "أوبل",         en: "Opel" },
  "peugeot":       { he: "פג'ו",        ar: "بيجو",         en: "Peugeot" },
  "renault":       { he: "רנו",         ar: "رينو",         en: "Renault" },
  "citroen":       { he: "סיטרואן",     ar: "سيتروين",      en: "Citroen" },
  "fiat":          { he: "פיאט",        ar: "فيات",         en: "Fiat" },
  "seat":          { he: "סיאט",        ar: "سيات",         en: "Seat" },
  "audi":          { he: "אאודי",       ar: "أودي",         en: "Audi" },
  "volvo":         { he: "וולוו",       ar: "فولفو",        en: "Volvo" },
  "subaru":        { he: "סובארו",      ar: "سوبارو",       en: "Subaru" },
  "lexus":         { he: "לקסוס",       ar: "لكزس",         en: "Lexus" },
  "mini":          { he: "מיני",        ar: "ميني",         en: "Mini" },
  "jeep":          { he: "ג'יפ",        ar: "جيب",          en: "Jeep" },
};

const YEARS = Array.from({ length: 21 }, (_, i) => 2005 + i); // 2005-2025

const LOGO_BASE = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";

type GeneratedModel = { name: string };
type GeneratedMake = {
  slug: string;
  nameHe: string;
  nameAr: string;
  nameEn: string;
  logoUrl: string;
  years: Record<number, GeneratedModel[]>;
};

async function fetchModelsForYear(make: string, year: number, retries = 3): Promise<string[]> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformakeyear/make/${make}/modelyear/${year}?format=json`;
  // NHTSA requires EXACT Make_Name match to filter out substring collisions
  // (e.g. searching "ford" also matches "CRAWFORD" or "AFFORDABLE ALUMINUM")
  const wantName = make.toUpperCase().replace(/-/g, "-");
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "abu-amin-spare-parts/1.0", "Accept": "application/json" },
        signal: AbortSignal.timeout(20000),
      });
      if (r.status === 403 || r.status === 429) {
        await new Promise((res) => setTimeout(res, 5000 * (i + 1)));
        continue;
      }
      if (!r.ok) return [];
      const j: any = await r.json();
      const names: string[] = (j.Results ?? [])
        .filter((m: any) => (m.Make_Name || "").toUpperCase() === wantName)
        .map((m: any) => m.Model_Name)
        .filter(Boolean);
      return Array.from(new Set(names));
    } catch {
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  return [];
}

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  console.log(`Fetching NHTSA vehicle data: ${POPULAR_MAKES.length} makes × ${YEARS.length} years = ${POPULAR_MAKES.length * YEARS.length} calls`);
  const data: GeneratedMake[] = [];

  for (const make of POPULAR_MAKES) {
    const i18n = MAKE_I18N[make] ?? { he: make, ar: make, en: make };
    const makeData: GeneratedMake = {
      slug: make,
      nameHe: i18n.he,
      nameAr: i18n.ar,
      nameEn: i18n.en,
      logoUrl: `${LOGO_BASE}/${make}.png`,
      years: {},
    };
    // Parallel fetch all years for this make
    const results = await Promise.all(YEARS.map((y) => fetchModelsForYear(make, y).then((models) => ({ y, models }))));
    for (const { y, models } of results) {
      if (models.length > 0) {
        makeData.years[y] = models.map((name) => ({ name }));
      }
    }
    const totalModels = Object.values(makeData.years).reduce((s, arr) => s + arr.length, 0);
    console.log(`  ${make}: ${Object.keys(makeData.years).length} years, ${totalModels} total model entries`);
    data.push(makeData);
  }

  const outPath = resolve(process.cwd(), "lib/vehicles.generated.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  const bytes = JSON.stringify(data).length;
  console.log(`\n✅ Wrote ${outPath} (${(bytes / 1024).toFixed(1)} KB)`);
  console.log(`   ${data.length} makes, ${data.reduce((s, m) => s + Object.values(m.years).flat().length, 0)} total model rows`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
