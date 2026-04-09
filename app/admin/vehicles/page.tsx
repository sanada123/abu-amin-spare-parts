'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, ChevronDown, ChevronLeft } from 'lucide-react'

const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors w-full'

interface Vehicle {
  id: string
  make: string
  makeHe: string
  model: string
  modelHe: string
  year: number
  engine: string
  isActive: boolean
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMakes, setExpandedMakes] = useState<Set<string>>(new Set())
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [activeAddTab, setActiveAddTab] = useState<'single' | 'bulk'>('single')
  const [form, setForm] = useState({ make: '', makeHe: '', model: '', modelHe: '', year: '', engine: '' })
  const [bulkForm, setBulkForm] = useState({ make: '', makeHe: '', model: '', modelHe: '', yearFrom: '', yearTo: '', engine: '' })
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showBanner(type: 'success' | 'error', msg: string) {
    setBanner({ type, msg })
    if (type === 'success') setTimeout(() => setBanner(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/vehicles')
      const d = await res.json()
      setVehicles(d.vehicles ?? [])
    } catch {
      showBanner('error', 'שגיאה בטעינת רכבים')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function saveSingle() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: parseInt(form.year) }),
      })
      if (!res.ok) throw new Error()
      showBanner('success', 'רכב נוסף')
      setShowModal(false)
      setForm({ make: '', makeHe: '', model: '', modelHe: '', year: '', engine: '' })
      load()
    } catch {
      showBanner('error', 'שגיאה בהוספה')
    } finally {
      setSaving(false)
    }
  }

  async function saveBulk() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/vehicles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bulkForm,
          yearFrom: parseInt(bulkForm.yearFrom),
          yearTo: parseInt(bulkForm.yearTo),
        }),
      })
      if (!res.ok) throw new Error()
      const d = await res.json()
      showBanner('success', `${d.count ?? ''} רכבים נוספו`)
      setShowModal(false)
      setBulkForm({ make: '', makeHe: '', model: '', modelHe: '', yearFrom: '', yearTo: '', engine: '' })
      load()
    } catch {
      showBanner('error', 'שגיאה בהוספה מרובה')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      load()
    } catch {
      showBanner('error', 'שגיאה בעדכון')
    }
  }

  // Group by make → model
  const makeMap: Record<string, Record<string, Vehicle[]>> = {}
  vehicles.forEach((v) => {
    if (!makeMap[v.make]) makeMap[v.make] = {}
    if (!makeMap[v.make][v.model]) makeMap[v.make][v.model] = []
    makeMap[v.make][v.model].push(v)
  })
  const makes = Object.keys(makeMap).sort()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">רכבים</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#FFC424] text-black text-sm font-semibold px-3 py-2 rounded-lg hover:bg-[#ffcd4a] transition-colors"
        >
          <Plus size={16} />
          הוסף רכב
        </button>
      </div>

      {banner && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${banner.type === 'success' ? 'bg-[#FFC424]/10 text-[#FFC424] border border-[#FFC424]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {banner.msg}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      ) : makes.length === 0 ? (
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-12 text-center text-gray-500 text-sm">
          אין רכבים עדיין
        </div>
      ) : (
        <div className="space-y-2">
          {makes.map((make) => {
            const isMakeExpanded = expandedMakes.has(make)
            const models = Object.keys(makeMap[make]).sort()
            const totalCount = vehicles.filter((v) => v.make === make).length

            return (
              <div key={make} className="bg-[#161618] border border-[#2a2a2e] rounded-xl overflow-hidden">
                {/* Make header */}
                <button
                  onClick={() => {
                    const s = new Set(expandedMakes)
                    if (isMakeExpanded) s.delete(make)
                    else s.add(make)
                    setExpandedMakes(s)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1a1a1d] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{make}</span>
                    <span className="text-gray-500 text-xs">{totalCount} רכבים · {models.length} דגמים</span>
                  </div>
                  {isMakeExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronLeft size={16} className="text-gray-400" />}
                </button>

                {isMakeExpanded && (
                  <div className="border-t border-[#2a2a2e]">
                    {models.map((model) => {
                      const modelKey = `${make}::${model}`
                      const isModelExpanded = expandedModels.has(modelKey)
                      const modelVehicles = makeMap[make][model].sort((a, b) => a.year - b.year)

                      return (
                        <div key={model} className="border-b border-[#2a2a2e] last:border-b-0">
                          {/* Model header */}
                          <button
                            onClick={() => {
                              const s = new Set(expandedModels)
                              if (isModelExpanded) s.delete(modelKey)
                              else s.add(modelKey)
                              setExpandedModels(s)
                            }}
                            className="w-full flex items-center justify-between px-6 py-2.5 hover:bg-[#1a1a1d] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-gray-300 text-sm">{model}</span>
                              <span className="text-gray-500 text-xs">{modelVehicles.length} שנים</span>
                            </div>
                            {isModelExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronLeft size={14} className="text-gray-500" />}
                          </button>

                          {isModelExpanded && (
                            <div className="px-8 pb-2">
                              {modelVehicles.map((v) => (
                                <div key={v.id} className="flex items-center justify-between py-1.5 border-b border-[#2a2a2e] last:border-b-0">
                                  <span className="text-gray-400 text-xs">
                                    {v.year} · {v.engine}
                                  </span>
                                  <button
                                    onClick={() => toggleActive(v.id, v.isActive)}
                                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${v.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                                  >
                                    {v.isActive ? 'פעיל' : 'לא פעיל'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-[#2a2a2e] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">הוספת רכב</h2>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#1a1a1d] border border-[#2a2a2e] rounded-lg p-1">
              <button
                onClick={() => setActiveAddTab('single')}
                className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${activeAddTab === 'single' ? 'bg-[#FFC424] text-black font-semibold' : 'text-gray-400'}`}
              >
                רכב בודד
              </button>
              <button
                onClick={() => setActiveAddTab('bulk')}
                className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${activeAddTab === 'bulk' ? 'bg-[#FFC424] text-black font-semibold' : 'text-gray-400'}`}
              >
                הוספה מרובה
              </button>
            </div>

            {activeAddTab === 'single' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">יצרן (EN)</label>
                  <input value={form.make} onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))} className={INPUT} placeholder="Toyota" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">יצרן (עברית)</label>
                  <input value={form.makeHe} onChange={(e) => setForm((f) => ({ ...f, makeHe: e.target.value }))} className={INPUT} placeholder="טויוטה" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">דגם (EN)</label>
                  <input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} className={INPUT} placeholder="Corolla" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">דגם (עברית)</label>
                  <input value={form.modelHe} onChange={(e) => setForm((f) => ({ ...f, modelHe: e.target.value }))} className={INPUT} placeholder="קורולה" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">שנה</label>
                  <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className={INPUT} placeholder="2020" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">מנוע</label>
                  <input value={form.engine} onChange={(e) => setForm((f) => ({ ...f, engine: e.target.value }))} className={INPUT} placeholder="1.6L" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">יצרן (EN)</label>
                  <input value={bulkForm.make} onChange={(e) => setBulkForm((f) => ({ ...f, make: e.target.value }))} className={INPUT} placeholder="Toyota" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">יצרן (עברית)</label>
                  <input value={bulkForm.makeHe} onChange={(e) => setBulkForm((f) => ({ ...f, makeHe: e.target.value }))} className={INPUT} placeholder="טויוטה" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">דגם (EN)</label>
                  <input value={bulkForm.model} onChange={(e) => setBulkForm((f) => ({ ...f, model: e.target.value }))} className={INPUT} placeholder="Corolla" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">דגם (עברית)</label>
                  <input value={bulkForm.modelHe} onChange={(e) => setBulkForm((f) => ({ ...f, modelHe: e.target.value }))} className={INPUT} placeholder="קורולה" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">משנת</label>
                  <input type="number" value={bulkForm.yearFrom} onChange={(e) => setBulkForm((f) => ({ ...f, yearFrom: e.target.value }))} className={INPUT} placeholder="2015" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">עד שנת</label>
                  <input type="number" value={bulkForm.yearTo} onChange={(e) => setBulkForm((f) => ({ ...f, yearTo: e.target.value }))} className={INPUT} placeholder="2023" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">מנוע</label>
                  <input value={bulkForm.engine} onChange={(e) => setBulkForm((f) => ({ ...f, engine: e.target.value }))} className={INPUT} placeholder="1.6L" />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={activeAddTab === 'single' ? saveSingle : saveBulk}
                disabled={saving || (activeAddTab === 'single' ? !form.make || !form.model || !form.year : !bulkForm.make || !bulkForm.model || !bulkForm.yearFrom || !bulkForm.yearTo)}
                className="flex-1 bg-[#FFC424] text-black font-semibold py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors"
              >
                {saving ? 'שומר...' : 'הוסף'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-[#1a1a1d] border border-[#2a2a2e] text-white py-2 rounded-lg text-sm hover:bg-[#222224] transition-colors">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
