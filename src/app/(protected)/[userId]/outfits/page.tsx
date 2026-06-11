import { createClient } from '@/lib/supabase/server'
import OutfitsClient from '../../outfits/OutfitsClient'
import type { OutfitSlot } from '@/lib/types'

interface OutfitPreview {
  id: string
  name: string
  outfit_items: { slot_id: string | null; items: { image_url: string | null; name: string } }[]
}

interface Props {
  params: Promise<{ userId: string }>
}

export default async function OutfitsPage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()

  const [{ data: rawOutfits }, { data: rawSlots }] = await Promise.all([
    supabase
      .from('outfits')
      .select('*, outfit_items(slot_id, items(image_url, name))')
      .eq('created_by', userId)
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
