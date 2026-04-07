"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useActiveVehicleId, useCart, useLocale, setLocale } from "@/lib/cart";
import { getVehicle, vehicles } from "@/lib/data";
import { tr, t, type Locale, isRTL } from "@/lib/i18n";

export default function Nav() {
  const locale = useLocale();
  const cart = useCart();
  const vehicleId = useActiveVehicleId();
  const router = useRouter();
  const [q, setQ] = useState("");
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const vehicle = vehicleId ? getVehicle(vehicleId) : null;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const switchLocale = (l: Locale) => setLocale(l);

  return (
    <>
      <div className="top-strip">
        <div className="top-strip-inner">
          <span>📞 <strong>03-555-1234</strong></span>
          <span>🚚 {locale === "en" ? "Free shipping over ₪300" : locale === "ar" ? "شحن مجاني فوق 300₪" : "משלוח חינם מעל ₪300"}</span>
          <span>🛡️ {locale === "en" ? "1-Year Warranty" : locale === "ar" ? "ضمان سنة" : "אחריות שנה"}</span>
          <span style={{ marginInlineStart: "auto" }}>🕒 {locale === "en" ? "Sun-Thu 8:00-19:00" : locale === "ar" ? "الأحد-الخميس 8:00-19:00" : "א׳-ה׳ 8:00-19:00"}</span>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <span className="brand-icon">🔧</span>
            <div className="brand-text">
              <span className="name">{tr("brand", locale)}</span>
              <span className="sub">{tr("tagline", locale)}</span>
            </div>
          </Link>
          <form className="nav-search" onSubmit={submitSearch}>
            <span style={{ color: "var(--text-3)", fontSize: "1.1rem" }}>🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tr("search_placeholder", locale)}
            />
          </form>
          <div className="nav-actions">
            <div className="locale-switch">
              {(["he", "ar", "en"] as Locale[]).map((l) => (
                <button key={l} className={l === locale ? "active" : ""} onClick={() => switchLocale(l)}>
                  {l === "he" ? "עב" : l === "ar" ? "عر" : "EN"}
                </button>
              ))}
            </div>
            <Link href="/cart" className="cart-btn">
              <span>🛒</span>
              <span>{tr("cart", locale)}</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>
      {vehicle ? (
        <div className="vehicle-banner">
          <div className="vehicle-banner-inner">
            <span className="car-emoji">🚗</span>
            <span>
              {locale === "en" ? "Showing parts for: " : locale === "ar" ? "عرض القطع لـ: " : "מציג חלקים עבור: "}
              <strong>
                {vehicle.year} {vehicle.makeName[locale]} {vehicle.modelName[locale]} {vehicle.engine}
              </strong>
            </span>
            <Link href="/vehicle" className="change-link">
              {tr("change_vehicle", locale)}
            </Link>
          </div>
        </div>
      ) : (
        <div className="vehicle-banner warning">
          <div className="vehicle-banner-inner">
            <span className="car-emoji">⚠️</span>
            <strong>{tr("no_vehicle_warning", locale)}</strong>
            <Link href="/vehicle" className="change-link">
              {tr("cta_select_vehicle", locale)} →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
