'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Heart, Trash2, Camera,
  MapPin, ChevronDown, Box, Check,
} from 'lucide-react'
import { updateItem, deleteItem, toggleFavorite } from '@/app/actions/items'
import { useIsAdmin } from '@/context/admin'
import { useViewingUserId } from '@/context/user'
import { usePhotoUpload } from '@/hooks/usePhotoUpload'
import { useToggleSet } from '@/hooks/useToggleSet'
import Chip from '@/components/Chip'
import PhotoTile from '@/components/PhotoTile'
import TagChipGroup from '@/components/TagChipGroup'
import SectionLabel from '@/components/SectionLabel'
import BottomSheet from '@/components/BottomSheet'
import type { BaseLocation, Item, StorageLocation, TagGroup } from '@/lib/types'

interface Props {
  item: Item
  bases: BaseLocation[]
  storageLocations: StorageLocation[]
  tagGroups: TagGroup[]
}

export default function ItemDetailClient({ item, bases, storageLocations, tagGroups }: Props) {
  const router = useRouter()
  const isAdmin = useIsAdmin()
  const viewingUserId = useViewingUserId()
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading } = usePhotoUpload()

  const [name, setName] = useState(item.name)
  const [notes, setNotes] = useState(item.notes ?? '')
  const [imageUrl, setImageUrl] = useState(item.image_url ?? null)
  const [storageId, setStorageId] = useState(item.storage_location_id ?? null)
  const [favorite, setFavorite] = useState(item.favorite ?? false)
  const [locSheetOpen, setLocSheetOpen] = useState(false)

  const initialTagIds = item.item_tags?.map(it => it.tags?.id).filter(Boolean) as string[] ?? []
  const [tagIds, toggleTag] = useToggleSet(initialTagIds)

  const typeGroup    = tagGroups.find(g => g.name === 'Type')
  const colorGroup   = tagGroups.find(g => g.name === 'Color')
  const styleGroup   = tagGroups.find(g => g.name === 'Style')
  const seasonGroup  = tagGroups.find(g => g.name === 'Season')
  const customGroups = tagGroups.filter(g => !g.is_system)

  // Capture initial values once — used to detect unsaved changes
  const origRef = useRef({
    name: item.name,
    notes: item.notes ?? '',
    imageUrl: item.image_url ?? null,
    storageId: item.storage_location_id ?? null,
    tagIds: [...initialTagIds].sort().join(','),
  })

  const dirty =
    name !== origRef.current.name ||
    notes !== origRef.current.notes ||
    imageUrl !== origRef.current.imageUrl ||
    storageId !== origRef.current.storageId ||
    [...tagIds].sort().join(',') !== origRef.current.tagIds

  async function handlePhotoChange(file: File) {
    const url = await upload(file)
    if (url) setImageUrl(url)
  }

  function handleSave() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('name', name)
      fd.set('notes', notes)
      if (imageUrl) fd.set('image_url', imageUrl)
      if (storageId) fd.set('storage_location_id', storageId)
      fd.set('status', item.status ?? 'available')
      tagIds.forEach(id => fd.append('tag_ids', id))
      await updateItem(item.id, fd)
    })
  }

  function handleDelete() {
    if (!confirm(`Delete "${item.name}"?`)) return
    startTransition(async () => {
      await deleteItem(item.id)
      router.push(`/${viewingUserId}/items`)
    })
  }

  function handleToggleFav() {
    const next = !favorite
    setFavorite(next)
    startTransition(() => toggleFavorite(item.id, next))
  }

  const currentLoc  = storageLocations.find(s => s.id === storageId)
  const currentBase = bases.find(b => b.id === currentLoc?.base_id)

  return (
    <div className="relative min-h-screen">
      {/* Floating top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pointer-events-none">
        <button
          onClick={() => router.back()}
          className="pointer-events-auto w-9 h-9 rounded-full bg-base-100/85 backdrop-blur-sm flex items-center justify-center shadow-sm"
        >
          <ChevronLeft size={20} strokeWidth={2.1} />
        </button>
        <div className="flex gap-1.5 pointer-events-auto">
          <button
            onClick={handleToggleFav}
            className={`w-9 h-9 rounded-full bg-base-100/85 backdrop-blur-sm flex items-center justify-center shadow-sm ${favorite ? 'text-primary' : ''}`}
          >
            <Heart size={18} strokeWidth={1.8} fill={favorite ? 'currentColor' : 'none'} />
          </button>
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="w-9 h-9 rounded-full bg-base-100/85 backdrop-blur-sm flex items-center justify-center shadow-sm text-base-content/70"
            >
              <Trash2 size={17} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="pb-32">
        {/* Photo hero */}
        <div className="relative">
          <PhotoTile
            imageUrl={imageUrl}
            name={item.name}
            className="w-full"
            radius="0"
            style={{ minHeight: 320, aspectRatio: '4/5' }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-3 right-3 px-3 h-9 rounded-full bg-base-100/90 backdrop-blur-sm text-[13px] font-medium shadow flex items-center gap-1.5 disabled:opacity-60"
          >
            {isUploading
              ? <span className="loading loading-spinner loading-xs" />
              : <Camera size={16} strokeWidth={1.7} />}
            {imageUrl ? 'Change' : 'Add photo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoChange(f) }}
          />
        </div>

        <div className="px-4 pt-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full font-serif text-[24px] leading-tight bg-transparent outline-none border-b border-transparent focus:border-base-300 pb-1"
          />

          {/* Location picker */}
          <button
            onClick={() => setLocSheetOpen(true)}
            className="mt-3 w-full flex items-center gap-3 bg-base-200/60 rounded-2xl p-3 text-left"
          >
            <span className="w-10 h-10 rounded-xl bg-base-100 flex items-center justify-center text-primary">
              <MapPin size={20} strokeWidth={1.7} />
            </span>
            <span className="flex-1">
              <span className="text-[11px] uppercase tracking-wider text-base-content/40 font-bold block">
                Where it lives
              </span>
              <span className="font-medium text-[15px]">
                {currentLoc
                  ? `${currentLoc.name}${currentBase ? ` · ${currentBase.name}` : ''}`
                  : 'Unassigned'}
              </span>
            </span>
            <ChevronDown size={18} strokeWidth={2.1} />
          </button>

          {/* Tag sections */}
          <div className="mt-5 space-y-4">
            <TagChipGroup group={typeGroup} selectedIds={tagIds} onToggle={toggleTag} Label={SectionLabel} />
            <TagChipGroup group={colorGroup} selectedIds={tagIds} onToggle={toggleTag} withColor Label={SectionLabel} />
            <TagChipGroup group={styleGroup} selectedIds={tagIds} onToggle={toggleTag} Label={SectionLabel} />
            <TagChipGroup group={seasonGroup} selectedIds={tagIds} onToggle={toggleTag} Label={SectionLabel} />
            {customGroups.map(group => (
              <TagChipGroup key={group.id} group={group} selectedIds={tagIds} onToggle={toggleTag} Label={SectionLabel} />
            ))}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <SectionLabel>Notes</SectionLabel>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Pairs with the linen trousers · dry clean only…"
              className="w-full bg-base-200/50 rounded-2xl p-3 text-[14px] outline-none resize-none focus:bg-base-200"
            />
          </div>
        </div>
      </div>

      {/* Save bar */}
      {isAdmin && (
        <div className="fixed left-0 right-0 bottom-0 px-4 pb-24 pt-3 bg-gradient-to-t from-base-100 via-base-100 to-transparent z-10 pointer-events-none">
          <button
            onClick={handleSave}
            disabled={!dirty || isPending}
            className="btn btn-primary w-full rounded-2xl h-[50px] text-[15px] disabled:opacity-40 pointer-events-auto"
          >
            {isPending
              ? <span className="loading loading-spinner loading-sm" />
              : dirty ? 'Save changes' : 'Saved'
            }
          </button>
        </div>
      )}

      {/* Location sheet */}
      <BottomSheet open={locSheetOpen} onClose={() => setLocSheetOpen(false)} title="Where it lives">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => { setStorageId(null); setLocSheetOpen(false) }}
            className={`flex items-center gap-3 p-3 rounded-2xl text-left ${!storageId ? 'bg-primary/10' : 'hover:bg-base-200'}`}
          >
            <span className="w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center text-base-content/60">
              <Box size={18} strokeWidth={1.7} />
            </span>
            <span className="flex-1 font-medium">Unassigned</span>
            {!storageId && <span className="text-primary"><Check size={18} strokeWidth={2.3} /></span>}
          </button>

          {storageLocations.map(loc => {
            const base = bases.find(b => b.id === loc.base_id)
            return (
              <button
                key={loc.id}
                onClick={() => { setStorageId(loc.id); setLocSheetOpen(false) }}
                className={`flex items-center gap-3 p-3 rounded-2xl text-left ${storageId === loc.id ? 'bg-primary/10' : 'hover:bg-base-200'}`}
              >
                <span className="w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center text-base-content/60">
                  <Box size={18} strokeWidth={1.7} />
                </span>
                <span className="flex-1">
                  <span className="font-medium block leading-tight">{loc.name}</span>
                  {base && <span className="text-[12px] text-base-content/45">{base.name}</span>}
                </span>
                {storageId === loc.id && <span className="text-primary"><Check size={18} strokeWidth={2.3} /></span>}
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </div>
  )
}
