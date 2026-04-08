// Mock seed data for Abu Amin Spare Parts demo
// Realistic structure mirroring the production schema (lib/db when DB is added)

import type { Locale } from "./i18n";
import { getAllVehicles, getUniqueMakes as getMakesFromVehicles, getYearsForMake, getModelsForMakeYear, getEnginesForMakeYearModel, getVehicleById } from "./vehicles";

export type LocalizedString = Record<Locale, string>;

export interface Vehicle {
  id: number;
  year: number;
  makeSlug: string;
  makeName: LocalizedString;
  modelSlug: string;
  modelName: LocalizedString;
  engine: string;
  trim?: string;
  image: string;
}

export interface Brand {
  id: number;
  slug: string;
  name: string;
  country: string;
  logo: string; // emoji or text fallback
}

export interface Category {
  id: number;
  slug: string;
  name: LocalizedString;
  icon: string; // emoji
  parentId?: number;
}

export interface Sku {
  id: number;
  brandId: number;
  partNumber: string;
  priceIls: number; // in ILS, not agorot for demo simplicity
  stock: number;
  warrantyMonths: number;
  image: string;
}

export interface Part {
  id: number;
  categoryId: number;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  oemNumbers: string[];
  position?: string;
  specs: Record<string, string>;
  installVideoId?: string; // YouTube ID
  fitsVehicleIds: number[];
  skus: Sku[];
  image: string;
}

export interface Kit {
  id: number;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  kitType: string;
  fitsVehicleIds: number[];
  partIds: number[];
  totalPriceIls: number;
  discountPct: number;
  image: string;
}

// ============================================================
// BRANDS
// ============================================================
export const brands: Brand[] = [
  { id: 1, slug: "bosch", name: "Bosch", country: "DE", logo: "🇩🇪" },
  { id: 2, slug: "brembo", name: "Brembo", country: "IT", logo: "🇮🇹" },
  { id: 3, slug: "mann", name: "Mann-Filter", country: "DE", logo: "🇩🇪" },
  { id: 4, slug: "febi", name: "Febi Bilstein", country: "DE", logo: "🇩🇪" },
  { id: 5, slug: "denso", name: "Denso", country: "JP", logo: "🇯🇵" },
  { id: 6, slug: "ngk", name: "NGK", country: "JP", logo: "🇯🇵" },
  { id: 7, slug: "valeo", name: "Valeo", country: "FR", logo: "🇫🇷" },
  { id: 8, slug: "sachs", name: "Sachs", country: "DE", logo: "🇩🇪" },
  { id: 9, slug: "hella", name: "Hella", country: "DE", logo: "🇩🇪" },
  { id: 10, slug: "mahle", name: "Mahle", country: "DE", logo: "🇩🇪" },
  { id: 11, slug: "akebono", name: "Akebono", country: "JP", logo: "🇯🇵" },
  { id: 12, slug: "mobil1", name: "Mobil 1", country: "US", logo: "🇺🇸" },
  { id: 13, slug: "castrol", name: "Castrol", country: "UK", logo: "🇬🇧" },
  { id: 14, slug: "exide", name: "Exide", country: "US", logo: "🇺🇸" },
  { id: 15, slug: "monroe", name: "Monroe", country: "BE", logo: "🇧🇪" },
];

// ============================================================
// CATEGORIES
// ============================================================
export const categories: Category[] = [
  { id: 1, slug: "brakes", name: { he: "בלמים", ar: "الفرامل", en: "Brakes" }, icon: "🛞" },
  { id: 2, slug: "filters", name: { he: "מסננים", ar: "الفلاتر", en: "Filters" }, icon: "🌀" },
  { id: 3, slug: "engine", name: { he: "מנוע", ar: "المحرك", en: "Engine" }, icon: "⚙️" },
  { id: 4, slug: "suspension", name: { he: "מתלים", ar: "نظام التعليق", en: "Suspension" }, icon: "🔩" },
  { id: 5, slug: "electrical", name: { he: "חשמל", ar: "الكهرباء", en: "Electrical" }, icon: "⚡" },
  { id: 6, slug: "lighting", name: { he: "תאורה", ar: "الإضاءة", en: "Lighting" }, icon: "💡" },
  { id: 7, slug: "cooling", name: { he: "קירור", ar: "التبريد", en: "Cooling" }, icon: "❄️" },
  { id: 8, slug: "oils-fluids", name: { he: "שמנים ונוזלים", ar: "الزيوت والسوائل", en: "Oils & Fluids" }, icon: "🛢️" },
  { id: 9, slug: "transmission", name: { he: "תיבת הילוכים", ar: "ناقل الحركة", en: "Transmission" }, icon: "🔧" },
  { id: 10, slug: "exhaust", name: { he: "פליטה", ar: "العادم", en: "Exhaust" }, icon: "💨" },
  { id: 11, slug: "body", name: { he: "מרכב", ar: "الهيكل", en: "Body" }, icon: "🚗" },
  { id: 12, slug: "tires-wheels", name: { he: "צמיגים וגלגלים", ar: "الإطارات والعجلات", en: "Tires & Wheels" }, icon: "⚫" },
];

