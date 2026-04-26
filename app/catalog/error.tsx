"use client";

export default function CatalogError({
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
          <div className="emoji" style={{ fontSize: "2.5rem" }}>🔍</div>
          <h3>שגיאה בטעינת הקטלוג</h3>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
            לא הצלחנו לטעון את המוצרים. נסה שוב.
          </p>
          <button onClick={reset} className="cta" style={{ cursor: "pointer" }}>
            נסה שוב
          </button>
        </div>
      </section>
    </main>
  );
}
