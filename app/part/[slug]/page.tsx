export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries";
import ProductDetailClient from "@/components/ProductDetailClient";
import type { Metadata } from "next";
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
