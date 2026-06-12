'use client'

import { useRef } from 'react'
import { X, Camera } from 'lucide-react'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  isUploading: boolean
  onFilePick: (file: File) => void
}

export default function PhotoUploadBox({ value, onChange, isUploading, onFilePick }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div
        onClick={() => fileRef.current?.click()}
        className="relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center aspect-4/5 overflow-hidden border-base-300 bg-base-200/40 hover:border-primary/60"
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null) }}
              className="absolute top-2 right-2 btn btn-circle btn-xs bg-base-100/90 border-0"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="text-base-content/45 px-3">
            {isUploading
              ? <span className="loading loading-spinner loading-md" />
              : (
                <>
                  <div className="flex justify-center mb-2">
                    <Camera size={26} strokeWidth={1.6} />
                  </div>
                  <div className="text-sm font-semibold text-base-content/60">Drop a photo</div>
                  <div className="font-mono text-[10px] mt-1 uppercase tracking-wide">or click to browse</div>
                </>
              )
            }
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFilePick(f) }}
      />
    </>
  )
}