// ============================================================
// VEHICLES — top sellers in Israel + MENA
// ============================================================
function v(
  id: number,
  year: number,
  makeSlug: string,
  makeHe: string,
  makeAr: string,
  makeEn: string,
  modelSlug: string,
  modelHe: string,
  modelAr: string,
  modelEn: string,
  engine: string,
  image: string
): Vehicle {
  return {
    id,
    year,
    makeSlug,
    makeName: { he: makeHe, ar: makeAr, en: makeEn },
    modelSlug,
    modelName: { he: modelHe, ar: modelAr, en: modelEn },
    engine,
    image,
  };
}

const carImg = (slug: string) => `/cars/${slug}.svg`;

export const vehicles: Vehicle[] = [
  // Toyota
  v(1, 2018, "toyota", "טויוטה", "تويوتا", "Toyota", "corolla", "קורולה", "كورولا", "Corolla", "1.6L", carImg("corolla")),
  v(2, 2019, "toyota", "טויוטה", "تويوتا", "Toyota", "corolla", "קורולה", "كورولا", "Corolla", "1.6L", carImg("corolla")),
  v(3, 2020, "toyota", "טויוטה", "تويوتا", "Toyota", "corolla", "קורולה", "كورولا", "Corolla", "1.8L Hybrid", carImg("corolla")),
  v(4, 2021, "toyota", "טויוטה", "تويوتا", "Toyota", "corolla", "קורולה", "كورولا", "Corolla", "1.8L Hybrid", carImg("corolla")),
  v(5, 2022, "toyota", "טויוטה", "تويوتا", "Toyota", "corolla", "קורולה", "كورولا", "Corolla", "1.8L Hybrid", carImg("corolla")),
  v(6, 2018, "toyota", "טויוטה", "تويوتا", "Toyota", "camry", "קאמרי", "كامري", "Camry", "2.5L", carImg("camry")),
  v(7, 2019, "toyota", "טויוטה", "تويوتا", "Toyota", "camry", "קאמרי", "كامري", "Camry", "2.5L", carImg("camry")),
  v(8, 2020, "toyota", "טויוטה", "تويوتا", "Toyota", "camry", "קאמרי", "كامري", "Camry", "2.5L Hybrid", carImg("camry")),
  v(9, 2018, "toyota", "טויוטה", "تويوتا", "Toyota", "rav4", "RAV4", "راف 4", "RAV4", "2.0L", carImg("rav4")),
  v(10, 2020, "toyota", "טויוטה", "تويوتا", "Toyota", "rav4", "RAV4", "راف 4", "RAV4", "2.5L Hybrid", carImg("rav4")),

  // Hyundai
  v(11, 2018, "hyundai", "יונדאי", "هيونداي", "Hyundai", "i20", "i20", "i20", "i20", "1.4L", carImg("i20")),
  v(12, 2019, "hyundai", "יונדאי", "هيونداي", "Hyundai", "i20", "i20", "i20", "i20", "1.4L", carImg("i20")),
  v(13, 2020, "hyundai", "יונדאי", "هيونداي", "Hyundai", "i20", "i20", "i20", "i20", "1.0L Turbo", carImg("i20")),
  v(14, 2018, "hyundai", "יונדאי", "هيونداي", "Hyundai", "i30", "i30", "i30", "i30", "1.4L Turbo", carImg("i30")),
  v(15, 2020, "hyundai", "יונדאי", "هيونداي", "Hyundai", "i30", "i30", "i30", "i30", "1.4L Turbo", carImg("i30")),
  v(16, 2019, "hyundai", "יונדאי", "هيونداي", "Hyundai", "tucson", "טוסון", "توسان", "Tucson", "2.0L", carImg("tucson")),
  v(17, 2021, "hyundai", "יונדאי", "هيونداي", "Hyundai", "tucson", "טוסון", "توسان", "Tucson", "1.6L Hybrid", carImg("tucson")),
  v(18, 2018, "hyundai", "יונדאי", "هيونداي", "Hyundai", "ioniq", "איוניק", "أيونيك", "Ioniq", "1.6L Hybrid", carImg("ioniq")),

  // Kia
  v(19, 2019, "kia", "קיה", "كيا", "Kia", "picanto", "פיקנטו", "بيكانتو", "Picanto", "1.0L", carImg("picanto")),
  v(20, 2020, "kia", "קיה", "كيا", "Kia", "picanto", "פיקנטו", "بيكانتو", "Picanto", "1.2L", carImg("picanto")),
  v(21, 2018, "kia", "קיה", "كيا", "Kia", "sportage", "ספורטאז'", "سبورتاج", "Sportage", "1.6L Turbo", carImg("sportage")),
  v(22, 2020, "kia", "קיה", "كيا", "Kia", "sportage", "ספורטאז'", "سبورتاج", "Sportage", "1.6L Turbo", carImg("sportage")),
  v(23, 2021, "kia", "קיה", "كيا", "Kia", "niro", "נירו", "نيرو", "Niro", "1.6L Hybrid", carImg("niro")),

  // Mazda
  v(24, 2018, "mazda", "מאזדה", "مازدا", "Mazda", "mazda3", "מאזדה 3", "مازدا 3", "Mazda 3", "1.5L", carImg("mazda3")),
  v(25, 2020, "mazda", "מאזדה", "مازدا", "Mazda", "mazda3", "מאזדה 3", "مازدا 3", "Mazda 3", "2.0L", carImg("mazda3")),
  v(26, 2019, "mazda", "מאזדה", "مازدا", "Mazda", "cx5", "CX-5", "CX-5", "CX-5", "2.0L", carImg("cx5")),

  // Skoda
  v(27, 2018, "skoda", "סקודה", "سكودا", "Skoda", "octavia", "אוקטביה", "أوكتافيا", "Octavia", "1.4L TSI", carImg("octavia")),
  v(28, 2020, "skoda", "סקודה", "سكودا", "Skoda", "octavia", "אוקטביה", "أوكتافيا", "Octavia", "1.5L TSI", carImg("octavia")),
  v(29, 2019, "skoda", "סקודה", "سكودا", "Skoda", "kodiaq", "קודיאק", "كودياك", "Kodiaq", "2.0L TSI", carImg("kodiaq")),

  // VW
  v(30, 2018, "vw", "פולקסווגן", "فولكس فاجن", "Volkswagen", "golf", "גולף", "غولف", "Golf", "1.4L TSI", carImg("golf")),
  v(31, 2020, "vw", "פולקסווגן", "فولكس فاجن", "Volkswagen", "golf", "גולף", "غولف", "Golf", "1.5L TSI", carImg("golf")),
  v(32, 2019, "vw", "פולקסווגן", "فولكس فاجن", "Volkswagen", "tiguan", "טיגואן", "تيجوان", "Tiguan", "2.0L TSI", carImg("tiguan")),

  // Mitsubishi
  v(33, 2018, "mitsubishi", "מיצובישי", "ميتسوبيشي", "Mitsubishi", "outlander", "אאוטלנדר", "أوتلاندر", "Outlander", "2.4L PHEV", carImg("outlander")),
  v(34, 2019, "mitsubishi", "מיצובישי", "ميتسوبيشي", "Mitsubishi", "outlander", "אאוטלנדר", "أوتلاندر", "Outlander", "2.4L PHEV", carImg("outlander")),

  // Honda
  v(35, 2018, "honda", "הונדה", "هوندا", "Honda", "civic", "סיוויק", "سيفيك", "Civic", "1.5L Turbo", carImg("civic")),
  v(36, 2020, "honda", "הונדה", "هوندا", "Honda", "civic", "סיוויק", "سيفيك", "Civic", "1.5L Turbo", carImg("civic")),
  v(37, 2019, "honda", "הונדה", "هوندا", "Honda", "crv", "CR-V", "CR-V", "CR-V", "1.5L Turbo", carImg("crv")),

  // Nissan
  v(38, 2018, "nissan", "ניסאן", "نيسان", "Nissan", "qashqai", "קשקאי", "قشقاي", "Qashqai", "1.2L Turbo", carImg("qashqai")),
  v(39, 2020, "nissan", "ניסאן", "نيسان", "Nissan", "qashqai", "קשקאי", "قشقاي", "Qashqai", "1.3L Turbo", carImg("qashqai")),
  v(40, 2019, "nissan", "ניסאן", "نيسان", "Nissan", "micra", "מיקרה", "ميكرا", "Micra", "1.0L", carImg("micra")),

  // BMW
  v(41, 2018, "bmw", "ב.מ.וו", "بي إم دبليو", "BMW", "320i", "320i", "320i", "320i", "2.0L Turbo", carImg("bmw3")),
  v(42, 2020, "bmw", "ב.מ.וו", "بي إم دبليو", "BMW", "320i", "320i", "320i", "320i", "2.0L Turbo", carImg("bmw3")),
  v(43, 2019, "bmw", "ב.מ.וו", "بي إم دبليو", "BMW", "x3", "X3", "X3", "X3", "2.0L Turbo", carImg("bmwx3")),

  // Mercedes
  v(44, 2018, "mercedes", "מרצדס", "مرسيدس", "Mercedes", "c200", "C200", "C200", "C200", "1.5L Turbo", carImg("mercc")),
  v(45, 2020, "mercedes", "מרצדס", "مرسيدس", "Mercedes", "c200", "C200", "C200", "C200", "1.5L Turbo", carImg("mercc")),
];

