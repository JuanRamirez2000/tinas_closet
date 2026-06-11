'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return { supabase, user }
}

export async function createItem(formData: FormData, forUserId?: string) {
  const { supabase, user } = await getUser()

  const name = formData.get('name') as string
  const notes = formData.get('notes') as string | null
  const image_url = formData.get('image_url') as string | null
  const storage_location_id = formData.get('storage_location_id') as string | null
  const status = formData.get('status') as string | null
  const tagIds = formData.getAll('tag_ids') as string[]

  // Admin can create items on behalf of another user
  let created_by = user.id
  if (forUserId && forUserId !== user.id) {
    const { data: member } = await supabase.from('members').select('is_admin').eq('user_id', user.id).maybeSingle()
    if (!member?.is_admin) throw new Error('Unauthorized')
    created_by = forUserId
  }

  const { data: item, error } = await supabase
    .from('items')
    .insert({ name, notes, image_url, storage_location_id, status, created_by })
    .select('id')
    .single()

  if (error) throw error

  if (tagIds.length > 0) {
    await supabase.from('item_tags').insert(
      tagIds.map(tag_id => ({ item_id: item.id, tag_id }))
    )
  }

  revalidatePath('/items')
  return item.id
}

export async function updateItem(itemId: string, formData: FormData) {
  const { supabase } = await getUser()

  const name = formData.get('name') as string
  const notes = formData.get('notes') as string | null
  const image_url = formData.get('image_url') as string | null
  const storage_location_id = formData.get('storage_location_id') as string | null
  const status = formData.get('status') as string | null
  const favorite = formData.get('favorite') === 'true'
  const tagIds = formData.getAll('tag_ids') as string[]

  const { error } = await supabase
    .from('items')
    .update({ name, notes, image_url, storage_location_id, status, favorite })
    .eq('id', itemId)

  if (error) throw error

  await supabase.from('item_tags').delete().eq('item_id', itemId)
  if (tagIds.length > 0) {
    await supabase.from('item_tags').insert(
      tagIds.map(tag_id => ({ item_id: itemId, tag_id }))
    )
  }

  revalidatePath('/items')
  revalidatePath(`/items/${itemId}`)
}

export async function deleteItem(itemId: string) {
  const { supabase } = await getUser()
  const { error } = await supabase.from('items').delete().eq('id', itemId)
  if (error) throw error
  revalidatePath('/items')
}

export async function bulkMoveItems(itemIds: string[], storageLocationId: string) {
  const { supabase } = await getUser()
  const { error } = await supabase
    .from('items')
    .update({ storage_location_id: storageLocationId })
    .in('id', itemIds)
  if (error) throw error
  revalidatePath('/items')
}

export async function toggleFavorite(itemId: string, favorite: boolean) {
  const { supabase } = await getUser()
  const { error } = await supabase.from('items').update({ favorite }).eq('id', itemId)
  if (error) throw error
  revalidatePath('/items')
  revalidatePath(`/items/${itemId}`)
}
