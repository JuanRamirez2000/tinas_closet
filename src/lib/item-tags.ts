import type { Item, Tag, TagGroup } from './types'

type TaggedItem = { tags: Tag }

function itemTagList(item: Item): TaggedItem[] {
  return (item.item_tags ?? []) as TaggedItem[]
}

export function getItemType(item: Item, typeGroup?: TagGroup): string | null {
  if (!typeGroup) return null
  return itemTagList(item).find(it => it.tags.group_id === typeGroup.id)?.tags.value ?? null
}

export function getItemColors(item: Item, colorGroup?: TagGroup): string[] {
  if (!colorGroup) return []
  return itemTagList(item).filter(it => it.tags.group_id === colorGroup.id).map(it => it.tags.value)
}

export function getItemStyles(item: Item, styleGroup?: TagGroup): string[] {
  if (!styleGroup) return []
  return itemTagList(item).filter(it => it.tags.group_id === styleGroup.id).map(it => it.tags.value)
}

export function getItemSeasons(item: Item, seasonGroup?: TagGroup): string[] {
  if (!seasonGroup) return []
  return itemTagList(item).filter(it => it.tags.group_id === seasonGroup.id).map(it => it.tags.value)
}
