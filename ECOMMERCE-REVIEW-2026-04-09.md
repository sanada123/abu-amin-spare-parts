# E-commerce Expert Review — Abu Amin Spare Parts
**Date:** 2026-04-09 09:35 GMT+3
**Scope:** Product card, catalog page, product detail page, data model, taxonomy
**Method:** Read lib/data.ts, components/ProductCard.tsx, app/catalog/page.tsx, app/part/[slug]/page.tsx

---

## Executive Summary

The site has **solid structural bones** from v2/v3 but is failing basic e-commerce hygiene on three axes: (1) **information density** — critical fields are missing from cards and detail pages, (2) **taxonomy broken** — 28 flat categories including parents + children mixed together, (3) **trust & specs** — no delivery time, no return policy visible, no fitment confidence, no unit labels, no photo count, no clear brand/tier separation.

**Score: 6.0 / 10**
- Navigation: 5/10
- Catalog filtering: 6/10
- Product card: 5/10
- Product detail page: 7/10
- Data model: 6/10
- Trust signals: 4/10
- Empty states: 3/10
- Mobile flow: 7/10

---

## 🔴 CRITICAL ISSUES

### C1. Category taxonomy is flat — parents mixed with children
**File:** `lib/data.ts:112-134`
**Problem:** The `categories` array has 28 entries. Categories 18 (`tools-machines`) and 25 (`garden`) are PARENTS with `group` set. Their children (19–24, 26–28) have `parentId` but live in the same flat list. But the catalog sidebar (`app/catalog/page.tsx:244`) renders them ALL as equals — so the user sees "כלים ומכונות" AND "מדחסי אוויר" as sibling checkboxes. Confusing and wrong.

Additionally: category 15 `shocks-suspension` is a near-duplicate of category 4 `suspension`. Both exist.

**Fix:**
- Render parent categories as collapsible sections in the sidebar, children indented
- Auto-selecting a parent selects all children
- Remove `suspension` or `shocks-suspension` duplicate
- Group `auto` categories (1–17) under a "חלפי רכב" header
- Categories 18–28 stay grouped under "כלים ומכונות" / "גינה"

### C2. ProductCard doesn't show brand tier / OEM-vs-aftermarket
**File:** `components/ProductCard.tsx:163-190`
**Problem:** The card shows `brands.slice(0, 3).join(" · ")` — just brand names as a flat string. It doesn't communicate:
- Which price tier is shown (lowest? cheapest in-stock? chosen?)
- How many tiers exist ("from ₪145 · 4 אפשרויות")
- OEM vs aftermarket vs generic — the whole pricing structure we discussed in the content audit

**Fix:**
```
Bosch · Brembo · Akebono  +1
₪145 — החל מ־
4 אפשרויות זמינות
```
Or a "תגי תג" row: [מקורי] [שווה ערך] [תחליפי] with visible ₪ ranges.

### C3. Product name is not car-qualified on the card
**File:** `components/ProductCard.tsx:125-142`
**Problem:** The card shows "רפידות בלם קדמיות" with no vehicle context. In the catalog, you'd see 4 products all named "רפידות בלם קדמיות" for 4 different cars side-by-side — user cannot distinguish.

**Fix:** Append car fit inline:
```
רפידות בלם קדמיות
Toyota Corolla 2018–2022
```
Or auto-filter catalog to active vehicle by default.

### C4. Catalog shows ALL parts regardless of vehicle
**File:** `app/catalog/page.tsx:56`
**Problem:** If vehicle is NOT selected, catalog dumps all ~50 parts — overwhelming.
If vehicle IS selected, there's no default filter — user sees non-fitting parts with no "fits" label.

**Fix:** 
- If vehicle selected → default view = "fits your vehicle only" + toggle "הראה את הכל"
- If no vehicle → show vehicle selector prompt at top of catalog, with popular categories below

### C5. No "supply tier" model in `Part` / `Sku` interface
**File:** `lib/data.ts:38-49`
**Problem:** Every SKU has `brandId + price`. There's no enum `tier: "oem" | "equivalent" | "generic"`. This is the #1 thing Israeli buyers sort by (per the content audit). Right now tier is implicit in brand name only.

