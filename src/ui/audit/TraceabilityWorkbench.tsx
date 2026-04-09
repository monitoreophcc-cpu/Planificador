'use client'

import React, { useMemo, useState } from 'react'
import { Database, Fingerprint, History, Search, ShieldCheck } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { AuditEvent } from '@/domain/audit/types'
import type { HistoryEvent } from '@/domain/history/types'
import { useAppStore } from '@/store/useAppStore'
import { AuditTable } from '@/ui/stats/audit/AuditTable'
import { AuditTimeline } from './AuditTimeline'
import { AuditSnapshotsSection } from './AuditSnapshotsSection'
import { useAuditDashboard } from './useAuditDashboard'

type TraceabilityTab = 'history' | 'audit' | 'forensic'
type HistoryFilter = 'ALL' | HistoryEvent['category']
type AuditFilter = 'ALL' | 'INCIDENTS' | 'COVERAGE' | 'OVERRIDES' | 'SNAPSHOTS' | 'SYSTEM'
type ForensicFilter = 'ALL' | 'TIMELINE' | 'SNAPSHOTS'

const cardStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  borderRadius: '20px',
  border: '1px solid var(--shell-border)',
  background: 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.66) 100%)',
  boxShadow: 'var(--shadow-sm)',
}

const historyFilters: Array<{ id: HistoryFilter; label: string }> = [
  { id: 'ALL', label: 'Todo' },
  { id: 'INCIDENT', label: 'Incidencias' },
  { id: 'PLANNING', label: 'Planificación' },
  { id: 'RULE', label: 'Reglas' },
  { id: 'CALENDAR', label: 'Calendario' },
  { id: 'SYSTEM', label: 'Sistema' },
  { id: 'SETTINGS', label: 'Ajustes' },
]

const auditFilters: Array<{ id: AuditFilter; label: string }> = [
  { id: 'ALL', label: 'Todo' },
  { id: 'INCIDENTS', label: 'Incidencias' },
  { id: 'COVERAGE', label: 'Coberturas' },
  { id: 'OVERRIDES', label: 'Cambios' },
  { id: 'SNAPSHOTS', label: 'Semanas guardadas' },
  { id: 'SYSTEM', label: 'Sistema' },
]

const forensicFilters: Array<{ id: ForensicFilter; label: string }> = [
  { id: 'ALL', label: 'Vista completa' },
  { id: 'TIMELINE', label: 'Línea de tiempo' },
  { id: 'SNAPSHOTS', label: 'Semanas guardadas' },
]

const historyColors: Record<HistoryEvent['category'], { bg: string; text: string }> = {
  INCIDENT: { bg: '#fff1e6', text: '#9a3412' },
  RULE: { bg: '#e8f2ff', text: '#1d4ed8' },
  CALENDAR: { bg: '#fef3c7', text: '#92400e' },
  PLANNING: { bg: '#e8f7f0', text: '#0f766e' },
  SYSTEM: { bg: '#ede9fe', text: '#5b21b6' },
  SETTINGS: { bg: '#f3f4f6', text: '#475569' },
}

function formatTimestamp(timestamp?: string) {
  if (!timestamp) return 'Sin actividad reciente'
  return format(parseISO(timestamp), "d MMM yyyy, HH:mm", { locale: es })
}

function matchesSearch(values: Array<string | undefined>, searchTerm: string) {
  if (!searchTerm.trim()) return true
  const needle = searchTerm.trim().toLowerCase()
  return values.some(value => value?.toLowerCase().includes(needle))
}

function stringifyPayload(payload: AuditEvent['payload']) {
  if (payload == null) return ''
  if (typeof payload === 'string') return payload
  try {
    return JSON.stringify(payload)
  } catch {
    return ''
  }
}

