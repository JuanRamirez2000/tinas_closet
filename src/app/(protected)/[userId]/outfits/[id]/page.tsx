import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OutfitBuilderClient from '../../../outfits/[id]/OutfitBuilderClient'
import type { Item, OutfitSlot } from '@/lib/types'

interface Props {
  params: Promise<{ userId: string; id: string }>
}

export default async function OutfitPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: outfit }, { data: rawSlots }, { data: rawItems }] = await Promise.all([
    supabase
      .from('outfits')
      .select('*, outfit_items(item_id, slot_id, items(*, storage_locations(*, base_locations(*)), item_tags(tags(*))))')
      .eq('id', id)
      .single(),
    supabase.from('outfit_slots').select('*').order('display_order'),
    supabase.from('items').select('*, storage_locations(*, base_locations(*)), item_tags(tags(*))').order('created_at', { ascending: false }),
  ])

  if (!outfit) notFound()

  return (
    <OutfitBuilderClient
      outfit={outfit as never}
      slots={(rawSlots ?? []) as OutfitSlot[]}
      allItems={(rawItems ?? []) as unknown as Item[]}
    />
  )
}
