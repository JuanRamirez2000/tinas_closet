'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOutfit } from '@/app/actions/outfits'
import BottomSheet from '@/components/BottomSheet'

interface Props {
  className?: string
  children?: React.ReactNode
}

export default function NewOutfitButton({ className, children }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    if (!name.trim()) return
    startTransition(async () => {
      const id = await createOutfit(name.trim())
      setOpen(false)
      setName('')
      router.push(`/outfits/${id}`)
    })
  }

  return (
    <>
      <button
        className={className ?? 'btn btn-primary btn-sm rounded-full'}
        onClick={() => setOpen(true)}
      >
        {children ?? '+ New outfit'}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="New outfit">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Name</div>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sunday brunch look"
              className="w-full bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[15px]"
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isPending}
            className="btn btn-primary rounded-full disabled:opacity-40"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Create outfit'}
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
