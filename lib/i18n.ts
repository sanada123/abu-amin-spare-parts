export type Locale = "he" | "ar" | "en";
export const LOCALES: Locale[] = ["he", "ar", "en"];
export const DEFAULT_LOCALE: Locale = "he";
export const isRTL = (l: Locale) => l === "he" || l === "ar";

export const t = {
  brand: { he: "אבו אמין מאהר מלאק", ar: "أبو أمين ماهر ملاك", en: "Abu Amin Maher Malak" },
  tagline: {
    he: "חלפים ואביזרים לרכב",
    ar: "قطع غيار وإكسسوارات للسيارات",
    en: "Spare Parts & Car Accessories",
  },
  hero_title: {
    he: "מצא את החלק המדויק לרכב שלך",
    ar: "ابحث عن القطعة المناسبة لسيارتك",
    en: "Find the Exact Part for Your Vehicle",
  },
  hero_sub: {
    he: "מיליוני חלפי מקור ואחר־שוק לכל סוגי הרכב, עם התאמה מדויקת לפי שנה, יצרן, דגם ומנוע",
    ar: "ملايين قطع الغيار الأصلية والبديلة لجميع السيارات، مع مطابقة دقيقة حسب السنة والصانع والموديل والمحرك",
    en: "Millions of OEM and aftermarket parts for every vehicle, with exact fitment by year, make, model, and engine",
  },
  cta_select_vehicle: { he: "בחר את הרכב שלך", ar: "اختر سيارتك", en: "Select Your Vehicle" },
  step_year: { he: "שנה", ar: "السنة", en: "Year" },
  step_make: { he: "יצרן", ar: "الصانع", en: "Make" },
  step_model: { he: "דגם", ar: "الموديل", en: "Model" },
  step_engine: { he: "מנוע", ar: "المحرك", en: "Engine" },
  search_placeholder: {
    he: "חיפוש לפי שם חלק או מספר OEM…",
    ar: "ابحث باسم القطعة أو رقم OEM…",
    en: "Search by part name or OEM number…",
  },
  shop_by_category: { he: "קנייה לפי קטגוריה", ar: "تسوق حسب الفئة", en: "Shop by Category" },
  service_kits: { he: "ערכות שירות", ar: "أطقم الصيانة", en: "Service Kits" },
  fits_your_car: { he: "מתאים לרכב שלך", ar: "يناسب سيارتك", en: "Fits Your Car" },
  add_to_cart: { he: "הוסף לסל", ar: "أضف إلى السلة", en: "Add to Cart" },
  in_stock: { he: "במלאי", ar: "متوفر", en: "In Stock" },
  from_price: { he: "החל מ", ar: "ابتداءً من", en: "From" },
  trust_oem: {
    he: "✓ מקוריות מובטחת",
    ar: "✓ ضمان الأصالة",
    en: "✓ Authenticity Guaranteed",
  },
  trust_fitment: {
    he: "✓ אחריות התאמה",
    ar: "✓ ضمان المطابقة",
    en: "✓ Fitment Guarantee",
  },
  trust_shipping: {
    he: "✓ משלוח מהיר בכל הארץ",
    ar: "✓ شحن سريع لجميع المناطق",
    en: "✓ Fast Nationwide Shipping",
  },
  trust_returns: {
    he: "✓ החזרה תוך 14 יום",
    ar: "✓ إرجاع خلال 14 يوم",
    en: "✓ 14-Day Returns",
  },
  view_parts: { he: "צפה בחלפים", ar: "عرض القطع", en: "View Parts" },
  change_vehicle: { he: "שנה רכב", ar: "تغيير السيارة", en: "Change Vehicle" },
  brands_we_carry: { he: "המותגים שלנו", ar: "علاماتنا التجارية", en: "Brands We Carry" },
  why_us: { he: "למה אבו אמין?", ar: "لماذا أبو أمين؟", en: "Why Abu Amin?" },
  why_1_t: { he: "התאמה מדויקת", ar: "مطابقة دقيقة", en: "Exact Fitment" },
  why_1_d: {
    he: "כל חלק עובר אימות לרכב הספציפי שלך — שנה, דגם, מנוע. ללא ניחושים.",
    ar: "كل قطعة يتم التحقق منها لسيارتك المحددة — السنة، الموديل، المحرك. بدون تخمين.",
    en: "Every part is verified for your specific vehicle — year, model, engine. No guesswork.",
  },
  why_2_t: { he: "מחירים שקופים", ar: "أسعار شفافة", en: "Transparent Pricing" },
  why_2_d: {
    he: "מספר מותגים לכל חלק. אתה רואה את כל האפשרויות, מהזול לפרימיום.",
    ar: "علامات تجارية متعددة لكل قطعة. ترى جميع الخيارات، من الاقتصادي إلى المتميز.",
    en: "Multiple brands per part. You see all options, from budget to premium.",
  },
  why_3_t: { he: "מומחיות מקומית", ar: "خبرة محلية", en: "Local Expertise" },
  why_3_d: {
    he: "צוות שמכיר את הרכבים הפופולריים בישראל ובעולם הערבי. שירות בשלוש שפות.",
    ar: "فريق يعرف السيارات الشائعة في إسرائيل والعالم العربي. خدمة بثلاث لغات.",
    en: "A team that knows the popular vehicles in Israel and the Arab world. Service in three languages.",
  },
  testimonials_title: { he: "לקוחות מספרים", ar: "ماذا يقول العملاء", en: "What Customers Say" },
  cart: { he: "סל קניות", ar: "سلة التسوق", en: "Cart" },
  cart_empty: { he: "הסל ריק", ar: "السلة فارغة", en: "Your cart is empty" },
  checkout: { he: "מעבר לתשלום", ar: "إتمام الشراء", en: "Checkout" },
  total: { he: "סה״כ", ar: "المجموع", en: "Total" },
  vat_inc: { he: "כולל מע״מ", ar: "شامل الضريبة", en: "incl. VAT" },
  back: { he: "חזרה", ar: "رجوع", en: "Back" },
  popular_categories: { he: "קטגוריות פופולריות", ar: "الفئات الشائعة", en: "Popular Categories" },
  fitment_badge_prefix: { he: "✓ מתאים ל", ar: "✓ يناسب", en: "✓ Fits" },
  oem_label: { he: "מספר OEM", ar: "رقم OEM", en: "OEM Number" },
  brand_label: { he: "מותג", ar: "العلامة", en: "Brand" },
  warranty: { he: "אחריות", ar: "الضمان", en: "Warranty" },
  months: { he: "חודשים", ar: "أشهر", en: "months" },
  remove: { he: "הסר", ar: "إزالة", en: "Remove" },
  qty: { he: "כמות", ar: "الكمية", en: "Qty" },
  subtotal: { he: "ביניים", ar: "المجموع الفرعي", en: "Subtotal" },
  shipping: { he: "משלוח", ar: "الشحن", en: "Shipping" },
  free: { he: "חינם", ar: "مجاني", en: "Free" },
  vat: { he: "מע״מ 17%", ar: "ضريبة 17%", en: "VAT 17%" },
  view_all: { he: "צפה בהכל", ar: "عرض الكل", en: "View All" },
  no_vehicle_warning: {
    he: "בחר רכב כדי לראות חלקים מתאימים בלבד",
    ar: "اختر سيارة لرؤية القطع المتوافقة فقط",
    en: "Select a vehicle to see only compatible parts",
  },
  install_video: { he: "סרטון התקנה", ar: "فيديو التركيب", en: "Installation Video" },
  specs: { he: "מפרט", ar: "المواصفات", en: "Specs" },
  fits_other: { he: "מתאים גם ל…", ar: "يناسب أيضاً…", en: "Also fits…" },
};

export function tr(key: keyof typeof t, locale: Locale): string {
  return t[key][locale] ?? t[key].en;
}
