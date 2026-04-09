export const dynamic = "force-dynamic";
import Link from "next/link";
import { Shield, Truck, Clock, Award, Car, Wrench } from "lucide-react";
import { getFeaturedProducts as dbFeatured, getAllCategories as dbCategories, getAllBrands as dbBrands } from "@/lib/queries";
import { parts as staticParts, categories as staticCategories, brands as staticBrands } from "@/lib/data";
import { tr } from "@/lib/i18n";

// Graceful DB fallback — use static data if DB is unreachable
async function getFeaturedProducts() {
  try { return await dbFeatured(); } catch { return staticParts.slice(0, 8) as any; }
}
async function getAllCategories() {
  try { return await dbCategories(); } catch { return staticCategories as any; }
}
async function getAllBrands() {
  try { return await dbBrands(); } catch { return staticBrands as any; }
}
import VehicleSelector from "@/components/VehicleSelector";
import TopMakes from "@/components/TopMakes";
import CategoryStrip from "@/components/CategoryStrip";
import ProductCard from "@/components/ProductCard";
import HeroSearch from "@/components/HeroSearch";

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
      {/* ── Two-tier navigation ── */}
      <section style={{ padding: "16px var(--page-px, 16px) 0" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          maxWidth: 480,
        }}>
          <Link href="/vehicle" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "var(--accent)",
            color: "#000",
            fontWeight: 800,
            fontSize: "1rem",
            padding: "18px 12px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            textAlign: "center",
          }}>
            <Car size={26} aria-hidden="true" />
            <span>רכב</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 500, opacity: 0.75 }}>
              חלפים לפי דגם
            </span>
          </Link>
          <Link href="/catalog?group=tools" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            color: "var(--text)",
            fontWeight: 800,
            fontSize: "1rem",
            padding: "18px 12px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            textAlign: "center",
          }}>
            <Wrench size={26} aria-hidden="true" />
            <span>כלים ובית</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--text-muted)" }}>
              ללא בחירת רכב
            </span>
          </Link>
        </div>
      </section>

      {/* 1. Vehicle Selector — sticky client component */}
      <VehicleSelector />

      {/* 2. Category strip — client component (uses useLocale) */}
      <CategoryStrip />

      {/* 3. Hero — Search-centric */}
      <section
        className="hero"
        style={{ padding: 0, margin: 0, maxWidth: "100%" }}
      >
        <div className="hero-inner" style={{ textAlign: "center", padding: "40px 20px 32px" }}>
          <img
            src="/brand/logo-horizontal.png"
            alt="אבו אמין חלפים"
            style={{ height: 80, width: "auto", margin: "0 auto 16px", display: "block" }}
          />
          <h1 style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)", margin: "0 0 6px" }}>
            <span className="accent">חלקים מקוריים וחליפיים לכל סוגי הרכב</span>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", margin: "0 0 24px" }}>
            מס׳ 1 בכרמל · עוספיה
          </p>
          {/* Hero search bar — needs client interactivity */}
          <HeroSearch />
        </div>
      </section>

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
            const imageSrc = p.images[0] ?? `/parts/${p.slug}.svg`;

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
            <span className="cat-icon">🔍</span>
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
          ].map((t, i) => (
            <div key={i} className="testi-card">
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
