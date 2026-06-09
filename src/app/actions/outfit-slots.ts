'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOutfitSlot(name: string, display_order: number, allow_multiple: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  const { error } = await supabase.from('outfit_slots').insert({ name, display_order, allow_multiple, created_by: user.id })
  if (error) throw error
  revalidatePath('/outfits')
}

export async function updateOutfitSlot(id: string, name: string, display_order: number, allow_multiple: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('outfit_slots').update({ name, display_order, allow_multiple }).eq('id', id)
  if (error) throw error
  revalidatePath('/outfits')
}

export async function deleteOutfitSlot(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('outfit_slots').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/outfits')
}

// Place an item into a slot within an outfit.
// For single-item slots, replaces any existing assignment for that slot.
export async function setSlotItem(outfitId: string, slotId: string, itemId: string, allowMultiple: boolean) {
  const supabase = await createClient()

  if (!allowMultiple) {
    // Remove any existing item in this slot for this outfit
    await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', outfitId)
      .eq('slot_id', slotId)
  }

  // Avoid duplicates if allowMultiple
  const { data: existing } = await supabase
    .from('outfit_items')
    .select('item_id')
    .eq('outfit_id', outfitId)
    .eq('slot_id', slotId)
    .eq('item_id', itemId)
    .maybeSingle()

  if (!existing) {
    const { error } = await supabase.from('outfit_items').insert({
      outfit_id: outfitId,
      item_id: itemId,
      slot_id: slotId,
    })
    if (error) throw error
  }

  revalidatePath(`/outfits/${outfitId}`)
}

export async function removeSlotItem(outfitId: string, slotId: string | null, itemId: string) {
  const supabase = await createClient()
  let q = supabase
    .from('outfit_items')
    .delete()
    .eq('outfit_id', outfitId)
    .eq('item_id', itemId)
  if (slotId) {
    q = q.eq('slot_id', slotId)
  }
  const { error } = await q
  if (error) throw error
  revalidatePath(`/outfits/${outfitId}`)
}
