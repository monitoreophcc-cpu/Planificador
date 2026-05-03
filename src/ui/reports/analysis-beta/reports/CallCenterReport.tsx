'use client';

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { KPIs, ShiftKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';

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
    maxWidth: 340,
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
    marginTop: 14,
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
    flexWrap: 'wrap',
    gap: 10,
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
  pillRow: {
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
  rowMuted: {
    backgroundColor: '#fcfcfd',
  },
  headCell: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontSize: 7,
    color: '#64748b',
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  cell: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontSize: 8,
    color: '#334155',
  },
  shiftCol: { width: '17%' },
  numCol: { width: '10%', textAlign: 'center' },
  pctCol: { width: '11%', textAlign: 'center' },
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
});

interface CallCenterReportProps {
  kpis: KPIs;
  kpisByShift: {
    Día: ShiftKPIs;
    Noche: ShiftKPIs;
  };
  date: string | null;
}

function formatNumber(value: number) {
  return value.toLocaleString('es-DO');
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatCurrency(value: number) {
  return `RD$ ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildReading(kpis: KPIs, kpisByShift: CallCenterReportProps['kpisByShift']) {
  const abandonmentRate =
    kpis.recibidas > 0 ? (kpis.abandonadas / kpis.recibidas) * 100 : 0;
  const strongerShift =
    kpisByShift.Día.trans > kpisByShift.Noche.trans
      ? 'Día'
      : kpisByShift.Noche.trans > kpisByShift.Día.trans
        ? 'Noche'
        : kpisByShift.Día.atencion >= kpisByShift.Noche.atencion
          ? 'Día'
          : 'Noche';
  const strongerStats = kpisByShift[strongerShift];

  return `La jornada cierra con ${formatNumber(kpis.transaccionesCC)} transacciones de Call Center y un nivel de atención de ${formatPercent(kpis.nivelDeServicio)}. El turno ${strongerShift.toLowerCase()} lidera la ejecución con ${formatNumber(strongerStats.trans)} transacciones, ${formatPercent(strongerStats.atencion)} de atención y ${formatPercent(strongerStats.conv)} de conversión. La tasa general de abandono se ubica en ${formatPercent(abandonmentRate)}.`;
}

function buildMetricCards(kpis: KPIs) {
  const abandonmentRate =
    kpis.recibidas > 0 ? (kpis.abandonadas / kpis.recibidas) * 100 : 0;

  return [
    {
      label: 'Llamadas recibidas',
      value: formatNumber(kpis.recibidas),
      help: 'Volumen total de entradas atendidas por la vista actual.',
    },
    {
      label: 'Nivel de atención',
      value: formatPercent(kpis.nivelDeServicio),
      help: 'Porcentaje de llamadas contestadas sobre el total recibido.',
    },
    {
      label: 'Abandono',
      value: formatPercent(abandonmentRate),
      help: `${formatNumber(kpis.abandonadas)} llamadas abandonadas en el período.`,
    },
    {
      label: 'Transacciones',
      value: formatNumber(kpis.transaccionesCC),
      help: 'Operaciones registradas desde Call Center.',
    },
    {
      label: 'Conversión',
      value: formatPercent(kpis.conversion),
      help: 'Conversión sobre llamadas gestionadas con cierre comercial.',
    },
    {
      label: 'Ventas válidas',
      value: formatCurrency(kpis.ventasValidas),
      help: 'Monto bruto válido capturado en la jornada.',
    },
    {
      label: 'Ticket promedio',
      value: formatCurrency(kpis.ticketPromedio),
      help: 'Promedio actual de venta por transacción válida.',
    },
    {
      label: 'Llamadas contestadas',
      value: formatNumber(kpis.contestadas),
      help: 'Contactos efectivamente gestionados por el equipo.',
    },
  ];
}

function buildShiftRows(kpisByShift: CallCenterReportProps['kpisByShift']) {
  return [
    { label: 'Turno Día', ...kpisByShift.Día },
    { label: 'Turno Noche', ...kpisByShift.Noche },
  ];
}

export const CallCenterReport = ({ kpis, kpisByShift, date }: CallCenterReportProps) => {
  const generatedAt = new Date().toLocaleString('es-DO');
  const reading = buildReading(kpis, kpisByShift);
  const metricCards = buildMetricCards(kpis);
  const shiftRows = buildShiftRows(kpisByShift);
  const strongerShift =
    kpisByShift.Día.trans > kpisByShift.Noche.trans
      ? 'Día'
      : kpisByShift.Noche.trans > kpisByShift.Día.trans
        ? 'Noche'
        : kpisByShift.Día.atencion >= kpisByShift.Noche.atencion
          ? 'Día'
          : 'Noche';
  const strongerStats = kpisByShift[strongerShift];

  return (
    <Document title={`Call Center - ${date || 'General'}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Sistema de análisis</Text>
            <Text style={styles.title}>Call Center</Text>
            <Text style={styles.subtitle}>
              Lectura ejecutiva de llamadas y transacciones con foco en atención,
              conversión, abandono y desempeño por turno.
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>Fecha analizada: {date || 'N/A'}</Text>
            <Text style={styles.metaText}>Generado: {generatedAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen ejecutivo</Text>
          <View style={styles.metricGrid}>
            {metricCards.map(card => (
              <View key={card.label} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{card.label}</Text>
                <Text style={styles.metricValue}>{card.value}</Text>
                <Text style={styles.metricHelp}>{card.help}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lectura del día</Text>
          <View style={styles.readingCard}>
            <Text style={styles.readingText}>{reading}</Text>
            <View style={styles.pillRow}>
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
                {formatNumber(kpis.recibidas)} recibidas
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
                {formatNumber(kpis.transaccionesCC)} transacciones
              </Text>
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
                Turno líder: {strongerShift}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foco operativo</Text>
          <View style={styles.spotlightGrid}>
            <View style={styles.spotlightCard}>
              <Text style={styles.spotlightLabel}>Turno con mayor empuje comercial</Text>
              <Text style={styles.spotlightValue}>Turno {strongerShift}</Text>
              <Text style={styles.spotlightBody}>
                Registra {formatNumber(strongerStats.trans)} transacciones y una
                conversión de {formatPercent(strongerStats.conv)}.
              </Text>
            </View>
            <View style={styles.spotlightCard}>
              <Text style={styles.spotlightLabel}>Calidad de atención</Text>
              <Text style={styles.spotlightValue}>
                {formatPercent(kpis.nivelDeServicio)}
              </Text>
              <Text style={styles.spotlightBody}>
                {formatNumber(kpis.abandonadas)} abandonadas con seguimiento por
                duplicadas ({formatNumber(kpisByShift.Día.duplicadas + kpisByShift.Noche.duplicadas)})
                {' '}y casos LT20 ({formatNumber(kpisByShift.Día.lt20 + kpisByShift.Noche.lt20)}).
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desglose por turno</Text>
          <View style={styles.table}>
            <View style={styles.rowHeader}>
              <Text style={[styles.headCell, styles.shiftCol]}>Turno</Text>
              <Text style={[styles.headCell, styles.numCol]}>Recib.</Text>
              <Text style={[styles.headCell, styles.numCol]}>Cont.</Text>
              <Text style={[styles.headCell, styles.pctCol]}>% Aten.</Text>
              <Text style={[styles.headCell, styles.numCol]}>Aband.</Text>
              <Text style={[styles.headCell, styles.numCol]}>Dup.</Text>
              <Text style={[styles.headCell, styles.numCol]}>LT20</Text>
              <Text style={[styles.headCell, styles.numCol]}>Trans.</Text>
              <Text style={[styles.headCell, styles.pctCol]}>% Conv.</Text>
            </View>
            {shiftRows.map((row, index) => (
              <View
                key={row.label}
                style={index % 2 === 1 ? [styles.row, styles.rowMuted] : styles.row}
              >
                <Text style={[styles.cell, styles.shiftCol]}>{row.label}</Text>
                <Text style={[styles.cell, styles.numCol]}>{formatNumber(row.recibidas)}</Text>
                <Text style={[styles.cell, styles.numCol]}>{formatNumber(row.contestadas)}</Text>
                <Text style={[styles.cell, styles.pctCol]}>{formatPercent(row.atencion)}</Text>
                <Text style={[styles.cell, styles.numCol]}>{formatNumber(row.abandonadas)}</Text>
                <Text style={[styles.cell, styles.numCol]}>{formatNumber(row.duplicadas)}</Text>
                <Text style={[styles.cell, styles.numCol]}>{formatNumber(row.lt20)}</Text>
                <Text style={[styles.cell, styles.numCol]}>{formatNumber(row.trans)}</Text>
                <Text style={[styles.cell, styles.pctCol]}>{formatPercent(row.conv)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Call Center</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};
