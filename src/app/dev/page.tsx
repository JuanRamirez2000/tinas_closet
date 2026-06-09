import { devItems, devTagGroups } from '@/lib/dev-seed'
import Link from 'next/link'
import ItemCard from '@/components/ItemCard'

export default function DevHomePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[26px] leading-none">Tina&apos;s Closet</h1>
        <Link href="/dev/quick-add" className="btn btn-primary btn-sm rounded-full">+ Add</Link>
      </div>
      <p className="text-xs text-base-content/50 -mt-2">
        Dev mode — seeded items, no auth.
      </p>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {devItems.map(item => (
          <ItemCard
            key={item.id}
            item={item as never}
            tagGroups={devTagGroups}
          />
        ))}
      </div>
      <div className="divider">Dev pages</div>
      <div className="flex flex-wrap gap-2">
        {[
          ['/dev/quick-add', 'Quick add'],
          ['/dev/outfits', 'Outfits'],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="btn btn-outline btn-sm">{label}</Link>
        ))}
      </div>
    </div>
  )
}
