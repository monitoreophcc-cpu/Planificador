'use client'

import { useMonthlySummary } from '@/hooks/useMonthlySummary'
import { PersonDetailModal } from './PersonDetailModal'

interface Props {
  month: string | null
  personId: string
  onClose: () => void
}

export function LazyPersonDetailModal({ month, personId, onClose }: Props) {
  const summary = useMonthlySummary(month)

  if (!month || !summary) {
    return null
  }

  return (
    <PersonDetailModal
      summary={summary}
      personId={personId}
      onClose={onClose}
    />
  )
}
