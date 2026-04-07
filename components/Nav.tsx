"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useActiveVehicleId, useCart, useLocale, setLocale } from "@/lib/cart";
import { getVehicle } from "@/lib/data";
import { tr, type Locale } from "@/lib/i18n";

export default function Nav() {
  const locale = useLocale();
  const cart = useCart();
  const vehicleId = useActiveVehicleId();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const vehicle = vehicleId ? getVehicle(vehicleId) : null;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const cycleLocale = () => {
    const order: Locale[] = ["he", "ar", "en"];
    const next = order[(order.indexOf(locale) + 1) % order.length];
    setLocale(next);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

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
            <span className="brand-logo">
              <img src="/brand/logo.jpg" alt="Abu Amin Maher Malak" />
            </span>
            <div className="brand-text">
              <span className="name">{tr("brand", locale)}</span>
              <span className="sub">{tr("tagline", locale)}</span>
            </div>
          </Link>
          {/* Desktop inline search */}
          <form className="nav-search" onSubmit={submitSearch}>
            <span style={{ fontSize: "1rem" }}>🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tr("search_placeholder", locale)}
            />
          </form>
          <div className="nav-actions">
            <div className="locale-switch">
              {(["he", "ar", "en"] as Locale[]).map((l) => (
                <button key={l} className={l === locale ? "active" : ""} onClick={() => setLocale(l)}>
                  {l === "he" ? "עב" : l === "ar" ? "عر" : "EN"}
                </button>
              ))}
            </div>
            <button className="locale-mobile" onClick={cycleLocale} aria-label="Change language">
              {locale === "he" ? "עב" : locale === "ar" ? "عر" : "EN"}
            </button>
            <Link href="/cart" className="cart-btn" aria-label={tr("cart", locale)}>
              <span>🛒</span>
              <span className="label">{tr("cart", locale)}</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
        {/* Mobile search row */}
        <div className="nav-search-row">
          <form className="nav-search" onSubmit={submitSearch}>
            <span style={{ fontSize: "1rem" }}>🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tr("search_placeholder", locale)}
            />
          </form>
        </div>
      </nav>
      {vehicle ? (
        <div className="vehicle-banner">
          <div className="vehicle-banner-inner">
            <span className="car-emoji">🚗</span>
            <span>
              {locale === "en" ? "For: " : locale === "ar" ? "لـ: " : "עבור: "}
              <strong>
                {vehicle.year} {vehicle.makeName[locale]} {vehicle.modelName[locale]}
              </strong>
            </span>
            <Link href="/vehicle" className="change-link">
              {locale === "en" ? "Change" : locale === "ar" ? "تغيير" : "שנה"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="vehicle-banner warning">
          <div className="vehicle-banner-inner">
            <span className="car-emoji">⚠️</span>
            <strong style={{ fontSize: "0.82rem" }}>{tr("no_vehicle_warning", locale)}</strong>
            <Link href="/vehicle" className="change-link">
              {locale === "en" ? "Select" : locale === "ar" ? "اختر" : "בחר"}
            </Link>
          </div>
        </div>
      )}

      {/* BOTTOM NAV - mobile only */}
      <nav className="bottom-nav">
        <Link href="/" className={isActive("/") && !pathname?.startsWith("/catalog") ? "active" : ""}>
          <span className="icon">🏠</span>
          <span>{locale === "en" ? "Home" : locale === "ar" ? "الرئيسية" : "בית"}</span>
        </Link>
        <Link href="/catalog" className={isActive("/catalog") ? "active" : ""}>
          <span className="icon">🔧</span>
          <span>{locale === "en" ? "Parts" : locale === "ar" ? "قطع" : "חלפים"}</span>
        </Link>
        <Link href="/vehicle" className={isActive("/vehicle") ? "active" : ""}>
          <span className="icon">🚗</span>
          <span>{locale === "en" ? "Vehicle" : locale === "ar" ? "سيارة" : "רכב"}</span>
        </Link>
        <Link href="/cart" className={isActive("/cart") ? "active" : ""} style={{ position: "relative" }}>
          <span className="icon">🛒</span>
          <span>{locale === "en" ? "Cart" : locale === "ar" ? "السلة" : "עגלה"}</span>
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: 6, insetInlineEnd: "25%",
              background: "var(--red)", color: "white",
              fontSize: "0.62rem", fontWeight: 900,
              minWidth: 18, height: 18, borderRadius: 9,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "0 5px", border: "2px solid var(--black)",
            }}>{cartCount}</span>
          )}
        </Link>
      </nav>
    </>
  );
}
