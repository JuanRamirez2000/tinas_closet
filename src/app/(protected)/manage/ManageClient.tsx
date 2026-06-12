'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Pencil, Plus, Trash2, Check,
  Layers, ToggleLeft, ToggleRight,
  MapPin, Tag as TagIcon, Users, ShieldCheck, ArrowUpRight, AlertTriangle,
} from 'lucide-react'
import Chip from '@/components/Chip'
import Dialog from '@/components/Dialog'
import ColorDot from '@/components/ColorDot'
import SectionLabel from '@/components/SectionLabel'
import {
  createBaseLocation, updateBaseLocation, deleteBaseLocation,
  createStorageLocation, updateStorageLocation, deleteStorageLocation,
} from '@/app/actions/locations'
import { createTagGroup, deleteTagGroup, createTag, updateTag, deleteTag } from '@/app/actions/tags'
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

const THEMES = [
  { id: 'cupcake',      label: 'Cupcake'      },
  { id: 'light',        label: 'Light'        },
  { id: 'dark',         label: 'Dark'         },
  { id: 'silk',         label: 'Silk'         },
  { id: 'caramellatte', label: 'Caramellatte' },
  { id: 'pastel',       label: 'Pastel'       },
  { id: 'lemonade',     label: 'Lemonade'     },
  { id: 'valentine',    label: 'Valentine'    },
  { id: 'garden',       label: 'Garden'       },
  { id: 'emerald',      label: 'Emerald'      },
  { id: 'aqua',         label: 'Aqua'         },
  { id: 'nord',         label: 'Nord'         },
  { id: 'winter',       label: 'Winter'       },
  { id: 'retro',        label: 'Retro'        },
  { id: 'bumblebee',    label: 'Bumblebee'    },
  { id: 'lofi',         label: 'Lo-Fi'        },
  { id: 'fantasy',      label: 'Fantasy'      },
  { id: 'corporate',    label: 'Corporate'    },
  { id: 'business',     label: 'Business'     },
  { id: 'dim',          label: 'Dim'          },
  { id: 'night',        label: 'Night'        },
  { id: 'sunset',       label: 'Sunset'       },
  { id: 'dracula',      label: 'Dracula'      },
  { id: 'synthwave',    label: 'Synthwave'    },
  { id: 'halloween',    label: 'Halloween'    },
  { id: 'abyss',        label: 'Abyss'        },
  { id: 'cyberpunk',    label: 'Cyberpunk'    },
  { id: 'luxury',       label: 'Luxury'       },
  { id: 'black',        label: 'Black'        },
  { id: 'wireframe',    label: 'Wireframe'    },
  { id: 'acid',         label: 'Acid'         },
  { id: 'autumn',       label: 'Autumn'       },
  { id: 'cmyk',         label: 'CMYK'         },
  { id: 'forest',       label: 'Forest'       },
  { id: 'coffee',       label: 'Coffee'       },
]