function getAuditGroup(event: AuditEvent): AuditFilter {
  const type = event.type ?? event.action
  if (type?.includes('INCIDENT')) return 'INCIDENTS'
  if (type?.includes('COVERAGE')) return 'COVERAGE'
  if (type?.includes('SNAPSHOT')) return 'SNAPSHOTS'
  if (event.actor === 'SYSTEM') return 'SYSTEM'
  return 'OVERRIDES'
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof History
  label: string
  value: number
  helper: string
}) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: '16px',
        borderRadius: '18px',
        border: '1px solid rgba(206, 193, 172, 0.38)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(247,243,236,0.88) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        <Icon size={15} />
        {label}
      </div>
      <div
        style={{
          marginTop: '10px',
          fontSize: '30px',
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'var(--text-main)',
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
        {helper}
      </div>
    </div>
  )
}

function HistoryItem({ event }: { event: HistoryEvent }) {
  const tone = historyColors[event.category]
  return (
    <article
      style={{
        minWidth: 0,
        display: 'grid',
        gap: '8px',
        padding: '16px 18px',
        borderRadius: '18px',
        border: '1px solid rgba(206, 193, 172, 0.42)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(250,247,241,0.92) 100%)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: tone.bg,
              color: tone.text,
            }}
          >
            {event.category}
          </span>
          {event.impact && <span style={{ fontSize: '12px', fontWeight: 700, color: '#9f1239' }}>{event.impact}</span>}
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {formatTimestamp(event.timestamp)}
        </span>
      </div>
      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{event.title}</div>
      {event.subject && <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-strong)' }}>{event.subject}</div>}
      {event.description && <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)' }}>{event.description}</div>}
    </article>
  )
}

