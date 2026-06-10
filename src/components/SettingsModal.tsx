'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Check, Plus } from 'lucide-react'
import ColorDot from '@/components/ColorDot'
import { saveSettings } from '@/app/actions/settings'
import { createTag, deleteTag, createTagGroup, deleteTagGroup, getTagGroups } from '@/app/actions/tags'
import type { TagGroup } from '@/lib/types'

const THEMES = [
  { id: 'blush',   label: 'Blush'   },
  { id: 'cupcake', label: 'Cupcake' },
  { id: 'dark',    label: 'Dark'    },
  { id: 'dracula', label: 'Dracula' },
]

interface Props {
  open: boolean
  onClose: () => void
  closetName: string
  onClosetNameChange: (name: string) => void
  currentTheme: string
  onThemeChange: (theme: string) => void
  initialTagGroups: TagGroup[]
}

export default function SettingsModal({
  open, onClose,
  closetName, onClosetNameChange,
  currentTheme, onThemeChange,
  initialTagGroups,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [localName, setLocalName] = useState(closetName)
  const [tagGroups, setTagGroups] = useState(initialTagGroups)
  const [newTagValues, setNewTagValues] = useState<Record<string, string>>({})
  const [newGroupName, setNewGroupName] = useState('')

  useEffect(() => {
    if (open) {
      setLocalName(closetName)
      setTagGroups(initialTagGroups)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  function saveName() {
    onClosetNameChange(localName)
    startTransition(() => saveSettings({ closet_name: localName }))
  }

  function handleThemeChange(theme: string) {
    onThemeChange(theme)
    startTransition(() => saveSettings({ theme }))
  }

  async function refreshGroups() {
    const fresh = await getTagGroups()
    setTagGroups(fresh)
  }

  function handleAddTag(groupId: string, value: string) {
    if (!value.trim()) return
    startTransition(async () => {
      await createTag(groupId, value.trim())
      await refreshGroups()
      setNewTagValues(v => ({ ...v, [groupId]: '' }))
    })
  }

  function handleRemoveTag(tagId: string) {
    startTransition(async () => {
      await deleteTag(tagId)
      await refreshGroups()
    })
  }

  function handleAddGroup() {
    if (!newGroupName.trim()) return
    startTransition(async () => {
      await createTagGroup(newGroupName.trim())
      await refreshGroups()
      setNewGroupName('')
    })
  }

  function handleDeleteGroup(groupId: string, name: string) {
    if (!confirm(`Delete tag group "${name}" and all its tags?`)) return
    startTransition(async () => {
      await deleteTagGroup(groupId)
      await refreshGroups()
    })
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(60,50,70,.28)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-base-100 rounded-3xl shadow-xl w-full my-auto max-w-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h2 className="text-lg font-bold">Settings</h2>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-7 max-h-[72vh] overflow-y-auto">

          {/* ── Closet name ─── */}
          <div>
            <SectionTitle>Closet name</SectionTitle>
            <div className="flex gap-2">
              <input
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName() }}
                onBlur={saveName}
                placeholder="Tina's Closet"
                className="input input-bordered flex-1 rounded-xl"
              />
            </div>
          </div>

          {/* ── Theme ─────── */}
          <div>
            <SectionTitle>Theme</SectionTitle>
            <div className="grid grid-cols-2 gap-2.5">
              {THEMES.map(t => (
                <ThemeCard
                  key={t.id}
                  id={t.id}
                  label={t.label}
                  active={currentTheme === t.id}
                  onClick={() => handleThemeChange(t.id)}
                />
              ))}
            </div>
          </div>

          {/* ── Tags ──────── */}
          <div>
            <SectionTitle>Tags</SectionTitle>
            <div className="flex flex-col gap-5">
              {tagGroups.map(group => {
                const isColor = group.name === 'Color'
                return (
                  <div key={group.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[12px] font-semibold text-base-content/60">{group.name}</div>
                      {!group.is_system && (
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="btn btn-ghost btn-xs text-error rounded-full"
                          disabled={isPending}
                        >
                          <X size={13} strokeWidth={2.1} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(group.tags ?? []).map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-base-200 text-[13px]"
                        >
                          {isColor && <ColorDot name={tag.value} size={12} />}
                          {tag.value}
                          <button
                            onClick={() => handleRemoveTag(tag.id)}
                            className="opacity-40 hover:opacity-100 hover:text-error"
                            disabled={isPending}
                          >
                            <X size={13} strokeWidth={2.1} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newTagValues[group.id] ?? ''}
                        onChange={e => setNewTagValues(v => ({ ...v, [group.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddTag(group.id, newTagValues[group.id] ?? '')
                        }}
                        placeholder={`Add ${group.name.toLowerCase()}…`}
                        className="input input-bordered input-sm flex-1 rounded-xl"
                        disabled={isPending}
                      />
                      <button
                        onClick={() => handleAddTag(group.id, newTagValues[group.id] ?? '')}
                        disabled={!(newTagValues[group.id] ?? '').trim() || isPending}
                        className="btn btn-sm btn-primary rounded-xl disabled:opacity-40 gap-1"
                      >
                        {isPending ? <span className="loading loading-spinner loading-xs" /> : <><Plus size={13} /> Add</>}
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* New group */}
              <div className="flex gap-2 pt-1 border-t border-base-200">
                <input
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddGroup() }}
                  placeholder="New tag group…"
                  className="input input-bordered input-sm flex-1 rounded-xl"
                  disabled={isPending}
                />
                <button
                  onClick={handleAddGroup}
                  disabled={!newGroupName.trim() || isPending}
                  className="btn btn-sm btn-outline btn-primary rounded-xl disabled:opacity-40"
                >
                  Add group
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-base-200">
          <button onClick={onClose} className="btn btn-primary rounded-full px-8">
            Done
          </button>
        </div>

      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/45 mb-2.5">
      {children}
    </div>
  )
}

function ThemeCard({
  id, label, active, onClick,
}: {
  id: string; label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      data-theme={id}
      onClick={onClick}
      className={[
        'rounded-2xl p-3 border-2 text-left transition-all overflow-hidden bg-base-100',
        active
          ? 'border-primary ring-2 ring-primary/25'
          : 'border-base-300 hover:border-base-content/25',
      ].join(' ')}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-bold text-sm text-base-content">{label}</span>
        <span className={[
          'w-5 h-5 rounded-full flex items-center justify-center',
          active ? 'bg-primary text-primary-content' : 'bg-base-200',
        ].join(' ')}>
          {active && <Check size={12} strokeWidth={2.5} />}
        </span>
      </div>
      <div className="flex gap-1.5">
        <span className="w-7 h-7 rounded-lg bg-primary" />
        <span className="w-7 h-7 rounded-lg bg-secondary" />
        <span className="w-7 h-7 rounded-lg bg-accent" />
        <span className="flex-1 h-7 rounded-lg bg-base-200 border border-base-300" />
      </div>
    </button>
  )
}
