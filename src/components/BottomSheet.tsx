'use client'

import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxHeight?: string
}

export default function BottomSheet({ open, onClose, title, children, maxHeight = '82%' }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(40,30,35,.34)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-base-100 rounded-t-[1.8rem] shadow-2xl flex flex-col animate-[sheet_.26s_cubic-bezier(.22,1,.36,1)]"
        style={{ maxHeight }}
      >
        {/* Drag handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-base-300" />
        </div>

        {title && (
          <div className="px-5 pb-2 flex items-center justify-between shrink-0">
            <h3 className="font-serif text-xl">{title}</h3>
            <button
              onClick={onClose}
              className="btn btn-circle btn-ghost btn-sm"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}

        <div className="overflow-y-auto px-5 pb-6 flex-1">{children}</div>
      </div>
    </div>
  )
}
