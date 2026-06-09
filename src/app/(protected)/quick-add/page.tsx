import { createClient } from '@/lib/supabase/server'
import QuickAddClient from './QuickAddClient'
import { createItem } from '@/app/actions/items'

export default async function QuickAddPage() {
  const supabase = await createClient()

  const [{ data: bases }, { data: storageLocations }, { data: tagGroups }] = await Promise.all([
    supabase.from('base_locations').select('*').order('name'),
    supabase.from('storage_locations').select('*, base_locations(*)').order('name'),
    supabase.from('tag_groups').select('*, tags(*)').order('name'),
  ])

  return (
    <QuickAddClient
      bases={bases ?? []}
      storageLocations={storageLocations as never ?? []}
      tagGroups={tagGroups as never ?? []}
      onSave={createItem}
    />
  )
}
