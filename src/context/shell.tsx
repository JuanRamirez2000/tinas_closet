'use client'
import { createContext, useContext } from 'react'

interface ShellContextValue {
  theme: string
  setTheme: (t: string) => void
  closetName: string
  setClosetName: (n: string) => void
  quickAddOpen: boolean
  setQuickAddOpen: (v: boolean) => void
}

const ShellContext = createContext<ShellContextValue>({
  theme: 'cupcake',
  setTheme: () => {},
  closetName: '',
  setClosetName: () => {},
  quickAddOpen: false,
  setQuickAddOpen: () => {},
})

export const ShellProvider = ShellContext.Provider
export const useShellSettings = () => useContext(ShellContext)
