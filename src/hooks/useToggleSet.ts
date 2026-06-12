'use client'
import { useState } from 'react'

export function useToggleSet(initial: string[] = []) {
  const [ids, setIds] = useState<string[]>(initial)

  function toggle(id: string) {
    setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return [ids, toggle, setIds] as const
}
