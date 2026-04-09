# Brand Usage Guidelines — אבו אמין חלפים

Version 1.0 · 2026

---

## The Mark

**The Hex Bolt Badge** — A flat-top hexagon (bolt head, viewed from above) in Torque Yellow, with the Hebrew letter Aleph (א) in Industrial Black.

**Concept rationale:**  
The hexagon is the universal shape of automotive mechanics — every bolt, nut, and socket is hexagonal. It renders perfectly at any size, from 16px favicon to billboard. The Aleph (א) is the shared first letter of "Abu" and "Amin" — a double initial that also begins the word "אמין" (trustworthy), which is the brand's primary personality trait. The result: a mark that says "mechanical expertise" and "trustworthy" simultaneously, without spelling it out.

---

## Logo Variants

| File | Use When |
|------|----------|
| `logo-horizontal.svg` | Website headers, email signatures, horizontal banners |
| `logo-stacked.svg` | Square formats, app icons, social media profile images, stickers |
| `logo-mark.svg` | Favicon, avatar, watermark, embossing, very small contexts |
| `logo-mono-white.svg` | Dark or colored backgrounds requiring all-white treatment |
| `logo-mono-black.svg` | Light backgrounds, print, single-color reproduction |
| `favicon.svg` | Browser tab, PWA manifest |

---

## Clear Space

Minimum clear space around the logo on all sides: **equal to the height of the tagline text ("מס׳ 1 בכרמל")**.

```
          ↑ (tagline height)
    ← ⬜ LOGO ⬜ →
          ↓
```

Never reduce this clear space. Cluttered placement undermines authority.

---

## Minimum Sizes

| Context | Minimum Width |
|---------|--------------|
| Digital — full lockup (horizontal) | 200px |
| Digital — mark only | 24px |
| Print — full lockup | 40mm |
| Print — mark only | 8mm |
| Embroidery | 25mm |

Below minimum size: use the mark (`logo-mark.svg`) alone, not the full lockup.

---

## Color Rules

### Approved Background Combinations

| Background | Logo Variant | Notes |
|------------|-------------|-------|
| Industrial Black `#0A0A0A` | Default (color) | Primary use — web, digital |
| Dark grey `#1A1A1A`–`#2A2A2A` | Default (color) | Cards, sections |
| Torque Yellow `#F5C300` | Mono Black | CTA banners |
| White `#FFFFFF` | Mono Black | Print, light contexts |
| Photography | Mono White or Mono Black (per contrast) | Add blur/overlay if needed |

### Never Do

- ❌ Place the color logo on a busy photographic background without a buffer
- ❌ Use the yellow hex mark on a yellow or light-yellow background
- ❌ Apply effects (drop shadow, glow, gradient) to the logo
- ❌ Use the color logo on white (yellow on white fails WCAG contrast)
- ❌ Stretch, skew, or rotate the logo
- ❌ Recreate the logo with a different font
- ❌ Change any colors — not even "similar" yellows

---

## Logo Misuse Examples

```
❌ Wrong: Stretched horizontally
❌ Wrong: Rotated 45°  
❌ Wrong: Yellow on white background
❌ Wrong: Using a gear instead of the hex
❌ Wrong: Adding a glow effect
❌ Wrong: Changing font to anything other than Heebo
❌ Wrong: Using "חלקי החילוף של הכרמל" as tagline (rejected)
✅ Right: "מס׳ 1 בכרמל" — exact tagline, always
```

---

## Typography in Communications

**For all marketing materials, signs, and digital content:**

| Use | Font | Weight | Size guidance |
|-----|------|--------|---------------|
| Store signs / headlines | Heebo | 900 (Black) | As large as space allows |
| Category headings | Heebo | 700 (Bold) | 60–80% of headline size |
| Body copy / descriptions | Heebo | 400 (Regular) | Minimum 14pt/18px |
| Prices | Heebo | 900 | Same size as product name or larger |
| Legal / fine print | Heebo | 400 | Minimum 9pt |

**Load Heebo from Google Fonts:**
```
https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap
```

---

## Color in Practice

### Digital / Web
- Page backgrounds: `#0A0A0A` (primary), `#141414` (cards)
- Headings: `#F5F5F5`
- Body text: `#F5F5F5`
- Muted text: `#A0A0A0`
- Primary CTAs (buttons): `#F5C300` background, `#0A0A0A` text
- Links and highlights: `#F5C300`

### Print
- 4-color process (CMYK): Yellow = C0 M15 Y100 K0 · Black = C0 M0 Y0 K100
- Spot color option: PANTONE 116 C (closest match to Torque Yellow)
- Single color print: All black (#000000) — use mono-black logo variant

### Signage
- Primary: Yellow vinyl lettering on black background
- Reversed: Black vinyl lettering on yellow background
- Both are approved; use whichever suits the surface

---

## Voice in Text

| Context | Style |
|---------|-------|
| WhatsApp messages | Direct, helpful, no upselling: "מצוי, מחיר טוב, ערבות" |
| Store price tags | Number + brand name + compatibility: "₪85 · Bosch · מתאים ל-2015–2022" |
| Social media | Practical information, no hashtag spam |
| Signage | Bold, single claim: "חלפי רכב · כלים · גינה — עוספיה" |

**Never write:** "הכי זול!", "מבצע מטורף!", "⚡🔥💥" — these read as cheap.  
**Always write:** Specific, confident, factual.

---

## Favicon Usage

The favicon set is:
- `favicon.svg` — modern browsers (primary)
- `favicon-32.png` — standard browsers
- `favicon-16.png` — legacy fallback
- `favicon-180.png` — Apple touch icon
- `favicon-512.png` — PWA / Android home screen

The 16px and 32px favicons show the yellow hexagon shape with the aleph. At 16px, the letter becomes a dark center — this is expected and correct. The yellow hex shape remains brand-recognizable.
