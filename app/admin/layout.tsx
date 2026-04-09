'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Tag,
  Car,
  ClipboardList,
  Users,
  Percent,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/admin', label: 'לוח בקרה', icon: LayoutDashboard },
  { href: '/admin/products', label: 'מוצרים', icon: Package },
  { href: '/admin/categories', label: 'קטגוריות', icon: FolderOpen },
  { href: '/admin/brands', label: 'מותגים', icon: Tag },
  { href: '/admin/vehicles', label: 'רכבים', icon: Car },
  { href: '/admin/orders', label: 'הזמנות', icon: ClipboardList },
  { href: '/admin/customers', label: 'לקוחות', icon: Users },
  { href: '/admin/promotions', label: 'מבצעים', icon: Percent },
  { href: '/admin/media', label: 'מדיה', icon: Image },
  { href: '/admin/settings', label: 'הגדרות', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div dir="rtl" className="flex h-screen bg-[#0E0E10] text-white overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-60 bg-[#161618] border-l border-[#2a2a2e] z-30
          flex flex-col transition-transform duration-300
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a2a2e]">
          <span className="font-bold text-[#FFC424] text-sm leading-tight">
            אבו אמין<br />
            <span className="text-white text-xs font-normal">ניהול</span>
          </span>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${isActive
                    ? 'bg-[#FFC424]/10 text-[#FFC424] border-l-2 border-[#FFC424]'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1d]'
                  }
                `}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[#2a2a2e] p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-[#1a1a1d] rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>יציאה</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#161618] border-b border-[#2a2a2e] shrink-0">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-white text-sm">אבו אמין | ניהול</span>
          <div className="w-8 lg:w-0" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
