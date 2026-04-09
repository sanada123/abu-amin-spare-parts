"use client";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Clock, Shield, Users } from "lucide-react";
import { useLocale } from "@/lib/cart";
import { tr } from "@/lib/i18n";

const PHONE = process.env.NEXT_PUBLIC_PHONE_NUMBER || "050-XXXXXXX";
const PHONE_HREF = `tel:${(process.env.NEXT_PUBLIC_PHONE_NUMBER || "050XXXXXXX").replace(/-/g, "")}`;
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "972500000000";

export default function AboutPage() {
  const locale = useLocale();

  const waText = encodeURIComponent(locale === "ar"
    ? "שלום، أنا مهتم في قطع الغيار"
    : "שלום, אני מעוניין בחלפים לרכב שלי");

  const content = {
    title: { he: "אודות אבו אמין חלפים", ar: "عن أبو أمين لقطع الغيار" },
    intro: {
      he: "חנות חלפים ואביזרים לרכב, ממוקמת בעוספיא / דלית אל כרמל — הלב של מרכז הכרמל. אנו משרתים מוסכים ולקוחות פרטיים בכל הצפון.",
      ar: "متجر قطع غيار وإكسسوارات للسيارات، يقع في عسفيا / دالية الكرمل — قلب منطقة الكرمل. نخدم الميكانيكيين والعملاء الخاصين في جميع أنحاء الشمال.",
    },
    experience: {
      he: "עם שנות ניסיון בתחום, אנו מתמחים ברכבים היפניים, הקוריאניים והאירופאיים הנפוצים בישראל.",
      ar: "بسنوات من الخبرة في المجال، نتخصص في السيارات اليابانية والكورية والأوروبية الشائعة في إسرائيل.",
    },
    suppliers: {
      he: "עובדים עם הספקים הגדולים ביותר בישראל, המייבאים מישירות מהיצרנים המובילים בגרמניה, יפן ואיטליה.",
      ar: "نعمل مع أكبر الموردين في إسرائيل، الذين يستوردون مباشرة من الشركات المصنعة الرائدة في ألمانيا واليابان وإيطاليا.",
    },
    who: {
      he: "משרתים מוסכים ופרטיים",
      ar: "نخدم الميكانيكيين والأفراد",
    },
    hoursLabel: { he: "שעות פעילות", ar: "ساعات العمل" },
    hours: {
      he: "א׳–ה׳ 08:00–18:00 | ו׳ 08:00–13:00",
      ar: "الأحد–الخميس 08:00–18:00 | الجمعة 08:00–13:00",
    },
    contactTitle: { he: "צור קשר", ar: "تواصل معنا" },
    addressLabel: { he: "המחסן", ar: "موقع المستودع" },
    address: { he: "עוספיא / דלית אל כרמל, הכרמל", ar: "عسفيا / دالية الكرمل، الكرمل" },
    callUs: { he: "התקשר", ar: "اتصل بنا" },
    whatsapp: { he: "וואטסאפ", ar: "واتساب" },
  };

  return (
    <main>
      <section>
        <div className="section-head">
          <h1>{content.title[locale]}<span className="underline" /></h1>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}>
          {/* About card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "28px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "var(--accent)", borderRadius: "var(--radius-sm)", padding: 8 }}>
                <Shield size={18} color="#000" aria-hidden="true" />
              </div>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{locale === "ar" ? "من نحن" : "מי אנחנו"}</h2>
            </div>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.8, margin: "0 0 16px", fontSize: "0.9rem" }}>
              {content.intro[locale]}
            </p>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.8, margin: 0, fontSize: "0.9rem" }}>
              {content.experience[locale]}
            </p>
          </div>

          {/* Suppliers card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "28px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "var(--accent)", borderRadius: "var(--radius-sm)", padding: 8 }}>
                <Users size={18} color="#000" aria-hidden="true" />
              </div>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{locale === "ar" ? "مورّدونا" : "הספקים שלנו"}</h2>
            </div>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.8, margin: "0 0 16px", fontSize: "0.9rem" }}>
              {content.suppliers[locale]}
            </p>
            <div style={{
              background: "var(--surface-2)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}>
              🔧 {content.who[locale]}
            </div>
          </div>

          {/* Hours card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "28px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "var(--accent)", borderRadius: "var(--radius-sm)", padding: 8 }}>
                <Clock size={18} color="#000" aria-hidden="true" />
              </div>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{content.hoursLabel[locale]}</h2>
            </div>
            <p style={{ color: "var(--text-dim)", lineHeight: 2, margin: 0, fontSize: "0.9rem" }}>
              {content.hours[locale]}
            </p>
          </div>
        </div>

        {/* Contact section */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-md)",
          padding: "32px 24px",
        }}>
          <h2 style={{ marginTop: 0, marginBottom: 24 }}>{content.contactTitle[locale]}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-dim)", fontSize: "0.9rem" }}>
              <MapPin size={18} color="var(--accent)" aria-hidden="true" />
              <span>{content.address[locale]}</span>
            </div>

            <a
              href={PHONE_HREF}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "var(--accent)",
                color: "#000",
                fontWeight: 800,
                fontSize: "1.05rem",
                padding: "14px 20px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
              aria-label={content.callUs[locale]}
            >
              <Phone size={18} aria-hidden="true" />
              {PHONE} — {content.callUs[locale]}
            </a>

            <a
              href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "#25D366",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                padding: "13px 20px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} aria-hidden="true" />
              WhatsApp — {content.whatsapp[locale]}
            </a>

            <div style={{ marginTop: 8 }}>
              <Link href="/catalog" className="cta" style={{ display: "inline-block" }}>
                {tr("shop_by_category", locale)} →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
