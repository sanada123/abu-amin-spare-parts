# Design System: אבו אמין חלפים — Abu Amin Spare Parts

## 1. Visual Theme & Atmosphere

**A confident, high-trust auto parts catalog with the authority of a professional wholesale counter and the approachability of a neighborhood store.** The interface reads like a well-organized mechanical workshop — functional, dense where data demands it, but never cluttered. Every surface earns its space.

The atmosphere is warm-industrial: warm neutrals ground the light theme, while Torque Yellow (#F5C300) appears sparingly as the single accent — reinforcing the hexagonal bolt-head brand mark. The feeling is "your mechanic friend who always has the right part" — competent, fast, no-nonsense, but never cold.

**Density:** 6/10 — "Parts Counter Dense". Product grids pack information (part number, fitment, brand, price, stock) without requiring expand/collapse. The admin panel runs at 7–8.
**Variance:** 5/10 — "Purposeful Asymmetric". Hero section uses left-aligned split layout. Product grids are uniform (catalog consistency matters more than visual surprise in e-commerce). Category navigation breaks the grid intentionally.
**Motion:** 3/10 — "Restrained Mechanical". Auto parts buyers are task-driven — they came for a brake pad, not an animation. Micro-interactions limited to feedback (add-to-cart confirmation, hover states). No scroll-triggered reveals, no parallax, no loading choreography. Speed is the UX.

**RTL-First Architecture:** Hebrew is the only language. Every layout, every animation direction, every text alignment defaults to `dir="rtl"`. Margin-inline-start replaces margin-left. Chevrons point left. Swipe directions are mirrored. This is not an afterthought — it is the structural default.

---

## 2. Color Palette & Roles

### Light Theme (Default — Production)

| Token | Hex | Role |
|-------|-----|------|
| **Warm White** | `#FAFAF8` | Page canvas — warm cast avoids clinical feel |
| **Clean Surface** | `#F5F4F0` | Card backgrounds, input fields, secondary surfaces |
| **Mist** | `#E8E7E2` | Borders, dividers, table lines |
| **Stone Border** | `#D0CFC8` | Strong borders, active card outlines |
| **Charcoal Ink** | `#1A1915` | Primary headings — warm near-black, never pure `#000` |
| **Workshop Grey** | `#47463F` | Body text — high readability without harshness |
| **Steel Muted** | `#6B6A62` | Secondary text, descriptions, metadata |
| **Fog** | `#9E9D95` | Placeholder text, disabled labels |
| **Torque Yellow** | `#F5C300` | Single accent — CTAs, active states, price highlights, brand mark |
| **Torque Hover** | `#D4A800` | Hover state on yellow elements |
| **Torque Pressed** | `#A88500` | Active/pressed state |
| **Torque Dim** | `rgba(245, 195, 0, 0.10)` | Tinted backgrounds for selected states |
| **In-Stock Green** | `#16A34A` | Stock availability, fitment confirmed badges |
| **Stock Green Dim** | `rgba(22, 163, 74, 0.08)` | Background tint for in-stock indicators |
| **Alert Red** | `#DC2626` | Out of stock, errors, destructive actions |
| **Caution Amber** | `#D97706` | Low stock warnings, pending states |

### Dark Theme (Admin Panel Only)

| Token | Hex | Role |
|-------|-----|------|
| **Industrial Black** | `#0A0A08` | Admin page background |
| **Carbon Surface** | `#141414` | Admin card/panel backgrounds |
| **Graphite** | `#1F1F1F` | Elevated surfaces, dropdowns |
| **Charcoal Border** | `#2A2A2A` | Subtle dividers |
| **Steel Border** | `#3A3A3A` | Visible borders, active outlines |
| **Torque Yellow** | `#F5C300` | Same accent across both themes |

### Color Rules

- **Maximum 1 accent color.** Torque Yellow is the only accent. Never introduce blue, purple, or secondary accent colors.
- **No pure black** (`#000000`) anywhere — use `#1A1915` (Charcoal Ink) or `#0A0A08` (Industrial Black).
- **Yellow on white fails WCAG** — never use Torque Yellow for text on white/light backgrounds. Yellow is for buttons (with dark text on top), badges, and decorative accents only.
- **Price text** is always Charcoal Ink (`#1A1915`) at bold weight — prices must be the most readable element on any card.
- **₪ symbol** same weight and size as the number — no subscript/superscript styling on currency.

---

## 3. Typography Rules

### Font Stack

- **Primary (Headings + Body):** `Heebo` — Hebrew-first geometric sans-serif. Loaded from Google Fonts at weights 400, 700, 900.
- **Monospace (Part Numbers, Prices, Stock):** `ui-monospace, 'Cascadia Code', 'JetBrains Mono', monospace` — auto parts shoppers scan by part number. Monospace makes SKUs instantly parseable.
- **Fallback chain:** `'Heebo', 'Arial Hebrew', 'David', system-ui, sans-serif`

### Hierarchy

| Element | Size | Weight | Color | Notes |
|---------|------|--------|-------|-------|
| Page title (H1) | `clamp(1.4rem, 4vw, 2rem)` | 900 (Black) | Charcoal Ink | Track-tight: `letter-spacing: -0.02em` |
| Section heading (H2) | `clamp(1.2rem, 3.5vw, 1.6rem)` | 700 (Bold) | Charcoal Ink | With 3px yellow underline bar, 40px wide |
| Card title | `0.85rem` | 600 | Charcoal Ink | 2-line clamp, `line-height: 1.35` |
| Body text | `0.9rem` (14.4px) | 400 | Workshop Grey | `line-height: 1.6`, max `65ch` per line |
| Part number | `0.72rem` | 600 | Torque Yellow on code background | Monospace, pill-shaped badge |
| Price | `1.05rem` | 700 | Charcoal Ink | Tabular numerals when available |
| Metadata | `0.7rem` | 500 | Fog | Stock count, delivery days, brand origin |

### Typography Rules

- **Prices MUST use monospace** for column alignment in lists and tables.
- Part numbers are always `uppercase`, monospace, letter-spaced.
- Hebrew text never gets `text-transform: uppercase` — it has no case. Latin brand names (Bosch, Denso) may be uppercased.
- **Minimum body size:** 14px on mobile, never smaller. Touch-screen users in a garage have greasy fingers and bright sun.
- **No decorative fonts.** This is a parts catalog, not a fashion label.

---

## 4. Component Stylings

### Buttons

- **Primary CTA:** Torque Yellow (`#F5C300`) fill, Charcoal Ink text, `font-weight: 700`. Border-radius `6px`. Min-height `48px` (touch target). On press: `translateY(1px)` + darken to `#D4A800`. No outer glow, no shadow.
- **Secondary:** Ghost button — transparent background, `1px solid var(--border-strong)`, Workshop Grey text. On hover: light surface fill.
- **Destructive:** Alert Red fill, white text. Admin panel only.
- **WhatsApp CTA:** `#25D366` fill, white text, WhatsApp icon inline. This is the primary conversion button — it must be the largest, most prominent button on the cart page.
- **Disabled state:** `opacity: 0.45`, `cursor: not-allowed`. No color change — just dim.

### Product Cards

The product card is the most important component on the site. It must communicate 6 pieces of information without requiring interaction: **image, name, fitment match, brand(s), price, stock status.**

```
┌─────────────────────┐
│   [Product Image]    │  ← 1:1 aspect, object-fit: cover
│   aspect-ratio: 1/1  │     Subtle zoom on hover (1.04x)
├─────────────────────┤
│ רפידות בלם קדמיות    │  ← Card title, 2-line clamp
│ ✓ מתאים ל-Corolla    │  ← Green fitment badge (when vehicle selected)
│ Brembo · Bosch       │  ← Brand names, monospace, fog color
│                      │
│ ₪85        במלאי ✓  │  ← Price (bold) + stock status, pushed to bottom
└─────────────────────┘
```

- Background: Clean Surface (`#F5F4F0`)
- Border: `1px solid #E8E7E2`, rounds to `8px`
- On hover: border darkens to `#D0CFC8`, background shifts to `#E8E7E2`
- No box shadow on cards — borders only. Shadows are reserved for floating elements (tooltips, dropdowns).
- **Card grid:** 2 columns on mobile, 3 at 640px, 4 at 900px. Gap: `10px` → `14px` → `16px`.

### Vehicle Selector

The cascading Make → Year → Model → Engine selector is the primary navigation pattern. It must feel instant.

- Horizontal stepped layout on desktop: 4 dropdowns in a row.
- Stacked vertical on mobile: one dropdown per row.
- Each step only appears after the previous is selected — progressive disclosure.
- Selected vehicle persists in a yellow-tinted banner across the site: `"🚗 Toyota Corolla 2020 1.6"` with an × to clear.
- Dropdown styling: Clean Surface background, Stone Border, `min-height: 48px`.

### Forms (Order Submit)

- **Customer type selection:** Two large tap targets ("לקוח פרטי" / "מוסך"), minimum `100px` height each. Selected state: yellow border + yellow tint background.
- **Input fields:** Label above (never floating labels), Clean Surface background, Stone Border. Focus ring: `2px solid #F5C300`. Error text below in Alert Red, `0.78rem`.
- **Phone input:** `inputMode="tel"`, auto-formatted with dash after area code.

### Navigation

- **Desktop:** Horizontal top bar, logo left (RTL: right), links centered, cart icon + WhatsApp button on opposite end.
- **Mobile:** Sticky bottom tab bar with 4 items: Home, Catalog, Cart (with badge count), Contact. Fixed at bottom, `56px` height + safe area inset.
- **Admin:** Sidebar navigation on desktop, hamburger on mobile. Dark theme always.

### Trust Indicators

- Horizontal strip of 4 micro-badges below the hero: OEM quality, Fitment guarantee, Fast shipping, Returns policy.
- Icon (14px Lucide) + single-line text. No elaborate illustrations.
- Background: subtle surface tint, no cards.

### Loading States

- **Product grid:** Skeleton cards matching exact card dimensions — image placeholder (grey pulse), two text lines, price block.
- **Vehicle selector:** Dropdown shows "טוען..." with inline spinner (not a modal overlay).
- **No full-page loading screens.** Shell renders immediately; data streams in.

### Empty States

- **No search results:** "לא נמצאו חלקים" with a wrench icon and a CTA to browse all categories or contact via WhatsApp.
- **Empty cart:** Visual of an empty cart with "העגלה ריקה — בואו נמצא את מה שאתם צריכים" and a CTA to the catalog.

---

## 5. Layout Principles

### Grid Architecture

- **Max content width:** `1440px`, centered with auto margins.
- **Section padding:** `24px 14px` mobile, `48px 24px` desktop.
- **CSS Grid over Flexbox** for all multi-column layouts.
- **No `calc()` percentage hacks** — use grid `fr` units and `gap`.

### Page Structure

```
┌──────────────────────────────────────┐
│  Promo Banner (if active promotion)  │  ← Dismissible, yellow tint
├──────────────────────────────────────┤
│  Navigation Bar                      │
├──────────────────────────────────────┤
│  [Page Content — varies per route]   │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Footer                              │
├──────────────────────────────────────┤
│  WhatsApp Floating Button (mobile)   │  ← Fixed, bottom-right (RTL: bottom-left)
│  Bottom Tab Bar (mobile)             │  ← Fixed, bottom
└──────────────────────────────────────┘
```

### Homepage Layout

```
1. Hero — Left-aligned (RTL: right-aligned) headline + search bar + 2 CTAs
2. Vehicle Selector — Full-width cascading dropdowns
3. Category Strip — Horizontal scroll, pill-shaped chips
4. Trust Bar — 4-column micro-badges
5. Top Makes — 4×3 grid (mobile: 4×1), car manufacturer logos
6. Featured Products — Product card grid (4-col desktop)
7. Categories Grid — 6-col desktop, 3-col mobile
8. Stats Banner — 2×2 grid with large numbers
9. Brands Strip — Horizontal chip row
10. Testimonials — 3-column cards (stack on mobile)
```

### Product Detail Layout

- Desktop: 2-column split — image (55%) | info (45%).
- Mobile: Stacked — image on top, info below.
- SKU variants listed as selectable rows (not a dropdown) — each row shows brand, part number, price, stock. Selected row gets yellow border.
- "Add to Cart" button spans full width below variants.

### RTL Layout Rules

- `dir="rtl"` on `<html>` — not per-component.
- Use `margin-inline-start` / `padding-inline-end` — never `margin-left` / `padding-right`.
- Flexbox default direction flips automatically in RTL — don't manually set `flex-direction: row-reverse`.
- Icons with directional meaning (arrows, chevrons) must mirror: `←` not `→`.
- WhatsApp floating button: bottom-left in RTL (CSS `inset-inline-start`).

---

## 6. Motion & Interaction

### Philosophy: Speed Over Spectacle

Auto parts buyers are task-driven. They want to find a part, confirm fitment, check price, and order — in under 60 seconds. Every animation must serve this goal or be removed.

### Allowed Motion

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Product card hover | Border color change + image zoom 1.04x | `150ms` | `ease` |
| Button press | `translateY(1px)` | `100ms` | `ease` |
| Cart badge count | Scale pop `1 → 1.2 → 1` | `200ms` | `ease-out` |
| Dropdown open | `opacity 0→1` + `translateY(-4px → 0)` | `150ms` | `ease-out` |
| Page transition | None — instant. | `0ms` | — |
| Toast notification | Slide in from top | `200ms` | `ease-out` |

### Banned Motion

- No scroll-triggered reveals / fade-in-on-scroll
- No parallax
- No staggered cascade reveals on product grids (all items render simultaneously)
- No loading choreography or sequenced skeleton reveals
- No hover animations that take longer than 200ms
- No spring physics — this is a catalog, not a portfolio
- No perpetual micro-loops (floating, pulsing, shimmering)
- No `transform: scale()` on hover for cards (only for image zoom within the card)

### Performance

- Animate exclusively via `transform` and `opacity` — never `top`, `left`, `width`, `height`.
- `transition` on background-color, border-color, color: `200ms ease` globally.
- Images: `loading="lazy"` on all below-fold images. First 4 product images eager-loaded.

---

## 7. E-Commerce UX Patterns (Auto Parts Specific)

### Vehicle-First Navigation

The #1 UX insight for auto parts: **the vehicle IS the filter.** Every user arrives with a specific car in mind. The vehicle selector must be:

- Visible above the fold on the homepage
- Persistent across pages (selected vehicle shows in a sticky banner)
- Applied automatically to product grids (show fitment match badges)
- Clearable with one tap

### Part Number Search

Professional mechanics (the "garage" customer type) search by OEM part number, not by name. The search must:

- Accept partial part numbers
- Show instant results (debounced 200ms)
- Display part number prominently in results (monospace, yellow tint)
- Work with and without dashes (e.g., "04465-02220" = "0446502220")

### Price Display

- Always show the lowest SKU price on the card: `"החל מ-₪85"`
- On product detail: show all SKU options as a vertical list, sorted by price ascending
- Price includes VAT indicator: `"לא כולל מע"מ"` or `"+ מע"מ 17%"`
- Never show crossed-out "original" prices unless there is a real, time-limited promotion

### Stock & Delivery Signals

- **In stock:** Green text `"במלאי"` with checkmark
- **Low stock (1–3):** Amber text `"אחרון במלאי!"` — creates urgency without being manipulative
- **Out of stock:** Red text `"אזל"` — disable add-to-cart, show "הודע כשיחזור" (notify when back)
- **Delivery estimate:** `"3 ימי עסקים"` in metadata, per-SKU

### WhatsApp as Primary Checkout

This store does not process payments online. The entire checkout flow routes to WhatsApp. This means:

- "Add to Cart" builds a local cart (client-side state)
- Cart page shows the order summary
- The CTA is a WhatsApp deep link with pre-filled message
- The message includes: customer type, name, phone, vehicle, items list, total
- **WhatsApp button must be the most visually dominant element on the cart page**

### Trust Signals for Auto Parts

Parts buyers worry about: fitment (will it fit my car?), quality (OEM vs aftermarket), warranty, and returns. Surface these answers proactively:

- Fitment badge on every product card when vehicle is selected
- Brand tier labels: "מקורי" (OEM), "חלופי" (aftermarket), "פרימיום" (premium aftermarket)
- Warranty duration per SKU (shown in product detail)
- Return policy in footer and product detail

---

## 8. Anti-Patterns (Banned)

### Visual

- No emojis in UI text (allowed only in WhatsApp message templates and Telegram bot messages)
- No `Inter` font — Heebo is the only font
- No pure black (`#000000`)
- No neon/outer glow shadows
- No gradient text on headers
- No custom mouse cursors
- No overlapping elements — clean spatial separation always
- No 3-column equal card layouts (product grid uses 2/3/4 responsive columns)
- No rounded-full buttons (pills) for primary CTAs — use `6px` radius

### Content

- No fake testimonials with "John Doe" names — use Hebrew names with city
- No inflated numbers ("1M+ products!") — keep stats honest
- No "🔥 מבצע מטורף!" language — this undermines trust
- No English text in the storefront UI — Hebrew only
- No AI copywriting clichés: "Elevate", "Seamless", "Next-Gen", "Game-Changing"
- No lorem ipsum — every piece of text must be real Hebrew

### UX

- No popups on page load (newsletter, cookie banner, etc.)
- No "scroll to explore" hints or bouncing chevrons
- No infinite scroll on product grids — use paginated navigation with clear page counts
- No autoplaying video or audio
- No chat widgets — WhatsApp is the communication channel
- No "compare products" feature unless explicitly requested — adds complexity without value for most auto parts buyers
- No social media login — this store uses password-based admin auth only
- No dark mode toggle for customers — light mode is the only storefront theme (dark is admin only)

### Technical

- No `localStorage` for cart state on first visit — use React state, persist to localStorage only after first add-to-cart
- No client-side price calculation for totals — prices come from the server (SKU table)
- No `h-screen` — use `min-h-[100dvh]` for full-height sections
- No horizontal overflow on mobile — test every component at 320px width
- No images without `alt` text in Hebrew
- No lazy loading on above-fold product images (first 4 cards)
