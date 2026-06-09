import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Returns an untyped client. Query results are typed via explicit casts
// (as unknown as MyType) at the call site rather than via generics,
// since our hand-written Database type doesn't satisfy @supabase/supabase-js's
// strict GenericSchema constraint exactly.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll is called from a Server Component — ignore.
            // Cookies are handled by the proxy instead.
          }
        },
      },
    }
  )
}
