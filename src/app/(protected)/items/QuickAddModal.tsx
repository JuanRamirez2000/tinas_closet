'use client'

import { useState, useTransition } from 'react'
import { Check, Plus } from 'lucide-react'
import FieldLabel from '@/components/FieldLabel'
import Dialog from '@/components/Dialog'
import PhotoUploadBox from '@/components/PhotoUploadBox'
import TagChipGroup from '@/components/TagChipGroup'
import Chip from '@/components/Chip'
import { usePhotoUpload } from '@/hooks/usePhotoUpload'
import { useToggleSet } from '@/hooks/useToggleSet'
import { createItem } from '@/app/actions/items'
import type { StorageLocation, TagGroup } from '@/lib/types'

interface Props {
  open: boolean
  storageLocations: StorageLocation[]
  tagGroups: TagGroup[]
  onClose: () => void
  forUserId?: string
}

export default function QuickAddModal({ open, storageLocations, tagGroups, onClose, forUserId }: Props) {
  const [isPending, startTransition] = useTransition()
  const { upload, isUploading } = usePhotoUpload()
  const [flash, setFlash] = useState(false)

  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [selectedTagIds, toggleTag, setSelectedTagIds] = useToggleSet([])
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

  function resetForm() {
    setName('')
    setImageUrl(null)
    setSelectedTagIds([])
    setStorageId(storageLocations[0]?.id ?? null)
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
      await createItem(fd, forUserId)
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
    <Dialog size="lg" title="Add a piece" onClose={onClose}>

      {/* Body */}
      <div className="p-6 grid sm:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] gap-6 max-h-[72vh] overflow-y-auto">

        {/* Left: photo */}
        <PhotoUploadBox
          value={imageUrl}
          onChange={setImageUrl}
          isUploading={isUploading}
          onFilePick={handleFile}
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

    </Dialog>
  )
}
