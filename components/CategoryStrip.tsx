"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; aria?: string }>> = {
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
  const pathname = usePathname();

  return (
    <div
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        scrollSnapType: "x mandatory",
      }}
      className="scrollbar-hide"
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 14px",
          display: "flex",
          gap: 2,
          alignItems: "stretch",
          minWidth: "max-content",
        }}
      >
        {categories.filter((cat) => !cat.parentId && !cat.group).map((cat) => {
          const Icon = CATEGORY_ICONS[cat.slug] ?? Settings;
          const isActive = pathname?.includes(`cat=${cat.slug}`);
          return (
            <Link
              key={cat.id}
              href={`/catalog?cat=${cat.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 16px",
                minWidth: 80,
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                fontSize: "0.62rem",
                fontWeight: 600,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                borderBottom: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                transition: "color 0.15s, border-color 0.15s",
                textDecoration: "none",
                whiteSpace: "nowrap",
                scrollSnapAlign: "start",
                minHeight: 70,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)";
                  (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "var(--accent)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                  (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "transparent";
                }
              }}
              aria-label={cat.name[locale]}
            >
              <div className="cat-strip-icon">
                <Icon size={22} aria-hidden="true" />
              </div>
              <span>{cat.name[locale]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
