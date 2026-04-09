'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'

type FilterType = 'all' | 'used' | 'unused'

interface MediaItem {
  id: string
  url: string
  filename: string
  isUsed: boolean
  size?: number
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1d] rounded ${className}`} />
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function showBanner(type: 'success' | 'error', msg: string) {
    setBanner({ type, msg })
    if (type === 'success') setTimeout(() => setBanner(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/media')
      const d = await res.json()
      setItems(d.items ?? [])
    } catch {
      showBanner('error', 'שגיאה בטעינת מדיה')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function uploadFiles(files: File[]) {
    if (!files.length) return
    setUploading(true)
    let uploaded = 0
    for (const file of files) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/media', { method: 'POST', body: fd })
        if (res.ok) uploaded++
      } catch {
        // continue
      }
    }
    showBanner(uploaded > 0 ? 'success' : 'error', uploaded > 0 ? `${uploaded} קבצים הועלו` : 'שגיאה בהעלאה')
    setUploading(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק קובץ זה?')) return
    try {
      await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
      showBanner('success', 'קובץ נמחק')
      load()
    } catch {
      showBanner('error', 'שגיאה במחיקה')
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    uploadFiles(files)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    uploadFiles(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  const filtered = items.filter((item) => {
    if (filter === 'used') return item.isUsed
    if (filter === 'unused') return !item.isUsed
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">מדיה</h1>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-[#FFC424] text-black text-sm font-semibold px-3 py-2 rounded-lg hover:bg-[#ffcd4a] disabled:opacity-50 transition-colors"
        >
          <Upload size={16} />
          {uploading ? 'מעלה...' : 'העלה תמונות'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
      </div>

      {banner && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${banner.type === 'success' ? 'bg-[#FFC424]/10 text-[#FFC424] border border-[#FFC424]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {banner.msg}
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-[#FFC424] bg-[#FFC424]/5' : 'border-[#2a2a2e] hover:border-[#FFC424]/50'}`}
      >
        <ImageIcon size={32} className="mx-auto text-gray-500 mb-2" />
        <p className="text-gray-400 text-sm">גרור תמונות לכאן, או לחץ להעלאה</p>
        <p className="text-gray-500 text-xs mt-1">PNG, JPG, WEBP — עד 5MB לקובץ</p>
        {uploading && <p className="text-[#FFC424] text-xs mt-2">מעלה...</p>}
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(['all', 'used', 'unused'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === f ? 'bg-[#FFC424] text-black font-semibold' : 'bg-[#161618] border border-[#2a2a2e] text-gray-400 hover:text-white'}`}
          >
            {f === 'all' ? 'הכל' : f === 'used' ? 'בשימוש' : 'לא בשימוש'}
          </button>
        ))}
        <span className="mr-auto text-gray-500 text-sm self-center">{filtered.length} קבצים</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {[...Array(14)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#161618] border border-[#2a2a2e] rounded-xl p-16 text-center text-gray-500 text-sm">
          אין תמונות
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="relative group aspect-square">
              <img
                src={item.url}
                alt={item.filename}
                className="w-full h-full object-cover rounded-lg bg-[#1a1a1d]"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 rounded-lg transition-colors flex flex-col items-center justify-end p-1.5 opacity-0 group-hover:opacity-100">
                <p className="text-white text-[10px] text-center truncate w-full mb-1">{item.filename}</p>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500/80 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                  aria-label="מחק"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {/* Used badge */}
              {item.isUsed && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" title="בשימוש" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
