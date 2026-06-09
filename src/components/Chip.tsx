import ColorDot from './ColorDot'

interface Props {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  color?: string
  size?: 'sm' | 'md'
  type?: 'button' | 'submit' | 'reset'
}

export default function Chip({ children, active, onClick, color, size = 'md', type = 'button' }: Props) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3.5 py-2 text-[13px]'
  return (
    <button
      type={type}
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium border transition-colors whitespace-nowrap',
        pad,
        active
          ? 'bg-primary text-primary-content border-primary'
          : 'bg-base-100 text-base-content/75 border-base-300 hover:border-base-content/30',
      ].join(' ')}
    >
      {color && <ColorDot name={color} size={13} />}
      {children}
    </button>
  )
}
