import Chip from '@/components/Chip'
import FieldLabel from '@/components/FieldLabel'
import type { TagGroup } from '@/lib/types'

interface Props {
  group: TagGroup | undefined
  selectedIds: string[]
  onToggle: (tagId: string) => void
  withColor?: boolean
  Label?: React.ComponentType<{ children: React.ReactNode }>
}

export default function TagChipGroup({
  group,
  selectedIds,
  onToggle,
  withColor = false,
  Label = FieldLabel,
}: Props) {
  if (!group || !(group.tags ?? []).length) return null
  return (
    <div>
      <Label>{group.name}</Label>
      <div className="flex flex-wrap gap-1.5">
        {(group.tags ?? []).map(tag => (
          <Chip
            key={tag.id}
            size="sm"
            active={selectedIds.includes(tag.id)}
            onClick={() => onToggle(tag.id)}
            color={withColor ? tag.value : undefined}
          >
            {tag.value}
          </Chip>
        ))}
      </div>
    </div>
  )
}
