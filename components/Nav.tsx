"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart, Home, Car, LayoutGrid, Wrench } from "lucide-react";
import { useActiveVehicleId, useCart, setActiveVehicleId } from "@/lib/cart";
import { getVehicle, getPart } from "@/lib/data";
import { tr } from "@/lib/i18n";
import ThemeToggle from "./ThemeToggle";

const PHONE_LANDLINE = "04-8599333";
const PHONE_MOBILE = "052-3158796";

export default function Nav() {
  const cart = useCart();
  const vehicleId = useActiveVehicleId();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const vehicle = vehicleId ? getVehicle(vehicleId) : null;
  const cartTotal = cart.reduce((sum, item) => {
    const part = getPart(item.partId);
    const sku = part?.skus.find((s) => s.id === item.skuId);
    return sum + (sku?.priceIls ?? 0) * item.qty;
  }, 0);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <>
      {/* Top info strip — desktop only */}
      <div className="top-strip">
        <div className="top-strip-inner">
          <a href={`tel:+972${PHONE_LANDLINE.replace(/-/g, "").replace(/^0/, "")}`}
             style={{ color: "inherit", textDecoration: "none" }}>
            <strong>📞 {PHONE_LANDLINE}</strong>
          </a>
          <a href={`tel:+972${PHONE_MOBILE.replace(/-/g, "").replace(/^0/, "")}`}
             style={{ color: "inherit", textDecoration: "none" }}>
            📱 {PHONE_MOBILE}
          </a>
          <span>משלוח חינם מעל ₪300</span>
          <span style={{ marginInlineStart: "auto", color: "var(--text-dim)" }}>
            א׳–ה׳ 08:00–18:00 · ו׳ 08:00–13:00
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label="אבו אמין חלפים — דף הבית">
            <img
              src="/brand/logo-horizontal.png"
              alt="אבו אמין חלפים"
              style={{ height: 50, width: "auto", display: "block" }}
            />
          </Link>

          {/* Desktop search */}
          <form className="nav-search" onSubmit={submitSearch} role="search">
            <Search size={15} color="var(--text-dim)" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tr("search_placeholder")}
              aria-label={tr("search_placeholder")}
            />
          </form>

          <div className="nav-actions">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Cart / Order */}
            <Link
              href="/cart"
              className="cart-btn"
              aria-label={`${tr("cart")}${cartCount > 0 ? ` (${cartCount})` : ""}`}
            >
              <ShoppingCart size={17} aria-hidden="true" />
              <span className="label">{tr("cart")}</span>
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
              placeholder={tr("search_placeholder")}
              aria-label={tr("search_placeholder")}
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
              עבור:{" "}
              <strong>
                {vehicle.year} {vehicle.makeName.he} {vehicle.modelName.he}
              </strong>
            </span>
            <Link href="/vehicle" className="change-link">
              שנה
            </Link>
            <button
              type="button"
              className="change-link clear-vehicle-btn"
              onClick={() => setActiveVehicleId(null)}
              aria-label="איפוס רכב"
              title="איפוס"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Mobile sticky order bar — shows when cart has items */}
      {cartCount > 0 && (
        <div className="mobile-cart-bar" role="status" aria-live="polite">
          <div className="cart-info">
            <span className="cart-count" aria-label={`${cartCount} פריטים בהזמנה`}>
              {cartCount}
            </span>
            <span className="cart-label">
              {cartTotal > 0 ? `₪${cartTotal.toLocaleString()}` : "הזמנה"}
            </span>
          </div>
          <Link href="/cart" className="cart-cta" aria-label="לשליחת הזמנה">
            לשליחת הזמנה →
          </Link>
        </div>
      )}

      {/* Bottom nav — mobile only */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <Link
          href="/"
          className={isActive("/") && !pathname?.startsWith("/catalog") ? "active" : ""}
          aria-label="בית"
        >
          <Home size={20} className="icon" aria-hidden="true" />
          <span>בית</span>
        </Link>
        <Link
          href="/catalog"
          className={isActive("/catalog") ? "active" : ""}
          aria-label="חלפים"
        >
          <LayoutGrid size={20} className="icon" aria-hidden="true" />
          <span>חלפים</span>
        </Link>
        <Link
          href="/catalog?group=tools"
          className={isActive("/catalog") && pathname?.includes("group=tools") ? "active" : ""}
          aria-label="כלים"
        >
          <Wrench size={20} className="icon" aria-hidden="true" />
          <span>כלים</span>
        </Link>
        <Link
          href="/vehicle"
          className={isActive("/vehicle") ? "active" : ""}
          aria-label="רכב"
        >
          <Car size={20} className="icon" aria-hidden="true" />
          <span>רכב</span>
        </Link>
        <Link
          href="/cart"
          className={isActive("/cart") ? "active" : ""}
          aria-label={`הזמנה${cartCount > 0 ? ` (${cartCount})` : ""}`}
          style={{ position: "relative" }}
        >
          <ShoppingCart size={20} className="icon" aria-hidden="true" />
          <span>הזמנה</span>
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
