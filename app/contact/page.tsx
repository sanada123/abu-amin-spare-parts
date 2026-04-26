import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Clock, Navigation } from "lucide-react";

export const metadata: Metadata = {
  title: "צור קשר | אבו אמין חלפים — עוספיה",
  description: "כביש ראשי דלית עוספיא, מול אמל חשמל, עוספיה. 04-8599333 · 052-3158796",
};

const PHONE_LANDLINE = "04-8599333";
const PHONE_MOBILE = "052-3158796";
const PHONE_LANDLINE_HREF = "tel:+97248599333";
const PHONE_MOBILE_HREF = "tel:+972523158796";
const WA_HREF = "https://wa.me/972523158796";
const ADDRESS = "כביש ראשי דלית עוספיא, מול אמל חשמל, עוספיה";

export default function ContactPage() {
  return (
    <main>
      <section>
        <div className="section-head">
          <h1>צור קשר<span className="underline" /></h1>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
          marginBottom: 32,
        }}>
          {/* Contact details card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            <h2 style={{ margin: 0, fontSize: "1.15rem" }}>פרטי קשר</h2>

            {/* Address */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <MapPin size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>כתובת</div>
                <div style={{ color: "var(--text-dim)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {ADDRESS}
                </div>
              </div>
            </div>

            {/* Hours */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <Clock size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>שעות פעילות</div>
                <div style={{ color: "var(--text-dim)", fontSize: "0.9rem", lineHeight: 2 }}>
                  א׳–ה׳ 08:00–18:00<br />
                  ו׳ 08:00–13:00<br />
                  שבת — סגור
                </div>
              </div>
            </div>

            {/* Phones */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href={PHONE_LANDLINE_HREF}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  padding: "14px 18px",
                  minHeight: 44,
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                }}
                aria-label={`התקשר ${PHONE_LANDLINE}`}
              >
                <Phone size={18} aria-hidden="true" />
                {PHONE_LANDLINE} — נייח
              </a>
              <a
                href={PHONE_MOBILE_HREF}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  padding: "13px 18px",
                  minHeight: 44,
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                }}
                aria-label={`התקשר ${PHONE_MOBILE}`}
              >
                <Phone size={18} aria-hidden="true" />
                {PHONE_MOBILE} — נייד
              </a>
              <a
                href={`${WA_HREF}?text=${encodeURIComponent("שלום, אני מעוניין בחלפים / כלים")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#25D366",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  padding: "13px 18px",
                  minHeight: 44,
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                }}
                aria-label="שלח הודעת WhatsApp"
              >
                <MessageCircle size={18} aria-hidden="true" />
                WhatsApp · {PHONE_MOBILE}
              </a>
            </div>
          </div>

          {/* Directions card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "28px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Navigation size={20} color="var(--accent)" aria-hidden="true" />
              <h2 style={{ margin: 0, fontSize: "1.15rem" }}>איך להגיע</h2>
            </div>
            <div style={{ color: "var(--text-dim)", fontSize: "0.9rem", lineHeight: 2 }}>
              <p style={{ margin: "0 0 12px" }}>
                <strong>מחיפה / דלית אל כרמל:</strong><br />
                קח את הכביש הראשי לעוספיה. החנות נמצאת על הכביש הראשי, מול אמל חשמל.
              </p>
              <p style={{ margin: "0 0 12px" }}>
                <strong>מנצרת / צפון:</strong><br />
                כביש 70 לכיוון עוספיה, היכנס לכפר דרך הכניסה הראשית.
              </p>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem" }}>
                חניה זמינה ליד החנות.
              </p>
            </div>
            <div style={{ marginTop: 20 }}>
              <a
                href="https://maps.google.com/?q=אבו+אמין+חלפים+עוספיה"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  padding: "10px 16px",
                  minHeight: 44,
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                }}
              >
                <MapPin size={16} aria-hidden="true" />
                פתח ב-Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Google Maps iframe */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          marginBottom: 32,
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ margin: 0, fontSize: "1rem" }}>
              <MapPin size={16} style={{ display: "inline", marginInlineEnd: 6, color: "var(--accent)" }} aria-hidden="true" />
              מפה — {ADDRESS}
            </h2>
          </div>
          <iframe
            title="מיקום אבו אמין חלפים עוספיה"
            src="https://maps.google.com/maps?q=אבו+אמין+חלפים+עוספיה&output=embed&z=15&hl=he"
            width="100%"
            height="400"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/catalog" className="cta">
            לחנות →
          </Link>
          <Link href="/vehicle" style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text)",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}>
            בחר רכב וחפש חלפים
          </Link>
        </div>
      </section>
    </main>
  );
}
