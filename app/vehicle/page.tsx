"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { uniqueYears, makesForYear, modelsForYearMake, enginesForYearMakeModel } from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useLocale, setActiveVehicleId } from "@/lib/cart";

export default function VehiclePage() {
  const locale = useLocale();
  const router = useRouter();
  const [year, setYear] = useState<number | "">("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [vehicleId, setVehicleId] = useState<number | "">("");

  const years = useMemo(() => uniqueYears(), []);
  const makes = useMemo(() => (year ? makesForYear(year) : []), [year]);
  const models = useMemo(() => (year && make ? modelsForYearMake(year, make) : []), [year, make]);
  const engines = useMemo(
    () => (year && make && model ? enginesForYearMakeModel(year, make, model) : []),
    [year, make, model]
  );

  const submit = () => {
    if (vehicleId) {
      setActiveVehicleId(vehicleId as number);
      router.push("/catalog");
    }
  };

  return (
    <main>
      <section className="hero">
        <h1>{tr("cta_select_vehicle", locale)}</h1>
        <p>{tr("hero_sub", locale)}</p>
        <div className="selector-card">
          <div className="selector-grid">
            <select value={year} onChange={(e) => { setYear(parseInt(e.target.value) || ""); setMake(""); setModel(""); setVehicleId(""); }}>
              <option value="">{tr("step_year", locale)}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={make} disabled={!year} onChange={(e) => { setMake(e.target.value); setModel(""); setVehicleId(""); }}>
              <option value="">{tr("step_make", locale)}</option>
              {makes.map((m) => <option key={m.slug} value={m.slug}>{m.name[locale]}</option>)}
            </select>
            <select value={model} disabled={!make} onChange={(e) => { setModel(e.target.value); setVehicleId(""); }}>
              <option value="">{tr("step_model", locale)}</option>
              {models.map((m) => <option key={m.slug} value={m.slug}>{m.name[locale]}</option>)}
            </select>
            <select value={vehicleId} disabled={!model} onChange={(e) => setVehicleId(parseInt(e.target.value) || "")}>
              <option value="">{tr("step_engine", locale)}</option>
              {engines.map((e) => <option key={e.id} value={e.id}>{e.engine}</option>)}
            </select>
          </div>
          <button className="selector-cta" disabled={!vehicleId} onClick={submit}>
            {tr("view_parts", locale)} →
          </button>
        </div>
      </section>
    </main>
  );
}
