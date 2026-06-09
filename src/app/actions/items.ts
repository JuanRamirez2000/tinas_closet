'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const name = formData.get('name') as string
  const notes = formData.get('notes') as string | null
  const image_url = formData.get('image_url') as string | null
  const storage_location_id = formData.get('storage_location_id') as string | null
  const status = formData.get('status') as string | null
  const tagIds = formData.getAll('tag_ids') as string[]

  const { data: item, error } = await supabase
    .from('items')
    .insert({ name, notes, image_url, storage_location_id, status, created_by: user.id })
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

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

  // Replace all tags for this item
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
  const supabase = await createClient()
  const { error } = await supabase.from('items').delete().eq('id', itemId)
  if (error) throw error
  revalidatePath('/items')
}

export async function bulkMoveItems(itemIds: string[], storageLocationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('items')
    .update({ storage_location_id: storageLocationId })
    .in('id', itemIds)
  if (error) throw error
  revalidatePath('/items')
}

export async function toggleFavorite(itemId: string, favorite: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('items').update({ favorite }).eq('id', itemId)
  if (error) throw error
  revalidatePath('/items')
  revalidatePath(`/items/${itemId}`)
}
