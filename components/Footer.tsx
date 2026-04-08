"use client";
import Link from "next/link";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { useLocale } from "@/lib/cart";
import { tr } from "@/lib/i18n";

export default function Footer() {
  const locale = useLocale();

  return (
    <footer>
      <div className="footer-inner">
        {/* Brand col */}
        <div className="footer-col">
          <h4>{tr("brand", locale)}</h4>
          <p
            style={{
              color: "var(--text-dim)",
              fontSize: "0.8rem",
              lineHeight: 1.6,
              margin: "0 0 16px",
            }}
          >
            {tr("tagline", locale)}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href="tel:0355551234"
              aria-label="Phone"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-muted)",
                transition: "color 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
              }}
            >
              <Phone size={15} aria-hidden="true" />
            </a>
            <a
              href="#"
              aria-label="WhatsApp"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-muted)",
                transition: "color 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--success)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--success)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
              }}
            >
              <MessageCircle size={15} aria-hidden="true" />
            </a>
            <a
              href="mailto:info@abuamin.co.il"
              aria-label="Email"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-muted)",
                transition: "color 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
              }}
            >
              <Mail size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Shop col */}
        <div className="footer-col">
          <h4>
            {locale === "en" ? "Shop" : locale === "ar" ? "تسوق" : "חנות"}
          </h4>
          <Link href="/catalog">{tr("shop_by_category", locale)}</Link>
          <Link href="/catalog">{tr("service_kits", locale)}</Link>
          <Link href="/catalog">{tr("brands_we_carry", locale)}</Link>
          <Link href="/vehicle">
            {locale === "en"
              ? "Select Vehicle"
              : locale === "ar"
              ? "اختر سيارتك"
              : "בחר רכב"}
          </Link>
        </div>

        {/* Support col */}
        <div className="footer-col">
          <h4>
            {locale === "en"
              ? "Support"
              : locale === "ar"
              ? "الدعم"
              : "תמיכה"}
          </h4>
          <a href="#">
            {locale === "en"
              ? "Contact Us"
              : locale === "ar"
              ? "تواصل معنا"
              : "צור קשר"}
          </a>
          <a href="#">
            {locale === "en"
              ? "Returns Policy"
              : locale === "ar"
              ? "سياسة الإرجاع"
              : "מדיניות החזרות"}
          </a>
          <a href="#">
            {locale === "en"
              ? "Shipping Info"
              : locale === "ar"
              ? "معلومات الشحن"
              : "מידע על משלוחים"}
          </a>
          <a href="#">
            {locale === "en"
              ? "Track Order"
              : locale === "ar"
              ? "تتبع الطلب"
              : "מעקב הזמנה"}
          </a>
        </div>

        {/* Legal col */}
        <div className="footer-col">
          <h4>
            {locale === "en"
              ? "Legal"
              : locale === "ar"
              ? "قانوني"
              : "מידע משפטי"}
          </h4>
          <a href="#">
            {locale === "en"
              ? "Privacy Policy"
              : locale === "ar"
              ? "سياسة الخصوصية"
              : "מדיניות פרטיות"}
          </a>
          <a href="#">
            {locale === "en"
              ? "Terms of Use"
              : locale === "ar"
              ? "شروط الاستخدام"
              : "תנאי שימוש"}
          </a>
          <a href="#">
            {locale === "en"
              ? "Warranty Terms"
              : locale === "ar"
              ? "شروط الضمان"
              : "תנאי אחריות"}
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {tr("brand", locale)}</span>
        <span style={{ margin: "0 8px", color: "var(--border-strong)" }}>·</span>
        <span>
          {locale === "en"
            ? "All rights reserved"
            : locale === "ar"
            ? "جميع الحقوق محفوظة"
            : "כל הזכויות שמורות"}
        </span>
      </div>
    </footer>
  );
}
