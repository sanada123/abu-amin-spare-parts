"use client";
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { useLocale } from "@/lib/cart";
import { tr } from "@/lib/i18n";

const PHONE = process.env.NEXT_PUBLIC_PHONE_NUMBER || "050-XXXXXXX";
const PHONE_HREF = `tel:${(process.env.NEXT_PUBLIC_PHONE_NUMBER || "050XXXXXXX").replace(/-/g, "")}`;
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "972500000000";
const WA_HREF = `https://wa.me/${WA_NUMBER}`;
const ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "עוספיא / דלית אל כרמל";
const VAT_ID = process.env.NEXT_PUBLIC_VAT_ID || "XXXXXXXX";

export default function Footer() {
  const locale = useLocale();

  const waText = locale === "ar"
    ? encodeURIComponent("שלום, אני מעוניין בחלפים לרכב שלי")
    : encodeURIComponent("שלום, אני מעוניין בחלפים לרכב שלי");

  return (
    <footer>
      <div className="footer-inner">
        {/* Brand + contact col */}
        <div className="footer-col" style={{ gridColumn: "span 2" }}>
          <h4 style={{ fontSize: "1.1rem", marginBottom: 6 }}>{tr("brand", locale)}</h4>
          <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", lineHeight: 1.7, margin: "0 0 16px" }}>
            {locale === "ar"
              ? "متجر قطع غيار سيارات في منطقة عسفيا / دالية الكرمل — خدمة للميكانيكيين والأفراد."
              : "חנות חלפים לרכב באזור עוספיא / דלית אל כרמל — שירות למוסכים ולפרטיים."}
          </p>

          {/* Big tap-to-call */}
          <a
            href={PHONE_HREF}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "var(--accent)",
              color: "#000",
              fontWeight: 800,
              fontSize: "1.1rem",
              padding: "12px 20px",
              borderRadius: "var(--radius-sm)",
              marginBottom: 12,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
            aria-label={locale === "ar" ? "اتصل بنا" : "התקשר אלינו"}
          >
            <Phone size={18} aria-hidden="true" />
            {PHONE}
          </a>

          {/* WhatsApp button */}
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
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              marginInlineStart: 8,
            }}
            aria-label="WhatsApp"
          >
            <MessageCircle size={16} aria-hidden="true" />
            WhatsApp
          </a>

          {/* Address + hours */}
          <div style={{ marginTop: 16, fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: 1.8 }}>
            <div>📍 {ADDRESS}</div>
            <div>
              {locale === "ar"
                ? "ساعات العمل: الأحد–الخميس 08:00–18:00، الجمعة 08:00–13:00"
                : "שעות פעילות: א׳–ה׳ 08:00–18:00, ו׳ 08:00–13:00"}
            </div>
          </div>
        </div>

        {/* Shop col */}
        <div className="footer-col">
          <h4>{locale === "ar" ? "تسوق" : "חנות"}</h4>
          <Link href="/catalog">{tr("shop_by_category", locale)}</Link>
          <Link href="/catalog">{tr("service_kits", locale)}</Link>
          <Link href="/catalog">{tr("brands_we_carry", locale)}</Link>
          <Link href="/vehicle">{tr("cta_select_vehicle", locale)}</Link>
        </div>

        {/* Info col */}
        <div className="footer-col">
          <h4>{locale === "ar" ? "معلومات" : "מידע"}</h4>
          <Link href="/about">{locale === "ar" ? "אודות" : "אודות"}</Link>
          <a href="#">{locale === "ar" ? "الضمان" : "אחריות"}</a>
          <a href="#">{locale === "ar" ? "سياسة الإرجاع" : "החזרות"}</a>
          <a href="#">{locale === "ar" ? "معلومات الشحن" : "משלוחים"}</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {tr("brand", locale)}</span>
        {VAT_ID !== "XXXXXXXX" && (
          <>
            <span style={{ margin: "0 8px", color: "var(--border-strong)" }}>·</span>
            <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
              {locale === "ar" ? "رقم الشركة" : "ח״פ"}: {VAT_ID}
            </span>
          </>
        )}
        <span style={{ margin: "0 8px", color: "var(--border-strong)" }}>·</span>
        <span>{locale === "ar" ? "جميع الحقوق محفوظة" : "כל הזכויות שמורות"}</span>
      </div>
    </footer>
  );
}
