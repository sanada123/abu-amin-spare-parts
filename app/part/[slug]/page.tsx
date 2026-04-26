// Use ISR caching — revalidate every 2 minutes (see revalidate export below)
import { notFound } from "next/navigation";
import { getProductBySlug as dbGetProduct } from "@/lib/queries";
import { parts as staticParts } from "@/lib/data";
import ProductDetailClient from "@/components/ProductDetailClient";
import type { Metadata } from "next";

async function getProductBySlug(slug: string) {
  try { return await dbGetProduct(slug); } catch { return staticParts.find(p => p.slug === slug) as any || null; }
}
import type { SkuDetail } from "@/lib/queries";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "חלק לא נמצא" };
  return {
    title: `${product.name} | אבו אמין חלפים`,
    description: product.description ?? `${product.name} — חלפי רכב איכותיים ממס׳ 1 בכרמל`,
  };
}

export const revalidate = 120;

export default async function PartPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return notFound();

  return <ProductDetailClient product={product} />;
}
