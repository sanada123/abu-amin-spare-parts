# CLAUDE.md — Abu Amin Spare Parts

## Project
E-commerce site for אבו אמין חלפים — auto spare parts store in Isfiya, Mt. Carmel, Israel.
**Stack:** Next.js 15 App Router, Tailwind CSS, TypeScript, Hebrew RTL.
**Deploy:** Railway auto-deploy from main branch.

## Skills (project-level)
Load the matching skill BEFORE writing code for that area:

| Area | Skill |
|------|-------|
| Any UI/frontend | `.claude/skills/ui-ux-pro-max/` |
| React components | `.claude/skills/frontend-patterns/` |
| Next.js routing/SSR | `.claude/skills/nextjs-best-practices/` |
| RTL/Hebrew layout | `.claude/skills/rtl-documents/` |
| Code quality | `.claude/skills/coding-standards/` |
| Code review | `.claude/skills/code-reviewer/` |
| Auth/payment/security | `.claude/skills/security-review/` |
| Brand/logo/identity | `.claude/skills/brand-craft/` |
| UX audit/heuristics | `.claude/skills/ux-heuristics/` |

## Rules
- Hebrew only (no English, no Arabic in UI)
- RTL layout: `dir="rtl"` on html, test all components
- Brand name: "אבו אמין חלפים" — never expose owner name
- Tagline: "מס׳ 1 בכרמל"
- Phones: 04-8599333 (landline) · 052-3158796 (mobile/WhatsApp)
- Address: כביש ראשי דלית עוספיא, מול אמל חשמל, עוספיה
- No payment on site — order form → Telegram bot
- Dark theme: black (#0E0E10) + yellow (#FFC424)
- `npm run build` must pass before every commit
- Verify each change works before moving to the next
