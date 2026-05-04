'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { AlertTriangle, ArrowRight, CalendarRange, Download, Link2, Printer, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store'
import {
  buildComparisonPeriodSummary,
  buildComparisonSelectionOptions,
  resolveComparisonRange,
} from '@/ui/reports/analysis-beta/services/comparison.service'
import {
  loadCachedDailySources,
} from '@/ui/reports/analysis-beta/services/report-source-cache.service'
import { buildOperationalCompetitiveReport } from '@/application/reports/buildOperationalCompetitiveReport'
import type {
  OperationalCompetitiveComparisonPreset,
  OperationalCompetitivePeriodKind,
  OperationalCompetitiveResolvedPeriod,
} from '@/domain/reports/operationalTypes'
import { OperationalCompetitiveShiftLeaderboard } from './OperationalCompetitiveShiftLeaderboard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/reports/analysis-beta/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/reports/analysis-beta/ui/select'
import type { Transaction } from '@/ui/reports/analysis-beta/types/dashboard.types'
import { downloadElementAsImage } from '@/ui/lib/downloadElementAsImage'

type ComparisonMode = 'full_day' | 'week' | 'month'

function getComparisonMode(kind: OperationalCompetitivePeriodKind): ComparisonMode {
  if (kind === 'WEEK') {
    return 'week'
  }

  if (kind === 'MONTH') {
    return 'month'
  }

  return 'full_day'
}

function getComparisonPreset(
  kind: OperationalCompetitivePeriodKind
): OperationalCompetitiveComparisonPreset {
  if (kind === 'WEEK') {
    return 'WEEK_PREVIOUS'
  }

  if (kind === 'MONTH') {
    return 'MONTH_PREVIOUS'
  }

  return 'DAY_PREVIOUS'
}

function shiftUtcDate(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, (month || 1) - 1, day || 1))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function shiftUtcMonth(dateStr: string, months: number) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, (month || 1) - 1, day || 1))
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 10)
}

function normalizeLinkName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function groupTransactionsByDate(transactions: Transaction[]) {
  return transactions.reduce<Map<string, Transaction[]>>((accumulator, transaction) => {
    const current = accumulator.get(transaction.fecha) ?? []
    current.push(transaction)
    accumulator.set(transaction.fecha, current)
    return accumulator
  }, new Map())
}

function mergeTransactionsForDates(params: {
  dates: string[]
  sourcesByDate: Map<
    string,
    {
      rawTransactions: Transaction[]
    }
  >
  fallbackTransactionsByDate: Map<string, Transaction[]>
}) {
  const transactionsById = new Map<string, Transaction>()

  params.dates.forEach(date => {
    const cachedTransactions = params.sourcesByDate.get(date)?.rawTransactions ?? []
    const fallbackTransactions = params.fallbackTransactionsByDate.get(date) ?? []

    ;[...cachedTransactions, ...fallbackTransactions].forEach(transaction => {
      transactionsById.set(transaction.id, transaction)
    })
  })

  return [...transactionsById.values()]
}

function resolveTransactionCoverageDates(
  dates: string[],
  dailyHistory: Record<
    string,
    | {
        coverage?: {
          transactionsLoaded?: boolean
        }
      }
    | undefined
  >
) {
  return dates.reduce(
    (accumulator, date) => {
      if (dailyHistory[date]?.coverage?.transactionsLoaded) {
        accumulator.readyDates.push(date)
      } else {
        accumulator.missingDates.push(date)
      }

      return accumulator
    },
    {
      readyDates: [] as string[],
      missingDates: [] as string[],
    }
  )
}

