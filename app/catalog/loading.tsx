export default function CatalogLoading() {
  return (
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 14px" }}>
      {/* Skeleton toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 80, height: 36, background: "var(--surface-2)", borderRadius: "var(--radius-sm)", animation: "pulse 1.5s ease infinite" }} />
        <div style={{ width: 60, height: 36, background: "var(--surface-2)", borderRadius: "var(--radius-sm)", animation: "pulse 1.5s ease infinite" }} />
      </div>
      {/* Skeleton grid */}
      <div className="parts-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              minHeight: 280,
            }}
          >
            <div style={{ aspectRatio: "1/1", background: "var(--surface-2)", animation: "pulse 1.5s ease infinite" }} />
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 14, width: "80%", background: "var(--surface-2)", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
              <div style={{ height: 14, width: "50%", background: "var(--surface-2)", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
              <div style={{ height: 20, width: "40%", background: "var(--surface-2)", borderRadius: 4, animation: "pulse 1.5s ease infinite", marginTop: "auto" }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </main>
  );
}
