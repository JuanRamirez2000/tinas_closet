'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return { supabase, user }
}

export async function saveSettings(data: { closet_name?: string; theme?: string }) {
  const { supabase, user } = await getUser()
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)
  if (error) throw error
  revalidatePath('/', 'layout')
}
