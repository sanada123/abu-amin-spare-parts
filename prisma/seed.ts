import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Abu Amin database — Israel market data...\n');

  // ══════════════════════════════════════════════════════════════════
  //  PHASE 0 — CLEAN SLATE
  //  Delete in correct FK order to avoid constraint errors
  // ══════════════════════════════════════════════════════════════════
  console.log('🧹 Cleaning existing data...');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "OrderItem", "Order", "Customer", "Fitment", "Sku", "Product", "Vehicle", "Category", "Brand", "Promotion" RESTART IDENTITY CASCADE');
  console.log('✅ Clean slate\n');

  // ══════════════════════════════════════════════════════════════════
  //  PHASE 1 — BRANDS
  //  Separated by domain: auto parts, power tools, garden
  // ══════════════════════════════════════════════════════════════════

  // Auto parts brands (OEM & aftermarket sold in Israel)
  const autoBrands = [
    { slug: 'bosch',    name: 'Bosch',          country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'brembo',   name: 'Brembo',         country: '🇮🇹', logo: '🇮🇹' },
    { slug: 'mann',     name: 'Mann-Filter',    country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'febi',     name: 'Febi Bilstein',  country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'denso',    name: 'Denso',          country: '🇯🇵', logo: '🇯🇵' },
    { slug: 'ngk',      name: 'NGK',            country: '🇯🇵', logo: '🇯🇵' },
    { slug: 'valeo',    name: 'Valeo',          country: '🇫🇷', logo: '🇫🇷' },
    { slug: 'sachs',    name: 'Sachs (ZF)',     country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'hella',    name: 'Hella',          country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'mahle',    name: 'Mahle',          country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'akebono',  name: 'Akebono',        country: '🇯🇵', logo: '🇯🇵' },
    { slug: 'mobil1',   name: 'Mobil 1',        country: '🇺🇸', logo: '🇺🇸' },
    { slug: 'castrol',  name: 'Castrol',        country: '🇬🇧', logo: '🇬🇧' },
    { slug: 'exide',    name: 'Exide',          country: '🇺🇸', logo: '🇺🇸' },
    { slug: 'monroe',   name: 'Monroe',         country: '🇧🇪', logo: '🇧🇪' },
    { slug: 'trw',      name: 'TRW',            country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'ate',      name: 'ATE',            country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'continental', name: 'Continental', country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'aisin',    name: 'Aisin',          country: '🇯🇵', logo: '🇯🇵' },
    { slug: 'kyb',      name: 'KYB',            country: '🇯🇵', logo: '🇯🇵' },
  ];

  // Power tools brands popular in Israel
  const toolBrands = [
    { slug: 'makita',     name: 'Makita',       country: '🇯🇵', logo: '🇯🇵' },
    { slug: 'dewalt',     name: 'DeWalt',       country: '🇺🇸', logo: '🇺🇸' },
    { slug: 'milwaukee',  name: 'Milwaukee',    country: '🇺🇸', logo: '🇺🇸' },
    { slug: 'bosch-tools', name: 'Bosch (כלים)', country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'metabo',     name: 'Metabo',       country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'black-decker', name: 'Black+Decker', country: '🇺🇸', logo: '🇺🇸' },
    { slug: 'total',      name: 'Total',        country: '🇨🇳', logo: '🇨🇳' },
  ];

  // Garden brands popular in Israel
  const gardenBrands = [
    { slug: 'husqvarna', name: 'Husqvarna',    country: '🇸🇪', logo: '🇸🇪' },
    { slug: 'stihl',     name: 'Stihl',        country: '🇩🇪', logo: '🇩🇪' },
    { slug: 'gardena',   name: 'Gardena',      country: '🇩🇪', logo: '🇩🇪' },
  ];

  const allBrands = [...autoBrands, ...toolBrands, ...gardenBrands];
  const brandMap: Record<string, number> = {};

  for (const b of allBrands) {
    const created = await prisma.brand.create({ data: { name: b.name, slug: b.slug, country: b.country, logo: b.logo } });
    brandMap[b.slug] = created.id;
  }
  console.log(`✅ ${allBrands.length} brands (${autoBrands.length} auto, ${toolBrands.length} tools, ${gardenBrands.length} garden)`);

  // ══════════════════════════════════════════════════════════════════
  //  PHASE 2 — CATEGORIES
  // ══════════════════════════════════════════════════════════════════

  const catData = [
    // Auto parts — top level
    { slug: 'brakes',            name: 'בלמים',                   icon: '🛞', position: 1 },
    { slug: 'filters',           name: 'מסננים',                  icon: '🌀', position: 2 },
    { slug: 'engine',            name: 'מנוע',                    icon: '⚙️', position: 3 },
    { slug: 'electrical',        name: 'חשמל',                    icon: '⚡', position: 4 },
    { slug: 'lighting',          name: 'תאורה',                   icon: '💡', position: 5 },
    { slug: 'cooling',           name: 'קירור',                   icon: '❄️', position: 6 },
    { slug: 'oils-fluids',       name: 'שמנים ונוזלים',           icon: '🛢️', position: 7 },
    { slug: 'shocks-suspension', name: 'בולמים ומתלים',           icon: '🔩', position: 8 },
    { slug: 'exhaust',           name: 'פליטה',                   icon: '💨', position: 9 },
    { slug: 'body',              name: 'מרכב',                    icon: '🚗', position: 10 },
    { slug: 'tires-wheels',      name: 'צמיגים וגלגלים',          icon: '⚫', position: 11 },
    { slug: 'ac-system',         name: 'מיזוג אוויר',             icon: '❄️', position: 12 },
    { slug: 'batteries',         name: 'מצברים',                  icon: '🔋', position: 13 },
    { slug: 'steering',          name: 'הגה ושליטה',              icon: '🔧', position: 14 },
    { slug: 'transmission',      name: 'תיבת הילוכים',            icon: '⚙️', position: 15 },
    // Tools group
    { slug: 'tools-machines',    name: 'כלים ומכונות',            icon: '🔧', group: 'tools', position: 16 },
    // Garden group
    { slug: 'garden',            name: 'גינה',                    icon: '🌿', group: 'garden', position: 17 },
  ];

  const catChildren = [
    // Tools subcategories
    { slug: 'pressure-washers', name: 'מכונות שטיפה בלחץ',  icon: '💦',  parentSlug: 'tools-machines', position: 1 },
    { slug: 'air-compressors',  name: 'מדחסי אוויר',        icon: '💨', parentSlug: 'tools-machines', position: 2 },
    { slug: 'drills',           name: 'מקדחות',              icon: '🔩', parentSlug: 'tools-machines', position: 3 },
    { slug: 'saws',             name: 'מסורים',              icon: '🪚', parentSlug: 'tools-machines', position: 4 },
    { slug: 'grinders',         name: 'משחזות',              icon: '⚙️', parentSlug: 'tools-machines', position: 5 },
    { slug: 'vacuums',          name: 'שואבי אבק',           icon: '🌀', parentSlug: 'tools-machines', position: 6 },
    { slug: 'hand-tools',       name: 'כלי עבודה ידניים',    icon: '🔨', parentSlug: 'tools-machines', position: 7 },
    { slug: 'welding',          name: 'ריתוך',               icon: '🔥', parentSlug: 'tools-machines', position: 8 },
    // Garden subcategories
    { slug: 'brush-cutters',    name: 'חרמשים',              icon: '🌾', parentSlug: 'garden', position: 1 },
    { slug: 'lawn-mowers',      name: 'מכסחות דשא',          icon: '🏡', parentSlug: 'garden', position: 2 },
    { slug: 'garden-tools',     name: 'כלי גינון',           icon: '🌱', parentSlug: 'garden', position: 3 },
    { slug: 'irrigation',       name: 'השקיה',               icon: '💧', parentSlug: 'garden', position: 4 },
    { slug: 'chainsaws',        name: 'מסורי שרשרת',         icon: '🪚', parentSlug: 'garden', position: 5 },
  ];

  const catMap: Record<string, number> = {};
  for (const c of catData) {
    const cat = await prisma.category.create({
      data: { slug: c.slug, name: c.name, icon: c.icon, position: c.position, group: (c as any).group },
    });
    catMap[c.slug] = cat.id;
  }
  for (const c of catChildren) {
    const cat = await prisma.category.create({
      data: { slug: c.slug, name: c.name, icon: c.icon, position: c.position, parentId: catMap[c.parentSlug] },
    });
    catMap[c.slug] = cat.id;
  }
  console.log(`✅ ${catData.length + catChildren.length} categories`);

  // ══════════════════════════════════════════════════════════════════
  //  PHASE 3 — VEHICLES (Israeli market 2015-2025)
  //  Based on top-selling models in Israel:
  //  Toyota, Hyundai, Kia, Skoda, Mazda, VW, Mitsubishi, Honda,
  //  Nissan, Suzuki, Seat/Cupra, BMW, Mercedes
  // ══════════════════════════════════════════════════════════════════

  type VehicleInput = { make: string; makeHe: string; model: string; modelHe: string; year: number; engine: string };

  // Helper to generate year ranges
  function yearsRange(make: string, makeHe: string, model: string, modelHe: string, fromYear: number, toYear: number, engines: string[]): VehicleInput[] {
    const result: VehicleInput[] = [];
    for (let y = fromYear; y <= toYear; y++) {
      for (const eng of engines) {
        result.push({ make, makeHe, model, modelHe, year: y, engine: eng });
      }
    }
    return result;
  }

  const vehicleData: VehicleInput[] = [
    // ── Toyota (30% market share in Israel, #1 brand) ──
    ...yearsRange('toyota', 'טויוטה', 'corolla', 'קורולה', 2016, 2024, ['1.6L', '1.8L', '1.8L Hybrid']),
    ...yearsRange('toyota', 'טויוטה', 'corolla-cross', 'קורולה קרוס', 2022, 2025, ['1.8L Hybrid', '2.0L Hybrid']),
    ...yearsRange('toyota', 'טויוטה', 'camry', 'קאמרי', 2018, 2024, ['2.5L', '2.5L Hybrid']),
    ...yearsRange('toyota', 'טויוטה', 'rav4', 'RAV4', 2017, 2024, ['2.0L', '2.5L Hybrid']),
    ...yearsRange('toyota', 'טויוטה', 'yaris-cross', 'יאריס קרוס', 2021, 2025, ['1.5L', '1.5L Hybrid']),
    ...yearsRange('toyota', 'טויוטה', 'c-hr', 'C-HR', 2018, 2024, ['1.8L Hybrid', '2.0L Hybrid']),
    ...yearsRange('toyota', 'טויוטה', 'land-cruiser', 'לנד קרוזר', 2017, 2023, ['2.8L Diesel', '3.5L V6']),

    // ── Hyundai (#2 brand in Israel) ──
    ...yearsRange('hyundai', 'יונדאי', 'elantra', 'אלנטרה', 2017, 2024, ['1.6L', '2.0L']),
    ...yearsRange('hyundai', 'יונדאי', 'i20', 'i20', 2016, 2023, ['1.2L', '1.4L']),
    ...yearsRange('hyundai', 'יונדאי', 'i30', 'i30', 2016, 2023, ['1.4L Turbo', '1.6L']),
    ...yearsRange('hyundai', 'יונדאי', 'tucson', 'טוסון', 2017, 2024, ['1.6L Turbo', '2.0L', '1.6L Hybrid']),
    ...yearsRange('hyundai', 'יונדאי', 'kona', 'קונה', 2018, 2024, ['1.0L Turbo', '1.6L Turbo', 'Electric']),
    ...yearsRange('hyundai', 'יונדאי', 'ioniq', 'איוניק', 2017, 2022, ['1.6L Hybrid']),
    ...yearsRange('hyundai', 'יונדאי', 'ioniq5', 'איוניק 5', 2022, 2025, ['Electric 58kWh', 'Electric 77kWh']),

    // ── Kia (#3-4 brand in Israel) ──
    ...yearsRange('kia', 'קיה', 'picanto', 'פיקנטו', 2017, 2024, ['1.0L', '1.2L']),
    ...yearsRange('kia', 'קיה', 'niro', 'נירו', 2018, 2024, ['1.6L Hybrid', '1.6L PHEV']),
    ...yearsRange('kia', 'קיה', 'sportage', "ספורטאז'", 2016, 2024, ['1.6L Turbo', '2.0L', '1.6L Hybrid']),
    ...yearsRange('kia', 'קיה', 'stonic', 'סטוניק', 2019, 2024, ['1.0L Turbo']),
    ...yearsRange('kia', 'קיה', 'seltos', 'סלטוס', 2020, 2024, ['1.5L', '1.6L Turbo']),
    ...yearsRange('kia', 'קיה', 'ev6', 'EV6', 2022, 2025, ['Electric 58kWh', 'Electric 77kWh']),

    // ── Skoda (very popular in Israel) ──
    ...yearsRange('skoda', 'סקודה', 'octavia', 'אוקטביה', 2016, 2024, ['1.4L TSI', '1.5L TSI', '2.0L TDI']),
    ...yearsRange('skoda', 'סקודה', 'karoq', 'קארוק', 2018, 2024, ['1.5L TSI']),
    ...yearsRange('skoda', 'סקודה', 'kamiq', 'קאמיק', 2020, 2024, ['1.0L TSI', '1.5L TSI']),
    ...yearsRange('skoda', 'סקודה', 'kodiaq', 'קודיאק', 2017, 2024, ['1.5L TSI', '2.0L TSI']),
    ...yearsRange('skoda', 'סקודה', 'fabia', 'פאביה', 2016, 2023, ['1.0L TSI']),

    // ── Mazda ──
    ...yearsRange('mazda', 'מאזדה', 'mazda2', 'מאזדה 2', 2018, 2024, ['1.5L']),
    ...yearsRange('mazda', 'מאזדה', 'mazda3', 'מאזדה 3', 2016, 2023, ['1.5L', '2.0L']),
    ...yearsRange('mazda', 'מאזדה', 'cx5', 'CX-5', 2017, 2024, ['2.0L', '2.5L']),
    ...yearsRange('mazda', 'מאזדה', 'cx30', 'CX-30', 2020, 2024, ['2.0L']),

    // ── VW ──
    ...yearsRange('vw', 'פולקסווגן', 'golf', 'גולף', 2016, 2023, ['1.4L TSI', '1.5L TSI', '2.0L GTI']),
    ...yearsRange('vw', 'פולקסווגן', 'tiguan', 'טיגואן', 2017, 2024, ['1.5L TSI', '2.0L TSI']),
    ...yearsRange('vw', 'פולקסווגן', 'polo', 'פולו', 2018, 2023, ['1.0L TSI']),
    ...yearsRange('vw', 'פולקסווגן', 'id4', 'ID.4', 2021, 2025, ['Electric 52kWh', 'Electric 77kWh']),

    // ── Seat / Cupra ──
    ...yearsRange('seat', 'סיאט', 'arona', 'ארונה', 2018, 2024, ['1.0L TSI', '1.5L TSI']),
    ...yearsRange('seat', 'סיאט', 'ibiza', 'איביזה', 2018, 2023, ['1.0L TSI']),

    // ── Mitsubishi ──
    ...yearsRange('mitsubishi', 'מיצובישי', 'outlander', 'אאוטלנדר', 2016, 2024, ['2.4L PHEV', '2.5L']),
    ...yearsRange('mitsubishi', 'מיצובישי', 'eclipse-cross', 'אקליפס קרוס', 2018, 2024, ['1.5L Turbo', '2.4L PHEV']),

    // ── Suzuki (popular in Israel) ──
    ...yearsRange('suzuki', 'סוזוקי', 's-cross', 'S-Cross', 2017, 2024, ['1.4L Turbo Hybrid']),
    ...yearsRange('suzuki', 'סוזוקי', 'vitara', 'ויטרה', 2016, 2023, ['1.4L Turbo', '1.5L']),
    ...yearsRange('suzuki', 'סוזוקי', 'swift', 'סוויפט', 2017, 2024, ['1.2L Hybrid']),
    ...yearsRange('suzuki', 'סוזוקי', 'baleno', 'באלנו', 2018, 2023, ['1.4L']),

    // ── Honda ──
    ...yearsRange('honda', 'הונדה', 'civic', 'סיוויק', 2017, 2024, ['1.5L Turbo', '2.0L']),
    ...yearsRange('honda', 'הונדה', 'crv', 'CR-V', 2017, 2024, ['1.5L Turbo', '2.0L Hybrid']),
    ...yearsRange('honda', 'הונדה', 'jazz', "ג'אז", 2018, 2023, ['1.5L', '1.5L Hybrid']),

    // ── Nissan ──
    ...yearsRange('nissan', 'ניסאן', 'qashqai', 'קשקאי', 2016, 2024, ['1.2L Turbo', '1.3L Turbo']),
    ...yearsRange('nissan', 'ניסאן', 'juke', "ג'וק", 2020, 2024, ['1.0L Turbo']),
    ...yearsRange('nissan', 'ניסאן', 'x-trail', 'אקסטרייל', 2018, 2024, ['1.5L Turbo', '1.5L e-POWER']),

    // ── BMW ──
    ...yearsRange('bmw', 'ב.מ.וו', '320i', '320i', 2017, 2024, ['2.0L Turbo']),
    ...yearsRange('bmw', 'ב.מ.וו', 'x1', 'X1', 2018, 2024, ['1.5L Turbo', '2.0L Turbo']),
    ...yearsRange('bmw', 'ב.מ.וו', 'ix', 'iX', 2022, 2025, ['Electric xDrive40', 'Electric xDrive50']),

    // ── Mercedes ──
    ...yearsRange('mercedes', 'מרצדס', 'c200', 'C200', 2017, 2024, ['1.5L Turbo', '2.0L Turbo']),
    ...yearsRange('mercedes', 'מרצדס', 'gla', 'GLA', 2018, 2024, ['1.3L Turbo', '2.0L Turbo']),
  ];

  const vehicleIds: number[] = [];
  for (const vd of vehicleData) {
    const v = await prisma.vehicle.create({ data: vd });
    vehicleIds.push(v.id);
  }
  console.log(`✅ ${vehicleData.length} vehicles`);

  // Build quick lookup: "make-model" → array of vehicle IDs
  const vLookup: Record<string, number[]> = {};
  vehicleData.forEach((vd, idx) => {
    const key = `${vd.make}-${vd.model}`;
    if (!vLookup[key]) vLookup[key] = [];
    vLookup[key].push(vehicleIds[idx]);
  });
  function v(...keys: string[]): number[] {
    return keys.flatMap(k => vLookup[k] ?? []);
  }

  // Common groups for fitments
  const TOYOTA_ALL = v('toyota-corolla', 'toyota-corolla-cross', 'toyota-camry', 'toyota-rav4', 'toyota-yaris-cross', 'toyota-c-hr');
  const HYUNDAI_ALL = v('hyundai-elantra', 'hyundai-i20', 'hyundai-i30', 'hyundai-tucson', 'hyundai-kona');
  const KIA_ALL = v('kia-picanto', 'kia-niro', 'kia-sportage', 'kia-stonic', 'kia-seltos');
  const VW_GROUP = v('vw-golf', 'vw-tiguan', 'vw-polo', 'skoda-octavia', 'skoda-karoq', 'skoda-kamiq', 'seat-arona', 'seat-ibiza');

  // ══════════════════════════════════════════════════════════════════
  //  PHASE 4 — PRODUCTS + SKUS + FITMENTS
  //  Real OEM-cross-reference part numbers where available
  // ══════════════════════════════════════════════════════════════════

  type SkuCfg = {
    brand: string; pn: string; price: number; stock: number;
    warranty: number; tier?: 'original' | 'replacement'; delivery?: number;
  };
  type PartSeed = {
    slug: string; name: string; desc?: string; catSlug: string;
    images?: string[]; skus: SkuCfg[]; fits: number[];
    featured?: boolean;
  };

  const partSeeds: PartSeed[] = [
    // ═══════════════════════════════════════════
    //  BRAKES
    // ═══════════════════════════════════════════
    {
      slug: 'front-brake-pads-toyota-corolla',
      name: 'רפידות בלם קדמיות טויוטה קורולה',
      desc: 'רפידות בלם קדמיות תואם לטויוטה קורולה 2016-2024. OEM: 04465-02460. חומר קרמי, בטיחות גבוהה.',
      catSlug: 'brakes', featured: true,
      skus: [
        { brand: 'bosch', pn: '0986494614', price: 189, stock: 25, warranty: 24 },
        { brand: 'brembo', pn: 'P83144', price: 259, stock: 14, warranty: 24, tier: 'original' },
        { brand: 'akebono', pn: 'ACT1210', price: 219, stock: 18, warranty: 18, tier: 'original' },
        { brand: 'trw', pn: 'GDB3540', price: 165, stock: 32, warranty: 12 },
        { brand: 'ate', pn: '13.0460-7267.2', price: 175, stock: 20, warranty: 12 },
      ],
      fits: v('toyota-corolla', 'toyota-corolla-cross'),
    },
    {
      slug: 'rear-brake-pads-toyota-corolla',
      name: 'רפידות בלם אחוריות טויוטה קורולה',
      desc: 'רפידות בלם אחוריות תואם לקורולה. OEM: 04466-02260.',
      catSlug: 'brakes',
      skus: [
        { brand: 'bosch', pn: '0986494615', price: 159, stock: 20, warranty: 24 },
        { brand: 'brembo', pn: 'P83145', price: 225, stock: 10, warranty: 24, tier: 'original' },
        { brand: 'trw', pn: 'GDB3541', price: 139, stock: 28, warranty: 12 },
      ],
      fits: v('toyota-corolla', 'toyota-corolla-cross'),
    },
    {
      slug: 'front-brake-discs-toyota-camry',
      name: 'דיסקי בלם קדמיים טויוטה קאמרי',
      desc: 'דיסקי בלם מאווררים קדמיים 296mm. OEM: 43512-06170.',
      catSlug: 'brakes',
      skus: [
        { brand: 'brembo', pn: '09.A532.11', price: 545, stock: 8, warranty: 24, tier: 'original' },
        { brand: 'bosch', pn: '0986479R98', price: 395, stock: 12, warranty: 24 },
        { brand: 'trw', pn: 'DF6234', price: 345, stock: 16, warranty: 12 },
      ],
      fits: v('toyota-camry', 'toyota-rav4'),
    },
    {
      slug: 'front-brake-pads-hyundai',
      name: 'רפידות בלם קדמיות יונדאי/קיה',
      desc: 'רפידות בלם קדמיות תואם יונדאי אלנטרה, i30, טוסון, קיה ספורטאז\'. OEM: 58101-D7A10.',
      catSlug: 'brakes', featured: true,
      skus: [
        { brand: 'bosch', pn: '0986494690', price: 179, stock: 24, warranty: 24 },
        { brand: 'akebono', pn: 'EUR1809', price: 209, stock: 12, warranty: 18, tier: 'original' },
        { brand: 'trw', pn: 'GDB3605', price: 149, stock: 30, warranty: 12 },
        { brand: 'ate', pn: '13.0460-7324.2', price: 159, stock: 22, warranty: 12 },
      ],
      fits: [...HYUNDAI_ALL, ...KIA_ALL],
    },
    {
      slug: 'front-brake-pads-vw-group',
      name: 'רפידות בלם קדמיות VW/סקודה/סיאט',
      desc: 'רפידות בלם קדמיות פלטפורמת MQB. תואם גולף, אוקטביה, טיגואן. OEM: 5Q0698151.',
      catSlug: 'brakes',
      skus: [
        { brand: 'ate', pn: '13.0460-4855.2', price: 195, stock: 18, warranty: 24, tier: 'original' },
        { brand: 'trw', pn: 'GDB1908', price: 169, stock: 25, warranty: 12 },
        { brand: 'bosch', pn: '0986494399', price: 185, stock: 20, warranty: 24 },
      ],
      fits: VW_GROUP,
    },
    {
      slug: 'brake-discs-front-hyundai',
      name: 'דיסקי בלם קדמיים יונדאי/קיה',
      desc: 'דיסקי בלם מאווררים 280mm. OEM: 51712-D7000.',
      catSlug: 'brakes',
      skus: [
        { brand: 'brembo', pn: '09.C111.11', price: 425, stock: 10, warranty: 24, tier: 'original' },
        { brand: 'trw', pn: 'DF6520', price: 295, stock: 18, warranty: 12 },
        { brand: 'bosch', pn: '0986479684', price: 315, stock: 14, warranty: 24 },
      ],
      fits: [...HYUNDAI_ALL, ...KIA_ALL],
    },

    // ═══════════════════════════════════════════
    //  FILTERS
    // ═══════════════════════════════════════════
    {
      slug: 'oil-filter-toyota',
      name: 'מסנן שמן טויוטה',
      desc: 'מסנן שמן תואם לרוב דגמי טויוטה. OEM: 90915-YZZN1.',
      catSlug: 'filters', featured: true,
      skus: [
        { brand: 'mann', pn: 'W 68/3', price: 39, stock: 95, warranty: 6 },
        { brand: 'bosch', pn: 'F026407023', price: 35, stock: 70, warranty: 6 },
        { brand: 'mahle', pn: 'OX 339D', price: 42, stock: 50, warranty: 6 },
        { brand: 'denso', pn: 'DXE1016', price: 32, stock: 85, warranty: 6 },
      ],
      fits: TOYOTA_ALL,
    },
    {
      slug: 'air-filter-toyota-corolla',
      name: 'מסנן אוויר טויוטה קורולה',
      desc: 'מסנן אוויר מנוע. OEM: 17801-21060.',
      catSlug: 'filters',
      skus: [
        { brand: 'mann', pn: 'C 27 145', price: 65, stock: 55, warranty: 6 },
        { brand: 'bosch', pn: 'F026400535', price: 58, stock: 40, warranty: 6 },
        { brand: 'mahle', pn: 'LX 2616', price: 62, stock: 35, warranty: 6 },
      ],
      fits: v('toyota-corolla', 'toyota-corolla-cross', 'toyota-c-hr'),
    },
    {
      slug: 'cabin-filter-toyota',
      name: 'מסנן מזגן טויוטה',
      desc: 'מסנן פחם פעיל לתא נוסעים. OEM: 87139-52040.',
      catSlug: 'filters',
      skus: [
        { brand: 'mann', pn: 'CUK 26 009', price: 85, stock: 48, warranty: 6 },
        { brand: 'bosch', pn: '1987432384', price: 75, stock: 55, warranty: 6 },
        { brand: 'denso', pn: 'DCF467K', price: 69, stock: 40, warranty: 6 },
      ],
      fits: TOYOTA_ALL,
    },
    {
      slug: 'oil-filter-hyundai-kia',
      name: 'מסנן שמן יונדאי/קיה',
      desc: 'מסנן שמן תואם לרוב דגמי יונדאי וקיה. OEM: 26350-2J001.',
      catSlug: 'filters', featured: true,
      skus: [
        { brand: 'mann', pn: 'W 811/80', price: 35, stock: 90, warranty: 6 },
        { brand: 'bosch', pn: 'F026407061', price: 32, stock: 75, warranty: 6 },
        { brand: 'mahle', pn: 'OC 500', price: 38, stock: 60, warranty: 6 },
      ],
      fits: [...HYUNDAI_ALL, ...KIA_ALL],
    },
    {
      slug: 'air-filter-hyundai-i30',
      name: 'מסנן אוויר יונדאי i30 / אלנטרה',
      desc: 'מסנן אוויר מנוע. OEM: 28113-F2000.',
      catSlug: 'filters',
      skus: [
        { brand: 'mann', pn: 'C 26 013', price: 59, stock: 45, warranty: 6 },
        { brand: 'bosch', pn: 'F026400439', price: 52, stock: 38, warranty: 6 },
      ],
      fits: v('hyundai-elantra', 'hyundai-i30', 'hyundai-tucson', 'kia-sportage', 'kia-niro'),
    },
    {
      slug: 'fuel-filter-vw-group',
      name: 'מסנן דלק VW/סקודה TSI',
      desc: 'מסנן דלק תואם TSI. OEM: 5Q0127400F.',
      catSlug: 'filters',
      skus: [
        { brand: 'mann', pn: 'WK 69/2', price: 95, stock: 35, warranty: 6 },
        { brand: 'bosch', pn: 'F026402855', price: 88, stock: 30, warranty: 6 },
        { brand: 'mahle', pn: 'KL 572', price: 92, stock: 25, warranty: 6 },
      ],
      fits: VW_GROUP,
    },

    // ═══════════════════════════════════════════
    //  ENGINE
    // ═══════════════════════════════════════════
    {
      slug: 'spark-plugs-toyota',
      name: 'מצתים (סט 4) טויוטה',
      desc: 'מצתים אירידיום. OEM: 90919-01253. תואם 1.6L-1.8L.',
      catSlug: 'engine', featured: true,
      skus: [
        { brand: 'ngk', pn: 'ILKR7E11', price: 169, stock: 80, warranty: 12 },
        { brand: 'denso', pn: 'FK20HR11', price: 195, stock: 50, warranty: 24, tier: 'original' },
        { brand: 'bosch', pn: '0242235668', price: 149, stock: 60, warranty: 12 },
      ],
      fits: v('toyota-corolla', 'toyota-yaris-cross', 'toyota-c-hr'),
    },
    {
      slug: 'timing-belt-kit-vw',
      name: 'ערכת רצועת תזמון VW/סקודה',
      desc: 'כולל רצועה, מותחן, גלגלת הנעה. OEM: 04E198119A.',
      catSlug: 'engine',
      skus: [
        { brand: 'continental', pn: 'CT1166K1', price: 495, stock: 8, warranty: 24 },
        { brand: 'bosch', pn: '1987948942', price: 545, stock: 5, warranty: 24 },
        { brand: 'febi', pn: '30899', price: 425, stock: 10, warranty: 12 },
      ],
      fits: v('vw-golf', 'vw-polo', 'skoda-octavia', 'skoda-fabia', 'seat-ibiza'),
    },
    {
      slug: 'water-pump-toyota',
      name: 'משאבת מים טויוטה',
      desc: 'משאבת מים + אטם. OEM: 16100-29085.',
      catSlug: 'engine',
      skus: [
        { brand: 'aisin', pn: 'WPT-190', price: 345, stock: 12, warranty: 24, tier: 'original' },
        { brand: 'febi', pn: '44045', price: 265, stock: 18, warranty: 12 },
      ],
      fits: v('toyota-corolla', 'toyota-camry', 'toyota-rav4'),
    },

    // ═══════════════════════════════════════════
    //  SUSPENSION
    // ═══════════════════════════════════════════
    {
      slug: 'front-shocks-toyota-corolla',
      name: 'בולמי זעזועים קדמיים טויוטה קורולה',
      desc: 'בולמי זעזועים קדמיים זוג. OEM: 48510-02840.',
      catSlug: 'shocks-suspension', featured: true,
      skus: [
        { brand: 'kyb', pn: '339403', price: 445, stock: 14, warranty: 24, tier: 'original' },
        { brand: 'monroe', pn: 'G7390', price: 385, stock: 18, warranty: 24 },
        { brand: 'sachs', pn: '313 462', price: 520, stock: 8, warranty: 36, tier: 'original' },
      ],
      fits: v('toyota-corolla', 'toyota-corolla-cross'),
    },
    {
      slug: 'rear-shocks-toyota-corolla',
      name: 'בולמי זעזועים אחוריים טויוטה קורולה',
      desc: 'בולמי זעזועים אחוריים זוג.',
      catSlug: 'shocks-suspension',
      skus: [
        { brand: 'kyb', pn: '349264', price: 385, stock: 12, warranty: 24, tier: 'original' },
        { brand: 'monroe', pn: '23877', price: 325, stock: 16, warranty: 24 },
        { brand: 'sachs', pn: '311 525', price: 445, stock: 7, warranty: 36, tier: 'original' },
      ],
      fits: v('toyota-corolla'),
    },
    {
      slug: 'front-shocks-hyundai-tucson',
      name: 'בולמי זעזועים קדמיים יונדאי טוסון/קיה ספורטאז\'',
      desc: 'בולמי זעזועים קדמיים. OEM: 54651-D7100.',
      catSlug: 'shocks-suspension',
      skus: [
        { brand: 'kyb', pn: '339790', price: 465, stock: 10, warranty: 24, tier: 'original' },
        { brand: 'monroe', pn: 'G8117', price: 395, stock: 14, warranty: 24 },
      ],
      fits: v('hyundai-tucson', 'kia-sportage'),
    },

    // ═══════════════════════════════════════════
    //  ELECTRICAL + BATTERIES
    // ═══════════════════════════════════════════
    {
      slug: 'battery-60ah',
      name: 'מצבר 60Ah',
      desc: 'מצבר 12V 60Ah 540A. מתאים לרוב הרכבים הקטנים והבינוניים.',
      catSlug: 'batteries', featured: true,
      skus: [
        { brand: 'exide', pn: 'EA601', price: 425, stock: 30, warranty: 24 },
        { brand: 'bosch', pn: 'S4 004', price: 465, stock: 22, warranty: 36 },
      ],
      fits: [...v('toyota-corolla', 'hyundai-i20', 'hyundai-i30', 'kia-picanto', 'kia-stonic', 'mazda-mazda2', 'mazda-mazda3', 'honda-jazz', 'suzuki-swift', 'suzuki-baleno')],
    },
    {
      slug: 'battery-70ah',
      name: 'מצבר 70Ah',
      desc: 'מצבר 12V 70Ah 630A. מתאים לרכבים בינוניים ו-SUV.',
      catSlug: 'batteries',
      skus: [
        { brand: 'exide', pn: 'EA770', price: 525, stock: 25, warranty: 36 },
        { brand: 'bosch', pn: 'S4 008', price: 565, stock: 18, warranty: 36 },
      ],
      fits: [...v('toyota-camry', 'toyota-rav4', 'hyundai-tucson', 'hyundai-elantra', 'kia-sportage', 'kia-niro', 'skoda-octavia', 'vw-golf', 'vw-tiguan')],
    },
    {
      slug: 'alternator-toyota-corolla',
      name: 'אלטרנטור טויוטה קורולה',
      desc: 'אלטרנטור 100A. OEM: 27060-0T211.',
      catSlug: 'electrical',
      skus: [
        { brand: 'denso', pn: 'DAN1095', price: 1350, stock: 5, warranty: 24, tier: 'original' },
        { brand: 'valeo', pn: '439777', price: 1150, stock: 8, warranty: 24 },
        { brand: 'bosch', pn: '0124525198', price: 1490, stock: 3, warranty: 24 },
      ],
      fits: v('toyota-corolla', 'toyota-corolla-cross'),
    },
    {
      slug: 'starter-motor-hyundai',
      name: 'מתנע יונדאי/קיה 1.6L',
      desc: 'מתנע 1.2kW. OEM: 36100-2B220.',
      catSlug: 'electrical',
      skus: [
        { brand: 'denso', pn: 'DSN1225', price: 980, stock: 6, warranty: 24, tier: 'original' },
        { brand: 'valeo', pn: '458540', price: 850, stock: 9, warranty: 24 },
      ],
      fits: v('hyundai-elantra', 'hyundai-i30', 'kia-niro', 'kia-sportage'),
    },

    // ═══════════════════════════════════════════
    //  LIGHTING
    // ═══════════════════════════════════════════
    {
      slug: 'headlight-bulb-h7',
      name: 'נורת פנס H7 55W',
      desc: 'זוג נורות H7 הלוגן.',
      catSlug: 'lighting', featured: true,
      skus: [
        { brand: 'hella', pn: '8GH007157-121', price: 45, stock: 130, warranty: 12 },
        { brand: 'valeo', pn: '032508', price: 39, stock: 150, warranty: 12 },
        { brand: 'bosch', pn: '1987301012', price: 42, stock: 110, warranty: 12 },
      ],
      fits: [...TOYOTA_ALL, ...HYUNDAI_ALL, ...VW_GROUP, ...v('mazda-mazda3', 'mazda-cx5', 'honda-civic')],
    },
    {
      slug: 'headlight-bulb-h11',
      name: 'נורת פנס ערפל H11',
      desc: 'זוג נורות H11.',
      catSlug: 'lighting',
      skus: [
        { brand: 'hella', pn: '8GH008358-121', price: 55, stock: 90, warranty: 12 },
        { brand: 'bosch', pn: '1987302084', price: 49, stock: 100, warranty: 12 },
      ],
      fits: [...TOYOTA_ALL, ...HYUNDAI_ALL, ...KIA_ALL],
    },

    // ═══════════════════════════════════════════
    //  COOLING
    // ═══════════════════════════════════════════
    {
      slug: 'thermostat-toyota',
      name: 'תרמוסטט טויוטה',
      desc: 'תרמוסטט + אטם. OEM: 90916-03133.',
      catSlug: 'cooling',
      skus: [
        { brand: 'aisin', pn: 'WV52TA-88', price: 95, stock: 35, warranty: 12, tier: 'original' },
        { brand: 'febi', pn: '18289', price: 75, stock: 40, warranty: 12 },
        { brand: 'mahle', pn: 'TI 39 88', price: 85, stock: 28, warranty: 12 },
      ],
      fits: v('toyota-corolla', 'toyota-camry', 'toyota-rav4'),
    },
    {
      slug: 'radiator-hyundai-tucson',
      name: 'רדיאטור יונדאי טוסון/קיה ספורטאז\'',
      desc: 'רדיאטור אלומיניום. OEM: 25310-D7500.',
      catSlug: 'cooling',
      skus: [
        { brand: 'valeo', pn: '735671', price: 745, stock: 5, warranty: 24, tier: 'original' },
        { brand: 'febi', pn: '172890', price: 595, stock: 8, warranty: 12 },
      ],
      fits: v('hyundai-tucson', 'kia-sportage'),
    },

    // ═══════════════════════════════════════════
    //  OILS & FLUIDS
    // ═══════════════════════════════════════════
    {
      slug: 'engine-oil-5w30-4l',
      name: 'שמן מנוע 5W-30 סינתטי (4 ליטר)',
      desc: 'שמן מנוע מלא סינתטי. אישור API SP, ILSAC GF-6A.',
      catSlug: 'oils-fluids', featured: true,
      skus: [
        { brand: 'mobil1', pn: 'Mobil1-ESP-5W30-4L', price: 199, stock: 95, warranty: 0 },
        { brand: 'castrol', pn: 'Edge-5W30-4L', price: 179, stock: 110, warranty: 0 },
      ],
      fits: [...TOYOTA_ALL, ...HYUNDAI_ALL, ...KIA_ALL, ...VW_GROUP, ...v('honda-civic', 'honda-crv', 'mazda-mazda3', 'mazda-cx5')],
    },
    {
      slug: 'engine-oil-0w20-4l',
      name: 'שמן מנוע 0W-20 סינתטי (4 ליטר)',
      desc: 'שמן מנוע לרכבים היברידיים וחסכוניים. אישור API SP.',
      catSlug: 'oils-fluids',
      skus: [
        { brand: 'mobil1', pn: 'Mobil1-0W20-4L', price: 215, stock: 70, warranty: 0 },
        { brand: 'castrol', pn: 'Magnatec-0W20-4L', price: 185, stock: 85, warranty: 0 },
      ],
      fits: v('toyota-corolla', 'toyota-yaris-cross', 'toyota-c-hr', 'hyundai-kona', 'honda-jazz'),
    },
    {
      slug: 'brake-fluid-dot4',
      name: 'נוזל בלמים DOT 4 (1 ליטר)',
      desc: 'נוזל בלמים סינתטי DOT 4. נקודת רתיחה יבשה 260°C.',
      catSlug: 'oils-fluids',
      skus: [
        { brand: 'bosch', pn: '1987479107', price: 49, stock: 160, warranty: 0 },
        { brand: 'ate', pn: '03.9901-5802.2', price: 55, stock: 120, warranty: 0, tier: 'original' },
      ],
      fits: [...TOYOTA_ALL, ...HYUNDAI_ALL, ...KIA_ALL, ...VW_GROUP],
    },
    {
      slug: 'coolant-1l',
      name: 'נוזל קירור (1 ליטר מרוכז)',
      desc: 'נוזל קירור מרוכז G13/G12++. לדילול 1:1.',
      catSlug: 'oils-fluids',
      skus: [
        { brand: 'febi', pn: '19400', price: 45, stock: 130, warranty: 0 },
        { brand: 'valeo', pn: '820735', price: 42, stock: 100, warranty: 0 },
      ],
      fits: [...TOYOTA_ALL, ...HYUNDAI_ALL, ...KIA_ALL, ...VW_GROUP],
    },

    // ═══════════════════════════════════════════
    //  EXHAUST
    // ═══════════════════════════════════════════
    {
      slug: 'muffler-toyota-corolla',
      name: 'משתיק (סיילנסר) אחורי טויוטה קורולה',
      desc: 'משתיק פליטה אחורי. OEM: 17430-0T250.',
      catSlug: 'exhaust',
      skus: [
        { brand: 'valeo', pn: '740120', price: 585, stock: 7, warranty: 24 },
        { brand: 'febi', pn: '40367', price: 445, stock: 10, warranty: 12 },
      ],
      fits: v('toyota-corolla'),
    },

    // ═══════════════════════════════════════════
    //  STEERING
    // ═══════════════════════════════════════════
    {
      slug: 'tie-rod-end-toyota',
      name: 'ראש מוט הגה טויוטה קורולה',
      desc: 'ראש מוט הגה חיצוני. OEM: 45046-09790.',
      catSlug: 'steering',
      skus: [
        { brand: 'trw', pn: 'JTE1590', price: 125, stock: 20, warranty: 24 },
        { brand: 'febi', pn: '41045', price: 95, stock: 28, warranty: 12 },
      ],
      fits: v('toyota-corolla', 'toyota-corolla-cross'),
    },

    // ═══════════════════════════════════════════
    //  AC SYSTEM
    // ═══════════════════════════════════════════
    {
      slug: 'ac-compressor-toyota',
      name: 'מדחס מזגן טויוטה קורולה',
      desc: 'מדחס מיזוג אוויר. OEM: 88310-02870.',
      catSlug: 'ac-system',
      skus: [
        { brand: 'denso', pn: 'DCP50321', price: 2150, stock: 3, warranty: 24, tier: 'original' },
        { brand: 'valeo', pn: '813163', price: 1790, stock: 5, warranty: 24 },
      ],
      fits: v('toyota-corolla', 'toyota-corolla-cross'),
    },

    // ═══════════════════════════════════════════
    //  TRANSMISSION
    // ═══════════════════════════════════════════
    {
      slug: 'clutch-kit-hyundai',
      name: 'ערכת מצמד יונדאי i20/i30',
      desc: 'ערכת מצמד 3 חלקים: דיסק + כיסוי + מסב. OEM: 41100-26010.',
      catSlug: 'transmission',
      skus: [
        { brand: 'valeo', pn: '826940', price: 845, stock: 6, warranty: 24, tier: 'original' },
        { brand: 'sachs', pn: '3000 954 530', price: 920, stock: 4, warranty: 36, tier: 'original' },
      ],
      fits: v('hyundai-i20', 'hyundai-i30', 'kia-picanto'),
    },

    // ═══════════════════════════════════════════════════════════════
    //  POWER TOOLS — Pressure Washers
    // ═══════════════════════════════════════════════════════════════
    {
      slug: 'pressure-washer-makita-hw1300',
      name: 'מכונת שטיפה בלחץ Makita HW1300',
      desc: 'מכונת שטיפה ביתית 1800W, 130 בר, ספיקה 420 ליטר/שעה. כולל לאנס ואקדח.',
      catSlug: 'pressure-washers', featured: true,
      skus: [
        { brand: 'makita', pn: 'HW1300', price: 890, stock: 12, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'pressure-washer-bosch-aqt3513',
      name: 'מכונת שטיפה Bosch AQT 35-12+',
      desc: 'מכונת שטיפה ביתית 1500W, 120 בר. קלה ונוחה לשימוש.',
      catSlug: 'pressure-washers',
      skus: [
        { brand: 'bosch-tools', pn: 'AQT35-12', price: 650, stock: 15, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'pressure-washer-makita-hw1400h',
      name: 'מכונת שטיפה מקצועית Makita HW1400H',
      desc: 'מכונת שטיפה מקצועית 2300W, 140 בר, 500 ליטר/שעה. מנוע אינדוקציה.',
      catSlug: 'pressure-washers',
      skus: [
        { brand: 'makita', pn: 'HW1400H', price: 1490, stock: 6, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'pressure-washer-total-130bar',
      name: 'מכונת שטיפה Total 130 בר',
      desc: 'מכונת שטיפה ביתית 1500W. יחס ערך-מחיר מצוין.',
      catSlug: 'pressure-washers',
      skus: [
        { brand: 'total', pn: 'TGT11236', price: 390, stock: 20, warranty: 12 },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  POWER TOOLS — Air Compressors
    // ═══════════════════════════════════════════
    {
      slug: 'air-compressor-makita-ac1300',
      name: 'מדחס אוויר Makita AC1300 24 ליטר',
      desc: 'מדחס ללא שמן 24 ליטר, 2HP, 8 בר. שקט במיוחד.',
      catSlug: 'air-compressors',
      skus: [
        { brand: 'makita', pn: 'AC1300', price: 1250, stock: 5, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'air-compressor-total-50l',
      name: 'מדחס אוויר Total 50 ליטר',
      desc: 'מדחס 50 ליטר, 2.5HP, עד 8 בר. כולל שסתום בטיחות.',
      catSlug: 'air-compressors',
      skus: [
        { brand: 'total', pn: 'TC1255002', price: 750, stock: 8, warranty: 12 },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  POWER TOOLS — Drills
    // ═══════════════════════════════════════════
    {
      slug: 'cordless-drill-makita-18v',
      name: 'מקדחה אלחוטית Makita 18V DDF484',
      desc: 'מקדחה/מברגה נטענת 18V LXT. כולל 2 סוללות 5.0Ah ומטען.',
      catSlug: 'drills', featured: true,
      skus: [
        { brand: 'makita', pn: 'DDF484RTJ', price: 1290, stock: 10, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'cordless-drill-dewalt-20v',
      name: 'מקדחה אלחוטית DeWalt 20V MAX',
      desc: 'מקדחה/מברגה נטענת 20V. כולל 2 סוללות 2.0Ah.',
      catSlug: 'drills',
      skus: [
        { brand: 'dewalt', pn: 'DCD777D2', price: 1150, stock: 8, warranty: 36 },
      ],
      fits: [],
    },
    {
      slug: 'cordless-drill-milwaukee-m18',
      name: 'מקדחה אלחוטית Milwaukee M18',
      desc: 'מקדחה/מברגה M18 FUEL. ביצועים מקצועיים, מנוע ללא פחמים.',
      catSlug: 'drills',
      skus: [
        { brand: 'milwaukee', pn: 'M18FDD2-502X', price: 1490, stock: 6, warranty: 36, tier: 'original' },
      ],
      fits: [],
    },
    {
      slug: 'hammer-drill-total',
      name: 'מקדחת פטיש Total 800W',
      desc: 'מקדחת פטיש חשמלית 800W 13mm. כולל ידית צד ומגביל עומק.',
      catSlug: 'drills',
      skus: [
        { brand: 'total', pn: 'TG108136', price: 195, stock: 22, warranty: 12 },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  POWER TOOLS — Grinders
    // ═══════════════════════════════════════════
    {
      slug: 'angle-grinder-makita-125mm',
      name: 'משחזת זווית Makita 125mm 720W',
      desc: 'משחזת זווית 125mm 720W. קלה וחזקה לשימוש יומיומי.',
      catSlug: 'grinders',
      skus: [
        { brand: 'makita', pn: '9558HNRG', price: 345, stock: 14, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'angle-grinder-dewalt-125mm',
      name: 'משחזת זווית DeWalt 125mm 1000W',
      desc: 'משחזת זווית 125mm 1000W. מנוע עוצמתי, מגן אוטומטי.',
      catSlug: 'grinders',
      skus: [
        { brand: 'dewalt', pn: 'DWE4206-QS', price: 395, stock: 10, warranty: 36 },
      ],
      fits: [],
    },
    {
      slug: 'angle-grinder-total-115mm',
      name: 'משחזת זווית Total 115mm 750W',
      desc: 'משחזת זווית ביתית 750W. יחס מחיר-ביצועים מעולה.',
      catSlug: 'grinders',
      skus: [
        { brand: 'total', pn: 'TG10711526', price: 129, stock: 25, warranty: 12 },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  POWER TOOLS — Saws
    // ═══════════════════════════════════════════
    {
      slug: 'circular-saw-makita-185mm',
      name: 'מסור עגול Makita 185mm 1600W',
      desc: 'מסור עגול חשמלי 185mm. עומק חיתוך 65mm ב-90°.',
      catSlug: 'saws',
      skus: [
        { brand: 'makita', pn: 'HS7601', price: 590, stock: 8, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'jigsaw-bosch-650w',
      name: 'מסור חרב Bosch GST 8000E',
      desc: 'מסור חרב 650W. חיתוך בעץ עד 80mm, במתכת עד 10mm.',
      catSlug: 'saws',
      skus: [
        { brand: 'bosch-tools', pn: 'GST8000E', price: 340, stock: 10, warranty: 24 },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  POWER TOOLS — Vacuums
    // ═══════════════════════════════════════════
    {
      slug: 'wet-dry-vacuum-makita-20l',
      name: 'שואב אבק רטוב/יבש Makita 20L',
      desc: 'שואב אבק תעשייתי רטוב/יבש 20 ליטר 1000W. סינון HEPA.',
      catSlug: 'vacuums',
      skus: [
        { brand: 'makita', pn: 'VC2012L', price: 520, stock: 8, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'wet-dry-vacuum-total-30l',
      name: 'שואב אבק רטוב/יבש Total 30L',
      desc: 'שואב אבק תעשייתי 30 ליטר 1200W.',
      catSlug: 'vacuums',
      skus: [
        { brand: 'total', pn: 'TVC14301', price: 285, stock: 14, warranty: 12 },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  HAND TOOLS
    // ═══════════════════════════════════════════
    {
      slug: 'socket-set-94pc',
      name: 'סט שקעים 94 חלקים 1/2" + 1/4"',
      desc: 'סט שקעים מקצועי כרום-ונדיום. כולל ראצ\'טים, מאריכים, מפתחות אלן.',
      catSlug: 'hand-tools',
      skus: [
        { brand: 'total', pn: 'THT141941', price: 225, stock: 18, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'torque-wrench-40-210nm',
      name: 'מפתח מומנט 40-210Nm 1/2"',
      desc: 'מפתח מומנט עם כיוון מדויק. חיוני להחלפת גלגלים.',
      catSlug: 'hand-tools',
      skus: [
        { brand: 'total', pn: 'THPTW200N2', price: 185, stock: 15, warranty: 24 },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  GARDEN — Brush Cutters
    // ═══════════════════════════════════════════
    {
      slug: 'brush-cutter-stihl-fs55',
      name: 'חרמש בנזין Stihl FS 55',
      desc: 'חרמש בנזין 27.2cc. קל משקל, אמין, מתאים לשימוש ביתי ומקצועי.',
      catSlug: 'brush-cutters', featured: true,
      skus: [
        { brand: 'stihl', pn: 'FS-55', price: 1290, stock: 8, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'brush-cutter-husqvarna-128r',
      name: 'חרמש בנזין Husqvarna 128R',
      desc: 'חרמש בנזין 28cc. מוט ישר, ציר כפול. מקצועי ועמיד.',
      catSlug: 'brush-cutters',
      skus: [
        { brand: 'husqvarna', pn: '128R', price: 1450, stock: 5, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'brush-cutter-makita-electric',
      name: 'חרמש חשמלי Makita UR3501',
      desc: 'חרמש חשמלי 1000W. שקט, ללא פליטה, תחזוקה מינימלית.',
      catSlug: 'brush-cutters',
      skus: [
        { brand: 'makita', pn: 'UR3501', price: 490, stock: 12, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'cutting-line-3mm',
      name: 'חוט חיתוך לחרמש 3mm × 15m',
      desc: 'חוט ניילון עגול 3mm. מתאים לרוב החרמשים.',
      catSlug: 'brush-cutters',
      skus: [
        { brand: 'stihl', pn: '0000-930-2344', price: 35, stock: 50, warranty: 0, tier: 'original' },
        { brand: 'husqvarna', pn: '544-08-79-01', price: 38, stock: 40, warranty: 0, tier: 'original' },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  GARDEN — Lawn Mowers
    // ═══════════════════════════════════════════
    {
      slug: 'lawn-mower-husqvarna-lc140',
      name: 'מכסחת דשא Husqvarna LC 140',
      desc: 'מכסחת דשא בנזין 40cm. מנוע Briggs & Stratton. כולל שק איסוף.',
      catSlug: 'lawn-mowers',
      skus: [
        { brand: 'husqvarna', pn: 'LC-140', price: 1650, stock: 4, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'lawn-mower-makita-electric-33cm',
      name: 'מכסחת דשא חשמלית Makita ELM3320',
      desc: 'מכסחת דשא חשמלית 1200W, רוחב חיתוך 33cm. ביתית ושקטה.',
      catSlug: 'lawn-mowers',
      skus: [
        { brand: 'makita', pn: 'ELM3320', price: 590, stock: 7, warranty: 24 },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  GARDEN — Chainsaws
    // ═══════════════════════════════════════════
    {
      slug: 'chainsaw-stihl-ms170',
      name: 'מסור שרשרת Stihl MS 170',
      desc: 'מסור שרשרת בנזין 30cc, מוט 35cm. מושלם לחיתוך עצים וגיזום.',
      catSlug: 'chainsaws',
      skus: [
        { brand: 'stihl', pn: 'MS-170', price: 1350, stock: 6, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'chainsaw-husqvarna-135',
      name: 'מסור שרשרת Husqvarna 135 Mark II',
      desc: 'מסור שרשרת בנזין 38cc, מוט 40cm. X-Torq לצריכת דלק נמוכה.',
      catSlug: 'chainsaws',
      skus: [
        { brand: 'husqvarna', pn: '135-MK2', price: 1590, stock: 4, warranty: 24 },
      ],
      fits: [],
    },

    // ═══════════════════════════════════════════
    //  GARDEN — Tools & Irrigation
    // ═══════════════════════════════════════════
    {
      slug: 'garden-tool-set-5pc',
      name: 'סט כלי גינון 5 חלקים Gardena',
      desc: 'סט כלי גינון: את קטנה, מגרפה, מעדר, מזמרה, כפפות.',
      catSlug: 'garden-tools',
      skus: [
        { brand: 'gardena', pn: '8965-20', price: 145, stock: 20, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'hose-reel-gardena-25m',
      name: 'סליל צינור אוטומטי Gardena 25m',
      desc: 'סליל צינור קיר עם איסוף אוטומטי 25m. כולל מחבר GARDENA.',
      catSlug: 'irrigation',
      skus: [
        { brand: 'gardena', pn: '8023-20', price: 345, stock: 10, warranty: 36 },
      ],
      fits: [],
    },
    {
      slug: 'sprinkler-gardena-oscillating',
      name: 'ממטרה מתנדנדת Gardena ZoomMaxx',
      desc: 'ממטרה מתנדנדת לגינות עד 216 מ"ר. כיוון דק של טווח ההשקיה.',
      catSlug: 'irrigation',
      skus: [
        { brand: 'gardena', pn: '8127-20', price: 89, stock: 25, warranty: 24 },
      ],
      fits: [],
    },
  ];

  // ── Seed all products ──
  for (let pos = 0; pos < partSeeds.length; pos++) {
    const ps = partSeeds[pos];
    const catId = catMap[ps.catSlug];
    if (!catId) { console.warn(`⚠️  Missing category: ${ps.catSlug}`); continue; }

    const product = await prisma.product.create({
      data: {
        slug: ps.slug,
        name: ps.name,
        description: ps.desc ?? null,
        categoryId: catId,
        images: ps.images ?? [],
        isFeatured: ps.featured ?? false,
        position: pos,
      },
    });

    // SKUs — batch create
    const skuData = ps.skus
      .filter(sc => brandMap[sc.brand])
      .map(sc => ({
        partNumber: sc.pn,
        productId: product.id,
        brandId: brandMap[sc.brand],
        tier: sc.tier ?? 'replacement',
        priceIls: sc.price,
        stock: sc.stock,
        warrantyMonths: sc.warranty,
        deliveryDays: sc.delivery ?? (sc.stock > 10 ? 1 : sc.stock > 0 ? 3 : 0),
      }));
    if (skuData.length > 0) await prisma.sku.createMany({ data: skuData });

    // Fitments — batch create
    const fitData = ps.fits.filter(Boolean).map(vehicleId => ({ productId: product.id, vehicleId }));
    if (fitData.length > 0) await prisma.fitment.createMany({ data: fitData, skipDuplicates: true });
  }
  console.log(`✅ ${partSeeds.length} products with SKUs + fitments`);

  // ══════════════════════════════════════════════════════════════════
  //  PHASE 5 — SETTINGS
  // ══════════════════════════════════════════════════════════════════
  const settings = [
    { key: 'store_name',       value: JSON.stringify('אבו אמין חלפים') },
    { key: 'store_tagline',    value: JSON.stringify("מס׳ 1 בכרמל · 30+ שנות ניסיון") },
    { key: 'store_phone',      value: JSON.stringify('04-8599333') },
    { key: 'store_mobile',     value: JSON.stringify('052-3158796') },
    { key: 'store_whatsapp',   value: JSON.stringify('972523158796') },
    { key: 'store_address',    value: JSON.stringify('כביש ראשי דלית עוספיא, מול אמל חשמל, עוספיה') },
    { key: 'vat_rate',         value: JSON.stringify(17) },
    { key: 'min_order_amount', value: JSON.stringify(0) },
    { key: 'delivery_price',   value: JSON.stringify(0) },
    { key: 'store_hours',      value: JSON.stringify('א׳-ה׳ 08:00-18:00 | ו׳ 08:00-14:00') },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✅ ${settings.length} settings`);

  // ── ADMIN PASSWORD ──
  const adminPass = process.env.ADMIN_PASSWORD ?? 'admin123';
  const hash = await bcrypt.hash(adminPass, 10);
  await prisma.setting.upsert({
    where: { key: 'admin_password_hash' },
    update: { value: JSON.stringify(hash) },
    create: { key: 'admin_password_hash', value: JSON.stringify(hash) },
  });
  console.log('✅ Admin password set');

  // ── SUMMARY ──
  const brandCount = allBrands.length;
  const catCount = catData.length + catChildren.length;
  const vehicleCount = vehicleData.length;
  const productCount = partSeeds.length;
  const skuCount = partSeeds.reduce((sum, p) => sum + p.skus.length, 0);
  const fitmentCount = partSeeds.reduce((sum, p) => sum + p.fits.length, 0);

  console.log(`
🎉 Seed complete!
   ${brandCount} brands (auto: ${autoBrands.length}, tools: ${toolBrands.length}, garden: ${gardenBrands.length})
   ${catCount} categories
   ${vehicleCount} vehicles (Israeli market 2015-2025)
   ${productCount} products
   ${skuCount} SKUs
   ${fitmentCount} fitment links
  `);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
