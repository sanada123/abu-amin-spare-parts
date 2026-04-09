# Brand Identity Task — Abu Amin Spare Parts

## SKILL TO FOLLOW
Read and follow the skill in `.brand-craft-skill/SKILL.md` carefully, plus all references in `.brand-craft-skill/references/` (archetype-visual-map, brand-output, brand-sprint, color-strategy, logo-creation, typography-system).

Use this skill's methodology end-to-end.

## THE BUSINESS (confirmed by owner)
- **Name:** אבו אמין חלפים (Abu Amin Halafim / "Abu Amin Spare Parts")
- **Core business:** Auto spare parts — 90% of the business. Original (OEM) + equivalent (Bosch, Valeo, Denso) for all private car types. Oils, batteries included.
- **Secondary products (don't over-emphasize):** Hand tools, pressure washers, air compressors, chainsaws, vacuum cleaners, garden tools.
- **Location:** Main road Daliyat al-Karmel–Isfiya (כביש ראשי דלית עוספיא), opposite Amal Hashmal, Isfiya, Mt. Carmel, Israel
- **Phones:** 04-8599333 (landline) · 052-3158796 (mobile/WhatsApp)
- **Language:** Hebrew only (Arabic dropped, English dropped)
- **Customers:** Private drivers + mechanics/garages mix, Carmel/Haifa/North
- **Brand name displayed:** Always "אבו אמין חלפים" — never mention the owner's personal name "מאהר מלאק"

## PERSONALITY (3 words)
**אמין · מקצועי · מקומי** (trustworthy · professional · local)

## COMPETITORS
- parts-4u.co.il / carter.co.il (Haifa — big, American-DNA, not local)
- Other local Carmel village shops
- AliExpress / imported parts (cheap but slow)

## VIBE REFERENCES (brands that feel right)
- **Caterpillar (CAT)** — yellow/black, industrial, tools-that-work
- **Bosch** — reliable, German, professional but accessible
- **DeWalt** — yellow industrial, trades-loved
- General spirit: family regional store with real expertise

## MUST NOT FEEL LIKE
- Cheap / "Chinese bazaar" (no screaming red, no gradients galore)
- Amateur (no clipart, no WordArt)
- Corporate-cold (no Apple-sterile white, no blue SaaS)
- Religious / political (neutral)
- American (no Stars & Stripes, no RockAuto vibe)
- Retro / dated (no 80s mechanic nostalgia)

## ARCHETYPE (my recommendation — follow the skill to validate)
**Primary: Craftsman/Expert** (authority in one domain — spare parts)
**Secondary touch: Everyman** (accessible, local, "you're home here")

## TASK — DELIVERABLES

Follow the brand-craft skill's Brand Sprint methodology. Deliver everything to `brand/` folder in this repo:

### 1. Brand Strategy Document
- `brand/STRATEGY.md` — archetype rationale, personality, positioning statement, tone of voice, dos/don'ts, 1-paragraph brand story

### 2. Color System
- `brand/colors.md` — full palette with hex, HSL, rationale, 60-30-10 distribution, WCAG contrast notes, do/don't examples
- `brand/colors.json` — machine-readable tokens

### 3. Typography System
- `brand/typography.md` — headline font, body font, mono/numeric font, weights, sizes, line-heights, Hebrew-specific considerations
- Choose Hebrew-first fonts (Heebo, Rubik, Assistant, Ploni, Noto Sans Hebrew, etc.) — must be Google Fonts available

### 4. Logo System (the hard part — do it properly)
Create 3 distinct logo concepts, each as SVG files hand-coded. NO external API needed — draw them in SVG directly.

Concepts to explore (but you decide final direction per skill methodology):
- **Wordmark** with symbol (bracket/gear/hex-bolt/wrench)
- **Monogram** based on Hebrew letters (א.א / אבו אמין abbreviated)
- **Badge/Emblem** (classic mechanic shop shield/hexagon)

Deliverables per chosen concept:
- `brand/logo/logo-horizontal.svg` — header use, landscape
- `brand/logo/logo-stacked.svg` — square/vertical use
- `brand/logo/logo-mark.svg` — symbol only (favicon, app icon)
- `brand/logo/logo-mono-white.svg` — white on dark variant
- `brand/logo/logo-mono-black.svg` — black on light variant

**Logo requirements:**
- Hebrew typography is PRIMARY — "אבו אמין חלפים" in proper Hebrew font
- Scales down to 32×32 favicon readable
- Works in single color (black, white, yellow)
- Feels industrial-professional, NOT playful
- Reads as "auto parts" at first glance (a gear, wrench, bolt, or piston symbol — choose wisely per the skill)
- MUST NOT look like the previous attempt: generic square brackets + 8-tooth cartoon gear. Previous logo was rejected as "terrible". Do BETTER.

### 5. Brand Guidelines
- `brand/GUIDELINES.md` — 1-page usage rules: clear space, minimum sizes, background rules, misuse examples

### 6. Favicon Set
- `brand/favicon/favicon.svg` (master)
- `brand/favicon/favicon-16.png`, `favicon-32.png`, `favicon-180.png`, `favicon-512.png`
- Use ImageMagick or cairosvg to render PNGs from SVG. Python cairosvg is installed.

### 7. OG Image
- `brand/og-image.svg` → `brand/og-image.png` (1200×630)
- Should show logo + tagline + contact info, brand colors, professional

## TAGLINE (CRITICAL — confirmed by owner)
Use this exact tagline (confirmed by owner):
> **מס׳ 1 בכרמל**
(No other tagline. Do not use "חלקי החילוף של הכרמל" — rejected by owner.)

### 8. Tokens for Code
- `brand/tokens.css` — CSS custom properties ready to import into the Next.js site
- `brand/tokens.json` — same in JSON
- Update `tailwind.config.ts` with new brand colors under theme.extend.colors.brand.*

### 9. Apply to the Live Site
After brand is finalized:
- Replace existing logo in `components/Nav.tsx` / `components/Footer.tsx` / `app/layout.tsx` favicon references
- Replace public/logo.* files
- Update any hardcoded color values to use new tokens
- Update OG image reference in layout metadata
- Verify dark theme still works (don't regress previous polish)
- `npm run build` must pass
- Commit: `feat: brand v1 — full identity system + logo + tokens applied to site`
- git push

## IMPORTANT PROCESS NOTES
- **Follow the skill strictly.** Don't skip discovery/archetype — that's the foundation.
- **Don't just generate pretty SVGs.** Every visual choice must tie back to strategy.
- **Test the logo at small sizes.** Render to 32×32 PNG and inspect — if the mark is unreadable, iterate.
- **Hebrew typography matters.** Use a proper Hebrew font (Heebo Black / Rubik Black / Assistant Bold). Not Latin fonts with RTL hack.
- **Keep it industrial.** Yellow + black is the direction, but variations allowed if the skill leads you elsewhere. Don't go pastel, don't go rainbow.
- **Cairosvg is already installed** — use `python3 -c "import cairosvg; cairosvg.svg2png(...)"` for SVG→PNG rendering.
- **Report at the end:**
  - Files created (count + list)
  - Logo concept chosen + why
  - Build status
  - Commit hash
  - Anything that needs owner input
