import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ── BRANDS ──────────────────────────────────────────────────────
  const brandData = [
    { slug: 'bosch',   name: 'Bosch',        country: '🇩🇪' },
    { slug: 'brembo',  name: 'Brembo',       country: '🇮🇹' },
    { slug: 'mann',    name: 'Mann-Filter',   country: '🇩🇪' },
    { slug: 'febi',    name: 'Febi Bilstein', country: '🇩🇪' },
    { slug: 'denso',   name: 'Denso',        country: '🇯🇵' },
    { slug: 'ngk',     name: 'NGK',          country: '🇯🇵' },
    { slug: 'valeo',   name: 'Valeo',        country: '🇫🇷' },
    { slug: 'sachs',   name: 'Sachs',        country: '🇩🇪' },
    { slug: 'hella',   name: 'Hella',        country: '🇩🇪' },
    { slug: 'mahle',   name: 'Mahle',        country: '🇩🇪' },
    { slug: 'akebono', name: 'Akebono',      country: '🇯🇵' },
    { slug: 'mobil1',  name: 'Mobil 1',      country: '🇺🇸' },
    { slug: 'castrol', name: 'Castrol',      country: '🇬🇧' },
    { slug: 'exide',   name: 'Exide',        country: '🇺🇸' },
    { slug: 'monroe',  name: 'Monroe',       country: '🇧🇪' },
  ];

  const brandMap: Record<number, number> = {}; // legacy ID → DB ID
  const legacyBrandIds = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

  for (let i = 0; i < brandData.length; i++) {
    const b = await prisma.brand.upsert({
      where: { slug: brandData[i].slug },
      update: {},
      create: brandData[i],
    });
    brandMap[legacyBrandIds[i]] = b.id;
  }
  console.log(`✅ ${brandData.length} brands`);

  // ── CATEGORIES (parent first, then children) ─────────────────────
  const catData = [
    { slug: 'brakes',            name: 'בלמים',                     icon: '🛞',  position: 1 },
    { slug: 'filters',           name: 'מסננים',                    icon: '🌀',  position: 2 },
    { slug: 'engine',            name: 'מנוע',                      icon: '⚙️', position: 3 },
    { slug: 'electrical',        name: 'חשמל',                      icon: '⚡', position: 4 },
    { slug: 'lighting',          name: 'תאורה',                     icon: '💡', position: 5 },
    { slug: 'cooling',           name: 'קירור',                     icon: '❄️', position: 6 },
    { slug: 'oils-fluids',       name: 'שמנים ונוזלים',             icon: '🛢️', position: 7 },
    { slug: 'transmission',      name: 'תיבת הילוכים',              icon: '🔧', position: 8 },
    { slug: 'exhaust',           name: 'פליטה',                     icon: '💨', position: 9 },
    { slug: 'body',              name: 'מרכב',                      icon: '🚗', position: 10 },
    { slug: 'tires-wheels',      name: 'צמיגים וגלגלים',            icon: '⚫', position: 11 },
    { slug: 'lighting-signals',  name: 'פנסים ואיתותים',            icon: '💡', position: 12 },
    { slug: 'bumpers-mirrors',   name: 'פגושים ומראות',             icon: '🪞', position: 13 },
    { slug: 'shocks-suspension', name: 'בולמי זעזועים ומתלים',     icon: '🔩', position: 14 },
    { slug: 'ac-system',         name: 'מערכת מיזוג',               icon: '❄️', position: 15 },
    { slug: 'batteries',         name: 'מצברים',                   icon: '🔋', position: 16 },
    { slug: 'tools-machines',    name: 'כלים ומכונות',              icon: '🔧', group: 'tools', position: 17 },
    { slug: 'garden',            name: 'גינה',                      icon: '🌿', group: 'garden', position: 18 },
  ];
  const catChildren = [
    { slug: 'pressure-washers', name: 'מכונות שטיפה בלחץ', icon: '💦',  parentSlug: 'tools-machines', position: 1 },
    { slug: 'steam-cleaners',   name: 'קיטורים',            icon: '♨️', parentSlug: 'tools-machines', position: 2 },
    { slug: 'air-compressors',  name: 'מדחסי אוויר',        icon: '💨', parentSlug: 'tools-machines', position: 3 },
    { slug: 'saws',             name: 'מסורי עץ',           icon: '🪚', parentSlug: 'tools-machines', position: 4 },
    { slug: 'vacuums',          name: 'שואבי אבק',           icon: '🌀', parentSlug: 'tools-machines', position: 5 },
    { slug: 'hand-tools',       name: 'כלי עבודה',           icon: '🔨', parentSlug: 'tools-machines', position: 6 },
    { slug: 'brush-cutters',    name: 'חרמשים משולבים',      icon: '🌾', parentSlug: 'garden', position: 1 },
    { slug: 'garden-tools',     name: 'כלי גינון',           icon: '🌱', parentSlug: 'garden', position: 2 },
    { slug: 'lawn-mowers',      name: 'מכסחות דשא',          icon: '🏡', parentSlug: 'garden', position: 3 },
  ];

  const catMap: Record<string, number> = {};

  for (const c of catData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { slug: c.slug, name: c.name, icon: c.icon, position: c.position, group: (c as { group?: string }).group },
    });
    catMap[c.slug] = cat.id;
  }
  for (const c of catChildren) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug, name: c.name, icon: c.icon, position: c.position,
        parentId: catMap[c.parentSlug],
      },
    });
    catMap[c.slug] = cat.id;
  }
  console.log(`✅ ${catData.length + catChildren.length} categories`);

  // ── VEHICLES ─────────────────────────────────────────────────────
  type VehicleInput = { make: string; makeHe: string; model: string; modelHe: string; year: number; engine: string };
  const vehicleData: VehicleInput[] = [
    // Toyota
    { make: 'toyota', makeHe: 'טויוטה', model: 'corolla', modelHe: 'קורולה',    year: 2018, engine: '1.6L' },
    { make: 'toyota', makeHe: 'טויוטה', model: 'corolla', modelHe: 'קורולה',    year: 2019, engine: '1.6L' },
    { make: 'toyota', makeHe: 'טויוטה', model: 'corolla', modelHe: 'קורולה',    year: 2020, engine: '1.8L Hybrid' },
    { make: 'toyota', makeHe: 'טויוטה', model: 'corolla', modelHe: 'קורולה',    year: 2021, engine: '1.8L Hybrid' },
    { make: 'toyota', makeHe: 'טויוטה', model: 'corolla', modelHe: 'קורולה',    year: 2022, engine: '1.8L Hybrid' },
    { make: 'toyota', makeHe: 'טויוטה', model: 'camry',   modelHe: 'קאמרי',     year: 2018, engine: '2.5L' },
    { make: 'toyota', makeHe: 'טויוטה', model: 'camry',   modelHe: 'קאמרי',     year: 2019, engine: '2.5L' },
    { make: 'toyota', makeHe: 'טויוטה', model: 'camry',   modelHe: 'קאמרי',     year: 2020, engine: '2.5L Hybrid' },
    { make: 'toyota', makeHe: 'טויוטה', model: 'rav4',    modelHe: 'RAV4',      year: 2018, engine: '2.0L' },
    { make: 'toyota', makeHe: 'טויוטה', model: 'rav4',    modelHe: 'RAV4',      year: 2020, engine: '2.5L Hybrid' },
    // Hyundai
    { make: 'hyundai', makeHe: 'יונדאי', model: 'i20',    modelHe: 'i20',       year: 2018, engine: '1.4L' },
    { make: 'hyundai', makeHe: 'יונדאי', model: 'i20',    modelHe: 'i20',       year: 2019, engine: '1.4L' },
    { make: 'hyundai', makeHe: 'יונדאי', model: 'i20',    modelHe: 'i20',       year: 2020, engine: '1.0L Turbo' },
    { make: 'hyundai', makeHe: 'יונדאי', model: 'i30',    modelHe: 'i30',       year: 2018, engine: '1.4L Turbo' },
    { make: 'hyundai', makeHe: 'יונדאי', model: 'i30',    modelHe: 'i30',       year: 2020, engine: '1.4L Turbo' },
    { make: 'hyundai', makeHe: 'יונדאי', model: 'tucson', modelHe: 'טוסון',     year: 2019, engine: '2.0L' },
    { make: 'hyundai', makeHe: 'יונדאי', model: 'tucson', modelHe: 'טוסון',     year: 2021, engine: '1.6L Hybrid' },
    { make: 'hyundai', makeHe: 'יונדאי', model: 'ioniq',  modelHe: 'איוניק',    year: 2018, engine: '1.6L Hybrid' },
    // Kia
    { make: 'kia', makeHe: 'קיה', model: 'picanto',   modelHe: 'פיקנטו',        year: 2019, engine: '1.0L' },
    { make: 'kia', makeHe: 'קיה', model: 'picanto',   modelHe: 'פיקנטו',        year: 2020, engine: '1.2L' },
    { make: 'kia', makeHe: 'קיה', model: 'sportage',  modelHe: "ספורטאז'",      year: 2018, engine: '1.6L Turbo' },
    { make: 'kia', makeHe: 'קיה', model: 'sportage',  modelHe: "ספורטאז'",      year: 2020, engine: '1.6L Turbo' },
    { make: 'kia', makeHe: 'קיה', model: 'niro',      modelHe: 'נירו',          year: 2021, engine: '1.6L Hybrid' },
    // Mazda
    { make: 'mazda', makeHe: 'מאזדה', model: 'mazda3', modelHe: 'מאזדה 3',      year: 2018, engine: '1.5L' },
    { make: 'mazda', makeHe: 'מאזדה', model: 'mazda3', modelHe: 'מאזדה 3',      year: 2020, engine: '2.0L' },
    { make: 'mazda', makeHe: 'מאזדה', model: 'cx5',    modelHe: 'CX-5',         year: 2019, engine: '2.0L' },
    // Skoda
    { make: 'skoda', makeHe: 'סקודה', model: 'octavia', modelHe: 'אוקטביה',     year: 2018, engine: '1.4L TSI' },
    { make: 'skoda', makeHe: 'סקודה', model: 'octavia', modelHe: 'אוקטביה',     year: 2020, engine: '1.5L TSI' },
    { make: 'skoda', makeHe: 'סקודה', model: 'kodiaq',  modelHe: 'קודיאק',      year: 2019, engine: '2.0L TSI' },
    // VW
    { make: 'vw', makeHe: 'פולקסווגן', model: 'golf',    modelHe: 'גולף',       year: 2018, engine: '1.4L TSI' },
    { make: 'vw', makeHe: 'פולקסווגן', model: 'golf',    modelHe: 'גולף',       year: 2020, engine: '1.5L TSI' },
    { make: 'vw', makeHe: 'פולקסווגן', model: 'tiguan',  modelHe: 'טיגואן',     year: 2019, engine: '2.0L TSI' },
    // Mitsubishi
    { make: 'mitsubishi', makeHe: 'מיצובישי', model: 'outlander', modelHe: 'אאוטלנדר', year: 2018, engine: '2.4L PHEV' },
    { make: 'mitsubishi', makeHe: 'מיצובישי', model: 'outlander', modelHe: 'אאוטלנדר', year: 2019, engine: '2.4L PHEV' },
    // Honda
    { make: 'honda', makeHe: 'הונדה', model: 'civic', modelHe: 'סיוויק',        year: 2018, engine: '1.5L Turbo' },
    { make: 'honda', makeHe: 'הונדה', model: 'civic', modelHe: 'סיוויק',        year: 2020, engine: '1.5L Turbo' },
    { make: 'honda', makeHe: 'הונדה', model: 'crv',   modelHe: 'CR-V',          year: 2019, engine: '1.5L Turbo' },
    // Nissan
    { make: 'nissan', makeHe: 'ניסאן', model: 'qashqai', modelHe: 'קשקאי',      year: 2018, engine: '1.2L Turbo' },
    { make: 'nissan', makeHe: 'ניסאן', model: 'qashqai', modelHe: 'קשקאי',      year: 2020, engine: '1.3L Turbo' },
    { make: 'nissan', makeHe: 'ניסאן', model: 'micra',   modelHe: 'מיקרה',      year: 2019, engine: '1.0L' },
    // BMW
    { make: 'bmw', makeHe: 'ב.מ.וו', model: '320i', modelHe: '320i',            year: 2018, engine: '2.0L Turbo' },
    { make: 'bmw', makeHe: 'ב.מ.וו', model: '320i', modelHe: '320i',            year: 2020, engine: '2.0L Turbo' },
    { make: 'bmw', makeHe: 'ב.מ.וו', model: 'x3',   modelHe: 'X3',             year: 2019, engine: '2.0L Turbo' },
    // Mercedes
    { make: 'mercedes', makeHe: 'מרצדס', model: 'c200', modelHe: 'C200',        year: 2018, engine: '1.5L Turbo' },
    { make: 'mercedes', makeHe: 'מרצדס', model: 'c200', modelHe: 'C200',        year: 2020, engine: '1.5L Turbo' },
  ];

  // Map legacy vehicle index (1-45) → DB ID
  const vehicleIds: number[] = [];
  for (const vd of vehicleData) {
    const v = await prisma.vehicle.upsert({
      where: { make_model_year_engine: { make: vd.make, model: vd.model, year: vd.year, engine: vd.engine } },
      update: {},
      create: vd,
    });
    vehicleIds.push(v.id);
  }
  console.log(`✅ ${vehicleData.length} vehicles`);

  // Helper: legacy vehicle indices to DB IDs
  // Legacy IDs 1-45 correspond to vehicleIds[0..44]
  function vids(...legacyOnes: number[]): number[] {
    return legacyOnes.map(i => vehicleIds[i - 1]).filter(Boolean);
  }

  const TOY_COROLLA = vids(1,2,3,4,5);
  const TOY_CAMRY   = vids(6,7,8);
  const TOY_RAV4    = vids(9,10);
  const HYU_I20     = vids(11,12,13);
  const HYU_I30     = vids(14,15);
  const HYU_TUCSON  = vids(16,17);
  const KIA_SPORTAGE= vids(21,22);
  const SKO_OCT     = vids(27,28);
  const VW_GOLF     = vids(30,31);
  const HON_CIVIC   = vids(35,36);

  // ── PRODUCTS + SKUS + FITMENTS ───────────────────────────────────
  type SkuCfg = { brandId: number; pn: string; price: number; stock: number; warranty: number; tier?: 'original'|'replacement'; delivery?: number };
  type PartSeed = {
    slug: string; name: string; catSlug: string; images?: string[];
    skus: SkuCfg[]; fits: number[]; featured?: boolean;
  };

  const partSeeds: PartSeed[] = [
    // BRAKES
    {
      slug: 'front-brake-pads-corolla', name: 'רפידות בלם קדמיות', catSlug: 'brakes', featured: true,
      skus: [
        { brandId: 1, pn: '0986494614', price: 189, stock: 23, warranty: 24 },
        { brandId: 2, pn: 'P83144',     price: 245, stock: 12, warranty: 24 },
        { brandId: 11,pn: 'AN-731WK',   price: 219, stock: 18, warranty: 18 },
        { brandId: 4, pn: '16623',      price: 165, stock: 31, warranty: 12 },
      ],
      fits: [...TOY_COROLLA, vids(35,36)[0], vids(35,36)[1]].filter(Boolean),
    },
    {
      slug: 'rear-brake-pads-corolla', name: 'רפידות בלם אחוריות', catSlug: 'brakes',
      skus: [
        { brandId: 1, pn: '0986494615', price: 159, stock: 19, warranty: 24 },
        { brandId: 2, pn: 'P83145',     price: 215, stock: 8,  warranty: 24 },
        { brandId: 4, pn: '16624',      price: 135, stock: 27, warranty: 12 },
      ],
      fits: TOY_COROLLA,
    },
    {
      slug: 'front-brake-discs-camry', name: 'דיסקי בלם קדמיים', catSlug: 'brakes',
      skus: [
        { brandId: 1, pn: '0986479R98',  price: 389, stock: 11, warranty: 24 },
        { brandId: 2, pn: '09.A532.11',  price: 525, stock: 6,  warranty: 24 },
      ],
      fits: TOY_CAMRY,
    },
    {
      slug: 'front-brake-pads-i30', name: 'רפידות בלם קדמיות i30', catSlug: 'brakes',
      skus: [
        { brandId: 1, pn: '0986494690', price: 175, stock: 22, warranty: 24 },
        { brandId: 4, pn: '16725',      price: 145, stock: 28, warranty: 12 },
        { brandId: 11,pn: 'AN-841WK',   price: 199, stock: 14, warranty: 18 },
      ],
      fits: [...HYU_I30, ...HYU_TUCSON],
    },
    // FILTERS
    {
      slug: 'oil-filter-corolla', name: 'מסנן שמן', catSlug: 'filters', featured: true,
      skus: [
        { brandId: 3, pn: 'W 68/3',           price: 39, stock: 87, warranty: 6 },
        { brandId: 1, pn: 'F 026 407 023',     price: 35, stock: 65, warranty: 6 },
        { brandId: 10,pn: 'OX 339D',           price: 42, stock: 43, warranty: 6 },
      ],
      fits: [...TOY_COROLLA, ...TOY_RAV4],
    },
    {
      slug: 'air-filter-corolla', name: 'מסנן אוויר', catSlug: 'filters',
      skus: [
        { brandId: 3, pn: 'C 27 145',         price: 65, stock: 54, warranty: 6 },
        { brandId: 1, pn: 'F 026 400 535',    price: 58, stock: 38, warranty: 6 },
      ],
      fits: TOY_COROLLA,
    },
    {
      slug: 'cabin-filter-corolla', name: 'מסנן מזגן (תא נוסעים)', catSlug: 'filters',
      skus: [
        { brandId: 3, pn: 'CUK 26 009',       price: 79, stock: 45, warranty: 6 },
        { brandId: 1, pn: '1 987 432 384',    price: 72, stock: 52, warranty: 6 },
      ],
      fits: [...TOY_COROLLA, ...TOY_CAMRY],
    },
    {
      slug: 'fuel-filter-i30', name: 'מסנן דלק', catSlug: 'filters',
      skus: [
        { brandId: 3, pn: 'WK 5006',          price: 95, stock: 32, warranty: 6 },
        { brandId: 1, pn: 'F 026 402 855',    price: 88, stock: 29, warranty: 6 },
      ],
      fits: [...HYU_I20, ...HYU_I30],
    },
    // ENGINE
    {
      slug: 'spark-plugs-corolla', name: 'מצתים (סט 4)', catSlug: 'engine', featured: true,
      skus: [
        { brandId: 6, pn: 'ILKR7E11',         price: 165, stock: 78, warranty: 12 },
        { brandId: 5, pn: 'FK20HR11',         price: 189, stock: 45, warranty: 24 },
        { brandId: 1, pn: '0242235668',       price: 145, stock: 56, warranty: 12 },
      ],
      fits: TOY_COROLLA,
    },
    {
      slug: 'timing-belt-kit-octavia', name: 'ערכת רצועת תזמון', catSlug: 'engine',
      skus: [
        { brandId: 4, pn: '30899',             price: 489, stock: 8, warranty: 24 },
        { brandId: 1, pn: '1 987 948 942',    price: 545, stock: 5, warranty: 24 },
      ],
      fits: SKO_OCT,
    },
    // SUSPENSION
    {
      slug: 'front-shocks-corolla', name: 'בולמי זעזועים קדמיים', catSlug: 'shocks-suspension', featured: true,
      skus: [
        { brandId: 15,pn: 'G7390',            price: 425, stock: 14, warranty: 24 },
        { brandId: 8, pn: '313 462',          price: 489, stock: 9,  warranty: 36 },
      ],
      fits: TOY_COROLLA,
    },
    {
      slug: 'rear-shocks-corolla', name: 'בולמי זעזועים אחוריים', catSlug: 'shocks-suspension',
      skus: [
        { brandId: 15,pn: '23877',            price: 365, stock: 12, warranty: 24 },
        { brandId: 8, pn: '311 525',          price: 415, stock: 7,  warranty: 36 },
      ],
      fits: TOY_COROLLA,
    },
    // ELECTRICAL
    {
      slug: 'battery-70ah', name: 'מצבר 70Ah', catSlug: 'electrical', featured: true,
      skus: [
        { brandId: 14,pn: 'EA770',            price: 489, stock: 25, warranty: 36 },
        { brandId: 1, pn: 'S4 008',           price: 525, stock: 18, warranty: 36 },
      ],
      fits: [...TOY_COROLLA, ...HYU_I30, ...VW_GOLF, ...HON_CIVIC],
    },
    {
      slug: 'alternator-corolla', name: 'אלטרנטור', catSlug: 'electrical',
      skus: [
        { brandId: 5, pn: 'DAN1095',          price: 1290, stock: 4, warranty: 24 },
        { brandId: 1, pn: '0 124 525 198',   price: 1450, stock: 3, warranty: 24 },
      ],
      fits: TOY_COROLLA,
    },
    // LIGHTING
    {
      slug: 'headlight-bulb-h7', name: 'נורת פנס H7', catSlug: 'lighting', featured: true,
      skus: [
        { brandId: 9, pn: '8GH 007 157-121', price: 45, stock: 124, warranty: 12 },
        { brandId: 7, pn: '032508',          price: 39, stock: 145, warranty: 12 },
      ],
      fits: [...TOY_COROLLA, ...HYU_I20, ...VW_GOLF, ...SKO_OCT],
    },
    // COOLING
    {
      slug: 'radiator-corolla', name: 'רדיאטור', catSlug: 'cooling',
      skus: [
        { brandId: 4, pn: '172890',           price: 685, stock: 6, warranty: 24 },
        { brandId: 1, pn: '0 986 478 142',   price: 745, stock: 4, warranty: 24 },
      ],
      fits: TOY_COROLLA,
    },
    {
      slug: 'thermostat-corolla', name: 'תרמוסטט', catSlug: 'cooling',
      skus: [
        { brandId: 4, pn: '18289',            price: 89, stock: 32, warranty: 12 },
        { brandId: 1, pn: '1 987 949 950',   price: 105, stock: 21, warranty: 12 },
      ],
      fits: TOY_COROLLA,
    },
    // OILS & FLUIDS
    {
      slug: 'engine-oil-5w30-4l', name: 'שמן מנוע 5W-30 (4 ליטר)', catSlug: 'oils-fluids', featured: true,
      skus: [
        { brandId: 12,pn: 'Mobil1-ESP-5W30-4L', price: 195, stock: 89, warranty: 0 },
        { brandId: 13,pn: 'Edge-5W30-4L',       price: 175, stock: 102, warranty: 0 },
      ],
      fits: [...TOY_COROLLA, ...TOY_CAMRY, ...HYU_I30, ...VW_GOLF, ...HON_CIVIC, ...SKO_OCT],
    },
    {
      slug: 'brake-fluid-dot4', name: 'נוזל בלמים DOT 4 (1 ליטר)', catSlug: 'oils-fluids',
      skus: [
        { brandId: 1, pn: '1 987 479 107',   price: 45, stock: 156, warranty: 0 },
      ],
      fits: [...TOY_COROLLA, ...TOY_CAMRY, ...HYU_I30, ...VW_GOLF],
    },
    // EXHAUST
    {
      slug: 'muffler-corolla', name: 'מחנק (סיילנסר)', catSlug: 'exhaust',
      skus: [
        { brandId: 7, pn: '740120',           price: 545, stock: 7, warranty: 24 },
      ],
      fits: TOY_COROLLA,
    },
    // PRESSURE WASHERS
    {
      slug: 'pressure-washer-1500w', name: 'מכונת שטיפה בלחץ 1500W', catSlug: 'pressure-washers',
      skus: [
        { brandId: 1, pn: 'PW-1500-EU',       price: 590, stock: 8,  warranty: 12 },
        { brandId: 9, pn: 'HE-PW150',         price: 650, stock: 5,  warranty: 12 },
      ],
      fits: [],
    },
    {
      slug: 'pressure-washer-2200w', name: 'מכונת שטיפה בלחץ 2200W מקצועית', catSlug: 'pressure-washers',
      skus: [
        { brandId: 1, pn: 'PW-2200-PRO',      price: 980, stock: 4,  warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'pressure-washer-foam-lance', name: 'צינור קצף למכונת שטיפה', catSlug: 'pressure-washers',
      skus: [
        { brandId: 4, pn: 'FL-15MM',          price: 89,  stock: 22, warranty: 6 },
        { brandId: 9, pn: 'HE-FL01',          price: 110, stock: 14, warranty: 6 },
      ],
      fits: [],
    },
    // AIR COMPRESSORS
    {
      slug: 'air-compressor-24l', name: 'מדחס אוויר 24 ליטר 2HP', catSlug: 'air-compressors',
      skus: [{ brandId: 4, pn: 'AC-24L-2HP', price: 750, stock: 6, warranty: 12 }],
      fits: [],
    },
    {
      slug: 'air-compressor-50l', name: 'מדחס אוויר 50 ליטר 3HP', catSlug: 'air-compressors',
      skus: [
        { brandId: 4, pn: 'AC-50L-3HP', price: 1150, stock: 3, warranty: 12 },
        { brandId: 1, pn: 'BS-AC50',    price: 1290, stock: 2, warranty: 24 },
      ],
      fits: [],
    },
    {
      slug: 'tire-inflator-kit', name: 'ערכת ניפוח צמיגים + מד לחץ', catSlug: 'air-compressors',
      skus: [{ brandId: 1, pn: 'TI-SET-01', price: 145, stock: 18, warranty: 12 }],
      fits: [],
    },
    // SAWS
    {
      slug: 'circular-saw-1200w', name: 'מסור עגול חשמלי 1200W', catSlug: 'saws',
      skus: [{ brandId: 1, pn: 'CS-1200-185', price: 420, stock: 7, warranty: 24 }],
      fits: [],
    },
    {
      slug: 'chainsaw-petrol-40cc', name: 'מסור שרשרת בנזין 40cc', catSlug: 'saws',
      skus: [{ brandId: 4, pn: 'CHS-40CC', price: 890, stock: 4, warranty: 12 }],
      fits: [],
    },
    {
      slug: 'jigsaw-650w', name: 'מסור חרב חשמלי 650W', catSlug: 'saws',
      skus: [
        { brandId: 1, pn: 'JS-650-65',  price: 285, stock: 9, warranty: 24 },
        { brandId: 9, pn: 'HE-JS65',    price: 310, stock: 6, warranty: 12 },
      ],
      fits: [],
    },
    // VACUUMS
    {
      slug: 'wet-dry-vacuum-20l', name: 'שואב אבק רטוב/יבש 20 ליטר', catSlug: 'vacuums',
      skus: [{ brandId: 9, pn: 'HE-WDV20', price: 320, stock: 11, warranty: 12 }],
      fits: [],
    },
    {
      slug: 'industrial-vacuum-30l', name: 'שואב אבק תעשייתי 30 ליטר', catSlug: 'vacuums',
      skus: [{ brandId: 1, pn: 'BS-IV30', price: 480, stock: 5, warranty: 24 }],
      fits: [],
    },
    // HAND TOOLS
    {
      slug: 'socket-set-108pc', name: 'סט שקעים 108 חלקים', catSlug: 'hand-tools',
      skus: [{ brandId: 4, pn: 'SS-108-PRO', price: 195, stock: 14, warranty: 24 }],
      fits: [],
    },
    {
      slug: 'cordless-drill-18v', name: 'מקדחה אלחוטית 18V', catSlug: 'hand-tools',
      skus: [{ brandId: 1, pn: 'CD-18V-2AH', price: 390, stock: 8, warranty: 24 }],
      fits: [],
    },
    {
      slug: 'angle-grinder-125mm', name: 'גריינדר זווית 125mm 1000W', catSlug: 'hand-tools',
      skus: [
        { brandId: 1, pn: 'AG-125-1000', price: 179, stock: 16, warranty: 12 },
        { brandId: 9, pn: 'HE-AG125',    price: 155, stock: 10, warranty: 12 },
      ],
      fits: [],
    },
    // BRUSH CUTTERS
    {
      slug: 'brush-cutter-45cc', name: 'חרמש משולב בנזין 45cc', catSlug: 'brush-cutters',
      skus: [{ brandId: 4, pn: 'BC-45CC-TAP', price: 780, stock: 5, warranty: 12 }],
      fits: [],
    },
    {
      slug: 'brush-cutter-electric-1200w', name: 'חרמש חשמלי 1200W', catSlug: 'brush-cutters',
      skus: [{ brandId: 1, pn: 'BC-E1200', price: 340, stock: 7, warranty: 24 }],
      fits: [],
    },
    {
      slug: 'cutting-line-3mm', name: 'חוט חיתוך לחרמש 3mm × 15m', catSlug: 'brush-cutters',
      skus: [{ brandId: 4, pn: 'CL-3MM-15M', price: 32, stock: 45, warranty: 0 }],
      fits: [],
    },
    // GARDEN TOOLS
    {
      slug: 'garden-tool-set-5pc', name: 'סט כלי גינון 5 חלקים', catSlug: 'garden-tools',
      skus: [{ brandId: 4, pn: 'GT-SET-5', price: 89, stock: 18, warranty: 12 }],
      fits: [],
    },
    {
      slug: 'wheelbarrow-65l', name: 'עגלת גינה 65 ליטר', catSlug: 'garden-tools',
      skus: [{ brandId: 4, pn: 'WB-65L-ST', price: 210, stock: 6, warranty: 12 }],
      fits: [],
    },
    {
      slug: 'hose-reel-20m', name: 'סליל צינור 20 מטר', catSlug: 'garden-tools',
      skus: [{ brandId: 9, pn: 'HR-20M-AUTO', price: 120, stock: 12, warranty: 12 }],
      fits: [],
    },
    // LAWN MOWERS
    {
      slug: 'lawn-mower-petrol-46cm', name: 'מכסחת דשא בנזין 46cm', catSlug: 'lawn-mowers',
      skus: [{ brandId: 4, pn: 'LM-46-P140', price: 1450, stock: 3, warranty: 24 }],
      fits: [],
    },
    {
      slug: 'lawn-mower-electric-32cm', name: 'מכסחת דשא חשמלית 32cm', catSlug: 'lawn-mowers',
      skus: [{ brandId: 1, pn: 'LM-32-E1200', price: 520, stock: 5, warranty: 24 }],
      fits: [],
    },
  ];

  for (let pos = 0; pos < partSeeds.length; pos++) {
    const ps = partSeeds[pos];
    const catId = catMap[ps.catSlug];
    if (!catId) { console.warn(`Missing category: ${ps.catSlug}`); continue; }

    const product = await prisma.product.upsert({
      where: { slug: ps.slug },
      update: { isFeatured: ps.featured ?? false },
      create: {
        slug: ps.slug,
        name: ps.name,
        categoryId: catId,
        images: [],
        isFeatured: ps.featured ?? false,
        position: pos,
      },
    });

    // SKUs
    for (const sc of ps.skus) {
      const dbBrandId = brandMap[sc.brandId];
      if (!dbBrandId) { console.warn(`Missing brand id: ${sc.brandId}`); continue; }
      const deliveryDays = sc.delivery ?? (sc.stock > 10 ? 1 : sc.stock > 0 ? 3 : 0);
      await prisma.sku.upsert({
        where: { partNumber: sc.pn },
        update: { priceIls: sc.price, stock: sc.stock },
        create: {
          partNumber: sc.pn,
          productId: product.id,
          brandId: dbBrandId,
          tier: sc.tier ?? 'replacement',
          priceIls: sc.price,
          stock: sc.stock,
          warrantyMonths: sc.warranty,
          deliveryDays,
        },
      });
    }

    // Fitments
    for (const vehicleId of ps.fits) {
      if (!vehicleId) continue;
      await prisma.fitment.upsert({
        where: { productId_vehicleId: { productId: product.id, vehicleId } },
        update: {},
        create: { productId: product.id, vehicleId },
      });
    }
  }
  console.log(`✅ ${partSeeds.length} products with SKUs + fitments`);

  // ── SETTINGS ─────────────────────────────────────────────────────
  const settings = [
    { key: 'store_name',       value: JSON.stringify('אבו אמין חלפים') },
    { key: 'store_tagline',    value: JSON.stringify("מס׳ 1 בכרמל") },
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

  // ── ADMIN PASSWORD ─────────────────────────────────────────────────
  const adminPass = process.env.ADMIN_PASSWORD ?? 'admin123';
  const hash = await bcrypt.hash(adminPass, 10);
  await prisma.setting.upsert({
    where: { key: 'admin_password_hash' },
    update: { value: JSON.stringify(hash) },
    create: { key: 'admin_password_hash', value: JSON.stringify(hash) },
  });
  console.log('✅ Admin password set');

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
