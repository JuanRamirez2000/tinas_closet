import WardrobeClient from '@/app/(protected)/items/WardrobeClient'
import { devItems, devStorageLocations, devTagGroups } from '@/lib/dev-seed'
import type { Item, StorageLocation, TagGroup } from '@/lib/types'

export default function DevHomePage() {
  return (
    <WardrobeClient
      items={devItems as unknown as Item[]}
      storageLocations={devStorageLocations as unknown as StorageLocation[]}
      tagGroups={devTagGroups as unknown as TagGroup[]}
      locationCount={devStorageLocations.length}
    />
  )
}
