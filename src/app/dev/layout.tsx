import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-warning text-warning-content text-xs text-center py-1 font-medium">
        DEV MODE — seeded data, no auth
      </div>
      <main className="flex-1 px-4 py-4 pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
