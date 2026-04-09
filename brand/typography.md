# Typography System — אבו אמין חלפים

## Font Selection Rationale

### Why Heebo?

**Heebo** is the anchor of this brand's typography system. It is:

1. **Hebrew-first designed** — Created specifically for Hebrew script, not a Latin font with Hebrew glyphs bolted on. Every character weight was designed together.
2. **Industrial geometric character** — Heebo's skeleton is geometric (circles, straight lines), like Futura or Poppins but with Hebrew-native proportions. This matches the Sage/Expert archetype that values precision and clarity.
3. **Exceptional weight range** — From Regular (400) to Black (900), Heebo covers the full hierarchy with a single font family.
4. **Wide x-height, open apertures** — Reads clearly at small sizes. Essential for mobile labels and part numbers.
5. **Google Fonts free tier** — Reliable CDN, no licensing issues.
6. **Matches reference brands** — CAT, DeWalt, and Bosch all use geometric sans-serifs in their primary communications. Heebo Black achieves a similar weight and authority in Hebrew.

**Single-family system.** Using one family with weight variation creates coherence without complexity. For an industrial trade brand, this is correct — two families would add unnecessary sophistication.

---

## Type Scale

**Base size:** 16px  
**Scale ratio:** 1.333 (Perfect Fourth) — versatile, balanced, works well for both Hebrew display and body text.

| Level | Hebrew Name | Size | Weight | Line Height | Letter-spacing | Use |
|-------|------------|------|--------|-------------|----------------|-----|
| Display | תצוגה | 53px (3.32rem) | 900 (Black) | 1.0 | -0.03em | Hero headlines only |
| H1 | כותרת ראשית | 40px (2.49rem) | 900 | 1.1 | -0.02em | Page titles |
| H2 | כותרת משנה | 30px (1.87rem) | 700 (Bold) | 1.2 | -0.01em | Section headings |
| H3 | כותרת שלישית | 22px (1.40rem) | 700 | 1.25 | 0 | Card titles, subsections |
| H4 | כותרת רבעית | 18px (1.12rem) | 600 (SemiBold) | 1.3 | 0 | Labels, grouped headings |
| Body | גוף טקסט | 16px (1rem) | 400 (Regular) | 1.65 | 0 | All reading text |
| Small | טקסט קטן | 14px (0.875rem) | 400 | 1.5 | 0 | Captions, metadata |
| Micro | טקסט מיקרו | 12px (0.75rem) | 500 | 1.4 | +0.02em | Labels, badges |

---

## Hebrew-Specific Considerations

### RTL Layout
- All text direction: `dir="rtl"` on the root `<html>` element (already set)
- Logical properties: Use `margin-inline-start` / `margin-inline-end` (not left/right)
- Text alignment: `text-align: start` (not `left`) — respects reading direction
- Numbers and prices: Mix of RTL Hebrew + LTR numbers is handled by Unicode bidirectional algorithm automatically

### Weight at Display Sizes
Hebrew letters at large sizes (H1+) benefit from Black weight (900) because:
- Hebrew letterforms at large sizes can feel "light" compared to Latin equivalents
- The bold geometric strokes of Heebo Black create clear visual hierarchy
- At H3 and below, 700 (Bold) is sufficient

### Spacing Adjustments
- Do NOT set positive `letter-spacing` on Hebrew text — it interferes with letter connections and reads as broken
- Negative tracking (`-0.01em` to `-0.03em`) at display sizes is appropriate
- Line height: Hebrew text needs slightly more line height than Latin at the same size because of descenders in letters like ק, ף, ג

### Numerals
Heebo renders Western numerals (0–9) in Hebrew text naturally via Unicode bidi rules. No special treatment needed.

---

## Font Loading (Google Fonts)

```html
<!-- In <head> — preconnect for performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap">
```

**Weights loaded:** 400 (body), 700 (headings), 900 (display/logo) — three weights only.

**CSS declaration:**
```css
font-family: 'Heebo', 'Arial Hebrew', 'David', system-ui, sans-serif;
```

**Fallback chain:**
1. Heebo (Google Fonts — primary)
2. Arial Hebrew (macOS/iOS system Hebrew)
3. David (Windows system Hebrew)
4. system-ui (OS default sans)

---

## Type Hierarchy Examples

### Store Name (Logo Wordmark)
- Font: Heebo Black (900)
- Size: Scales with logo lockup
- Case: Mixed case (not all-caps — Hebrew doesn't have uppercase)
- Color: White on dark, black on yellow

### Tagline (מס׳ 1 בכרמל)
- Font: Heebo Bold (700)
- Size: ~60% of wordmark height
- Color: Torque Yellow `#F5C300` on dark, or black on yellow

### Page Headings
```css
h1 {
  font-family: 'Heebo', sans-serif;
  font-weight: 900;
  font-size: 2.49rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #F5F5F5; /* on dark */
}
```

### Body Text
```css
body {
  font-family: 'Heebo', 'Arial Hebrew', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.65;
  color: #F5F5F5;
}
```

---

## Anti-Patterns

| Don't | Why |
|-------|-----|
| Use a Latin font for Hebrew body text | Latin fonts lack proper Hebrew glyph quality |
| Set letter-spacing positive on Hebrew | Breaks letter connections, looks broken |
| Use weights below 400 (thin/light) | Hebrew thin strokes disappear at small sizes and feel too delicate for this brand |
| All-caps Hebrew | Hebrew has no case distinction — `text-transform: uppercase` has no effect |
| Mix Heebo with another Hebrew font | Creates personality contradiction within a single script |
| Body text below 14px | Heebo's Hebrew glyphs, especially ש ב מ, become unclear below 14px |
