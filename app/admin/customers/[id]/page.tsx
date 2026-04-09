'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Eye } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  new: 'חדש', confirmed: 'אושר', preparing: 'בהכנה', ready: 'מוכן', delivered: 'נמסר', cancelled: 'בוטל',
}
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  preparing: 'bg-orange-500/20 text-orange-400',
  ready: 'bg-green-500/20 text-green-400',
  delivered: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

interface CustomerDetail {
  id: string
  name: string
  phone: string
  type: string
  garageName: string
  notes: string
  orders: {
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: string
    itemCount: number
    channel: string
  }[]
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', phone: '', type: 'private', garageName: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showBanner(type: 'success' | 'error', msg: string) {
    setBanner({ type, msg })
    if (type === 'success') setTimeout(() => setBanner(null), 3000)
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`)
      const d = await res.json()
      setCustomer(d)
      setForm({
        name: d.name,
        phone: d.phone,
        type: d.type,
        garageName: d.garageName ?? '',
        notes: d.notes ?? '',
      })
    } catch {
      showBanner('error', 'שגיאה בטעינת לקוח')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      showBanner('success', 'פרטי לקוח עודכנו')
      load()
    } catch {
      showBanner('error', 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!customer) return <div className="text-red-400 text-sm">לקוח לא נמצא</div>

  const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors w-full'

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/customers')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">{customer.name}</h1>
      </div>

      {banner && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${banner.type === 'success' ? 'bg-[#FFC424]/10 text-[#FFC424] border border-[#FFC424]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {banner.msg}
        </div>
      )}

      {/* Info form */}
      <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-white">פרטי לקוח</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">שם</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={INPUT} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">טלפון</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={INPUT} dir="ltr" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">סוג לקוח</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={INPUT}>
              <option value="private">פרטי</option>
              <option value="garage">מוסך</option>
            </select>
          </div>
          {form.type === 'garage' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">שם מוסך</label>
              <input value={form.garageName} onChange={(e) => setForm((f) => ({ ...f, garageName: e.target.value }))} className={INPUT} />
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">הערות</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className={`${INPUT} resize-none`} />
        </div>
        <button onClick={save} disabled={saving} className="bg-[#FFC424] text-black font-semibold px-6 py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors">
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>
      </div>

      {/* Order history */}
      <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl overflow-hidden">
        <h2 className="text-sm font-semibold text-white p-4 border-b border-[#2a2a2e]">היסטוריית הזמנות</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2e] text-gray-400 text-xs">
                <th className="px-4 py-3 text-right">מס׳ הזמנה</th>
                <th className="px-4 py-3 text-right">ערוץ</th>
                <th className="px-4 py-3 text-right">פריטים</th>
                <th className="px-4 py-3 text-right">סה״כ</th>
                <th className="px-4 py-3 text-right">סטטוס</th>
                <th className="px-4 py-3 text-right">תאריך</th>
                <th className="px-4 py-3 text-right">צפייה</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">אין הזמנות</td></tr>
              ) : (
                customer.orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1d] transition-colors">
                    <td className="px-4 py-3 text-white font-medium">#{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{order.channel}</td>
                    <td className="px-4 py-3 text-gray-400">{order.itemCount}</td>
                    <td className="px-4 py-3 text-white font-semibold">₪{order.total.toLocaleString('he-IL')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-500/20 text-gray-400'}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('he-IL')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => router.push(`/admin/orders/${order.id}`)} className="text-gray-400 hover:text-[#FFC424] transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