// ============================================================
// PARTS — abstract parts with multi-brand SKUs
// ============================================================
function makePart(
  id: number,
  catId: number,
  slug: string,
  nameHe: string,
  nameAr: string,
  nameEn: string,
  oems: string[],
  fits: number[],
  skuConfigs: { brandId: number; pn: string; price: number; stock: number; warranty: number }[],
  videoId?: string,
  position?: string,
  specs: Record<string, string> = {}
): Part {
  return {
    id,
    categoryId: catId,
    slug,
    name: { he: nameHe, ar: nameAr, en: nameEn },
    description: {
      he: `${nameHe} איכותי מהיצרנים המובילים בעולם, עם אחריות מלאה והתאמה מדויקת לרכב שלך.`,
      ar: `${nameAr} عالي الجودة من أفضل الشركات المصنعة في العالم، مع ضمان كامل ومطابقة دقيقة لسيارتك.`,
      en: `Premium ${nameEn} from the world's leading manufacturers, with full warranty and exact fit for your vehicle.`,
    },
    oemNumbers: oems,
    position,
    specs,
    installVideoId: videoId,
    fitsVehicleIds: fits,
    image: `/parts/${slug}.svg`,
    skus: skuConfigs.map((c, i) => ({
      id: id * 100 + i,
      brandId: c.brandId,
      partNumber: c.pn,
      priceIls: c.price,
      stock: c.stock,
      warrantyMonths: c.warranty,
      image: `/parts/${slug}.svg`,
    })),
  };
}

