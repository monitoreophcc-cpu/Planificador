'use client'

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { PersonMonthlySummary } from '@/domain/analytics/types'
import type { MonthlySummaryMetrics } from './monthlySummaryMetrics'

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
    marginBottom: 18,
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
    marginTop: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    color: '#0f172a',
    letterSpacing: 1,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metricCard: {
    width: '31%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
    gap: 6,
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
  metricHelp: {
    fontSize: 8,
    color: '#475569',
  },
  readingCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
    gap: 8,
  },
  readingText: {
    fontSize: 10,
    color: '#1e293b',
    lineHeight: 1.6,
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
    backgroundColor: '#ffffff',
    gap: 8,
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
  rowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  cell: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontSize: 8,
    color: '#334155',
  },
  headCell: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontSize: 7,
    color: '#64748b',
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  colPos: { width: '10%', textAlign: 'center' },
  colName: { width: '34%' },
  colNum: { width: '12%', textAlign: 'center' },
  colStatus: { width: '20%', textAlign: 'center' },
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

function buildReading(data: PersonMonthlySummary[], monthLabel: string, totalIncidents: number) {
  const dangerCount = data.filter(person => person.riskLevel === 'danger').length
  const warningCount = data.filter(person => person.riskLevel === 'warning').length
  const topPerson = data[0] ?? null

  if (!topPerson) {
    return `No hay representantes con incidencias registradas en ${monthLabel}.`
  }

  return `${monthLabel} cierra con ${totalIncidents} incidencia(s) registradas, ${dangerCount} representante(s) en nivel revisar y ${warningCount} en atención. ${topPerson.name} encabeza el ranking con ${topPerson.totals.puntos} punto(s), ${topPerson.totals.ausencias} ausencia(s), ${topPerson.totals.tardanzas} tardanza(s) y ${topPerson.totals.errores} error(es).`
}

function riskLabel(person: PersonMonthlySummary) {
  if (person.riskLevel === 'danger') {
    return 'Revisar'
  }

  if (person.riskLevel === 'warning') {
    return 'Atención'
  }

  return 'Estable'
}

export function MonthlySummaryPdfDocument({
  monthLabel,
  metrics,
  data,
}: {
  monthLabel: string
  metrics: MonthlySummaryMetrics
  data: PersonMonthlySummary[]
}) {
  const generatedAt = new Date().toLocaleString('es-DO')
  const sortedData = [...data].sort((left, right) => right.totals.puntos - left.totals.puntos)
  const totalIncidents = sortedData.reduce(
    (accumulator, person) => accumulator + person.incidents.length,
    0
  )
  const totalPoints = sortedData.reduce(
    (accumulator, person) => accumulator + person.totals.puntos,
    0
  )
  const reading = buildReading(sortedData, monthLabel, totalIncidents)
  const topPerson = sortedData[0] ?? null

  return (
    <Document title={`Resumen mensual - ${monthLabel}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Pulso mensual</Text>
            <Text style={styles.title}>Resumen mensual de incidencias</Text>
            <Text style={styles.subtitle}>
              Lectura ejecutiva del mes con métricas clave, foco en volumen y
              tabla principal ordenada por puntos acumulados.
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>Período: {monthLabel}</Text>
            <Text style={styles.metaText}>Generado: {generatedAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas principales</Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Incidencias registradas</Text>
              <Text style={styles.metricValue}>{totalIncidents}</Text>
              <Text style={styles.metricHelp}>Eventos acumulados dentro del mes analizado.</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Puntos acumulados</Text>
              <Text style={styles.metricValue}>{totalPoints}</Text>
              <Text style={styles.metricHelp}>Suma total de puntos del ranking mensual.</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Con 10+ puntos</Text>
              <Text style={styles.metricValue}>{metrics.atRisk}</Text>
              <Text style={styles.metricHelp}>Casos priorizados para revisión.</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>De vacaciones</Text>
              <Text style={styles.metricValue}>{metrics.onVacation}</Text>
              <Text style={styles.metricHelp}>Representantes hoy en vacaciones.</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>De licencia</Text>
              <Text style={styles.metricValue}>{metrics.onLicense}</Text>
              <Text style={styles.metricHelp}>Representantes hoy en licencia.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lectura general</Text>
          <View style={styles.readingCard}>
            <Text style={styles.readingText}>{reading}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foco del mes</Text>
          <View style={styles.spotlightGrid}>
            <View style={styles.spotlightCard}>
              <Text style={styles.spotlightLabel}>Representante en cabeza</Text>
              <Text style={styles.spotlightValue}>
                {topPerson ? topPerson.name : 'Sin datos'}
              </Text>
              <Text style={styles.spotlightBody}>
                {topPerson
                  ? `${topPerson.totals.puntos} punto(s), ${topPerson.totals.ausencias} ausencia(s), ${topPerson.totals.tardanzas} tardanza(s) y ${topPerson.totals.errores} error(es).`
                  : 'No hay incidencias cargadas para este período.'}
              </Text>
            </View>
            <View style={styles.spotlightCard}>
              <Text style={styles.spotlightLabel}>Nivel de atención requerido</Text>
              <Text style={styles.spotlightValue}>{metrics.atRisk} caso(s)</Text>
              <Text style={styles.spotlightBody}>
                Representantes con 10 o más puntos y seguimiento prioritario en la
                lectura ejecutiva del mes.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tabla principal</Text>
          <View style={styles.table}>
            <View style={styles.rowHeader}>
              <Text style={[styles.headCell, styles.colPos]}>Pos.</Text>
              <Text style={[styles.headCell, styles.colName]}>Representante</Text>
              <Text style={[styles.headCell, styles.colNum]}>Puntos</Text>
              <Text style={[styles.headCell, styles.colNum]}>Aus.</Text>
              <Text style={[styles.headCell, styles.colNum]}>Tard.</Text>
              <Text style={[styles.headCell, styles.colNum]}>Err.</Text>
              <Text style={[styles.headCell, styles.colStatus]}>Estado</Text>
            </View>
            {sortedData.map((person, index) => (
              <View key={person.representativeId} style={styles.row}>
                <Text style={[styles.cell, styles.colPos]}>#{index + 1}</Text>
                <Text style={[styles.cell, styles.colName]}>{person.name}</Text>
                <Text style={[styles.cell, styles.colNum]}>{person.totals.puntos}</Text>
                <Text style={[styles.cell, styles.colNum]}>{person.totals.ausencias}</Text>
                <Text style={[styles.cell, styles.colNum]}>{person.totals.tardanzas}</Text>
                <Text style={[styles.cell, styles.colNum]}>{person.totals.errores}</Text>
                <Text style={[styles.cell, styles.colStatus]}>{riskLabel(person)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Resumen mensual</Text>
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
