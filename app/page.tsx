"use client";
import Link from "next/link";
import { Shield, Truck, Clock, Award, Car, Wrench } from "lucide-react";
import {
  categories,
  brands,
  kits,
  parts,
  getBrand,
  getVehicle,
  minPriceForPart,
  kitImageUrl,
  partImageUrl,
} from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useActiveVehicleId } from "@/lib/cart";
import VehicleSelector from "@/components/VehicleSelector";
import TopMakes from "@/components/TopMakes";
import CategoryStrip from "@/components/CategoryStrip";
import ProductCard from "@/components/ProductCard";

const TRUST_ITEMS = [
  { icon: Shield, keyLabel: "trust_oem" as const },
  { icon: Award, keyLabel: "trust_fitment" as const },
  { icon: Truck, keyLabel: "trust_shipping" as const },
  { icon: Clock, keyLabel: "trust_returns" as const },
];

// Homepage primary 6 categories per PIVOT-V3
const PRIMARY_CAT_SLUGS = [
  "engine",          // חלפי מנוע
  "brakes",          // בלמים
  "lighting-signals", // פנסים ואיתותים
  "batteries",       // מצברים
  "tools-machines",  // כלים ומכונות (new)
];

export default function Home() {
  const activeVehicleId = useActiveVehicleId();

  const featuredParts = parts.slice(0, 8);
  const featuredKits = kits;
  const primaryCats = PRIMARY_CAT_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug)
  ).filter(Boolean) as typeof categories;

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

      {/* 1. Vehicle Selector — sticky */}
      <VehicleSelector />

      {/* 2. Category strip */}
      <CategoryStrip />

      {/* 3. Hero */}
      <section
        className="hero"
        style={{ padding: 0, margin: 0, maxWidth: "100%" }}
      >
        <div className="hero-inner">
          <h1>
            <strong>אבו אמין חלפים</strong>
            <br />
            <span className="accent">חלפי רכב · כלי עבודה · ציוד גינה</span>
          </h1>
          <p style={{ fontSize: "clamp(0.9rem, 2vw, 1.05rem)", fontWeight: 700, color: "var(--text)", margin: "8px auto 4px" }}>
            חלקים מקוריים וחליפיים לכל סוגי הרכב
          </p>
          <p
            style={{
              fontSize: "clamp(0.82rem, 2vw, 0.96rem)",
              color: "var(--text-dim)",
              margin: "0 auto",
              maxWidth: 560,
            }}
          >
            מס׳ 1 בכרמל
          </p>
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

      {/* 5. Top Makes */}
      <section>
        <div className="section-head">
          <h2>
            בחר לפי יצרן
            <span className="underline" />
          </h2>
        </div>
        <TopMakes />
      </section>

      {/* 6. Featured Parts */}
      <section>
        <div className="section-head">
          <h2>
            חלפים מבוקשים
            <span className="underline" />
          </h2>
          <Link href="/catalog">{tr("view_all")} →</Link>
        </div>
        <div className="parts-grid">
          {featuredParts.map((p) => {
            const minP = minPriceForPart(p);
            const fitsActive =
              activeVehicleId != null && p.fitsVehicleIds.includes(activeVehicleId);
            const brandNames = p.skus
              .slice(0, 4)
              .map((s) => getBrand(s.brandId)?.name)
              .filter((n): n is string => Boolean(n));
            const fitVehicles = p.fitsVehicleIds.slice(0, 3).map((id) => getVehicle(id)).filter(Boolean);
            const primaryVehicle = fitVehicles[0];
            const extraCount = p.fitsVehicleIds.length - 1;
            const vehicleLabel = primaryVehicle
              ? `${primaryVehicle.makeName.he} ${primaryVehicle.modelName.he} ${primaryVehicle.year}${extraCount > 0 ? ` +${extraCount} נוספים` : ""}`
              : undefined;
            const tierSet = [...new Set(p.skus.map((s) => (s as any).tier).filter(Boolean))] as ("original" | "replacement")[];
            const inStockSkus = p.skus.filter((s) => s.stock > 0);
            const bestDelivery = inStockSkus.length > 0
              ? Math.min(...inStockSkus.map((s) => (s as any).deliveryDays ?? 3))
              : undefined;
            return (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name.he}
                imageSrc={partImageUrl(p)}
                price={minP}
                brands={brandNames}
                vehicleLabel={vehicleLabel}
                tiers={tierSet}
                skuCount={p.skus.length}
                deliveryDays={bestDelivery}
                inStock={inStockSkus.length > 0}
                fitsActiveCar={fitsActive}
              />
            );
          })}
        </div>
      </section>

      {/* 7. Service Kits */}
      <section>
        <div className="section-head">
          <h2>
            {tr("service_kits")}
            <span className="underline" />
          </h2>
        </div>
        <div className="kits-grid">
          {featuredKits.map((k) => (
            <Link key={k.id} href="/catalog" className="kit-card">
              <span className="badge">−{k.discountPct}%</span>
              <div className="kit-img-wrap">
                <img src={kitImageUrl(k)} alt={k.name.he} loading="lazy" />
              </div>
              <div className="kit-body">
                <h3>{k.name.he}</h3>
                <p>{k.description.he}</p>
                <div className="price">
                  ₪{k.totalPriceIls}
                  <small>{tr("vat_inc")}</small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Categories — primary 6 */}
      <section>
        <div className="section-head">
          <h2>
            {tr("popular_categories")}
            <span className="underline" />
          </h2>
          <Link href="/catalog">{tr("view_all")} →</Link>
        </div>
        <div className="cat-grid">
          {primaryCats.map((c) => (
            <Link
              key={c.id}
              href={c.group === "tools" ? `/catalog?group=tools` : `/catalog?cat=${c.slug}`}
              className="cat-card"
            >
              <span className="cat-icon">{c.icon}</span>
              <span className="cat-name">{c.name.he}</span>
            </Link>
          ))}
          {/* 6th tile: all categories */}
          <Link href="/catalog" className="cat-card">
            <span className="cat-icon">🔍</span>
            <span className="cat-name">כל הקטגוריות</span>
          </Link>
        </div>
      </section>

      {/* 9. Stats */}
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

      {/* 10. Brands */}
      <section>
        <div className="section-head">
          <h2>
            {tr("brands_we_carry")}
            <span className="underline" />
          </h2>
        </div>
        <div className="brand-strip">
          {brands.map((b) => (
            <span key={b.id} className="brand-chip">
              <span className="flag">{b.logo}</span>
              <span>{b.name}</span>
            </span>
          ))}
        </div>
      </section>

      {/* 11. Testimonials */}
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
