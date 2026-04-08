"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart, Home, Settings, Car, LayoutGrid } from "lucide-react";
import { useActiveVehicleId, useCart, useLocale, setLocale } from "@/lib/cart";
import { getVehicle } from "@/lib/data";
import { tr, type Locale } from "@/lib/i18n";
import ThemeToggle from "./ThemeToggle";

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
      {/* Top info strip — desktop only */}
      <div className="top-strip">
        <div className="top-strip-inner">
          <span>
            <strong>03-555-1234</strong>
          </span>
          <span>
            {locale === "en"
              ? "Free shipping over ₪300"
              : locale === "ar"
              ? "شحن مجاني فوق 300₪"
              : "משלוח חינם מעל ₪300"}
          </span>
          <span>
            {locale === "en"
              ? "1-Year Warranty"
              : locale === "ar"
              ? "ضمان سنة"
              : "אחריות שנה"}
          </span>
          <span style={{ marginInlineStart: "auto", color: "var(--text-dim)" }}>
            {locale === "en"
              ? "Sun–Thu 8:00–19:00"
              : locale === "ar"
              ? "الأحد–الخميس 8:00–19:00"
              : "א׳–ה׳ 8:00–19:00"}
          </span>
        </div>
      </div>

      {/* Main nav */}
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

          {/* Desktop search */}
          <form className="nav-search" onSubmit={submitSearch} role="search">
            <Search size={15} color="var(--text-dim)" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tr("search_placeholder", locale)}
              aria-label={tr("search_placeholder", locale)}
            />
          </form>

          <div className="nav-actions">
            {/* Language switcher desktop */}
            <div className="locale-switch">
              {(["he", "ar", "en"] as Locale[]).map((l) => (
                <button
                  key={l}
                  className={l === locale ? "active" : ""}
                  onClick={() => setLocale(l)}
                  aria-pressed={l === locale}
                >
                  {l === "he" ? "עב" : l === "ar" ? "عر" : "EN"}
                </button>
              ))}
            </div>

            {/* Language switcher mobile */}
            <button
              className="locale-mobile"
              onClick={cycleLocale}
              aria-label="Change language"
            >
              {locale === "he" ? "עב" : locale === "ar" ? "عر" : "EN"}
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Cart */}
            <Link
              href="/cart"
              className="cart-btn"
              aria-label={`${tr("cart", locale)}${cartCount > 0 ? ` (${cartCount})` : ""}`}
            >
              <ShoppingCart size={17} aria-hidden="true" />
              <span className="label">{tr("cart", locale)}</span>
              {cartCount > 0 && (
                <span className="cart-badge" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search row */}
        <div className="nav-search-row">
          <form className="nav-search" onSubmit={submitSearch} role="search">
            <Search size={14} color="var(--text-dim)" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tr("search_placeholder", locale)}
              aria-label={tr("search_placeholder", locale)}
            />
          </form>
        </div>
      </nav>

      {/* Vehicle banner */}
      {vehicle && (
        <div className="vehicle-banner" role="banner" aria-label="Active vehicle">
          <div className="vehicle-banner-inner">
            <Car size={15} color="var(--accent)" aria-hidden="true" />
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
      )}

      {/* Bottom nav — mobile only */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <Link
          href="/"
          className={isActive("/") && !pathname?.startsWith("/catalog") ? "active" : ""}
          aria-label={locale === "en" ? "Home" : locale === "ar" ? "الرئيسية" : "בית"}
        >
          <Home size={20} className="icon" aria-hidden="true" />
          <span>{locale === "en" ? "Home" : locale === "ar" ? "الرئيسية" : "בית"}</span>
        </Link>
        <Link
          href="/catalog"
          className={isActive("/catalog") ? "active" : ""}
          aria-label={locale === "en" ? "Parts" : locale === "ar" ? "قطع" : "חלפים"}
        >
          <LayoutGrid size={20} className="icon" aria-hidden="true" />
          <span>{locale === "en" ? "Parts" : locale === "ar" ? "قطع" : "חלפים"}</span>
        </Link>
        <Link
          href="/vehicle"
          className={isActive("/vehicle") ? "active" : ""}
          aria-label={locale === "en" ? "Vehicle" : locale === "ar" ? "سيارة" : "רכב"}
        >
          <Car size={20} className="icon" aria-hidden="true" />
          <span>{locale === "en" ? "Vehicle" : locale === "ar" ? "سيارة" : "רכב"}</span>
        </Link>
        <Link
          href="/cart"
          className={isActive("/cart") ? "active" : ""}
          aria-label={`${locale === "en" ? "Cart" : locale === "ar" ? "السلة" : "עגלה"}${cartCount > 0 ? ` (${cartCount})` : ""}`}
          style={{ position: "relative" }}
        >
          <ShoppingCart size={20} className="icon" aria-hidden="true" />
          <span>{locale === "en" ? "Cart" : locale === "ar" ? "السلة" : "עגלה"}</span>
          {cartCount > 0 && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 6,
                insetInlineEnd: "22%",
                background: "var(--danger)",
                color: "white",
                fontSize: "0.6rem",
                fontWeight: 800,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: "2px solid var(--bg)",
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </nav>
    </>
  );
}
