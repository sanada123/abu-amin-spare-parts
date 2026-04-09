'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye } from 'lucide-react'

const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors'

interface Customer {
  id: string
  name: string
  phone: string
  type: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string | null
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ ...(search && { search }) })
      const res = await fetch(`/api/admin/customers?${params}`)
      const d = await res.json()
      setCustomers(d.customers ?? [])
    } catch {
      setError('שגיאה בטעינת לקוחות')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">לקוחות</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex gap-2">
        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש שם / טלפון..."
            className={`${INPUT} pr-8`}
          />
        </div>
      </div>

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
                  <th className="px-4 py-3 text-right">שם</th>
                  <th className="px-4 py-3 text-right">טלפון</th>
                  <th className="px-4 py-3 text-right">סוג</th>
                  <th className="px-4 py-3 text-right">הזמנות</th>
                  <th className="px-4 py-3 text-right">סה״כ קנייה</th>
                  <th className="px-4 py-3 text-right">הזמנה אחרונה</th>
                  <th className="px-4 py-3 text-right">צפייה</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">לא נמצאו לקוחות</td></tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1d] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs" dir="ltr">{c.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.type === 'garage' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {c.type === 'garage' ? 'מוסך' : 'פרטי'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{c.orderCount}</td>
                      <td className="px-4 py-3 text-white font-semibold">₪{c.totalSpent.toLocaleString('he-IL')}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('he-IL') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/admin/customers/${c.id}`)}
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
