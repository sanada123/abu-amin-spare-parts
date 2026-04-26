import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <main>
      <section style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--accent)", marginBottom: 8 }}>
          404
        </div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
          העמוד לא נמצא
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
          יכול להיות שהכתובת השתנתה או שהעמוד הוסר. נסו לחפש את מה שאתם מחפשים.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--accent)",
              color: "var(--accent-fg)",
              fontWeight: 700,
              fontSize: "0.9rem",
              padding: "12px 24px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
            }}
          >
            לדף הבית
          </Link>
          <Link
            href="/catalog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface-2)",
              color: "var(--text)",
              fontWeight: 700,
              fontSize: "0.9rem",
              padding: "12px 24px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              border: "1px solid var(--border)",
            }}
          >
            <Search size={16} aria-hidden="true" />
            לקטלוג
          </Link>
        </div>
      </section>
    </main>
  );
}