**Fix:** Add `tier: "oem" | "equivalent" | "generic"` field to Sku. Default mapping:
- Bosch/Brembo/Denso/NGK/Valeo/Sachs/Hella/Mahle/Mann → `equivalent`
- Febi/Akebono/Monroe → `equivalent` (cheaper)
- Unlisted brand = `generic`
- `oem` flag set manually per SKU when it's a genuine manufacturer part

### C6. No delivery time per SKU
**Problem:** Israeli buyers expect "במלאי — מחר 10:00" OR "הזמנה מחו"ל — 7 ימים". Currently only stock count shown.

**Fix:** Add `deliveryDays: number | "same-day"` to Sku, display on card + detail page.

### C7. Part detail page has no image gallery
**File:** `app/part/[slug]/page.tsx:46`
**Problem:** Single image (`partImageUrl(part)`). No gallery, no thumbnails, no fallback chain. For a spare part you want: installed view, packaging, close-up of mating surface, compatibility chart.

**Fix:** Change `Part.image: string` → `images: string[]`, render thumbnail strip with click-to-enlarge.

### C8. No "fits other vehicles" list on detail page
**Problem:** `part.fitsVehicleIds` exists in data but is never displayed. Buyer should see "מתאים גם ל: Corolla 2018–22, Camry 2018–20, RAV4 2018–22" as a collapsible block.

**Fix:** Add expandable "מתאים ל" list on detail page.

### C9. No return policy, warranty terms, or shipping info on detail page
**Problem:** Only `warrantyMonths` shown as bare number. No link to policy, no "14-day return per חוק הגנת הצרכן", no mention of damage handling, no "איסוף עצמי" option.

**Fix:** Add "אמינות ומשלוח" accordion:
```
✓ אחריות 24 חודשים מיצרן
✓ משלוח מעוספיא לכל הארץ תוך 1–3 ימים
✓ איסוף עצמי זמין במחסן
✓ החזרה תוך 14 יום לפי חוק הגנת הצרכן
```

### C10. No out-of-stock state handling
**File:** `components/ProductCard.tsx:135`
**Problem:** Card shows "אזל" if `inStock === false` but button still says "הוסף לעגלה" and works.
Detail page brand selector shows SKUs with stock 0? Not checked but likely broken.

**Fix:** 
- Out-of-stock card: grey out, replace CTA with "הודיעו לי כשחוזר למלאי" (email/phone capture → Telegram)
- Detail page: disable out-of-stock SKU options, visual strikethrough

---

## 🟠 HIGH-PRIORITY ISSUES

### H1. No breadcrumbs
**Problem:** On catalog and detail pages, no navigation breadcrumb. User can't jump "חלפי רכב / בלמים / רפידות".

**Fix:** Add breadcrumb bar: `ראשי › חלפי רכב › בלמים › רפידות בלם קדמיות`

### H2. Category icons are emojis — inconsistent and dated
**File:** `lib/data.ts:109-132`
**Problem:** 🛞🌀⚙️🔩⚡💡❄️🛢️🔧💨🚗⚫💡🪞🔩❄️🔋💦♨️💨🪚🌀🔨🌿🌾🌱🏡 — category 5 & 6 both use ⚡ / 💡; category 4 & 15 both use 🔩; category 7 & 16 both use ❄️. Also two 🌀 for different things.

**Fix:** Use lucide-react icons (already imported) or a proper icon set. Unique icon per category. Better fidelity than emojis.

### H3. No sorting options
**File:** `app/catalog/page.tsx`
**Problem:** No sort dropdown. Every e-commerce has "מחיר נמוך לגבוה / גבוה לנמוך / פופולריות / חדש ביותר / אחריות ארוכה ביותר".

**Fix:** Add sort dropdown. Default: `fits-active-vehicle first → in-stock → price asc`.

### H4. No results count
**Problem:** User doesn't see "42 מוצרים נמצאו" after filtering. No feedback loop.

**Fix:** Add count above grid: "נמצאו 23 חלפים עבור Corolla 2020".

### H5. Product description is unused
**File:** `lib/data.ts` Part interface has `description: LocalizedString` but I don't see it populated or displayed.

