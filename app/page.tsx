// Use ISR caching — revalidate every 5 minutes (see revalidate export below)
import Link from "next/link";
import { Shield, Truck, Clock, Award, Car, Wrench, Search as SearchIcon } from "lucide-react";
import { getFeaturedProducts as dbFeatured, getAllCategories as dbCategories, getAllBrands as dbBrands } from "@/lib/queries";
import { parts as staticParts, categories as staticCategories, brands as staticBrands } from "@/lib/data";
import { tr } from "@/lib/i18n";

// Graceful DB fallback — adapt static data to Prisma-compatible format
function adaptStaticParts(parts: any[]) {
  return parts.slice(0, 8).map((p: any) => ({
    id: p.id || 0,
    slug: p.slug || '',
    name: typeof p.name === 'object' ? (p.name.he || p.name.ar || '') : (p.name || ''),
    images: p.images || [getProductImage(p.slug || '', [])],
    category: { name: typeof p.category === 'object' ? (p.category?.he || '') : (p.category || '') },
    skus: (p.skus || []).map((s: any) => ({
      id: s.id || 0,
      partNumber: s.partNumber || s.sku || '',
      priceIls: s.priceIls ?? s.price ?? 0,
      tier: s.tier || 'replacement',
      brand: typeof s.brand === 'object'
        ? { name: s.brand?.name || 'כללי', slug: s.brand?.slug || '', country: s.brand?.country || null }
        : { name: s.brand || 'כללי', slug: '', country: null },
      stock: s.stock ?? 1,
      deliveryDays: s.deliveryDays ?? 3,
    })),
    fitments: (p.vehicleIds || []).map(() => ({
      vehicle: { make: '', model: '', year: 0 },
    })),
  }));
}

async function getFeaturedProducts() {
  try { return await dbFeatured(); } catch { return adaptStaticParts(staticParts); }
}
async function getAllCategories() {
  try { return await dbCategories(); } catch {
    return staticCategories.map((c: any) => ({
      id: c.id || 0, slug: c.slug || '', name: typeof c.name === 'object' ? c.name.he || '' : c.name,
      icon: c.icon || null, group: c.group || null, parentId: null, children: [],
    }));
  }
}
async function getAllBrands() {
  try { return await dbBrands(); } catch {
    return staticBrands.map((b: any) => ({
      id: b.id || 0, slug: b.slug || '', name: typeof b.name === 'object' ? b.name.he || '' : b.name,
      country: b.country || null, logoUrl: b.logo || null,
    }));
  }
}
import VehicleSelector from "@/components/VehicleSelector";
import TopMakes from "@/components/TopMakes";
import CategoryStrip from "@/components/CategoryStrip";
import ProductCard from "@/components/ProductCard";
import HeroSearch from "@/components/HeroSearch";

// Map product slugs to actual image files in /parts/
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'front-brake-pads-corolla': '/parts/brake-pad.jpg',
  'rear-brake-pads-corolla': '/parts/brake-pad.jpg',
  'front-brake-discs-camry': '/parts/disc-brake.jpg',
  'front-brake-pads-i30': '/parts/brake-pad.jpg',
  'oil-filter-corolla': '/parts/oil-filter.jpg',
  'air-filter-corolla': '/parts/air-filter.png',
  'cabin-filter-corolla': '/parts/cabin-filter.png',
  'fuel-filter-i30': '/parts/fuel-filter.jpg',
  'spark-plugs-corolla': '/parts/spark-plug.jpg',
  'timing-belt-kit-octavia': '/parts/timing-belt.jpg',
  'front-shocks-corolla': '/parts/shock-absorber.jpg',
  'rear-shocks-corolla': '/parts/shock-absorber.jpg',
  'battery-70ah': '/parts/battery.jpg',
  'alternator-corolla': '/parts/alternator.jpg',
  'headlight-bulb-h7': '/parts/led-bulb.jpg',
  'radiator-corolla': '/parts/radiator.jpg',
  'thermostat-corolla': '/parts/thermostat.png',
  'engine-oil-5w30-4l': '/parts/motor-oil.jpg',
  'brake-fluid-dot4': '/parts/brake-fluid.jpg',
  'muffler-corolla': '/parts/muffler.jpg',
  'pressure-washer-1500w': '/parts/water-pump.jpg',
  'pressure-washer-2200w': '/parts/water-pump.jpg',
  'pressure-washer-foam-lance': '/parts/water-pump.jpg',
  'air-compressor-24l': '/parts/turbocharger.jpg',
  'air-compressor-50l': '/parts/turbocharger.jpg',
  'tire-inflator-kit': '/parts/tire.jpg',
  'circular-saw-1200w': '/parts/windshield.jpg',
  'chainsaw-petrol-40cc': '/parts/windshield.jpg',
  'jigsaw-650w': '/parts/windshield.jpg',
  'wet-dry-vacuum-20l': '/parts/windshield.jpg',
  'industrial-vacuum-30l': '/parts/windshield.jpg',
  'socket-set-108pc': '/parts/wheel-bearing.jpg',
  'cordless-drill-18v': '/parts/starter.jpg',
  'angle-grinder-125mm': '/parts/starter.jpg',
  'brush-cutter-45cc': '/parts/wiper-blade.jpg',
  'brush-cutter-electric-1200w': '/parts/wiper-blade.jpg',
  'cutting-line-3mm': '/parts/wiper-blade.jpg',
  'garden-tool-set-5pc': '/parts/wiper-blade.jpg',
  'wheelbarrow-65l': '/parts/wheel.jpg',
  'hose-reel-20m': '/parts/wiper-blade.jpg',
  'lawn-mower-petrol-46cm': '/parts/wiper-blade.jpg',
  'lawn-mower-electric-32cm': '/parts/wiper-blade.jpg',
};

