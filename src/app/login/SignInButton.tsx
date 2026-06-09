'use client'

import { createClient } from '@/lib/supabase/client'

export default function SignInButton() {
  async function signIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button className="btn btn-primary w-full gap-2" onClick={signIn}>
      <GoogleIcon />
      Sign in with Google
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
      <path fill="#4285F4" d="M46.145 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h12.44c-.54 2.9-2.18 5.36-4.64 7.01v5.82h7.51c4.4-4.05 6.84-10.02 6.84-16.84z"/>
      <path fill="#34A853" d="M24 47c6.48 0 11.93-2.15 15.9-5.82l-7.51-5.82c-2.15 1.44-4.9 2.29-8.39 2.29-6.45 0-11.91-4.36-13.86-10.22H2.37v6.01C6.32 42.39 14.56 47 24 47z"/>
      <path fill="#FBBC05" d="M10.14 28.43A14.38 14.38 0 0 1 9.39 24c0-1.54.27-3.04.75-4.43v-6.01H2.37A23.94 23.94 0 0 0 0 24c0 3.88.93 7.55 2.37 10.44l7.77-6.01z"/>
      <path fill="#EA4335" d="M24 9.5c3.64 0 6.91 1.25 9.48 3.71l7.12-7.12C36.93 2.15 31.48 0 24 0 14.56 0 6.32 4.61 2.37 13.56l7.77 6.01C12.09 13.86 17.55 9.5 24 9.5z"/>
    </svg>
  )
}
