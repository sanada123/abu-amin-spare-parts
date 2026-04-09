# E-commerce Critical Fixes — Execute ONE BY ONE

Read this file. Implement each fix sequentially (C1 → C2 → ... → C10).
After EACH fix: verify it works (check the component renders, check types, grep for the change).
Do NOT skip any. Do NOT batch. One at a time.

Reference: the full review is in the repo root at ECOMMERCE-REVIEW-2026-04-09.md (was copied from client folder).

---

## C1. Fix Category Taxonomy — Parents vs Children

**Problem:** `lib/data.ts` has 28 categories in a flat array. Categories 18 (tools-machines) and 25 (garden) are parents with `group` set. Their children (19-24, 26-28) have `parentId`. But `app/catalog/page.tsx` renders ALL as equal checkboxes in the sidebar.

Also: category 4 (`suspension`) and 15 (`shocks-suspension`) are near-duplicates.

**Fix:**
1. Remove category 4 (`suspension`) — keep 15 (`shocks-suspension`) which is more descriptive. Update any parts that reference categoryId 4 to use 15.
2. In `app/catalog/page.tsx` sidebar category filter:
   - Group categories by parent: show parent as bold header, children indented below
   - Auto parts (no group or group="auto") under "חלפי רכב" header
   - Tools (group="tools") under "כלים ומכונות" header  
   - Garden (group="garden") under "גינה" header
   - Clicking parent toggles all children
3. In homepage CategoryStrip: show only top-level auto categories (not sub-categories of tools/garden)

**Verify:** Open catalog page mentally — are categories grouped? Is the duplicate gone?

---

## C2. Add Tier Field to SKU + Display on ProductCard

**Problem:** SKUs have brandId + price but no "tier" classification. Israeli buyers need to know: מקורי (OEM) vs חליפי (aftermarket).

**Fix:**
1. In `lib/data.ts`, add to Sku interface: `tier: "original" | "replacement"`
   - "original" = מקורי (OEM genuine parts)
   - "replacement" = חליפי (aftermarket — Bosch, Brembo, Mann, etc.)
