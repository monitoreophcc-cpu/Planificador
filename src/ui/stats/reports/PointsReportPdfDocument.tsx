'use client'

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type {
  MonthlyPointsSummary,
  PayrollRow,
} from '@/application/stats/getMonthlyPointsSummary'

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
    gap: 8,
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
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '23%',
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
  blockSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  blockSummaryCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  blockTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: '#0f172a',
  },
  blockBody: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableHeader: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: '#0f172a',
  },
  tableSubtitle: {
    marginTop: 3,
    fontSize: 8,
    color: '#64748b',
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
  rowMuted: {
    backgroundColor: '#fcfcfd',
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
  nameCol: { width: '38%' },
  numCol: { width: '12%', textAlign: 'right' },
  totalCol: { width: '14%', textAlign: 'right' },
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

function computeTotals(rows: PayrollRow[]) {
  return rows.reduce(
    (accumulator, row) => ({
      tardanza: accumulator.tardanza + row.tardanza,
      ausencia: accumulator.ausencia + row.ausencia,
      errores: accumulator.errores + row.errores,
      otros: accumulator.otros + row.otros,
      total: accumulator.total + row.total,
    }),
    {
      tardanza: 0,
      ausencia: 0,
      errores: 0,
      otros: 0,
      total: 0,
    }
  )
}

function buildSections(summary: MonthlyPointsSummary) {
  return [
    { title: 'Incidencias y puntos - Turno Día', rows: summary.salesDay },
    { title: 'Incidencias y puntos - Turno Noche', rows: summary.salesNight },
    { title: 'Servicio al Cliente - Turno Día', rows: summary.serviceDay },
    { title: 'Servicio al Cliente - Turno Noche', rows: summary.serviceNight },
  ]
}

function PointsTable({
  title,
  rows,
}: {
  title: string
  rows: PayrollRow[]
}) {
  const totals = computeTotals(rows)

  return (
    <View style={styles.tableCard} wrap={false}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableTitle}>{title}</Text>
        <Text style={styles.tableSubtitle}>
          {rows.length} representante(s) en el bloque
        </Text>
      </View>

      <View style={styles.rowHeader}>
        <Text style={[styles.headCell, styles.nameCol]}>Representante</Text>
        <Text style={[styles.headCell, styles.numCol]}>Tard.</Text>
        <Text style={[styles.headCell, styles.numCol]}>Aus.</Text>
        <Text style={[styles.headCell, styles.numCol]}>Err.</Text>
        <Text style={[styles.headCell, styles.numCol]}>Otros</Text>
        <Text style={[styles.headCell, styles.totalCol]}>Total</Text>
      </View>

      {rows.map((row, index) => (
        <View
          key={row.repId}
          style={index % 2 === 1 ? [styles.row, styles.rowMuted] : styles.row}
        >
          <Text style={[styles.cell, styles.nameCol]}>{row.repName}</Text>
          <Text style={[styles.cell, styles.numCol]}>{row.tardanza || ''}</Text>
          <Text style={[styles.cell, styles.numCol]}>{row.ausencia || ''}</Text>
          <Text style={[styles.cell, styles.numCol]}>{row.errores || ''}</Text>
          <Text style={[styles.cell, styles.numCol]}>{row.otros || ''}</Text>
          <Text style={[styles.cell, styles.totalCol]}>{row.total}</Text>
        </View>
      ))}

      <View style={[styles.row, { backgroundColor: '#fff7ed' }]}>
        <Text style={[styles.cell, styles.nameCol]}>Total del bloque</Text>
        <Text style={[styles.cell, styles.numCol]}>{totals.tardanza || ''}</Text>
        <Text style={[styles.cell, styles.numCol]}>{totals.ausencia || ''}</Text>
        <Text style={[styles.cell, styles.numCol]}>{totals.errores || ''}</Text>
        <Text style={[styles.cell, styles.numCol]}>{totals.otros || ''}</Text>
        <Text style={[styles.cell, styles.totalCol]}>{totals.total}</Text>
      </View>
    </View>
  )
}

export function PointsReportPdfDocument({
  monthLabel,
  summary,
}: {
  monthLabel: string
  summary: MonthlyPointsSummary
}) {
  const sections = buildSections(summary)
  const generatedAt = new Date().toLocaleString('es-DO')
  const overallTotals = sections.reduce(
    (accumulator, section) => {
      const totals = computeTotals(section.rows)

      return {
        representatives: accumulator.representatives + section.rows.length,
        tardanza: accumulator.tardanza + totals.tardanza,
        ausencia: accumulator.ausencia + totals.ausencia,
        errores: accumulator.errores + totals.errores,
        otros: accumulator.otros + totals.otros,
        total: accumulator.total + totals.total,
      }
    },
    {
      representatives: 0,
      tardanza: 0,
      ausencia: 0,
      errores: 0,
      otros: 0,
      total: 0,
    }
  )

  return (
    <Document title={`Incidencias - ${monthLabel}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Seguimiento mensual</Text>
            <Text style={styles.title}>Incidencias y puntos por turno</Text>
            <Text style={styles.subtitle}>
              Vista compacta para revisión disciplinaria y seguimiento operativo
              con separación por turno y rol.
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>Período: {monthLabel}</Text>
            <Text style={styles.metaText}>Generado: {generatedAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del mes</Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Representantes</Text>
              <Text style={styles.metricValue}>{overallTotals.representatives}</Text>
              <Text style={styles.metricHelp}>Personas incluidas en los cuatro bloques.</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Puntos acumulados</Text>
              <Text style={styles.metricValue}>{overallTotals.total}</Text>
              <Text style={styles.metricHelp}>Suma total de puntos punitivos del mes.</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Ausencias</Text>
              <Text style={styles.metricValue}>{overallTotals.ausencia}</Text>
              <Text style={styles.metricHelp}>Puntos vinculados a ausencias registradas.</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Errores + tardanzas</Text>
              <Text style={styles.metricValue}>
                {overallTotals.errores + overallTotals.tardanza}
              </Text>
              <Text style={styles.metricHelp}>Acumulado conjunto de errores y tardanzas.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lectura por bloque</Text>
          <View style={styles.blockSummaryGrid}>
            {sections.map(section => {
              const totals = computeTotals(section.rows)

              return (
                <View key={section.title} style={styles.blockSummaryCard}>
                  <Text style={styles.blockTitle}>{section.title}</Text>
                  <Text style={styles.blockBody}>
                    {section.rows.length} representante(s), {totals.total} punto(s),{' '}
                    {totals.ausencia} por ausencias, {totals.tardanza} por tardanzas y{' '}
                    {totals.errores} por errores.
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bloques del reporte</Text>
          {sections.map(section => (
            <PointsTable key={section.title} title={section.title} rows={section.rows} />
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>Incidencias del mes</Text>
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
