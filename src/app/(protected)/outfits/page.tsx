import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import NewOutfitButton from './NewOutfitButton'
import PhotoTile from '@/components/PhotoTile'
import type { OutfitSlot } from '@/lib/types'

interface OutfitPreview {
  id: string
  name: string
  outfit_items: { slot_id: string | null; items: { image_url: string | null; name: string } }[]
}

export default async function OutfitsPage() {
  const supabase = await createClient()

  const [{ data: rawOutfits }, { data: rawSlots }] = await Promise.all([
    supabase
      .from('outfits')
      .select('*, outfit_items(slot_id, items(image_url, name))')
      .order('name'),
    supabase.from('outfit_slots').select('*').order('display_order'),
  ])

  const outfits = (rawOutfits ?? []) as unknown as OutfitPreview[]
  const slots = (rawSlots ?? []) as OutfitSlot[]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[26px] leading-none">Outfits</h1>
          <p className="text-[12px] text-base-content/45 mt-1">{outfits.length} saved</p>
        </div>
        <NewOutfitButton />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {outfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-8">
            <div className="text-6xl mb-4">👗</div>
            <h3 className="font-serif text-xl mb-1">No outfits yet</h3>
            <p className="text-[13.5px] text-base-content/50 max-w-[230px] mb-5">
              Create an outfit and fill the slots with pieces from your wardrobe.
            </p>
            <NewOutfitButton className="btn btn-primary rounded-full gap-1.5">
              <Plus size={17} strokeWidth={2.2} /> New outfit
            </NewOutfitButton>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            {outfits.map(outfit => {
              const slotThumbs = slots.map(slot => {
                const match = outfit.outfit_items.find(oi => oi.slot_id === slot.id)
                return { slot, item: match?.items ?? null }
              })

              return (
                <Link
                  key={outfit.id}
                  href={`/outfits/${outfit.id}`}
                  className="bg-base-100 border border-base-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors"
                >
                  <span className="font-medium text-[15px]">{outfit.name}</span>
                  <div className="flex gap-2 overflow-x-auto no-sb pb-1 -mb-1">
                    {slotThumbs.map(({ slot, item }) => (
                      <div key={slot.id} className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-12 h-[58px]">
                          {item ? (
                            <PhotoTile
                              imageUrl={item.image_url}
                              name={item.name}
                              className="w-full h-full"
                              radius="0.55rem"
                            />
                          ) : (
                            <div className="w-full h-full rounded-[0.55rem] bg-base-200 flex items-center justify-center text-base-content/25 text-lg">
                              —
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-base-content/40 truncate max-w-12">{slot.name}</span>
                      </div>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
