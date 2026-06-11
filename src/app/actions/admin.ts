'use server'

import { createClient } from '@/lib/supabase/server'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return { supabase, user }
}

async function assertAdmin() {
  const { supabase, user } = await getUser()
  const { data } = await supabase
    .from('members')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!data?.is_admin) throw new Error('Unauthorized')
  return { supabase, user }
}

export type MemberInfo = { user_id: string; email: string; is_admin: boolean }
export type PendingUser = { id: string; email: string }

export async function getAdminData(): Promise<{
  members: MemberInfo[]
  pending: PendingUser[]
}> {
  const { supabase } = await assertAdmin()
  const [{ data: members }, { data: pending }] = await Promise.all([
    supabase.rpc('get_members'),
    supabase.rpc('get_pending_members'),
  ])
  return {
    members: (members as MemberInfo[]) ?? [],
    pending: (pending as PendingUser[]) ?? [],
  }
}

export async function approveMember(targetUserId: string) {
  await assertAdmin()
  const { supabase } = await getUser()
  const { error } = await supabase.rpc('add_member', { target_user_id: targetUserId })
  if (error) throw error
}
