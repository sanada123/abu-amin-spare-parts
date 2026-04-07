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
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <span className="brand-icon">🔧</span>
            <span>{tr("brand", locale)}</span>
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