/** Category-based fallback images when product has no image */
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "brake": "/parts/brake-pad.jpg",
  "filter": "/parts/oil-filter.jpg",
  "oil": "/parts/motor-oil.jpg",
  "battery": "/parts/battery.jpg",
  "shock": "/parts/shock-absorber.jpg",
  "spark": "/parts/spark-plug.jpg",
  "timing": "/parts/timing-belt.jpg",
  "radiator": "/parts/radiator.jpg",
  "alternator": "/parts/alternator.jpg",
  "muffler": "/parts/muffler.jpg",
  "pressure-washer": "/parts/water-pump.jpg",
  "compressor": "/parts/turbocharger.jpg",
  "saw": "/parts/windshield.jpg",
  "drill": "/parts/starter.jpg",
  "grinder": "/parts/starter.jpg",
  "brush-cutter": "/parts/wiper-blade.jpg",
  "garden": "/parts/wiper-blade.jpg",
  "lawn-mower": "/parts/wiper-blade.jpg",
  "tire": "/parts/tire.jpg",
};

function getProductImage(slug: string, images: string[]): string {
  if (images && images.length > 0 && images[0]) return images[0];
  // Try exact match first
  if (PRODUCT_IMAGE_MAP[slug]) return PRODUCT_IMAGE_MAP[slug];
  // Try keyword match from slug
  for (const [keyword, img] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (slug.includes(keyword)) return img;
  }
  return '/parts/brake-pad.jpg';
}

