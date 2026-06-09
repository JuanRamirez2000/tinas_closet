import QuickAddClient from '@/app/(protected)/quick-add/QuickAddClient'
import { devBases, devStorageLocations, devTagGroups } from '@/lib/dev-seed'

async function devSave(formData: FormData): Promise<string> {
  'use server'
  console.log('[dev] quick-add item', Object.fromEntries(formData))
  return 'dev-item-id'
}

export default function DevQuickAddPage() {
  return (
    <QuickAddClient
      bases={devBases}
      storageLocations={devStorageLocations as never}
      tagGroups={devTagGroups as never}
      onSave={devSave}
    />
  )
}
