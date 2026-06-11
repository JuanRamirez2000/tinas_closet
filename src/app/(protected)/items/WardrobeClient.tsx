'use client'

import { useState, useMemo, useTransition, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIsAdmin } from '@/context/admin'
import {
  Search, X, SlidersHorizontal, ArrowUpDown, Box,
  LayoutGrid, Plus, Heart,
} from 'lucide-react'
import ItemCard from '@/components/ItemCard'
import Chip from '@/components/Chip'
import BottomSheet from '@/components/BottomSheet'
import ColorDot from '@/components/ColorDot'
import SectionLabel from '@/components/SectionLabel'
import { bulkMoveItems, toggleFavorite } from '@/app/actions/items'
import { getItemType, getItemColors, getItemStyles, getItemSeasons } from '@/lib/item-tags'
import EditItemModal from './EditItemModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import QuickAddModal from './QuickAddModal'
import type { Item, StorageLocation, TagGroup } from '@/lib/types'

interface Props {
  items: Item[]
  storageLocations: StorageLocation[]
  tagGroups: TagGroup[]
  locationCount: number
}

export default function WardrobeClient({ items, storageLocations, tagGroups, locationCount }: Props) {
  const router = useRouter()
  const isAdmin = useIsAdmin()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [filterOpen, setFilterOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)

  const [filterColors, setFilterColors] = useState<string[]>([])
  const [filterStyles, setFilterStyles] = useState<string[]>([])
  const [filterSeasons, setFilterSeasons] = useState<string[]>([])
  const [filterLocations, setFilterLocations] = useState<string[]>([])
  const [filterFavorites, setFilterFavorites] = useState(false)

  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deletingItem, setDeletingItem] = useState<Item | null>(null)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    const open = () => setQuickAddOpen(true)
    window.addEventListener('quick-add:open', open)
    return () => window.removeEventListener('quick-add:open', open)
  }, [isAdmin])

  const typeGroup   = useMemo(() => tagGroups.find(g => g.name === 'Type'),   [tagGroups])
  const colorGroup  = useMemo(() => tagGroups.find(g => g.name === 'Color'),  [tagGroups])
  const styleGroup  = useMemo(() => tagGroups.find(g => g.name === 'Style'),  [tagGroups])
  const seasonGroup = useMemo(() => tagGroups.find(g => g.name === 'Season'), [tagGroups])

  const types   = useMemo(() => typeGroup?.tags?.map(t => t.value) ?? [],   [typeGroup])
  const colors  = useMemo(() => colorGroup?.tags?.map(t => t.value) ?? [],  [colorGroup])
  const styles  = useMemo(() => styleGroup?.tags?.map(t => t.value) ?? [],  [styleGroup])
  const seasons = useMemo(() => seasonGroup?.tags?.map(t => t.value) ?? [], [seasonGroup])

  const activeCount =
    filterColors.length + filterStyles.length + filterSeasons.length +
    filterLocations.length + (filterFavorites ? 1 : 0)

  function clearFilters() {
    setFilterColors([]); setFilterStyles([]); setFilterSeasons([])
    setFilterLocations([]); setFilterFavorites(false); setSelectedType('All'); setSearch('')
  }

  const filtered = useMemo(() => {
    return items.filter(item => {
      const iType    = getItemType(item, typeGroup)
      const iColors  = getItemColors(item, colorGroup)
      const iStyles  = getItemStyles(item, styleGroup)
      const iSeasons = getItemSeasons(item, seasonGroup)
      if (selectedType !== 'All' && iType !== selectedType) return false
      if (filterColors.length && !iColors.some(c => filterColors.includes(c))) return false
      if (filterStyles.length && !iStyles.some(s => filterStyles.includes(s))) return false
      if (filterSeasons.length && !iSeasons.some(s => filterSeasons.includes(s))) return false
      if (filterLocations.length && !filterLocations.includes(item.storage_location_id ?? '')) return false
      if (filterFavorites && !item.favorite) return false
      if (search) {
        const hay = [item.name, iType ?? '', ...iColors, ...iStyles, ...iSeasons, item.notes ?? ''].join(' ').toLowerCase()
        if (!hay.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [items, selectedType, filterColors, filterStyles, filterSeasons, filterLocations, filterFavorites, search, typeGroup, colorGroup, styleGroup, seasonGroup])

  function toggleArr<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
  }

  function exitSelect() { setSelecting(false); setSelected(new Set()) }

  const handleItemTap = useCallback((item: Item) => {
    if (selecting) {
      setSelected(prev => {
        const next = new Set(prev)
        next.has(item.id) ? next.delete(item.id) : next.add(item.id)
        return next
      })
    } else {
      setEditingItem(item)
    }
  }, [selecting])

  const handleToggleFav = useCallback((item: Item) => {
    startTransition(() => toggleFavorite(item.id, !item.favorite))
  }, [startTransition])

  function doMove(locationId: string) {
    startTransition(async () => {
      await bulkMoveItems([...selected], locationId)
      setMoveOpen(false)
      exitSelect()
    })
  }

  const filterProps = {
    colors, styles, seasons, storageLocations,
    filterColors, filterStyles, filterSeasons, filterLocations, filterFavorites,
    setFilterColors, setFilterStyles, setFilterSeasons, setFilterLocations, setFilterFavorites,
    toggleArr, filtered,
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-base-200">

      {/* ── Desktop filter sidebar ──────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[250px] shrink-0 self-start sticky top-[72px] mx-4 mt-4 mb-4 rounded-2xl bg-base-100 shadow-sm overflow-y-auto max-h-[calc(100vh-5.5rem)] py-5 px-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/35 mb-3 px-1">
          {items.length} pieces · {locationCount} spots
        </div>
        <FilterBody {...filterProps} />
        {activeCount > 0 && (
          <button onClick={clearFilters} className="mt-1 btn btn-ghost btn-sm rounded-full self-start -ml-2 text-base-content/55">
            Clear all
          </button>
        )}
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="px-4 pt-3 pb-2 shrink-0 lg:px-6 lg:pt-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-serif text-[26px] leading-none tracking-tight whitespace-nowrap lg:hidden">
                Tina&apos;s Closet
              </h1>
              <p className="text-[12px] text-base-content/45 mt-1 lg:hidden">
                {items.length} pieces · {locationCount} spots
              </p>
              <p className="hidden lg:block text-[13px] font-medium text-base-content/60 pt-1">
                {filtered.length !== items.length
                  ? `${filtered.length} of ${items.length} pieces`
                  : `${items.length} pieces`}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => selecting ? exitSelect() : setSelecting(true)}
                className={`btn btn-sm rounded-full ${
                  selecting ? 'btn-ghost' : 'bg-base-200 border-0 text-base-content/70'
                }`}
              >
                {selecting ? 'Cancel' : 'Select'}
              </button>
            )}
          </div>

          {/* Search */}
          <label className="mt-3 flex items-center gap-2 bg-base-100 border border-base-300 rounded-2xl px-3.5 h-11 text-base-content/55">
            <Search size={18} strokeWidth={1.9} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your wardrobe"
              className="bg-transparent outline-none w-full text-[15px] text-base-content placeholder:text-base-content/40"
            />
            {search && (
              <button onClick={() => setSearch('')}><X size={16} strokeWidth={2.1} /></button>
            )}
          </label>

          {/* Type chips + filter button (filter button only on mobile) */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-2 overflow-x-auto no-sb -mx-1 px-1 py-0.5 flex-1">
              {['All', ...types].map(tp => (
                <Chip key={tp} active={selectedType === tp} onClick={() => setSelectedType(tp)} size="sm">{tp}</Chip>
              ))}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className={`lg:hidden shrink-0 relative btn btn-sm btn-square rounded-xl ${
                activeCount ? 'btn-primary' : 'bg-base-100 border border-base-300 text-base-content/70'
              }`}
            >
              <SlidersHorizontal size={18} strokeWidth={1.9} />
              {activeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-content text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 px-4 pb-28 lg:pb-10 lg:px-6">
          {filtered.length === 0 ? (
            <EmptyGrid hasItems={items.length > 0} onClear={clearFilters} />
          ) : (
            <div className="grid gap-3 pt-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {filtered.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  tagGroups={tagGroups}
                  selecting={selecting}
                  selected={selected.has(item.id)}
                  onTap={handleItemTap}
                  onToggleFav={handleToggleFav}
                  onEdit={isAdmin ? setEditingItem : undefined}
                  onDelete={isAdmin ? setDeletingItem : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Selection action bar ────────────────────────────────── */}
      {selecting && (
        <div className="fixed left-0 right-0 bottom-0 z-40 px-4 pb-24 pt-3 bg-gradient-to-t from-base-100 via-base-100 to-transparent pointer-events-none lg:left-[282px] lg:pb-6">
          <div className="bg-neutral text-neutral-content rounded-2xl shadow-xl flex items-center justify-between px-4 py-2.5 pointer-events-auto">
            <span className="text-[14px] font-medium">{selected.size} selected</span>
            <button
              disabled={!selected.size || isPending}
              onClick={() => setMoveOpen(true)}
              className="btn btn-sm btn-primary rounded-full gap-1.5 disabled:opacity-40"
            >
              <ArrowUpDown size={16} strokeWidth={1.8} /> Move to…
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile filter sheet ─────────────────────────────────── */}
      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters">
        <FilterBody {...filterProps} />
        <div className="flex gap-2 mt-5 sticky bottom-0 pb-1">
          <button onClick={clearFilters} className="btn btn-ghost rounded-full flex-1">Clear all</button>
          <button onClick={() => setFilterOpen(false)} className="btn btn-primary rounded-full flex-[2]">
            Show {filtered.length} pieces
          </button>
        </div>
      </BottomSheet>

      {/* ── Quick add modal ─────────────────────────────────────── */}
      <QuickAddModal
        open={quickAddOpen}
        storageLocations={storageLocations}
        tagGroups={tagGroups}
        onClose={() => setQuickAddOpen(false)}
      />

      {/* ── Edit modal ──────────────────────────────────────────── */}
      <EditItemModal
        item={editingItem}
        storageLocations={storageLocations}
        tagGroups={tagGroups}
        onClose={() => setEditingItem(null)}
      />

      {/* ── Delete modal ────────────────────────────────────────── */}
      <DeleteConfirmModal
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
      />

      {/* ── Move sheet ──────────────────────────────────────────── */}
      <BottomSheet open={moveOpen} onClose={() => setMoveOpen(false)} title={`Move ${selected.size} item${selected.size === 1 ? '' : 's'} to…`}>
        <div className="flex flex-col gap-1.5">
          {storageLocations.map(loc => {
            const base = (loc as StorageLocation & { base_locations?: { name: string } }).base_locations
            return (
              <button
                key={loc.id}
                onClick={() => doMove(loc.id)}
                disabled={isPending}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-base-200 text-left"
              >
                <span className="w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center text-base-content/60">
                  <Box size={18} strokeWidth={1.7} />
                </span>
                <span className="flex-1">
                  <span className="font-medium block leading-tight">{loc.name}</span>
                  {base && <span className="text-[12px] text-base-content/45">{base.name}</span>}
                </span>
                <ArrowUpDown size={16} strokeWidth={1.8} />
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </div>
  )
}

// ── Shared filter body ─────────────────────────────────────────────────────
interface FilterBodyProps {
  colors: string[]
  styles: string[]
  seasons: string[]
  storageLocations: StorageLocation[]
  filterColors: string[]
  filterStyles: string[]
  filterSeasons: string[]
  filterLocations: string[]
  filterFavorites: boolean
  setFilterColors: React.Dispatch<React.SetStateAction<string[]>>
  setFilterStyles: React.Dispatch<React.SetStateAction<string[]>>
  setFilterSeasons: React.Dispatch<React.SetStateAction<string[]>>
  setFilterLocations: React.Dispatch<React.SetStateAction<string[]>>
  setFilterFavorites: React.Dispatch<React.SetStateAction<boolean>>
  toggleArr: <T>(arr: T[], val: T) => T[]
  filtered: Item[]
}

const SEASON_ICON: Record<string, string> = {
  Spring: '🌸', Summer: '☀️', Fall: '🍂', Winter: '❄️', 'All-season': '✦',
}

function FilterBody({
  colors, styles, seasons, storageLocations,
  filterColors, filterStyles, filterSeasons, filterLocations, filterFavorites,
  setFilterColors, setFilterStyles, setFilterSeasons, setFilterLocations, setFilterFavorites,
  toggleArr,
}: FilterBodyProps) {
  return (
    <div>
      <button
        onClick={() => setFilterFavorites(!filterFavorites)}
        className={`mb-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[13px] font-medium transition-colors ${
          filterFavorites ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 border-base-300'
        }`}
      >
        <Heart size={15} strokeWidth={1.8} fill={filterFavorites ? 'currentColor' : 'none'} /> Favorites
      </button>

      {seasons.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Season</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {seasons.map(s => (
              <Chip key={s} size="sm" active={filterSeasons.includes(s)} onClick={() => setFilterSeasons(prev => toggleArr(prev, s))}>
                <span>{SEASON_ICON[s] ?? ''}</span> {s}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Color</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {colors.map(c => (
              <Chip key={c} color={c} size="sm" active={filterColors.includes(c)} onClick={() => setFilterColors(prev => toggleArr(prev, c))}>{c}</Chip>
            ))}
          </div>
        </div>
      )}

      {styles.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Style</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {styles.map(s => (
              <Chip key={s} size="sm" active={filterStyles.includes(s)} onClick={() => setFilterStyles(prev => toggleArr(prev, s))}>{s}</Chip>
            ))}
          </div>
        </div>
      )}

      {storageLocations.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Location</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {storageLocations.map(l => (
              <Chip key={l.id} size="sm" active={filterLocations.includes(l.id)} onClick={() => setFilterLocations(prev => toggleArr(prev, l.id))}>
                {l.name}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Empty grid ─────────────────────────────────────────────────────────────
function EmptyGrid({ hasItems, onClear }: { hasItems: boolean; onClear: () => void }) {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-8">
      <div className="w-16 h-16 rounded-3xl bg-base-200 flex items-center justify-center text-base-content/35 mb-4">
        <LayoutGrid size={30} strokeWidth={1.9} />
      </div>
      <h3 className="font-serif text-xl mb-1">
        {hasItems ? 'No matches' : 'Your wardrobe is empty'}
      </h3>
      <p className="text-[13.5px] text-base-content/50 max-w-[230px] mb-5">
        {hasItems
          ? 'Nothing fits those filters yet. Try loosening them.'
          : 'Add your first piece — it takes just a few taps.'}
      </p>
      {hasItems ? (
        <button onClick={onClear} className="btn btn-sm btn-ghost rounded-full">Clear filters</button>
      ) : (
        <button onClick={() => router.push('/quick-add')} className="btn btn-primary rounded-full gap-1.5">
          <Plus size={17} strokeWidth={2.2} /> Add a piece
        </button>
      )}
    </div>
  )
}