// All Toyota Corolla vehicle IDs (1-5)
const TOY_COROLLA = [1, 2, 3, 4, 5];
const TOY_CAMRY = [6, 7, 8];
const TOY_RAV4 = [9, 10];
const HYU_I20 = [11, 12, 13];
const HYU_I30 = [14, 15];
const HYU_TUCSON = [16, 17];
const KIA_SPORTAGE = [21, 22];
const SKO_OCT = [27, 28];
const VW_GOLF = [30, 31];
const HON_CIVIC = [35, 36];

export const parts: Part[] = [
  // BRAKES (cat 1)
  makePart(
    1, 1, "front-brake-pads-corolla",
    "רפידות בלם קדמיות", "وسادات الفرامل الأمامية", "Front Brake Pads",
    ["04465-02220", "04465-02240", "04465-12610"],
    [...TOY_COROLLA, 35, 36],
    [
      { brandId: 1, pn: "0986494614", price: 189, stock: 23, warranty: 24 },
      { brandId: 2, pn: "P83144", price: 245, stock: 12, warranty: 24 },
      { brandId: 11, pn: "AN-731WK", price: 219, stock: 18, warranty: 18 },
      { brandId: 4, pn: "16623", price: 165, stock: 31, warranty: 12 },
    ],
    "dQw4w9WgXcQ", "front", { material: "Ceramic", thickness: "12mm" }
  ),
  makePart(
    2, 1, "rear-brake-pads-corolla",
    "רפידות בלם אחוריות", "وسادات الفرامل الخلفية", "Rear Brake Pads",
    ["04466-02230"],
    TOY_COROLLA,
    [
      { brandId: 1, pn: "0986494615", price: 159, stock: 19, warranty: 24 },
      { brandId: 2, pn: "P83145", price: 215, stock: 8, warranty: 24 },
      { brandId: 4, pn: "16624", price: 135, stock: 27, warranty: 12 },
    ],
    undefined, "rear", { material: "Ceramic" }
  ),
  makePart(
    3, 1, "front-brake-discs-camry",
    "דיסקי בלם קדמיים", "أقراص الفرامل الأمامية", "Front Brake Discs",
    ["43512-06180"],
    TOY_CAMRY,
    [
      { brandId: 1, pn: "0986479R98", price: 389, stock: 11, warranty: 24 },
      { brandId: 2, pn: "09.A532.11", price: 525, stock: 6, warranty: 24 },
    ],
    undefined, "front", { diameter: "295mm", thickness: "26mm" }
  ),
  makePart(
    4, 1, "front-brake-pads-i30",
    "רפידות בלם קדמיות", "وسادات الفرامل الأمامية", "Front Brake Pads",
    ["58101-A6A20"],
    [...HYU_I30, ...HYU_TUCSON],
    [
      { brandId: 1, pn: "0986494690", price: 175, stock: 22, warranty: 24 },
      { brandId: 4, pn: "16725", price: 145, stock: 28, warranty: 12 },
      { brandId: 11, pn: "AN-841WK", price: 199, stock: 14, warranty: 18 },
    ],
    undefined, "front"
  ),

  // FILTERS (cat 2)
  makePart(
    5, 2, "oil-filter-corolla",
    "מסנן שמן", "فلتر الزيت", "Oil Filter",
    ["90915-YZZD3", "90915-10009"],
    [...TOY_COROLLA, ...TOY_RAV4],
    [
      { brandId: 3, pn: "W 68/3", price: 39, stock: 87, warranty: 6 },
      { brandId: 1, pn: "F 026 407 023", price: 35, stock: 65, warranty: 6 },
      { brandId: 10, pn: "OX 339D", price: 42, stock: 43, warranty: 6 },
    ],
    "dQw4w9WgXcQ"
  ),
  makePart(
    6, 2, "air-filter-corolla",
    "מסנן אוויר", "فلتر الهواء", "Air Filter",
    ["17801-0T040"],
    TOY_COROLLA,
    [
      { brandId: 3, pn: "C 27 145", price: 65, stock: 54, warranty: 6 },
      { brandId: 1, pn: "F 026 400 535", price: 58, stock: 38, warranty: 6 },
    ]
  ),
  makePart(
    7, 2, "cabin-filter-corolla",
    "מסנן מזגן (תא נוסעים)", "فلتر المكيف", "Cabin Air Filter",
    ["87139-YZZ08"],
    [...TOY_COROLLA, ...TOY_CAMRY],
    [
      { brandId: 3, pn: "CUK 26 009", price: 79, stock: 45, warranty: 6 },
      { brandId: 1, pn: "1 987 432 384", price: 72, stock: 52, warranty: 6 },
    ]
  ),
  makePart(
    8, 2, "fuel-filter-i30",
    "מסנן דלק", "فلتر الوقود", "Fuel Filter",
    ["31112-2H000"],
    [...HYU_I20, ...HYU_I30],
    [
      { brandId: 3, pn: "WK 5006", price: 95, stock: 32, warranty: 6 },
      { brandId: 1, pn: "F 026 402 855", price: 88, stock: 29, warranty: 6 },
    ]
  ),

  // ENGINE (cat 3)
  makePart(
    9, 3, "spark-plugs-corolla",
    "מצתים (סט 4)", "شموع الإشعار (طقم 4)", "Spark Plugs (Set of 4)",
    ["90919-01253"],
    TOY_COROLLA,
    [
      { brandId: 6, pn: "ILKR7E11", price: 165, stock: 78, warranty: 12 },
      { brandId: 5, pn: "FK20HR11", price: 189, stock: 45, warranty: 24 },
      { brandId: 1, pn: "0242235668", price: 145, stock: 56, warranty: 12 },
    ],
    "dQw4w9WgXcQ"
  ),
  makePart(
    10, 3, "timing-belt-kit-octavia",
    "ערכת רצועת תזמון", "طقم سير التوقيت", "Timing Belt Kit",
    ["04E198119A"],
    SKO_OCT,
    [
      { brandId: 4, pn: "30899", price: 489, stock: 8, warranty: 24 },
      { brandId: 1, pn: "1 987 948 942", price: 545, stock: 5, warranty: 24 },
    ]
  ),

  // SUSPENSION (cat 4)
  makePart(
    11, 4, "front-shocks-corolla",
    "בולמי זעזועים קדמיים", "ممتصات الصدمات الأمامية", "Front Shock Absorbers",
    ["48510-12B40"],
    TOY_COROLLA,
    [
      { brandId: 15, pn: "G7390", price: 425, stock: 14, warranty: 24 },
      { brandId: 8, pn: "313 462", price: 489, stock: 9, warranty: 36 },
    ]
  ),
  makePart(
    12, 4, "rear-shocks-corolla",
    "בולמי זעזועים אחוריים", "ممتصات الصدمات الخلفية", "Rear Shock Absorbers",
    ["48530-09Y20"],
    TOY_COROLLA,
    [
      { brandId: 15, pn: "23877", price: 365, stock: 12, warranty: 24 },
      { brandId: 8, pn: "311 525", price: 415, stock: 7, warranty: 36 },
    ]
  ),

  // ELECTRICAL (cat 5)
  makePart(
    13, 5, "battery-70ah",
    "מצבר 70Ah", "بطارية 70 أمبير", "Car Battery 70Ah",
    ["28800-0L010"],
    [...TOY_COROLLA, ...HYU_I30, ...VW_GOLF, ...HON_CIVIC],
    [
      { brandId: 14, pn: "EA770", price: 489, stock: 25, warranty: 36 },
      { brandId: 1, pn: "S4 008", price: 525, stock: 18, warranty: 36 },
    ]
  ),
  makePart(
    14, 5, "alternator-corolla",
    "אלטרנטור", "المولد الكهربائي", "Alternator",
    ["27060-0T230"],
    TOY_COROLLA,
    [
      { brandId: 5, pn: "DAN1095", price: 1290, stock: 4, warranty: 24 },
      { brandId: 1, pn: "0 124 525 198", price: 1450, stock: 3, warranty: 24 },
    ]
  ),

  // LIGHTING (cat 6)
  makePart(
    15, 6, "headlight-bulb-h7",
    "נורת פנס H7", "لمبة كشاف H7", "H7 Headlight Bulb",
    ["H7-12V-55W"],
    [...TOY_COROLLA, ...HYU_I20, ...VW_GOLF, ...SKO_OCT],
    [
      { brandId: 9, pn: "8GH 007 157-121", price: 45, stock: 124, warranty: 12 },
      { brandId: 7, pn: "032508", price: 39, stock: 145, warranty: 12 },
    ]
  ),

  // COOLING (cat 7)
  makePart(
    16, 7, "radiator-corolla",
    "רדיאטור", "الردياتير", "Radiator",
    ["16400-0T200"],
    TOY_COROLLA,
    [
      { brandId: 4, pn: "172890", price: 685, stock: 6, warranty: 24 },
      { brandId: 1, pn: "0 986 478 142", price: 745, stock: 4, warranty: 24 },
    ]
  ),
  makePart(
    17, 7, "thermostat-corolla",
    "תרמוסטט", "ثرموستات", "Thermostat",
    ["90916-03145"],
    TOY_COROLLA,
    [
      { brandId: 4, pn: "18289", price: 89, stock: 32, warranty: 12 },
      { brandId: 1, pn: "1 987 949 950", price: 105, stock: 21, warranty: 12 },
    ]
  ),

  // OILS & FLUIDS (cat 8)
  makePart(
    18, 8, "engine-oil-5w30-4l",
    "שמן מנוע 5W-30 (4 ליטר)", "زيت محرك 5W-30 (4 لتر)", "Engine Oil 5W-30 (4L)",
    [],
    [...TOY_COROLLA, ...TOY_CAMRY, ...HYU_I30, ...VW_GOLF, ...HON_CIVIC, ...SKO_OCT],
    [
      { brandId: 12, pn: "Mobil1-ESP-5W30-4L", price: 195, stock: 89, warranty: 0 },
      { brandId: 13, pn: "Edge-5W30-4L", price: 175, stock: 102, warranty: 0 },
    ]
  ),
  makePart(
    19, 8, "brake-fluid-dot4",
    "נוזל בלמים DOT 4 (1 ליטר)", "زيت فرامل DOT 4 (1 لتر)", "Brake Fluid DOT 4 (1L)",
    [],
    [...TOY_COROLLA, ...TOY_CAMRY, ...HYU_I30, ...VW_GOLF],
    [
      { brandId: 1, pn: "1 987 479 107", price: 45, stock: 156, warranty: 0 },
    ]
  ),

  // EXHAUST (cat 10)
  makePart(
    20, 10, "muffler-corolla",
    "מחנק (סיילנסר)", "كاتم الصوت", "Rear Muffler",
    ["17430-0T160"],
    TOY_COROLLA,
    [
      { brandId: 7, pn: "740120", price: 545, stock: 7, warranty: 24 },
    ]
  ),
];

