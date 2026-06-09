import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import SideNav from '@/components/SideNav'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) redirect('/not-a-member')

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <SideNav />
      <main className="flex-1 min-w-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
