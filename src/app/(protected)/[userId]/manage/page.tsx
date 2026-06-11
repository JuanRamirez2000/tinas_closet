import { createClient } from '@/lib/supabase/server'
import ManageClient from '../../manage/ManageClient'
import type { BaseLocation, OutfitSlot, StorageLocation, TagGroup } from '@/lib/types'

type MemberInfo = { user_id: string; email: string; is_admin: boolean }
type PendingUser = { id: string; email: string }

export default async function ManagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    basesResult,
    storageResult,
    tagGroupsResult,
    itemsResult,
    slotsResult,
    memberResult,
  ] = await Promise.all([
    supabase.from('base_locations').select('*').order('name'),
    supabase.from('storage_locations').select('*, base_locations(*)').order('name'),
    supabase.from('tag_groups').select('*, tags(*)').order('name'),
    supabase.from('items').select('storage_location_id'),
    supabase.from('outfit_slots').select('*').order('display_order'),
    supabase.from('members').select('is_admin').eq('user_id', user!.id).maybeSingle(),
  ])

  const isAdmin = memberResult.data?.is_admin ?? false

  const locationCounts: Record<string, number> = {}
  for (const item of (itemsResult.data ?? [])) {
    const locId = (item as { storage_location_id: string | null }).storage_location_id
    if (locId) locationCounts[locId] = (locationCounts[locId] ?? 0) + 1
  }

  let members: MemberInfo[] = []
  let pending: PendingUser[] = []
  if (isAdmin) {
    const [membersResult, pendingResult] = await Promise.all([
      supabase.rpc('get_members'),
      supabase.rpc('get_pending_members'),
    ])
    members = (membersResult.data as MemberInfo[]) ?? []
    pending = (pendingResult.data as PendingUser[]) ?? []
  }

  return (
    <ManageClient
      bases={(basesResult.data ?? []) as BaseLocation[]}
      storageLocations={(storageResult.data ?? []) as unknown as StorageLocation[]}
      tagGroups={(tagGroupsResult.data ?? []) as unknown as TagGroup[]}
      locationCounts={locationCounts}
      outfitSlots={(slotsResult.data ?? []) as OutfitSlot[]}
      isAdmin={isAdmin}
      members={members}
      pending={pending}
    />
  )
}
