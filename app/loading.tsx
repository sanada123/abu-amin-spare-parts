export default function Loading() {
  return (
    <main>
      <section style={{ padding: "48px 20px", textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>טוען...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    </main>
  );
}
