"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  categories, brands, kits, parts,
  uniqueMakes, yearsForMakeSelector, modelsForMakeYear, enginesForMakeYearModel,
  getCategory, minPriceForPart, getBrand,
  partImageUrl, kitImageUrl,
} from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useLocale, useActiveVehicleId, setActiveVehicleId } from "@/lib/cart";

export default function Home() {
  const locale = useLocale();
  const router = useRouter();
  const activeVehicleId = useActiveVehicleId();

  const [make, setMake] = useState<string>("");
  const [year, setYear] = useState<number | "">("");
  const [model, setModel] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<number | "">("");

  // Make-first flow: make → years → models → engines
  const allMakes = useMemo(() => uniqueMakes(), []);
  const years = useMemo(() => make ? yearsForMakeSelector(make) : [], [make]);
  const models = useMemo(() => (make && year) ? modelsForMakeYear(make, year as number) : [], [make, year]);
  const engines = useMemo(
    () => (make && year && model) ? enginesForMakeYearModel(make, year as number, model) : [],
    [make, year, model]
  );

  const submit = () => {
    if (vehicleId) {
      setActiveVehicleId(vehicleId as number);
      router.push("/catalog");
    }
  };

  const featuredParts = parts.slice(0, 8);
  const featuredKits = kits;

  return (
    <main>
      {/* HERO */}
      <section className="hero" style={{ padding: 0, margin: 0, maxWidth: "100%" }}>
        <div className="hero-inner">
          <div className="hero-logo">
            <img src="/brand/logo.jpg" alt="Abu Amin Maher Malak" />
          </div>
          <span className="hero-tag">
            ★ {locale === "en" ? "TRUSTED BY 10,000+ DRIVERS" : locale === "ar" ? "موثوق من قبل أكثر من 10,000 سائق" : "מעל 10,000 לקוחות מרוצים"}
          </span>
          <h1>
            {locale === "en" ? <>Find the <span className="accent">Exact Part</span> for Your Vehicle</> :
             locale === "ar" ? <>ابحث عن <span className="accent">القطعة المناسبة</span> لسيارتك</> :
             <>מצא את <span className="accent">החלק המדויק</span> לרכב שלך</>}
          </h1>
          <p>{tr("hero_sub", locale)}</p>
        </div>

        <div className="selector-wrap">
          <div className="selector-card">
            <div className="selector-title">
              <span className="pulse"></span>
              {tr("cta_select_vehicle", locale)}
            </div>
            <div className="selector-grid">
              <select
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setYear(""); setModel(""); setVehicleId("");
                }}
              >
                <option value="">{tr("step_make", locale)}</option>
                {allMakes.map((m) => <option key={m.slug} value={m.slug}>{m.name[locale]}</option>)}
              </select>
              <select
                value={year}
                disabled={!make}
                onChange={(e) => {
                  setYear(parseInt(e.target.value) || "");
                  setModel(""); setVehicleId("");
                }}
              >
                <option value="">{tr("step_year", locale)}</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={model}
                disabled={!year}
                onChange={(e) => { setModel(e.target.value); setVehicleId(""); }}
              >
                <option value="">{tr("step_model", locale)}</option>
                {models.map((m) => <option key={m.slug} value={m.slug}>{m.name[locale]}</option>)}
              </select>
              <select
                value={vehicleId}
                disabled={!model}
                onChange={(e) => setVehicleId(parseInt(e.target.value) || "")}
              >
                <option value="">{tr("step_engine", locale)}</option>
                {engines.map((e) => <option key={e.id} value={e.id}>{e.engine}</option>)}
              </select>
            </div>
            <button className="selector-cta" disabled={!vehicleId} onClick={submit}>
              {tr("view_parts", locale)} →
            </button>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-inner">
          <div className="trust-item">
            <div className="icon">✓</div>
            <div className="text">{tr("trust_oem", locale).replace("✓ ", "")}</div>
          </div>
          <div className="trust-item">
            <div className="icon">🛡️</div>
            <div className="text">{tr("trust_fitment", locale).replace("✓ ", "")}</div>
          </div>
          <div className="trust-item">
            <div className="icon">🚚</div>
            <div className="text">{tr("trust_shipping", locale).replace("✓ ", "")}</div>
          </div>
          <div className="trust-item">
            <div className="icon">↩️</div>
            <div className="text">{tr("trust_returns", locale).replace("✓ ", "")}</div>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section>
        <div className="section-head">
          <h2>{tr("popular_categories", locale)}<span className="underline"></span></h2>
          <Link href="/catalog">{tr("view_all", locale)} →</Link>
        </div>
        <div className="cat-grid">
          {categories.map((c) => (
            <Link key={c.id} href={`/catalog?cat=${c.slug}`} className="cat-card">
              <span className="cat-icon">{c.icon}</span>
              <span className="cat-name">{c.name[locale]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* SERVICE KITS */}
      <section>
        <div className="section-head">
          <h2>{tr("service_kits", locale)}<span className="underline"></span></h2>
        </div>
        <div className="kits-grid">
          {featuredKits.map((k) => (
            <Link key={k.id} href={`/catalog`} className="kit-card">
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

      {/* FEATURED PARTS */}
      <section>
        <div className="section-head">
          <h2>{locale === "en" ? "Popular Parts" : locale === "ar" ? "القطع الأكثر طلباً" : "חלפים מבוקשים"}<span className="underline"></span></h2>
          <Link href="/catalog">{tr("view_all", locale)} →</Link>
        </div>
        <div className="parts-grid">
          {featuredParts.map((p) => {
            const minP = minPriceForPart(p);
            const fitsActive = activeVehicleId && p.fitsVehicleIds.includes(activeVehicleId);
            return (
              <Link key={p.id} href={`/part/${p.slug}`} className="part-card">
                <div className="part-img">
                  <img src={partImageUrl(p)} alt={p.name[locale]} loading="lazy" />
                </div>
                <div className="part-body">
                  {fitsActive && <span className="part-fitment">✓ {tr("fits_your_car", locale)}</span>}
                  <div className="part-name">{p.name[locale]}</div>
                  <div className="part-brands">
                    {p.skus.slice(0, 3).map((s) => getBrand(s.brandId)?.name).filter(Boolean).join(" · ")}
                    {p.skus.length > 3 ? ` +${p.skus.length - 3}` : ""}
                  </div>
                  <div className="part-meta">
                    <div className="part-price">₪{minP} <small>{tr("from_price", locale)}</small></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* WHY US */}
      <section>
        <div className="section-head">
          <h2>{tr("why_us", locale)}<span className="underline"></span></h2>
        </div>
        <div className="why-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="why-card">
              <div className="num">{i}</div>
              <h3>{tr(`why_${i}_t` as keyof typeof import("@/lib/i18n").t, locale)}</h3>
              <p>{tr(`why_${i}_d` as keyof typeof import("@/lib/i18n").t, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BRANDS */}
      <section>
        <div className="section-head">
          <h2>{tr("brands_we_carry", locale)}<span className="underline"></span></h2>
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

      {/* TESTIMONIALS */}
      <section>
        <div className="section-head">
          <h2>{tr("testimonials_title", locale)}<span className="underline"></span></h2>
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
