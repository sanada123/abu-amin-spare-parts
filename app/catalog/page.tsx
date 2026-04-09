export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { getAllCategories, getAllBrands, getAllProducts, getPartsForVehicle, type ProductSummary, type CategoryData, type BrandData } from "@/lib/queries";
import CatalogClient from "@/components/CatalogClient";

export const revalidate = 120;

interface CatalogPageProps {
  searchParams: Promise<{ cat?: string; vehicleId?: string; search?: string; page?: string }>;
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
      : getAllProducts({ search, page, limit: 48 }),
  ]);

  return (
    <CatalogClient
      initialProducts={productsResult.products}
      allCategories={categoriesRaw}
      allBrands={brandsRaw}
      initialCatSlug={sp.cat}
      initialVehicleId={vehicleId}
      total={productsResult.total}
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
