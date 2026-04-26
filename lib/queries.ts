// Server-side Prisma query functions for Abu Amin Spare Parts storefront
import { prisma } from '@/lib/db';

// Guard: throw if prisma is null (DB unavailable) — caught by page-level fallback
function db() {
  if (!prisma) throw new Error('Database unavailable');
  return prisma;
}

// ─── Exported Types ──────────────────────────────────────────────────────────

export type SkuSummary = {
  id: number;
  partNumber: string;
  priceIls: number;
  tier: string;
  stock?: number;
  brand: { name: string; slug: string; country: string | null };
};

export type SkuDetail = SkuSummary & {
  stock: number;
  deliveryDays: number;
  warrantyMonths: number;
  costIls: number | null;
};

export type ProductSummary = {
  id: number;
  slug: string;
  name: string;
  images: string[];
  category: { name: string };
  skus: SkuSummary[];
  fitments: { vehicle: { make: string; model: string; year: number } }[];
};

export type ProductDetail = Omit<ProductSummary, 'skus'> & {
  description: string | null;
  skus: SkuDetail[];
};

export type CategoryData = {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  group: string | null;
  parentId: number | null;
  children: CategoryData[];
};

// ─── Product Queries ─────────────────────────────────────────────────────────

/** Up to 8 featured active products with their SKUs, fitments, and category. */
export async function getFeaturedProducts(): Promise<ProductSummary[]> {
  const products = await db().product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 8,
    orderBy: { position: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      images: true,
      category: { select: { name: true } },
      skus: {
        where: { isActive: true },
        orderBy: { priceIls: 'asc' },
        select: {
          id: true,
          partNumber: true,
          priceIls: true,
          tier: true,
          stock: true,
          brand: { select: { name: true, slug: true, country: true } },
        },
      },
      fitments: {
        take: 5,
        select: {
          vehicle: { select: { make: true, model: true, year: true } },
        },
      },
    },
  });
  return products;
}

export type GetAllProductsOpts = {
  categoryId?: number;
  group?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type PaginatedProducts = {
  products: ProductSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** Paginated product list with optional category/search filters. */
export async function getAllProducts(opts: GetAllProductsOpts = {}): Promise<PaginatedProducts> {
  const { categoryId, group, search, page = 1, limit = 24 } = opts;
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
    ...(group && !categoryId ? { category: { group } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { skus: { some: { partNumber: { contains: search, mode: 'insensitive' as const } } } },
          ],
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    db().product.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        images: true,
        category: { select: { name: true } },
        skus: {
          where: { isActive: true },
          orderBy: { priceIls: 'asc' },
          select: {
            id: true,
            partNumber: true,
            priceIls: true,
            tier: true,
            brand: { select: { name: true, slug: true, country: true } },
          },
        },
        fitments: {
          take: 3,
          select: {
            vehicle: { select: { make: true, model: true, year: true } },
          },
        },
      },
    }),
    db().product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** Full product detail by slug, including all SKUs and fitment vehicles. */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await db().product.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      images: true,
      category: { select: { name: true } },
      skus: {
        where: { isActive: true },
        orderBy: { priceIls: 'asc' },
        select: {
          id: true,
          partNumber: true,
          priceIls: true,
          tier: true,
          stock: true,
          deliveryDays: true,
          warrantyMonths: true,
          costIls: true,
          brand: { select: { name: true, slug: true, country: true } },
        },
      },
      fitments: {
        select: {
          vehicle: { select: { make: true, model: true, makeHe: true, modelHe: true, year: true, engine: true } },
        },
      },
    },
  });
  return product as ProductDetail | null;
}

