import type { Representative } from '@/domain/types'

export type AbsenceConfirmState = {
  isOpen: boolean
  rep: Representative | null
  onConfirm: (isJustified: boolean) => void
  onCancel: () => void
}

export const initialAbsenceConfirmState: AbsenceConfirmState = {
  isOpen: false,
  rep: null,
  onConfirm: () => {},
  onCancel: () => {},
}
