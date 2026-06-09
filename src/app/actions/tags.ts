'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTagGroup(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('tag_groups')
    .insert({ name, created_by: user.id, is_system: false })
  if (error) throw error
  revalidatePath('/tags')
}

export async function updateTagGroup(id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tag_groups').update({ name }).eq('id', id)
  if (error) throw error
  revalidatePath('/tags')
}

export async function deleteTagGroup(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tag_groups').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/tags')
}

export async function createTag(group_id: string, value: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tags').insert({ group_id, value })
  if (error) throw error
  revalidatePath('/tags')
}

export async function deleteTag(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/tags')
}
