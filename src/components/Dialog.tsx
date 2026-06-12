'use client'

import { X } from 'lucide-react'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'lg'
}

export default function Dialog({ title, onClose, children, size = 'sm' }: Props) {
  const isLg = size === 'lg'
  return (
    <div
      className={`fixed inset-0 z-60 flex justify-center p-4 ${isLg ? 'items-start sm:items-center overflow-y-auto' : 'items-center'}`}
      style={{ background: 'rgba(60,50,70,.5)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`bg-base-100 rounded-3xl shadow-xl w-full ${isLg ? 'my-auto max-w-2xl lg:max-w-3xl' : 'max-w-sm'}`}>
        <div className={`flex items-center justify-between border-b border-base-200 ${isLg ? 'px-6 py-4' : 'px-5 py-4'}`}>
          <h2 className={isLg ? 'text-lg font-bold' : 'font-semibold text-[15px]'}>{title}</h2>
          <button onClick={onClose} className={`btn btn-circle btn-ghost ${isLg ? 'btn-sm' : 'btn-xs'}`}>
            <X size={isLg ? 18 : 15} strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
