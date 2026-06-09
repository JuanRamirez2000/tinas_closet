'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { X, Camera, Heart } from 'lucide-react'
import Chip from '@/components/Chip'
import { updateItem } from '@/app/actions/items'
import type { Item, StorageLocation, TagGroup } from '@/lib/types'

interface Props {
  item: Item | null
  storageLocations: StorageLocation[]
  tagGroups: TagGroup[]
  onClose: () => void
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">
      {children}
    </div>
  )
}

export default function EditItemModal({ item, storageLocations, tagGroups, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [storageId, setStorageId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    if (!item) return
    setName(item.name)
    setImageUrl(item.image_url)
    setSelectedTagIds(item.item_tags?.map(it => it.tags?.id).filter(Boolean) as string[] ?? [])
    setStorageId(item.storage_location_id)
    setNotes(item.notes ?? '')
    setFavorite(item.favorite)
  }, [item])

  const typeGroup  = tagGroups.find(g => g.name === 'Type')
  const colorGroup = tagGroups.find(g => g.name === 'Color')
  const styleGroup = tagGroups.find(g => g.name === 'Style')

  if (!item) return null

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      setImageUrl(url)
    } finally {
      setIsUploading(false)
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  function handleSave() {
    if (!name.trim() || !item) return
    const itemId = item.id
    startTransition(async () => {
      const fd = new FormData()
      fd.set('name', name.trim())
      fd.set('notes', notes)
      if (imageUrl) fd.set('image_url', imageUrl)
      if (storageId) fd.set('storage_location_id', storageId)
      fd.set('status', 'available')
      fd.set('favorite', String(favorite))
      selectedTagIds.forEach(id => fd.append('tag_ids', id))
      await updateItem(itemId, fd)
      onClose()
    })
  }

  const canSave = name.trim() && !isPending && !isUploading

  return (
    <div
      className="fixed inset-0 z-60 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(60,50,70,.28)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base-100 rounded-3xl shadow-xl w-full my-auto max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h2 className="text-lg font-bold">Edit piece</h2>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid sm:grid-cols-[200px_1fr] gap-6 max-h-[75vh] overflow-y-auto">

          {/* Left: photo + favorite */}
          <div>
            <div
              onClick={() => fileRef.current?.click()}
              className={[
                'relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors',
                'flex flex-col items-center justify-center text-center aspect-4/5 overflow-hidden',
                'border-base-300 bg-base-200/40 hover:border-primary/60',
              ].join(' ')}
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

            <label className="flex items-center gap-2 mt-3 cursor-pointer select-none px-1">
              <input
                type="checkbox"
                className="checkbox checkbox-sm rounded-md"
                checked={favorite}
                onChange={e => setFavorite(e.target.checked)}
              />
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Heart
                  size={14}
                  strokeWidth={1.8}
                  fill={favorite ? 'currentColor' : 'none'}
                  className={favorite ? 'text-primary' : ''}
                />
                Favorite
              </span>
            </label>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>

          {/* Right: fields */}
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>Name</FieldLabel>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Blush puff-sleeve blouse"
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

            <div>
              <FieldLabel>Notes</FieldLabel>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any notes…"
                rows={3}
                className="textarea textarea-bordered w-full rounded-xl resize-none text-[14px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-base-200">
          <button onClick={onClose} className="btn btn-ghost rounded-full">Cancel</button>
          <button
            disabled={!canSave}
            onClick={handleSave}
            className="btn btn-primary rounded-full gap-1 disabled:opacity-40"
          >
            {isPending
              ? <span className="loading loading-spinner loading-sm" />
              : 'Save changes'
            }
          </button>
        </div>

      </div>
    </div>
  )
}
