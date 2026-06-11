'use client'

import { useState } from 'react'
import SideNav from '@/components/SideNav'
import BottomNav from '@/components/BottomNav'
import SettingsModal from '@/components/SettingsModal'
import { IsAdminContext } from '@/context/admin'
import { UserProvider } from '@/context/user'
import type { TagGroup } from '@/lib/types'

interface Props {
  children: React.ReactNode
  initialClosetName: string
  initialTheme: string
  initialTagGroups: TagGroup[]
  isAdmin?: boolean
  loggedInUserId: string
  viewingUserId: string
  viewingClosetName: string
}

export default function SettingsShell({
  children,
  initialClosetName,
  initialTheme,
  initialTagGroups,
  isAdmin = false,
  loggedInUserId,
  viewingUserId,
  viewingClosetName,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [closetName, setClosetName] = useState(initialClosetName)
  const [currentTheme, setCurrentTheme] = useState(initialTheme)

  const displayName = closetName.trim() || "Tina's Closet"

  return (
    <UserProvider value={{ loggedInUserId, viewingUserId, viewingClosetName }}>
    <IsAdminContext.Provider value={isAdmin}>
    <div
      className="min-h-screen flex flex-col bg-base-200"
      data-theme={currentTheme}
    >
      <SideNav
        closetName={displayName}
        onOpenSettings={() => setSettingsOpen(true)}
        isAdmin={isAdmin}
      />
      <main className="flex-1 min-w-0">
        {children}
      </main>
      <BottomNav isAdmin={isAdmin} onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        closetName={closetName}
        onClosetNameChange={setClosetName}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        initialTagGroups={initialTagGroups}
        isAdmin={isAdmin}
      />
    </div>
    </IsAdminContext.Provider>
    </UserProvider>
  )
}
