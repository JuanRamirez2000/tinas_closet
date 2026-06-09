import { createClient } from '@/lib/supabase/server'
import ManageClient from './ManageClient'
import type { BaseLocation, OutfitSlot, StorageLocation, TagGroup } from '@/lib/types'

export default async function ManagePage() {
  const supabase = await createClient()

  const [basesResult, storageResult, tagGroupsResult, itemsResult, slotsResult] = await Promise.all([
    supabase.from('base_locations').select('*').order('name'),
    supabase.from('storage_locations').select('*, base_locations(*)').order('name'),
    supabase.from('tag_groups').select('*, tags(*)').order('name'),
    supabase.from('items').select('storage_location_id'),
    supabase.from('outfit_slots').select('*').order('display_order'),
  ])

  const bases = (basesResult.data ?? []) as BaseLocation[]
  const storageLocations = (storageResult.data ?? []) as unknown as StorageLocation[]
  const tagGroups = (tagGroupsResult.data ?? []) as unknown as TagGroup[]
  const outfitSlots = (slotsResult.data ?? []) as OutfitSlot[]

  const locationCounts: Record<string, number> = {}
  for (const item of (itemsResult.data ?? [])) {
    const locId = (item as { storage_location_id: string | null }).storage_location_id
    if (locId) locationCounts[locId] = (locationCounts[locId] ?? 0) + 1
  }

  return (
    <ManageClient
      bases={bases}
      storageLocations={storageLocations}
      tagGroups={tagGroups}
      locationCounts={locationCounts}
      outfitSlots={outfitSlots}
    />
  )
}
