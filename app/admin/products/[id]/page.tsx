'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowRight, X } from 'lucide-react'

const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors w-full'

const TABS = [
  { id: 'info', label: 'פרטי מוצר' },
  { id: 'skus', label: 'SKUs' },
  { id: 'fitment', label: 'התאמה לרכב' },
  { id: 'images', label: 'תמונות' },
]

const TIERS = ['standard', 'original', 'premium']
const DELIVERY_OPTS = ['זמין במלאי', '1-2 ימים', '3-5 ימים', 'לפי הזמנה']

interface Category { id: string; name: string }
interface Brand { id: string; name: string }
interface Vehicle { id: string; make: string; model: string; year: number; engine: string }

interface SKU {
  id: string
  partNumber: string
  brand: { id: string; name: string } | null
  tier: string
  price: number
  cost: number
  stock: number
  minStock: number
  delivery: string
  warranty: string
}

interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string
  category: { id: string; name: string } | null
  isFeatured: boolean
  isActive: boolean
  skus: SKU[]
  vehicles: Vehicle[]
  images: { id: string; url: string; alt: string }[]
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Info form
  const [infoForm, setInfoForm] = useState({
    name: '', slug: '', description: '', categoryId: '', isFeatured: false, isActive: true,
  })

  // New SKU form
  const [showSkuForm, setShowSkuForm] = useState(false)
  const [skuForm, setSkuForm] = useState({
    partNumber: '', brandId: '', tier: 'standard', price: '', cost: '', stock: '', minStock: '1', delivery: 'זמין במלאי', warranty: '',
  })

  // Vehicle search
  const [vehicleSearch, setVehicleSearch] = useState('')

  function showBanner(type: 'success' | 'error', msg: string) {
    setBanner({ type, msg })
    if (type === 'success') setTimeout(() => setBanner(null), 3000)
  }

  const loadProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${id}`)
      const d = await res.json()
      setProduct(d)
      setInfoForm({
        name: d.name,
        slug: d.slug,
        description: d.description ?? '',
        categoryId: d.category?.id ?? '',
        isFeatured: d.isFeatured,
        isActive: d.isActive,
      })
    } catch {
      showBanner('error', 'שגיאה בטעינת מוצר')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProduct()
    fetch('/api/admin/categories').then((r) => r.json()).then((d) => setCategories(d.categories ?? [])).catch(() => {})
    fetch('/api/admin/brands').then((r) => r.json()).then((d) => setBrands(d.brands ?? [])).catch(() => {})
    fetch('/api/admin/vehicles').then((r) => r.json()).then((d) => setVehicles(d.vehicles ?? [])).catch(() => {})
  }, [loadProduct])

  async function saveInfo() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(infoForm),
      })
      if (!res.ok) throw new Error()
      showBanner('success', 'פרטי מוצר עודכנו')
      loadProduct()
    } catch {
      showBanner('error', 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  async function addSku() {
    try {
      const res = await fetch(`/api/admin/products/${id}/skus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...skuForm,
          price: parseFloat(skuForm.price),
          cost: parseFloat(skuForm.cost),
          stock: parseInt(skuForm.stock),
          minStock: parseInt(skuForm.minStock),
        }),
      })
      if (!res.ok) throw new Error()
      showBanner('success', 'SKU נוסף')
      setShowSkuForm(false)
      setSkuForm({ partNumber: '', brandId: '', tier: 'standard', price: '', cost: '', stock: '', minStock: '1', delivery: 'זמין במלאי', warranty: '' })
      loadProduct()
    } catch {
      showBanner('error', 'שגיאה בהוספת SKU')
    }
  }

  async function deleteSku(skuId: string) {
    if (!confirm('למחוק SKU זה?')) return
    try {
      await fetch(`/api/admin/products/${id}/skus/${skuId}`, { method: 'DELETE' })
      showBanner('success', 'SKU נמחק')
      loadProduct()
    } catch {
      showBanner('error', 'שגיאה במחיקה')
    }
  }

  async function addFitment(vehicleId: string) {
    try {
      await fetch(`/api/admin/products/${id}/fitment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId }),
      })
      showBanner('success', 'רכב נוסף')
      loadProduct()
    } catch {
      showBanner('error', 'שגיאה בהוספת רכב')
    }
  }

  async function removeFitment(vehicleId: string) {
    try {
      await fetch(`/api/admin/products/${id}/fitment/${vehicleId}`, { method: 'DELETE' })
      showBanner('success', 'רכב הוסר')
      loadProduct()
    } catch {
      showBanner('error', 'שגיאה בהסרה')
    }
  }

  async function deleteImage(imageId: string) {
    if (!confirm('למחוק תמונה זו?')) return
    try {
      await fetch(`/api/admin/products/${id}/images/${imageId}`, { method: 'DELETE' })
      showBanner('success', 'תמונה נמחקה')
      loadProduct()
    } catch {
      showBanner('error', 'שגיאה במחיקת תמונה')
    }
  }

  const fitmentIds = new Set(product?.vehicles.map((v) => v.id) ?? [])
  const filteredVehicles = vehicles.filter((v) => {
    if (fitmentIds.has(v.id)) return false
    if (!vehicleSearch) return true
    const q = vehicleSearch.toLowerCase()
    return `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(q)
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!product) {
    return <div className="text-red-400 text-sm">מוצר לא נמצא</div>
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/products')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">{product.name}</h1>
      </div>

      {banner && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${banner.type === 'success' ? 'bg-[#FFC424]/10 text-[#FFC424] border border-[#FFC424]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {banner.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#161618] border border-[#2a2a2e] rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === tab.id ? 'bg-[#FFC424] text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">שם מוצר</label>
              <input value={infoForm.name} onChange={(e) => setInfoForm((f) => ({ ...f, name: e.target.value }))} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Slug</label>
              <input value={infoForm.slug} onChange={(e) => setInfoForm((f) => ({ ...f, slug: e.target.value }))} className={INPUT} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">קטגוריה</label>
              <select value={infoForm.categoryId} onChange={(e) => setInfoForm((f) => ({ ...f, categoryId: e.target.value }))} className={INPUT}>
                <option value="">ללא קטגוריה</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">תיאור</label>
            <textarea value={infoForm.description} onChange={(e) => setInfoForm((f) => ({ ...f, description: e.target.value }))} rows={4} className={`${INPUT} resize-none`} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={infoForm.isFeatured} onChange={(e) => setInfoForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="accent-[#FFC424]" />
              <span className="text-sm text-gray-300">מוצר מומלץ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={infoForm.isActive} onChange={(e) => setInfoForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-[#FFC424]" />
              <span className="text-sm text-gray-300">פעיל</span>
            </label>
          </div>
          <button onClick={saveInfo} disabled={saving} className="bg-[#FFC424] text-black font-semibold px-6 py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors">
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      )}

      {/* Tab: SKUs */}
      {activeTab === 'skus' && (
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2e]">
            <h2 className="text-sm font-semibold text-white">מק״טים (SKUs)</h2>
            <button
              onClick={() => setShowSkuForm(!showSkuForm)}
              className="flex items-center gap-2 bg-[#FFC424] text-black text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#ffcd4a] transition-colors"
            >
              <Plus size={14} />
              הוסף SKU
            </button>
          </div>

          {showSkuForm && (
            <div className="p-4 border-b border-[#2a2a2e] bg-[#1a1a1d]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">מק״ט *</label>
                  <input value={skuForm.partNumber} onChange={(e) => setSkuForm((f) => ({ ...f, partNumber: e.target.value }))} className={INPUT} dir="ltr" placeholder="OEM-12345" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">מותג</label>
                  <select value={skuForm.brandId} onChange={(e) => setSkuForm((f) => ({ ...f, brandId: e.target.value }))} className={INPUT}>
                    <option value="">בחר מותג</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">דרגה</label>
                  <select value={skuForm.tier} onChange={(e) => setSkuForm((f) => ({ ...f, tier: e.target.value }))} className={INPUT}>
                    {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">מחיר ₪</label>
                  <input type="number" value={skuForm.price} onChange={(e) => setSkuForm((f) => ({ ...f, price: e.target.value }))} className={INPUT} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">עלות ₪</label>
                  <input type="number" value={skuForm.cost} onChange={(e) => setSkuForm((f) => ({ ...f, cost: e.target.value }))} className={INPUT} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">מלאי</label>
                  <input type="number" value={skuForm.stock} onChange={(e) => setSkuForm((f) => ({ ...f, stock: e.target.value }))} className={INPUT} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">מלאי מינ׳</label>
                  <input type="number" value={skuForm.minStock} onChange={(e) => setSkuForm((f) => ({ ...f, minStock: e.target.value }))} className={INPUT} placeholder="1" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">אספקה</label>
                  <select value={skuForm.delivery} onChange={(e) => setSkuForm((f) => ({ ...f, delivery: e.target.value }))} className={INPUT}>
                    {DELIVERY_OPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">אחריות</label>
                  <input value={skuForm.warranty} onChange={(e) => setSkuForm((f) => ({ ...f, warranty: e.target.value }))} className={INPUT} placeholder="12 חודשים" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addSku} disabled={!skuForm.partNumber} className="bg-[#FFC424] text-black font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors">
                  הוסף
                </button>
                <button onClick={() => setShowSkuForm(false)} className="bg-[#161618] border border-[#2a2a2e] text-white px-4 py-1.5 rounded-lg text-xs hover:bg-[#222224] transition-colors">
                  ביטול
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a2a2e] text-gray-400">
                  <th className="px-4 py-3 text-right">מק״ט</th>
                  <th className="px-4 py-3 text-right">מותג</th>
                  <th className="px-4 py-3 text-right">דרגה</th>
                  <th className="px-4 py-3 text-right">מחיר</th>
                  <th className="px-4 py-3 text-right">עלות</th>
                  <th className="px-4 py-3 text-right">מלאי</th>
                  <th className="px-4 py-3 text-right">מינ׳</th>
                  <th className="px-4 py-3 text-right">אספקה</th>
                  <th className="px-4 py-3 text-right">אחריות</th>
                  <th className="px-4 py-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {product.skus.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">אין מק״טים עדיין</td></tr>
                ) : (
                  product.skus.map((sku) => (
                    <tr key={sku.id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1d]">
                      <td className="px-4 py-3 text-white font-mono">{sku.partNumber}</td>
                      <td className="px-4 py-3 text-gray-400">{sku.brand?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{sku.tier}</td>
                      <td className="px-4 py-3 text-white">₪{sku.price}</td>
                      <td className="px-4 py-3 text-gray-400">₪{sku.cost}</td>
                      <td className="px-4 py-3">
                        <span className={sku.stock <= sku.minStock ? 'text-red-400' : 'text-white'}>{sku.stock}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{sku.minStock}</td>
                      <td className="px-4 py-3 text-gray-400">{sku.delivery}</td>
                      <td className="px-4 py-3 text-gray-400">{sku.warranty || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteSku(sku.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Fitment */}
      {activeTab === 'fitment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">רכבים מותאמים</h2>
            {product.vehicles.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">לא נוספו רכבים עדיין</p>
            ) : (
              <div className="space-y-2">
                {product.vehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between bg-[#1a1a1d] rounded-lg px-3 py-2">
                    <span className="text-sm text-white">{v.make} {v.model} {v.year} {v.engine}</span>
                    <button onClick={() => removeFitment(v.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">הוסף רכב</h2>
            <input
              type="text"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              placeholder="חפש רכב..."
              className={`${INPUT} mb-3`}
            />
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredVehicles.slice(0, 20).map((v) => (
                <button
                  key={v.id}
                  onClick={() => addFitment(v.id)}
                  className="w-full text-right text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1d] rounded-lg px-3 py-1.5 transition-colors flex items-center gap-2"
                >
                  <Plus size={12} className="text-[#FFC424] shrink-0" />
                  {v.make} {v.model} {v.year} {v.engine}
                </button>
              ))}
              {filteredVehicles.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">לא נמצאו רכבים</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Images */}
      {activeTab === 'images' && (
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-white">תמונות מוצר</h2>

          {/* Upload zone */}
          <div className="border-2 border-dashed border-[#2a2a2e] rounded-xl p-8 text-center hover:border-[#FFC424]/50 transition-colors cursor-pointer">
            <p className="text-gray-400 text-sm">גרור תמונות לכאן או לחץ להעלאה</p>
            <p className="text-gray-500 text-xs mt-1">PNG, JPG עד 5MB</p>
          </div>

          {/* Image grid */}
          {product.images.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {product.images.map((img) => (
                <div key={img.id} className="relative group aspect-square">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="absolute top-1 left-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">אין תמונות עדיין</p>
          )}
        </div>
      )}
    </div>
  )
}
