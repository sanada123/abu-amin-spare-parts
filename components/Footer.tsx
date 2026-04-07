"use client";
import { useLocale } from "@/lib/cart";
import { tr } from "@/lib/i18n";

export default function Footer() {
  const locale = useLocale();
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-col">
          <h4>{tr("brand", locale)}</h4>
          <p style={{ color: "var(--text-2)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
            {tr("tagline", locale)}
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <a href="#" aria-label="WhatsApp">💬</a>
            <a href="#" aria-label="Phone">📞</a>
            <a href="#" aria-label="Email">✉️</a>
          </div>
        </div>
        <div className="footer-col">
          <h4>{locale === "en" ? "Shop" : locale === "ar" ? "تسوق" : "חנות"}</h4>
          <a href="/">{tr("shop_by_category", locale)}</a>
          <a href="/">{tr("service_kits", locale)}</a>
          <a href="/">{tr("brands_we_carry", locale)}</a>
        </div>
        <div className="footer-col">
          <h4>{locale === "en" ? "Support" : locale === "ar" ? "الدعم" : "תמיכה"}</h4>
          <a href="#">{locale === "en" ? "Contact" : locale === "ar" ? "تواصل معنا" : "צור קשר"}</a>
          <a href="#">{locale === "en" ? "Returns" : locale === "ar" ? "الإرجاع" : "החזרות"}</a>
          <a href="#">{locale === "en" ? "Shipping" : locale === "ar" ? "الشحن" : "משלוחים"}</a>
        </div>
        <div className="footer-col">
          <h4>{locale === "en" ? "Legal" : locale === "ar" ? "قانوني" : "מידע משפטי"}</h4>
          <a href="#">{locale === "en" ? "Privacy" : locale === "ar" ? "الخصوصية" : "פרטיות"}</a>
          <a href="#">{locale === "en" ? "Terms" : locale === "ar" ? "الشروط" : "תנאי שימוש"}</a>
          <a href="#">{locale === "en" ? "Warranty" : locale === "ar" ? "الضمان" : "אחריות"}</a>
        </div>
      </div>
      <div className="footer-bottom">© 2026 {tr("brand", locale)} — All rights reserved</div>
    </footer>
  );
}
