'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  slug: string
  category: { id: string; name: string } | null
  skuCount: number
  minPrice: number | null
  isActive: boolean
  isFeatured: boolean
}

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
}

const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors'

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function ProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', categoryId: '', description: '', isFeatured: false })
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showBanner(type: 'success' | 'error', msg: string) {
    setBanner({ type, msg })
    if (type === 'success') setTimeout(() => setBanner(null), 3000)
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(search && { search }),
        ...(categoryFilter && { categoryId: categoryFilter }),
        ...(statusFilter && { isActive: statusFilter }),
      })
      const res = await fetch(`/api/admin/products?${params}`)
      const d = await res.json()
      setData(d)
    } catch {
      showBanner('error', 'שגיאה בטעינת מוצרים')
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter, statusFilter])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {})
  }, [])

  function openAdd() {
    setEditProduct(null)
    setForm({ name: '', slug: '', categoryId: '', description: '', isFeatured: false })
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditProduct(p)
    setForm({
      name: p.name,
      slug: p.slug,
      categoryId: p.category?.id ?? '',
      description: '',
      isFeatured: p.isFeatured,
    })
    setShowModal(true)
  }

  function nameToSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0590-\u05FF-]/g, '')
  }

  async function handleSave() {
    setSaving(true)
    try {
      const method = editProduct ? 'PUT' : 'POST'
      const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      showBanner('success', editProduct ? 'מוצר עודכן בהצלחה' : 'מוצר נוסף בהצלחה')
      setShowModal(false)
      loadProducts()
    } catch {
      showBanner('error', 'שגיאה בשמירת מוצר')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק מוצר זה?')) return
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      showBanner('success', 'מוצר נמחק')
      loadProducts()
    } catch {
      showBanner('error', 'שגיאה במחיקה')
    }
  }

  async function handleBulkDelete() {
    if (!confirm(`למחוק ${selected.size} מוצרים?`)) return
    try {
      await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      setSelected(new Set())
      showBanner('success', 'מוצרים נמחקו')
      loadProducts()
    } catch {
      showBanner('error', 'שגיאה במחיקה מרובה')
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      loadProducts()
    } catch {
      showBanner('error', 'שגיאה בעדכון סטטוס')
    }
  }

  const totalPages = data ? Math.ceil(data.total / (data.pageSize || 20)) : 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">מוצרים</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#FFC424] text-black text-sm font-semibold px-3 py-2 rounded-lg hover:bg-[#ffcd4a] transition-colors"
        >
          <Plus size={16} />
          הוסף מוצר
        </button>
      </div>

      {/* Banner */}
      {banner && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${banner.type === 'success' ? 'bg-[#FFC424]/10 text-[#FFC424] border border-[#FFC424]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {banner.msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="חיפוש מוצר..."
            className={`${INPUT} pr-8`}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className={INPUT}
        >
          <option value="">כל הקטגוריות</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className={INPUT}
        >
          <option value="">כל הסטטוסים</option>
          <option value="true">פעיל</option>
          <option value="false">לא פעיל</option>
        </select>
        {selected.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 text-sm px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={14} />
            מחק {selected.size} נבחרים
          </button>
        )}
      </div>

      {/* Table */}
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
                  <th className="px-4 py-3 text-right">
                    <input
                      type="checkbox"
                      checked={selected.size === (data?.products.length ?? 0) && selected.size > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected(new Set(data?.products.map((p) => p.id) ?? []))
                        } else {
                          setSelected(new Set())
                        }
                      }}
                      className="accent-[#FFC424]"
                    />
                  </th>
                  <th className="px-4 py-3 text-right">שם מוצר</th>
                  <th className="px-4 py-3 text-right">קטגוריה</th>
                  <th className="px-4 py-3 text-right">מק״טים</th>
                  <th className="px-4 py-3 text-right">מחיר מינ׳</th>
                  <th className="px-4 py-3 text-right">סטטוס</th>
                  <th className="px-4 py-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {(data?.products ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      לא נמצאו מוצרים
                    </td>
                  </tr>
                ) : (
                  data?.products.map((p) => (
                    <tr key={p.id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1d] transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={(e) => {
                            const s = new Set(selected)
                            if (e.target.checked) s.add(p.id)
                            else s.delete(p.id)
                            setSelected(s)
                          }}
                          className="accent-[#FFC424]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${p.id}`} className="text-white font-medium hover:text-[#FFC424] transition-colors">
                          {p.name}
                        </Link>
                        <p className="text-gray-500 text-xs">{p.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{p.category?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{p.skuCount}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {p.minPrice != null ? `₪${p.minPrice.toLocaleString('he-IL')}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(p.id, p.isActive)}
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                        >
                          {p.isActive ? 'פעיל' : 'לא פעיל'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-gray-400 hover:text-[#FFC424] transition-colors"
                            aria-label="עריכה"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            aria-label="מחיקה"
                          >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>עמוד {page} מתוך {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 bg-[#161618] border border-[#2a2a2e] rounded-lg hover:bg-[#1a1a1d] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 bg-[#161618] border border-[#2a2a2e] rounded-lg hover:bg-[#1a1a1d] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-[#2a2a2e] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">
              {editProduct ? 'עריכת מוצר' : 'הוספת מוצר'}
            </h2>

            <div>
              <label className="block text-xs text-gray-400 mb-1">שם מוצר *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: nameToSlug(e.target.value) }))}
                className={`${INPUT} w-full`}
                placeholder="שם המוצר"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className={`${INPUT} w-full`}
                placeholder="slug-automatici"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">קטגוריה</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className={`${INPUT} w-full`}
              >
                <option value="">בחר קטגוריה</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">תיאור</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className={`${INPUT} w-full resize-none`}
                placeholder="תיאור המוצר..."
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="accent-[#FFC424]"
              />
              <span className="text-sm text-gray-300">מוצר מומלץ</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex-1 bg-[#FFC424] text-black font-semibold py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors"
              >
                {saving ? 'שומר...' : 'שמור'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-[#1a1a1d] border border-[#2a2a2e] text-white py-2 rounded-lg text-sm hover:bg-[#222224] transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
