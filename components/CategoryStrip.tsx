"use client";
import Link from "next/link";
import {
  Disc,
  Filter,
  Settings,
  Sliders,
  Zap,
  Sun,
  Snowflake,
  Droplet,
  Settings2,
  Wind,
  Car,
  Circle,
} from "lucide-react";
import { useLocale } from "@/lib/cart";
import { categories } from "@/lib/data";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  brakes: Disc,
  filters: Filter,
  engine: Settings,
  suspension: Sliders,
  electrical: Zap,
  lighting: Sun,
  cooling: Snowflake,
  "oils-fluids": Droplet,
  transmission: Settings2,
  exhaust: Wind,
  body: Car,
  "tires-wheels": Circle,
};

export default function CategoryStrip() {
  const locale = useLocale();

  return (
    <div
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 14px",
          display: "flex",
          gap: 4,
          alignItems: "stretch",
          minWidth: "max-content",
        }}
      >
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.slug] ?? Settings;
          return (
            <Link
              key={cat.id}
              href={`/catalog?cat=${cat.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "10px 14px",
                minWidth: 72,
                color: "var(--text-muted)",
                fontSize: "0.62rem",
                fontWeight: 600,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                borderBottom: "2px solid transparent",
                transition: "color 0.15s, border-color 0.15s",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)";
                (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "transparent";
              }}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{cat.name[locale]}</span>
            </Link>
          );
        })}
      </div>
      <style>{`
        div:has(> .category-strip-inner)::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