**Fix:** Write real descriptions (2–3 sentences per part), display on detail page. For demo, even boilerplate per category is better than empty.

### H6. No part quantity selector
**File:** `app/part/[slug]/page.tsx:33`
**Problem:** `addToCart({ partId, skuId, qty: 1 })` — qty hardcoded. No way to order 2 brake pads or 4 spark plugs from detail page.

**Fix:** Quantity stepper [-] [1] [+] before add-to-order button.

### H7. No comparison / multi-select
**Problem:** User wants to compare 2 products side-by-side. Standard e-commerce pattern missing.

**Fix:** Checkbox on card → "השוואה (2)" floating bar → comparison modal.

### H8. No related / upsell parts
**Problem:** If viewing brake pads, no "עוד ללקוחות שקנו" or "השלם את הסט (דיסקים קדמיים)". Huge missed revenue.

**Fix:** "השלם את הסט" block on detail page showing parts in same category for same vehicle. Or a kits cross-ref (`Kit.partIds` already exists, use it).

### H9. No search within catalog
**Problem:** Nav has a search input but can't filter the catalog visually. User must navigate away to /search.

**Fix:** Add inline search box in catalog sidebar that filters visible products.

### H10. No "recently viewed" or "favorites"
**Problem:** Users browse multiple parts to compare; no persistence.

**Fix:** localStorage `recentParts: number[]` with "נצפו לאחרונה" block at bottom of catalog/detail.

---

## 🟡 MEDIUM-PRIORITY ISSUES

### M1. Image fallback logic is inline and fragile
**File:** `components/ProductCard.tsx:73-101`
**Problem:** Fallback badge is hidden as sibling, shown via `display: none → flex` on error. Inline handler, fragile.

**Fix:** Proper `<Image>` with `onError` setting state, or Next.js Image with fallback pattern.

### M2. Brand flags are emoji country flags
**File:** `lib/data.ts:79-92`
**Problem:** 🇩🇪🇯🇵🇮🇹🇺🇸 — country of origin, not brand logo. Misleading and unprofessional.

**Fix:** Real brand logos (SVG, 1 file per brand in `public/brands/`).

### M3. YouTube install video has placeholder ID
**File:** `lib/data.ts:306` — `"dQw4w9WgXcQ"` (Rick Roll)
**Problem:** Multiple parts reference this exact video ID = Rick Roll. Will be embarrassing in production.

**Fix:** Either remove install video field until real content, or gate behind a "בקרוב" placeholder.

### M4. Price type inconsistency
**File:** `lib/data.ts:42` — comment says "in ILS, not agorot for demo simplicity"
**Problem:** For production, prices should be in agorot (integer) to avoid floating point. Document this for DB migration.

### M5. No price display rules — VAT unclear
**Problem:** `₪189` — כולל מע"מ? לא כולל? B2B buyer asks this first.

**Fix:** Show "₪189 כולל מע"מ" explicitly. Or toggle in settings: display with/without VAT.

### M6. No "last updated" or "SKU code visible"
**Problem:** Detail page shows OEM numbers but SKU part numbers (`brand pn`) are only in the brand option rows. A customer saying "I want Bosch 0986494614" should be able to find it.

**Fix:** Show SKU code prominently near price when selected. Copy-to-clipboard icon next to it.

### M7. No wishlist / save for later
**Problem:** Typical e-commerce pattern absent.

**Fix:** Heart icon on card, localStorage wishlist. Low priority but standard.

### M8. No recent searches / popular parts
**Problem:** Homepage could show "הכי נמכרים השבוע" based on cart adds.

**Fix:** Track cart adds in localStorage, derive a "trending" list. Low priority.

### M9. Mobile filter drawer UX
**File:** `app/catalog/page.tsx:457-473`
**Problem:** Mobile filter button exists but hard to tell if the drawer has good affordances (close button, apply button, scroll behavior).

**Fix:** Review mobile drawer — "סגור" button top-right, "החל X מסננים" sticky bottom, backdrop tap-to-close.

### M10. No pagination / infinite scroll limits
**Problem:** If catalog grows to 500 parts, current flat render dies. No pagination, no virtualization, no "load more".

**Fix:** Limit initial render to 24, "טען עוד" button.

