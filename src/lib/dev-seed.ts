// Static seed data for the /dev preview route.
// Only used in the dev layout — never imported by production code.

import type { BaseLocation, Item, OutfitSlot, StorageLocation, TagGroup, Outfit } from './types'

export const devBases: BaseLocation[] = [
  { id: 'base-1', created_by: 'dev', name: 'Bedroom Closet' },
  { id: 'base-2', created_by: 'dev', name: 'Storage Room' },
]

export const devStorageLocations: StorageLocation[] = [
  { id: 'slot-1', created_by: 'dev', base_id: 'base-1', name: 'Hanging Rail', base_locations: devBases[0] },
  { id: 'slot-2', created_by: 'dev', base_id: 'base-1', name: 'Shoe Rack',    base_locations: devBases[0] },
  { id: 'slot-3', created_by: 'dev', base_id: 'base-2', name: 'Top Drawer',   base_locations: devBases[1] },
  { id: 'slot-4', created_by: 'dev', base_id: 'base-2', name: 'Top Shelf',    base_locations: devBases[1] },
]

export const devTagGroups: TagGroup[] = [
  {
    id: 'tg-type', created_by: 'dev', name: 'Type', is_system: true,
    tags: [
      { id: 'type-tops',      group_id: 'tg-type', value: 'Tops' },
      { id: 'type-bottoms',   group_id: 'tg-type', value: 'Bottoms' },
      { id: 'type-dresses',   group_id: 'tg-type', value: 'Dresses' },
      { id: 'type-outerwear', group_id: 'tg-type', value: 'Outerwear' },
      { id: 'type-shoes',     group_id: 'tg-type', value: 'Shoes' },
      { id: 'type-bags',      group_id: 'tg-type', value: 'Bags' },
      { id: 'type-active',    group_id: 'tg-type', value: 'Activewear' },
      { id: 'type-acc',       group_id: 'tg-type', value: 'Accessories' },
    ],
  },
  {
    id: 'tg-color', created_by: 'dev', name: 'Color', is_system: true,
    tags: [
      { id: 'col-black',  group_id: 'tg-color', value: 'Black' },
      { id: 'col-white',  group_id: 'tg-color', value: 'White' },
      { id: 'col-grey',   group_id: 'tg-color', value: 'Grey' },
      { id: 'col-beige',  group_id: 'tg-color', value: 'Beige' },
      { id: 'col-brown',  group_id: 'tg-color', value: 'Brown' },
      { id: 'col-navy',   group_id: 'tg-color', value: 'Navy' },
      { id: 'col-blue',   group_id: 'tg-color', value: 'Blue' },
      { id: 'col-red',    group_id: 'tg-color', value: 'Red' },
      { id: 'col-pink',   group_id: 'tg-color', value: 'Pink' },
      { id: 'col-green',  group_id: 'tg-color', value: 'Green' },
    ],
  },
  {
    id: 'tg-style', created_by: 'dev', name: 'Style', is_system: true,
    tags: [
      { id: 'sty-casual',  group_id: 'tg-style', value: 'Casual' },
      { id: 'sty-formal',  group_id: 'tg-style', value: 'Formal' },
      { id: 'sty-smart',   group_id: 'tg-style', value: 'Smart casual' },
      { id: 'sty-street',  group_id: 'tg-style', value: 'Streetwear' },
      { id: 'sty-boho',    group_id: 'tg-style', value: 'Bohemian' },
      { id: 'sty-minimal', group_id: 'tg-style', value: 'Minimalist' },
      { id: 'sty-preppy',  group_id: 'tg-style', value: 'Preppy' },
      { id: 'sty-romantic',group_id: 'tg-style', value: 'Romantic' },
    ],
  },
]

function item(
  id: string, name: string, storageIdx: number,
  typeId: string, colorIds: string[], styleIds: string[],
  favorite = false, notes: string | null = null,
): Item {
  return {
    id, name, notes, favorite,
    created_by: 'dev', status: 'available',
    image_url: null,
    storage_location_id: devStorageLocations[storageIdx].id,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    storage_locations: devStorageLocations[storageIdx],
    item_tags: [
      { tags: devTagGroups[0].tags!.find(t => t.id === typeId)! },
      ...colorIds.map(cid => ({ tags: devTagGroups[1].tags!.find(t => t.id === cid)! })),
      ...styleIds.map(sid => ({ tags: devTagGroups[2].tags!.find(t => t.id === sid)! })),
    ].filter(it => it.tags),
  }
}

export const devItems: Item[] = [
  item('item-1',  'Blush puff-sleeve blouse',  0, 'type-tops',      ['col-pink'],  ['sty-romantic'], true),
  item('item-2',  'White linen shirt',          0, 'type-tops',      ['col-white'], ['sty-minimal']),
  item('item-3',  'Navy blazer',                0, 'type-outerwear', ['col-navy'],  ['sty-smart', 'sty-formal']),
  item('item-4',  'Black slim jeans',           2, 'type-bottoms',   ['col-black'], ['sty-casual'], false, 'Size 32'),
  item('item-5',  'Beige trench coat',          0, 'type-outerwear', ['col-beige'], ['sty-minimal', 'sty-smart']),
  item('item-6',  'White sneakers',             1, 'type-shoes',     ['col-white'], ['sty-casual', 'sty-street'], false, 'Nike Air Force 1'),
  item('item-7',  'Brown leather loafers',      1, 'type-shoes',     ['col-brown'], ['sty-smart', 'sty-preppy']),
  item('item-8',  'Grey knit sweater',          2, 'type-tops',      ['col-grey'],  ['sty-casual', 'sty-minimal']),
  item('item-9',  'Floral midi dress',          0, 'type-dresses',   ['col-pink'],  ['sty-romantic', 'sty-boho'], true),
  item('item-10', 'Black leather handbag',      3, 'type-bags',      ['col-black'], ['sty-minimal', 'sty-formal']),
  item('item-11', 'Blue denim jacket',          0, 'type-outerwear', ['col-blue'],  ['sty-casual', 'sty-street']),
  item('item-12', 'Red wrap dress',             0, 'type-dresses',   ['col-red'],   ['sty-romantic']),
]

export const devSlots: OutfitSlot[] = [
  { id: 'slot-layer',   created_by: 'dev', name: 'Layer',       display_order: 1, allow_multiple: false },
  { id: 'slot-top',     created_by: 'dev', name: 'Top',         display_order: 2, allow_multiple: false },
  { id: 'slot-bottom',  created_by: 'dev', name: 'Bottom',      display_order: 3, allow_multiple: false },
  { id: 'slot-shoes',   created_by: 'dev', name: 'Shoes',       display_order: 4, allow_multiple: false },
  { id: 'slot-bag',     created_by: 'dev', name: 'Bag',         display_order: 5, allow_multiple: false },
  { id: 'slot-acc',     created_by: 'dev', name: 'Accessories', display_order: 6, allow_multiple: true  },
]

export const devOutfits: Outfit[] = [
  {
    id: 'outfit-1', created_by: 'dev', name: 'Casual Friday',
    outfit_items: [
      { item_id: 'item-11', slot_id: 'slot-layer', items: devItems[10] },
      { item_id: 'item-2',  slot_id: 'slot-top',   items: devItems[1] },
      { item_id: 'item-4',  slot_id: 'slot-bottom',items: devItems[3] },
      { item_id: 'item-6',  slot_id: 'slot-shoes', items: devItems[5] },
    ] as never,
  },
]
