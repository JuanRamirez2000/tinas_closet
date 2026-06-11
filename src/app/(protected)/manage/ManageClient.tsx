'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Pencil, Plus, X, Trash2, Check,
  Layers, ToggleLeft, ToggleRight,
  Settings, MapPin, Tag as TagIcon, Users, ShieldCheck, ArrowUpRight,
} from 'lucide-react'
import Chip from '@/components/Chip'
import BottomSheet from '@/components/BottomSheet'
import ColorDot from '@/components/ColorDot'
import SectionLabel from '@/components/SectionLabel'
import {
  createBaseLocation, deleteBaseLocation,
  createStorageLocation, updateStorageLocation, deleteStorageLocation,
} from '@/app/actions/locations'
import { createTagGroup, deleteTagGroup, createTag, deleteTag } from '@/app/actions/tags'
import { createOutfitSlot, updateOutfitSlot, deleteOutfitSlot } from '@/app/actions/outfit-slots'
import { saveSettings } from '@/app/actions/settings'
import { approveMember } from '@/app/actions/admin'
import { useShellSettings } from '@/context/shell'
import type { BaseLocation, OutfitSlot, StorageLocation, TagGroup } from '@/lib/types'

type MemberInfo = { user_id: string; email: string; is_admin: boolean }
type PendingUser = { id: string; email: string }

interface Props {
  bases: BaseLocation[]
  storageLocations: StorageLocation[]
  tagGroups: TagGroup[]
  locationCounts: Record<string, number>
  outfitSlots: OutfitSlot[]
  isAdmin: boolean
  members: MemberInfo[]
  pending: PendingUser[]
}

type TabId = 'settings' | 'locations' | 'tags' | 'members'

const THEMES = [
  { id: 'light',        label: 'Light'        },
  { id: 'dark',         label: 'Dark'         },
  { id: 'cupcake',      label: 'Cupcake'      },
  { id: 'bumblebee',    label: 'Bumblebee'    },
  { id: 'emerald',      label: 'Emerald'      },
  { id: 'corporate',    label: 'Corporate'    },
  { id: 'synthwave',    label: 'Synthwave'    },
  { id: 'retro',        label: 'Retro'        },
  { id: 'cyberpunk',    label: 'Cyberpunk'    },
  { id: 'valentine',    label: 'Valentine'    },
  { id: 'halloween',    label: 'Halloween'    },
  { id: 'garden',       label: 'Garden'       },
  { id: 'forest',       label: 'Forest'       },
  { id: 'aqua',         label: 'Aqua'         },
  { id: 'lofi',         label: 'Lo-Fi'        },
  { id: 'pastel',       label: 'Pastel'       },
  { id: 'fantasy',      label: 'Fantasy'      },
  { id: 'wireframe',    label: 'Wireframe'    },
  { id: 'black',        label: 'Black'        },
  { id: 'luxury',       label: 'Luxury'       },
  { id: 'dracula',      label: 'Dracula'      },
  { id: 'cmyk',         label: 'CMYK'         },
  { id: 'autumn',       label: 'Autumn'       },
  { id: 'business',     label: 'Business'     },
  { id: 'acid',         label: 'Acid'         },
  { id: 'lemonade',     label: 'Lemonade'     },
  { id: 'night',        label: 'Night'        },
  { id: 'coffee',       label: 'Coffee'       },
  { id: 'winter',       label: 'Winter'       },
  { id: 'dim',          label: 'Dim'          },
  { id: 'nord',         label: 'Nord'         },
  { id: 'sunset',       label: 'Sunset'       },
  { id: 'caramellatte', label: 'Caramellatte' },
  { id: 'abyss',        label: 'Abyss'        },
  { id: 'silk',         label: 'Silk'         },
]

interface EditingLoc { id?: string; name: string; baseId: string }

