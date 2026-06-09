'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, X, Trash2, Plus, Shuffle, Search,
} from 'lucide-react'
import { setSlotItem, removeSlotItem } from '@/app/actions/outfit-slots'
import { deleteOutfit, updateOutfit } from '@/app/actions/outfits'
import PhotoTile from '@/components/PhotoTile'
import BottomSheet from '@/components/BottomSheet'
import SectionLabel from '@/components/SectionLabel'
import type { Item, OutfitSlot } from '@/lib/types'

interface OutfitRow {
  id: string
  name: string
  created_by: string
  outfit_items: { item_id: string; slot_id: string | null; items: Item }[]
}

interface Props {
  outfit: OutfitRow
  slots: OutfitSlot[]
  allItems: Item[]
}

export default function OutfitBuilderClient({ outfit, slots, allItems }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeSlot, setActiveSlot] = useState<OutfitSlot | null>(null)
  const [pickerQuery, setPickerQuery] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(outfit.name)

  const slotMap = new Map<string, Item[]>()
  for (const oi of outfit.outfit_items) {
    if (!oi.slot_id) continue
    const existing = slotMap.get(oi.slot_id) ?? []
    existing.push(oi.items)
    slotMap.set(oi.slot_id, existing)
  }

  const unslotted = outfit.outfit_items.filter(oi => !oi.slot_id).map(oi => oi.items)

  function handlePickItem(item: Item) {
    if (!activeSlot) return
    startTransition(async () => {
      await setSlotItem(outfit.id, activeSlot.id, item.id, activeSlot.allow_multiple)
    })
    if (!activeSlot.allow_multiple) setActiveSlot(null)
  }

  const handleSurpriseMe = useCallback(() => {
    startTransition(async () => {
      for (const slot of slots) {
        const preferred = allItems.filter(item =>
          (item.item_tags as { tags: { value: string } }[] | undefined)?.some(
            it => it.tags.value.toLowerCase() === slot.name.toLowerCase()
          )
        )
        const pool = preferred.length > 0 ? preferred : allItems
        if (!pool.length) continue
        const pick = pool[Math.floor(Math.random() * pool.length)]
        await setSlotItem(outfit.id, slot.id, pick.id, slot.allow_multiple)
      }
    })
  }, [slots, allItems, outfit.id])

  const pickerItems = pickerQuery.trim()
    ? allItems.filter(i => i.name.toLowerCase().includes(pickerQuery.toLowerCase()))
    : allItems

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <button
          className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center shrink-0"
          onClick={() => router.back()}
        >
          <ChevronLeft size={20} strokeWidth={2.1} />
        </button>

        {editingName ? (
          <form
            className="flex gap-2 flex-1"
            onSubmit={e => {
              e.preventDefault()
              startTransition(async () => {
                await updateOutfit(outfit.id, nameDraft)
                setEditingName(false)
              })
            }}
          >
            <input
              className="bg-transparent outline-none font-serif text-[20px] flex-1 border-b border-base-300 focus:border-primary pb-0.5"
              value={nameDraft}
              onChange={e => setNameDraft(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-sm btn-primary rounded-full" disabled={isPending}>Save</button>
            <button type="button" className="btn btn-sm btn-ghost rounded-full" onClick={() => setEditingName(false)}>
              <X size={14} strokeWidth={2.1} />
            </button>
          </form>
        ) : (
          <>
            <h1 className="font-serif text-[20px] flex-1 cursor-pointer truncate" onClick={() => setEditingName(true)}>
              {outfit.name}
            </h1>
            <button
              className="btn btn-sm btn-ghost rounded-full gap-1.5 text-base-content/60"
              onClick={handleSurpriseMe}
              disabled={isPending}
              title="Randomly fill all slots"
            >
              <Shuffle size={16} strokeWidth={1.8} /> Surprise me
            </button>
            <button
              className="btn btn-circle btn-ghost btn-sm text-error"
              onClick={() => {
                if (!confirm(`Delete "${outfit.name}"?`)) return
                startTransition(async () => { await deleteOutfit(outfit.id); router.push('/outfits') })
              }}
              disabled={isPending}
            >
              <Trash2 size={15} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

      {isPending && (
        <div className="flex justify-center py-2">
          <span className="loading loading-dots loading-sm" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="flex flex-col gap-3 pt-1">
          {slots.map(slot => {
            const items = slotMap.get(slot.id) ?? []
            const isEmpty = items.length === 0

            return (
              <div
                key={slot.id}
                onClick={() => { setActiveSlot(slot); setPickerQuery('') }}
                className={`cursor-pointer bg-base-100 border-2 rounded-2xl p-3 flex items-center gap-3 transition-colors ${
                  activeSlot?.id === slot.id ? 'border-primary' : 'border-base-200 hover:border-base-300'
                }`}
              >
                <div className="w-20 shrink-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-base-content/40">{slot.name}</p>
                  {slot.allow_multiple && <p className="text-[10px] text-base-content/30">multiple</p>}
                </div>

                {isEmpty ? (
                  <div className="flex-1 flex items-center gap-2 text-base-content/30">
                    <div className="w-12 h-[58px] rounded-xl bg-base-200 flex items-center justify-center">
                      <Plus size={20} strokeWidth={2.2} />
                    </div>
                    <span className="text-[13px]">Tap to pick</span>
                  </div>
                ) : (
                  <div className="flex-1 flex gap-2 flex-wrap">
                    {items.map(item => (
                      <div key={item.id} className="relative shrink-0">
                        <div className="w-12 h-[58px]">
                          <PhotoTile
                            imageUrl={item.image_url}
                            name={item.name}
                            className="w-full h-full"
                            radius="0.55rem"
                          />
                        </div>
                        <button
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neutral text-neutral-content flex items-center justify-center shadow"
                          onClick={e => { e.stopPropagation(); startTransition(() => removeSlotItem(outfit.id, slot.id, item.id)) }}
                        >
                          <X size={12} strokeWidth={2.1} />
                        </button>
                        <p className="text-[10px] text-center mt-0.5 max-w-12 truncate text-base-content/40">{item.name}</p>
                      </div>
                    ))}
                    {slot.allow_multiple && (
                      <div className="w-12 h-[58px] rounded-xl bg-base-200 flex items-center justify-center text-base-content/30 cursor-pointer">
                        <Plus size={20} strokeWidth={2.2} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {unslotted.length > 0 && (
          <div className="mt-4">
            <SectionLabel>Other items (no slot)</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {unslotted.map(item => (
                <div key={item.id} className="relative shrink-0">
                  <div className="w-12 h-[58px]">
                    <PhotoTile imageUrl={item.image_url} name={item.name} className="w-full h-full" radius="0.55rem" />
                  </div>
                  <button
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neutral text-neutral-content flex items-center justify-center shadow"
                    onClick={() => startTransition(() => removeSlotItem(outfit.id, '', item.id))}
                  >
                    <X size={12} strokeWidth={2.1} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Item picker sheet */}
      <BottomSheet open={!!activeSlot} onClose={() => setActiveSlot(null)} title={activeSlot ? `Pick for: ${activeSlot.name}` : ''} maxHeight="75%">
        <label className="flex items-center gap-2 bg-base-200/70 rounded-2xl px-3.5 h-10 mb-4 text-base-content/55">
          <Search size={16} strokeWidth={1.9} />
          <input
            value={pickerQuery}
            onChange={e => setPickerQuery(e.target.value)}
            placeholder="Search items…"
            className="bg-transparent outline-none w-full text-[14px] text-base-content placeholder:text-base-content/40"
            autoFocus
          />
        </label>
        <div className="grid grid-cols-3 gap-3">
          {pickerItems.map(item => (
            <button
              key={item.id}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border border-base-200 hover:border-primary transition-colors"
              onClick={() => handlePickItem(item)}
              disabled={isPending}
            >
              <div className="w-full aspect-[3/4]">
                <PhotoTile imageUrl={item.image_url} name={item.name} className="w-full h-full" radius="0.7rem" />
              </div>
              <span className="text-[11px] text-center line-clamp-2 leading-tight">{item.name}</span>
            </button>
          ))}
          {pickerItems.length === 0 && (
            <p className="col-span-3 text-center text-base-content/40 py-8">No items found</p>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
