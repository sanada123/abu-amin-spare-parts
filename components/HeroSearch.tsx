"use client";
import { Search } from "lucide-react";

const QUICK_TERMS = ["רפידות בלם", "פילטר שמן", "בולם זעזועים", "פנס קדמי"];

export default function HeroSearch() {
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = (e.currentTarget.elements.namedItem("hero-q") as HTMLInputElement)?.value?.trim();
          if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
        }}
        style={{
          display: "flex",
          maxWidth: 560,
          margin: "0 auto",
          background: "var(--surface)",
          border: "2px solid var(--accent)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <input
          name="hero-q"
          type="search"
          placeholder="חפש חלק, מק״ט, או דגם רכב..."
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            padding: "14px 18px",
            fontSize: "1rem",
            color: "var(--text)",
            outline: "none",
            direction: "rtl",
          }}
        />
        <button
          type="submit"
          style={{
            background: "var(--accent)",
            border: "none",
            padding: "14px 24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 800,
            fontSize: "0.95rem",
            color: "var(--accent-fg)",
          }}
        >
          <Search size={18} aria-hidden="true" />
          חפש
        </button>
      </form>

      {/* Quick links */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        marginTop: 16,
        flexWrap: "wrap",
      }}>
        {QUICK_TERMS.map((term) => (
          <a
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            style={{
              fontSize: "0.8rem",
              color: "var(--text-dim)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {term}
          </a>
        ))}
      </div>
    </>
  );
}