export default function ManageClient({
  bases,
  storageLocations,
  tagGroups,
  locationCounts,
  outfitSlots,
  isAdmin,
  members,
  pending,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { theme, setTheme, closetName, setClosetName } = useShellSettings()

  const [activeTab, setActiveTab] = useState<TabId>('settings')

  // Settings tab state
  const [localClosetName, setLocalClosetName] = useState(closetName)

  // Storage state
  const [editingLoc, setEditingLoc] = useState<EditingLoc | null>(null)
  const [locName, setLocName] = useState('')
  const [locBaseId, setLocBaseId] = useState('')

  // Groups state
  const [newBaseName, setNewBaseName] = useState('')
  const [addBaseOpen, setAddBaseOpen] = useState(false)

  // Tags state
  const [newTagValues, setNewTagValues] = useState<Record<string, string>>({})
  const [newGroupName, setNewGroupName] = useState('')

  // Outfit slots state
  const [editingSlot, setEditingSlot] = useState<OutfitSlot | null>(null)
  const [slotName, setSlotName] = useState('')
  const [slotMultiple, setSlotMultiple] = useState(false)
  const [slotOrder, setSlotOrder] = useState(0)
  const [newSlotName, setNewSlotName] = useState('')
  const [newSlotMultiple, setNewSlotMultiple] = useState(false)

  // ── Settings handlers ────────────────────────────────────────

  function saveClosetName() {
    const trimmed = localClosetName.trim()
    if (trimmed === closetName) return
    setClosetName(trimmed)
    startTransition(() => saveSettings({ closet_name: trimmed }))
  }

  function handleThemeChange(t: string) {
    setTheme(t)
    startTransition(() => saveSettings({ theme: t }))
  }

  // ── Location handlers ────────────────────────────────────────

  function openNewLoc() {
    setEditingLoc({ name: '', baseId: bases[0]?.id ?? '' })
    setLocName('')
    setLocBaseId(bases[0]?.id ?? '')
  }

  function openEditLoc(loc: StorageLocation) {
    setEditingLoc({ id: loc.id, name: loc.name, baseId: loc.base_id })
    setLocName(loc.name)
    setLocBaseId(loc.base_id)
  }

  function saveLoc() {
    if (!locName.trim()) return
    startTransition(async () => {
      if (editingLoc?.id) {
        await updateStorageLocation(editingLoc.id, locBaseId, locName.trim())
      } else {
        await createStorageLocation(locBaseId, locName.trim())
      }
      setEditingLoc(null)
    })
  }

  function deleteLoc() {
    if (!editingLoc?.id) return
    if (!confirm('Delete this storage spot? Items there become unassigned.')) return
    startTransition(async () => {
      await deleteStorageLocation(editingLoc.id!)
      setEditingLoc(null)
    })
  }

  // ── Tag handlers ─────────────────────────────────────────────

  function handleAddTag(groupId: string, value: string) {
    if (!value.trim()) return
    startTransition(async () => {
      await createTag(groupId, value.trim())
      setNewTagValues(v => ({ ...v, [groupId]: '' }))
    })
  }

  // ── Slot handlers ─────────────────────────────────────────────

  function openEditSlot(slot: OutfitSlot) {
    setEditingSlot(slot)
    setSlotName(slot.name)
    setSlotMultiple(slot.allow_multiple)
    setSlotOrder(slot.display_order)
  }

  function saveSlot() {
    if (!slotName.trim() || !editingSlot) return
    startTransition(async () => {
      await updateOutfitSlot(editingSlot.id, slotName.trim(), slotOrder, slotMultiple)
      setEditingSlot(null)
    })
  }

  function handleAddSlot() {
    if (!newSlotName.trim()) return
    const order = Math.max(0, ...outfitSlots.map(s => s.display_order)) + 1
    startTransition(async () => {
      await createOutfitSlot(newSlotName.trim(), order, newSlotMultiple)
      setNewSlotName('')
      setNewSlotMultiple(false)
    })
  }

  // ── Member handlers ───────────────────────────────────────────

  function handleApprove(userId: string) {
    startTransition(async () => {
      await approveMember(userId)
      router.refresh()
    })
  }

  // ── Tab definitions ───────────────────────────────────────────

  const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
    { id: 'settings',  label: 'Settings',  Icon: Settings  },
    { id: 'locations', label: 'Locations', Icon: MapPin    },
    { id: 'tags',      label: 'Tags',      Icon: TagIcon   },
    ...(isAdmin ? [{ id: 'members' as TabId, label: 'Members', Icon: Users }] : []),
  ]

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <div className="px-4 lg:px-6 pt-3 lg:pt-6 pb-0 shrink-0">
        <h1 className="font-serif text-[26px] leading-none">Manage</h1>
      </div>

      {/* Tab bar */}
      <div className="flex px-4 lg:px-6 mt-3 border-b border-base-200 overflow-x-auto shrink-0">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-base-content/50 hover:text-base-content/75'
            }`}
          >
            <Icon size={14} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 pb-28 lg:pb-10">

        {/* ── Settings tab ─────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-8">

            <div>
              <SectionLabel>Closet name</SectionLabel>
              <div className="mt-2">
                <input
                  value={localClosetName}
                  onChange={e => setLocalClosetName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveClosetName() }}
                  onBlur={saveClosetName}
                  placeholder="Tina's Closet"
                  className="input input-bordered w-full rounded-xl"
                />
              </div>
            </div>

            <div>
              <SectionLabel>Theme</SectionLabel>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
                {THEMES.map(t => (
                  <ThemeCard
                    key={t.id}
                    id={t.id}
                    label={t.label}
                    active={theme === t.id}
                    onClick={() => handleThemeChange(t.id)}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── Locations tab ─────────────────────────────────────── */}
        {activeTab === 'locations' && (
          <div className="lg:grid lg:grid-cols-[360px_1fr] lg:gap-5 lg:items-start">

            {/* Storage spots */}
            <div className="lg:bg-base-100 lg:border lg:border-base-200 lg:rounded-2xl lg:shadow-sm lg:p-5">
              <div className="flex items-center justify-between mt-2 lg:mt-0 mb-2">
                <SectionLabel>Storage spots</SectionLabel>
                <button onClick={openNewLoc} className="btn btn-xs btn-ghost rounded-full gap-1 text-primary">
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="flex flex-col gap-2 mb-8 lg:mb-0">
                {storageLocations.map(loc => {
                  const base = bases.find(b => b.id === loc.base_id)
                  const count = locationCounts[loc.id] ?? 0
                  return (
                    <div key={loc.id} className="flex items-center gap-3 bg-base-100 lg:bg-base-200/40 border border-base-200 rounded-2xl p-3">
                      <span className="w-10 h-10 rounded-xl bg-base-200 lg:bg-base-100 flex items-center justify-center text-base-content/55">
                        <Box size={19} strokeWidth={1.7} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium leading-tight">{loc.name}</div>
                        {base && (
                          <div className="text-[12px] text-base-content/45 flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" />
                            {base.name}
                          </div>
                        )}
                      </div>
                      <span className="text-[12px] text-base-content/45 tabular-nums">{count}</span>
                      <button
                        onClick={() => openEditLoc(loc as StorageLocation)}
                        className="btn btn-circle btn-ghost btn-sm text-base-content/55"
                      >
                        <Pencil size={17} strokeWidth={1.8} />
                      </button>
                    </div>
                  )
                })}
                {storageLocations.length === 0 && (
                  <p className="text-[13px] text-base-content/40 text-center py-6">No storage spots yet.</p>
                )}
              </div>
            </div>

            {/* Groups */}
            <div className="lg:bg-base-100 lg:border lg:border-base-200 lg:rounded-2xl lg:shadow-sm lg:p-5 mt-4 lg:mt-0">
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>Groups</SectionLabel>
                <button onClick={() => setAddBaseOpen(true)} className="btn btn-xs btn-ghost rounded-full gap-1 text-primary">
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-8 lg:mb-0">
                {bases.map(base => (
                  <div key={base.id} className="flex items-center gap-1.5 bg-base-200 rounded-full px-3 py-1.5 text-[13px]">
                    <span>{base.name}</span>
                    <button
                      onClick={() => { if (confirm(`Delete group "${base.name}"?`)) startTransition(() => deleteBaseLocation(base.id)) }}
                      className="opacity-40 hover:opacity-100 hover:text-error"
                      disabled={isPending}
                    >
                      <X size={13} strokeWidth={2.1} />
                    </button>
                  </div>
                ))}
                {bases.length === 0 && (
                  <p className="text-[13px] text-base-content/40 py-2">No groups yet.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── Tags tab ──────────────────────────────────────────── */}
        {activeTab === 'tags' && (
          <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-5 lg:items-start max-w-4xl">

            {/* Tag groups */}
            <div className="lg:bg-base-100 lg:border lg:border-base-200 lg:rounded-2xl lg:shadow-sm lg:p-5">
              <SectionLabel>Tags</SectionLabel>
              <div className="space-y-5 mt-3">
                {tagGroups.map(group => (
                  <TagGroupSection
                    key={group.id}
                    group={group}
                    newValue={newTagValues[group.id] ?? ''}
                    onNewValueChange={v => setNewTagValues(prev => ({ ...prev, [group.id]: v }))}
                    onAdd={() => handleAddTag(group.id, newTagValues[group.id] ?? '')}
                    onRemove={tagId => startTransition(() => deleteTag(tagId))}
                    onDeleteGroup={!group.is_system ? () => {
                      if (confirm(`Delete tag group "${group.name}"?`)) {
                        startTransition(() => deleteTagGroup(group.id))
                      }
                    } : undefined}
                    isPending={isPending}
                  />
                ))}
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (!newGroupName.trim()) return
                  startTransition(async () => {
                    await createTagGroup(newGroupName.trim())
                    setNewGroupName('')
                  })
                }}
                className="flex gap-2 mt-5"
              >
                <input
                  className="flex-1 bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[14px]"
                  placeholder="New tag group name…"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                />
                <button className="btn btn-primary rounded-xl" type="submit" disabled={isPending}>Add</button>
              </form>
            </div>

            {/* Outfit slots */}
            <div className="lg:bg-base-100 lg:border lg:border-base-200 lg:rounded-2xl lg:shadow-sm lg:p-5 mt-8 lg:mt-0">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Outfit slots</SectionLabel>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {outfitSlots.map(slot => (
                  <div key={slot.id} className="flex items-center gap-3 bg-base-100 lg:bg-base-200/40 border border-base-200 rounded-2xl p-3">
                    <span className="w-10 h-10 rounded-xl bg-base-200 lg:bg-base-100 flex items-center justify-center text-base-content/55">
                      <Layers size={18} strokeWidth={1.7} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium leading-tight">{slot.name}</div>
                      <div className="text-[11px] text-base-content/40 mt-0.5">
                        order {slot.display_order}{slot.allow_multiple ? ' · multiple' : ''}
                      </div>
                    </div>
                    <button onClick={() => openEditSlot(slot)} className="btn btn-circle btn-ghost btn-sm text-base-content/55">
                      <Pencil size={17} strokeWidth={1.8} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete slot "${slot.name}"?`)) startTransition(() => deleteOutfitSlot(slot.id)) }}
                      className="btn btn-circle btn-ghost btn-sm text-error/60 hover:text-error"
                      disabled={isPending}
                    >
                      <Trash2 size={17} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center mb-2">
                <input
                  value={newSlotName}
                  onChange={e => setNewSlotName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSlot() }}
                  placeholder="New slot name…"
                  className="flex-1 bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[14px]"
                />
                <button
                  onClick={handleAddSlot}
                  disabled={!newSlotName.trim() || isPending}
                  className="btn btn-primary rounded-xl disabled:opacity-40"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-base-content/60 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setNewSlotMultiple(v => !v)}
                  className={newSlotMultiple ? 'text-primary' : 'text-base-content/30'}
                >
                  {newSlotMultiple ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                Allow multiple items in this slot
              </label>
            </div>

          </div>
        )}

        {/* ── Members tab (admin only) ──────────────────────────── */}
        {activeTab === 'members' && isAdmin && (
          <div className="max-w-lg">

            {members.length === 0 && pending.length === 0 ? (
              <p className="text-[13px] text-base-content/40 py-10 text-center">No members yet.</p>
            ) : (
              <>
                <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
                  {members.map((m, i) => (
                    <div
                      key={m.user_id}
                      className={`flex items-center gap-3 px-4 py-3 ${i < members.length - 1 ? 'border-b border-base-200' : ''}`}
                    >
                      <span className="flex-1 text-[13.5px] truncate">{m.email}</span>
                      {m.is_admin && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary shrink-0">
                          <ShieldCheck size={13} strokeWidth={2} /> Admin
                        </span>
                      )}
                      <button
                        onClick={() => router.push(`/${m.user_id}/items`)}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-base-content/45 hover:text-primary transition-colors"
                      >
                        Browse <ArrowUpRight size={12} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>

                {pending.length > 0 && (
                  <div className="mt-5">
                    <div className="text-[11px] font-semibold text-base-content/45 uppercase tracking-wider mb-2">
                      Pending approval
                    </div>
                    <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
                      {pending.map((u, i) => (
                        <div
                          key={u.id}
                          className={`flex items-center gap-3 px-4 py-3 ${i < pending.length - 1 ? 'border-b border-base-200' : ''}`}
                        >
                          <span className="flex-1 text-[13.5px] truncate text-base-content/60">{u.email}</span>
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={isPending}
                            className="btn btn-xs btn-primary rounded-full"
                          >
                            {isPending ? <span className="loading loading-spinner loading-xs" /> : 'Approve'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pending.length === 0 && (
                  <p className="text-[12px] text-base-content/40 mt-3 px-1">No pending sign-ups.</p>
                )}
              </>
            )}

          </div>
        )}

      </div>

      {/* ── Location editor sheet ─────────────────────────────── */}
      <BottomSheet open={!!editingLoc} onClose={() => setEditingLoc(null)} title={editingLoc?.id ? 'Edit spot' : 'New storage spot'}>
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Name</div>
            <input
              autoFocus
              value={locName}
              onChange={e => setLocName(e.target.value)}
              placeholder="e.g. Bin A, Top shelf"
              className="w-full bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[15px]"
            />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Group</div>
            <div className="flex flex-wrap gap-1.5">
              {bases.map(b => (
                <Chip key={b.id} active={locBaseId === b.id} onClick={() => setLocBaseId(b.id)}>{b.name}</Chip>
              ))}
            </div>
          </div>
          {editingLoc?.id && (
            <p className="text-[12px] text-base-content/45">
              {locationCounts[editingLoc.id] ?? 0} piece{(locationCounts[editingLoc.id] ?? 0) === 1 ? '' : 's'} stored here.
            </p>
          )}
          <div className="flex gap-2 pt-1">
            {editingLoc?.id && (
              <button onClick={deleteLoc} className="btn btn-ghost rounded-full text-error" disabled={isPending}>
                <Trash2 size={17} strokeWidth={1.8} />
              </button>
            )}
            <button
              onClick={saveLoc}
              disabled={!locName.trim() || isPending}
              className="btn btn-primary rounded-full flex-1 disabled:opacity-40"
            >
              {isPending ? <span className="loading loading-spinner loading-sm" /> : editingLoc?.id ? 'Save' : 'Add spot'}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* ── Add group sheet ───────────────────────────────────── */}
      <BottomSheet open={addBaseOpen} onClose={() => setAddBaseOpen(false)} title="New group">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Name</div>
            <input
              autoFocus
              value={newBaseName}
              onChange={e => setNewBaseName(e.target.value)}
              placeholder="e.g. Tina's, Shared"
              className="w-full bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[15px]"
              onKeyDown={e => {
                if (e.key === 'Enter' && newBaseName.trim()) {
                  startTransition(async () => {
                    await createBaseLocation(newBaseName.trim())
                    setNewBaseName('')
                    setAddBaseOpen(false)
                  })
                }
              }}
            />
          </div>
          <button
            onClick={() => {
              if (!newBaseName.trim()) return
              startTransition(async () => {
                await createBaseLocation(newBaseName.trim())
                setNewBaseName('')
                setAddBaseOpen(false)
              })
            }}
            disabled={!newBaseName.trim() || isPending}
            className="btn btn-primary rounded-full disabled:opacity-40"
          >
            Add group
          </button>
        </div>
      </BottomSheet>

      {/* ── Edit slot sheet ───────────────────────────────────── */}
      <BottomSheet open={!!editingSlot} onClose={() => setEditingSlot(null)} title="Edit slot">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Name</div>
            <input
              autoFocus
              value={slotName}
              onChange={e => setSlotName(e.target.value)}
              className="w-full bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[15px]"
            />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Display order</div>
            <input
              type="number"
              value={slotOrder}
              onChange={e => setSlotOrder(Number(e.target.value))}
              className="w-full bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[15px]"
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-base-content/60 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setSlotMultiple(v => !v)}
              className={slotMultiple ? 'text-primary' : 'text-base-content/30'}
            >
              {slotMultiple ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
            Allow multiple items
          </label>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                if (!editingSlot) return
                if (!confirm(`Delete slot "${editingSlot.name}"?`)) return
                startTransition(async () => {
                  await deleteOutfitSlot(editingSlot.id)
                  setEditingSlot(null)
                })
              }}
              className="btn btn-ghost rounded-full text-error"
              disabled={isPending}
            >
              <Trash2 size={17} strokeWidth={1.8} />
            </button>
            <button
              onClick={saveSlot}
              disabled={!slotName.trim() || isPending}
              className="btn btn-primary rounded-full flex-1 disabled:opacity-40"
            >
              {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save'}
            </button>
          </div>
        </div>
      </BottomSheet>

    </div>
  )
}

// ── Local components ──────────────────────────────────────────────

function ThemeCard({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl overflow-hidden border-2 text-left transition-all',
        active
          ? 'border-primary ring-2 ring-primary/25'
          : 'border-base-300 hover:border-base-content/20',
      ].join(' ')}
    >
      <div data-theme={id} className="flex h-9">
        <span className="flex-1 bg-primary" />
        <span className="flex-1 bg-secondary" />
        <span className="flex-1 bg-accent" />
        <span className="flex-1 bg-neutral" />
      </div>
      <div className="bg-base-100 px-2 py-1.5 flex items-center justify-between gap-1">
        <span className="text-[11px] font-semibold text-base-content truncate leading-tight">{label}</span>
        {active && <Check size={11} strokeWidth={2.5} className="text-primary shrink-0" />}
      </div>
    </button>
  )
}

function TagGroupSection({
  group, newValue, onNewValueChange, onAdd, onRemove, onDeleteGroup, isPending,
}: {
  group: TagGroup
  newValue: string
  onNewValueChange: (v: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onDeleteGroup?: () => void
  isPending: boolean
}) {
  const isColor = group.name === 'Color'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[12px] font-medium text-base-content/55">{group.name}</div>
        {!group.is_system && onDeleteGroup && (
          <button onClick={onDeleteGroup} className="btn btn-ghost btn-xs text-error rounded-full">
            <X size={13} strokeWidth={2.1} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {(group.tags ?? []).map(tag => (
          <span key={tag.id} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-base-200 text-[13px]">
            {isColor && <ColorDot name={tag.value} size={12} />}
            {tag.value}
            <button
              onClick={() => onRemove(tag.id)}
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
          value={newValue}
          onChange={e => onNewValueChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onAdd() }}
          placeholder={`Add ${group.name.toLowerCase()}…`}
          className="flex-1 bg-base-200/60 rounded-xl px-3 h-9 text-[14px] outline-none focus:bg-base-200"
        />
        <button onClick={onAdd} disabled={!newValue.trim() || isPending} className="btn btn-sm btn-primary rounded-xl disabled:opacity-40">
          Add
        </button>
      </div>
    </div>
  )
}
