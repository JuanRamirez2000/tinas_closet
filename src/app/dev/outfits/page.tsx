import { devOutfits } from '@/lib/dev-seed'
import Link from 'next/link'

export default function DevOutfitsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Outfits</h1>
        <button className="btn btn-primary btn-sm">+ New outfit</button>
      </div>
      {devOutfits.map(outfit => (
        <Link key={outfit.id} href={`/dev/outfits/${outfit.id}`} className="card bg-base-100 border border-base-200 p-4 flex flex-row items-center justify-between">
          <span className="font-medium">{outfit.name}</span>
          <span className="text-sm text-base-content/50">{(outfit.outfit_items as unknown[])?.length ?? 0} items</span>
        </Link>
      ))}
    </div>
  )
}
