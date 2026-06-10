'use client'

import { useState, useRef, useTransition } from 'react'
import { X, Camera, Check, Plus } from 'lucide-react'
import Chip from '@/components/Chip'
import FieldLabel from '@/components/FieldLabel'
import { usePhotoUpload } from '@/hooks/usePhotoUpload'
import { createItem } from '@/app/actions/items'
import type { StorageLocation, TagGroup } from '@/lib/types'

interface Props {
  open: boolean
  storageLocations: StorageLocation[]
  tagGroups: TagGroup[]
  onClose: () => void
}

export default function QuickAddModal({ open, storageLocations, tagGroups, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const { upload, isUploading } = usePhotoUpload()
  const fileRef = useRef<HTMLInputElement>(null)
  const [flash, setFlash] = useState(false)

  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [storageId, setStorageId] = useState<string | null>(storageLocations[0]?.id ?? null)

  const typeGroup   = tagGroups.find(g => g.name === 'Type')
  const colorGroup  = tagGroups.find(g => g.name === 'Color')
  const styleGroup  = tagGroups.find(g => g.name === 'Style')
  const seasonGroup = tagGroups.find(g => g.name === 'Season')

  const selectedType   = typeGroup?.tags?.find(t => selectedTagIds.includes(t.id))
  const selectedColors = colorGroup?.tags?.filter(t => selectedTagIds.includes(t.id)).map(t => t.value) ?? []

  const SINGULAR: Record<string, string> = {
    Tops: 'top', Bottoms: 'bottoms', Dresses: 'dress', Outerwear: 'layer',
    Shoes: 'shoes', Bags: 'bag', Activewear: 'activewear', Accessories: 'accessory',
  }
  const autoName    = `${selectedColors[0] ? selectedColors[0] + ' ' : ''}${SINGULAR[selectedType?.value ?? ''] ?? 'piece'}`
  const displayName = name.trim() || autoName
  const canSave     = !!(selectedType || name.trim() || imageUrl)

  if (!open) return null

  async function handleFile(file: File) {
    const url = await upload(file)
    if (url) setImageUrl(url)
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  function resetForm() {
    setName('')
    setImageUrl(null)
    setSelectedTagIds([])
    setStorageId(storageLocations[0]?.id ?? null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleSave(andClose = false) {
    if (!canSave) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('name', displayName)
      if (imageUrl) fd.set('image_url', imageUrl)
      if (storageId) fd.set('storage_location_id', storageId)
      fd.set('status', 'available')
      selectedTagIds.forEach(id => fd.append('tag_ids', id))
      await createItem(fd)
      if (andClose) {
        resetForm()
        onClose()
      } else {
        resetForm()
        setFlash(true)
        setTimeout(() => setFlash(false), 1100)
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-60 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(60,50,70,.28)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base-100 rounded-3xl shadow-xl w-full my-auto max-w-2xl lg:max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h2 className="text-lg font-bold">Add a piece</h2>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid sm:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] gap-6 max-h-[72vh] overflow-y-auto">

          {/* Left: photo */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center aspect-4/5 overflow-hidden border-base-300 bg-base-200/40 hover:border-primary/60"
          >
            {imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setImageUrl(null) }}
                  className="absolute top-2 right-2 btn btn-circle btn-xs bg-base-100/90 border-0"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="text-base-content/45 px-3">
                {isUploading
                  ? <span className="loading loading-spinner loading-md" />
                  : (
                    <>
                      <div className="flex justify-center mb-2">
                        <Camera size={26} strokeWidth={1.6} />
                      </div>
                      <div className="text-sm font-semibold text-base-content/60">Drop a photo</div>
                      <div className="font-mono text-[10px] mt-1 uppercase tracking-wide">or click to browse</div>
                    </>
                  )
                }
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          {/* Right: fields */}
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>Name</FieldLabel>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={canSave ? `${autoName} (optional)` : 'e.g. Blush puff-sleeve blouse'}
                className="input input-bordered w-full rounded-xl"
              />
            </div>

            {typeGroup && (typeGroup.tags ?? []).length > 0 && (
              <div>
                <FieldLabel>Type</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {(typeGroup.tags ?? []).map(tag => (
                    <Chip key={tag.id} size="sm" active={selectedTagIds.includes(tag.id)} onClick={() => toggleTag(tag.id)}>
                      {tag.value}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {colorGroup && (colorGroup.tags ?? []).length > 0 && (
              <div>
                <FieldLabel>Color</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {(colorGroup.tags ?? []).map(tag => (
                    <Chip key={tag.id} color={tag.value} size="sm" active={selectedTagIds.includes(tag.id)} onClick={() => toggleTag(tag.id)}>
                      {tag.value}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {styleGroup && (styleGroup.tags ?? []).length > 0 && (
              <div>
                <FieldLabel>Style</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {(styleGroup.tags ?? []).map(tag => (
                    <Chip key={tag.id} size="sm" active={selectedTagIds.includes(tag.id)} onClick={() => toggleTag(tag.id)}>
                      {tag.value}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {seasonGroup && (seasonGroup.tags ?? []).length > 0 && (
              <div>
                <FieldLabel>Season</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {(seasonGroup.tags ?? []).map(tag => (
                    <Chip key={tag.id} size="sm" active={selectedTagIds.includes(tag.id)} onClick={() => toggleTag(tag.id)}>
                      {tag.value}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {storageLocations.length > 0 && (
              <div>
                <FieldLabel>Where it lives</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {storageLocations.map(loc => {
                    const base = (loc as StorageLocation & { base_locations?: { name: string } }).base_locations
                    return (
                      <Chip key={loc.id} size="sm" active={storageId === loc.id} onClick={() => setStorageId(loc.id)}>
                        {loc.name}{base ? ` · ${base.name}` : ''}
                      </Chip>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-base-200">
          <div className="h-8">
            {flash && (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success">
                <Check size={15} strokeWidth={2.3} /> Saved!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-ghost rounded-full">Cancel</button>
            <button
              disabled={!canSave || isPending || isUploading}
              onClick={() => handleSave(false)}
              className="btn btn-outline btn-primary rounded-full gap-1.5 disabled:opacity-40"
            >
              {isPending ? <span className="loading loading-spinner loading-sm" /> : <><Plus size={15} strokeWidth={2.2} /> Add another</>}
            </button>
            <button
              disabled={!canSave || isPending || isUploading}
              onClick={() => handleSave(true)}
              className="btn btn-primary rounded-full gap-1 disabled:opacity-40"
            >
              {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save & close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