function formatShortDateLabel(date: string) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year?.slice(2)}`
}

function buildResolvedPeriod(params: {
  anchorDate: string
  kind: OperationalCompetitivePeriodKind
  availableDates: string[]
}): OperationalCompetitiveResolvedPeriod {
  const periodMode = getComparisonMode(params.kind)
  const summary = buildComparisonPeriodSummary({
    anchorDate: params.anchorDate,
    periodMode,
    loadedDates: params.availableDates,
  })
  const range = resolveComparisonRange(params.anchorDate, periodMode)

  return {
    kind: params.kind,
    anchorDate: params.anchorDate,
    label: summary.label,
    from: range.start,
    to: range.end,
    loadedDays: summary.loadedDays,
    expectedDays: summary.expectedDays,
    loadedDates: params.availableDates.filter(
      date => date >= range.start && date <= range.end
    ),
    isComplete: summary.isComplete,
  }
}

const panelShellStyle: CSSProperties = {
  borderRadius: '28px',
  overflow: 'hidden',
  border: '1px solid rgba(185, 28, 28, 0.16)',
  background: '#ffffff',
  boxShadow: '0 28px 56px rgba(15, 23, 42, 0.08)',
}

const headerBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  width: 'fit-content',
  padding: '7px 11px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.12)',
  color: 'white',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
}

const statusChipStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '9px 12px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.96)',
  border: '1px solid rgba(226, 232, 240, 0.98)',
  color: '#334155',
  fontSize: '12px',
  fontWeight: 700,
}

const legendChipStyle: CSSProperties = {
  padding: '9px 11px',
  borderRadius: '999px',
  border: '1px solid rgba(226, 232, 240, 0.98)',
  background: 'rgba(255,255,255,0.94)',
  fontSize: '12px',
  fontWeight: 700,
  color: '#334155',
}

type OperationalCompetitivePanelProps = {
  onOpenCallCenter: () => void
}
const OMIT_REPRESENTATIVE_LINK = '__OMITIR__'

export function OperationalCompetitivePanel({
  onOpenCallCenter,
}: OperationalCompetitivePanelProps) {
  const { representatives, commercialGoals, incidents } = useAppStore(state => ({
    representatives: state.representatives ?? [],
    commercialGoals: state.commercialGoals ?? [],
    incidents: state.incidents ?? [],
  }))
  const availableDates = useDashboardStore(state => state.availableDates)
  const dailyHistory = useDashboardStore(state => state.dailyHistory)
  const rawTransactions = useDashboardStore(state => state.rawTransactions)
  const manualRepresentativeLinks = useDashboardStore(
    state => state.manualRepresentativeLinks
  )
  const upsertManualRepresentativeLink = useDashboardStore(
    state => state.upsertManualRepresentativeLink
  )
  const removeManualRepresentativeLink = useDashboardStore(
    state => state.removeManualRepresentativeLink
  )
  const hasHydrated = useDashboardStore(state => state._hasHydrated)

  const latestCompleteDate = useMemo(() => {
    return [...availableDates]
      .sort()
      .reverse()
      .find(date => dailyHistory[date]?.coverage.isComplete) ?? availableDates.at(-1) ?? null
  }, [availableDates, dailyHistory])
  const [periodKind, setPeriodKind] = useState<OperationalCompetitivePeriodKind>('DAY')
  const [selectedAnchorDate, setSelectedAnchorDate] = useState<string | null>(null)
  const [comparisonEnabled, setComparisonEnabled] = useState(true)
  const [isLinkManagerOpen, setIsLinkManagerOpen] = useState(false)
  const [isExportingImage, setIsExportingImage] = useState(false)
  const [selectedAgentName, setSelectedAgentName] = useState('')
  const [selectedRepresentativeName, setSelectedRepresentativeName] = useState('')
  const exportImageRef = useRef<HTMLDivElement | null>(null)
  const [sourceData, setSourceData] = useState<{
    isLoading: boolean
    currentTransactions: Transaction[]
    comparisonTransactions: Transaction[]
  }>({
    isLoading: false,
    currentTransactions: [],
    comparisonTransactions: [],
  })
  const fallbackTransactionsByDate = useMemo(
    () => groupTransactionsByDate(rawTransactions),
    [rawTransactions]
  )

  const periodOptions = useMemo(() => {
    if (availableDates.length === 0) {
      return []
    }

    return buildComparisonSelectionOptions({
      availableDates,
      periodMode: getComparisonMode(periodKind),
    })
  }, [availableDates, periodKind])

  useEffect(() => {
    if (periodOptions.length === 0) {
      setSelectedAnchorDate(null)
      return
    }

    const fallbackAnchorDate =
      periodKind === 'DAY'
        ? latestCompleteDate ?? periodOptions[0]?.value ?? null
        : periodOptions[0]?.value ?? null

    if (!selectedAnchorDate) {
      setSelectedAnchorDate(fallbackAnchorDate)
      return
    }

    const periodMode = getComparisonMode(periodKind)
    const selectedRange = resolveComparisonRange(selectedAnchorDate, periodMode)
    const matchingOption = periodOptions.find(
      option =>
        option.summary.start === selectedRange.start &&
        option.summary.end === selectedRange.end
    )

    if (!matchingOption) {
      setSelectedAnchorDate(fallbackAnchorDate)
      return
    }

    if (matchingOption.value !== selectedAnchorDate) {
      setSelectedAnchorDate(matchingOption.value)
    }
  }, [latestCompleteDate, periodKind, periodOptions, selectedAnchorDate])

  const currentPeriod = useMemo(() => {
    if (!selectedAnchorDate) {
      return null
    }

    return buildResolvedPeriod({
      anchorDate: selectedAnchorDate,
      kind: periodKind,
      availableDates,
    })
  }, [availableDates, periodKind, selectedAnchorDate])

  const comparisonPeriod = useMemo(() => {
    if (!comparisonEnabled || !selectedAnchorDate) {
      return null
    }

    const comparisonAnchorDate =
      periodKind === 'MONTH'
        ? shiftUtcMonth(selectedAnchorDate, -1)
        : shiftUtcDate(selectedAnchorDate, periodKind === 'WEEK' ? -7 : -1)

    return buildResolvedPeriod({
      anchorDate: comparisonAnchorDate,
      kind: periodKind,
      availableDates,
    })
  }, [availableDates, comparisonEnabled, periodKind, selectedAnchorDate])

  useEffect(() => {
    let cancelled = false

    if (!currentPeriod) {
      setSourceData({
        isLoading: false,
        currentTransactions: [],
        comparisonTransactions: [],
      })
      return
    }

    const currentDates = currentPeriod.loadedDates
    const comparisonDates = comparisonPeriod?.loadedDates ?? []
    const datesToLoad = [...new Set([...currentDates, ...comparisonDates])].sort()

    if (datesToLoad.length === 0) {
      setSourceData({
        isLoading: false,
        currentTransactions: [],
        comparisonTransactions: [],
      })
      return
    }

    setSourceData(current => ({
      ...current,
      isLoading: true,
    }))

    void (async () => {
      const sources = await loadCachedDailySources(datesToLoad)
      if (cancelled) {
        return
      }

      const sourcesByDate = new Map(sources.map(source => [source.date, source]))

      setSourceData({
        isLoading: false,
        currentTransactions: mergeTransactionsForDates({
          dates: currentDates,
          sourcesByDate,
          fallbackTransactionsByDate,
        }),
        comparisonTransactions: mergeTransactionsForDates({
          dates: comparisonDates,
          sourcesByDate,
          fallbackTransactionsByDate,
        }),
      })
    })()

    return () => {
      cancelled = true
    }
  }, [comparisonPeriod, currentPeriod, fallbackTransactionsByDate])

  const currentTransactionCoverage = useMemo(() => {
    if (!currentPeriod) {
      return { readyDates: [], missingDates: [] }
    }

    return resolveTransactionCoverageDates(currentPeriod.loadedDates, dailyHistory)
  }, [currentPeriod, dailyHistory])

  const comparisonTransactionCoverage = useMemo(() => {
    if (!comparisonPeriod) {
      return { readyDates: [], missingDates: [] }
    }

    return resolveTransactionCoverageDates(comparisonPeriod.loadedDates, dailyHistory)
  }, [comparisonPeriod, dailyHistory])

  const competitiveReport = useMemo(() => {
    if (!currentPeriod) {
      return null
    }

    return buildOperationalCompetitiveReport({
      representatives,
      commercialGoals,
      incidents,
      currentPeriod,
      currentTransactionDates: currentTransactionCoverage.readyDates,
      comparisonPreset: comparisonEnabled ? getComparisonPreset(periodKind) : 'NONE',
      comparisonPeriod: comparisonEnabled ? comparisonPeriod : null,
      comparisonTransactionDates: comparisonTransactionCoverage.readyDates,
      currentTransactions: sourceData.currentTransactions,
      comparisonTransactions: sourceData.comparisonTransactions,
      manualRepresentativeLinks,
    })
  }, [
    commercialGoals,
    comparisonEnabled,
    comparisonPeriod,
    currentPeriod,
    incidents,
    manualRepresentativeLinks,
    periodKind,
    representatives,
    currentTransactionCoverage.readyDates,
    comparisonTransactionCoverage.readyDates,
    sourceData.comparisonTransactions,
    sourceData.currentTransactions,
  ])

  const activeRepresentatives = useMemo(
    () =>
      representatives
        .filter(representative => representative.isActive)
        .sort((left, right) => left.name.localeCompare(right.name, 'es')),
    [representatives]
  )

  const unresolvedAgentNames = useMemo(
    () => {
      const pendingNames = competitiveReport?.pendingAgentNames ?? []
      const linkedAgentNames = new Set(
        manualRepresentativeLinks.map(link => normalizeLinkName(link.agentName))
      )

      return pendingNames.filter(
        agentName => !linkedAgentNames.has(normalizeLinkName(agentName))
      )
    },
    [competitiveReport, manualRepresentativeLinks]
  )
  const pendingShiftSections = useMemo(() => {
    if (!competitiveReport) {
      return []
    }

    const linkedAgentNames = new Set(
      manualRepresentativeLinks.map(link => normalizeLinkName(link.agentName))
    )

    return (['DAY', 'NIGHT'] as const)
      .map(shift => {
        const table = competitiveReport.tables[shift]
        const names = table.pendingAgentNames.filter(
          name => !linkedAgentNames.has(normalizeLinkName(name))
        )

        return {
          shift: table.label,
          names,
          missingAgentRegistrations: table.missingAgentRegistrations,
        }
      })
      .filter(section => section.names.length > 0 || section.missingAgentRegistrations > 0)
  }, [competitiveReport, manualRepresentativeLinks])

  const hasCurrentTransactionCoverage = currentTransactionCoverage.readyDates.length > 0
  const hasCurrentTransactionGaps = currentTransactionCoverage.missingDates.length > 0
  const hasComparisonTransactionGaps =
    comparisonEnabled && comparisonTransactionCoverage.missingDates.length > 0
  const comparisonLabel =
    periodKind === 'DAY'
      ? 'ayer'
      : periodKind === 'WEEK'
        ? 'la semana pasada'
        : 'el mes pasado'

  const handleSaveManualLink = () => {
    if (!selectedAgentName || !selectedRepresentativeName) {
      return
    }

    upsertManualRepresentativeLink({
      agentName: selectedAgentName,
      representativeName: selectedRepresentativeName,
    })
    setSelectedAgentName('')
    setSelectedRepresentativeName('')
  }

  const handleDownloadImage = async () => {
    if (!exportImageRef.current || !currentPeriod) {
      return
    }

    setIsExportingImage(true)

    try {
      await downloadElementAsImage({
        element: exportImageRef.current,
        fileName: `Reporte_Operativo_Turnos_${currentPeriod.from}_${currentPeriod.to}.png`,
      })
    } catch (error) {
      console.error(error)
      window.alert('No se pudo generar la imagen para compartir. Intenta de nuevo.')
    } finally {
      setIsExportingImage(false)
    }
  }

  if (!hasHydrated) {
    return (
      <section style={{ ...panelShellStyle, padding: '24px' }}>
        <div className="app-shell-loading">Preparando historial de Call Center...</div>
      </section>
    )
  }

  if (availableDates.length === 0) {
    return (
      <section
        style={{
          ...panelShellStyle,
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '22px 24px',
            background: 'linear-gradient(180deg, #e11d24 0%, #991b1b 100%)',
            color: 'white',
            display: 'grid',
            gap: '12px',
          }}
        >
          <div style={headerBadgeStyle}>Resumen operativo</div>
          <h2 style={{ margin: 0, fontSize: '1.42rem', fontWeight: 800 }}>
            Falta cargar historial de Call Center
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              lineHeight: 1.7,
              maxWidth: '68ch',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            En cuanto haya jornadas cargadas desde Call Center, este módulo arma
            automáticamente las tablas por turno para compartir resultados diarios,
            semanales o mensuales.
          </p>
        </div>

        <div
          style={{
            padding: '20px 24px 24px',
            background: 'linear-gradient(180deg, rgba(255,245,245,0.96) 0%, rgba(255,255,255,1) 100%)',
          }}
        >
          <button
            type="button"
            onClick={onOpenCallCenter}
            style={{
              width: 'fit-content',
              padding: '11px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(185, 28, 28, 0.22)',
              background: 'rgba(255,255,255,0.96)',
              color: '#b91c1c',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Abrir Call Center
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <section style={panelShellStyle}>
        <div
          style={{
            padding: '22px 24px',
            background: 'linear-gradient(180deg, #ef1117 0%, #a61117 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '18px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: '72ch', display: 'grid', gap: '12px' }}>
            <div style={headerBadgeStyle}>Resumen operativo</div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.52rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                }}
              >
                Tabla de resultados por turno
              </h2>
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: '66ch',
                }}
              >
                Ordena a los representantes por transacciones y cumplimiento de
                meta. Errores, ausencias y tardanzas se muestran aparte como
                seguimiento interno.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '10px',
              minWidth: '300px',
              maxWidth: '360px',
              padding: '14px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                gap: '8px',
                flexWrap: 'wrap',
                padding: '6px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(127,29,29,0.14)',
                width: 'fit-content',
              }}
            >
              {([
                { id: 'DAY', label: 'Diario' },
                { id: 'WEEK', label: 'Semanal' },
                { id: 'MONTH', label: 'Mensual' },
              ] as const).map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPeriodKind(option.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    background:
                      periodKind === option.id
                        ? 'rgba(255,255,255,0.96)'
                        : 'transparent',
                    color: periodKind === option.id ? '#991b1b' : 'rgba(255,255,255,0.84)',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow:
                      periodKind === option.id
                        ? '0 10px 18px rgba(127,29,29,0.2)'
                        : 'none',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: '10px',
              }}
            >
              <select
                value={selectedAnchorDate ?? ''}
                onChange={event =>
                  setSelectedAnchorDate(event.target.value || null)
                }
                style={{
                  padding: '11px 12px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.95)',
                  fontSize: '13px',
                  color: '#111827',
                  fontWeight: 700,
                }}
              >
                {periodOptions.map(option => (
                  <option
                    key={`${option.summary.start}:${option.summary.end}`}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setComparisonEnabled(current => !current)}
                style={{
                  padding: '11px 12px',
                  borderRadius: '14px',
                  border: comparisonEnabled
                    ? '1px solid rgba(255,255,255,0.24)'
                    : '1px solid rgba(255,255,255,0.16)',
                  background: comparisonEnabled
                    ? 'rgba(127,29,29,0.26)'
                    : 'rgba(255,255,255,0.16)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                >
                  {comparisonEnabled
                  ? `Comparado con ${
                      periodKind === 'DAY'
                        ? 'día anterior'
                        : periodKind === 'WEEK'
                          ? 'semana anterior'
                          : 'mes anterior'
                    }`
                  : 'Sin comparación'}
              </button>

              <button
                type="button"
                onClick={() => void handleDownloadImage()}
                disabled={isExportingImage || !competitiveReport || !hasCurrentTransactionCoverage}
                style={{
                  padding: '11px 12px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.95)',
                  color: '#991b1b',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor:
                    isExportingImage || !competitiveReport || !hasCurrentTransactionCoverage
                      ? 'not-allowed'
                      : 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity:
                    isExportingImage || !competitiveReport || !hasCurrentTransactionCoverage
                      ? 0.72
                      : 1,
                }}
              >
                <Download size={14} />
                {isExportingImage ? 'Generando imagen...' : 'Descargar imagen'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                disabled={!competitiveReport || !hasCurrentTransactionCoverage}
                style={{
                  padding: '11px 12px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.95)',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor:
                    !competitiveReport || !hasCurrentTransactionCoverage
                      ? 'not-allowed'
                      : 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: !competitiveReport || !hasCurrentTransactionCoverage ? 0.72 : 1,
                }}
              >
                <Printer size={14} />
                Imprimir / PDF
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px 20px',
            display: 'grid',
            gap: '12px',
            background: 'linear-gradient(180deg, rgba(255,245,245,0.96) 0%, rgba(255,255,255,1) 100%)',
          }}
        >
          {currentPeriod ? (
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
            <span style={statusChipStyle}>
              <CalendarRange size={14} />
              {currentPeriod.label}
            </span>
            <span style={statusChipStyle}>
              {currentPeriod.loadedDays}/{currentPeriod.expectedDays} dia(s) cargados
            </span>
            <span style={statusChipStyle}>
              Transacciones listas: {currentTransactionCoverage.readyDates.length}/
              {currentPeriod.loadedDates.length} dia(s)
            </span>
            <span style={statusChipStyle}>
              {currentPeriod.isComplete ? 'Periodo completo' : 'Periodo parcial'}
            </span>
            {comparisonEnabled && comparisonPeriod ? (
              <>
                <span style={statusChipStyle}>
                  Comparado con: {comparisonPeriod.label}
                </span>
                <span style={statusChipStyle}>
                  Transacciones listas: {comparisonTransactionCoverage.readyDates.length}/
                  {comparisonPeriod.loadedDates.length} dia(s)
                </span>
              </>
            ) : (
              <span style={statusChipStyle}>Sin comparacion</span>
            )}
          </div>
        ) : null}

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ ...legendChipStyle, color: '#166534' }}>
              Arriba quedan quienes más transacciones lograron
            </span>
            <span style={{ ...legendChipStyle, color: '#0f172a' }}>
              Luego pesa el porcentaje cumplido
            </span>
            <span style={{ ...legendChipStyle, color: '#b91c1c' }}>
              Anuladas e incidencias quedan como control interno
            </span>
            <span style={legendChipStyle}>
              Lista para compartir
            </span>
          </div>
        </div>
      </section>

      {currentPeriod && (hasCurrentTransactionGaps || hasComparisonTransactionGaps) ? (
        <section
          style={{
            borderRadius: '22px',
            border: '1px solid rgba(245, 158, 11, 0.26)',
            background:
              'linear-gradient(180deg, rgba(255,247,237,0.98) 0%, rgba(255,255,255,0.98) 100%)',
            boxShadow: '0 18px 36px rgba(245, 158, 11, 0.08)',
            padding: '18px',
            display: 'grid',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.92)',
                display: 'grid',
                placeItems: 'center',
                color: '#d97706',
                border: '1px solid rgba(245, 158, 11, 0.18)',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#b45309',
                  marginBottom: '6px',
                }}
              >
                Dias con datos faltantes
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: 1.65,
                  color: '#92400e',
                  maxWidth: '82ch',
                }}
              >
                La tabla usa solo los dias donde si existe base de transacciones.
                Si faltan archivos en parte del periodo, la meta y los cambios se
                calculan solo con esos dias disponibles para no castigar el
                porcentaje.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {hasCurrentTransactionGaps ? (
              <div
                style={{
                  padding: '12px 13px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid rgba(245, 158, 11, 0.16)',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#92400e' }}>
                  Periodo actual: faltan {currentTransactionCoverage.missingDates.length}{' '}
                  dia(s) con transacciones
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {currentTransactionCoverage.missingDates.slice(0, 6).map(date => (
                    <span
                      key={`current-gap:${date}`}
                      style={{
                        padding: '6px 9px',
                        borderRadius: '999px',
                        background: 'rgba(255,247,237,0.98)',
                        border: '1px solid rgba(245, 158, 11, 0.18)',
                        color: '#9a3412',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {formatShortDateLabel(date)}
                    </span>
                  ))}
                  {currentTransactionCoverage.missingDates.length > 6 ? (
                    <span
                      style={{
                        padding: '6px 9px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.96)',
                        border: '1px solid rgba(245, 158, 11, 0.16)',
                        color: '#92400e',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      +{currentTransactionCoverage.missingDates.length - 6} más
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            {hasComparisonTransactionGaps ? (
              <div
                style={{
                  padding: '12px 13px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid rgba(245, 158, 11, 0.16)',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#92400e' }}>
                  Comparado con: faltan {comparisonTransactionCoverage.missingDates.length}{' '}
                  dia(s) con transacciones
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {comparisonTransactionCoverage.missingDates.slice(0, 6).map(date => (
                    <span
                      key={`comparison-gap:${date}`}
                      style={{
                        padding: '6px 9px',
                        borderRadius: '999px',
                        background: 'rgba(255,247,237,0.98)',
                        border: '1px solid rgba(245, 158, 11, 0.18)',
                        color: '#9a3412',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {formatShortDateLabel(date)}
                    </span>
                  ))}
                  {comparisonTransactionCoverage.missingDates.length > 6 ? (
                    <span
                      style={{
                        padding: '6px 9px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.96)',
                        border: '1px solid rgba(245, 158, 11, 0.16)',
                        color: '#92400e',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      +{comparisonTransactionCoverage.missingDates.length - 6} más
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {competitiveReport?.dataQualityWarnings.length ? (
        <section
          style={{
            borderRadius: '22px',
            border: '1px solid rgba(245, 158, 11, 0.26)',
            background: 'linear-gradient(180deg, rgba(255,247,237,0.98) 0%, rgba(255,255,255,0.98) 100%)',
            boxShadow: '0 18px 36px rgba(245, 158, 11, 0.08)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '14px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.92)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#d97706',
                  border: '1px solid rgba(245, 158, 11, 0.18)',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#b45309',
                    marginBottom: '6px',
                  }}
                >
                  Calidad de datos
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    lineHeight: 1.65,
                    color: '#92400e',
                    maxWidth: '76ch',
                  }}
                >
                  Hay transacciones sin enlace manual o sin agente identificado. No se
                  incluyen en la tabla hasta que las relaciones queden claras.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCallCenter}
              style={{
                padding: '10px 13px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.24)',
                background: 'white',
                color: '#92400e',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Ir a Call Center
              <ArrowRight size={15} />
            </button>
            {unresolvedAgentNames.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsLinkManagerOpen(true)}
                style={{
                  padding: '10px 13px',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.24)',
                  background: 'rgba(146, 64, 14, 0.06)',
                  color: '#92400e',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Enlazar representantes
                <Link2 size={15} />
              </button>
            ) : null}
          </div>

          <div
            style={{
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            }}
          >
            {pendingShiftSections.map(section => (
              <div
                key={section.shift}
                style={{
                  padding: '12px 13px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid rgba(245, 158, 11, 0.16)',
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    lineHeight: 1.55,
                    color: '#92400e',
                    fontWeight: 700,
                  }}
                >
                  {section.shift}: {section.names.length} agente(s) sin enlace manual.
                  {section.missingAgentRegistrations > 0
                    ? ` ${section.missingAgentRegistrations} transaccion(es) llegaron sin agente identificado.`
                    : ''}
                </div>

                {section.names.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    {section.names.map(name => (
                      <span
                        key={`${section.shift}:${name}`}
                        style={{
                          padding: '6px 9px',
                          borderRadius: '999px',
                          background: 'rgba(255,247,237,0.98)',
                          border: '1px solid rgba(245, 158, 11, 0.18)',
                          color: '#9a3412',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <Dialog open={isLinkManagerOpen} onOpenChange={setIsLinkManagerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enlaces de representantes</DialogTitle>
            <DialogDescription>
              Resuelve aquí mismo los agentes del reporte que todavía no coinciden
              con representantes del sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Select value={selectedAgentName} onValueChange={setSelectedAgentName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona agente del reporte" />
              </SelectTrigger>
              <SelectContent>
                {unresolvedAgentNames.map(agentName => (
                  <SelectItem key={agentName} value={agentName}>
                    {agentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedRepresentativeName}
              onValueChange={setSelectedRepresentativeName}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona representante del sistema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OMIT_REPRESENTATIVE_LINK}>
                  Omitir de ranking (supervisor / apoyo)
                </SelectItem>
                {activeRepresentatives.map(representative => (
                  <SelectItem key={representative.id} value={representative.name}>
                    {representative.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {unresolvedAgentNames.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-amber-700">
                Pendientes por enlazar
              </div>
              <div className="flex flex-wrap gap-2">
                {unresolvedAgentNames.map(agentName => (
                  <button
                    key={agentName}
                    type="button"
                    onClick={() => setSelectedAgentName(agentName)}
                    className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
                  >
                    {agentName}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="max-h-56 overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.1em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Agente reporte</th>
                  <th className="px-3 py-2">Representante</th>
                  <th className="px-3 py-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {manualRepresentativeLinks.map(link => (
                  <tr key={link.agentName} className="border-t border-slate-100">
                    <td className="px-3 py-2">{link.agentName}</td>
                    <td className="px-3 py-2">
                      {link.representativeName === OMIT_REPRESENTATIVE_LINK
                        ? 'Omitido del ranking'
                        : link.representativeName}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeManualRepresentativeLink(link.agentName)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600"
                        title="Eliminar enlace manual"
                        aria-label="Eliminar enlace manual"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {manualRepresentativeLinks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-sm text-slate-500">
                      No hay enlaces manuales guardados todavía.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={handleSaveManualLink}
              disabled={!selectedAgentName || !selectedRepresentativeName}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar enlace
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!sourceData.isLoading && currentPeriod && !hasCurrentTransactionCoverage ? (
        <section
          style={{
            ...panelShellStyle,
            padding: '24px',
            display: 'grid',
            gap: '14px',
          }}
        >
          <div style={{ display: 'grid', gap: '8px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#b91c1c',
              }}
            >
              Tabla en espera
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
              Todavia no hay transacciones cargadas para este periodo
            </h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: '#64748b' }}>
              El periodo tiene dias presentes en el historial, pero falta la base de
              transacciones que alimenta la tabla. En cuanto se carguen esos archivos
              desde Call Center, aqui apareceran las tablas por turno con metas,
              anuladas e incidencias.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onOpenCallCenter}
              style={{
                width: 'fit-content',
                padding: '11px 14px',
                borderRadius: '14px',
                border: '1px solid rgba(185, 28, 28, 0.22)',
                background: 'rgba(255,255,255,0.96)',
                color: '#b91c1c',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Abrir Call Center
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      ) : sourceData.isLoading ? (
        <div className="app-shell-loading">Cargando fuentes competitivas...</div>
      ) : competitiveReport ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '18px',
          }}
        >
          <OperationalCompetitiveShiftLeaderboard
            comparisonEnabled={comparisonEnabled}
            comparisonLabel={comparisonLabel}
            table={competitiveReport.tables.DAY}
          />
          <OperationalCompetitiveShiftLeaderboard
            comparisonEnabled={comparisonEnabled}
            comparisonLabel={comparisonLabel}
            table={competitiveReport.tables.NIGHT}
          />
        </div>
      ) : (
        <section
          style={{
            ...panelShellStyle,
            padding: '24px',
            color: '#64748b',
            fontSize: '13px',
          }}
        >
          No hay suficientes datos para construir la tabla operativa todavia.
        </section>
      )}

      {competitiveReport && currentPeriod ? (
        <div
          ref={exportImageRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            width: '1680px',
            padding: '32px',
            display: 'grid',
            gap: '18px',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            pointerEvents: 'none',
          }}
        >
          <section
            style={{
              borderRadius: '26px',
              overflow: 'hidden',
              border: '1px solid rgba(185, 28, 28, 0.14)',
              background: '#ffffff',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div
              style={{
                padding: '24px 28px',
                background: 'linear-gradient(180deg, #ef1117 0%, #a61117 100%)',
                color: 'white',
                display: 'grid',
                gap: '18px',
              }}
            >
              <div style={headerBadgeStyle}>Resumen operativo</div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  gap: '18px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'grid', gap: '10px', maxWidth: '70ch' }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '2rem',
                      fontWeight: 800,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    Ranking operativo por turno
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: 1.7,
                      color: 'rgba(255,255,255,0.92)',
                      maxWidth: '68ch',
                    }}
                  >
                    Tabla lista para compartir. Resume transacciones, cumplimiento
                    de meta y control interno por representante.
                  </p>
                </div>

                <div
                  style={{
                    minWidth: '300px',
                    maxWidth: '360px',
                    padding: '16px 18px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.76)',
                    }}
                  >
                    Periodo del reporte
                  </div>
                  <div
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {currentPeriod.label}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      lineHeight: 1.65,
                      color: 'rgba(255,255,255,0.9)',
                    }}
                  >
                    {comparisonEnabled && comparisonPeriod
                      ? `Comparado con ${comparisonPeriod.label}.`
                      : 'Sin comparacion con periodo previo.'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={statusChipStyle}>{currentPeriod.label}</span>
                <span style={statusChipStyle}>
                  {currentPeriod.loadedDays}/{currentPeriod.expectedDays} dia(s) cargados
                </span>
                <span style={statusChipStyle}>
                  Transacciones listas: {currentTransactionCoverage.readyDates.length}/
                  {currentPeriod.loadedDates.length} dia(s)
                </span>
                {comparisonEnabled && comparisonPeriod ? (
                  <span style={statusChipStyle}>Comparado con: {comparisonPeriod.label}</span>
                ) : (
                  <span style={statusChipStyle}>Sin comparacion</span>
                )}
              </div>
            </div>
          </section>

          <OperationalCompetitiveShiftLeaderboard
            comparisonEnabled={comparisonEnabled}
            comparisonLabel={comparisonLabel}
            table={competitiveReport.tables.DAY}
          />
          <OperationalCompetitiveShiftLeaderboard
            comparisonEnabled={comparisonEnabled}
            comparisonLabel={comparisonLabel}
            table={competitiveReport.tables.NIGHT}
          />
        </div>
      ) : null}
    </div>
  )
}
