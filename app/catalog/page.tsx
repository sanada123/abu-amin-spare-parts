"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  categories,
  brands,
  parts,
  getCategoryBySlug,
  getBrand,
  minPriceForPart,
  partsForVehicle,
  getVehicle,
  partImageUrl,
} from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useLocale, useActiveVehicleId, setActiveVehicleId } from "@/lib/cart";
import ProductCard from "@/components/ProductCard";

type SortKey = "relevance" | "price_asc" | "price_desc" | "newest";

function CatalogInner() {
  const locale = useLocale();
  const activeVehicleId = useActiveVehicleId();
  const sp = useSearchParams();
  const catSlug = sp.get("cat");
  const makeSlug = sp.get("make");
  const cat = catSlug ? getCategoryBySlug(catSlug) : null;

  const [selectedCats, setSelectedCats] = useState<number[]>(
    cat ? [cat.id] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catsExpanded, setCatsExpanded] = useState(true);
  const [brandsExpanded, setBrandsExpanded] = useState(true);

  const vehicle = activeVehicleId ? getVehicle(activeVehicleId) : null;
  const makeLabel = makeSlug
    ? makeSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const baseList = useMemo(() => {
    let list = activeVehicleId ? partsForVehicle(activeVehicleId) : parts;
    return list;
  }, [activeVehicleId]);

  const visible = useMemo(() => {
    let list = baseList;

    if (selectedCats.length > 0) {
      list = list.filter((p) => selectedCats.includes(p.categoryId));
    }
    if (selectedBrands.length > 0) {
      list = list.filter((p) =>
        p.skus.some((s) => selectedBrands.includes(s.brandId))
      );
    }

    if (sort === "price_asc") {
      list = [...list].sort((a, b) => minPriceForPart(a) - minPriceForPart(b));
    } else if (sort === "price_desc") {
      list = [...list].sort((a, b) => minPriceForPart(b) - minPriceForPart(a));
    }

    return list;
  }, [baseList, selectedCats, selectedBrands, sort]);

  const activeFilterCount =
    selectedCats.length + selectedBrands.length + (inStockOnly ? 1 : 0);

  const clearAll = () => {
    setSelectedCats([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setSort("relevance");
    if (activeVehicleId) {
      setActiveVehicleId(null);
      window.location.href = "/catalog";
    }
  };

  const toggleCat = (id: number) =>
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleBrand = (id: number) =>
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const sortLabels: Record<SortKey, Record<string, string>> = {
    relevance: { he: "רלוונטיות", ar: "الأكثر صلة" },
    price_asc: { he: "מחיר: נמוך→גבוה", ar: "السعر: الأدنى أولاً" },
    price_desc: { he: "מחיר: גבוה→נמוך", ar: "السعر: الأعلى أولاً" },
    newest: { he: "חדש ביותר", ar: "الأحدث" },
  };

  const FilterSidebar = (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        fontSize: 13,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "var(--text)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <SlidersHorizontal size={13} aria-hidden="true" />
          {"סינון"}
          {activeFilterCount > 0 && (
            <span
              style={{
                background: "var(--accent)",
                color: "#000",
                borderRadius: "3px",
                fontSize: 11,
                fontWeight: 800,
                padding: "1px 6px",
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </span>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            style={{
              color: "var(--danger)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <X size={11} />
            {"נקה הכל"}
          </button>
        )}
      </div>

      {/* Vehicle / Make filter chip */}
      {(vehicle || makeLabel) && (
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "var(--accent-dim)",
              border: "1px solid var(--accent)",
              borderRadius: "3px",
              padding: "3px 8px",
              fontSize: 11,
              color: "var(--accent)",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {vehicle
              ? `${vehicle.year} ${vehicle.makeName[locale]} ${vehicle.modelName[locale]}`
              : makeLabel}
            <button
              onClick={clearAll}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              aria-label="Remove vehicle filter"
            >
              <X size={10} color="var(--accent)" />
            </button>
          </span>
        </div>
      )}

      {/* Categories */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setCatsExpanded((v) => !v)}
          style={{
            width: "100%",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text)",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
          aria-expanded={catsExpanded}
        >
          {"קטגוריה"}
          {catsExpanded ? (
            <ChevronUp size={13} color="var(--text-dim)" />
          ) : (
            <ChevronDown size={13} color="var(--text-dim)" />
          )}
        </button>
        {catsExpanded && (
          <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {categories.map((c) => (
              <label
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  color: selectedCats.includes(c.id)
                    ? "var(--text)"
                    : "var(--text-muted)",
                  fontWeight: selectedCats.includes(c.id) ? 600 : 400,
                  padding: "4px 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCats.includes(c.id)}
                  onChange={() => toggleCat(c.id)}
                  style={{ accentColor: "var(--accent)", width: 13, height: 13 }}
                />
                {c.name[locale]}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setBrandsExpanded((v) => !v)}
          style={{
            width: "100%",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text)",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
          aria-expanded={brandsExpanded}
        >
          {"מותג"}
          {brandsExpanded ? (
            <ChevronUp size={13} color="var(--text-dim)" />
          ) : (
            <ChevronDown size={13} color="var(--text-dim)" />
          )}
        </button>
        {brandsExpanded && (
          <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {brands.map((b) => (
              <label
                key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  color: selectedBrands.includes(b.id)
                    ? "var(--text)"
                    : "var(--text-muted)",
                  fontWeight: selectedBrands.includes(b.id) ? 600 : 400,
                  padding: "4px 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b.id)}
                  onChange={() => toggleBrand(b.id)}
                  style={{ accentColor: "var(--accent)", width: 13, height: 13 }}
                />
                {b.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* In stock toggle */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => setInStockOnly((v) => !v)}
            style={{ accentColor: "var(--accent)", width: 13, height: 13 }}
          />
          {"במלאי בלבד"}
        </label>
      </div>
    </div>
  );

  return (
    <main
      style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "20px 14px",
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
      }}
    >
      {/* Sidebar — desktop */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          position: "sticky",
          top: 120,
          display: "none",
        }}
        className="catalog-sidebar"
      >
        {FilterSidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
            }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              background: "var(--surface)",
              width: "min(280px, 85vw)",
              overflowY: "auto",
              marginInlineStart: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "10px 12px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close filters"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={15} color="var(--text-muted)" />
              </button>
            </div>
            {FilterSidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Mobile filter button */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-sm)",
              padding: "7px 12px",
              color: "var(--text-muted)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
            className="catalog-filter-btn"
          >
            <SlidersHorizontal size={13} />
            {"סינון"}
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: "var(--accent)",
                  color: "#000",
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "1px 5px",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Result count */}
          <span
            style={{
              color: "var(--text-dim)",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {visible.length}{" "}
            {"חלקים"}
          </span>

          {/* Sort */}
          <div style={{ marginInlineStart: "auto", position: "relative" }}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label={locale === "he" ? "מיון" : "Sort"}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-sm)",
                padding: "7px 28px 7px 10px",
                color: "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                appearance: "none",
                outline: "none",
              }}
            >
              {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {sortLabels[k][locale]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              color="var(--text-dim)"
              style={{
                position: "absolute",
                top: "50%",
                insetInlineEnd: 8,
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Active filters chips */}
        {(selectedCats.length > 0 || selectedBrands.length > 0 || inStockOnly) && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {selectedCats.map((id) => {
              const c = categories.find((x) => x.id === id);
              return c ? (
                <button
                  key={id}
                  onClick={() => toggleCat(id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent)",
                    borderRadius: 3,
                    padding: "3px 8px",
                    fontSize: 11,
                    color: "var(--accent)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {c.name[locale]} <X size={10} />
                </button>
              ) : null;
            })}
            {selectedBrands.map((id) => {
              const b = getBrand(id);
              return b ? (
                <button
                  key={id}
                  onClick={() => toggleBrand(id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: 3,
                    padding: "3px 8px",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {b.name} <X size={10} />
                </button>
              ) : null;
            })}
          </div>
        )}

        {/* Category chip strip — always visible, compact */}
        <div className="cat-chip-strip" role="group" aria-label={"קטגוריות"}>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`cat-chip${selectedCats.includes(c.id) ? " active" : ""}`}
              onClick={() => toggleCat(c.id)}
              aria-pressed={selectedCats.includes(c.id)}
            >
              {c.name[locale]}
            </button>
          ))}
        </div>

        {/* Parts grid or empty */}
        {visible.length === 0 ? (
          <div className="empty">
            <div className="emoji">🔍</div>
            <h3>
              {"לא נמצאו חלקים"}
            </h3>
            <p>
              {"נסה לשנות את הרכב או הסינון"}
            </p>
            <button
              onClick={clearAll}
              className="cta"
              style={{ cursor: "pointer" }}
            >
              {"נקה סינון"}
            </button>
          </div>
        ) : (
          <div className="parts-grid">
            {visible.map((p) => {
              const minP = minPriceForPart(p);
              const fitsActive =
                activeVehicleId != null && p.fitsVehicleIds.includes(activeVehicleId);
              const brandNames = p.skus
                .slice(0, 4)
                .map((s) => getBrand(s.brandId)?.name)
                .filter((n): n is string => Boolean(n));
              return (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  name={p.name[locale]}
                  imageSrc={partImageUrl(p)}
                  price={minP}
                  brands={brandNames}
                  inStock={true}
                  fitsActiveCar={fitsActive}
                />
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .catalog-sidebar { display: block !important; }
          .catalog-filter-btn { display: none !important; }
        }
      `}</style>
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <main style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 14px" }}>
          <div
            style={{
              height: 400,
              background: "var(--surface)",
              borderRadius: "var(--radius-md)",
              animation: "pulse 1.5s ease infinite",
            }}
          />
        </main>
      }
    >
      <CatalogInner />
    </Suspense>
  );
}
