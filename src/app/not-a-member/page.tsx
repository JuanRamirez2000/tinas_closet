import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'

export default async function NotAMemberPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body items-center text-center gap-4">
          <h1 className="text-xl font-bold">Access Pending</h1>
          <p className="text-base-content/70 text-sm">
            You&apos;re signed in but haven&apos;t been added to the closet yet.
          </p>
          <div className="bg-base-200 rounded-lg p-3 w-full text-left text-xs font-mono break-all">
            {user?.id}
          </div>
          <p className="text-base-content/60 text-xs">
            Share your ID above with the other member, who should run:
          </p>
          <code className="text-xs bg-base-200 rounded p-2 w-full">
            INSERT INTO members (user_id) VALUES (&apos;{user?.id}&apos;);
          </code>
          <SignOutButton />
        </div>
      </div>
    </main>
  )
}
