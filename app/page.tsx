"use client";
import Link from "next/link";
import { Shield, Truck, Clock, Award, Disc, Filter, Settings, Sliders, Zap, Sun } from "lucide-react";

const CAT_ICONS: Record<string, React.ComponentType<{size?: number; "aria-hidden"?: boolean | "true" | "false"}>> = {
  brakes: Disc,
  filters: Filter,
  engine: Settings,
  suspension: Sliders,
  electrical: Zap,
  lighting: Sun,
};
import {
  categories,
  brands,
  kits,
  parts,
  getBrand,
  minPriceForPart,
  kitImageUrl,
  partImageUrl,
} from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useLocale, useActiveVehicleId } from "@/lib/cart";
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

export default function Home() {
  const locale = useLocale();
  const activeVehicleId = useActiveVehicleId();

  const featuredParts = parts.slice(0, 8);
  const featuredKits = kits;

  return (
    <main>
      {/* 1. Vehicle Selector — sticky */}
      <VehicleSelector />

      {/* 2. Category strip */}
      <CategoryStrip />

      {/* 3. Hero — with gradient depth */}
      <section
        className="hero"
        style={{ padding: 0, margin: 0, maxWidth: "100%" }}
      >
        <div className="hero-inner">
          <h1>
            {locale === "en" ? (
              <>
                Find the{" "}
                <span className="accent">Exact Part</span> for Your Vehicle
              </>
            ) : locale === "ar" ? (
              <>
                ابحث عن{" "}
                <span className="accent">القطعة المناسبة</span> لسيارتك
              </>
            ) : (
              <>
                מצא את{" "}
                <span className="accent">החלק המדויק</span>{" "}
                לרכב שלך
              </>
            )}
          </h1>
          <p
            style={{
              fontSize: "clamp(0.82rem, 2vw, 0.96rem)",
              color: "var(--text-dim)",
              margin: "0 auto",
              maxWidth: 560,
            }}
          >
            {locale === "he"
              ? "4.1 מיליון רכבים במאגר · משלוח מהיר · אחריות יצרן"
              : locale === "ar"
              ? "4.1 مليون سيارة في قاعدة البيانات · شحن سريع · ضمان المصنع"
              : "4.1M vehicles in database · Fast shipping · Manufacturer warranty"}
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
                {tr(keyLabel, locale).replace(/^[✓🛡️🚚↩️]\s*/, "")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Top Makes */}
      <section>
        <div className="section-head">
          <h2>
            {locale === "he"
              ? "בחר לפי יצרן"
              : locale === "ar"
              ? "اختر حسب الماركة"
              : "Shop by Make"}
            <span className="underline" />
          </h2>
        </div>
        <TopMakes />
      </section>

      {/* 6. Featured Parts */}
      <section>
        <div className="section-head">
          <h2>
            {locale === "en"
              ? "Popular Parts"
              : locale === "ar"
              ? "القطع الأكثر طلباً"
              : "חלפים מבוקשים"}
            <span className="underline" />
          </h2>
          <Link href="/catalog">{tr("view_all", locale)} →</Link>
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
            return (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name[locale]}
                imageSrc={partImageUrl(p)}
                price={minP}
                brands={brandNames}
                inStock={true}
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
            {tr("service_kits", locale)}
            <span className="underline" />
          </h2>
        </div>
        <div className="kits-grid">
          {featuredKits.map((k) => (
            <Link key={k.id} href="/catalog" className="kit-card">
              <span className="badge">−{k.discountPct}%</span>
              <div className="kit-img-wrap">
                <img src={kitImageUrl(k)} alt={k.name[locale]} loading="lazy" />
              </div>
              <div className="kit-body">
                <h3>{k.name[locale]}</h3>
                <p>{k.description[locale]}</p>
                <div className="price">
                  ₪{k.totalPriceIls}
                  <small>{tr("vat_inc", locale)}</small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Categories — top 6 primaries, rest accessible from catalog */}
      <section>
        <div className="section-head">
          <h2>
            {tr("popular_categories", locale)}
            <span className="underline" />
          </h2>
          <Link href="/catalog">{tr("view_all", locale)} →</Link>
        </div>
        <div className="cat-grid">
          {categories.slice(0, 6).map((c) => {
            const Icon = CAT_ICONS[c.slug];
            return (
              <Link key={c.id} href={`/catalog?cat=${c.slug}`} className="cat-card">
                <span className="cat-icon">
                  {Icon ? <Icon size={24} aria-hidden="true" /> : c.icon}
                </span>
                <span className="cat-name">{c.name[locale]}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 9. Stats / trust row */}
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
            {
              num: "30+",
              label:
                locale === "he"
                  ? "שנות ניסיון"
                  : locale === "ar"
                  ? "سنة خبرة"
                  : "Years Experience",
            },
            {
              num: "48K+",
              label:
                locale === "he"
                  ? "חלקים במלאי"
                  : locale === "ar"
                  ? "قطعة في المخزون"
                  : "Parts in Stock",
            },
            {
              num: "10K+",
              label:
                locale === "he"
                  ? "לקוחות מרוצים"
                  : locale === "ar"
                  ? "عميل راضٍ"
                  : "Happy Customers",
            },
            {
              num: "2yr",
              label:
                locale === "he"
                  ? "אחריות יצרן"
                  : locale === "ar"
                  ? "ضمان المصنع"
                  : "Manufacturer Warranty",
            },
          ].map(({ num, label }) => (
            <div
              key={label}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
                  fontWeight: 800,
                  color: "var(--accent)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {num}
              </div>
              <div
                style={{
                  fontSize: "0.76rem",
                  color: "var(--text-muted)",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
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
            {tr("brands_we_carry", locale)}
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
            {tr("testimonials_title", locale)}
            <span className="underline" />
          </h2>
        </div>
        <div className="testi-grid">
          {[
            {
              he: "מצאתי בדיוק את הרפידות שחיפשתי לקאמרי 2019. הגיעו תוך יומיים, מחיר טוב, ואחריות שנתיים. ממליץ!",
              ar: "وجدت بالضبط الفرامل التي أبحث عنها لكامري 2019. وصلت خلال يومين، سعر جيد، وضمان سنتين. أنصح به!",
              en: "Found exactly the brake pads I needed for my 2019 Camry. Arrived in 2 days, fair price, 2-year warranty. Recommended!",
              author: "Yossi K., Tel Aviv",
            },
            {
              he: "אתר מצוין, חיפוש לפי מספר OEM עובד מושלם. חוסך לי שעות במוסך.",
              ar: "موقع ممتاز، البحث برقم OEM يعمل بشكل مثالي. يوفر علي ساعات في الورشة.",
              en: "Great site, OEM number search works perfectly. Saves me hours at the garage.",
              author: "Mohammed S., Haifa",
            },
            {
              he: "הזמנתי ערכת טיפול גדול לקורולה — הכל הגיע מסודר באריזה אחת. שירות לקוחות בעברית, ערבית ואנגלית.",
              ar: "طلبت طقم صيانة كبير للكورولا — كل شيء وصل في علبة واحدة منظمة. خدمة عملاء بالعبرية والعربية والإنجليزية.",
              en: "Ordered a major service kit for my Corolla — everything arrived neatly packed. Customer service in Hebrew, Arabic, and English.",
              author: "Sara M., Nazareth",
            },
          ].map((t, i) => (
            <div key={i} className="testi-card">
              <div className="stars">★★★★★</div>
              <div className="quote">"{t[locale]}"</div>
              <div className="author">— {t.author}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
