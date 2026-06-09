import { colorHex } from '@/lib/closet-colors'

interface Props {
  name: string
  size?: number
}

export default function ColorDot({ name, size = 14 }: Props) {
  const hex = colorHex(name)
  const style =
    hex === 'conic'
      ? { background: 'conic-gradient(from 30deg,#e7c3bf,#cda23f,#a7b79e,#b7cfe0,#c1b2d6,#e7c3bf)' }
      : { background: hex }
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{ width: size, height: size, ...style, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)' }}
    />
  )
}