const TRUST_ITEMS = [
  { icon: Shield, keyLabel: "trust_oem" as const },
  { icon: Award, keyLabel: "trust_fitment" as const },
  { icon: Truck, keyLabel: "trust_shipping" as const },
  { icon: Clock, keyLabel: "trust_returns" as const },
];

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function Home() {
  const [featuredProducts, categories, brands] = await Promise.all([
    getFeaturedProducts(),
    getAllCategories(),
    getAllBrands(),
  ]);

  const primaryCats = categories
    .filter((c: any) => !c.parentId && !c.group)
    .slice(0, 5);

  return (
    <main>
      {/* ── Hero — Clean, modern ── */}
      <section style={{ padding: 0, margin: 0, maxWidth: "100%", background: "linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)" }}>
        <div style={{ textAlign: "center", padding: "48px 20px 36px", maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", margin: "0 0 8px", fontWeight: 900, color: "var(--text)", lineHeight: 1.3 }}>
            חלקי חילוף לכל סוגי הרכב
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", margin: "0 0 28px", lineHeight: 1.6 }}>
            חנות חלפים ותיקה בלב הכרמל · עוספיה · 30+ שנות ניסיון
          </p>
          <HeroSearch />
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
            <Link href="/vehicle" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--accent)", color: "var(--accent-fg)",
              fontWeight: 700, fontSize: "0.9rem", padding: "12px 24px",
              borderRadius: "var(--radius-md)", textDecoration: "none",
            }}>
              <Car size={18} aria-hidden="true" />
              חלפים לפי רכב
            </Link>
            <Link href="/catalog?group=tools" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--surface-2)", color: "var(--text)",
              fontWeight: 700, fontSize: "0.9rem", padding: "12px 24px",
              borderRadius: "var(--radius-md)", textDecoration: "none",
              border: "1px solid var(--border)",
            }}>
              <Wrench size={18} aria-hidden="true" />
              כלים ובית
            </Link>
          </div>
        </div>
      </section>

      {/* Vehicle Selector */}
      <VehicleSelector />

      {/* Category strip */}
      <CategoryStrip />

      {/* 4. Trust bar */}
      <div className="trust-bar">
        <div className="trust-inner">
          {TRUST_ITEMS.map(({ icon: Icon, keyLabel }) => (
            <div key={keyLabel} className="trust-item">
              <div className="icon">
                <Icon size={14} aria-hidden="true" />
              </div>
              <div className="text">
                {tr(keyLabel).replace(/^[✓🛡️🚚↩️]\s*/, "")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Top Makes — client component (uses router) */}
      <section>
        <div className="section-head">
          <h2>
            בחר לפי יצרן
            <span className="underline" />
          </h2>
        </div>
        <TopMakes />
      </section>

      {/* 6. Featured Products from DB */}
      <section>
        <div className="section-head">
          <h2>
            חלפים מבוקשים
            <span className="underline" />
          </h2>
          <Link href="/catalog">{tr("view_all")} →</Link>
        </div>
        <div className="parts-grid">
          {featuredProducts.map((p: any) => {
            const minPrice = p.skus.length > 0
              ? Math.min(...p.skus.map((s: any) => s.priceIls))
              : 0;
            const brandNames = p.skus.slice(0, 4).map((s: any) => s.brand.name);
            const tiers = [...new Set(p.skus.map((s: any) => s.tier))] as Array<"original" | "replacement">;
            const firstFitment = p.fitments[0];
            const extraCount = p.fitments.length - 1;
            const vehicleLabel = firstFitment
              ? `${firstFitment.vehicle.make} ${firstFitment.vehicle.model} ${firstFitment.vehicle.year}${extraCount > 0 ? ` +${extraCount} נוספים` : ""}`
              : undefined;
            const imageSrc = getProductImage(p.slug, p.images);

            return (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                imageSrc={imageSrc}
                price={minPrice}
                brands={brandNames}
                vehicleLabel={vehicleLabel}
                tiers={tiers}
                skuCount={p.skus.length}
                inStock={true}
              />
            );
          })}
        </div>
      </section>

      {/* 7. Categories grid from DB */}
      <section>
        <div className="section-head">
          <h2>
            {tr("popular_categories")}
            <span className="underline" />
          </h2>
          <Link href="/catalog">{tr("view_all")} →</Link>
        </div>
        <div className="cat-grid">
          {primaryCats.map((c: any) => (
            <Link
              key={c.id}
              href={c.group === "tools" ? `/catalog?group=tools` : `/catalog?cat=${c.slug}`}
              className="cat-card"
            >
              <span className="cat-icon">{c.icon ?? "🔧"}</span>
              <span className="cat-name">{c.name}</span>
            </Link>
          ))}
          {/* Last tile: all categories */}
          <Link href="/catalog" className="cat-card">
            <span className="cat-icon"><SearchIcon size={20} aria-hidden="true" /></span>
            <span className="cat-name">כל הקטגוריות</span>
          </Link>
        </div>
      </section>

      {/* 8. Stats */}
      <section>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            padding: "32px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
          }}
        >
          {[
            { num: "30+", label: "שנות ניסיון" },
            { num: "48K+", label: "פריטים במלאי" },
            { num: "10K+", label: "לקוחות מרוצים" },
            { num: "2yr", label: "אחריות יצרן" },
          ].map(({ num, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(1.6rem, 5vw, 2.4rem)", fontWeight: 800, color: "var(--accent)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                {num}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Brands from DB */}
      <section>
        <div className="section-head">
          <h2>
            {tr("brands_we_carry")}
            <span className="underline" />
          </h2>
        </div>
        <div className="brand-strip">
          {brands.map((b: any) => (
            <span key={b.id} className="brand-chip">
              {b.logo && <span className="flag">{b.logo}</span>}
              <span>{b.name}</span>
            </span>
          ))}
        </div>
      </section>

      {/* 10. Testimonials */}
      <section>
        <div className="section-head">
          <h2>
            {tr("testimonials_title")}
            <span className="underline" />
          </h2>
        </div>
        <div className="testi-grid">
          {[
            {
              quote: "מצאתי בדיוק את הרפידות שחיפשתי לקאמרי 2019. הגיעו תוך יומיים, מחיר טוב, ואחריות שנתיים. ממליץ!",
              author: "יוסי כ., תל אביב",
            },
            {
              quote: "שירות מצוין. אחד כלי העבודה שקניתי עבד כבר מהיום הראשון. המחיר הוגן ומקבלים שירות אישי.",
              author: "מוחמד ס., חיפה",
            },
            {
              quote: "הזמנתי ערכת טיפול גדול לקורולה — הכל הגיע מסודר באריזה אחת. שירות מצוין.",
              author: "שרה מ., נצרת",
            },
          ].map((t) => (
            <div key={t.author} className="testi-card">
              <div className="stars">★★★★★</div>
              <div className="quote">&ldquo;{t.quote}&rdquo;</div>
              <div className="author">— {t.author}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
