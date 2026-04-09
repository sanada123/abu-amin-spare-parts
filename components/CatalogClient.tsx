"use client";
import { useState, useMemo } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { useActiveVehicleId, setActiveVehicleId } from "@/lib/cart";
import ProductCard from "@/components/ProductCard";
import type { ProductSummary, CategoryData, BrandData } from "@/lib/queries";

type SortKey = "relevance" | "price_asc" | "price_desc";

interface CatalogClientProps {
  initialProducts: ProductSummary[];
  allCategories: CategoryData[];
  allBrands: BrandData[];
  initialCatSlug?: string;
  initialVehicleId?: number;
  total: number;
}

const SORT_LABELS: Record<SortKey, string> = {
  relevance: "רלוונטיות",
  price_asc: "מחיר: נמוך→גבוה",
  price_desc: "מחיר: גבוה→נמוך",
};

function minPrice(p: ProductSummary): number {
  if (!p.skus.length) return 0;
  return Math.min(...p.skus.map((s) => s.priceIls));
}

export default function CatalogClient({
  initialProducts,
  allCategories,
  allBrands,
  initialCatSlug,
  initialVehicleId,
  total,
}: CatalogClientProps) {
  const activeVehicleId = useActiveVehicleId();

  const initCat = initialCatSlug
    ? allCategories.find((c) => c.slug === initialCatSlug)
    : null;

  const [selectedCatIds, setSelectedCatIds] = useState<number[]>(
    initCat ? [initCat.id] : []
  );
  const [selectedBrandSlugs, setSelectedBrandSlugs] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catsExpanded, setCatsExpanded] = useState(true);
  const [brandsExpanded, setBrandsExpanded] = useState(true);

  const visible = useMemo(() => {
    let list = initialProducts;

    if (selectedCatIds.length > 0) {
      list = list.filter((p) => {
        const cat = allCategories.find((c) => c.name === p.category.name);
        return cat ? selectedCatIds.includes(cat.id) : false;
      });
    }

    if (selectedBrandSlugs.length > 0) {
      list = list.filter((p) =>
        p.skus.some((s) => selectedBrandSlugs.includes(s.brand.slug))
      );
    }

    if (inStockOnly) {
      // Client-side: filter products that have at least one sku with priceIls > 0 (stock not known at summary level)
      // In a real setup you'd include stock in the summary query
      list = list.filter((p) => p.skus.length > 0);
    }

    if (sort === "price_asc") {
      list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
    } else if (sort === "price_desc") {
      list = [...list].sort((a, b) => minPrice(b) - minPrice(a));
    }

    return list;
  }, [initialProducts, selectedCatIds, selectedBrandSlugs, inStockOnly, sort, allCategories]);

  const activeFilterCount =
    selectedCatIds.length + selectedBrandSlugs.length + (inStockOnly ? 1 : 0);

  const clearAll = () => {
    setSelectedCatIds([]);
    setSelectedBrandSlugs([]);
    setInStockOnly(false);
    setSort("relevance");
    if (activeVehicleId) {
      setActiveVehicleId(null);
      window.location.href = "/catalog";
    }
  };

  const toggleCat = (id: number) =>
    setSelectedCatIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleBrand = (slug: string) =>
    setSelectedBrandSlugs((prev) =>
      prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
    );

  const rootAutoCats = allCategories.filter((c) => !c.parentId && !c.group);
  const toolsParent = allCategories.find((c) => c.group === "tools" && !c.parentId);
  const gardenParent = allCategories.find((c) => c.group === "garden" && !c.parentId);

  const FilterSidebar = (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, fontSize: 13 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
          <SlidersHorizontal size={13} aria-hidden="true" />
          סינון
          {activeFilterCount > 0 && (
            <span style={{ background: "var(--accent)", color: "#000", borderRadius: "3px", fontSize: 11, fontWeight: 800, padding: "1px 6px" }}>
              {activeFilterCount}
            </span>
          )}
        </span>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} style={{ color: "var(--danger)", fontSize: 11, fontWeight: 600, cursor: "pointer", background: "none", border: "none", display: "flex", alignItems: "center", gap: 3 }}>
            <X size={11} />
            נקה הכל
          </button>
        )}
      </div>

      {/* Categories */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setCatsExpanded((v) => !v)}
          style={{ width: "100%", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}
          aria-expanded={catsExpanded}
        >
          קטגוריה
          {catsExpanded ? <ChevronUp size={13} color="var(--text-dim)" /> : <ChevronDown size={13} color="var(--text-dim)" />}
        </button>
        {catsExpanded && (
          <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 0 2px" }}>
              חלפי רכב
            </div>
            {rootAutoCats.map((c) => (
              <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: selectedCatIds.includes(c.id) ? "var(--text)" : "var(--text-muted)", fontWeight: selectedCatIds.includes(c.id) ? 600 : 400, padding: "3px 0" }}>
                <input type="checkbox" checked={selectedCatIds.includes(c.id)} onChange={() => toggleCat(c.id)} style={{ accentColor: "var(--accent)", width: 13, height: 13 }} />
                {c.name}
              </label>
            ))}
            {toolsParent && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 0 2px" }}>
                  {toolsParent.name}
                </div>
                {allCategories.filter((c) => c.parentId === toolsParent.id).map((c) => (
                  <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: selectedCatIds.includes(c.id) ? "var(--text)" : "var(--text-muted)", fontWeight: selectedCatIds.includes(c.id) ? 600 : 400, padding: "3px 0", paddingInlineStart: 16 }}>
                    <input type="checkbox" checked={selectedCatIds.includes(c.id)} onChange={() => toggleCat(c.id)} style={{ accentColor: "var(--accent)", width: 13, height: 13 }} />
                    {c.name}
                  </label>
                ))}
              </>
            )}
            {gardenParent && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 0 2px" }}>
                  {gardenParent.name}
                </div>
                {allCategories.filter((c) => c.parentId === gardenParent.id).map((c) => (
                  <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: selectedCatIds.includes(c.id) ? "var(--text)" : "var(--text-muted)", fontWeight: selectedCatIds.includes(c.id) ? 600 : 400, padding: "3px 0", paddingInlineStart: 16 }}>
                    <input type="checkbox" checked={selectedCatIds.includes(c.id)} onChange={() => toggleCat(c.id)} style={{ accentColor: "var(--accent)", width: 13, height: 13 }} />
                    {c.name}
                  </label>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Brands */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setBrandsExpanded((v) => !v)}
          style={{ width: "100%", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}
          aria-expanded={brandsExpanded}
        >
          מותג
          {brandsExpanded ? <ChevronUp size={13} color="var(--text-dim)" /> : <ChevronDown size={13} color="var(--text-dim)" />}
        </button>
        {brandsExpanded && (
          <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {allBrands.map((b) => (
              <label key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: selectedBrandSlugs.includes(b.slug) ? "var(--text)" : "var(--text-muted)", fontWeight: selectedBrandSlugs.includes(b.slug) ? 600 : 400, padding: "4px 0" }}>
                <input type="checkbox" checked={selectedBrandSlugs.includes(b.slug)} onChange={() => toggleBrand(b.slug)} style={{ accentColor: "var(--accent)", width: 13, height: 13 }} />
                {b.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* In stock toggle */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <input type="checkbox" checked={inStockOnly} onChange={() => setInStockOnly((v) => !v)} style={{ accentColor: "var(--accent)", width: 13, height: 13 }} />
          במלאי בלבד
        </label>
      </div>
    </div>
  );

  return (
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 14px", display: "flex", gap: 20, alignItems: "flex-start" }}>
      {/* Sidebar — desktop */}
      <aside
        style={{ width: 240, flexShrink: 0, background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", overflow: "hidden", position: "sticky", top: 120, display: "none" }}
        className="catalog-sidebar"
      >
        {FilterSidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: "relative", zIndex: 1, background: "var(--surface)", width: "min(280px, 85vw)", overflowY: "auto", marginInlineStart: "auto" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
              <button onClick={() => setSidebarOpen(false)} aria-label="סגור פילטרים" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)", padding: "7px 12px", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            className="catalog-filter-btn"
          >
            <SlidersHorizontal size={13} />
            סינון
            {activeFilterCount > 0 && (
              <span style={{ background: "var(--accent)", color: "#000", borderRadius: 3, fontSize: 11, fontWeight: 800, padding: "1px 5px" }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <span style={{ color: "var(--text-dim)", fontSize: 12, fontWeight: 500 }}>
            {visible.length} חלקים
          </span>

          <div style={{ marginInlineStart: "auto", position: "relative" }}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="מיון"
              style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)", padding: "7px 28px 7px 10px", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", appearance: "none", outline: "none" }}
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
            <ChevronDown size={12} color="var(--text-dim)" style={{ position: "absolute", top: "50%", insetInlineEnd: 8, transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Active filter chips */}
        {(selectedCatIds.length > 0 || selectedBrandSlugs.length > 0) && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {selectedCatIds.map((id) => {
              const c = allCategories.find((x) => x.id === id);
              return c ? (
                <button key={id} onClick={() => toggleCat(id)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: 3, padding: "3px 8px", fontSize: 11, color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}>
                  {c.name} <X size={10} />
                </button>
              ) : null;
            })}
            {selectedBrandSlugs.map((slug) => {
              const b = allBrands.find((x) => x.slug === slug);
              return b ? (
                <button key={slug} onClick={() => toggleBrand(slug)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 3, padding: "3px 8px", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, cursor: "pointer" }}>
                  {b.name} <X size={10} />
                </button>
              ) : null;
            })}
          </div>
        )}

        {/* Category chip strip */}
        <div className="cat-chip-strip" role="group" aria-label="קטגוריות">
          {rootAutoCats.map((c) => (
            <button
              key={c.id}
              className={`cat-chip${selectedCatIds.includes(c.id) ? " active" : ""}`}
              onClick={() => toggleCat(c.id)}
              aria-pressed={selectedCatIds.includes(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid or empty state */}
        {visible.length === 0 ? (
          <div className="empty">
            <div className="emoji">🔍</div>
            <h3>לא נמצאו חלקים</h3>
            <p>נסה לשנות את הרכב או הסינון</p>
            <button onClick={clearAll} className="cta" style={{ cursor: "pointer" }}>
              נקה סינון
            </button>
          </div>
        ) : (
          <div className="parts-grid">
            {visible.map((p) => {
              const mp = minPrice(p);
              const brandNames = p.skus.slice(0, 4).map((s) => s.brand.name);
              const tiers = [...new Set(p.skus.map((s) => s.tier))] as Array<"original" | "replacement">;
              const firstFitment = p.fitments[0];
              const extraCount = p.fitments.length - 1;
              const vehicleLabel = firstFitment
                ? `${firstFitment.vehicle.make} ${firstFitment.vehicle.model} ${firstFitment.vehicle.year}${extraCount > 0 ? ` +${extraCount} נוספים` : ""}`
                : undefined;
              const imageSrc = p.images[0] ?? `/parts/${p.slug}.svg`;
              return (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  name={p.name}
                  imageSrc={imageSrc}
                  price={mp}
                  brands={brandNames}
                  tiers={tiers}
                  skuCount={p.skus.length}
                  vehicleLabel={vehicleLabel}
                  inStock={p.skus.length > 0}
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
