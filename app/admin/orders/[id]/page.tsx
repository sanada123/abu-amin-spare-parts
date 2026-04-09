'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle } from 'lucide-react'

const STATUS_FLOW = ['new', 'confirmed', 'preparing', 'ready', 'delivered']

const STATUS_LABELS: Record<string, string> = {
  new: 'חדש', confirmed: 'אושר', preparing: 'בהכנה', ready: 'מוכן', delivered: 'נמסר', cancelled: 'בוטל',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  preparing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ready: 'bg-green-500/20 text-green-400 border-green-500/30',
  delivered: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

interface OrderDetail {
  id: string
  orderNumber: string
  createdAt: string
  channel: string
  status: string
  notes: string
  customer: {
    name: string
    phone: string
    type: string
    garageName?: string
    vehicleInfo?: string
  }
  items: {
    id: string
    productName: string
    partNumber: string
    brand: string
    qty: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  vat: number
  total: number
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

const VAT_RATE = 0.17

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [advancingStatus, setAdvancingStatus] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showBanner(type: 'success' | 'error', msg: string) {
    setBanner({ type, msg })
    if (type === 'success') setTimeout(() => setBanner(null), 3000)
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      const d = await res.json()
      setOrder(d)
      setNotes(d.notes ?? '')
    } catch {
      showBanner('error', 'שגיאה בטעינת הזמנה')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function advanceStatus() {
    if (!order) return
    const currentIdx = STATUS_FLOW.indexOf(order.status)
    if (currentIdx === -1 || currentIdx >= STATUS_FLOW.length - 1) return
    const nextStatus = STATUS_FLOW[currentIdx + 1]
    setAdvancingStatus(true)
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      showBanner('success', `סטטוס עודכן: ${STATUS_LABELS[nextStatus]}`)
      load()
    } catch {
      showBanner('error', 'שגיאה בעדכון סטטוס')
    } finally {
      setAdvancingStatus(false)
    }
  }

  async function cancelOrder() {
    if (!confirm('לבטל הזמנה זו?')) return
    setCancelling(true)
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      showBanner('success', 'הזמנה בוטלה')
      load()
    } catch {
      showBanner('error', 'שגיאה בביטול')
    } finally {
      setCancelling(false)
    }
  }

  async function saveNotes() {
    setSavingNotes(true)
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      showBanner('success', 'הערות נשמרו')
    } catch {
      showBanner('error', 'שגיאה בשמירת הערות')
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!order) return <div className="text-red-400 text-sm">הזמנה לא נמצאה</div>

  const currentIdx = STATUS_FLOW.indexOf(order.status)
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null

  const subtotal = order.items.reduce((sum, item) => sum + item.total, 0)
  const vatAmount = subtotal * VAT_RATE
  const total = subtotal + vatAmount

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/orders')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">הזמנה #{order.orderNumber}</h1>
          <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString('he-IL')} · {order.channel}</p>
        </div>
        <span className={`mr-auto text-xs px-3 py-1 rounded-full border ${STATUS_COLORS[order.status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {banner && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${banner.type === 'success' ? 'bg-[#FFC424]/10 text-[#FFC424] border border-[#FFC424]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {banner.msg}
        </div>
      )}

      {/* Status workflow */}
      <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">מעקב סטטוס</h2>
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
          {STATUS_FLOW.map((s, i) => {
            const isDone = currentIdx >= i
            const isCurrent = currentIdx === i
            return (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-colors ${isCurrent ? 'bg-[#FFC424] text-black font-semibold' : isDone ? 'bg-[#FFC424]/20 text-[#FFC424]' : 'bg-[#1a1a1d] text-gray-500'}`}>
                  {isDone && !isCurrent && <CheckCircle size={12} />}
                  {STATUS_LABELS[s]}
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div className={`h-0.5 w-4 ${isDone && currentIdx > i ? 'bg-[#FFC424]' : 'bg-[#2a2a2e]'}`} />
                )}
              </div>
            )
          })}
        </div>
        <div className="flex gap-2">
          {nextStatus && order.status !== 'cancelled' && (
            <button
              onClick={advanceStatus}
              disabled={advancingStatus}
              className="bg-[#FFC424] text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors"
            >
              {advancingStatus ? 'מעדכן...' : `קדם ל: ${STATUS_LABELS[nextStatus]}`}
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button
              onClick={cancelOrder}
              disabled={cancelling}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500/20 disabled:opacity-50 transition-colors"
            >
              {cancelling ? 'מבטל...' : 'בטל הזמנה'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer info */}
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-white">פרטי לקוח</h2>
          <div>
            <p className="text-gray-400 text-xs">שם</p>
            <p className="text-white text-sm">{order.customer.name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">טלפון</p>
            <p className="text-white text-sm dir-ltr">{order.customer.phone}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">סוג</p>
            <p className="text-white text-sm">{order.customer.type === 'garage' ? 'מוסך' : 'פרטי'}</p>
          </div>
          {order.customer.garageName && (
            <div>
              <p className="text-gray-400 text-xs">שם מוסך</p>
              <p className="text-white text-sm">{order.customer.garageName}</p>
            </div>
          )}
          {order.customer.vehicleInfo && (
            <div>
              <p className="text-gray-400 text-xs">רכב</p>
              <p className="text-white text-sm">{order.customer.vehicleInfo}</p>
            </div>
          )}
        </div>

        {/* Items + totals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl overflow-hidden">
            <h2 className="text-sm font-semibold text-white p-4 border-b border-[#2a2a2e]">פריטים</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#2a2a2e] text-gray-400">
                    <th className="px-4 py-2.5 text-right">מוצר</th>
                    <th className="px-4 py-2.5 text-right">מק״ט</th>
                    <th className="px-4 py-2.5 text-right">מותג</th>
                    <th className="px-4 py-2.5 text-right">כמות</th>
                    <th className="px-4 py-2.5 text-right">מחיר יחידה</th>
                    <th className="px-4 py-2.5 text-right">סה״כ</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1d]">
                      <td className="px-4 py-2.5 text-white">{item.productName}</td>
                      <td className="px-4 py-2.5 text-gray-400 font-mono">{item.partNumber}</td>
                      <td className="px-4 py-2.5 text-gray-400">{item.brand}</td>
                      <td className="px-4 py-2.5 text-gray-400">{item.qty}</td>
                      <td className="px-4 py-2.5 text-gray-400">₪{item.unitPrice.toLocaleString('he-IL')}</td>
                      <td className="px-4 py-2.5 text-white font-semibold">₪{item.total.toLocaleString('he-IL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals */}
            <div className="border-t border-[#2a2a2e] p-4 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-400">
                <span>סכום ביניים</span>
                <span>₪{subtotal.toLocaleString('he-IL')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>מע״מ 17%</span>
                <span>₪{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white border-t border-[#2a2a2e] pt-2 mt-2">
                <span>סה״כ לתשלום</span>
                <span>₪{total.toLocaleString('he-IL')}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">הערות</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="הערות להזמנה..."
              className="w-full bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors resize-none"
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="bg-[#FFC424] text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors"
            >
              {savingNotes ? 'שומר...' : 'שמור הערות'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
