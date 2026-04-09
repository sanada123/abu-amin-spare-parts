'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors w-full'

interface Brand {
  id: string
  name: string
  slug: string
  country: string
  logoUrl: string | null
  skuCount: number
  isActive: boolean
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editBrand, setEditBrand] = useState<Brand | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', country: '' })
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showBanner(type: 'success' | 'error', msg: string) {
    setBanner({ type, msg })
    if (type === 'success') setTimeout(() => setBanner(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/brands')
      const d = await res.json()
      setBrands(d.brands ?? [])
    } catch {
      showBanner('error', 'שגיאה בטעינת מותגים')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function nameToSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function openAdd() {
    setEditBrand(null)
    setForm({ name: '', slug: '', country: '' })
    setShowModal(true)
  }

  function openEdit(b: Brand) {
    setEditBrand(b)
    setForm({ name: b.name, slug: b.slug, country: b.country })
    setShowModal(true)
  }

  async function save() {
    setSaving(true)
    try {
      const method = editBrand ? 'PUT' : 'POST'
      const url = editBrand ? `/api/admin/brands/${editBrand.id}` : '/api/admin/brands'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      showBanner('success', editBrand ? 'מותג עודכן' : 'מותג נוסף')
      setShowModal(false)
      load()
    } catch {
      showBanner('error', 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק מותג זה?')) return
    try {
      await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' })
      showBanner('success', 'מותג נמחק')
      load()
    } catch {
      showBanner('error', 'שגיאה במחיקה')
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      load()
    } catch {
      showBanner('error', 'שגיאה בעדכון')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">מותגים</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#FFC424] text-black text-sm font-semibold px-3 py-2 rounded-lg hover:bg-[#ffcd4a] transition-colors"
        >
          <Plus size={16} />
          הוסף מותג
        </button>
      </div>

      {banner && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${banner.type === 'success' ? 'bg-[#FFC424]/10 text-[#FFC424] border border-[#FFC424]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {banner.msg}
        </div>
      )}

      <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2e] text-gray-400 text-xs">
                  <th className="px-4 py-3 text-right">לוגו / מדינה</th>
                  <th className="px-4 py-3 text-right">שם מותג</th>
                  <th className="px-4 py-3 text-right">Slug</th>
                  <th className="px-4 py-3 text-right">מק״טים</th>
                  <th className="px-4 py-3 text-right">סטטוס</th>
                  <th className="px-4 py-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">אין מותגים עדיין</td></tr>
                ) : (
                  brands.map((b) => (
                    <tr key={b.id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1d] transition-colors">
                      <td className="px-4 py-3">
                        {b.logoUrl ? (
                          <img src={b.logoUrl} alt={b.name} className="h-7 w-auto object-contain" />
                        ) : (
                          <span className="text-xl">{b.country}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{b.name}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{b.slug}</td>
                      <td className="px-4 py-3 text-gray-400">{b.skuCount}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(b.id, b.isActive)}
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${b.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                        >
                          {b.isActive ? 'פעיל' : 'לא פעיל'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(b)} className="text-gray-400 hover:text-[#FFC424] transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-[#2a2a2e] rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">{editBrand ? 'עריכת מותג' : 'הוספת מותג'}</h2>

            <div>
              <label className="block text-xs text-gray-400 mb-1">שם מותג *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: nameToSlug(e.target.value) }))}
                className={INPUT}
                placeholder="Toyota"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={INPUT} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">מדינה (דגל אמוג׳י)</label>
              <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className={INPUT} placeholder="🇯🇵" />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={save} disabled={saving || !form.name} className="flex-1 bg-[#FFC424] text-black font-semibold py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors">
                {saving ? 'שומר...' : 'שמור'}
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
