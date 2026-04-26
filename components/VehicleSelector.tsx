"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X, Search, Loader2 } from "lucide-react";
import { setActiveVehicleId, useActiveVehicleId, useLocale } from "@/lib/cart";
import { tr } from "@/lib/i18n";

// ----- types matching /api/vehicle-selector responses -----
interface MakeOption {
  slug: string;
  name: string;
  yearMin: number | null;
  yearMax: number | null;
}
interface ModelOption {
  model: string;
  modelHe: string | null;
}
interface EngineOption {
  id: number;
  engine: string | null;
}

export default function VehicleSelector() {
  const locale = useLocale();
  const router = useRouter();
  const activeVehicleId = useActiveVehicleId();

  const [make, setMake] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [model, setModel] = useState("");
  const [vehicleId, setVehicleId] = useState<number | "">("");
  const [collapsed, setCollapsed] = useState(false);

  // Data from API
  const [makes, setMakes] = useState<MakeOption[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [engines, setEngines] = useState<EngineOption[]>([]);

  // Loading states
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingEngines, setLoadingEngines] = useState(false);

  // Fetch makes on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingMakes(true);
    fetch("/api/vehicle-selector")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.makes) setMakes(data.makes);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingMakes(false); });
    return () => { cancelled = true; };
  }, []);

  // Fetch years when make changes
  useEffect(() => {
    if (!make) { setYears([]); return; }
    let cancelled = false;
    setLoadingYears(true);
    fetch(`/api/vehicle-selector?make=${encodeURIComponent(make)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.years) setYears(data.years);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingYears(false); });
    return () => { cancelled = true; };
  }, [make]);

  // Fetch models when make+year change
  useEffect(() => {
    if (!make || !year) { setModels([]); return; }
    let cancelled = false;
    setLoadingModels(true);
    fetch(`/api/vehicle-selector?make=${encodeURIComponent(make)}&year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.models) setModels(data.models);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingModels(false); });
    return () => { cancelled = true; };
  }, [make, year]);

  // Fetch engines when make+year+model change
  useEffect(() => {
    if (!make || !year || !model) { setEngines([]); return; }
    let cancelled = false;
    setLoadingEngines(true);
    fetch(`/api/vehicle-selector?make=${encodeURIComponent(make)}&year=${year}&model=${encodeURIComponent(model)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.engines) setEngines(data.engines);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingEngines(false); });
    return () => { cancelled = true; };
  }, [make, year, model]);

  const hasSelection = !!(make || year || model || vehicleId);

  const reset = useCallback(() => {
    setMake("");
    setYear("");
    setModel("");
    setVehicleId("");
    setYears([]);
    setModels([]);
    setEngines([]);
    setActiveVehicleId(null);
  }, []);

  const handleFind = () => {
    if (vehicleId) {
      setActiveVehicleId(vehicleId as number);
      router.push("/catalog");
    } else if (make) {
      router.push(`/catalog?make=${make}`);
    } else {
      router.push("/catalog");
    }
  };

  // Mobile collapsed summary
  const makeName = makes.find((m) => m.slug === make)?.name;
  const modelName = models.find((m) => m.model === model)?.modelHe ?? models.find((m) => m.model === model)?.model;
  const summaryParts = [makeName, year || null, modelName].filter(Boolean);
  const summary = summaryParts.join(" · ");

  return (
    <div
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border-strong)",
        position: "sticky",
        top: "var(--nav-height, 60px)",
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 14px",
        }}
      >
        {/* Mobile: collapsible header */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0" }}
          className="vs-mobile-header"
        >
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 600,
              textAlign: "start",
            }}
            aria-expanded={!collapsed}
            aria-label={tr("cta_select_vehicle", locale)}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: activeVehicleId ? "var(--success)" : "var(--accent)",
                flexShrink: 0,
              }}
            />
            {summary && collapsed
              ? summary
              : tr("cta_select_vehicle", locale)}
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{
                transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                marginInlineStart: "auto",
              }}
            />
          </button>
          {hasSelection && (
            <button
              onClick={reset}
              aria-label="Reset vehicle selection"
              style={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <X size={13} color="var(--text-muted)" />
            </button>
          )}
        </div>

        {/* Selector grid — hidden when collapsed on mobile */}
        <div
          style={{
            overflow: "hidden",
            maxHeight: collapsed ? 0 : 200,
            transition: "max-height 0.25s ease",
            paddingBottom: collapsed ? 0 : 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
            className="vs-grid"
          >
            {/* Make */}
            <div style={{ position: "relative" }}>
              <select
                value={make}
                disabled={loadingMakes}
                onChange={(e) => {
                  setMake(e.target.value);
                  setYear("");
                  setModel("");
                  setVehicleId("");
                }}
                aria-label={tr("step_make", locale)}
                style={selectStyle(!!make)}
              >
                <option value="">
                  {loadingMakes ? "טוען..." : tr("step_make", locale)}
                </option>
                {makes.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name}
                  </option>
                ))}
              </select>
              {loadingMakes ? (
                <Loader2
                  size={12}
                  color="var(--text-dim)"
                  style={{ ...chevronStyle, animation: "spin 1s linear infinite" }}
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  size={12}
                  color="var(--text-dim)"
                  style={chevronStyle}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Year */}
            <div style={{ position: "relative" }}>
              <select
                value={year}
                disabled={!make || loadingYears}
                onChange={(e) => {
                  setYear(parseInt(e.target.value) || "");
                  setModel("");
                  setVehicleId("");
                }}
                aria-label={tr("step_year", locale)}
                style={selectStyle(!!year)}
              >
                <option value="">
                  {loadingYears ? "טוען..." : tr("step_year", locale)}
                </option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {loadingYears ? (
                <Loader2
                  size={12}
                  color="var(--text-dim)"
                  style={{ ...chevronStyle, animation: "spin 1s linear infinite" }}
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  size={12}
                  color="var(--text-dim)"
                  style={chevronStyle}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Model */}
            <div style={{ position: "relative" }}>
              <select
                value={model}
                disabled={!year || loadingModels}
                onChange={(e) => {
                  setModel(e.target.value);
                  setVehicleId("");
                }}
                aria-label={tr("step_model", locale)}
                style={selectStyle(!!model)}
              >
                <option value="">
                  {loadingModels ? "טוען..." : tr("step_model", locale)}
                </option>
                {models.map((m) => (
                  <option key={m.model} value={m.model}>
                    {m.modelHe ?? m.model}
                  </option>
                ))}
              </select>
              {loadingModels ? (
                <Loader2
                  size={12}
                  color="var(--text-dim)"
                  style={{ ...chevronStyle, animation: "spin 1s linear infinite" }}
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  size={12}
                  color="var(--text-dim)"
                  style={chevronStyle}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Engine */}
            <div style={{ position: "relative" }}>
              <select
                value={vehicleId}
                disabled={!model || loadingEngines}
                onChange={(e) => setVehicleId(parseInt(e.target.value) || "")}
                aria-label={tr("step_engine", locale)}
                style={selectStyle(!!vehicleId)}
              >
                <option value="">
                  {loadingEngines ? "טוען..." : tr("step_engine", locale)}
                </option>
                {engines.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.engine ?? "—"}
                  </option>
                ))}
              </select>
              {loadingEngines ? (
                <Loader2
                  size={12}
                  color="var(--text-dim)"
                  style={{ ...chevronStyle, animation: "spin 1s linear infinite" }}
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  size={12}
                  color="var(--text-dim)"
                  style={chevronStyle}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>

          {/* Find button */}
          <button
            onClick={handleFind}
            style={{
              marginTop: 8,
              width: "100%",
              height: 44,
              background: "var(--accent)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "var(--accent-fg)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "var(--accent-hover)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "var(--accent)")
            }
          >
            <Search size={14} aria-hidden="true" />
            {tr("view_parts", locale)}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }
        @media (min-width: 900px) {
          .vs-mobile-header button[aria-expanded] { display: none; }
          .vs-mobile-header { padding: 12px 0 0 !important; }
          .vs-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}

function selectStyle(active: boolean): React.CSSProperties {
  return {
    width: "100%",
    height: 42,
    background: active ? "var(--accent-dim)" : "var(--surface-2)",
    border: `1px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
    borderRadius: "var(--radius)",
    padding: "0 28px 0 10px",
    color: active ? "var(--accent)" : "var(--text-muted)",
    fontSize: 13,
    fontWeight: 600,
    outline: "none",
    appearance: "none" as const,
    cursor: "pointer",
  };
}

const chevronStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  insetInlineEnd: 10,
  transform: "translateY(-50%)",
  pointerEvents: "none",
};
