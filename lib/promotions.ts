/**
 * Promotion engine — evaluates active promotions against a cart/order.
 * Used by both storefront (coupon input) and admin (analytics).
 */
import { prisma } from './db';

export interface CartItem {
  skuId: number;
  productId: number;
  categoryId: number;
  brandId: number;
  priceIls: number;
  qty: number;
}

export interface PromotionResult {
  promotionId: number;
  name: string;
  type: string;
  discountAmount: number;
  discountedTotal: number;
  code: string | null;
  message: string; // Hebrew description shown to customer
}

export interface ApplyResult {
  original: number;
  discountAmount: number;
  total: number;
  applied: PromotionResult | null;
}

/** Fetch all currently active auto-apply promotions (no code needed) */
export async function getActiveAutoPromotions() {
  const now = new Date();
  return prisma!.promotion.findMany({
    where: {
      isActive: true,
      code: null,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });
}

/** Validate a coupon code and return the promotion (or null if invalid) */
export async function validateCoupon(code: string) {
  const now = new Date();
  return prisma!.promotion.findFirst({
    where: {
      code: { equals: code, mode: 'insensitive' },
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });
}

/**
 * Apply promotions to a cart.
 * - First tries couponCode (if provided and valid)
 * - Falls back to best auto-apply promotion
 * - Returns best single discount (no stacking)
 */
export async function applyPromotions(
  items: CartItem[],
  customerType: 'private' | 'garage',
  couponCode?: string,
): Promise<ApplyResult> {
  const subtotal = items.reduce((sum, i) => sum + i.priceIls * i.qty, 0);

  const candidatePromos = [];

  // Try explicit coupon first
  if (couponCode) {
    const promo = await validateCoupon(couponCode);
    if (promo) candidatePromos.push(promo);
  }

  // Always include auto-apply promos
  const autoPromos = await getActiveAutoPromotions();
  candidatePromos.push(...autoPromos);

  let best: PromotionResult | null = null;
  let bestDiscount = 0;

  for (const promo of candidatePromos) {
    // Check customer type eligibility
    if (promo.customerTypes.length > 0 && !promo.customerTypes.includes(customerType)) continue;

    // Check minimum order
    if (promo.minOrder && subtotal < promo.minOrder) continue;

    // Check usage limits
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) continue;

    // Compute applicable subtotal based on scope
    let applicableSubtotal = subtotal;
    if (!promo.appliesToAll) {
      applicableSubtotal = items
        .filter((item) => {
          const matchCat = promo.categoryIds.length === 0 || promo.categoryIds.includes(item.categoryId);
          const matchBrand = promo.brandIds.length === 0 || promo.brandIds.includes(item.brandId);
          const matchProd = promo.productIds.length === 0 || promo.productIds.includes(item.productId);
          return matchCat || matchBrand || matchProd;
        })
        .reduce((sum, i) => sum + i.priceIls * i.qty, 0);
    }

    if (applicableSubtotal === 0) continue;

    let discount = 0;
    let message = '';

    switch (promo.type) {
      case 'percentage':
        discount = (applicableSubtotal * promo.value) / 100;
        message = `הנחה ${promo.value}% — חסכת ₪${discount.toFixed(0)}`;
        break;
      case 'fixed':
        discount = Math.min(promo.value, applicableSubtotal);
        message = `הנחה קבועה ₪${promo.value}`;
        break;
      case 'freeShipping':
        discount = 0; // shipping is free anyway for now
        message = 'משלוח חינם';
        break;
      case 'buyXgetY': {
        if (!promo.buyX || !promo.getY) break;
        // Simplification: apply to total item count
        const totalQty = items.reduce((s, i) => s + i.qty, 0);
        const freeUnits = Math.floor(totalQty / (promo.buyX + promo.getY)) * promo.getY;
        if (freeUnits > 0) {
          // Discount = cheapest items' price × freeUnits
          const sortedPrices = items.flatMap((i) => Array(i.qty).fill(i.priceIls)).sort((a, b) => a - b);
          discount = sortedPrices.slice(0, freeUnits).reduce((s, p) => s + p, 0);
          message = `קנה ${promo.buyX} קבל ${promo.getY} חינם`;
        }
        break;
      }
    }

    if (discount > bestDiscount) {
      bestDiscount = discount;
      best = {
        promotionId: promo.id,
        name: promo.name,
        type: promo.type,
        discountAmount: discount,
        discountedTotal: subtotal - discount,
        code: promo.code,
        message,
      };
    }
  }

  return {
    original: subtotal,
    discountAmount: best?.discountAmount ?? 0,
    total: subtotal - (best?.discountAmount ?? 0),
    applied: best,
  };
}

/** Mark a promotion as used (increment usedCount) */
export async function recordPromotionUse(promotionId: number) {
  await prisma!.promotion.update({
    where: { id: promotionId },
    data: { usedCount: { increment: 1 } },
  });
}