// ============================================================
// SERVICE KITS
// ============================================================
export const kits: Kit[] = [
  {
    id: 1,
    slug: "major-service-corolla-2020",
    name: {
      he: "ערכת טיפול גדול — קורולה",
      ar: "طقم الصيانة الكبرى — كورولا",
      en: "Major Service Kit — Corolla",
    },
    description: {
      he: "שמן + 3 מסננים + מצתים + נוזל בלמים — הכל ברכישה אחת.",
      ar: "زيت + 3 فلاتر + شموع + زيت فرامل — كل ما تحتاجه في طلب واحد.",
      en: "Oil + 3 filters + spark plugs + brake fluid — everything in one order.",
    },
    kitType: "major-service",
    fitsVehicleIds: TOY_COROLLA,
    partIds: [5, 6, 7, 9, 18, 19],
    totalPriceIls: 525,
    discountPct: 12,
    image: "/kits/major-service.svg",
  },
  {
    id: 2,
    slug: "brake-service-corolla",
    name: {
      he: "ערכת בלמים מלאה — קורולה",
      ar: "طقم الفرامل الكامل — كورولا",
      en: "Complete Brake Service — Corolla",
    },
    description: {
      he: "רפידות קדמי + אחורי + נוזל בלמים. הגנה מקסימלית, תמורה הוגנת.",
      ar: "وسادات أمامية + خلفية + زيت فرامل. حماية قصوى وقيمة عادلة.",
      en: "Front + rear pads + brake fluid. Maximum protection, fair value.",
    },
    kitType: "brake-service",
    fitsVehicleIds: TOY_COROLLA,
    partIds: [1, 2, 19],
    totalPriceIls: 425,
    discountPct: 10,
    image: "/kits/brake-service.svg",
  },
  {
    id: 3,
    slug: "oil-change-corolla",
    name: {
      he: "ערכת החלפת שמן — קורולה", ar: "طقم تغيير الزيت — كورولا", en: "Oil Change Kit — Corolla",
    },
    description: {
      he: "שמן 5W-30 + מסנן שמן. הטיפול הבסיסי שכל רכב צריך.",
      ar: "زيت 5W-30 + فلتر زيت. الصيانة الأساسية لكل سيارة.",
      en: "5W-30 oil + oil filter. Basic maintenance every car needs.",
    },
    kitType: "oil-change",
    fitsVehicleIds: [...TOY_COROLLA, ...TOY_CAMRY, ...TOY_RAV4],
    partIds: [5, 18],
    totalPriceIls: 215,
    discountPct: 8,
    image: "/kits/oil-change.svg",
  },
];

