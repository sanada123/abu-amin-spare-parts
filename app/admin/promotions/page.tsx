'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'

const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors w-full'

const TYPE_LABELS: Record<string, string> = {
  percentage: 'אחוז הנחה',
  fixed: 'הנחה קבועה',
  buyXgetY: 'קנה X קבל Y',
  freeShipping: 'משלוח חינם',
}

const SCOPE_LABELS: Record<string, string> = {
  all: 'כל המוצרים',
  categories: 'קטגוריות',
  brands: 'מותגים',
  products: 'מוצרים',
}

interface Promotion {
  id: string
  name: string
  type: string
  value: number
  code: string | null
  startDate: string
  endDate: string
  usageCount: number
  maxUses: number | null
  isActive: boolean
  status: 'active' | 'scheduled' | 'expired'
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

const STATUS_FILTER_TABS = [
  { value: '', label: 'הכל' },
  { value: 'active', label: 'פעיל' },
  { value: 'scheduled', label: 'מתוזמן' },
  { value: 'expired', label: 'פג תוקף' },
]

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  expired: 'bg-gray-500/20 text-gray-400',
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editPromo, setEditPromo] = useState<Promotion | null>(null)
  const [wizardStep, setWizardStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [step1, setStep1] = useState({
    name: '', type: 'percentage', value: '', buyX: '2', getY: '1',
  })
  const [step2, setStep2] = useState({
    scope: 'all', customerTypes: 'all', startDate: '', endDate: '', maxUses: '', code: '',
  })

  function showBanner(type: 'success' | 'error', msg: string) {
    setBanner({ type, msg })
    if (type === 'success') setTimeout(() => setBanner(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ ...(statusFilter && { status: statusFilter }) })
      const res = await fetch(`/api/admin/promotions?${params}`)
      const d = await res.json()
      setPromotions(d.promotions ?? [])
    } catch {
      showBanner('error', 'שגיאה בטעינת מבצעים')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEditPromo(null)
    setWizardStep(1)
    setStep1({ name: '', type: 'percentage', value: '', buyX: '2', getY: '1' })
    setStep2({ scope: 'all', customerTypes: 'all', startDate: '', endDate: '', maxUses: '', code: '' })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const method = editPromo ? 'PUT' : 'POST'
      const url = editPromo ? `/api/admin/promotions/${editPromo.id}` : '/api/admin/promotions'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: step1.name,
          type: step1.type,
          value: parseFloat(step1.value),
          buyX: parseInt(step1.buyX),
          getY: parseInt(step1.getY),
          scope: step2.scope,
          customerTypes: step2.customerTypes,
          startDate: step2.startDate,
          endDate: step2.endDate,
          maxUses: step2.maxUses ? parseInt(step2.maxUses) : null,
          code: step2.code || null,
        }),
      })
      if (!res.ok) throw new Error()
      showBanner('success', editPromo ? 'מבצע עודכן' : 'מבצע נוצר')
      setShowModal(false)
      load()
    } catch {
      showBanner('error', 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק מבצע זה?')) return
    try {
      await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' })
      showBanner('success', 'מבצע נמחק')
      load()
    } catch {
      showBanner('error', 'שגיאה במחיקה')
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      load()
    } catch {
      showBanner('error', 'שגיאה בעדכון')
    }
  }

  const filtered = statusFilter ? promotions.filter((p) => p.status === statusFilter) : promotions

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">מבצעים</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#FFC424] text-black text-sm font-semibold px-3 py-2 rounded-lg hover:bg-[#ffcd4a] transition-colors"
        >
          <Plus size={16} />
          צור מבצע
        </button>
      </div>

      {banner && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${banner.type === 'success' ? 'bg-[#FFC424]/10 text-[#FFC424] border border-[#FFC424]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {banner.msg}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-1">
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${statusFilter === tab.value ? 'bg-[#FFC424] text-black font-semibold' : 'bg-[#161618] border border-[#2a2a2e] text-gray-400 hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2e] text-gray-400 text-xs">
                  <th className="px-4 py-3 text-right">שם מבצע</th>
                  <th className="px-4 py-3 text-right">סוג</th>
                  <th className="px-4 py-3 text-right">ערך</th>
                  <th className="px-4 py-3 text-right">קוד</th>
                  <th className="px-4 py-3 text-right">תאריכים</th>
                  <th className="px-4 py-3 text-right">שימוש</th>
                  <th className="px-4 py-3 text-right">סטטוס</th>
                  <th className="px-4 py-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">אין מבצעים</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1d] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{TYPE_LABELS[p.type] ?? p.type}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {p.type === 'percentage' ? `${p.value}%` : p.type === 'fixed' ? `₪${p.value}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {p.code ? (
                          <span className="text-xs bg-[#1a1a1d] border border-[#2a2a2e] px-2 py-0.5 rounded font-mono text-gray-300">{p.code}</span>
                        ) : (
                          <span className="text-gray-500 text-xs">אוטומטי</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(p.startDate).toLocaleDateString('he-IL')} — {new Date(p.endDate).toLocaleDateString('he-IL')}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {p.usageCount}{p.maxUses ? `/${p.maxUses}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(p.id, p.isActive)}
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${STATUS_COLORS[p.status]}`}
                        >
                          {p.status === 'active' ? 'פעיל' : p.status === 'scheduled' ? 'מתוזמן' : 'פג תוקף'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-400 transition-colors">
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

      {/* Wizard Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-[#2a2a2e] rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editPromo ? 'עריכת מבצע' : 'צור מבצע חדש'}</h2>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`w-6 h-1.5 rounded-full transition-colors ${wizardStep >= s ? 'bg-[#FFC424]' : 'bg-[#2a2a2e]'}`} />
                ))}
              </div>
            </div>

            {/* Step 1 */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">שלב 1 — פרטי המבצע</p>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">שם מבצע *</label>
                  <input value={step1.name} onChange={(e) => setStep1((f) => ({ ...f, name: e.target.value }))} className={INPUT} placeholder="מבצע קיץ 2026" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">סוג הנחה</label>
                  <select value={step1.type} onChange={(e) => setStep1((f) => ({ ...f, type: e.target.value }))} className={INPUT}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                {(step1.type === 'percentage' || step1.type === 'fixed') && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      {step1.type === 'percentage' ? 'אחוז הנחה (%)' : 'סכום הנחה (₪)'}
                    </label>
                    <input type="number" value={step1.value} onChange={(e) => setStep1((f) => ({ ...f, value: e.target.value }))} className={INPUT} placeholder="10" />
                  </div>
                )}
                {step1.type === 'buyXgetY' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">קנה X</label>
                      <input type="number" value={step1.buyX} onChange={(e) => setStep1((f) => ({ ...f, buyX: e.target.value }))} className={INPUT} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">קבל Y</label>
                      <input type="number" value={step1.getY} onChange={(e) => setStep1((f) => ({ ...f, getY: e.target.value }))} className={INPUT} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">שלב 2 — תנאים והגדרות</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">תחולה</label>
                    <select value={step2.scope} onChange={(e) => setStep2((f) => ({ ...f, scope: e.target.value }))} className={INPUT}>
                      {Object.entries(SCOPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">סוג לקוח</label>
                    <select value={step2.customerTypes} onChange={(e) => setStep2((f) => ({ ...f, customerTypes: e.target.value }))} className={INPUT}>
                      <option value="all">כולם</option>
                      <option value="private">פרטי</option>
                      <option value="garage">מוסך</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">מתאריך</label>
                    <input type="date" value={step2.startDate} onChange={(e) => setStep2((f) => ({ ...f, startDate: e.target.value }))} className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">עד תאריך</label>
                    <input type="date" value={step2.endDate} onChange={(e) => setStep2((f) => ({ ...f, endDate: e.target.value }))} className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">מקסימום שימושים</label>
                    <input type="number" value={step2.maxUses} onChange={(e) => setStep2((f) => ({ ...f, maxUses: e.target.value }))} className={INPUT} placeholder="ללא הגבלה" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">קוד קופון</label>
                    <input value={step2.code} onChange={(e) => setStep2((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className={INPUT} placeholder="SUMMER26" dir="ltr" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {wizardStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">שלב 3 — סיכום ואישור</p>
                <div className="bg-[#1a1a1d] rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">שם</span>
                    <span className="text-white">{step1.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">סוג</span>
                    <span className="text-white">{TYPE_LABELS[step1.type]}</span>
                  </div>
                  {step1.value && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">ערך</span>
                      <span className="text-white">{step1.type === 'percentage' ? `${step1.value}%` : `₪${step1.value}`}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">תחולה</span>
                    <span className="text-white">{SCOPE_LABELS[step2.scope]}</span>
                  </div>
                  {step2.startDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">תאריכים</span>
                      <span className="text-white">{step2.startDate} — {step2.endDate}</span>
                    </div>
                  )}
                  {step2.code && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">קוד</span>
                      <span className="text-white font-mono">{step2.code}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              {wizardStep > 1 && (
                <button onClick={() => setWizardStep((s) => s - 1)} className="px-4 py-2 bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg text-sm hover:bg-[#222224] transition-colors">
                  חזור
                </button>
              )}
              {wizardStep < 3 ? (
                <button
                  onClick={() => setWizardStep((s) => s + 1)}
                  disabled={wizardStep === 1 && !step1.name}
                  className="flex-1 bg-[#FFC424] text-black font-semibold py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors"
                >
                  המשך
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#FFC424] text-black font-semibold py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'שומר...' : 'שמור מבצע'}
                </button>
              )}
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg text-sm hover:bg-[#222224] transition-colors">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
