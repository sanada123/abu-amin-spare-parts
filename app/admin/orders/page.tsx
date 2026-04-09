'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye } from 'lucide-react'

const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors'

const STATUS_TABS = [
  { value: '', label: 'הכל' },
  { value: 'new', label: 'חדש' },
  { value: 'confirmed', label: 'אושר' },
  { value: 'preparing', label: 'בהכנה' },
  { value: 'ready', label: 'מוכן' },
  { value: 'delivered', label: 'נמסר' },
  { value: 'cancelled', label: 'בוטל' },
]

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  preparing: 'bg-orange-500/20 text-orange-400',
  ready: 'bg-green-500/20 text-green-400',
  delivered: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'חדש', confirmed: 'אושר', preparing: 'בהכנה', ready: 'מוכן', delivered: 'נמסר', cancelled: 'בוטל',
}

interface Order {
  id: string
  orderNumber: string
  customer: { name: string }
  channel: string
  itemCount: number
  total: number
  status: string
  createdAt: string
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [banner, setBanner] = useState<{ type: 'error'; msg: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      })
      const res = await fetch(`/api/admin/orders?${params}`)
      const d = await res.json()
      setOrders(d.orders ?? [])
    } catch {
      setBanner({ type: 'error', msg: 'שגיאה בטעינת הזמנות' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">הזמנות</h1>

      {banner && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 text-sm">
          {banner.msg}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${statusFilter === tab.value ? 'bg-[#FFC424] text-black font-semibold' : 'bg-[#161618] border border-[#2a2a2e] text-gray-400 hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לקוח / מס׳ הזמנה..."
            className={`${INPUT} pr-8`}
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={INPUT}
          title="מתאריך"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={INPUT}
          title="עד תאריך"
        />
      </div>

      {/* Table */}
      <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2e] text-gray-400 text-xs">
                  <th className="px-4 py-3 text-right">מס׳ הזמנה</th>
                  <th className="px-4 py-3 text-right">לקוח</th>
                  <th className="px-4 py-3 text-right">ערוץ</th>
                  <th className="px-4 py-3 text-right">פריטים</th>
                  <th className="px-4 py-3 text-right">סה״כ</th>
                  <th className="px-4 py-3 text-right">סטטוס</th>
                  <th className="px-4 py-3 text-right">תאריך</th>
                  <th className="px-4 py-3 text-right">צפייה</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">לא נמצאו הזמנות</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1d] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">#{order.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-300">{order.customer.name}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{order.channel}</td>
                      <td className="px-4 py-3 text-gray-400">{order.itemCount}</td>
                      <td className="px-4 py-3 text-white font-semibold">₪{order.total.toLocaleString('he-IL')}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-500/20 text-gray-400'}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('he-IL')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="text-gray-400 hover:text-[#FFC424] transition-colors"
                          aria-label="צפייה"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
