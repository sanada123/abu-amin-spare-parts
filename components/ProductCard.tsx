"use client";
import Link from "next/link";
import { ShoppingCart, CheckCircle, AlertCircle } from "lucide-react";
import { tr } from "@/lib/i18n";
import { useLocale } from "@/lib/cart";

interface ProductCardProps {
  slug: string;
  name: string;
  imageSrc: string;
  price: number;
  oemNumbers?: string[];
  brands?: string[];
  tiers?: Array<"original" | "replacement">;
  skuCount?: number;
  vehicleLabel?: string;
  deliveryDays?: number;
  inStock?: boolean;
  fitsActiveCar?: boolean;
}

export default function ProductCard({
  slug,
  name,
  imageSrc,
  price,
  oemNumbers = [],
  brands = [],
  tiers = [],
  skuCount = 0,
  vehicleLabel,
  deliveryDays,
  inStock = true,
  fitsActiveCar = false,
}: ProductCardProps) {
  const locale = useLocale();

  return (
    <Link
      href={`/part/${slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        transition: "border-color 0.15s, background 0.15s",
        minHeight: 280,
        textDecoration: "none",
        opacity: inStock ? 1 : 0.7,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "var(--border-strong)";
        (e.currentTarget as HTMLAnchorElement).style.background =
          "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "var(--border)";
        (e.currentTarget as HTMLAnchorElement).style.background =
          "var(--surface)";
      }}
    >
      {/* Image */}
      <div
        style={{
          background: "var(--surface-2)",
          aspectRatio: "1 / 1",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <img
          src={imageSrc}
          alt={name}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = "none";
            const badge = img.nextElementSibling as HTMLElement | null;
            if (badge) badge.style.display = "flex";
          }}
        />
        <div
          aria-hidden="true"
          style={{
            display: "none",
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            background: "var(--surface-3)",
            color: "var(--text-dim)",
            fontSize: "0.6rem",
            fontWeight: 600,
            textAlign: "center",
            padding: 8,
          }}
        >
          <span style={{ fontSize: "1.4rem" }}>🔧</span>
          <span>תמונה להמחשה</span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: 1,
        }}
      >
        {/* OEM numbers */}
        {oemNumbers.length > 0 && (
          <span
            style={{
              fontSize: "0.6rem",
              fontFamily: "ui-monospace, 'Cascadia Code', monospace",
              color: "var(--text-dim)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {oemNumbers.slice(0, 2).join(" · ")}
          </span>
        )}

        {/* Name */}
        <div
          style={{
            fontWeight: 600,
            fontSize: "0.82rem",
            lineHeight: 1.35,
            color: "var(--text)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
            minHeight: "2.7em",
          }}
        >
          {name}
        </div>

        {/* Vehicle label */}
        {vehicleLabel && (
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#FFC424",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.4,
              marginTop: 2,
            }}
          >
            🚗 {vehicleLabel}
          </div>
        )}

        {/* Fitment badge */}
        {fitsActiveCar && (
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--success)",
              fontWeight: 700,
              background: "var(--success-dim)",
              padding: "2px 7px",
              borderRadius: "3px",
              alignSelf: "flex-start",
              border: "1px solid rgba(34,197,94,0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CheckCircle size={10} aria-hidden="true" />
            {tr("fits_your_car", locale)}
          </span>
        )}

        {/* Brands */}
        {brands.length > 0 && (
          <div
            style={{
              fontSize: "0.63rem",
              color: "var(--text-dim)",
              fontFamily: "ui-monospace, monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {brands.slice(0, 3).join(" · ")}
            {brands.length > 3 ? ` +${brands.length - 3}` : ""}
          </div>
        )}

        {/* Tier info */}
        {tiers.length > 0 && (
          <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {tiers.includes("original") && (
              <span style={{ background: "rgba(234,179,8,0.15)", color: "#b45309", border: "1px solid rgba(234,179,8,0.4)", borderRadius: 3, padding: "1px 5px", fontWeight: 700 }}>
                מקורי
              </span>
            )}
            {tiers.includes("replacement") && (
              <span style={{ background: "var(--surface-2)", color: "var(--text-dim)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 5px", fontWeight: 600 }}>
                חליפי
              </span>
            )}
            {skuCount > 0 && (
              <span style={{ color: "var(--text-dim)" }}>· {skuCount} {skuCount === 1 ? "אפשרות" : "אפשרויות"}</span>
            )}
          </div>
        )}

        {/* Price + stock — vertical stack, price dominant */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: "clamp(1.05rem, 3vw, 1.3rem)",
              fontWeight: 800,
              color: "var(--text)",
              lineHeight: 1.1,
              direction: "ltr",
              display: "block",
            }}
          >
            ₪{price}
          </span>
          <span
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              color: !inStock ? "var(--out-of-stock)" : "var(--in-stock)",
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {!inStock
              ? "❌ אזל מהמלאי"
              : deliveryDays === 1
              ? "📦 במלאי · מחר"
              : deliveryDays === 3
              ? "📦 מלאי מוגבל · 3 ימים"
              : "📦 במלאי"}
          </span>
        </div>

        {/* Add to cart CTA */}
        <button
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/part/${slug}`;
          }}
          style={{
            width: "100%",
            height: 36,
            background: inStock ? "var(--accent)" : "var(--surface-3)",
            border: inStock ? "none" : "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: inStock ? "var(--accent-fg)" : "var(--text-dim)",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => {
            if (inStock) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (inStock) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)";
          }}
          aria-label={`${inStock ? tr("add_to_cart", locale) : "אזל מהמלאי"} — ${name}`}
        >
          {inStock ? <ShoppingCart size={12} aria-hidden="true" /> : null}
          {inStock ? tr("add_to_cart", locale) : "אזל"}
        </button>
      </div>
    </Link>
  );
}
