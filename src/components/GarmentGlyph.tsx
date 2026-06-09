interface Props {
  type: string
  size?: number
  color?: string
}

const PATHS: Record<string, string> = {
  Tops:        'M8 5l-4 3 2 3 2-1.5V19h8V9.5L18 11l2-3-4-3-2 2H10z',
  Bottoms:     'M7 4h10v6l-1 9h-3l-1-9-1 9H8L7 10z',
  Dresses:     'M9 4l-1 4-2 2 2 2-1 7h10l-1-7 2-2-2-2-1-4z',
  Outerwear:   'M8 5L4 8l2 3 2-1v9h8v-9l2 1 2-3-4-3-2 2-2-2zM12 7v12',
  Shoes:       'M4 9c0 3 0 5 .5 6H20c.5-.6.3-2-1.5-2.6-2.5-.8-4-1.6-5.5-3.4-1-1.2-2-1-2.5 0L4 9z',
  Bags:        'M6 9h12l-1 11H7zM9 9V7a3 3 0 0 1 6 0v2',
  Activewear:  'M8 5l-4 3 2 3 2-1.5V19h8V9.5L18 11l2-3-4-3M9 5h6',
  Accessories: 'M12 4l1.8 4 4.2.5-3 3 .8 4.2L12 17.8 8.2 19.7 9 15.5l-3-3 4.2-.5z',
}

export default function GarmentGlyph({ type, size = 40, color = 'currentColor' }: Props) {
  const path = PATHS[type] ?? PATHS.Tops
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  )
}
