import type { Representative, ShiftType } from '@/domain/types'

export function sortPlannerRepresentativesForShift(
  representatives: Representative[],
  activeShift: ShiftType
): Representative[] {
  return [...representatives].sort((left, right) => {
    const leftShiftPriority = left.baseShift === activeShift ? 0 : 1
    const rightShiftPriority = right.baseShift === activeShift ? 0 : 1

    if (leftShiftPriority !== rightShiftPriority) {
      return leftShiftPriority - rightShiftPriority
    }

    const orderDelta = (left.orderIndex ?? Number.MAX_SAFE_INTEGER) -
      (right.orderIndex ?? Number.MAX_SAFE_INTEGER)
    if (orderDelta !== 0) {
      return orderDelta
    }

    const nameDelta = left.name.localeCompare(right.name, 'es')
    if (nameDelta !== 0) {
      return nameDelta
    }

    return left.id.localeCompare(right.id)
  })
}