---

## 🟢 LOW-PRIORITY / POLISH

### L1. Consistent number formatting
**Problem:** `₪189` raw — no thousands separator. `₪1,189` for larger items missing.
**Fix:** `toLocaleString('he-IL')`.

### L2. Part number copy-to-clipboard
Fix: Click OEM number → copies to clipboard + toast "הועתק".

### L3. Share product (WhatsApp/Telegram/copy link)
Fix: Share button on detail page → native share API.

### L4. Print / save-as-PDF part page
For mechanics who want physical reference. Low priority.

### L5. QR code per part
For in-store displays linking to online stock. Nice-to-have.

---

## Specific File Fixes (for Claude Code sprint)

### Data model — lib/data.ts
1. Add `tier: "oem" | "equivalent" | "generic"` to `Sku` interface
2. Add `deliveryDays: number | "same-day" | "import"` to `Sku`
3. Change `Part.image: string` → `images: string[]`
4. Populate `description` on all 50+ parts (2–3 sentences each)
5. Remove duplicate categories (4 vs 15 suspension)
6. Structure categories into parent/child hierarchy clearly
7. Replace Rick Roll video IDs with undefined or real content

### ProductCard — components/ProductCard.tsx
1. Show "from ₪X" with tier count: "החל מ־₪145 · 4 אפשרויות"
2. Append vehicle name to title when multiple variants exist
3. Out-of-stock state: grey + notify-me button
4. Delivery time micro-copy: "📦 מלאי · מחר"
5. Wishlist heart icon

### Catalog — app/catalog/page.tsx
1. Breadcrumbs at top
2. Group categories: parents as headers, children indented
3. Results count "נמצאו 23 חלפים"
4. Sort dropdown
5. Inline search in sidebar
6. Default filter to active vehicle
7. Fits-vehicle toggle
8. Mobile drawer review

### Detail — app/part/[slug]/page.tsx
1. Image gallery (multiple images)
2. Breadcrumbs
3. Description block
4. Collapsible "מתאים גם ל" list
5. Quantity stepper
6. "השלם את הסט" related parts block
7. "אמינות ומשלוח" accordion
8. Specs table expansion
9. Out-of-stock handling per SKU
10. VAT label on price

---

## Quick Wins (< 30 min total)

1. **Remove duplicate category** (suspension vs shocks-suspension) — 2 min
2. **Replace Rick Roll video IDs** with `undefined` — 2 min
3. **Add results count to catalog** — 10 min
4. **Add breadcrumbs to detail page** — 10 min
5. **Add "מתאים גם ל" expandable block** — using existing data — 15 min

## Big Wins (2–4 hours)

1. **Full taxonomy rework** — parent/child rendering in sidebar, default to vehicle fitment — 1.5 h
2. **Pricing tier model** — Sku.tier field, visual tier tags on card+detail — 1 h
3. **Image gallery on detail** — multiple images + thumbnails — 45 min
4. **Delivery time per SKU + display** — 45 min
5. **Out-of-stock handling end-to-end** — 45 min

---

## What To Feed Claude Code Next

After the current brand sprint completes and commits, spawn a new Claude Code session with this file as input. Prompt it to:
- Read ECOMMERCE-REVIEW-2026-04-09.md
- Implement ALL Critical (C1–C10) and High (H1–H10) issues
- Build must pass
- Commit: `feat: e-commerce review fixes — taxonomy, tiers, detail page, trust signals`
- Push and Railway deploy

**Estimated effort:** 5–7 hours of focused dev (Claude Code parallel time).

---

## Final Verdict

The site is **not broken**, but it's an **MVP that reads like a demo**, not a store a real mechanic would trust with a ₪600 purchase. The data model has the right shapes but fields are underused. The UI has good polish from v2/v3 but is missing the dense, trust-heavy e-commerce patterns Israeli buyers expect (pricing tiers, delivery time, return policy, warranty details, fitment confidence).

Fixing the Critical issues alone would move the score from **6 → 8**. Adding High issues gets it to **9+**. Medium/Low are quality and can wait.

**Author:** Atlas
**Next step:** Wait for brand sprint, then dispatch e-commerce review sprint with this doc.
