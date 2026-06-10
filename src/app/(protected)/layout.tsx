import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsShell from '@/components/SettingsShell'
import type { TagGroup } from '@/lib/types'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: member }, { data: profile }, { data: rawTagGroups }] = await Promise.all([
    supabase.from('members').select('user_id').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('closet_name, theme').eq('id', user.id).single(),
    supabase.from('tag_groups').select('*, tags(*)').order('name'),
  ])

  if (!member) redirect('/not-a-member')

  return (
    <SettingsShell
      initialClosetName={profile?.closet_name ?? ''}
      initialTheme={profile?.theme ?? 'blush'}
      initialTagGroups={(rawTagGroups as TagGroup[]) ?? []}
    >
      {children}
    </SettingsShell>
  )
}
