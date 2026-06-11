'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteItem } from '@/app/actions/items'
import type { Item } from '@/lib/types'

interface Props {
  item: Item | null
  onClose: () => void
}

export default function DeleteConfirmModal({ item, onClose }: Props) {
  const [isPending, startTransition] = useTransition()

  if (!item) return null

  function handleDelete() {
    if (!item) return
    startTransition(async () => {
      await deleteItem(item.id)
      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(60,50,70,.5)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base-100 rounded-3xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 text-error mx-auto mb-4">
          <Trash2 size={22} strokeWidth={1.8} />
        </div>
        <h2 className="text-[18px] font-bold text-center mb-1.5">Delete this piece?</h2>
        <p className="text-[13.5px] text-base-content/55 text-center mb-6">
          <span className="font-medium text-base-content/80">{item.name}</span>
          {' '}will be permanently removed from your wardrobe.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn btn-ghost rounded-full flex-1">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="btn btn-error rounded-full flex-1 disabled:opacity-40"
          >
            {isPending
              ? <span className="loading loading-spinner loading-sm" />
              : 'Delete'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
