import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ManageRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  redirect(`/${user!.id}/manage`)
}
