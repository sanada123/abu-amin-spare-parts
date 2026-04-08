/**
 * Fetches real vehicle data from data.gov.il (Ministry of Transport)
 * Generates lib/vehicles-israel.ts with Israeli market cars (2015+)
 *
 * Run: npx tsx scripts/fetch-israel-vehicles.ts
 */

import fs from "fs";
import path from "path";

const RESOURCE_ID = "053cea08-09bc-40ec-8f7a-156f0677aff3";
const BASE_URL = "https://data.gov.il/api/3/action/datastore_search";
const MIN_YEAR = 2015;
const BATCH = 5000;
const MAX_RECORDS = 200000; // enough for good coverage

// Normalize make name: strip country suffixes, unify variants
function normalizeMake(raw: string): string {
  if (!raw) return "";
  let n = raw.trim();
  // Strip country suffix (Hebrew country names after the brand)
  n = n.replace(/[\s\-]+(יפן|קוריאה|גרמניה|ארהב|ארה"ב|טורקיה|צרפת|אנגליה|איטליה|תאילנד|אוסט\S*|צ.כיה|סלובקיה|תורכיה|ספרד|בלגיה|פולין|הודו|סין|מקסיקו|שבדיה|הונג\S*|בריטניה|הולנד|טיוואן|אוסטרליה|רוסיה|פורטוגל|רומניה|הונגריה|סלובניה|פינלנד|דנמרק|נורבגיה|שווייץ|אירלנד|קנדה|ברזיל|דרום\s*אפריקה).*$/i, "").trim();
  // Specific fixes
  const fixes: Record<string, string> = {
    'ב מ וו': 'BMW',
    'ב.מ.וו': 'BMW',
    'מרצדס בנץ גרמנ': 'מרצדס-בנץ',
    'מרצדס בנץ': 'מרצדס-בנץ',
    'מרצדס-בנץ': 'מרצדס-בנץ',
    'פולקסווגן': 'פולקסווגן',
    'קרייזלר': 'ג\'יפ / קרייזלר',
    'טויוטה': 'טויוטה',
    'לקסוס': 'לקסוס',
  };
  return fixes[n] || n;
}

// English brand name mapping for logos
const MAKE_EN: Record<string, string> = {
  'טויוטה': 'toyota',
  'יונדאי': 'hyundai',
  'קיה': 'kia',
  'מזדה': 'mazda',
  'הונדה': 'honda',
  'ניסאן': 'nissan',
  'סוזוקי': 'suzuki',
  'מרצדס-בנץ': 'mercedes-benz',
  'BMW': 'bmw',
  'אאודי': 'audi',
  'פולקסווגן': 'volkswagen',
  'פיג\'ו': 'peugeot',
  'רנו': 'renault',
  'סיטרואן': 'citroen',
  'פיאט': 'fiat',
  'אלפא רומיאו': 'alfa-romeo',
  'פורד': 'ford',
  'שברולט': 'chevrolet',
  'מיצובישי': 'mitsubishi',
  'סובארו': 'subaru',
  'וולבו': 'volvo',
  'סקודה': 'skoda',
  'סיאט': 'seat',
  'דאציה': 'dacia',
  'לקסוס': 'lexus',
  'פורשה': 'porsche',
  'מזארטי': 'maserati',
  "ג'יפ / קרייזלר": 'jeep',
  'סאנגיונג': 'ssangyong',
};

interface MakeData {
  models: Set<string>;
  years: Set<number>;
}

async function fetchBatch(offset: number): Promise<any[]> {
  const url = `${BASE_URL}?resource_id=${RESOURCE_ID}&limit=${BATCH}&offset=${offset}&fields=tozeret_nm,kinuy_mishari,shnat_yitzur,sug_degem`;
  const res = await fetch(url);
  const json = await res.json();
  return json.result?.records || [];
}

async function main() {
  console.log("🚗 Fetching Israeli vehicle data from data.gov.il...");
  
  const makes: Map<string, MakeData> = new Map();
  let offset = 0;
  let fetched = 0;

  while (fetched < MAX_RECORDS) {
    const records = await fetchBatch(offset);
    if (!records.length) break;

    for (const rec of records) {
      if (rec.sug_degem !== 'P') continue; // Private cars only
      const yr = Number(rec.shnat_yitzur);
      if (!yr || yr < MIN_YEAR || yr > new Date().getFullYear()) continue;
      const model = (rec.kinuy_mishari || '').trim().toUpperCase();
      if (!model || model.length < 2) continue;
      
      const make = normalizeMake(rec.tozeret_nm || '');
      if (!make) continue;

      if (!makes.has(make)) makes.set(make, { models: new Set(), years: new Set() });
      makes.get(make)!.models.add(model);
      makes.get(make)!.years.add(yr);
    }

    fetched += records.length;
    offset += BATCH;
    process.stdout.write(`\r  ${fetched.toLocaleString()} records, ${makes.size} makes...`);

    if (records.length < BATCH) break;
    await new Promise(r => setTimeout(r, 80)); // rate limit
  }

  console.log(`\n✅ Done. ${makes.size} unique makes`);

  // Sort makes by model count (most popular first)
  const sorted = [...makes.entries()]
    .filter(([, v]) => v.models.size >= 3) // skip rare makes
    .sort((a, b) => b[1].models.size - a[1].models.size);

  // Generate TypeScript
  const lines: string[] = [
    '// AUTO-GENERATED — do not edit manually',
    '// Source: data.gov.il — Ministry of Transport (Israel)',
    `// Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    'export interface IsraelMake {',
    '  slug: string;',
    '  nameHe: string;',
    '  nameEn: string;',
    '  logoSlug: string; // for car-logo CDN',
    '  models: string[];',
    '  years: number[];',
    '}',
    '',
    'export const israelMakes: IsraelMake[] = [',
  ];

  for (const [makeHe, data] of sorted) {
    const slug = (MAKE_EN[makeHe] || makeHe.replace(/[^a-z0-9]/gi, '-').toLowerCase());
    const nameEn = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const logoSlug = MAKE_EN[makeHe] || slug;
    const models = [...data.models].sort();
    const years = [...data.years].sort((a, b) => a - b);

    lines.push(`  {`);
    lines.push(`    slug: ${JSON.stringify(slug)},`);
    lines.push(`    nameHe: ${JSON.stringify(makeHe)},`);
    lines.push(`    nameEn: ${JSON.stringify(nameEn)},`);
    lines.push(`    logoSlug: ${JSON.stringify(logoSlug)},`);
    lines.push(`    models: ${JSON.stringify(models)},`);
    lines.push(`    years: ${JSON.stringify(years)},`);
    lines.push(`  },`);
  }

  lines.push('];');
  lines.push('');
  lines.push('export function getMakeBySlug(slug: string) {');
  lines.push('  return israelMakes.find(m => m.slug === slug);');
  lines.push('}');
  lines.push('');
  lines.push('export function getLogoUrl(logoSlug: string): string {');
  lines.push('  return `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${logoSlug}.png`;');
  lines.push('}');

  const outPath = path.join(process.cwd(), 'lib', 'vehicles-israel.ts');
  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`📄 Written to ${outPath}`);
  console.log(`📊 ${sorted.length} makes with 3+ models`);
  sorted.slice(0, 15).forEach(([m, v]) => {
    console.log(`   ${m}: ${v.models.size} models (${Math.min(...v.years)}-${Math.max(...v.years)})`);
  });
}

main().catch(console.error);
