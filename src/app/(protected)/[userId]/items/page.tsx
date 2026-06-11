import { createClient } from '@/lib/supabase/server'
import WardrobeClient from '../../items/WardrobeClient'
import type { Item, TagGroup, StorageLocation } from '@/lib/types'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function ItemsPage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()

  const [itemsResult, storageResult, tagGroupsResult] = await Promise.all([
    supabase
      .from('items')
      .select('*, storage_locations(*, base_locations(*)), item_tags(tags(*))')
      .eq('created_by', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('storage_locations')
      .select('*, base_locations(*)')
      .order('name'),
    supabase
      .from('tag_groups')
      .select('*, tags(*)')
      .order('name'),
  ])

  return (
    <WardrobeClient
      items={(itemsResult.data ?? []) as unknown as Item[]}
      storageLocations={(storageResult.data ?? []) as unknown as StorageLocation[]}
      tagGroups={(tagGroupsResult.data ?? []) as unknown as TagGroup[]}
      locationCount={(storageResult.data ?? []).length}
    />
  )
}
