# rtl-documents — RTL Document Skill

**מסמכים מקצועיים בעברית ובערבית עם שפה נכונה + מבנה נכון + עיצוב נכון.**

Covers: contracts, proposals, invoices, letters, reports — PDF / DOCX / HTML output.

---

## Installation

### OpenClaw
```bash
cp -r rtl-documents ~/.openclaw/workspace/skills/
```

### Claude Code
```bash
cp -r rtl-documents ~/.claude/skills/
```

### Codex
```bash
cp -r rtl-documents ~/.codex/skills/
```

### Cursor / Windsurf
```bash
cp -r rtl-documents ~/.cursor/rules/
# or
cp -r rtl-documents ~/.windsurf/rules/
```

---

## Usage

Just describe your document:

- `"כתוב חוזה שירות עם לקוח"`
- `"הכן הצעת מחיר לפיתוח אתר"`
- `"צור חשבונית עבור [שם]"`
- `"draft NDA in Hebrew"`
- `"create proposal in Arabic"`

The skill handles language register, structure, and design automatically.

---

## Output Formats

| Format | How |
|--------|-----|
| HTML | Built-in — no dependencies |
| PDF | Requires `weasyprint` (`pip install weasyprint`) |
| DOCX | Requires `python-docx` (`pip install python-docx`) |

---

## Templates Included

- `templates/contract-he.html` — Full Hebrew contract with milestones + signatures
- `templates/invoice-he.html` — Hebrew tax invoice with bank details
- `references/legal-terms-he.md` — 50+ Hebrew legal terms dictionary

---

## Author

Built by ASD-AI — https://github.com/sanada123/openclaw-skills  
License: MIT
