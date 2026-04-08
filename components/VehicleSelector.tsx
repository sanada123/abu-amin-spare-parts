"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X, Search } from "lucide-react";
import {
  uniqueMakes,
  yearsForMakeSelector,
  modelsForMakeYear,
  enginesForMakeYearModel,
} from "@/lib/data";
import { setActiveVehicleId, useActiveVehicleId, useLocale } from "@/lib/cart";
import { tr } from "@/lib/i18n";

export default function VehicleSelector() {
  const locale = useLocale();
  const router = useRouter();
  const activeVehicleId = useActiveVehicleId();

  const [make, setMake] = useState<string>("");
  const [year, setYear] = useState<number | "">("");
  const [model, setModel] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<number | "">("");
  const [collapsed, setCollapsed] = useState(false);

  const allMakes = useMemo(() => uniqueMakes(), []);
  const years = useMemo(() => (make ? yearsForMakeSelector(make) : []), [make]);
  const models = useMemo(
    () => (make && year ? modelsForMakeYear(make, year as number) : []),
    [make, year]
  );
  const engines = useMemo(
    () =>
      make && year && model
        ? enginesForMakeYearModel(make, year as number, model)
        : [],
    [make, year, model]
  );

  const hasSelection = !!(make || year || model || vehicleId);

  const reset = () => {
    setMake("");
    setYear("");
    setModel("");
    setVehicleId("");
    setActiveVehicleId(null);
  };

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
  const summaryParts = [
    allMakes.find((m) => m.slug === make)?.name[locale],
    year,
    models.find((m) => m.slug === model)?.name[locale],
  ].filter(Boolean);
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
                onChange={(e) => {
                  setMake(e.target.value);
                  setYear("");
                  setModel("");
                  setVehicleId("");
                }}
                aria-label={tr("step_make", locale)}
                style={selectStyle(!!make)}
              >
                <option value="">{tr("step_make", locale)}</option>
                {allMakes.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name[locale]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                color="var(--text-dim)"
                style={chevronStyle}
                aria-hidden="true"
              />
            </div>

            {/* Year */}
            <div style={{ position: "relative" }}>
              <select
                value={year}
                disabled={!make}
                onChange={(e) => {
                  setYear(parseInt(e.target.value) || "");
                  setModel("");
                  setVehicleId("");
                }}
                aria-label={tr("step_year", locale)}
                style={selectStyle(!!year)}
              >
                <option value="">{tr("step_year", locale)}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                color="var(--text-dim)"
                style={chevronStyle}
                aria-hidden="true"
              />
            </div>

            {/* Model */}
            <div style={{ position: "relative" }}>
              <select
                value={model}
                disabled={!year}
                onChange={(e) => {
                  setModel(e.target.value);
                  setVehicleId("");
                }}
                aria-label={tr("step_model", locale)}
                style={selectStyle(!!model)}
              >
                <option value="">{tr("step_model", locale)}</option>
                {models.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name[locale]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                color="var(--text-dim)"
                style={chevronStyle}
                aria-hidden="true"
              />
            </div>

            {/* Engine */}
            <div style={{ position: "relative" }}>
              <select
                value={vehicleId}
                disabled={!model}
                onChange={(e) => setVehicleId(parseInt(e.target.value) || "")}
                aria-label={tr("step_engine", locale)}
                style={selectStyle(!!vehicleId)}
              >
                <option value="">{tr("step_engine", locale)}</option>
                {engines.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.engine}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                color="var(--text-dim)"
                style={chevronStyle}
                aria-hidden="true"
              />
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
