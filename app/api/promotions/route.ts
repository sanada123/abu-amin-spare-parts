/**
 * Public promotions API — coupon validation + active banners
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateCoupon, getActiveAutoPromotions } from '@/lib/promotions';

/** GET /api/promotions — return active banner promotions for storefront */
export async function GET() {
  const now = new Date();
  const promos = await prisma!.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: {
      id: true,
      name: true,
      type: true,
      value: true,
      code: true,
      appliesToAll: true,
      endDate: true,
    },
  });
  return NextResponse.json({ promotions: promos });
}

/** POST /api/promotions/validate — validate coupon code */
export async function POST(req: NextRequest) {
  const { code, subtotal, customerType } = await req.json() as {
    code: string;
    subtotal: number;
    customerType: 'private' | 'garage';
  };

  if (!code || !subtotal) {
    return NextResponse.json({ error: 'Missing code or subtotal' }, { status: 400 });
  }

  const promo = await validateCoupon(code);
  if (!promo) {
    return NextResponse.json({ error: 'קוד קופון לא תקין או פג תוקף' }, { status: 404 });
  }

  // Check customer type
  if (promo.customerTypes.length > 0 && !promo.customerTypes.includes(customerType)) {
    return NextResponse.json({ error: 'הקופון אינו חל על סוג הלקוח שלך' }, { status: 400 });
  }

  // Check min order
  if (promo.minOrder && subtotal < promo.minOrder) {
    return NextResponse.json({
      error: `מינימום הזמנה ₪${promo.minOrder} לשימוש בקופון`,
    }, { status: 400 });
  }

  // Check usage limit
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: 'הקופון מוצה' }, { status: 400 });
  }

  // Compute discount
  let discount = 0;
  let message = '';

  switch (promo.type) {
    case 'percentage':
      discount = (subtotal * promo.value) / 100;
      message = `הנחה ${promo.value}% — חסכת ₪${discount.toFixed(0)}`;
      break;
    case 'fixed':
      discount = Math.min(promo.value, subtotal);
      message = `הנחה קבועה ₪${promo.value}`;
      break;
    case 'freeShipping':
      message = 'משלוח חינם';
      break;
    default:
      message = promo.name;
  }

  return NextResponse.json({
    valid: true,
    promotionId: promo.id,
    name: promo.name,
    discountAmount: discount,
    discountedTotal: subtotal - discount,
    message,
  });
}
