'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Layers, Settings2, Plus } from 'lucide-react'

export default function SideNav() {
  const pathname = usePathname()
  const isWardrobe = pathname.startsWith('/items') || pathname === '/'
  const isOutfits  = pathname.startsWith('/outfits')
  const isManage   = pathname.startsWith('/manage')

  return (
    <nav
      className="hidden lg:flex items-center gap-1 h-14 px-6 bg-base-100 shrink-0 sticky top-0 z-30"
      style={{ borderBottom: '1.5px solid var(--color-base-300)' }}
    >
      <span className="font-serif text-[20px] leading-none mr-5">Tina&apos;s Closet</span>

      <div className="flex items-center gap-0.5 flex-1">
        <NavLink href="/items" active={isWardrobe} icon={<LayoutGrid size={17} strokeWidth={1.9} />}>
          Wardrobe
        </NavLink>
        <NavLink href="/outfits" active={isOutfits} icon={<Layers size={17} strokeWidth={1.9} />}>
          Outfits
        </NavLink>
        <NavLink href="/manage" active={isManage} icon={<Settings2 size={17} strokeWidth={1.9} />}>
          Manage
        </NavLink>
      </div>

      <Link
        href="/quick-add"
        className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-content text-[13.5px] font-medium transition-opacity hover:opacity-90"
      >
        <Plus size={16} strokeWidth={2.2} />
        Add piece
      </Link>
    </nav>
  )
}

function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13.5px] font-medium transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-base-content/55 hover:bg-base-200/80 hover:text-base-content/80'
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}
