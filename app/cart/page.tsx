"use client";
import Link from "next/link";
import { useCart, removeFromCart, updateQty, useLocale } from "@/lib/cart";
import { getPart, getBrand, getCategory } from "@/lib/data";
import { tr } from "@/lib/i18n";
import OrderSubmitForm from "@/components/OrderSubmitForm";

export default function CartPage() {
  const locale = useLocale();
  const cart = useCart();

  const items = cart.map((c) => {
    const part = getPart(c.partId);
    const sku = part?.skus.find((s) => s.id === c.skuId);
    return { cart: c, part, sku };
  }).filter((x) => x.part && x.sku);

  const subtotal = items.reduce((s, x) => s + (x.sku?.priceIls ?? 0) * x.cart.qty, 0);

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
          {/* Parts list */}
          <div>
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
                        aria-label={tr("qty", locale)}
                      />
                      <button className="remove-btn" onClick={() => removeFromCart(c.skuId)}>
                        {tr("remove", locale)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Parts subtotal */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontWeight: 700, color: "var(--text-dim)", fontSize: "0.9rem" }}>
                {tr("subtotal", locale)} ({items.length} {locale === "ar" ? "قطعة" : "פריטים"})
              </span>
              <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--accent)" }}>
                ₪{subtotal}
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 6 }}>
              {tr("vat_excl", locale)}
            </p>
          </div>

          {/* Order submit form */}
          <div className="cart-summary" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <h3 style={{ marginBottom: 20 }}>
              {locale === "ar" ? "تفاصيل الطلب" : "פרטי הזמנה"}
            </h3>
            <OrderSubmitForm items={cart} subtotal={subtotal} />
          </div>
        </div>
      </section>
    </main>
  );
}
