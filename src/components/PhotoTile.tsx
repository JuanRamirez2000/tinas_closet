import { colorHex } from '@/lib/closet-colors'
import GarmentGlyph from './GarmentGlyph'
import type { CSSProperties } from 'react'

interface Props {
  imageUrl?: string | null
  name?: string
  itemType?: string | null
  itemColors?: string[]
  radius?: string
  className?: string
  style?: CSSProperties
}

export default function PhotoTile({
  imageUrl,
  name,
  itemType,
  itemColors = [],
  radius = '1rem',
  className = '',
  style,
}: Props) {
  if (imageUrl) {
    return (
      <div
        className={`overflow-hidden bg-base-200 ${className}`}
        style={{ borderRadius: radius, ...style }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name ?? ''} className="w-full h-full object-cover" />
      </div>
    )
  }

  const primaryColor = itemColors[0] ?? 'Cream'
  const hex = colorHex(primaryColor)
  const isMulti = hex === 'conic'

  const bg = isMulti
    ? 'conic-gradient(from 30deg,#f0dad7,#efe0bf,#dde6d4,#dce8f0,#e4dcef,#f0dad7)'
    : `color-mix(in srgb, ${hex} 34%, #f6f2ea)`

  const glyphColor = isMulti
    ? '#9a8f86'
    : `color-mix(in srgb, ${hex} 62%, #6a5b50)`

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: bg, borderRadius: radius, ...style }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,.4) 0 14px, transparent 14px 28px)',
        }}
      />
      <div className="relative opacity-70" style={{ color: glyphColor }}>
        <GarmentGlyph type={itemType ?? 'Tops'} size={46} color={glyphColor} />
      </div>
    </div>
  )
}
