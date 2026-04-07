'use client'

import {
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

export function useManagerScheduleDnd(
  managerIds: string[],
  onReorder: (newOrder: string[]) => void
) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = managerIds.findIndex(managerId => managerId === active.id)
    const newIndex = managerIds.findIndex(managerId => managerId === over.id)
    const newOrder = arrayMove(managerIds, oldIndex, newIndex)

    onReorder(newOrder)
  }

  return { sensors, handleDragEnd }
}