interface LocEditing { id?: string; name: string; baseId: string }
interface BaseEditing { id: string; name: string }
interface TagEditing { id: string; value: string; isColor: boolean }
interface SlotEditing { id: string; name: string; order: number; multiple: boolean }

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

  // Settings
  const [localClosetName, setLocalClosetName] = useState(closetName)

  // Storage spot modal
  const [editingLoc, setEditingLoc] = useState<LocEditing | null>(null)
  const [locName, setLocName] = useState('')
  const [locBaseId, setLocBaseId] = useState('')
  const [locConfirmDelete, setLocConfirmDelete] = useState(false)

  // Group modal
  const [editingBase, setEditingBase] = useState<BaseEditing | null>(null)
  const [baseEditName, setBaseEditName] = useState('')
  const [baseConfirmDelete, setBaseConfirmDelete] = useState(false)

  // Tag edit modal
  const [editingTag, setEditingTag] = useState<TagEditing | null>(null)
  const [tagEditValue, setTagEditValue] = useState('')
  const [tagConfirmDelete, setTagConfirmDelete] = useState(false)

  // Tag group delete confirmation
  const [deletingGroup, setDeletingGroup] = useState<{ id: string; name: string } | null>(null)

  // New tag inputs per group
  const [newTagValues, setNewTagValues] = useState<Record<string, string>>({})
  const [newGroupName, setNewGroupName] = useState('')

  // Outfit slot modal
  const [editingSlot, setEditingSlot] = useState<SlotEditing | null>(null)
  const [slotConfirmDelete, setSlotConfirmDelete] = useState(false)
  const [newSlotName, setNewSlotName] = useState('')
  const [newSlotMultiple, setNewSlotMultiple] = useState(false)

  // ── Settings ───────────────────────────────────────────────────

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

  // ── Storage spot ───────────────────────────────────────────────

  function openNewLoc() {
    setLocName(''); setLocBaseId(bases[0]?.id ?? ''); setLocConfirmDelete(false)
    setEditingLoc({ name: '', baseId: bases[0]?.id ?? '' })
  }

  function openEditLoc(loc: StorageLocation) {
    setLocName(loc.name); setLocBaseId(loc.base_id); setLocConfirmDelete(false)
    setEditingLoc({ id: loc.id, name: loc.name, baseId: loc.base_id })
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
    startTransition(async () => {
      await deleteStorageLocation(editingLoc.id!)
      setEditingLoc(null)
    })
  }

  // ── Groups ─────────────────────────────────────────────────────

  function openNewBase() {
    setBaseEditName(''); setBaseConfirmDelete(false)
    setEditingBase({ id: '', name: '' })
  }

  function openEditBase(base: BaseLocation) {
    setBaseEditName(base.name); setBaseConfirmDelete(false)
    setEditingBase({ id: base.id, name: base.name })
  }

  function saveBase() {
    if (!baseEditName.trim() || !editingBase) return
    startTransition(async () => {
      if (editingBase.id) {
        await updateBaseLocation(editingBase.id, baseEditName.trim())
      } else {
        await createBaseLocation(baseEditName.trim())
      }
      setEditingBase(null)
    })
  }

  function deleteBase() {
    if (!editingBase?.id) return
    startTransition(async () => {
      await deleteBaseLocation(editingBase.id)
      setEditingBase(null)
    })
  }

  // ── Tags ───────────────────────────────────────────────────────

  function handleAddTag(groupId: string, value: string) {
    if (!value.trim()) return
    startTransition(async () => {
      await createTag(groupId, value.trim())
      setNewTagValues(v => ({ ...v, [groupId]: '' }))
    })
  }

  function openEditTag(tag: TagEditing) {
    setTagEditValue(tag.value); setTagConfirmDelete(false)
    setEditingTag(tag)
  }

  function saveTag() {
    if (!tagEditValue.trim() || !editingTag) return
    startTransition(async () => {
      await updateTag(editingTag.id, tagEditValue.trim())
      setEditingTag(null)
    })
  }

  function doDeleteTag() {
    if (!editingTag) return
    startTransition(async () => {
      await deleteTag(editingTag.id)
      setEditingTag(null)
    })
  }

  function doDeleteTagGroup() {
    if (!deletingGroup) return
    startTransition(async () => {
      await deleteTagGroup(deletingGroup.id)
      setDeletingGroup(null)
    })
  }

  // ── Outfit slots ───────────────────────────────────────────────

  function openEditSlot(slot: OutfitSlot) {
    setSlotConfirmDelete(false)
    setEditingSlot({ id: slot.id, name: slot.name, order: slot.display_order, multiple: slot.allow_multiple })
  }

  function saveSlot() {
    if (!editingSlot?.name.trim()) return
    startTransition(async () => {
      await updateOutfitSlot(editingSlot.id, editingSlot.name.trim(), editingSlot.order, editingSlot.multiple)
      setEditingSlot(null)
    })
  }

  function doDeleteSlot() {
    if (!editingSlot) return
    startTransition(async () => {
      await deleteOutfitSlot(editingSlot.id)
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

  // ── Members ────────────────────────────────────────────────────

  function handleApprove(userId: string) {
    startTransition(async () => {
      await approveMember(userId)
      router.refresh()
    })
  }

  // ──────────────────────────────────────────────────────────────

  return (
    <div className="px-4 lg:px-8 pt-3 lg:pt-6 pb-28 lg:pb-12">
      <h1 className="font-serif text-[26px] leading-none mb-7">Manage</h1>

      {/* ── Desktop 3-column grid ──────────────────────────────── */}
      <div className="lg:grid lg:grid-cols-[260px_1fr_1fr] lg:gap-8 lg:items-start">

        {/* ── Col 1: Settings + Members ────────────────────────── */}
        <div>
          <Section icon={<TagIcon size={16} strokeWidth={2} />} title="Settings">
            <div className="space-y-5">
              <div>
                <SectionLabel>Closet name</SectionLabel>
                <input
                  value={localClosetName}
                  onChange={e => setLocalClosetName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveClosetName() }}
                  onBlur={saveClosetName}
                  placeholder="Tina's Closet"
                  className="input input-bordered w-full rounded-xl mt-1.5"
                />
              </div>
              <div>
                <SectionLabel>Theme</SectionLabel>
                <select
                  value={theme}
                  onChange={e => handleThemeChange(e.target.value)}
                  className="select select-bordered rounded-xl mt-1.5 w-full"
                >
                  {THEMES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </Section>

          {/* Members (admin only) */}
          {isAdmin && (
            <Section icon={<Users size={16} strokeWidth={2} />} title="Members">
              <div>
                {members.length === 0 && pending.length === 0 ? (
                  <p className="text-[13px] text-base-content/40 py-6 text-center">No members yet.</p>
                ) : (
                  <>
                    <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
                      {members.map((m, i) => (
                        <div key={m.user_id} className={`flex items-center gap-3 px-4 py-3 ${i < members.length - 1 ? 'border-b border-base-200' : ''}`}>
                          <span className="flex-1 text-[13px] truncate">{m.email}</span>
                          {m.is_admin && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary shrink-0">
                              <ShieldCheck size={13} strokeWidth={2} /> Admin
                            </span>
                          )}
                          <button onClick={() => router.push(`/${m.user_id}/items`)} className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-base-content/45 hover:text-primary transition-colors">
                            Browse <ArrowUpRight size={12} strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {pending.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[11px] font-semibold text-base-content/45 uppercase tracking-wider mb-2">Pending approval</div>
                        <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
                          {pending.map((u, i) => (
                            <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${i < pending.length - 1 ? 'border-b border-base-200' : ''}`}>
                              <span className="flex-1 text-[13px] truncate text-base-content/60">{u.email}</span>
                              <button onClick={() => handleApprove(u.id)} disabled={isPending} className="btn btn-xs btn-primary rounded-full">
                                {isPending ? <span className="loading loading-spinner loading-xs" /> : 'Approve'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {pending.length === 0 && <p className="text-[12px] text-base-content/40 mt-3 px-1">No pending sign-ups.</p>}
                  </>
                )}
              </div>
            </Section>
          )}
        </div>

        {/* ── Col 2: Storage ───────────────────────────────────── */}
        <div>
          <Section icon={<MapPin size={16} strokeWidth={2} />} title="Storage">
            {/* Storage spots */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>Storage spots</SectionLabel>
                <button onClick={openNewLoc} className="btn btn-xs btn-ghost rounded-full gap-1 text-primary">
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {storageLocations.map(loc => {
                  const base = bases.find(b => b.id === loc.base_id)
                  const count = locationCounts[loc.id] ?? 0
                  return (
                    <div key={loc.id} className="flex items-center gap-3 bg-base-100 border border-base-200 rounded-2xl p-3">
                      <span className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/55">
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
                      <button onClick={() => openEditLoc(loc)} className="btn btn-circle btn-ghost btn-sm text-base-content/55">
                        <Pencil size={17} strokeWidth={1.8} />
                      </button>
                    </div>
                  )
                })}
                {storageLocations.length === 0 && (
                  <p className="text-[13px] text-base-content/40 py-4">No storage spots yet.</p>
                )}
              </div>
            </div>

            {/* Groups */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>Groups</SectionLabel>
                <button onClick={openNewBase} className="btn btn-xs btn-ghost rounded-full gap-1 text-primary">
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {bases.map(base => (
                  <button
                    key={base.id}
                    onClick={() => openEditBase(base)}
                    className="flex items-center gap-1.5 bg-base-200 hover:bg-base-300 rounded-full px-3 py-1.5 text-[13px] transition-colors"
                    disabled={isPending}
                  >
                    {base.name}
                    <Pencil size={11} strokeWidth={2} className="opacity-35" />
                  </button>
                ))}
                {bases.length === 0 && <p className="text-[13px] text-base-content/40 py-1">No groups yet.</p>}
              </div>
            </div>
          </Section>
        </div>

        {/* ── Col 3: Tags + Outfit slots ────────────────────────── */}
        <div>
          <Section icon={<TagIcon size={16} strokeWidth={2} />} title="Tags">
            {/* Tag groups */}
            <div className="mb-8">
              <div className="space-y-5 mb-5">
                {tagGroups.map(group => (
                  <TagGroupSection
                    key={group.id}
                    group={group}
                    newValue={newTagValues[group.id] ?? ''}
                    onNewValueChange={v => setNewTagValues(prev => ({ ...prev, [group.id]: v }))}
                    onAdd={() => handleAddTag(group.id, newTagValues[group.id] ?? '')}
                    onEdit={openEditTag}
                    onDeleteGroup={!group.is_system ? () => setDeletingGroup({ id: group.id, name: group.name }) : undefined}
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
                className="flex gap-2"
              >
                <input
                  className="flex-1 bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[14px]"
                  placeholder="New tag group name…"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                />
                <button className="btn btn-primary rounded-xl" type="submit" disabled={isPending}>Add group</button>
              </form>
            </div>

            {/* Outfit slots */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Outfit slots</SectionLabel>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {outfitSlots.map(slot => (
                  <div key={slot.id} className="flex items-center gap-3 bg-base-100 border border-base-200 rounded-2xl p-3">
                    <span className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/55">
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
                  </div>
                ))}
                {outfitSlots.length === 0 && <p className="text-[13px] text-base-content/40 py-2">No slots yet.</p>}
              </div>
              <div className="flex gap-2 items-center mb-2">
                <input
                  value={newSlotName}
                  onChange={e => setNewSlotName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSlot() }}
                  placeholder="New slot name…"
                  className="flex-1 bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[14px]"
                />
                <button onClick={handleAddSlot} disabled={!newSlotName.trim() || isPending} className="btn btn-primary rounded-xl disabled:opacity-40">
                  <Plus size={14} /> Add
                </button>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-base-content/60 cursor-pointer select-none">
                <button type="button" onClick={() => setNewSlotMultiple(v => !v)} className={newSlotMultiple ? 'text-primary' : 'text-base-content/30'}>
                  {newSlotMultiple ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                Allow multiple items in this slot
              </label>
            </div>
          </Section>
        </div>

      </div> {/* end 3-col grid */}

      {/* ── Storage spot modal ─────────────────────────────────── */}
      {editingLoc !== null && (
        <Dialog title={editingLoc.id ? 'Edit spot' : 'New storage spot'} onClose={() => setEditingLoc(null)}>
          {locConfirmDelete ? (
            <ConfirmDelete
              label={`"${locName}"`}
              detail={`${locationCounts[editingLoc.id!] ?? 0} pieces will become unassigned.`}
              onCancel={() => setLocConfirmDelete(false)}
              onConfirm={deleteLoc}
              isPending={isPending}
            />
          ) : (
            <div className="p-5 flex flex-col gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Name</div>
                <input
                  autoFocus
                  value={locName}
                  onChange={e => setLocName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveLoc() }}
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
              {editingLoc.id && (
                <p className="text-[12px] text-base-content/45">
                  {locationCounts[editingLoc.id] ?? 0} piece{(locationCounts[editingLoc.id] ?? 0) === 1 ? '' : 's'} stored here.
                </p>
              )}
              <div className="flex gap-2 pt-1">
                {editingLoc.id && (
                  <button onClick={() => setLocConfirmDelete(true)} className="btn btn-ghost rounded-full text-error" disabled={isPending}>
                    <Trash2 size={17} strokeWidth={1.8} />
                  </button>
                )}
                <button onClick={saveLoc} disabled={!locName.trim() || isPending} className="btn btn-primary rounded-full flex-1 disabled:opacity-40">
                  {isPending ? <span className="loading loading-spinner loading-sm" /> : editingLoc.id ? 'Save' : 'Add spot'}
                </button>
              </div>
            </div>
          )}
        </Dialog>
      )}

      {/* ── Group modal ────────────────────────────────────────── */}
      {editingBase !== null && (
        <Dialog title={editingBase.id ? 'Edit group' : 'New group'} onClose={() => setEditingBase(null)}>
          {baseConfirmDelete ? (
            <ConfirmDelete
              label={`"${baseEditName}"`}
              detail="Storage spots in this group won't be deleted, but will become ungrouped."
              onCancel={() => setBaseConfirmDelete(false)}
              onConfirm={deleteBase}
              isPending={isPending}
            />
          ) : (
            <div className="p-5 flex flex-col gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Name</div>
                <input
                  autoFocus
                  value={baseEditName}
                  onChange={e => setBaseEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveBase() }}
                  placeholder="e.g. Tina's, Shared"
                  className="w-full bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[15px]"
                />
              </div>
              <div className="flex gap-2">
                {editingBase.id && (
                  <button onClick={() => setBaseConfirmDelete(true)} className="btn btn-ghost rounded-full text-error" disabled={isPending}>
                    <Trash2 size={17} strokeWidth={1.8} />
                  </button>
                )}
                <button onClick={saveBase} disabled={!baseEditName.trim() || isPending} className="btn btn-primary rounded-full flex-1 disabled:opacity-40">
                  {isPending ? <span className="loading loading-spinner loading-sm" /> : editingBase.id ? 'Save' : 'Add group'}
                </button>
              </div>
            </div>
          )}
        </Dialog>
      )}

      {/* ── Tag edit modal ─────────────────────────────────────── */}
      {editingTag !== null && (
        <Dialog title="Edit tag" onClose={() => setEditingTag(null)}>
          {tagConfirmDelete ? (
            <ConfirmDelete
              label={`"${editingTag.value}"`}
              detail="This tag will be removed from all items that have it."
              onCancel={() => setTagConfirmDelete(false)}
              onConfirm={doDeleteTag}
              isPending={isPending}
            />
          ) : (
            <div className="p-5 flex flex-col gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Value</div>
                <div className="flex items-center gap-2">
                  {editingTag.isColor && <ColorDot name={tagEditValue} size={18} />}
                  <input
                    autoFocus
                    value={tagEditValue}
                    onChange={e => setTagEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveTag() }}
                    className="flex-1 bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[15px]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTagConfirmDelete(true)} className="btn btn-ghost rounded-full text-error" disabled={isPending}>
                  <Trash2 size={17} strokeWidth={1.8} />
                </button>
                <button onClick={saveTag} disabled={!tagEditValue.trim() || isPending} className="btn btn-primary rounded-full flex-1 disabled:opacity-40">
                  {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save'}
                </button>
              </div>
            </div>
          )}
        </Dialog>
      )}

      {/* ── Tag group delete confirmation ──────────────────────── */}
      {deletingGroup !== null && (
        <Dialog title="Delete tag group" onClose={() => setDeletingGroup(null)}>
          <ConfirmDelete
            label={`"${deletingGroup.name}"`}
            detail="All tags in this group will be permanently deleted and removed from items."
            onCancel={() => setDeletingGroup(null)}
            onConfirm={doDeleteTagGroup}
            isPending={isPending}
          />
        </Dialog>
      )}

      {/* ── Outfit slot modal ──────────────────────────────────── */}
      {editingSlot !== null && (
        <Dialog title="Edit slot" onClose={() => setEditingSlot(null)}>
          {slotConfirmDelete ? (
            <ConfirmDelete
              label={`"${editingSlot.name}"`}
              detail="This slot will be removed from all outfits."
              onCancel={() => setSlotConfirmDelete(false)}
              onConfirm={doDeleteSlot}
              isPending={isPending}
            />
          ) : (
            <div className="p-5 flex flex-col gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Name</div>
                <input
                  autoFocus
                  value={editingSlot.name}
                  onChange={e => setEditingSlot(s => s ? { ...s, name: e.target.value } : s)}
                  className="w-full bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[15px]"
                />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">Display order</div>
                <input
                  type="number"
                  value={editingSlot.order}
                  onChange={e => setEditingSlot(s => s ? { ...s, order: Number(e.target.value) } : s)}
                  className="w-full bg-base-200/60 rounded-xl px-3.5 h-11 outline-none focus:bg-base-200 text-[15px]"
                />
              </div>
              <label className="flex items-center gap-2 text-[13px] text-base-content/60 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setEditingSlot(s => s ? { ...s, multiple: !s.multiple } : s)}
                  className={editingSlot.multiple ? 'text-primary' : 'text-base-content/30'}
                >
                  {editingSlot.multiple ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                Allow multiple items
              </label>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setSlotConfirmDelete(true)} className="btn btn-ghost rounded-full text-error" disabled={isPending}>
                  <Trash2 size={17} strokeWidth={1.8} />
                </button>
                <button onClick={saveSlot} disabled={!editingSlot.name.trim() || isPending} className="btn btn-primary rounded-full flex-1 disabled:opacity-40">
                  {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save'}
                </button>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </div>
  )
}

// ── Shared section wrapper ─────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary/70">{icon}</span>
        <h2 className="font-semibold text-[15px]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

// ── Inline delete confirmation ─────────────────────────────────────────────
function ConfirmDelete({
  label, detail, onCancel, onConfirm, isPending,
}: {
  label: string
  detail: string
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <div className="p-5">
      <div className="flex items-start gap-3 mb-5">
        <AlertTriangle size={18} strokeWidth={1.8} className="text-error mt-0.5 shrink-0" />
        <div>
          <p className="text-[14px] font-semibold text-error">Delete {label}?</p>
          <p className="text-[12.5px] text-base-content/55 mt-1">{detail}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn btn-ghost rounded-full btn-sm">Cancel</button>
        <button onClick={onConfirm} disabled={isPending} className="btn btn-error rounded-full btn-sm gap-1.5 disabled:opacity-40">
          {isPending ? <span className="loading loading-spinner loading-xs" /> : <><Trash2 size={14} strokeWidth={1.8} /> Delete</>}
        </button>
      </div>
    </div>
  )
}

// ── Tag group section ──────────────────────────────────────────────────────
function TagGroupSection({
  group, newValue, onNewValueChange, onAdd, onEdit, onDeleteGroup, isPending,
}: {
  group: TagGroup
  newValue: string
  onNewValueChange: (v: string) => void
  onAdd: () => void
  onEdit: (tag: { id: string; value: string; isColor: boolean }) => void
  onDeleteGroup?: () => void
  isPending: boolean
}) {
  const isColor = group.name === 'Color'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[12px] font-medium text-base-content/55">{group.name}</div>
        {!group.is_system && onDeleteGroup && (
          <button onClick={onDeleteGroup} className="btn btn-ghost btn-xs text-error rounded-full gap-1">
            <Trash2 size={12} strokeWidth={2} /> Delete group
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {(group.tags ?? []).map(tag => (
          <button
            key={tag.id}
            onClick={() => onEdit({ id: tag.id, value: tag.value, isColor })}
            className="inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full bg-base-200 hover:bg-base-300 text-[13px] transition-colors"
            disabled={isPending}
          >
            {isColor && <ColorDot name={tag.value} size={12} />}
            {tag.value}
            <Pencil size={10} strokeWidth={2} className="opacity-35 ml-0.5" />
          </button>
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
