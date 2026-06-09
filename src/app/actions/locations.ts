'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBaseLocation(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('base_locations')
    .insert({ name, created_by: user.id })
  if (error) throw error
  revalidatePath('/locations')
}

export async function updateBaseLocation(id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('base_locations')
    .update({ name })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/locations')
}

export async function deleteBaseLocation(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('base_locations').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/locations')
}

export async function createStorageLocation(base_id: string, name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('storage_locations')
    .insert({ base_id, name, created_by: user.id })
  if (error) throw error
  revalidatePath('/locations')
}

export async function updateStorageLocation(id: string, base_id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('storage_locations')
    .update({ base_id, name })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/locations')
}

export async function deleteStorageLocation(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('storage_locations').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/locations')
}
