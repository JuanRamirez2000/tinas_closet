'use client'

import { useState } from 'react'

export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false)

  async function upload(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) return null
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      return url as string
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading }
}
