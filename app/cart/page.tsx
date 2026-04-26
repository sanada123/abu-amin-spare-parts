"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useCart, removeFromCart, updateQty, useLocale, type CartItem } from "@/lib/cart";
import { tr } from "@/lib/i18n";
import OrderSubmitForm from "@/components/OrderSubmitForm";

export default function CartPage() {
  const locale = useLocale();
  const cart = useCart();

  // Filter out items that have display data (added from DB pages)
  // Also support legacy items from static data as fallback
  const items = cart.filter((c) => c.name && c.priceIls);

  const subtotal = items.reduce((s, c) => s + (c.priceIls ?? 0) * c.qty, 0);

  if (items.length === 0) {
    return (
      <main>
        <section>
          <div className="empty">
            <div className="emoji"><ShoppingCart size={48} color="var(--text-dim)" aria-hidden="true" /></div>
            <h3>{tr("cart_empty", locale)}</h3>
            <p>{tr("hero_sub", locale)}</p>
            <Link href="/catalog" className="cta">{"לקטלוג המוצרים"}</Link>
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
              {items.map((c) => (
                <div key={c.skuId} className="cart-row">
                  <div className="img">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name ?? ""}
                        style={{ width: 56, height: 56, objectFit: "contain", borderRadius: "var(--radius-sm)" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      "🔧"
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="name">
                      {c.slug ? (
                        <Link href={`/part/${c.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {c.name}
                        </Link>
                      ) : (
                        c.name
                      )}
                    </div>
                    <div className="brand-line" style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                      {c.brandLogo} {c.brandName} · <span style={{ fontFamily: "var(--font-mono, monospace)" }}>{c.partNumber}</span>
                    </div>
                    <div style={{ marginTop: 8, color: "var(--accent)", fontWeight: 800, fontSize: "1.1rem", fontFamily: "var(--font-mono, monospace)" }}>
                      ₪{((c.priceIls ?? 0) * c.qty).toLocaleString()}
                    </div>
                  </div>
                  <div className="actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <input
                      type="number"
                      min={1}
                      value={c.qty}
                      onChange={(e) => updateQty(c.skuId, parseInt(e.target.value) || 1)}
                      className="qty-input"
                      aria-label={tr("qty", locale)}
                      style={{ width: 56, textAlign: "center" }}
                    />
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(c.skuId)}
                      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      {tr("remove", locale)}
                    </button>
                  </div>
                </div>
              ))}
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
                {tr("subtotal", locale)} ({items.length} {"פריטים"})
              </span>
              <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--accent)", fontFamily: "var(--font-mono, monospace)" }}>
                ₪{subtotal.toLocaleString()}
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 6 }}>
              {tr("vat_excl", locale)}
            </p>
          </div>

          {/* Order submit form */}
          <div className="cart-summary" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <h3 style={{ marginBottom: 20 }}>
              {"פרטי הזמנה"}
            </h3>
            <OrderSubmitForm items={cart} subtotal={subtotal} />
          </div>
        </div>
      </section>
    </main>
  );
}
