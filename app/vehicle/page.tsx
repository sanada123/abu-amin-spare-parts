"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { allMakes, yearsForMake, modelsForYearMake, enginesForYearMakeModel } from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useLocale, setActiveVehicleId } from "@/lib/cart";

export default function VehiclePage() {
  const locale = useLocale();
  const router = useRouter();
  const [make, setMake] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [model, setModel] = useState("");
  const [vehicleId, setVehicleId] = useState<number | "">("");

  const makes = useMemo(() => allMakes(), []);
  const years = useMemo(() => (make ? yearsForMake(make) : []), [make]);
  const models = useMemo(() => (make && year ? modelsForYearMake(year as number, make) : []), [make, year]);
  const engines = useMemo(
    () => (make && year && model ? enginesForYearMakeModel(year as number, make, model) : []),
    [make, year, model]
  );

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
                {makes.map((m) => <option key={m.slug} value={m.slug}>{m.name[locale]}</option>)}
              </select>
              <select
                value={year}
                disabled={!make}
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
                disabled={!year}
                onChange={(e) => { setModel(e.target.value); setVehicleId(""); }}
              >
                <option value="">{tr("step_model", locale)}</option>
                {models.map((m) => <option key={m.slug} value={m.slug}>{m.name[locale]}</option>)}
              </select>
              <select
                value={vehicleId}
                disabled={!model}
                onChange={(e) => setVehicleId(parseInt(e.target.value) || "")}
              >
                <option value="">{tr("step_engine", locale)}</option>
                {engines.map((e) => <option key={e.id} value={e.id}>{e.engine}</option>)}
              </select>
            </div>
            <button className="selector-cta" disabled={!vehicleId} onClick={submit}>
              {tr("view_parts", locale)} →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
