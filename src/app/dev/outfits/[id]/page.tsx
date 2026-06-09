import OutfitBuilderClient from '@/app/(protected)/outfits/[id]/OutfitBuilderClient'
import { devItems, devOutfits, devSlots } from '@/lib/dev-seed'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DevOutfitDetailPage({ params }: Props) {
  const { id } = await params
  const outfit = devOutfits.find(o => o.id === id)
  if (!outfit) notFound()

  return (
    <OutfitBuilderClient
      outfit={outfit as never}
      slots={devSlots}
      allItems={devItems as never}
    />
  )
}
