'use client'

import { useState } from 'react'
import SideNav from '@/components/SideNav'
import BottomNav from '@/components/BottomNav'
import SettingsModal from '@/components/SettingsModal'
import type { TagGroup } from '@/lib/types'

interface Props {
  children: React.ReactNode
  initialClosetName: string
  initialTheme: string
  initialTagGroups: TagGroup[]
}

export default function SettingsShell({
  children,
  initialClosetName,
  initialTheme,
  initialTagGroups,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [closetName, setClosetName] = useState(initialClosetName)
  const [currentTheme, setCurrentTheme] = useState(initialTheme)

  const displayName = closetName.trim() || "Tina's Closet"

  return (
    <div
      className="min-h-screen flex flex-col bg-base-200"
      data-theme={currentTheme}
    >
      <SideNav
        closetName={displayName}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <main className="flex-1 min-w-0">
        {children}
      </main>
      <BottomNav onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        closetName={closetName}
        onClosetNameChange={setClosetName}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        initialTagGroups={initialTagGroups}
      />
    </div>
  )
}
