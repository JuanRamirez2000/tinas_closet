'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Layers, Settings2, Plus } from 'lucide-react'
import { useLoggedInUserId } from '@/context/user'
import { useShellSettings } from '@/context/shell'

interface Props {
  isAdmin?: boolean
}

export default function BottomNav({ isAdmin = false }: Props) {
  const pathname = usePathname()
  const loggedInUserId = useLoggedInUserId()
  const { setQuickAddOpen } = useShellSettings()

  const isWardrobe = pathname.includes('/items')
  const isOutfits  = pathname.includes('/outfits')
  const isManage   = pathname.includes('/manage')

  const active   = 'text-primary'
  const inactive = 'text-base-content/45'

  return (
    <nav className="fixed left-0 right-0 bottom-0 z-30 lg:hidden">
      <div
        className="flex items-center px-4 py-2 gap-2"
        style={{
          background: 'color-mix(in oklab, var(--color-base-100) 92%, transparent)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--color-base-300)',
        }}
      >
        <Link
          href={`/${loggedInUserId}/items`}
          className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-colors ${isWardrobe ? active : inactive}`}
        >
          <LayoutGrid size={22} strokeWidth={1.9} />
          <span className="text-[10.5px] font-medium">Wardrobe</span>
        </Link>

        <Link
          href={`/${loggedInUserId}/outfits`}
          className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-colors ${isOutfits ? active : inactive}`}
        >
          <Layers size={22} strokeWidth={1.9} />
          <span className="text-[10.5px] font-medium">Outfits</span>
        </Link>

        {isAdmin ? (
          <button
            onClick={() => setQuickAddOpen(true)}
            className="shrink-0 -mt-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-primary text-primary-content"
            aria-label="Quick add"
          >
            <Plus size={26} strokeWidth={2.2} />
          </button>
        ) : (
          <div className="shrink-0 w-14" />
        )}

        <Link
          href={`/${loggedInUserId}/manage`}
          className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-colors ${isManage ? active : inactive}`}
        >
          <Settings2 size={22} strokeWidth={1.9} />
          <span className="text-[10.5px] font-medium">Manage</span>
        </Link>

        {/* Spacer to balance the FAB */}
        <div className="flex-1" />
      </div>
    </nav>
  )
}
