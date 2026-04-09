---
name: rtl-documents
description: >
  Generate submission-ready Hebrew and Arabic documents — contracts, proposals, invoices,
  reports, letters — at the same quality level as Claude's English document output.
  Use when the user asks to create, draft, or generate ANY formal document in Hebrew or Arabic.
  Triggers: "כתוב חוזה", "הכן הצעת מחיר", "צור חשבונית", "draft contract Hebrew",
  "proposal in Arabic", "מסמך רשמי", "letter in Hebrew".
license: MIT
metadata:
  version: "2.0.0"
  category: document-generation
  author: ASD-AI
  tags: [rtl, hebrew, arabic, pdf, docx, contract, proposal, invoice, bidi, typography]
  platforms: [claude-code, openclaw, codex-cli, cursor]
---

# rtl-documents v2

**הפק מסמכים עבריים מוכנים להגשה — באותה רמה שClaude מייצר באנגלית.**

---

## THE STANDARD YOU'RE AIMING FOR

כשClaude מייצר מסמך באנגלית הוא נראה כמו Notion / Linear / Stripe docs.
המסמך העברי שאתה מייצר צריך לעמוד באותה רמה:
- קריא בלי מאמץ
- לבן ומרווח, לא "עמוס"
- היררכיה ויזואלית ברורה (מה header, מה body, מה secondary)
- מספרים ושקלים לא "נשברים" בשורה
- מדפיס יפה על A4 בלי גלישות

---

## STEP 0 — COLLECT (ask only what's missing)

```
1. Document type?          (contract / proposal / invoice / letter / report)
2. Language?               (Hebrew / Arabic / bilingual He+Ar / bilingual He+En)
3. Parties / recipient?    (names, company, tax ID if needed)
4. Subject / scope?        (1-2 sentences)
5. Amounts / dates?        (if relevant)
6. Brand colors?           (hex, or use default navy+gold)
7. Output format?          (HTML / PDF / DOCX — default: HTML)
```

If the user gave enough context — skip asking, generate directly.

---

## STEP 1 — LANGUAGE: write like a native, not like Google Translate

### Hebrew register by document type

| Type | Register | Opening | Closing |
|------|----------|---------|---------|
| Contract | פורמלי-משפטי | "הסכם זה נחתם ביום..." | "הצדדים מאשרים בחתימתם..." |
| Proposal | עסקי-מקצועי | "לכבוד [שם], בהמשך לפנייתכם..." | "נשמח לעמוד לרשותכם בכל שאלה" |
| Invoice | נהיר וישיר | "חשבונית מס מספר..." | "תודה על שיתוף הפעולה" |
| Letter | אדיב-רשמי | "לכבוד [שם/גוף]," | "בכבוד רב, [שם ותפקיד]" |
| Report | תקציר נהיר | "סיכום מנהלים:" | "לפרטים נוספים ניתן לפנות ל..." |

### Rules — never break these

**מטבעות ומספרים:**
- תמיד: `5,000 ₪` (ספרה + רווח + ₪) — לא `₪5000`
- בחוזה: `סך של 5,000 ₪ (חמשת אלפים שקלים חדשים)`
- שנה: `2026` — לא `תשפ"ו` (אלא אם ספציפית נדרש)

**תאריכים:**
- עסקי: `5 באפריל 2026`
- משפטי: `ה-5 לאפריל 2026` או `5.4.2026`

**גוף ראשון:**
- חברה = רבים: `"אנו מתחייבים"` לא `"אני מתחייב"`
- כשהנמען לא ידוע: `"הלקוח/ה"` או פנה בזכר וציין `"(ו/ה)"`

