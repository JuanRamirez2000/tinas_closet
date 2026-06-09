// Static seed data for the /dev preview route.
// Only used in the dev layout — never imported by production code.

import type { BaseLocation, Item, OutfitSlot, StorageLocation, TagGroup, Outfit } from './types'

export const devBases: BaseLocation[] = [
  { id: 'base-1', created_by: 'dev', name: "Juan's" },
  { id: 'base-2', created_by: 'dev', name: "Tina's" },
]

export const devStorageLocations: StorageLocation[] = [
  { id: 'slot-1', created_by: 'dev', base_id: 'base-1', name: 'Closet', base_locations: devBases[0] },
  { id: 'slot-2', created_by: 'dev', base_id: 'base-1', name: 'Under bed', base_locations: devBases[0] },
  { id: 'slot-3', created_by: 'dev', base_id: 'base-2', name: 'Closet', base_locations: devBases[1] },
  { id: 'slot-4', created_by: 'dev', base_id: 'base-2', name: 'Bin A', base_locations: devBases[1] },
]

export const devTagGroups: TagGroup[] = [
  {
    id: 'tg-1', created_by: 'dev', name: 'Color', is_system: true,
    tags: [
      { id: 't-1', group_id: 'tg-1', value: 'Black' },
      { id: 't-2', group_id: 'tg-1', value: 'White' },
      { id: 't-3', group_id: 'tg-1', value: 'Blue' },
    ],
  },
  {
    id: 'tg-2', created_by: 'dev', name: 'Type', is_system: true,
    tags: [
      { id: 't-4', group_id: 'tg-2', value: 'T-Shirt' },
      { id: 't-5', group_id: 'tg-2', value: 'Pants' },
      { id: 't-6', group_id: 'tg-2', value: 'Shoes' },
      { id: 't-7', group_id: 'tg-2', value: 'Jacket' },
    ],
  },
  {
    id: 'tg-3', created_by: 'dev', name: 'Style', is_system: true,
    tags: [
      { id: 't-8', group_id: 'tg-3', value: 'Casual' },
      { id: 't-9', group_id: 'tg-3', value: 'Formal' },
    ],
  },
]

export const devItems: Item[] = [
  {
    id: 'item-1', created_by: 'dev', name: 'Blue denim jacket', notes: 'Size M, Levis',
    image_url: null, storage_location_id: 'slot-1', status: 'available', favorite: false,
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
    storage_locations: devStorageLocations[0],
    item_tags: [
      { tags: { id: 't-3', group_id: 'tg-1', value: 'Blue' } },
      { tags: { id: 't-7', group_id: 'tg-2', value: 'Jacket' } },
      { tags: { id: 't-8', group_id: 'tg-3', value: 'Casual' } },
    ],
  },
  {
    id: 'item-2', created_by: 'dev', name: 'White linen shirt', notes: null,
    image_url: null, storage_location_id: 'slot-1', status: 'available', favorite: false,
    created_at: '2025-01-02T00:00:00Z', updated_at: '2025-01-02T00:00:00Z',
    storage_locations: devStorageLocations[0],
    item_tags: [
      { tags: { id: 't-2', group_id: 'tg-1', value: 'White' } },
      { tags: { id: 't-4', group_id: 'tg-2', value: 'T-Shirt' } },
    ],
  },
  {
    id: 'item-3', created_by: 'dev', name: 'Black slim jeans', notes: 'Size 32',
    image_url: null, storage_location_id: 'slot-3', status: 'laundry', favorite: false,
    created_at: '2025-01-03T00:00:00Z', updated_at: '2025-01-03T00:00:00Z',
    storage_locations: devStorageLocations[2],
    item_tags: [
      { tags: { id: 't-1', group_id: 'tg-1', value: 'Black' } },
      { tags: { id: 't-5', group_id: 'tg-2', value: 'Pants' } },
    ],
  },
  {
    id: 'item-4', created_by: 'dev', name: 'White sneakers', notes: 'Nike AF1',
    image_url: null, storage_location_id: 'slot-2', status: 'available', favorite: false,
    created_at: '2025-01-04T00:00:00Z', updated_at: '2025-01-04T00:00:00Z',
    storage_locations: devStorageLocations[1],
    item_tags: [
      { tags: { id: 't-2', group_id: 'tg-1', value: 'White' } },
      { tags: { id: 't-6', group_id: 'tg-2', value: 'Shoes' } },
    ],
  },
  {
    id: 'item-5', created_by: 'dev', name: 'Black blazer', notes: null,
    image_url: null, storage_location_id: 'slot-4', status: 'available', favorite: false,
    created_at: '2025-01-05T00:00:00Z', updated_at: '2025-01-05T00:00:00Z',
    storage_locations: devStorageLocations[3],
    item_tags: [
      { tags: { id: 't-1', group_id: 'tg-1', value: 'Black' } },
      { tags: { id: 't-7', group_id: 'tg-2', value: 'Jacket' } },
      { tags: { id: 't-9', group_id: 'tg-3', value: 'Formal' } },
    ],
  },
  {
    id: 'item-6', created_by: 'dev', name: 'Blue chinos', notes: null,
    image_url: null, storage_location_id: 'slot-1', status: 'available', favorite: false,
    created_at: '2025-01-06T00:00:00Z', updated_at: '2025-01-06T00:00:00Z',
    storage_locations: devStorageLocations[0],
    item_tags: [
      { tags: { id: 't-3', group_id: 'tg-1', value: 'Blue' } },
      { tags: { id: 't-5', group_id: 'tg-2', value: 'Pants' } },
    ],
  },
]

export const devSlots: OutfitSlot[] = [
  { id: 'slot-layer',  created_by: 'dev', name: 'Layer',       display_order: 1, allow_multiple: false },
  { id: 'slot-top',   created_by: 'dev', name: 'Top',          display_order: 2, allow_multiple: false },
  { id: 'slot-bottom',created_by: 'dev', name: 'Bottom',       display_order: 3, allow_multiple: false },
  { id: 'slot-shoes', created_by: 'dev', name: 'Shoes',        display_order: 4, allow_multiple: false },
  { id: 'slot-bag',   created_by: 'dev', name: 'Bag',          display_order: 5, allow_multiple: false },
  { id: 'slot-acc',   created_by: 'dev', name: 'Accessories',  display_order: 6, allow_multiple: true  },
]

export const devOutfits: Outfit[] = [
  {
    id: 'outfit-1', created_by: 'dev', name: 'Casual Friday',
    outfit_items: [
      { item_id: devItems[0].id, slot_id: 'slot-layer', items: devItems[0] },
      { item_id: devItems[1].id, slot_id: 'slot-top',   items: devItems[1] },
      { item_id: devItems[3].id, slot_id: 'slot-shoes', items: devItems[3] },
    ] as never,
  },
]
