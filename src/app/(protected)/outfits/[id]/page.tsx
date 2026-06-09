import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OutfitBuilderClient from './OutfitBuilderClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OutfitDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: outfit }, { data: slots }, { data: allItems }] = await Promise.all([
    supabase
      .from('outfits')
      .select('*, outfit_items(item_id, slot_id, items(*, storage_locations(*, base_locations(*)), item_tags(tags(*))))')
      .eq('id', id)
      .single(),
    supabase.from('outfit_slots').select('*').order('display_order'),
    supabase
      .from('items')
      .select('*, storage_locations(*, base_locations(*)), item_tags(tags(*))')
      .order('name'),
  ])

  if (!outfit) notFound()

  return (
    <OutfitBuilderClient
      outfit={outfit as never}
      slots={slots ?? []}
      allItems={allItems as never ?? []}
    />
  )
}
