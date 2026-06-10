'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return { supabase, user }
}

export async function createOutfit(name: string) {
  const { supabase, user } = await getUser()

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
  const { supabase } = await getUser()
  const { error } = await supabase.from('outfits').update({ name }).eq('id', id)
  if (error) throw error
  revalidatePath('/outfits')
}

export async function deleteOutfit(id: string) {
  const { supabase } = await getUser()
  const { error } = await supabase.from('outfits').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/outfits')
}

export async function addItemToOutfit(outfitId: string, itemId: string) {
  const { supabase } = await getUser()
  const { error } = await supabase
    .from('outfit_items')
    .insert({ outfit_id: outfitId, item_id: itemId })
  if (error) throw error
  revalidatePath(`/outfits/${outfitId}`)
}

export async function removeItemFromOutfit(outfitId: string, itemId: string) {
  const { supabase } = await getUser()
  const { error } = await supabase
    .from('outfit_items')
    .delete()
    .eq('outfit_id', outfitId)
    .eq('item_id', itemId)
  if (error) throw error
  revalidatePath(`/outfits/${outfitId}`)
}
