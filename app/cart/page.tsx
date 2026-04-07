"use client";
import Link from "next/link";
import { useCart, removeFromCart, updateQty, useLocale } from "@/lib/cart";
import { getPart, getBrand, getCategory } from "@/lib/data";
import { tr } from "@/lib/i18n";

export default function CartPage() {
  const locale = useLocale();
  const cart = useCart();

  const items = cart.map((c) => {
    const part = getPart(c.partId);
    const sku = part?.skus.find((s) => s.id === c.skuId);
    return { cart: c, part, sku };
  }).filter((x) => x.part && x.sku);

  const subtotal = items.reduce((s, x) => s + (x.sku?.priceIls ?? 0) * x.cart.qty, 0);
  const vat = Math.round(subtotal * 0.17);
  const shipping = subtotal > 300 ? 0 : 35;
  const total = subtotal + vat + shipping;

  if (items.length === 0) {
    return (
      <main>
        <section>
          <div className="empty">
            <div className="emoji">🛒</div>
            <h3>{tr("cart_empty", locale)}</h3>
            <p>{tr("hero_sub", locale)}</p>
            <Link href="/" className="cta">{tr("cta_select_vehicle", locale)}</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section>
        <div className="section-head">
          <h2>{tr("cart", locale)}</h2>
        </div>
        <div className="cart-layout">
          <div className="cart-list">
            {items.map(({ cart: c, part, sku }) => {
              const b = getBrand(sku!.brandId);
              const cat = getCategory(part!.categoryId);
              return (
                <div key={c.skuId} className="cart-row">
                  <div className="img">{cat?.icon ?? "🔧"}</div>
                  <div>
                    <div className="name">{part!.name[locale]}</div>
                    <div className="brand-line">
                      {b?.logo} {b?.name} · {sku!.partNumber}
                    </div>
                    <div style={{ marginTop: 8, color: "var(--accent)", fontWeight: 800, fontSize: "1.1rem" }}>
                      ₪{sku!.priceIls * c.qty}
                    </div>
                  </div>
                  <div className="actions">
                    <input
                      type="number"
                      min={1}
                      value={c.qty}
                      onChange={(e) => updateQty(c.skuId, parseInt(e.target.value) || 1)}
                      className="qty-input"
                    />
                    <button className="remove-btn" onClick={() => removeFromCart(c.skuId)}>
                      {tr("remove", locale)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cart-summary">
            <h3>{locale === "en" ? "Order Summary" : locale === "ar" ? "ملخص الطلب" : "סיכום הזמנה"}</h3>
            <div className="row">
              <span>{tr("subtotal", locale)}</span>
              <span>₪{subtotal}</span>
            </div>
            <div className="row">
              <span>{tr("vat", locale)}</span>
              <span>₪{vat}</span>
            </div>
            <div className="row">
              <span>{tr("shipping", locale)}</span>
              <span>{shipping === 0 ? tr("free", locale) : `₪${shipping}`}</span>
            </div>
            <div className="row total">
              <span>{tr("total", locale)}</span>
              <span className="price">₪{total}</span>
            </div>
            <button className="checkout-cta">{tr("checkout", locale)} →</button>
          </div>
        </div>
      </section>
    </main>
  );
}
