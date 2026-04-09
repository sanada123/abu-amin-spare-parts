'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'סיסמה שגויה')
      }
    } catch {
      setError('שגיאת חיבור — נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0E0E10] flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFC424] mb-4">
            <Lock size={24} className="text-black" />
          </div>
          <h1 className="text-xl font-bold text-white">אבו אמין חלפים</h1>
          <p className="text-gray-400 text-sm mt-1">כניסה לממשק הניהול</p>
        </div>

        {/* Card */}
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-1.5" htmlFor="password">
                סיסמת מנהל
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1a1d] border border-[#2a2a2e] text-white rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#FFC424] transition-colors"
                  placeholder="הכנס סיסמה"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[#FFC424] text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-[#ffcd4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'מתחבר...' : 'כניסה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
