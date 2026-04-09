"use client";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Clock, Shield, Users, Wrench } from "lucide-react";
import { tr } from "@/lib/i18n";

const PHONE_LANDLINE = "04-8599333";
const PHONE_MOBILE = "052-3158796";
const PHONE_LANDLINE_HREF = "tel:+97248599333";
const PHONE_MOBILE_HREF = "tel:+972523158796";
const WA_HREF = "https://wa.me/972523158796";
const ADDRESS = "כביש ראשי דלית עוספיא, מול אמל חשמל, עוספיה";

export default function AboutPage() {
  const waText = encodeURIComponent("שלום, אני מעוניין בחלפים / כלים");

  return (
    <main>
      <section>
        <div className="section-head">
          <h1>אודות אבו אמין חלפים<span className="underline" /></h1>
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
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>מי אנחנו</h2>
            </div>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.8, margin: "0 0 12px", fontSize: "0.9rem" }}>
              חנות חלפים ותיקה בלב הכרמל, ממוקמת בעוספיה. אנחנו משרתים מוסכים ולקוחות פרטיים בכל הצפון — חיפה, הכרמל, נצרת וסביבתם.
            </p>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.8, margin: 0, fontSize: "0.9rem" }}>
              מלאי רחב: חלקי חילוף לרכב, שמנים, מצברים, כלי עבודה, מכונות שטיפה בלחץ, קיטורים, מדחסי אוויר וציוד גינה — הכל במקום אחד.
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
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>הספקים שלנו</h2>
            </div>
            <p style={{ color: "var(--text-dim)", lineHeight: 1.8, margin: "0 0 16px", fontSize: "0.9rem" }}>
              עובדים עם הספקים הגדולים בישראל, המייבאים ישירות מהיצרנים המובילים בגרמניה, יפן ואיטליה. מחירים הוגנים, אמינות ושירות אישי.
            </p>
            <div style={{
              background: "var(--surface-2)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}>
              🔧 משרתים מוסכים ולקוחות פרטיים
            </div>
          </div>

          {/* What we sell card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "28px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "var(--accent)", borderRadius: "var(--radius-sm)", padding: 8 }}>
                <Wrench size={18} color="#000" aria-hidden="true" />
              </div>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>מה אנחנו מוכרים</h2>
            </div>
            <ul style={{ color: "var(--text-dim)", lineHeight: 2, margin: 0, padding: "0 16px", fontSize: "0.9rem" }}>
              <li>חלקי חילוף לרכב — בלמים, מנוע, מסננים, מתלים, פנסים ועוד</li>
              <li>שמנים ומצברים</li>
              <li>כלי עבודה ידניים וחשמליים</li>
              <li>מכונות שטיפה בלחץ וקיטורים</li>
              <li>מדחסי אוויר ושואבי אבק</li>
              <li>ציוד גינה — חרמשים, כלי גינון, מכסחות דשא</li>
            </ul>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 12, fontStyle: "italic" }}>
              * אנחנו מוכרים חלקים בלבד — לא מבצעים שירותי תיקון
            </p>
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
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>שעות פעילות</h2>
            </div>
            <p style={{ color: "var(--text-dim)", lineHeight: 2, margin: 0, fontSize: "0.9rem" }}>
              א׳–ה׳ 08:00–18:00<br />
              ו׳ 08:00–13:00<br />
              שבת — סגור
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
          <h2 style={{ marginTop: 0, marginBottom: 24 }}>צור קשר</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-dim)", fontSize: "0.9rem" }}>
              <MapPin size={18} color="var(--accent)" aria-hidden="true" />
              <span>{ADDRESS}</span>
            </div>

            <a
              href={PHONE_LANDLINE_HREF}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "var(--accent)",
                color: "#000",
                fontWeight: 800,
                fontSize: "1.05rem",
                padding: "14px 20px",
                minHeight: 44,
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
              aria-label="התקשר — קו נייח"
            >
              <Phone size={18} aria-hidden="true" />
              {PHONE_LANDLINE} — נייח
            </a>

            <a
              href={PHONE_MOBILE_HREF}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "var(--surface-2)",
                color: "var(--text)",
                fontWeight: 700,
                fontSize: "1rem",
                padding: "13px 20px",
                minHeight: 44,
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
              aria-label="התקשר — נייד"
            >
              <Phone size={18} aria-hidden="true" />
              {PHONE_MOBILE} — נייד / WhatsApp
            </a>

            <a
              href={`${WA_HREF}?text=${waText}`}
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
                minHeight: 44,
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} aria-hidden="true" />
              WhatsApp
            </a>

            <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/catalog" className="cta" style={{ display: "inline-block" }}>
                {tr("shop_by_category")} →
              </Link>
              <Link href="/contact" style={{
                display: "inline-block",
                padding: "10px 18px",
                background: "var(--surface-2)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}>
                מפה ונסיעה →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
