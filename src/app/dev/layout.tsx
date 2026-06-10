import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import SideNav from '@/components/SideNav'

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <div className="bg-warning text-warning-content text-[11px] text-center py-1 font-semibold z-40 relative shrink-0">
        DEV MODE — seeded data, no auth
      </div>
      <SideNav closetName="Dev mode" onOpenSettings={() => {}} />
      <main className="flex-1 min-w-0">{children}</main>
      <BottomNav onOpenSettings={() => {}} />
    </div>
  )
}