**מונחים לא לתרגם מילולית:**
| ❌ תרגום מילולי | ✅ עברית נכונה |
|---|---|
| "אנחנו מוצאים..." | "להלן" / "מצ\"ב" |
| "בקשר ל..." | "בנוגע ל..." / "בהתייחס ל..." |
| "לעשות פגישה" | "לקיים פגישה" / "להיפגש" |
| "לסגור עסקה" | "להשלים את ההתקשרות" |
| "חותמים על" | "חותמים על" ✅ (this one's fine) |

---

## STEP 2 — STRUCTURE: use the right skeleton

### CONTRACT skeleton
```
Header (logo + company info)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
הסכם [TYPE] מספר [N]
תאריך: [DATE]

הצדדים:
  צד א׳: [name, ID, address] ("הספק")
  צד ב׳: [name, ID, address] ("הלקוח")

סעיף 1 — מבוא ומטרת ההסכם
סעיף 2 — היקף העבודה / השירותים
  2.1 ...
  2.2 ...
סעיף 3 — תמורה ותנאי תשלום
  [milestone table]
סעיף 4 — לוח זמנים
סעיף 5 — סודיות
סעיף 6 — קניין רוחני
סעיף 7 — אחריות והגבלתה
סעיף 8 — סיום ההסכם
סעיף 9 — יישוב סכסוכים
סעיף 10 — כללי (שינויים, שלמות, שפה שולטת)

[חתימות — 2 עמודות]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Footer: מסמך X מתוך Y | מספר | תאריך
```

### PROPOSAL skeleton
```
Header
━━━━━━━━━━━━━━━━━━━━━━━━━━━
הצעת מחיר מספר [N] | תאריך | בתוקף עד

לכבוד: [client]
נושא: [subject]

1. על [Company name] — 3-4 שורות legitimacy
2. הבנת הצורך — מה הלקוח צריך (1 פסקה)
3. הפתרון המוצע — bullets, לא paragraphs
4. לוח זמנים — milestone table
5. תמחור — טבלה עם פריטים + סה"כ + מע"מ
6. תנאי תשלום — %מקדמה, %milestone, %סיום
7. למה אנחנו — 3 bullets קצרים
8. תנאים כלליים — 3-4 נקודות

[חתימה + stamp]
```

### INVOICE skeleton
```
Header (logo + פרטי מגיש)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
חשבונית מס | מספר [N] | תאריך | לתשלום עד

מאת: [details]     לכבוד: [client details]

[Items table: תיאור | כמות | מחיר | סה"כ]

          סכום לפני מע"מ: XX,XXX ₪
          מע"מ (18%):      X,XXX ₪
          ────────────────────────
          סה"כ לתשלום:    XX,XXX ₪

פרטי בנק: [bank | branch | account | IBAN]

[הערות אם יש]
```

---

## STEP 3 — DESIGN: production CSS, copy-paste ready

**Copy this entire block into every document you generate.**
Every rule here solves a real Hebrew typography problem.

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>

/* ─── RESET & ROOT ─────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* Colors — override for brand */
  --c-primary:    #1B2B4B;   /* deep navy */
  --c-accent:     #B8962E;   /* warm gold */
  --c-text:       #1A1A1A;
  --c-muted:      #64748B;
  --c-border:     #E2E8F0;
  --c-surface:    #F8FAFC;
  --c-white:      #FFFFFF;

  /* Typography */
  --font:         'Heebo', 'Arial', 'Tahoma', sans-serif;
  --text-xs:      8.5pt;
  --text-sm:      9.5pt;
  --text-base:    10.5pt;
  --text-lg:      12pt;
  --text-xl:      15pt;
  --text-2xl:     20pt;

  /* Spacing */
  --space-1:      4px;
  --space-2:      8px;
  --space-3:      12px;
  --space-4:      16px;
  --space-6:      24px;
  --space-8:      32px;
  --space-10:     40px;
  --space-12:     48px;
}

/* ─── BASE ─────────────────────────────────────────────── */
body {
  font-family:    var(--font);
  font-size:      var(--text-base);
  line-height:    1.85;          /* Hebrew needs more than English */
  color:          var(--c-text);
  direction:      rtl;
  text-align:     right;
  background:     var(--c-white);
  padding:        40px 48px;
  max-width:      820px;
  margin:         0 auto;
  -webkit-font-smoothing: antialiased;
}

