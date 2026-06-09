'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, Plus, Check } from 'lucide-react'
import Chip from '@/components/Chip'
import PhotoTile from '@/components/PhotoTile'
import type { BaseLocation, StorageLocation, TagGroup } from '@/lib/types'

interface Props {
  bases: BaseLocation[]
  storageLocations: StorageLocation[]
  tagGroups: TagGroup[]
  onSave: (formData: FormData) => Promise<string | void>
}

interface SessionItem {
  id: string
  name: string
  imageUrl: string | null
  type: string | null
  colors: string[]
}

function TagRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5 px-0.5">
        {label}
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-sb pb-1 -mx-1 px-1">
        {children}
      </div>
    </div>
  )
}

export default function QuickAddClient({ bases, storageLocations, tagGroups, onSave }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const [sessionItems, setSessionItems] = useState<SessionItem[]>([])
  const [flash, setFlash] = useState(false)

  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [storageId, setStorageId] = useState<string | null>(storageLocations[0]?.id ?? null)

  const typeGroup  = tagGroups.find(g => g.name === 'Type')
  const colorGroup = tagGroups.find(g => g.name === 'Color')
  const styleGroup = tagGroups.find(g => g.name === 'Style')

  const selectedType   = typeGroup?.tags?.find(t => selectedTagIds.includes(t.id))
  const selectedColors = colorGroup?.tags?.filter(t => selectedTagIds.includes(t.id)).map(t => t.value) ?? []

  const SINGULAR: Record<string, string> = {
    Tops: 'top', Bottoms: 'bottoms', Dresses: 'dress', Outerwear: 'layer',
    Shoes: 'shoes', Bags: 'bag', Activewear: 'activewear', Accessories: 'accessory',
  }
  const autoName    = `${selectedColors[0] ? selectedColors[0] + ' ' : ''}${SINGULAR[selectedType?.value ?? ''] ?? 'piece'}`
  const displayName = name.trim() || autoName
  const canSave     = selectedType || name.trim() || imageUrl

  async function handleFileChange(file: File) {
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
    if (!canSave) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('name', displayName)
      if (imageUrl) fd.set('image_url', imageUrl)
      if (storageId) fd.set('storage_location_id', storageId)
      fd.set('status', 'available')
      selectedTagIds.forEach(id => fd.append('tag_ids', id))

      await onSave(fd)

      setSessionItems(prev => [
        { id: Date.now().toString(), name: displayName, imageUrl, type: selectedType?.value ?? null, colors: selectedColors },
        ...prev,
      ])

      setName(''); setImageUrl(null); setSelectedTagIds([])
      if (fileRef.current) fileRef.current.value = ''
      setFlash(true)
      setTimeout(() => setFlash(false), 1100)
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between shrink-0">
        <button onClick={() => router.push('/items')} className="btn btn-sm btn-ghost rounded-full -ml-2">
          Done
        </button>
        <h1 className="font-serif text-[20px] whitespace-nowrap">Quick add</h1>
        <span className="text-[12px] font-medium text-base-content/55 bg-base-200 rounded-full px-2.5 py-1 tabular-nums">
          {sessionItems.length} added
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-40">
        {/* Photo area */}
        <div className="relative">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-[1.3rem] overflow-hidden relative block"
            style={{ aspectRatio: '5/4' }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-base-200/70 border-2 border-dashed border-base-300 text-base-content/45">
                <span className="w-14 h-14 rounded-full bg-base-100 flex items-center justify-center text-primary shadow-sm">
                  {isUploading
                    ? <span className="loading loading-spinner loading-md" />
                    : <Camera size={26} strokeWidth={1.7} />
                  }
                </span>
                <span className="text-[14px] font-medium text-base-content/60">Take or upload a photo</span>
                <span className="font-mono text-[10px] uppercase tracking-wide text-base-content/40">tap to capture</span>
              </div>
            )}
          </button>

          {imageUrl && (
            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
              <button
                onClick={() => fileRef.current?.click()}
                className="px-3 h-8 rounded-full bg-base-100/90 backdrop-blur-sm text-[12px] font-medium shadow"
              >
                Change
              </button>
              <button
                onClick={() => setImageUrl(null)}
                className="w-8 h-8 rounded-full bg-base-100/90 backdrop-blur-sm flex items-center justify-center shadow"
              >
                <X size={15} strokeWidth={2.1} />
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }}
          />
        </div>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={canSave ? `${autoName} (optional name)` : 'Name (optional)'}
          className="mt-4 mb-1 w-full bg-transparent text-[17px] font-serif border-b border-base-300 focus:border-primary outline-none pb-2 placeholder:text-base-content/30 placeholder:font-sans placeholder:text-[15px]"
        />

        <div className="mt-4">
          {typeGroup && (typeGroup.tags ?? []).length > 0 && (
            <TagRow label="Type">
              {(typeGroup.tags ?? []).map(tag => (
                <Chip key={tag.id} active={selectedTagIds.includes(tag.id)} onClick={() => toggleTag(tag.id)} size="sm">
                  {tag.value}
                </Chip>
              ))}
            </TagRow>
          )}

          {colorGroup && (colorGroup.tags ?? []).length > 0 && (
            <TagRow label="Color">
              {(colorGroup.tags ?? []).map(tag => (
                <Chip key={tag.id} color={tag.value} active={selectedTagIds.includes(tag.id)} onClick={() => toggleTag(tag.id)} size="sm">
                  {tag.value}
                </Chip>
              ))}
            </TagRow>
          )}

          {styleGroup && (styleGroup.tags ?? []).length > 0 && (
            <TagRow label="Style">
              {(styleGroup.tags ?? []).map(tag => (
                <Chip key={tag.id} active={selectedTagIds.includes(tag.id)} onClick={() => toggleTag(tag.id)} size="sm">
                  {tag.value}
                </Chip>
              ))}
            </TagRow>
          )}

          <TagRow label="Where it lives">
            {storageLocations.map(loc => {
              const base = bases.find(b => b.id === loc.base_id)
              return (
                <Chip key={loc.id} active={storageId === loc.id} onClick={() => setStorageId(loc.id)} size="sm">
                  {loc.name}{base ? ` · ${base.name}` : ''}
                </Chip>
              )
            })}
          </TagRow>
        </div>

        {/* Session strip */}
        {sessionItems.length > 0 && (
          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-2 px-0.5">
              Added this session
            </div>
            <div className="flex gap-2 overflow-x-auto no-sb -mx-1 px-1">
              {sessionItems.map(it => (
                <div key={it.id} className="shrink-0 w-14">
                  <PhotoTile
                    imageUrl={it.imageUrl}
                    name={it.name}
                    itemType={it.type}
                    itemColors={it.colors}
                    className="w-14 h-[68px]"
                    radius="0.6rem"
                  />
                  <div className="text-[10px] truncate text-base-content/50 mt-0.5 px-0.5">{it.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="fixed left-0 right-0 bottom-0 px-4 pb-8 pt-3 bg-gradient-to-t from-base-100 via-base-100/95 to-transparent z-20 pointer-events-none">
        {flash && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-neutral text-neutral-content text-[13px] font-medium px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-[pop_.3s_ease] pointer-events-auto">
            <Check size={15} strokeWidth={2.3} /> Added
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={!canSave || isPending || isUploading}
          className="btn btn-primary w-full rounded-2xl h-[52px] text-[15px] gap-2 disabled:opacity-40 shadow-sm pointer-events-auto"
        >
          {isPending
            ? <span className="loading loading-spinner loading-sm" />
            : <><Plus size={19} strokeWidth={2.2} /> Save &amp; add another</>
          }
        </button>
      </div>
    </div>
  )
}