2. Set tier on ALL existing SKUs in seed data. Rule of thumb:
   - All current brands (Bosch, Brembo, Mann, Febi, Denso, NGK, Valeo, Sachs, Hella, Mahle, Akebono, Mobil1, Castrol, Exide, Monroe) → `"replacement"`
   - None are OEM in current data (that's fine for demo)
3. In `components/ProductCard.tsx`: show tier info:
   - Below brand names: "חליפי · 4 אפשרויות" or "מקורי + חליפי · 3 אפשרויות"
   - If mixed tiers exist for a part, show both labels
4. In `app/part/[slug]/page.tsx`: next to each brand option, show a small tag:
   - `[מקורי]` in gold/yellow for original
   - `[חליפי]` in gray for replacement

**Verify:** Check ProductCard renders tier text. Check Part detail shows tags.

---

## C3. Show Vehicle Name on ProductCard

**Problem:** Multiple parts have identical names ("רפידות בלם קדמיות") for different vehicles. Card doesn't show which car.

**Fix:**
1. In `app/catalog/page.tsx` or `components/ProductCard.tsx`: add a `vehicleNames` prop (or derive it from fitsVehicleIds)
2. Show abbreviated vehicle list under the part name:
   ```
   רפידות בלם קדמיות
   Toyota Corolla 2018–2022
   ```
3. If fits multiple models: show primary + "+X נוספים"
4. Pass this data from catalog page when rendering ProductCard

**Verify:** Cards should show car names. No two identical-looking cards.

---

## C4. Default-Filter Catalog to Active Vehicle

**Problem:** When a vehicle is selected, catalog still shows ALL parts. User has to manually find what fits.

**Fix:**
1. In `app/catalog/page.tsx`: if `activeVehicleId` is set, default the filtered list to only parts where `fitsVehicleIds.includes(activeVehicleId)`
2. Add a toggle button at top: "מציג חלפים לרכב שלך" ↔ "הראה הכל"
3. When toggle is off → show all parts (current behavior)
4. When toggle is on (default when vehicle selected) → only fitting parts
5. Show count: "23 חלפים מתאימים לרכב שלך"

**Verify:** Select a vehicle, go to catalog. Should see only matching parts by default. Toggle works.

---

## C5. (Already done in C2 — tier field added. Skip.)

---

## C6. Add Delivery Estimate to SKU

**Problem:** No delivery time shown. Israeli buyers expect "במלאי — מחר" or "הזמנה — 3-5 ימים".

**Fix:**
1. In `lib/data.ts` Sku interface, add: `deliveryDays?: number` (optional — undefined means "standard")
2. Set `deliveryDays: 1` for all in-stock items (stock > 10), `deliveryDays: 3` for low-stock (stock < 10)
3. In `components/ProductCard.tsx`: show micro-copy next to stock indicator:
   - stock > 10: "📦 במלאי · מחר"
   - stock 1-10: "📦 מלאי מוגבל · 3 ימים"
   - stock 0: "❌ אזל מהמלאי"
4. In `app/part/[slug]/page.tsx`: show delivery estimate for selected SKU

**Verify:** Cards show delivery text. Detail page shows it for selected SKU.

---

## C7. Support Multiple Images on Part Detail

**Problem:** `Part.image` is a single string. Detail page shows one image.

**Fix:**
1. In `lib/data.ts`: change `Part` interface — add `images?: string[]` (keep `image` for backward compat)
2. In `app/part/[slug]/page.tsx`: if `part.images` exists and has multiple entries, show thumbnail strip below main image. Click thumbnail → swap main image.
3. For current demo data: `images` can be undefined (falls back to single `image`)
4. Add `images` array to 2-3 popular parts (brake pads, oil filter) with the same image repeated or placeholder variations — just to show the gallery works

**Verify:** Part with `images` array shows gallery. Part without `images` shows single image (no regression).

---

## C8. Show "Fits Also" Vehicle List on Detail Page

**Problem:** `part.fitsVehicleIds` exists in data but is never displayed on the detail page.

**Fix:**
1. In `app/part/[slug]/page.tsx`: add a collapsible section "מתאים גם ל:" after the specs table
2. Map `part.fitsVehicleIds` → vehicle names using `getVehicle()`
3. Show as: "Toyota Corolla 2018 1.6L, Toyota Corolla 2019 1.6L, Toyota Camry 2020 2.5L..."
4. Group by make/model: "Toyota Corolla 2018–2022, Toyota Camry 2018–2020"
5. Collapsible — closed by default, "הראה רכבים מתאימים (8)" as toggle

**Verify:** Detail page shows the list. Collapse/expand works.

---

## C9. Add Trust/Shipping Accordion on Detail Page

**Problem:** No return policy, warranty terms, or shipping info visible on the product page.

**Fix:**
1. In `app/part/[slug]/page.tsx`: add an accordion/collapsible section below the WhatsApp button:
   ```
   ✓ אחריות {warrantyMonths} חודשים מיצרן
   ✓ משלוח לכל הארץ תוך 1–3 ימי עסקים
   ✓ איסוף עצמי זמין במחסן בעוספיא
   ✓ החזרה תוך 14 יום לפי חוק הגנת הצרכן
   ```
2. Use the selected SKU's `warrantyMonths` for the warranty line
3. Static text is fine for the rest — no dynamic data needed

**Verify:** Section visible on detail page. Warranty matches selected SKU.

---

## C10. Disable Out-of-Stock CTA

**Problem:** When stock=0, the "הוסף להזמנה" button still works. Should be disabled.

**Fix:**
1. In `app/part/[slug]/page.tsx`: if selected SKU has `stock === 0`:
   - Disable the "הוסף להזמנה" button (grey out, cursor not-allowed)
   - Change text to "אזל מהמלאי"
   - Optionally show "הודיעו לי כשחוזר" text (no functionality needed, just text)
2. In `components/ProductCard.tsx`: if `inStock === false`:
   - Grey out the card slightly (opacity 0.7)
   - Replace CTA text with "אזל" 
   - Button still links to detail page (so user can see alternatives) but visually indicates unavailable

**Verify:** Create a part with stock=0 in data or find one. Confirm button is disabled. Card is greyed.

---

## AFTER ALL 10 FIXES:

1. Run `npm run build` — must pass zero errors
2. Commit: `feat: ecommerce critical fixes C1-C10 — taxonomy, tiers, fitment, delivery, trust signals`
3. git push to main
4. Report: which fixes were applied, any issues encountered, build status, commit hash