// ============================================================
// IMAGE HELPERS — Unsplash auto-parts photos (free, no key needed)
// ============================================================
const UNSPLASH_PART_IDS: Record<number, string> = {
  1:  "1486262715619-67b85e0b08d3", // Brakes — brake disc
  2:  "1558618666-fcd25c85cd64",    // Filters — oil filter
  3:  "1504222114713-b37e9f814f8b", // Engine — engine bay
  4:  "1580273916550-22b45def5553", // Suspension — coilover
  5:  "1635070041078-e363dbe005cb", // Electrical — car battery
  6:  "1558618666-fcd25c85cd64",    // Lighting — (reuse filter)
  7:  "1504222114713-b37e9f814f8b", // Cooling — (reuse engine)
  8:  "1504222114713-b37e9f814f8b", // Oils — engine close-up
  9:  "1597852074816-d8c7d14c3b9e", // Transmission — gearbox
  10: "1486262715619-67b85e0b08d3", // Exhaust — (reuse brake)
  11: "1486262715619-67b85e0b08d3", // Body
  12: "1580273916550-22b45def5553", // Tires & Wheels
};

export function partImageUrl(part: Part): string {
  const id = UNSPLASH_PART_IDS[part.categoryId] ?? "1486262715619-67b85e0b08d3";
  return `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format`;
}
export function categoryImageUrl(categoryId: number): string {
  const id = UNSPLASH_PART_IDS[categoryId] ?? "1486262715619-67b85e0b08d3";
  return `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&auto=format`;
}
export function kitImageUrl(kit: Kit): string {
  const map: Record<string, string> = {
    "major-service": "1486262715619-67b85e0b08d3",
    "brake-service": "1558618666-fcd25c85cd64",
    "oil-change":    "1504222114713-b37e9f814f8b",
  };
  const id = map[kit.kitType] ?? "1486262715619-67b85e0b08d3";
  return `https://images.unsplash.com/photo-${id}?w=800&h=500&fit=crop&auto=format`;
}
export function vehicleImageUrl(vehicle: Vehicle): string {
  return `https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop&auto=format`;
}

