'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppStore } from '@/store/useAppStore'
import {
  getMonthlyPointsSummary,
  type MonthlyPointsSummary,
} from '@/application/stats/getMonthlyPointsSummary'
import type { ShiftType } from '@/domain/types'

export interface ReorderModalState {
  isOpen: boolean
  shift: ShiftType
}

interface UsePointsReportViewResult {
  copiedTitle: string | false
  monthLabel: string
  reorderModal: ReorderModalState
  summary: MonthlyPointsSummary
  closeReorderModal: () => void
  handleCopy: (text: string, title: string) => void
  openReorderModal: (shift: ShiftType) => void
}

export function usePointsReportView(currentDate: Date): UsePointsReportViewResult {
  const [copiedTitle, setCopiedTitle] = useState<string | false>(false)
  const [reorderModal, setReorderModal] = useState<ReorderModalState>({
    isOpen: false,
    shift: 'DAY',
  })
  const { representatives, incidents } = useAppStore(state => ({
    representatives: state.representatives,
    incidents: state.incidents,
  }))

  const monthISO = useMemo(() => format(currentDate, 'yyyy-MM'), [currentDate])
  const monthLabel = useMemo(
    () => format(currentDate, 'MMMM yyyy', { locale: es }),
    [currentDate]
  )

  const summary = useMemo(
    () => getMonthlyPointsSummary(representatives, incidents, monthISO),
    [representatives, incidents, monthISO]
  )

  const handleCopy = (text: string, title: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTitle(title)
      setTimeout(() => setCopiedTitle(false), 2500)
    })
  }

  return {
    copiedTitle,
    monthLabel,
    reorderModal,
    summary,
    closeReorderModal: () =>
      setReorderModal(currentState => ({ ...currentState, isOpen: false })),
    handleCopy,
    openReorderModal: shift => setReorderModal({ isOpen: true, shift }),
  }
}