/* ─── DOCUMENT HEADER ──────────────────────────────────── */
.doc-header {
  display:        flex;
  justify-content: space-between;
  align-items:    flex-start;
  padding-bottom: var(--space-4);
  border-bottom:  3px solid var(--c-primary);
  margin-bottom:  var(--space-6);
}

.doc-brand .company-name {
  font-size:      var(--text-xl);
  font-weight:    700;
  color:          var(--c-primary);
  letter-spacing: -0.3px;
}

.doc-brand .company-sub {
  font-size:      var(--text-xs);
  color:          var(--c-muted);
  margin-top:     2px;
  line-height:    1.6;
}

.doc-ref {
  text-align:     left;            /* LTR side for numbers */
  direction:      ltr;
}

.doc-ref .doc-type-badge {
  display:        inline-block;
  background:     var(--c-primary);
  color:          var(--c-white);
  font-size:      var(--text-sm);
  font-weight:    600;
  padding:        4px 14px;
  border-radius:  3px;
  text-align:     center;
  margin-bottom:  var(--space-2);
}

.doc-ref .ref-line {
  font-size:      var(--text-xs);
  color:          var(--c-muted);
  line-height:    1.8;
}

/* ─── DOCUMENT TITLE ───────────────────────────────────── */
.doc-title {
  text-align:     center;
  margin:         var(--space-4) 0 var(--space-1);
}

.doc-title h1 {
  font-size:      var(--text-2xl);
  font-weight:    700;
  color:          var(--c-primary);
  letter-spacing: -0.5px;
}

.doc-title .doc-number {
  font-size:      var(--text-sm);
  color:          var(--c-muted);
  margin-top:     var(--space-1);
}

/* ─── PARTIES BOX ──────────────────────────────────────── */
.parties {
  display:        flex;
  gap:            var(--space-4);
  margin:         var(--space-6) 0;
}

.party-card {
  flex:           1;
  background:     var(--c-surface);
  border:         1px solid var(--c-border);
  border-top:     3px solid var(--c-primary);
  border-radius:  4px;
  padding:        var(--space-4);
}

.party-card .party-role {
  font-size:      var(--text-xs);
  font-weight:    700;
  color:          var(--c-muted);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom:  var(--space-2);
}

.party-card .party-name {
  font-size:      var(--text-lg);
  font-weight:    700;
  color:          var(--c-primary);
  margin-bottom:  var(--space-2);
}

.party-card .party-detail {
  font-size:      var(--text-sm);
  color:          var(--c-muted);
  line-height:    1.7;
}

/* ─── SECTIONS ─────────────────────────────────────────── */
.section {
  margin-bottom:  var(--space-6);
}

.section h2 {
  font-size:      var(--text-lg);
  font-weight:    700;
  color:          var(--c-primary);
  padding-bottom: var(--space-2);
  border-bottom:  2px solid var(--c-border);
  margin-bottom:  var(--space-3);
}

.section h3 {
  font-size:      var(--text-base);
  font-weight:    600;
  color:          var(--c-text);
  margin:         var(--space-3) 0 var(--space-2);
}

.section p {
  margin-bottom:  var(--space-3);
  color:          var(--c-text);
}

/* Sub-sections indented */
.sub { padding-right: var(--space-6); }

.clause-num {
  font-weight:    600;
  color:          var(--c-primary);
  margin-left:    var(--space-2);   /* RTL: number on right, space to its left */
}

/* ─── TABLES ────────────────────────────────────────────── */
table {
  width:          100%;
  border-collapse: collapse;
  direction:      rtl;
  margin:         var(--space-4) 0;
  font-size:      var(--text-sm);
}

