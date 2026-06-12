import { requireUser } from '@/lib/supabase/server'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return <>{children}</>
}
