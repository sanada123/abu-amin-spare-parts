# Pivot v2 — Israeli Market Reality

Based on owner (Sanad) answers 2026-04-09.

## Business model (confirmed)
- **No payment on site.** User builds an order (select vehicle + parts) → submits → order is sent.
- **Delivery channel:** Telegram bot (Sanad's) for testing now. WhatsApp later (same pattern).
- **Customers:** Both private drivers AND mechanics/garages — one unified flow for now.
- **Pricing:** Fixed per SKU, set from admin panel. No quote negotiation.
- **Location:** Warehouse in Isfiya / Daliyat al-Karmel (עוספיא / דלית אל כרמל) — Arab towns on Mt. Carmel near Haifa.
- **Suppliers:** Largest suppliers in Israel (to be listed later).
- **Languages:** Hebrew + Arabic only. DROP English completely.
- **License plate lookup:** NOT now (owner won't get API access).

## What to build

### 1. Order flow (replaces cart/checkout)
- Keep "Add to cart" UX — user builds list of parts
- Replace "checkout/pay" with **"סיים הזמנה ושלח"** (Submit Order)
- Submit form fields:
  - שם מלא (name)
  - טלפון (phone)
  - עיר / כתובת (city/address)
  - רכב (year/make/model/engine — from selector, auto-filled)
  - הערות (notes — free text)
  - Selected parts list (auto from cart)
- On submit → POST to `/api/order` → server sends message to Telegram bot → returns confirmation page.

### 2. Telegram integration
- Env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (Sanad's personal chat ID: 422035227)
- Server action `/api/order` uses `fetch('https://api.telegram.org/bot<TOKEN>/sendMessage', ...)` to send a nicely formatted Hebrew/Arabic order summary.
- Message format:
```
🛠️ הזמנה חדשה — אבו אמין חלפים

👤 יוסי לוי
📞 050-1234567
📍 חיפה, רח' הרצל 12
🚗 Toyota Corolla 2018 1.8L

📦 פריטים:
• רפידות בלמים קדמיות — Bosch — 340 ₪
• מסנן שמן — Mann — 45 ₪
• מסנן אוויר — 80 ₪

💰 סה"כ: 465 ₪ (לא כולל מע"מ)

📝 הערות: רוצה איסוף ביום ראשון
───
הזמנה #A-2026-0142 · 2026-04-09 08:15
```
- Also store order in `/data/orders.json` or Postgres (simple JSON file is fine for now).
- Admin page `/admin/orders` lists all orders with status (new/confirmed/shipped/delivered).

### 3. WhatsApp button (secondary path)
- Floating button bottom-left (left because RTL): green WhatsApp icon
- Clicking opens `wa.me/972XXXXXXXXX?text=...` with pre-filled message including:
  - Current page/product context
  - Car if selected
  - Part name + SKU if on product page
- Number stored in env: `WHATSAPP_NUMBER` (placeholder `972500000000` for now, Sanad to fill)
- On product page: also a large inline "שלח בוואטסאפ" button next to "הוסף להזמנה"

### 4. Drop English language
- `lib/i18n.ts`: remove `en` from Locale type and all translation objects
- `components/Nav.tsx`: language toggle = HE ↔ AR only (two states, not three)
- Default: `he`
- Keep RTL for both Hebrew and Arabic

### 5. Israeli-specific category expansion
Add these to homepage category strip + catalog (keep existing + add these):
- **פנסים ואיתותים** (Headlights, taillights, signals) — icon: 💡 / lightbulb
- **פגושים ומראות** (Bumpers, mirrors, body) — icon: 🪞 / car-front
- **בולמי זעזועים ומתלים** (Shocks & suspension) — icon: spring/shock
- **מערכת מיזוג** (A/C system) — icon: ❄️ / snowflake
- **מצברים** (Batteries) — icon: 🔋 / battery

Update `lib/data.ts` categories seed data.

### 6. Footer rebuild
Israeli trust signals:
```
אבו אמין חלפים
המחסן: עוספיא / דלית אל כרמל
טלפון: 050-XXXXXXX     [big, tap-to-call]
וואטסאפ: [green button]
שעות פעילות: א'-ה' 08:00-18:00, ו' 08:00-13:00

אחריות · החזרות · משלוחים · אודות
© 2026 אבו אמין חלפים · ח"פ: XXXXXXXX
```
(Real phone/ח"פ as env placeholder — Sanad to provide)

### 7. Hero copy rewrite
From: "מצא את החלק המדויק לרכב שלך"
To: **"בחר את הרכב שלך, בחר חלפים, ושלח הזמנה."** + sub: "אנו נחזור אליך עם זמינות ומחיר סופי תוך שעות."

### 8. About page content
Simple page `/about`:
- מי אנחנו: חנות חלפים מהאזור הצפון, עם מחסן בעוספיא / דלית אל כרמל
- ניסיון של X שנים (Sanad to provide)
- עובדים עם הספקים הגדולים בישראל
- שירות למוסכים ופרטיים כאחד
- Contact info

### 9. Admin panel additions
Current `/admin` already manages parts + kits. Add:
- `/admin/orders` — list all submitted orders, mark as handled
- `/admin/categories` — add/edit categories (for the 5 new Israeli-specific ones)
- `/admin/settings` — store phone, whatsapp, address, business hours, VAT display toggle

## Constraints

- Preserve dark theme + yellow accent + current layout polish from previous audit fix
- Keep mobile-first + RTL + sticky bottom cart bar
- Hebrew primary, Arabic secondary
- Build must pass `npm run build` with zero errors
- Commit message: `feat: pivot v2 — order flow + telegram + israeli market fit`
- Push to main (Railway auto-deploy)

## Files you will touch (at minimum)

- `app/layout.tsx` — remove `en` from locale handling, update metadata
- `lib/i18n.ts` — drop English strings, add new order-flow strings (HE + AR)
- `lib/cart.ts` — rename cart → order, or keep cart internally but relabel
- `components/Nav.tsx` — HE↔AR toggle only, footer with new info
- `components/Footer.tsx` (new or existing) — Israeli trust footer
- `components/WhatsAppButton.tsx` (new) — floating button
- `components/OrderSubmitForm.tsx` (new) — full order form
- `app/cart/page.tsx` — rename to Order, add submit form
- `app/api/order/route.ts` (new) — POST handler, Telegram send, store order
- `app/admin/orders/page.tsx` (new)
- `app/admin/settings/page.tsx` (new)
- `app/about/page.tsx` (new)
- `lib/data.ts` — add 5 new categories with icons
- `components/CategoryStrip.tsx` — render new categories
- `.env.example` — add TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, WHATSAPP_NUMBER, PHONE_NUMBER, BUSINESS_ADDRESS
- Delete: English strings everywhere, English toggle UI

## What to skip for now

- B2B separate portal (unified flow for both audiences)
- License plate API (no access)
- 4-tier pricing (fixed single price per SKU from admin)
- VAT toggle (can be just displayed as "לא כולל מע"מ" line)
- Salvage/used parts (out of scope)
- Same-day delivery promises (depends on inventory system — later)
