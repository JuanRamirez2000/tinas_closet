import { createClient } from '@/lib/supabase/server'
import WardrobeClient from './WardrobeClient'
import type { Item, TagGroup, StorageLocation } from '@/lib/types'

export default async function ItemsPage() {
  const supabase = await createClient()

  const [itemsResult, storageResult, tagGroupsResult] = await Promise.all([
    supabase
      .from('items')
      .select('*, storage_locations(*, base_locations(*)), item_tags(tags(*))')
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

  const items = (itemsResult.data ?? []) as unknown as Item[]
  const storageLocations = (storageResult.data ?? []) as unknown as StorageLocation[]
  const tagGroups = (tagGroupsResult.data ?? []) as unknown as TagGroup[]

  return (
    <WardrobeClient
      items={items}
      storageLocations={storageLocations}
      tagGroups={tagGroups}
      locationCount={storageLocations.length}
    />
  )
}