/** Products in a category, identified by category slug. */
export async function getProductsByCategory(
  categorySlug: string,
  limit = 24
): Promise<ProductSummary[]> {
  const products = await db().product.findMany({
    where: {
      isActive: true,
      category: { slug: categorySlug, isActive: true },
    },
    take: limit,
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      images: true,
      category: { select: { name: true } },
      skus: {
        where: { isActive: true },
        orderBy: { priceIls: 'asc' },
        select: {
          id: true,
          partNumber: true,
          priceIls: true,
          tier: true,
          stock: true,
          brand: { select: { name: true, slug: true, country: true } },
        },
      },
      fitments: {
        take: 3,
        select: {
          vehicle: { select: { make: true, model: true, year: true } },
        },
      },
    },
  });
  return products;
}

// ─── Category Queries ────────────────────────────────────────────────────────

/** All active categories ordered by position. */
export async function getAllCategories(): Promise<CategoryData[]> {
  const cats = await db().category.findMany({
    where: { isActive: true },
    orderBy: { position: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      group: true,
      parentId: true,
    },
  });
  return cats.map((c) => ({ ...c, children: [] }));
}

/** Single category by slug. */
export async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  const cat = await db().category.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      group: true,
      parentId: true,
    },
  });
  if (!cat) return null;
  return { ...cat, children: [] };
}

/** Parent categories with their children[] nested. */
export async function getCategoryTree(): Promise<CategoryData[]> {
  const all = await db().category.findMany({
    where: { isActive: true },
    orderBy: { position: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      group: true,
      parentId: true,
    },
  });

  const map = new Map<number, CategoryData>();
  for (const c of all) {
    map.set(c.id, { ...c, children: [] });
  }

  const roots: CategoryData[] = [];
  for (const c of map.values()) {
    if (c.parentId == null) {
      roots.push(c);
    } else {
      const parent = map.get(c.parentId);
      if (parent) parent.children.push(c);
    }
  }
  return roots;
}

// ─── Brand Queries ───────────────────────────────────────────────────────────

export type BrandData = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  country: string | null;
};

/** All active brands. */
export async function getAllBrands(): Promise<BrandData[]> {
  return db().brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, logo: true, country: true },
  });
}

// ─── Vehicle Queries ─────────────────────────────────────────────────────────

export type VehicleData = {
  id: number;
  make: string;
  makeHe: string;
  model: string;
  modelHe: string;
  year: number;
  engine: string | null;
};

/** All active vehicles. */
export async function getAllVehicles(): Promise<VehicleData[]> {
  return db().vehicle.findMany({
    where: { isActive: true },
    orderBy: [{ make: 'asc' }, { year: 'desc' }, { model: 'asc' }],
    select: { id: true, make: true, makeHe: true, model: true, modelHe: true, year: true, engine: true },
  });
}

export type MakeWithCount = { make: string; makeHe: string; count: number };

/** Distinct makes with product count. */
export async function getUniqueMakes(): Promise<MakeWithCount[]> {
  const vehicles = await db().vehicle.findMany({
    where: { isActive: true },
    select: { make: true, makeHe: true },
    orderBy: { make: 'asc' },
    distinct: ['make'],
  });

  const counts = await db().vehicle.groupBy({
    by: ['make'],
    where: { isActive: true },
    _count: { _all: true },
  });

  const countMap = new Map(counts.map((c) => [c.make, c._count._all]));
  return vehicles.map((v) => ({
    make: v.make,
    makeHe: v.makeHe,
    count: countMap.get(v.make) ?? 0,
  }));
}

/** Vehicle with its fitments→product. */
export async function getVehicleById(id: number) {
  return db().vehicle.findUnique({
    where: { id, isActive: true },
    include: {
      fitments: {
        include: { product: true },
      },
    },
  });
}

/** Products that fit a given vehicle, optionally filtered by category slug. */
export async function getPartsForVehicle(
  vehicleId: number,
  categorySlug?: string
): Promise<ProductSummary[]> {
  const products = await db().product.findMany({
    where: {
      isActive: true,
      fitments: { some: { vehicleId } },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      images: true,
      category: { select: { name: true } },
      skus: {
        where: { isActive: true },
        orderBy: { priceIls: 'asc' },
        select: {
          id: true,
          partNumber: true,
          priceIls: true,
          tier: true,
          stock: true,
          brand: { select: { name: true, slug: true, country: true } },
        },
      },
      fitments: {
        take: 3,
        select: {
          vehicle: { select: { make: true, model: true, year: true } },
        },
      },
    },
  });
  return products;
}

