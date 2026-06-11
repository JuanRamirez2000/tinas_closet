import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ItemDetailClient from '../../../items/[id]/ItemDetailClient'

interface Props {
  params: Promise<{ userId: string; id: string }>
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: item },
    { data: bases },
    { data: storageLocations },
    { data: tagGroups },
  ] = await Promise.all([
    supabase
      .from('items')
      .select('*, storage_locations(*, base_locations(*)), item_tags(tags(*))')
      .eq('id', id)
      .single(),
    supabase.from('base_locations').select('*').order('name'),
    supabase.from('storage_locations').select('*, base_locations(*)').order('name'),
    supabase.from('tag_groups').select('*, tags(*)').order('name'),
  ])

  if (!item) notFound()

  return (
    <ItemDetailClient
      item={item as never}
      bases={bases ?? []}
      storageLocations={storageLocations as never ?? []}
      tagGroups={tagGroups as never ?? []}
    />
  )
}
