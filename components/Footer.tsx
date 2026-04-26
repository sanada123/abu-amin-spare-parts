"use client";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { tr } from "@/lib/i18n";
import { STORE, whatsappUrl } from "@/lib/store-config";

const PHONE_LANDLINE = STORE.phoneLandline;
const PHONE_MOBILE = STORE.phoneMobile;
const PHONE_LANDLINE_HREF = `tel:+972${STORE.phoneLandline.replace(/-/g, "").replace(/^0/, "")}`;
const PHONE_MOBILE_HREF = `tel:+972${STORE.phoneMobile.replace(/-/g, "").replace(/^0/, "")}`;
const WA_HREF = `https://wa.me/${STORE.whatsappNumber}`;
const ADDRESS = STORE.address;
const VAT_ID = process.env.NEXT_PUBLIC_VAT_ID;

export default function Footer() {
  const waText = encodeURIComponent("שלום, אני מעוניין בחלפים / כלים");

  return (
    <footer>
      <div className="footer-inner">
        {/* Brand + contact col */}
        <div className="footer-col" style={{ gridColumn: "span 2" }}>
          <img
            src="/brand/logo-horizontal.png"
            alt="לוגו אבו אמין חלפים"
            style={{ height: 44, width: "auto", display: "block", marginBottom: 10 }}
          />
          <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", lineHeight: 1.7, margin: "0 0 16px" }}>
            חנות חלפים ותיקה בלב הכרמל — חלקי חילוף לרכב, שמנים, מצברים, כלי עבודה, מכונות שטיפה וציוד גינה.
          </p>

          {/* Tap-to-call — landline */}
          <a
            href={PHONE_LANDLINE_HREF}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "var(--accent)",
              color: "var(--accent-fg)",
              fontWeight: 800,
              fontSize: "1.1rem",
              padding: "12px 20px",
              minHeight: 44,
              borderRadius: "var(--radius-sm)",
              marginBottom: 8,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
            aria-label="התקשר — קו נייח"
          >
            <Phone size={18} aria-hidden="true" />
            {PHONE_LANDLINE}
          </a>

          {/* Tap-to-call — mobile */}
          <a
            href={PHONE_MOBILE_HREF}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "var(--surface-2)",
              color: "var(--text)",
              fontWeight: 700,
              fontSize: "1rem",
              padding: "10px 18px",
              minHeight: 44,
              borderRadius: "var(--radius-sm)",
              marginBottom: 12,
              textDecoration: "none",
              marginInlineStart: 8,
            }}
            aria-label="התקשר — נייד"
          >
            <Phone size={16} aria-hidden="true" />
            {PHONE_MOBILE}
          </a>

          {/* WhatsApp button */}
          <div style={{ marginBottom: 16 }}>
            <a
              href={`${WA_HREF}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#25D366",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.9rem",
                padding: "10px 18px",
                minHeight: 44,
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
              aria-label="שלח WhatsApp"
            >
              <MessageCircle size={16} aria-hidden="true" />
              WhatsApp · {PHONE_MOBILE}
            </a>
          </div>

          {/* Address + hours */}
          <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: 1.8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={13} aria-hidden="true" style={{ flexShrink: 0 }} />
              {ADDRESS}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={13} aria-hidden="true" style={{ flexShrink: 0 }} />
              {STORE.hours}
            </div>
          </div>
        </div>

        {/* Shop col */}
        <div className="footer-col">
          <h4>חנות</h4>
          <Link href="/catalog">חלפי רכב</Link>
          <Link href="/catalog?group=tools">כלים ומכונות</Link>
          <Link href="/catalog?group=garden">גינה</Link>
          <Link href="/cart">הזמנות</Link>
          <Link href="/vehicle">{tr("cta_select_vehicle")}</Link>
        </div>

        {/* Info col */}
        <div className="footer-col">
          <h4>מידע</h4>
          <Link href="/about">אודות</Link>
          <Link href="/contact">צור קשר</Link>
          <a href="#">אחריות</a>
          <a href="#">החזרות</a>
          <a href="#">משלוחים</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {tr("brand")}</span>
        {VAT_ID && VAT_ID !== "XXXXXXXX" && (
          <>
            <span style={{ margin: "0 8px", color: "var(--border-strong)" }}>·</span>
            <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
              ח״פ: {VAT_ID}
            </span>
          </>
        )}
        <span style={{ margin: "0 8px", color: "var(--border-strong)" }}>·</span>
        <span>כל הזכויות שמורות</span>
      </div>
    </footer>
  );
}