// ============================================================
// HELPERS
// ============================================================
export function getVehicle(id: number) {
  const v = getVehicleById(id);
  if (!v) return null;
  return {
    ...v,
    fitsVehicleIds: getAllVehicles().filter(v2 => v2.year >= v.year - 3 && v2.year <= v.year + 3).map(v2 => v2.id),
  };
}
export function getCategory(id: number) {
  return categories.find((c) => c.id === id);
}
export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
export function getBrand(id: number) {
  return brands.find((b) => b.id === id);
}
export function getPart(id: number) {
  return parts.find((p) => p.id === id);
}
export function getPartBySlug(slug: string) {
  return parts.find((p) => p.slug === slug);
}
export function getKit(id: number) {
  return kits.find((k) => k.id === id);
}

export function partsForVehicle(vehicleId: number, categoryId?: number) {
  return parts.filter(
    (p) => p.fitsVehicleIds.includes(vehicleId) && (!categoryId || p.categoryId === categoryId)
  );
}

export function kitsForVehicle(vehicleId: number) {
  return kits.filter((k) => k.fitsVehicleIds.includes(vehicleId));
}

export function searchParts(q: string, vehicleId?: number) {
  const lc = q.toLowerCase().trim();
  if (!lc) return [];
  return parts.filter((p) => {
    if (vehicleId && !p.fitsVehicleIds.includes(vehicleId)) return false;
    if (p.oemNumbers.some((o) => o.toLowerCase().includes(lc))) return true;
    if (p.slug.includes(lc)) return true;
    if (Object.values(p.name).some((n) => n.toLowerCase().includes(lc))) return true;
    return false;
  });
}