// ─── Search ──────────────────────────────────────────────────────────────────

/** Products matching a query string (name or partNumber), optionally filtered by vehicle. */
export async function searchProducts(
  query: string,
  vehicleId?: number
): Promise<ProductSummary[]> {
  if (!query.trim()) return [];

  const products = await db().product.findMany({
    where: {
      isActive: true,
      ...(vehicleId ? { fitments: { some: { vehicleId } } } : {}),
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { skus: { some: { partNumber: { contains: query, mode: 'insensitive' } } } },
      ],
    },
    take: 20,
    orderBy: [{ isFeatured: 'desc' }, { position: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      images: true,
      category: { select: { name: true } },
      skus: {
        where: { isActive: true },
        orderBy: { priceIls: 'asc' },
        select: {
          id: true,
          partNumber: true,
          priceIls: true,
          tier: true,
          stock: true,
          brand: { select: { name: true, slug: true, country: true } },
        },
      },
      fitments: {
        take: 3,
        select: {
          vehicle: { select: { make: true, model: true, year: true } },
        },
      },
    },
  });
  return products;
}

// ─── Settings ────────────────────────────────────────────────────────────────

/** All settings as a flat Record<key, string>. JSON values are parsed. */
export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db().setting.findMany();
  const result: Record<string, string> = {};
  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.value);
      result[row.key] = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    } catch {
      result[row.key] = row.value;
    }
  }
  return result;
}

// ─── Order Creation ──────────────────────────────────────────────────────────

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerType: string;
  vehicleInfo?: string;
  items: { skuId: number; qty: number }[];
  notes?: string;
  channel?: string;
};

export type CreatedOrder = {
  id: number;
  orderNumber: string;
  total: number;
  vatAmount: number;
  subtotal: number;
};

/** Create a storefront order: find/create customer, calculate totals, apply VAT 17%. */
export async function createOrder(data: CreateOrderInput): Promise<CreatedOrder> {
  const { customerName, customerPhone, customerType, vehicleInfo, items, notes, channel = 'whatsapp' } = data;

  // Look up SKU prices
  const skuIds = items.map((i) => i.skuId);
  const skus = await db().sku.findMany({
    where: { id: { in: skuIds }, isActive: true },
    select: { id: true, priceIls: true },
  });
  const skuMap = new Map(skus.map((s) => [s.id, s.priceIls]));

  // Validate all SKUs found
  for (const item of items) {
    if (!skuMap.has(item.skuId)) {
      throw new Error(`SKU ${item.skuId} not found or inactive`);
    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    return sum + (skuMap.get(item.skuId) ?? 0) * item.qty;
  }, 0);
  const vatRate = 17;
  const vatAmount = Math.round((subtotal * vatRate) / 100 * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  // Generate order number: AA-YYYYMMDD-XXXXX
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `AA-${datePart}-${rand}`;

  const order = await db().$transaction(async (tx) => {
    // Upsert customer by phone
    const customer = await tx.customer.upsert({
      where: { phone: customerPhone },
      update: { name: customerName, type: customerType },
      create: { name: customerName, phone: customerPhone, type: customerType },
    });

    // Create order with items
    return tx.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        vehicleInfo,
        subtotal,
        vatRate,
        vatAmount,
        total,
        notes,
        channel,
        status: 'new',
        items: {
          create: items.map((item) => ({
            skuId: item.skuId,
            qty: item.qty,
            unitPrice: skuMap.get(item.skuId) ?? 0,
            total: (skuMap.get(item.skuId) ?? 0) * item.qty,
          })),
        },
      },
      select: { id: true, orderNumber: true, total: true, vatAmount: true, subtotal: true },
    });
  });

  return order;
}
