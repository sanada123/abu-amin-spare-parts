export const dynamic = "force-dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { searchProducts as dbSearch } from "@/lib/queries";
import { parts as staticParts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

async function searchProducts(q: string, vehicleId?: number) {
  try { return await dbSearch(q, vehicleId); } catch {
    const lower = q.toLowerCase();
    return staticParts.filter((p: any) => {
      const name = typeof p.name === 'object' ? (p.name.he || '') : String(p.name);
      const cat = typeof p.category === 'object' ? (p.category?.he || '') : String(p.category || '');
      return name.toLowerCase().includes(lower) || cat.toLowerCase().includes(lower);
    }).map((p: any) => ({
      ...p,
      name: typeof p.name === 'object' ? p.name.he : p.name,
      images: p.images || [],
      category: { name: typeof p.category === 'object' ? p.category?.he : p.category },
      skus: (p.skus || []).map((s: any) => ({
        ...s,
        priceIls: s.priceIls ?? s.price ?? 0,
        brand: s.brand ?? { name: 'כללי', slug: '', country: null },
        tier: s.tier ?? 'replacement',
      })),
    }));
  }
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; vehicleId?: string }>;
}

async function SearchResults({ searchParams }: { searchParams: SearchPageProps["searchParams"] }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const vehicleId = sp.vehicleId ? parseInt(sp.vehicleId, 10) : undefined;

  const results = q ? await searchProducts(q, vehicleId) : [];

  return (
    <main>
      <section>
        <div className="section-head">
          <h2>
            תוצאות חיפוש
            {q && (
              <span style={{ color: "var(--text-3)", fontWeight: 600, marginInlineStart: 10 }}>
                &ldquo;{q}&rdquo; — {results.length}
              </span>
            )}
          </h2>
        </div>

        {!q ? (
          <div className="empty">
            <div className="emoji">🔍</div>
            <h3>הזן מילת חיפוש</h3>
            <p>חפש לפי שם חלק, מספר מק״ט, או דגם רכב</p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty">
            <div className="emoji">🔍</div>
            <h3>אין תוצאות</h3>
            <p>נסה מילת חיפוש אחרת או מספר OEM</p>
            <Link href="/catalog" className="cta">עיין בקטלוג →</Link>
          </div>
        ) : (
          <div className="parts-grid">
            {results.map((p: any) => {
              const minPrice = p.skus.length > 0
                ? Math.min(...p.skus.map((s: any) => s.priceIls))
                : 0;
              const brandNames = p.skus.slice(0, 3).map((s: any) => s.brand.name);
              const tiers = [...new Set(p.skus.map((s: any) => s.tier))] as Array<"original" | "replacement">;
              const imageSrc = p.images[0] ?? `/parts/${p.slug}.svg`;
              return (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  name={p.name}
                  imageSrc={imageSrc}
                  price={minPrice}
                  brands={brandNames}
                  tiers={tiers}
                  skuCount={p.skus.length}
                  inStock={p.skus.length > 0}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<main><section><h2>מחפש...</h2></section></main>}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}
