# Pivot v3 — Real Business Alignment

Owner confirmations 2026-04-09 08:29:
- Phones confirmed: 04-8599333 (landline) · 052-3158796 (mobile/WhatsApp)
- NO auto-electrical services (חשמלאות רכב) — we sell parts for it, not the service
- Hebrew only — DROP Arabic entirely (and English already dropped in v2)
- Brand name stays "אבו אמין חלפים" — do NOT expose owner name "מאהר מלאק"
- Keep tools/machinery/garden as product categories (they are real products)

## Tasks

### 1. Drop Arabic locale completely
- `lib/i18n.ts`: `Locale = "he"` only. Remove all `ar` strings, remove `Locale` union entirely OR keep as literal `"he"`.
- `components/Nav.tsx`: remove language toggle button entirely
- `app/layout.tsx`: `lang="he"` fixed, `dir="rtl"` stays
- Remove all `locale === "ar"` conditionals from every file
- Delete Arabic translations from i18n dictionary

### 2. Real contact info — hardcode these
In footer, contact page, WhatsApp links, tap-to-call buttons:
- **Phone landline:** `04-8599333` (tel:+97248599333)
- **Phone mobile/WhatsApp:** `052-3158796` (tel:+972523158796 / wa.me/972523158796)
- **Address:** `כביש ראשי דלית עוספיא, מול אמל חשמל, עוספיה`
- **Business name:** `אבו אמין חלפים` (never mention Maher Malak)
- **Hours placeholder (owner to confirm):** `א'–ה' 08:00–18:00 · ו' 08:00–13:00 · שבת סגור`

Update `.env.example` defaults to these real values.

### 3. Category expansion — product taxonomy
Current 5 Israeli-priority categories added in v2 stay. ADD new top-level product groups:

**Keep auto parts as primary group:**
- חלפי רכב (all existing categories: מנוע, מסננים, בלמים, מתלים, חשמל רכב [as parts], פנסים, פגושים, בולמים, מיזוג, מצברים, וכו')

**NEW product group: כלים ומכונות**
- מכונות שטיפה בלחץ
- קיטורים
- מדחסי אוויר
- מסורי עץ (חשמליים / בנזין)
- שואבי אבק ביתיים ותעשייתיים
- כלי עבודה ידניים וחשמליים

**NEW product group: גינה**
- חרמשים משולבים
- כלי גינון
- מכסחות דשא (if relevant)

**IMPORTANT:** חשמל רכב category stays as **parts category** (alternators, starters, battery cables, sensors, wiring) — NOT as a service. No booking form. No "book a repair" flow.

Update `lib/data.ts` with the new product groups + subcategories, add seed data (3-5 placeholder products per new subcategory so catalog doesn't look empty).

Homepage "primary 6 categories" (from AUDIT fix) should now reflect the **real mix**:
1. חלפי מנוע
2. בלמים
3. פנסים ואיתותים
4. מצברים
5. כלים ומכונות (new — leads to the new tools landing)
6. כל הקטגוריות

### 4. Navigation rethink — two-tier
Add a top-level category split on the homepage:
- **רכב** → takes user to auto parts flow (current vehicle selector)
- **כלים ובית** → takes user to tools/garden catalog (no vehicle needed)

Tools/garden products do NOT require a vehicle selector. The vehicle flow stays for auto parts only.

### 5. Footer rebuild — real data hardcoded
```
אבו אמין חלפים
📍 כביש ראשי דלית עוספיא, מול אמל חשמל, עוספיה
📞 04-8599333  |  📱 052-3158796
💬 WhatsApp: 052-3158796
🕒 א'–ה' 08:00–18:00 · ו' 08:00–13:00 · שבת סגור

[חלפי רכב] [כלים ומכונות] [גינה] [הזמנות]
[אחריות] [החזרות] [משלוחים] [אודות] [צור קשר]

© 2026 אבו אמין חלפים · ח"פ: _______
```

Tap-to-call must be real `<a href="tel:...">` with 44px tap targets.

### 6. About page rewrite
Remove any family/owner-specific content. Focus on the business:
- חנות חלפים ותיקה בלב הכרמל
- שירות לקוחות אישי
- מלאי רחב: חלקי חילוף לרכב, שמנים, מצברים, כלי עבודה, מכונות שטיפה, ציוד גינה
- עבודה מול הספקים הגדולים בישראל
- מחירים הוגנים, אמינות, שירות
- אזור שירות: כרמל, חיפה והצפון
- **NO mention of Maher Malak or "family"**

### 7. Hero copy — adjust for expanded scope
New hero:
> **אבו אמין חלפים**
> חלפי רכב · כלי עבודה · ציוד גינה
> הכל במקום אחד, בלב הכרמל.

Sub: "בחר את הרכב שלך, בחר חלפים, ושלח הזמנה — או דפדף בכלים ובמוצרים לבית."

### 8. WhatsApp button — update number
Hardcode `972523158796` as the WhatsApp number in env default + the floating button link.

### 9. Contact page (new `/contact`)
Simple page with:
- Address + Google Maps iframe embed (query: `אבו אמין חלפים עוספיה`)
- Both phones (tap-to-call)
- WhatsApp button
- Business hours
- "איך להגיע" directions (simple text)

### 10. Remove service booking — safety net
If any service booking form was added in v2 for חשמלאות רכב, REMOVE it. We do not offer services on this site. Parts only.

### 11. Order form — minor update
Order form should allow submission **without vehicle selected** for tools/garden orders. Vehicle field becomes optional. Add a conditional: if all cart items are from tools/garden categories → vehicle not required.

## Constraints
- Preserve all v2 work (dark theme, tokens, sticky cart, UX polish) — do NOT regress
- Build must pass `npm run build` with zero errors
- Commit: `feat: v3 — real contact info + tools/garden categories + hebrew-only`
- Push to main (Railway auto-deploy)
- Report: files changed, build status, commit hash, any env values still needing Sanad input (ח"פ, hours)
