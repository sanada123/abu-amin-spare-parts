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
        }}
      >
        <img
          src={imageSrc}
          alt={name}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
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

        {/* Stock + price row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              color: inStock ? "var(--in-stock)" : "var(--out-of-stock)",
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: inStock ? "var(--in-stock)" : "var(--out-of-stock)",
                flexShrink: 0,
              }}
            />
            {inStock ? tr("in_stock", locale) : locale === "he" ? "אזל" : locale === "ar" ? "نفد" : "Out"}
          </span>
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1,
              direction: "ltr",
            }}
          >
            ₪{price}
          </span>
        </div>

        {/* Add to cart CTA */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // Navigate to part page for full selection
            window.location.href = `/part/${slug}`;
          }}
          style={{
            width: "100%",
            height: 36,
            background: "var(--accent)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            color: "#000",
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
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "var(--accent)")
          }
          aria-label={`${tr("add_to_cart", locale)} — ${name}`}
        >
          <ShoppingCart size={12} aria-hidden="true" />
          {tr("add_to_cart", locale)}
        </button>
      </div>
    </Link>
  );
}
