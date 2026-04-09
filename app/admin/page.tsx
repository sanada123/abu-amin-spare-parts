'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, DollarSign, Clock, AlertTriangle } from 'lucide-react'

interface DashboardData {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  lowStockCount: number
  recentOrders: {
    id: string
    orderNumber: string
    customer: { name: string }
    status: string
    total: number
    createdAt: string
  }[]
  lowStockProducts: {
    id: string
    name: string
    partNumber: string
    stock: number
  }[]
  revenueChart: { date: string; revenue: number }[]
}

const STATUS_LABELS: Record<string, string> = {
  new: 'חדש',
  confirmed: 'אושר',
  preparing: 'בהכנה',
  ready: 'מוכן',
  delivered: 'נמסר',
  cancelled: 'בוטל',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  preparing: 'bg-orange-500/20 text-orange-400',
  ready: 'bg-green-500/20 text-green-400',
  delivered: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white font-bold text-xl mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('שגיאה בטעינת נתונים')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
        {error}
      </div>
    )
  }

  if (!data) return null

  const maxRevenue = Math.max(...(data.revenueChart?.map((d) => d.revenue) ?? [1]), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">לוח בקרה</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="הזמנות היום"
          value={data.todayOrders}
          icon={ShoppingBag}
          color="bg-[#FFC424]/10 text-[#FFC424]"
        />
        <StatCard
          label="הכנסות היום"
          value={`₪${data.todayRevenue.toLocaleString('he-IL')}`}
          icon={DollarSign}
          color="bg-green-500/10 text-green-400"
        />
        <StatCard
          label="הזמנות ממתינות"
          value={data.pendingOrders}
          icon={Clock}
          color="bg-orange-500/10 text-orange-400"
        />
        <StatCard
          label="מלאי נמוך"
          value={data.lowStockCount}
          icon={AlertTriangle}
          color="bg-red-500/10 text-red-400"
        />
      </div>

      {/* Revenue chart */}
      {data.revenueChart && data.revenueChart.length > 0 && (
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">הכנסות — 7 ימים אחרונים</h2>
          <div className="flex items-end gap-2 h-32">
            {data.revenueChart.map((day, i) => {
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-gray-400 text-[10px]">
                    {day.revenue > 0 ? `₪${Math.round(day.revenue / 1000)}k` : ''}
                  </span>
                  <div
                    className="w-full bg-[#FFC424] rounded-t transition-all"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`₪${day.revenue.toLocaleString('he-IL')}`}
                  />
                  <span className="text-gray-500 text-[10px]">
                    {new Date(day.date).toLocaleDateString('he-IL', { weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">הזמנות אחרונות</h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">אין הזמנות עדיין</p>
          ) : (
            <div className="divide-y divide-[#2a2a2e]">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-white text-sm font-medium">#{order.orderNumber}</p>
                    <p className="text-gray-400 text-xs">{order.customer.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-500/20 text-gray-400'}`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <div className="text-left">
                      <p className="text-white text-sm font-semibold">
                        ₪{order.total.toLocaleString('he-IL')}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            התראות מלאי נמוך
          </h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">אין התראות מלאי</p>
          ) : (
            <div className="divide-y divide-[#2a2a2e]">
              {data.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-white text-sm font-medium">{product.name}</p>
                    <p className="text-gray-400 text-xs">{product.partNumber}</p>
                  </div>
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                    {product.stock} יח׳
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
