'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronLeft } from 'lucide-react'

const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors w-full'
const GROUPS = ['auto', 'tools', 'garden']
const GROUP_LABELS: Record<string, string> = { auto: 'רכב', tools: 'כלים', garden: 'גינה' }

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  parentId: string | null
  group: string
  position: number
  isActive: boolean
  productCount: number
  children?: Category[]
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', icon: '', parentId: '', group: 'auto', position: '0' })
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showBanner(type: 'success' | 'error', msg: string) {
    setBanner({ type, msg })
    if (type === 'success') setTimeout(() => setBanner(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const d = await res.json()
      setCategories(d.categories ?? [])
    } catch {
      showBanner('error', 'שגיאה בטעינת קטגוריות')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function nameToSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0590-\u05FF-]/g, '')
  }

  function openAdd() {
    setEditCat(null)
    setForm({ name: '', slug: '', icon: '', parentId: '', group: 'auto', position: '0' })
    setShowModal(true)
  }

  function openEdit(cat: Category) {
    setEditCat(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      parentId: cat.parentId ?? '',
      group: cat.group,
      position: String(cat.position),
    })
    setShowModal(true)
  }

  async function save() {
    setSaving(true)
    try {
      const method = editCat ? 'PUT' : 'POST'
      const url = editCat ? `/api/admin/categories/${editCat.id}` : '/api/admin/categories'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, position: parseInt(form.position) }),
      })
      if (!res.ok) throw new Error()
      showBanner('success', editCat ? 'קטגוריה עודכנה' : 'קטגוריה נוספה')
      setShowModal(false)
      load()
    } catch {
      showBanner('error', 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק קטגוריה זו?')) return
    try {
      await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      showBanner('success', 'קטגוריה נמחקה')
      load()
    } catch {
      showBanner('error', 'שגיאה במחיקה')
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      load()
    } catch {
      showBanner('error', 'שגיאה בעדכון')
    }
  }

  // Build tree
  const parents = categories.filter((c) => !c.parentId)
  const childrenMap: Record<string, Category[]> = {}
  categories.forEach((c) => {
    if (c.parentId) {
      if (!childrenMap[c.parentId]) childrenMap[c.parentId] = []
      childrenMap[c.parentId].push(c)
    }
  })

  function CategoryRow({ cat, depth = 0 }: { cat: Category; depth?: number }) {
    const children = childrenMap[cat.id] ?? []
    const isExpanded = expanded.has(cat.id)

    return (
      <>
        <tr className="border-b border-[#2a2a2e] hover:bg-[#1a1a1d] transition-colors">
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingRight: depth * 20 }}>
              {children.length > 0 && (
                <button
                  onClick={() => {
                    const s = new Set(expanded)
                    if (isExpanded) s.delete(cat.id)
                    else s.add(cat.id)
                    setExpanded(s)
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
                </button>
              )}
              {children.length === 0 && <span className="w-3.5" />}
              <span className="text-lg leading-none">{cat.icon}</span>
              <span className="text-white text-sm font-medium">{cat.name}</span>
            </div>
          </td>
          <td className="px-4 py-3 text-gray-400 text-xs font-mono">{cat.slug}</td>
          <td className="px-4 py-3 text-gray-400 text-sm">{cat.productCount}</td>
          <td className="px-4 py-3 text-gray-400 text-sm">{cat.position}</td>
          <td className="px-4 py-3 text-xs text-gray-400">{GROUP_LABELS[cat.group] ?? cat.group}</td>
          <td className="px-4 py-3">
            <button
              onClick={() => toggleActive(cat.id, cat.isActive)}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${cat.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
            >
              {cat.isActive ? 'פעיל' : 'לא פעיל'}
            </button>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-[#FFC424] transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && children.map((child) => (
          <CategoryRow key={child.id} cat={child} depth={depth + 1} />
        ))}
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">קטגוריות</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#FFC424] text-black text-sm font-semibold px-3 py-2 rounded-lg hover:bg-[#ffcd4a] transition-colors"
        >
          <Plus size={16} />
          הוסף קטגוריה
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
                  <th className="px-4 py-3 text-right">שם</th>
                  <th className="px-4 py-3 text-right">Slug</th>
                  <th className="px-4 py-3 text-right">מוצרים</th>
                  <th className="px-4 py-3 text-right">מיקום</th>
                  <th className="px-4 py-3 text-right">קבוצה</th>
                  <th className="px-4 py-3 text-right">סטטוס</th>
                  <th className="px-4 py-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {parents.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">אין קטגוריות עדיין</td></tr>
                ) : (
                  parents.map((cat) => <CategoryRow key={cat.id} cat={cat} />)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-[#2a2a2e] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">{editCat ? 'עריכת קטגוריה' : 'הוספת קטגוריה'}</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">שם קטגוריה *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: nameToSlug(e.target.value) }))}
                  className={INPUT}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={INPUT} dir="ltr" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">אייקון (אמוג׳י)</label>
                <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className={INPUT} placeholder="🔧" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">מיקום</label>
                <input type="number" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">קטגוריית אב</label>
                <select value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))} className={INPUT}>
                  <option value="">ללא (ראשית)</option>
                  {categories.filter((c) => !c.parentId && c.id !== editCat?.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">קבוצה</label>
                <select value={form.group} onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))} className={INPUT}>
                  {GROUPS.map((g) => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
                </select>
              </div>
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
