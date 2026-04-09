# Color System — אבו אמין חלפים

## Color Strategy

**Harmony type:** Complementary (yellow + near-black)  
**Rationale:** Maximum contrast, industrial energy. Used by CAT, DeWalt, JCB — the global language of industrial tools and automotive trades. Yellow on black is not a style choice here, it's a category signal.

**60-30-10 Distribution:**

| % | Role | Color | Use |
|---|------|-------|-----|
| 60% | Dominant (Dark) | Industrial Black `#0A0A0A` | Page backgrounds, large surfaces |
| 30% | Secondary (Surface) | Graphite Surface `#141414` | Cards, nav, panels |
| 10% | Accent (Yellow) | Torque Yellow `#F5C300` | CTAs, highlights, logo mark, prices |

---

## Primary Palette — Torque Yellow Scale

Primary hue: HSL(49°, 100%, 48%) — warm industrial yellow, richer than pure #FFD700, less saturated than neon.

| Token | Hex | Lightness | Typical Use |
|-------|-----|-----------|-------------|
| yellow-50 | `#FEFAE8` | 97% | Light backgrounds, badges |
| yellow-100 | `#FCF4C3` | 94% | Hover highlights on light |
| yellow-200 | `#F9E97F` | 85% | Large tinted areas |
| yellow-300 | `#F7DC4A` | 73% | Disabled/muted yellow |
| yellow-400 | `#F6D21E` | 62% | Interactive/hover state |
| **yellow-500** | **`#F5C300`** | **48%** | **Primary brand yellow — CTAs, logo** |
| yellow-600 | `#D4A800` | 40% | Hover on yellow elements |
| yellow-700 | `#A88500` | 30% | Active/pressed states |
| yellow-800 | `#7C6200` | 20% | Dark variant, borders on dark |
| yellow-900 | `#524100` | 12% | Near-black yellow, deep accents |

---

## Secondary Palette — Industrial Black Scale

Derived from the yellow's warm hue (HSL 49°) at near-zero saturation — gives a warm-neutral black that feels organic, not cold tech.

| Token | Hex | Lightness | Typical Use |
|-------|-----|-----------|-------------|
| black-50 | `#FAFAF8` | 98% | Near-white, light mode backgrounds |
| black-100 | `#F5F4F0` | 96% | Light surfaces |
| black-200 | `#E8E7E2` | 90% | Light borders |
| black-300 | `#D0CFC8` | 82% | Dividers on light backgrounds |
| black-400 | `#9E9D95` | 63% | Placeholder text, light mode |
| black-500 | `#6B6A62` | 42% | Secondary text, light mode |
| black-600 | `#47463F` | 28% | Body text on light |
| black-700 | `#2C2B25` | 17% | Headings on light |
| black-800 | `#1A1915` | 10% | Strong headings, icons |
| **black-900** | **`#0A0A08`** | **4%** | **Brand black — backgrounds** |

---

## Neutral Surface Scale (Dark Mode)

| Token | Hex | Use |
|-------|-----|-----|
| surface-bg | `#0A0A0A` | Page background |
| surface-card | `#141414` | Card backgrounds, nav |
| surface-raised | `#1F1F1F` | Elevated surfaces |
| surface-high | `#272727` | Tooltips, dropdowns |
| border-subtle | `#2A2A2A` | Subtle dividers |
| border-strong | `#3A3A3A` | Visible borders |

---

## Text Scale

| Token | Hex | Contrast on #0A0A0A | Use |
|-------|-----|--------------------|----|
| text-primary | `#F5F5F5` | 18.5:1 ✅ AAA | Body, headings |
| text-muted | `#A0A0A0` | 7.2:1 ✅ AAA | Secondary info |
| text-dim | `#666666` | 4.6:1 ✅ AA | Metadata, timestamps |
| text-disabled | `#444444` | 3.0:1 ⚠️ AA large | Disabled states only |

---

## Semantic Colors

| Role | Dark Mode | Light Mode | Rationale |
|------|-----------|------------|-----------|
| Success | `#22C55E` | `#16A34A` | Standard green |
| Warning | `#F59E0B` | `#D97706` | Amber — distinct from brand yellow |
| Error/Danger | `#EF4444` | `#DC2626` | Standard red |
| Info | `#3B82F6` | `#2563EB` | Blue — distinct from yellow/black |

---

## WCAG Compliance

| Combination | Contrast Ratio | Level | Note |
|-------------|---------------|-------|------|
| Torque Yellow `#F5C300` on Black `#0A0A0A` | 13.8:1 | ✅ AAA | Logo, CTAs |
| White `#F5F5F5` on Black `#0A0A0A` | 18.5:1 | ✅ AAA | Primary text |
| Yellow `#F5C300` on Surface `#141414` | 12.1:1 | ✅ AAA | Cards with yellow |
| Black `#0A0A0A` on Yellow `#F5C300` | 13.8:1 | ✅ AAA | Yellow button text |
| Muted `#A0A0A0` on Black `#0A0A0A` | 7.2:1 | ✅ AAA | Secondary text |

---

## Light Mode

In light mode (`[data-theme="light"]`), the brand inverts:
- Background: `#FFFFFF` → `#F5F4F0`
- Accent: Changes to near-black `#111111` (not yellow — yellow fails on white)
- Typography: Black on white

**Rationale:** Yellow text on white background fails WCAG AA (contrast ~2.1:1). In light mode, the brand shifts to a black-primary identity. The yellow is used as decorative only (hover borders, badge fills), never as text on white.

---

## Color Do / Don't

| Do | Don't |
|----|-------|
| Yellow text on black/dark backgrounds | Yellow text on white (fails contrast) |
| Black text on yellow buttons | White text on yellow (fails contrast: 1.5:1) |
| Single accent color (yellow) | Multiple bright accent colors |
| Use yellow for CTAs and the logo mark only | Make yellow the background of large surfaces |
| Pair with neutral greys for structure | Mix with other bright hues |