export function allMakes() {
  return getMakesFromVehicles();
}
export function yearsForMake(makeSlug: string) {
  return getYearsForMake(makeSlug);
}
// ── Selector functions — delegated to israelMakes (data.gov.il) ──────────────

// All unique makes (for make-first selector)
export function uniqueMakes() {
  return getMakesFromVehicles().map(m => ({
    slug: m.slug,
    name: m.name,
    logoUrl: m.logoUrl,
  }));
}
// Years for a specific make
export function yearsForMakeSelector(makeSlug: string): number[] {
  return getYearsForMake(makeSlug);
}
// Models for make+year
export function modelsForMakeYear(makeSlug: string, year: number) {
  return getModelsForMakeYear(makeSlug, year).map(m => ({ slug: m.slug, name: m.name }));
}
// Engines (vehicle IDs) for make+year+model
export function enginesForMakeYearModel(makeSlug: string, year: number, modelSlug: string) {
  return getEnginesForMakeYearModel(makeSlug, year, modelSlug).map(v => ({ id: v.id, engine: v.engine }));
}

// Legacy — kept for backward compat but now uses real data
export function uniqueYears() {
  const allV = getAllVehicles();
  return Array.from(new Set(allV.map(v => v.year))).sort((a, b) => b - a);
}
export function makesForYear(year: number) {
  const allV = getAllVehicles();
  const seen = new Map<string, {he:string;ar:string;en:string}>();
  allV.filter(v => v.year === year).forEach(v => seen.set(v.makeSlug, v.makeName));
  return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }));
}
export function modelsForYearMake(year: number, makeSlug: string) {
  return getModelsForMakeYear(makeSlug, year).map(m => ({ slug: m.slug, name: m.name }));
}
export function enginesForYearMakeModel(year: number, makeSlug: string, modelSlug: string) {
  return getEnginesForMakeYearModel(makeSlug, year, modelSlug).map(v => ({ id: v.id, engine: v.engine }));
}

export function minPriceForPart(p: Part): number {
  return Math.min(...p.skus.map((s) => s.priceIls));
}
