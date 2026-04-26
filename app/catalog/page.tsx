export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { getAllCategories as dbCats, getAllBrands as dbBrands, getAllProducts as dbProducts, getPartsForVehicle, type ProductSummary, type CategoryData, type BrandData } from "@/lib/queries";
import { parts as staticParts, categories as staticCategories, brands as staticBrands } from "@/lib/data";
import CatalogClient from "@/components/CatalogClient";

async function getAllCategories() { try { return await dbCats(); } catch { return staticCategories as any; } }
async function getAllBrands() { try { return await dbBrands(); } catch { return staticBrands as any; } }
async function getAllProducts(opts?: any) { try { return await dbProducts(opts); } catch { return { products: staticParts, totalPages: 1 } as any; } }

export const revalidate = 120;

interface CatalogPageProps {
  searchParams: Promise<{ cat?: string; vehicleId?: string; search?: string; page?: string; group?: string; brand?: string }>;
}

async function CatalogContent({ searchParams }: { searchParams: CatalogPageProps["searchParams"] }) {
  const sp = await searchParams;
  const vehicleId = sp.vehicleId ? parseInt(sp.vehicleId, 10) : undefined;
  const search = sp.search ?? undefined;
  const page = sp.page ? parseInt(sp.page, 10) : 1;

  const [categoriesRaw, brandsRaw, productsResult] = await Promise.all([
    getAllCategories(),
    getAllBrands(),
    vehicleId
      ? getPartsForVehicle(vehicleId, sp.cat).then((products) => ({
          products,
          total: products.length,
          page: 1,
          limit: products.length,
          totalPages: 1,
        }))
      : getAllProducts({ search, page, limit: 48, group: sp.group }),
  ]);

  // If group param is set, filter categories by group and pre-filter products
  const group = sp.group ?? undefined;
  let categories = categoriesRaw as CategoryData[];
  let products = productsResult.products as ProductSummary[];

  if (group && !sp.cat && !vehicleId && !search) {
    // Get category IDs that belong to this group (parent + children)
    const groupParent = categories.find((c: any) => c.group === group && !c.parentId);
    if (groupParent) {
      const groupCatIds = new Set<number>();
      groupCatIds.add(groupParent.id);
      // Also include children of the group parent
      for (const c of categories) {
        if (c.parentId === groupParent.id) groupCatIds.add(c.id);
      }
      // Filter products to only those in group categories
      products = products.filter((p: any) => {
        const cat = categories.find((c: any) => c.name === p.category.name);
        return cat ? groupCatIds.has(cat.id) : false;
      });
    }
  }

  return (
    <CatalogClient
      initialProducts={products}
      allCategories={categories}
      allBrands={brandsRaw}
      initialCatSlug={sp.cat}
      initialVehicleId={vehicleId}
      initialGroup={group}
      initialBrandSlug={sp.brand}
      total={products.length}
    />
  );
}

export default function CatalogPage({ searchParams }: CatalogPageProps) {
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
      <CatalogContent searchParams={searchParams} />
    </Suspense>
  );
}
