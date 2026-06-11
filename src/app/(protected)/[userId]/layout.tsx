import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SettingsShell from '@/components/SettingsShell'

interface Props {
  children: React.ReactNode
  params: Promise<{ userId: string }>
}

export default async function UserClosetLayout({ children, params }: Props) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isOwnCloset = userId === user.id

  const [
    { data: loggedInMember },
    { data: loggedInProfile },
    viewingProfileResult,
  ] = await Promise.all([
    supabase.from('members').select('user_id, is_admin').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('closet_name, theme').eq('id', user.id).single(),
    isOwnCloset
      ? Promise.resolve({ data: null })
      : supabase.from('profiles').select('closet_name').eq('id', userId).single(),
  ])

  if (!loggedInMember) redirect('/not-a-member')

  // Non-admins can only view their own closet
  if (!isOwnCloset && !loggedInMember.is_admin) {
    redirect(`/${user.id}/items`)
  }

  // If admin is browsing another user's closet, verify that user exists
  if (!isOwnCloset && !viewingProfileResult.data) notFound()

  const viewingClosetName = isOwnCloset
    ? (loggedInProfile?.closet_name ?? '')
    : (viewingProfileResult.data?.closet_name ?? '')

  return (
    <SettingsShell
      initialClosetName={loggedInProfile?.closet_name ?? ''}
      initialTheme={loggedInProfile?.theme ?? 'cupcake'}
      isAdmin={loggedInMember.is_admin ?? false}
      loggedInUserId={user.id}
      viewingUserId={userId}
      viewingClosetName={viewingClosetName}
    >
      {children}
    </SettingsShell>
  )
}
