import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignInButton from './SignInButton'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/items')

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body items-center text-center gap-6">
          <h1 className="text-3xl font-bold">Tina&apos;s Closet</h1>
          <p className="text-base-content/60">Shared wardrobe for two</p>
          <SignInButton />
        </div>
      </div>
    </main>
  )
}