export function TraceabilityWorkbench() {
  const { historyEvents, auditLog } = useAppStore(state => ({
    historyEvents: state.historyEvents,
    auditLog: state.auditLog,
  }))
  const { orderedSnapshots, timelineItems, snapshots, isSnapshotting, handleCreateSnapshot } =
    useAuditDashboard()

  const [activeTab, setActiveTab] = useState<TraceabilityTab>('history')
  const [searchTerm, setSearchTerm] = useState('')
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('ALL')
  const [auditFilter, setAuditFilter] = useState<AuditFilter>('ALL')
  const [forensicFilter, setForensicFilter] = useState<ForensicFilter>('ALL')

  const sortedHistory = useMemo(
    () => [...historyEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [historyEvents]
  )
  const sortedAudit = useMemo(
    () => [...auditLog].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [auditLog]
  )

  const latestTrace = useMemo(() => {
    const dates = [sortedHistory[0]?.timestamp, sortedAudit[0]?.timestamp, orderedSnapshots[0]?.snapshot.createdAt].filter(Boolean) as string[]
    return dates.sort((a, b) => b.localeCompare(a))[0]
  }, [orderedSnapshots, sortedAudit, sortedHistory])

  const filteredHistory = useMemo(
    () =>
      sortedHistory.filter(event =>
        (historyFilter === 'ALL' || event.category === historyFilter) &&
        matchesSearch([event.title, event.subject, event.description], searchTerm)
      ),
    [historyFilter, searchTerm, sortedHistory]
  )

  const filteredAudit = useMemo(
    () =>
      sortedAudit.filter(event =>
        (auditFilter === 'ALL' || getAuditGroup(event) === auditFilter) &&
        matchesSearch(
          [
            typeof event.actor === 'string' ? event.actor : event.actor.name,
            event.type,
            event.action,
            event.target?.entity,
            event.target?.entityId,
            stringifyPayload(event.payload),
          ],
          searchTerm
        )
      ),
    [auditFilter, searchTerm, sortedAudit]
  )

  const filteredTimeline = useMemo(
    () => timelineItems.filter(item => matchesSearch([item.summary, item.actor, item.details], searchTerm)),
    [searchTerm, timelineItems]
  )

  const filteredSnapshots = useMemo(
    () =>
      orderedSnapshots.filter(snapshot =>
        matchesSearch(
          [
            snapshot.snapshot.isoWeek,
            snapshot.snapshot.weekStart,
            snapshot.snapshot.weekEnd,
            snapshot.signature,
            snapshot.previousSignature,
          ],
          searchTerm
        )
      ),
    [orderedSnapshots, searchTerm]
  )

  const visibleCount =
    activeTab === 'history'
      ? filteredHistory.length
      : activeTab === 'audit'
        ? filteredAudit.length
        : forensicFilter === 'TIMELINE'
          ? filteredTimeline.length
          : forensicFilter === 'SNAPSHOTS'
            ? filteredSnapshots.length
            : filteredTimeline.length + filteredSnapshots.length

  const filterItems =
    activeTab === 'history'
      ? historyFilters
      : activeTab === 'audit'
        ? auditFilters
        : forensicFilters

  return (
    <div style={{ display: 'grid', gap: '18px', width: '100%', minWidth: 0 }}>
      <div style={{ ...cardStyle, padding: '18px', display: 'grid', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 11px',
                borderRadius: '999px',
                border: '1px solid rgba(var(--accent-rgb), 0.14)',
                background: 'rgba(var(--accent-rgb), 0.08)',
                color: 'var(--accent-strong)',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Seguimiento del sistema
            </div>
            <h4 style={{ margin: '12px 0 0', fontSize: '22px', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
              Historial, registro del sistema y semanas guardadas en una sola vista
            </h4>
            <p style={{ margin: '8px 0 0', maxWidth: '72ch', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
              Busca cambios, filtra por contexto y revisa el detalle sin salir de Ajustes.
            </p>
          </div>
          <div style={{ flex: '0 1 240px', minWidth: 0, padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(var(--accent-rgb), 0.12)', background: 'rgba(255,255,255,0.6)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)' }}>
              Último movimiento
            </div>
            <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
              {formatTimestamp(latestTrace)}
            </div>
            <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
              {historyEvents.length + auditLog.length} eventos registrados
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', minWidth: 0 }}>
          <MetricCard icon={History} label="Historial operativo" value={sortedHistory.length} helper="Cambios visibles del trabajo diario" />
          <MetricCard icon={ShieldCheck} label="Registro del sistema" value={sortedAudit.length} helper="Cambios guardados automáticamente" />
          <MetricCard icon={Fingerprint} label="Semanas guardadas" value={orderedSnapshots.length} helper="Copias semanales disponibles" />
          <MetricCard icon={Database} label="Semanas verificadas" value={orderedSnapshots.filter(snapshot => snapshot.sealed).length} helper="Semanas con validación completa" />
        </div>
      </div>

      <div style={{ ...cardStyle, padding: '18px' }}>
        <div className="traceability-tab-rail" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '6px', borderRadius: '18px', background: 'rgba(244, 238, 228, 0.78)', border: '1px solid rgba(206, 193, 172, 0.42)', width: '100%', maxWidth: '100%', boxSizing: 'border-box', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)' }}>
          {[
            { id: 'history', label: 'Historial', helper: 'Cambios del día a día', icon: History },
            { id: 'audit', label: 'Registro', helper: 'Registro del sistema', icon: ShieldCheck },
            { id: 'forensic', label: 'Detalle', helper: 'Línea de tiempo + semanas guardadas', icon: Fingerprint },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TraceabilityTab)
                  setSearchTerm('')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flex: '1 1 180px',
                  minWidth: 0,
                  justifyContent: 'flex-start',
                  flexWrap: 'wrap',
                  textAlign: 'left',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  border: `1px solid ${isActive ? 'rgba(var(--accent-rgb), 0.18)' : 'transparent'}`,
                  background: isActive ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.72) 100%)' : 'transparent',
                  color: isActive ? 'var(--accent-strong)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 12px 24px rgba(var(--accent-rgb), 0.12)' : 'none',
                }}
              >
                <Icon size={16} />
                <span className="traceability-tab-label">{tab.label}</span>
                <span className="traceability-tab-helper" style={{ fontSize: '12px', opacity: 0.72 }}>
                  {tab.helper}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '16px', border: '1px solid rgba(206, 193, 172, 0.48)', background: 'rgba(255,255,255,0.8)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder={activeTab === 'history' ? 'Buscar por evento, persona o descripción...' : activeTab === 'audit' ? 'Buscar por persona, acción o detalle...' : 'Buscar en la línea de tiempo o en semanas guardadas...'}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '14px', color: 'var(--text-main)' }}
            />
          </div>
          <div style={{ flex: '0 1 auto', padding: '10px 12px', borderRadius: '16px', border: '1px solid rgba(206, 193, 172, 0.48)', background: 'rgba(255,255,255,0.72)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700 }}>
            {visibleCount} resultado(s)
          </div>
        </div>

        <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {filterItems.map(filter => {
            const isActive = activeTab === 'history' ? historyFilter === filter.id : activeTab === 'audit' ? auditFilter === filter.id : forensicFilter === filter.id
            return (
              <button
                key={filter.id}
                onClick={() => {
                  if (activeTab === 'history') setHistoryFilter(filter.id as HistoryFilter)
                  else if (activeTab === 'audit') setAuditFilter(filter.id as AuditFilter)
                  else setForensicFilter(filter.id as ForensicFilter)
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '999px',
                  border: `1px solid ${isActive ? 'rgba(var(--accent-rgb), 0.2)' : 'rgba(191, 178, 157, 0.42)'}`,
                  background: isActive ? 'rgba(var(--accent-rgb), 0.12)' : 'rgba(255,255,255,0.6)',
                  color: isActive ? 'var(--accent-strong)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: '18px' }}>
          {activeTab === 'history' && (filteredHistory.length > 0 ? <div style={{ display: 'grid', gap: '12px' }}>{filteredHistory.map(event => <HistoryItem key={event.id} event={event} />)}</div> : <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '18px', border: '1px dashed rgba(191, 178, 157, 0.58)', background: 'rgba(255,255,255,0.55)' }}>No hay eventos operativos para los criterios actuales.</div>)}
          {activeTab === 'audit' && (filteredAudit.length > 0 ? <AuditTable events={filteredAudit} /> : <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '18px', border: '1px dashed rgba(191, 178, 157, 0.58)', background: 'rgba(255,255,255,0.55)' }}>No hay movimientos del sistema para los criterios actuales.</div>)}
          {activeTab === 'forensic' && (
            filteredTimeline.length + filteredSnapshots.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    forensicFilter === 'ALL'
                      ? 'repeat(auto-fit, minmax(320px, 1fr))'
                      : '1fr',
                  gap: '20px',
                }}
              >
                {forensicFilter !== 'SNAPSHOTS' && (
                  <section style={{ ...cardStyle, padding: '18px', height: 'fit-content' }}>
                    <div style={{ marginBottom: '14px', fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                      Línea de tiempo
                    </div>
                    <AuditTimeline items={filteredTimeline} />
                  </section>
                )}
                {forensicFilter !== 'TIMELINE' && (
                  <div style={{ ...cardStyle, padding: '18px' }}>
                    <AuditSnapshotsSection orderedSnapshots={filteredSnapshots} allSnapshots={snapshots} isSnapshotting={isSnapshotting} onCreateSnapshot={handleCreateSnapshot} />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '18px', border: '1px dashed rgba(191, 178, 157, 0.58)', background: 'rgba(255,255,255,0.55)' }}>
                No hay detalle disponible para los criterios actuales.
              </div>
            )
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1320px) {
          .traceability-tab-helper {
            display: none;
          }

          .traceability-tab-rail button {
            gap: 8px !important;
            padding: 10px 14px !important;
          }
        }

        @media (max-width: 880px) {
          .traceability-tab-rail button {
            flex: 1 1 100%;
          }
        }
      `}</style>
    </div>
  )
}
