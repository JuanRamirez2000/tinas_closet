'use client'

import { memo } from 'react'
import { MapPin, Heart, Check, Pencil, Trash2 } from 'lucide-react'
import PhotoTile from './PhotoTile'
import { getItemType, getItemColors } from '@/lib/item-tags'
import type { Item, TagGroup } from '@/lib/types'

interface Props {
  item: Item
  tagGroups?: TagGroup[]
  selecting?: boolean
  selected?: boolean
  onTap?: (item: Item) => void
  onToggleFav?: (item: Item) => void
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
}

function ItemCard({
  item, tagGroups, selecting, selected,
  onTap, onToggleFav, onEdit, onDelete,
}: Props) {
  const typeGroup  = tagGroups?.find(g => g.name === 'Type')
  const colorGroup = tagGroups?.find(g => g.name === 'Color')
  const type   = getItemType(item, typeGroup)
  const colors = getItemColors(item, colorGroup)

  const storage = item.storage_locations
  const locationLabel = storage
    ? `${storage.name}${storage.base_locations ? ` · ${storage.base_locations.name}` : ''}`
    : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onTap?.(item)}
      onKeyDown={e => e.key === 'Enter' && onTap?.(item)}
      className="text-left group relative cursor-pointer outline-none bg-base-100 rounded-[1.1rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <PhotoTile
          imageUrl={item.image_url}
          name={item.name}
          itemType={type}
          itemColors={colors}
          className="w-full aspect-[3/4]"
          radius="0"
        />

        {/* Edit + delete — top left, appear on hover */}
        {!selecting && (onEdit || onDelete) && (
          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={e => { e.stopPropagation(); onEdit(item) }}
                className="w-7 h-7 rounded-full bg-base-100/90 backdrop-blur-sm flex items-center justify-center text-base-content/70 hover:text-primary shadow-sm"
                aria-label="Edit"
              >
                <Pencil size={13} strokeWidth={1.8} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(item) }}
                className="w-7 h-7 rounded-full bg-base-100/90 backdrop-blur-sm flex items-center justify-center text-base-content/70 hover:text-error shadow-sm"
                aria-label="Delete"
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </button>
            )}
          </div>
        )}

        {/* Favorite — top right */}
        {!selecting && onToggleFav && (
          <button
            onClick={e => { e.stopPropagation(); onToggleFav(item) }}
            className={[
              'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center',
              'backdrop-blur-sm shadow-sm transition-opacity',
              item.favorite
                ? 'bg-base-100/85 text-primary opacity-100'
                : 'bg-base-100/55 text-base-content/55 opacity-0 group-hover:opacity-100',
            ].join(' ')}
            aria-label={item.favorite ? 'Unfavorite' : 'Favorite'}
          >
            <Heart size={14} strokeWidth={1.8} fill={item.favorite ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Selection check */}
        {selecting && (
          <span
            className={[
              'absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors',
              selected ? 'bg-primary border-primary text-primary-content' : 'bg-base-100/70 border-base-100',
            ].join(' ')}
          >
            {selected && <Check size={16} strokeWidth={2.3} />}
          </span>
        )}

        {selecting && selected && (
          <span className="absolute inset-0 ring-[3px] ring-primary ring-inset pointer-events-none" />
        )}
      </div>

      <div className="px-3 py-2.5">
        <div className="text-[13.5px] font-medium leading-tight truncate">{item.name}</div>
        {locationLabel && (
          <div className="flex items-center gap-1 text-[11.5px] text-base-content/45 mt-0.5">
            <MapPin size={11} strokeWidth={1.7} />
            <span className="truncate">{locationLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(ItemCard)
