'use client'

import { useEffect, useState, useCallback } from 'react'

const INPUT = 'bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFC424] transition-colors w-full'

interface Settings {
  storeName: string
  tagline: string
  phone: string
  mobile: string
  whatsapp: string
  address: string
  hours: string
  vatRate: number
  minOrderAmount: number
  deliveryPrice: number
}

function SectionBanner({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={`rounded-lg px-4 py-2.5 text-sm ${type === 'success' ? 'bg-[#FFC424]/10 text-[#FFC424] border border-[#FFC424]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
      {msg}
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [storeForm, setStoreForm] = useState<Settings>({
    storeName: '', tagline: '', phone: '', mobile: '', whatsapp: '', address: '', hours: '',
    vatRate: 17, minOrderAmount: 0, deliveryPrice: 0,
  })
  const [financeForm, setFinanceForm] = useState({ vatRate: '17', minOrderAmount: '0', deliveryPrice: '0' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const [storeBanner, setStoreBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [financeBanner, setFinanceBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [passwordBanner, setPasswordBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [savingStore, setSavingStore] = useState(false)
  const [savingFinance, setSavingFinance] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  function showBanner(
    setter: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; msg: string } | null>>,
    type: 'success' | 'error',
    msg: string,
  ) {
    setter({ type, msg })
    if (type === 'success') setTimeout(() => setter(null), 3000)
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const d = await res.json()
      setStoreForm({
        storeName: d.storeName ?? '',
        tagline: d.tagline ?? '',
        phone: d.phone ?? '',
        mobile: d.mobile ?? '',
        whatsapp: d.whatsapp ?? '',
        address: d.address ?? '',
        hours: d.hours ?? '',
        vatRate: d.vatRate ?? 17,
        minOrderAmount: d.minOrderAmount ?? 0,
        deliveryPrice: d.deliveryPrice ?? 0,
      })
      setFinanceForm({
        vatRate: String(d.vatRate ?? 17),
        minOrderAmount: String(d.minOrderAmount ?? 0),
        deliveryPrice: String(d.deliveryPrice ?? 0),
      })
    } catch {
      showBanner(setStoreBanner, 'error', 'שגיאה בטעינת הגדרות')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function saveStore() {
    setSavingStore(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: storeForm.storeName,
          tagline: storeForm.tagline,
          phone: storeForm.phone,
          mobile: storeForm.mobile,
          whatsapp: storeForm.whatsapp,
          address: storeForm.address,
          hours: storeForm.hours,
        }),
      })
      if (!res.ok) throw new Error()
      showBanner(setStoreBanner, 'success', 'פרטי החנות נשמרו')
    } catch {
      showBanner(setStoreBanner, 'error', 'שגיאה בשמירה')
    } finally {
      setSavingStore(false)
    }
  }

  async function saveFinance() {
    setSavingFinance(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vatRate: parseFloat(financeForm.vatRate),
          minOrderAmount: parseFloat(financeForm.minOrderAmount),
          deliveryPrice: parseFloat(financeForm.deliveryPrice),
        }),
      })
      if (!res.ok) throw new Error()
      showBanner(setFinanceBanner, 'success', 'הגדרות כספיות נשמרו')
    } catch {
      showBanner(setFinanceBanner, 'error', 'שגיאה בשמירה')
    } finally {
      setSavingFinance(false)
    }
  }

  async function savePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showBanner(setPasswordBanner, 'error', 'הסיסמאות אינן תואמות')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showBanner(setPasswordBanner, 'error', 'סיסמה חייבת להכיל לפחות 6 תווים')
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/admin/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'שגיאה')
      }
      showBanner(setPasswordBanner, 'success', 'סיסמה עודכנה בהצלחה')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'שגיאה בעדכון סיסמה'
      showBanner(setPasswordBanner, 'error', msg)
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-white">הגדרות</h1>

      {/* Store info */}
      <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">פרטי החנות</h2>
        {storeBanner && <SectionBanner type={storeBanner.type} msg={storeBanner.msg} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">שם החנות</label>
            <input value={storeForm.storeName} onChange={(e) => setStoreForm((f) => ({ ...f, storeName: e.target.value }))} className={INPUT} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">סיסמת חנות (טאגליין)</label>
            <input value={storeForm.tagline} onChange={(e) => setStoreForm((f) => ({ ...f, tagline: e.target.value }))} className={INPUT} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">טלפון קווי</label>
            <input value={storeForm.phone} onChange={(e) => setStoreForm((f) => ({ ...f, phone: e.target.value }))} className={INPUT} dir="ltr" placeholder="04-8599333" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">נייד</label>
            <input value={storeForm.mobile} onChange={(e) => setStoreForm((f) => ({ ...f, mobile: e.target.value }))} className={INPUT} dir="ltr" placeholder="052-3158796" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">WhatsApp</label>
            <input value={storeForm.whatsapp} onChange={(e) => setStoreForm((f) => ({ ...f, whatsapp: e.target.value }))} className={INPUT} dir="ltr" placeholder="972523158796" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">שעות פעילות</label>
            <input value={storeForm.hours} onChange={(e) => setStoreForm((f) => ({ ...f, hours: e.target.value }))} className={INPUT} placeholder="א׳-ו׳ 8:00-18:00" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">כתובת</label>
            <input value={storeForm.address} onChange={(e) => setStoreForm((f) => ({ ...f, address: e.target.value }))} className={INPUT} />
          </div>
        </div>

        <button onClick={saveStore} disabled={savingStore} className="bg-[#FFC424] text-black font-semibold px-6 py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors">
          {savingStore ? 'שומר...' : 'שמור פרטי חנות'}
        </button>
      </div>

      {/* Finance */}
      <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">הגדרות כספיות</h2>
        {financeBanner && <SectionBanner type={financeBanner.type} msg={financeBanner.msg} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">מע״מ (%)</label>
            <input type="number" value={financeForm.vatRate} onChange={(e) => setFinanceForm((f) => ({ ...f, vatRate: e.target.value }))} className={INPUT} step="0.1" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">הזמנה מינימלית (₪)</label>
            <input type="number" value={financeForm.minOrderAmount} onChange={(e) => setFinanceForm((f) => ({ ...f, minOrderAmount: e.target.value }))} className={INPUT} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">מחיר משלוח (₪)</label>
            <input type="number" value={financeForm.deliveryPrice} onChange={(e) => setFinanceForm((f) => ({ ...f, deliveryPrice: e.target.value }))} className={INPUT} />
          </div>
        </div>

        <button onClick={saveFinance} disabled={savingFinance} className="bg-[#FFC424] text-black font-semibold px-6 py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors">
          {savingFinance ? 'שומר...' : 'שמור הגדרות כספיות'}
        </button>
      </div>

      {/* Password */}
      <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">סיסמת מנהל</h2>
        {passwordBanner && <SectionBanner type={passwordBanner.type} msg={passwordBanner.msg} />}

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">סיסמה נוכחית</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">סיסמה חדשה</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">אימות סיסמה</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              className={INPUT}
            />
          </div>
        </div>

        <button
          onClick={savePassword}
          disabled={savingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          className="bg-[#FFC424] text-black font-semibold px-6 py-2 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors"
        >
          {savingPassword ? 'מעדכן...' : 'עדכן סיסמה'}
        </button>
      </div>
    </div>
  )
}
