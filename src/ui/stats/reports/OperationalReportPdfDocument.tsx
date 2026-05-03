'use client'

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import type { OperationalReport } from '@/domain/reports/operationalTypes'

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 42,
    paddingHorizontal: 34,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#b91c1c',
    fontWeight: 800,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 1.5,
    maxWidth: 330,
  },
  metaBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metaText: {
    fontSize: 9,
    color: '#475569',
    textAlign: 'right',
  },
  section: {
    marginTop: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    color: '#0f172a',
    letterSpacing: 1,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    backgroundColor: '#f8fafc',
  },
  metricLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 800,
    letterSpacing: 0.8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 800,
    color: '#0f172a',
  },
  deltaText: {
    fontSize: 9,
    color: '#475569',
  },
  readingCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    padding: 12,
    gap: 8,
  },
  readingText: {
    fontSize: 10,
    color: '#1e293b',
    lineHeight: 1.6,
  },
  inlinePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 8,
    fontWeight: 800,
  },
  spotlightGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  spotlightCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    backgroundColor: '#ffffff',
  },
  spotlightLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 800,
    letterSpacing: 0.8,
  },
  spotlightValue: {
    fontSize: 16,
    fontWeight: 800,
    color: '#0f172a',
  },
  spotlightBody: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 8,
    color: '#334155',
  },
  headCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 7,
    color: '#64748b',
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  colLabel: {
    width: '24%',
  },
  colValue: {
    width: '15%',
    textAlign: 'right',
  },
  listGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  listCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    backgroundColor: '#ffffff',
  },
  listTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: '#0f172a',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listItemName: {
    fontSize: 9,
    color: '#1e293b',
    flexGrow: 1,
  },
  listItemScore: {
    fontSize: 9,
    color: '#0f172a',
    fontWeight: 800,
  },
  footer: {
    position: 'absolute',
    left: 34,
    right: 34,
    bottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    fontSize: 8,
    color: '#94a3b8',
  },
})

function formatNumber(value: number) {
  return value.toLocaleString('es-DO')
}

function formatDelta(value: number) {
  return `${value > 0 ? '+' : ''}${formatNumber(value)}`
}

function buildMetricCards(report: OperationalReport) {
  return [
    {
      label: 'Incidencias del período',
      value: report.current.metrics.incidents,
      delta: report.comparison.previous.delta.incidents,
    },
    {
      label: 'Puntos del período',
      value: report.current.metrics.points,
      delta: report.comparison.previous.delta.points,
    },
    {
      label: 'Ausencias',
      value: report.current.metrics.absences,
      delta: report.comparison.previous.delta.absences,
    },
    {
      label: 'Licencias',
      value: report.current.metrics.licenses,
      delta: report.comparison.previous.delta.licenses,
    },
  ]
}

function buildComparisonRows(report: OperationalReport) {
  const previous = report.comparison.previous
  const yearAgo = report.comparison.yearAgo

  return [
    {
      label: 'Incidencias',
      current: report.current.metrics.incidents,
      previous: previous.metrics.incidents,
      previousDelta: previous.delta.incidents,
      yearAgo: yearAgo.metrics.incidents,
      yearAgoDelta: yearAgo.delta.incidents,
    },
    {
      label: 'Puntos',
      current: report.current.metrics.points,
      previous: previous.metrics.points,
      previousDelta: previous.delta.points,
      yearAgo: yearAgo.metrics.points,
      yearAgoDelta: yearAgo.delta.points,
    },
    {
      label: 'Ausencias',
      current: report.current.metrics.absences,
      previous: previous.metrics.absences,
      previousDelta: previous.delta.absences,
      yearAgo: yearAgo.metrics.absences,
      yearAgoDelta: yearAgo.delta.absences,
    },
    {
      label: 'Licencias',
      current: report.current.metrics.licenses,
      previous: previous.metrics.licenses,
      previousDelta: previous.delta.licenses,
      yearAgo: yearAgo.metrics.licenses,
      yearAgoDelta: yearAgo.delta.licenses,
    },
  ]
}

