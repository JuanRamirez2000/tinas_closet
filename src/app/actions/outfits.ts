'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOutfit(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { data, error } = await supabase
    .from('outfits')
    .insert({ name, created_by: user.id })
    .select('id')
    .single()
  if (error) throw error
  revalidatePath('/outfits')
  return data.id
}

export async function updateOutfit(id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('outfits').update({ name }).eq('id', id)
  if (error) throw error
  revalidatePath('/outfits')
}

export async function deleteOutfit(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('outfits').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/outfits')
}

export async function addItemToOutfit(outfitId: string, itemId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('outfit_items')
    .insert({ outfit_id: outfitId, item_id: itemId })
  if (error) throw error
  revalidatePath(`/outfits/${outfitId}`)
}

export async function removeItemFromOutfit(outfitId: string, itemId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('outfit_items')
    .delete()
    .eq('outfit_id', outfitId)
    .eq('item_id', itemId)
  if (error) throw error
  revalidatePath(`/outfits/${outfitId}`)
}

export async function uploadPhoto(file: File, itemId: string): Promise<string> {
  const supabase = await createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${itemId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('items').upload(path, file, {
    contentType: file.type,
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from('items').getPublicUrl(path)
  return data.publicUrl
}