thead th {
  background:     var(--c-primary);
  color:          var(--c-white);
  padding:        10px var(--space-4);
  text-align:     right;
  font-weight:    600;
  font-size:      var(--text-xs);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* Amount columns — always LTR */
thead th.num, tbody td.num {
  text-align:     left;
  direction:      ltr;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}

tbody td {
  padding:        9px var(--space-4);
  border-bottom:  1px solid var(--c-border);
  color:          var(--c-text);
}

tbody tr:nth-child(even) td { background: var(--c-surface); }
tbody tr:hover td            { background: #EFF6FF; }

tfoot td {
  padding:        10px var(--space-4);
  font-weight:    600;
  border-top:     2px solid var(--c-border);
}

tfoot tr.grand-total td {
  background:     var(--c-primary);
  color:          var(--c-white);
  font-size:      var(--text-base);
}

/* ─── HIGHLIGHT BOXES ───────────────────────────────────── */
.info-box {
  background:     var(--c-surface);
  border:         1px solid var(--c-border);
  border-right:   4px solid var(--c-accent);
  border-radius:  4px;
  padding:        var(--space-3) var(--space-4);
  margin:         var(--space-4) 0;
  font-size:      var(--text-sm);
  color:          var(--c-text);
}

.total-block {
  display:        flex;
  flex-direction: column;
  align-items:    flex-start;   /* RTL: align to the right side visually */
  gap:            var(--space-1);
  margin-top:     var(--space-4);
  border-top:     1px solid var(--c-border);
  padding-top:    var(--space-4);
}

.total-row {
  display:        flex;
  justify-content: flex-end;
  gap:            var(--space-8);
  width:          100%;
  padding:        var(--space-1) 0;
  font-size:      var(--text-sm);
}

.total-row.grand {
  background:     var(--c-primary);
  color:          var(--c-white);
  padding:        var(--space-3) var(--space-4);
  border-radius:  4px;
  font-size:      var(--text-lg);
  font-weight:    700;
  margin-top:     var(--space-2);
}

.total-label { color: var(--c-muted); }
.total-row.grand .total-label { color: rgba(255,255,255,0.8); }

.total-value {
  direction:      ltr;
  text-align:     left;
  min-width:      140px;
  font-variant-numeric: tabular-nums;
}

/* ─── SIGNATURE BLOCK ───────────────────────────────────── */
.signatures {
  display:        flex;
  justify-content: space-between;
  gap:            var(--space-10);
  margin-top:     var(--space-12);
  padding-top:    var(--space-6);
  border-top:     2px solid var(--c-border);
}

.sig-party { flex: 1; }

.sig-party .sig-role {
  font-size:      var(--text-xs);
  font-weight:    700;
  color:          var(--c-muted);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom:  var(--space-2);
}

.sig-party .sig-name {
  font-size:      var(--text-base);
  font-weight:    700;
  color:          var(--c-primary);
  margin-bottom:  var(--space-10);  /* space for actual signature */
}

.sig-line {
  border-top:     1px solid var(--c-text);
  margin-bottom:  var(--space-2);
}

.sig-fields {
  font-size:      var(--text-xs);
  color:          var(--c-muted);
  line-height:    2;
}

/* ─── FOOTER ────────────────────────────────────────────── */
.doc-footer {
  margin-top:     var(--space-8);
  padding-top:    var(--space-3);
  border-top:     1px solid var(--c-border);
  font-size:      var(--text-xs);
  color:          var(--c-muted);
  display:        flex;
  justify-content: space-between;
}

/* ─── BIDI UTILITIES ────────────────────────────────────── */

/* Wrap any LTR-only content (URLs, code, English phrases) */
.ltr {
  direction:      ltr;
  display:        inline-block;
  unicode-bidi:   isolate;
}

/* Currency/number in a Hebrew sentence */
.amount {
  direction:      ltr;
  unicode-bidi:   isolate;
  font-variant-numeric: tabular-nums;
  white-space:    nowrap;    /* prevents "₪ 5" wrapping mid-number */
}

/* ─── PRINT ─────────────────────────────────────────────── */
@media print {
  @page {
    size:         A4 portrait;
    margin:       20mm 22mm 18mm 18mm;
  }

  body {
    padding:      0;
    font-size:    10pt;
    max-width:    100%;
  }

  /* Prevent page breaks inside these */
  .parties, .signatures, table, .total-block,
  .section, .info-box { page-break-inside: avoid; }

  /* Force page break before signatures if near bottom */
  .signatures { page-break-before: auto; }

  /* Hide interactive elements */
  button, .no-print { display: none; }

  /* Ensure colors print */
  thead th, tfoot tr.grand-total td, .doc-ref .doc-type-badge {
    -webkit-print-color-adjust: exact;
    print-color-adjust:         exact;
  }
}

</style>
</head>
```

---

## STEP 4 — BIDI RULES (critical for Hebrew documents)

### The three problems and their solutions

**Problem 1: Currency in a sentence**
```html
<!-- ❌ WRONG — ₪ might render on wrong side -->
<p>סכום של ₪5,000 יועבר...</p>

<!-- ✅ CORRECT — isolate the number -->
<p>סכום של <span class="amount">5,000 ₪</span> יועבר...</p>
```

**Problem 2: Date ranges**
```html
<!-- ❌ WRONG — "מ" and "עד" might get confused -->
<p>מ-1.4.2026 עד 31.12.2026</p>

<!-- ✅ CORRECT -->
<p>מ-<span class="ltr">1.4.2026</span> עד <span class="ltr">31.12.2026</span></p>
```

**Problem 3: English names / URLs in Hebrew text**
```html
<!-- ✅ Always wrap -->
<p>ניתן לגשת ב-<span class="ltr">www.example.com</span> או לפנות ל-<span class="ltr">John Smith</span></p>
```

---

## STEP 5 — GENERATE THE DOCUMENT

Fill in the HTML template with real content. Rules:

1. **No lorem ipsum.** Every field gets real content or a clearly labeled `[TO FILL]` placeholder.
2. **One file.** All CSS inline in `<style>`. No external files.
3. **Complete.** Header + content + signatures + footer. Never a skeleton.
4. **Test the numbers.** Verify every amount: subtotal × VAT = grand total.
5. **Check language.** Re-read every sentence. If it sounds translated — rewrite it.

---

## REFERENCE: Legal terms (Hebrew)

| Concept | Correct Hebrew | Avoid |
|---------|---------------|-------|
| Hereby declares | מצהיר בזאת / מאשר בזאת | לא: "הרינו להודיעכם" (old style) |
| Subject to | בכפוף ל... | לא: "תחת" |
| Without prejudice | מבלי לגרוע מ... | לא: "ללא פגיעה ב..." |
| Force majeure | כוח עליון | ✅ |
| Material breach | הפרה יסודית | לא: "הפרה חמורה" (legally different) |
| Governing law | הדין החל / הדין השולט | ✅ |
| Business days | ימי עסקים | לא: "ימי עבודה" |
| At its sole discretion | לפי שיקול דעתו הבלעדי | ✅ |
| Notice period | תקופת הודעה מוקדמת | ✅ |
| Assignment | הסבה / העברת זכויות | ✅ |

---

## OUTPUT FORMAT

**Default: HTML** (single file, inline CSS, print-ready)

**PDF:** After generating HTML, run:
```bash
pip install weasyprint
python3 -c "from weasyprint import HTML; HTML(filename='doc.html').write_pdf('doc.pdf')"
```

**DOCX:** Use `python-docx` — see `references/docx-rtl.md` for RTL-safe patterns.

---

## QUALITY CHECKLIST

Before delivering, verify:
- [ ] `dir="rtl"` on `<html>` tag
- [ ] Currency amounts wrapped in `<span class="amount">`
- [ ] Table amount columns have class `num`
- [ ] Google Font loaded (Heebo)
- [ ] Signature block has enough vertical space
- [ ] Print CSS: `@page { size: A4; margin: 20mm 22mm 18mm 18mm; }`
- [ ] Numbers: subtotal + VAT = grand total (arithmetic correct)
- [ ] Language: no word-for-word translation artifacts
- [ ] Footer: document number + date + page indicator