export function OperationalReportPdfDocument({
  report,
}: {
  report: OperationalReport
}) {
  const generatedAt = new Date().toLocaleString('es-DO')
  const metricCards = buildMetricCards(report)
  const comparisonRows = buildComparisonRows(report)
  const leadingShift =
    report.shifts.DAY.points > report.shifts.NIGHT.points
      ? 'DAY'
      : report.shifts.NIGHT.points > report.shifts.DAY.points
        ? 'NIGHT'
        : report.shifts.DAY.incidents >= report.shifts.NIGHT.incidents
          ? 'DAY'
          : 'NIGHT'
  const leadingShiftStats = report.shifts[leadingShift]
  const leadingShiftLabel = leadingShift === 'DAY' ? 'Día' : 'Noche'
  const leadingIncident = report.topIncidents[0] ?? null
  const leadingIncidentLabel = leadingIncident
    ? (INCIDENT_STYLES[leadingIncident.type as keyof typeof INCIDENT_STYLES]?.label ??
        leadingIncident.type)
    : 'Sin incidencias'

  return (
    <Document title={`Resumen operativo - ${report.current.period.label}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Lectura institucional</Text>
            <Text style={styles.title}>Resumen operativo</Text>
            <Text style={styles.subtitle}>
              Comparativo institucional del período con lectura ejecutiva,
              evolución frente a referencias clave y foco en representantes a
              revisar.
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>
              Período: {report.current.period.label}
            </Text>
            <Text style={styles.metaText}>
              Ref. anterior: {report.comparison.previous.period.label}
            </Text>
            <Text style={styles.metaText}>
              Ref. año anterior: {report.comparison.yearAgo.period.label}
            </Text>
            <Text style={styles.metaText}>Generado: {generatedAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen ejecutivo</Text>
          <View style={styles.cardGrid}>
            {metricCards.map(card => (
              <View key={card.label} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{card.label}</Text>
                <Text style={styles.metricValue}>{formatNumber(card.value)}</Text>
                <Text style={styles.deltaText}>
                  Variación vs período anterior: {formatDelta(card.delta)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lectura del período</Text>
          <View style={styles.readingCard}>
            <Text style={styles.readingText}>{report.reading}</Text>
            <View style={styles.inlinePills}>
              <Text
                style={[
                  styles.pill,
                  {
                    borderColor: '#fde68a',
                    backgroundColor: '#fffbeb',
                    color: '#b45309',
                  },
                ]}
              >
                {report.risk.needsAttention.length} para revisar
              </Text>
              <Text
                style={[
                  styles.pill,
                  {
                    borderColor: '#d1fae5',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                  },
                ]}
              >
                {report.risk.topPerformers.length} con mejor resultado
              </Text>
              <Text
                style={[
                  styles.pill,
                  {
                    borderColor: '#dbeafe',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                  },
                ]}
              >
                Día: {formatNumber(report.shifts.DAY.incidents)} incidencias
              </Text>
              <Text
                style={[
                  styles.pill,
                  {
                    borderColor: '#e9d5ff',
                    backgroundColor: '#faf5ff',
                    color: '#7e22ce',
                  },
                ]}
              >
                Noche: {formatNumber(report.shifts.NIGHT.incidents)} incidencias
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focos del período</Text>
          <View style={styles.spotlightGrid}>
            <View style={styles.spotlightCard}>
              <Text style={styles.spotlightLabel}>Turno más exigido</Text>
              <Text style={styles.spotlightValue}>Turno {leadingShiftLabel}</Text>
              <Text style={styles.spotlightBody}>
                Concentra {formatNumber(leadingShiftStats.incidents)} incidencias y{' '}
                {formatNumber(leadingShiftStats.points)} puntos durante el período
                actual.
              </Text>
            </View>
            <View style={styles.spotlightCard}>
              <Text style={styles.spotlightLabel}>Incidencia más repetida</Text>
              <Text style={styles.spotlightValue}>{leadingIncidentLabel}</Text>
              <Text style={styles.spotlightBody}>
                {leadingIncident
                  ? `${formatNumber(leadingIncident.count)} evento(s) y ${formatNumber(
                      leadingIncident.points
                    )} punto(s) vinculados.`
                  : 'No hay incidencias registradas en el período actual.'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comparación operativa</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headCell, styles.colLabel]}>Indicador</Text>
              <Text style={[styles.headCell, styles.colValue]}>Actual</Text>
              <Text style={[styles.headCell, styles.colValue]}>Anterior</Text>
              <Text style={[styles.headCell, styles.colValue]}>Var.</Text>
              <Text style={[styles.headCell, styles.colValue]}>Año ant.</Text>
              <Text style={[styles.headCell, styles.colValue]}>Var.</Text>
            </View>
            {comparisonRows.map(row => (
              <View key={row.label} style={styles.tableRow}>
                <Text style={[styles.cell, styles.colLabel]}>{row.label}</Text>
                <Text style={[styles.cell, styles.colValue]}>
                  {formatNumber(row.current)}
                </Text>
                <Text style={[styles.cell, styles.colValue]}>
                  {formatNumber(row.previous)}
                </Text>
                <Text style={[styles.cell, styles.colValue]}>
                  {formatDelta(row.previousDelta)}
                </Text>
                <Text style={[styles.cell, styles.colValue]}>
                  {formatNumber(row.yearAgo)}
                </Text>
                <Text style={[styles.cell, styles.colValue]}>
                  {formatDelta(row.yearAgoDelta)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Representantes clave</Text>
          <View style={styles.listGrid}>
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Representantes a revisar</Text>
              {report.risk.needsAttention.slice(0, 6).map((person, index) => (
                <View key={person.id} style={styles.listItem}>
                  <Text style={styles.listItemName}>
                    {index + 1}. {person.name}
                  </Text>
                  <Text style={styles.listItemScore}>{person.points} pts</Text>
                </View>
              ))}
              {report.risk.needsAttention.length === 0 ? (
                <Text style={styles.deltaText}>Sin representantes en esta categoría.</Text>
              ) : null}
            </View>

            <View style={styles.listCard}>
              <Text style={styles.listTitle}>Representantes con mejor resultado</Text>
              {report.risk.topPerformers.slice(0, 6).map((person, index) => (
                <View key={person.id} style={styles.listItem}>
                  <Text style={styles.listItemName}>
                    {index + 1}. {person.name}
                  </Text>
                  <Text style={styles.listItemScore}>{person.points} pts</Text>
                </View>
              ))}
              {report.risk.topPerformers.length === 0 ? (
                <Text style={styles.deltaText}>Sin representantes en esta categoría.</Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Resumen operativo</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}
