'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Plus, LayoutGrid } from 'lucide-react'
import { createOutfit } from '@/app/actions/outfits'
import { useIsAdmin } from '@/context/admin'
import { useViewingUserId } from '@/context/user'
import PhotoTile from '@/components/PhotoTile'
import type { OutfitSlot } from '@/lib/types'

interface OutfitPreview {
  id: string
  name: string
  outfit_items: { slot_id: string | null; items: { image_url: string | null; name: string } }[]
}

interface Props {
  outfits: OutfitPreview[]
  slots: OutfitSlot[]
}

export default function OutfitsClient({ outfits, slots }: Props) {
  const router = useRouter()
  const isAdmin = useIsAdmin()
  const viewingUserId = useViewingUserId()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    if (!search.trim()) return outfits
    const q = search.toLowerCase()
    return outfits.filter(o => o.name.toLowerCase().includes(q))
  }, [outfits, search])

  function openModal() { setNewName(''); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setNewName('') }

  function handleCreate() {
    if (!newName.trim()) return
    startTransition(async () => {
      const id = await createOutfit(newName.trim(), viewingUserId || undefined)
      closeModal()
      router.push(`/${viewingUserId}/outfits/${id}`)
    })
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-end justify-between lg:px-6 lg:pt-5">
        <div>
          <h1 className="font-serif text-[26px] leading-none tracking-tight">Outfits</h1>
          <p className="text-[12px] text-base-content/45 mt-1">
            {filtered.length !== outfits.length
              ? `${filtered.length} of ${outfits.length} saved`
              : `${outfits.length} saved`}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openModal}
            className="btn btn-primary btn-sm rounded-full gap-1.5"
          >
            <Plus size={16} strokeWidth={2.2} /> New outfit
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 pb-3 lg:px-6">
        <label className="flex items-center gap-2 bg-base-100 border border-base-300 rounded-2xl px-3.5 h-11 text-base-content/55">
          <Search size={18} strokeWidth={1.9} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search outfits"
            className="bg-transparent outline-none w-full text-[15px] text-base-content placeholder:text-base-content/40"
          />
          {search && (
            <button onClick={() => setSearch('')}><X size={16} strokeWidth={2.1} /></button>
          )}
        </label>
      </div>

      {/* Gallery */}
      <div className="flex-1 px-4 pb-28 lg:pb-10 lg:px-6">
        {outfits.length === 0 ? (
          <EmptyGallery onNew={isAdmin ? openModal : undefined} />
        ) : filtered.length === 0 ? (
          <NoMatches onClear={() => setSearch('')} />
        ) : (
          <div className="grid gap-4 pt-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {filtered.map(outfit => (
              <OutfitCard key={outfit.id} outfit={outfit} slots={slots} viewingUserId={viewingUserId} />
            ))}
          </div>
        )}
      </div>

      {/* New outfit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(60,50,70,.5)' }}
          onMouseDown={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-base-100 rounded-3xl shadow-xl w-full my-auto max-w-sm">

            <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
              <h2 className="text-lg font-bold">New outfit</h2>
              <button onClick={closeModal} className="btn btn-circle btn-ghost btn-sm">
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Name</div>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Sunday brunch look"
                  className="input input-bordered w-full rounded-xl"
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
                />
              </div>
              <p className="text-[12.5px] text-base-content/45">
                You&apos;ll pick pieces for each slot on the next screen.
              </p>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-base-200">
              <button onClick={closeModal} className="btn btn-ghost rounded-full">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || isPending}
                className="btn btn-primary rounded-full gap-1.5 disabled:opacity-40"
              >
                {isPending
                  ? <span className="loading loading-spinner loading-sm" />
                  : <><Plus size={15} strokeWidth={2.2} /> Create</>}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

function OutfitCard({ outfit, slots, viewingUserId }: { outfit: OutfitPreview; slots: OutfitSlot[]; viewingUserId: string }) {
  const router = useRouter()
  const visibleSlots = slots.slice(0, 4)
  const slotThumbs = visibleSlots.map(slot => ({
    slot,
    item: outfit.outfit_items.find(oi => oi.slot_id === slot.id)?.items ?? null,
  }))
  const filledCount = outfit.outfit_items.length

  return (
    <button
      onClick={() => router.push(`/${viewingUserId}/outfits/${outfit.id}`)}
      className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all text-left group"
    >
      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 gap-0.5 bg-base-200 aspect-square">
        {[0, 1, 2, 3].map(i => {
          const thumb = slotThumbs[i]
          return (
            <div key={i} className="relative overflow-hidden bg-base-200">
              {thumb?.item ? (
                <PhotoTile
                  imageUrl={thumb.item.image_url}
                  name={thumb.item.name}
                  className="w-full h-full"
                  radius="0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-base-content/15 text-xs">
                  {thumb?.slot.name.charAt(0) ?? ''}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Card footer */}
      <div className="px-3 py-2.5">
        <div className="font-medium text-[14px] truncate group-hover:text-primary transition-colors">
          {outfit.name}
        </div>
        <div className="text-[11.5px] text-base-content/40 mt-0.5">
          {filledCount === 0 ? 'Empty' : `${filledCount} piece${filledCount === 1 ? '' : 's'}`}
        </div>
      </div>
    </button>
  )
}

function EmptyGallery({ onNew }: { onNew?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-8">
      <div className="w-16 h-16 rounded-3xl bg-base-200 flex items-center justify-center text-base-content/35 mb-4">
        <LayoutGrid size={30} strokeWidth={1.9} />
      </div>
      <h3 className="font-serif text-xl mb-1">No outfits yet</h3>
      <p className="text-[13.5px] text-base-content/50 max-w-[230px] mb-5">
        {onNew ? 'Create an outfit and fill the slots with pieces from your wardrobe.' : 'No outfits have been created yet.'}
      </p>
      {onNew && (
        <button onClick={onNew} className="btn btn-primary rounded-full gap-1.5">
          <Plus size={17} strokeWidth={2.2} /> New outfit
        </button>
      )}
    </div>
  )
}

function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-8">
      <h3 className="font-serif text-xl mb-1">No matches</h3>
      <p className="text-[13.5px] text-base-content/50 mb-5">Nothing fits that search.</p>
      <button onClick={onClear} className="btn btn-sm btn-ghost rounded-full">Clear search</button>
    </div>
  )
}
