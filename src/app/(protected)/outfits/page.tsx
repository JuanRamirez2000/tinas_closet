import { createClient } from '@/lib/supabase/server'
import OutfitsClient from './OutfitsClient'
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

  return (
    <OutfitsClient
      outfits={(rawOutfits ?? []) as unknown as OutfitPreview[]}
      slots={(rawSlots ?? []) as OutfitSlot[]}
    />
  )
}
