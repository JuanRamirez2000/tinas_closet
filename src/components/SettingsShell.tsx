'use client'

import { useState } from 'react'
import SideNav from '@/components/SideNav'
import BottomNav from '@/components/BottomNav'
import { IsAdminContext } from '@/context/admin'
import { UserProvider } from '@/context/user'
import { ShellProvider } from '@/context/shell'

interface Props {
  children: React.ReactNode
  initialClosetName: string
  initialTheme: string
  isAdmin?: boolean
  loggedInUserId: string
  viewingUserId: string
  viewingClosetName: string
}

export default function SettingsShell({
  children,
  initialClosetName,
  initialTheme,
  isAdmin = false,
  loggedInUserId,
  viewingUserId,
  viewingClosetName,
}: Props) {
  const [closetName, setClosetName] = useState(initialClosetName)
  const [currentTheme, setCurrentTheme] = useState(initialTheme)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const displayName = closetName.trim() || "Tina's Closet"

  return (
    <ShellProvider value={{ theme: currentTheme, setTheme: setCurrentTheme, closetName, setClosetName, quickAddOpen, setQuickAddOpen }}>
    <UserProvider value={{ loggedInUserId, viewingUserId, viewingClosetName }}>
    <IsAdminContext.Provider value={isAdmin}>
    <div
      className="min-h-screen flex flex-col bg-base-200"
      data-theme={currentTheme}
    >
      <SideNav closetName={displayName} isAdmin={isAdmin} />
      <main className="flex-1 min-w-0">
        {children}
      </main>
      <BottomNav isAdmin={isAdmin} />
    </div>
    </IsAdminContext.Provider>
    </UserProvider>
    </ShellProvider>
  )
}
