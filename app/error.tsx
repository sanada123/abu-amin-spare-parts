"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <section>
        <div className="empty">
          <div className="emoji" style={{ fontSize: "2.5rem" }}>⚠️</div>
          <h3>משהו השתבש</h3>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", maxWidth: 400, margin: "0 auto" }}>
            אירעה שגיאה בטעינת הדף. נסה לרענן או לחזור לדף הבית.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            <button
              onClick={reset}
              className="cta"
              style={{ cursor: "pointer" }}
            >
              נסה שוב
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 20px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text)",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              לדף הבית
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
