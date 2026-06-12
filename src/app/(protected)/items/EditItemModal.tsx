'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Trash2, AlertTriangle } from 'lucide-react'
import FieldLabel from '@/components/FieldLabel'
import Dialog from '@/components/Dialog'
import PhotoUploadBox from '@/components/PhotoUploadBox'
import TagChipGroup from '@/components/TagChipGroup'
import Chip from '@/components/Chip'
import { usePhotoUpload } from '@/hooks/usePhotoUpload'
import { useToggleSet } from '@/hooks/useToggleSet'
import { updateItem, deleteItem } from '@/app/actions/items'
import type { Item, StorageLocation, TagGroup } from '@/lib/types'

interface Props {
  item: Item | null
  storageLocations: StorageLocation[]
  tagGroups: TagGroup[]
  onClose: () => void
}

export default function EditItemModal({ item, storageLocations, tagGroups, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { upload, isUploading } = usePhotoUpload()

  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [selectedTagIds, toggleTag, setSelectedTagIds] = useToggleSet([])
  const [storageId, setStorageId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (!item) return
    setName(item.name)
    setImageUrl(item.image_url)
    setSelectedTagIds(item.item_tags?.map(it => it.tags?.id).filter(Boolean) as string[] ?? [])
    setStorageId(item.storage_location_id)
    setNotes(item.notes ?? '')
    setFavorite(item.favorite)
  }, [item, setSelectedTagIds])

  const typeGroup   = tagGroups.find(g => g.name === 'Type')
  const colorGroup  = tagGroups.find(g => g.name === 'Color')
  const styleGroup  = tagGroups.find(g => g.name === 'Style')
  const seasonGroup = tagGroups.find(g => g.name === 'Season')

  if (!item) return null

  async function handleFile(file: File) {
    const url = await upload(file)
    if (url) setImageUrl(url)
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

  function handleDelete() {
    if (!item) return
    const itemId = item.id
    startTransition(async () => {
      await deleteItem(itemId)
      onClose()
      router.refresh()
    })
  }

  const canSave = name.trim() && !isPending && !isUploading

  return (
    <Dialog size="lg" title="Edit piece" onClose={onClose}>

      {/* Body */}
      <div className="p-6 grid sm:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] gap-6 max-h-[75vh] overflow-y-auto">

        {/* Left: photo + favorite */}
        <div>
          <PhotoUploadBox
            value={imageUrl}
            onChange={setImageUrl}
            isUploading={isUploading}
            onFilePick={handleFile}
          />

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

          <TagChipGroup group={typeGroup} selectedIds={selectedTagIds} onToggle={toggleTag} />
          <TagChipGroup group={colorGroup} selectedIds={selectedTagIds} onToggle={toggleTag} withColor />
          <TagChipGroup group={styleGroup} selectedIds={selectedTagIds} onToggle={toggleTag} />
          <TagChipGroup group={seasonGroup} selectedIds={selectedTagIds} onToggle={toggleTag} />

          {storageLocations.length > 0 && (
            <div>
              <FieldLabel>Where it lives</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {storageLocations.map(loc => (
                  <Chip key={loc.id} size="sm" active={storageId === loc.id} onClick={() => setStorageId(loc.id)}>
                    {loc.name}{loc.base_locations ? ` · ${loc.base_locations.name}` : ''}
                  </Chip>
                ))}
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
      {confirmingDelete ? (
        <div className="px-6 py-4 border-t border-base-200 bg-error/5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={18} strokeWidth={1.8} className="text-error mt-0.5 shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-error">Delete &quot;{item?.name}&quot;?</p>
              <p className="text-[12.5px] text-base-content/55 mt-0.5">This cannot be undone.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmingDelete(false)} className="btn btn-ghost rounded-full btn-sm">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="btn btn-error rounded-full btn-sm gap-1.5 disabled:opacity-40"
            >
              {isPending ? <span className="loading loading-spinner loading-xs" /> : <><Trash2 size={14} strokeWidth={1.8} /> Delete</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-base-200">
          <button
            onClick={() => setConfirmingDelete(true)}
            disabled={isPending}
            className="btn btn-ghost rounded-full text-error gap-1.5"
          >
            <Trash2 size={16} strokeWidth={1.8} />
            Delete
          </button>
          <div className="flex gap-2">
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
      )}

    </Dialog>
  )
}
