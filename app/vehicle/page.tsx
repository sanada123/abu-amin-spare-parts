"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { tr } from "@/lib/i18n";
import { useLocale, setActiveVehicleId } from "@/lib/cart";

interface MakeOption { slug: string; name: string; yearMin: number | null; yearMax: number | null }
interface ModelOption { model: string; modelHe: string }
interface EngineOption { id: number; engine: string | null }

export default function VehiclePage() {
  const locale = useLocale();
  const router = useRouter();
  const [make, setMake] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [model, setModel] = useState("");
  const [vehicleId, setVehicleId] = useState<number | "">("");

  const [makes, setMakes] = useState<MakeOption[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [engines, setEngines] = useState<EngineOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch makes on mount
  useEffect(() => {
    fetch("/api/vehicle-selector")
      .then((r) => r.json())
      .then((d) => setMakes(d.makes ?? []))
      .catch(() => {});
  }, []);

  // Fetch years when make changes
  useEffect(() => {
    if (!make) { setYears([]); return; }
    setLoading(true);
    fetch(`/api/vehicle-selector?make=${encodeURIComponent(make)}`)
      .then((r) => r.json())
      .then((d) => setYears(d.years ?? []))
      .catch(() => setYears([]))
      .finally(() => setLoading(false));
  }, [make]);

  // Fetch models when year changes
  useEffect(() => {
    if (!make || !year) { setModels([]); return; }
    setLoading(true);
    fetch(`/api/vehicle-selector?make=${encodeURIComponent(make)}&year=${year}`)
      .then((r) => r.json())
      .then((d) => setModels(d.models ?? []))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, [make, year]);

  // Fetch engines when model changes
  useEffect(() => {
    if (!make || !year || !model) { setEngines([]); return; }
    setLoading(true);
    fetch(`/api/vehicle-selector?make=${encodeURIComponent(make)}&year=${year}&model=${encodeURIComponent(model)}`)
      .then((r) => r.json())
      .then((d) => {
        const engs = d.engines ?? [];
        setEngines(engs);
        // Auto-select if only one engine
        if (engs.length === 1) setVehicleId(engs[0].id);
      })
      .catch(() => setEngines([]))
      .finally(() => setLoading(false));
  }, [make, year, model]);

  const submit = () => {
    if (vehicleId) {
      setActiveVehicleId(vehicleId as number);
      router.push("/catalog");
    }
  };

  return (
    <main>
      <section className="hero" style={{ padding: 0, margin: 0, maxWidth: "100%" }}>
        <div className="hero-inner">
          <h1>{tr("cta_select_vehicle", locale)}</h1>
          <p>{tr("hero_sub", locale)}</p>
        </div>
        <div className="selector-wrap">
          <div className="selector-card">
            <div className="selector-title">
              <span className="pulse"></span>
              {tr("cta_select_vehicle", locale)}
            </div>
            <div className="selector-grid">
              <select
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setYear(""); setModel(""); setVehicleId("");
                }}
              >
                <option value="">{tr("step_make", locale)}</option>
                {makes.map((m) => (
                  <option key={m.slug} value={m.slug}>{m.name}</option>
                ))}
              </select>
              <select
                value={year}
                disabled={!make || years.length === 0}
                onChange={(e) => {
                  setYear(parseInt(e.target.value) || "");
                  setModel(""); setVehicleId("");
                }}
              >
                <option value="">{tr("step_year", locale)}</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={model}
                disabled={!year || models.length === 0}
                onChange={(e) => { setModel(e.target.value); setVehicleId(""); }}
              >
                <option value="">{tr("step_model", locale)}</option>
                {models.map((m) => (
                  <option key={m.model} value={m.model}>{m.modelHe}</option>
                ))}
              </select>
              <select
                value={vehicleId}
                disabled={!model || engines.length === 0}
                onChange={(e) => setVehicleId(parseInt(e.target.value) || "")}
              >
                <option value="">{tr("step_engine", locale)}</option>
                {engines.map((e) => (
                  <option key={e.id} value={e.id}>{e.engine ?? "סטנדרט"}</option>
                ))}
              </select>
            </div>
            <button className="selector-cta" disabled={!vehicleId || loading} onClick={submit}>
              {loading ? "טוען..." : `${tr("view_parts", locale)} →`}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
