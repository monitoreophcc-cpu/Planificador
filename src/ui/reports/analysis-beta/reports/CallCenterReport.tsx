'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { KPIs, ShiftKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';

// Register fonts if needed, but standard ones are fine for now
// Font.register({ family: 'Helvetica', fontWeight: 'normal' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandImage: {
    width: 54,
    height: 54,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  mainTitleTop: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1b243d',
    textTransform: 'uppercase',
    lineHeight: 1,
  },
  mainTitleBottom: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1b243d',
    textTransform: 'uppercase',
    marginTop: 1,
    lineHeight: 1,
  },
  subTitle: {
    fontSize: 8,
    color: '#ef4444',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: -2,
  },
  reportMeta: {
    textAlign: 'right',
  },
  dateText: {
    fontSize: 9,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
    marginTop: 20,
    textTransform: 'uppercase',
    borderLeft: 3,
    borderLeftColor: '#ef4444',
    paddingLeft: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: '23%',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  shiftSection: {
    marginTop: 20,
  },
  shiftTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  col1: { width: '25%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '15%', textAlign: 'center' },
  col5: { width: '15%', textAlign: 'center' },
  col6: { width: '15%', textAlign: 'center' },
  headerText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  rowText: {
    fontSize: 9,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#94a3b8',
    fontSize: 8,
  }
});

const REPORT_BRAND_IMAGE =
  typeof window === 'undefined'
    ? '/pizza-hut-symbol-official.png'
    : new URL('/pizza-hut-symbol-official.png', window.location.origin).toString();

interface CallCenterReportProps {
  kpis: KPIs;
  kpisByShift: {
    Día: ShiftKPIs;
    Noche: ShiftKPIs;
  };
  date: string | null;
}

export const CallCenterReport = ({ kpis, kpisByShift, date }: CallCenterReportProps) => {
  const fmt = (n: number) => n.toLocaleString('es-DO');
  const pct = (n: number) => `${n.toFixed(1)}%`;
  const currency = (n: number) =>
    `RD$ ${n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const abandonmentRate = kpis.recibidas > 0 ? (kpis.abandonadas / kpis.recibidas) * 100 : 0;

  return (
    <Document title={`Reporte Monitoreo Call Center - ${date || 'General'}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={REPORT_BRAND_IMAGE} style={styles.brandImage} />
            <View style={styles.titleContainer}>
              <Text style={styles.subTitle}>Pizza Hut</Text>
              <Text style={styles.mainTitleTop}>Monitoreo Call</Text>
              <Text style={styles.mainTitleBottom}>Center</Text>
            </View>
          </View>
          <View style={styles.reportMeta}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a' }}>Reporte Operativo</Text>
            <Text style={styles.dateText}>Fecha de Datos: {date || 'N/A'}</Text>
            <Text style={styles.dateText}>Generado: {new Date().toLocaleString('es-DO')}</Text>
          </View>
        </View>

        {/* Resumen General */}
        <Text style={styles.sectionTitle}>Resumen General de KPIs</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Recibidas</Text>
            <Text style={styles.kpiValue}>{fmt(kpis.recibidas)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Contestadas</Text>
            <Text style={styles.kpiValue}>{fmt(kpis.contestadas)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Abandonadas</Text>
            <Text style={styles.kpiValue}>{fmt(kpis.abandonadas)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>% Atención</Text>
            <Text style={[styles.kpiValue, { color: kpis.nivelDeServicio < 92 ? '#ef4444' : '#10b981' }]}>
              {pct(kpis.nivelDeServicio)}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>% Abandono</Text>
            <Text style={[styles.kpiValue, { color: abandonmentRate >= 8 ? '#ef4444' : '#10b981' }]}>
              {pct(abandonmentRate)}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Transacciones</Text>
            <Text style={styles.kpiValue}>{fmt(kpis.transaccionesCC)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Ventas válidas</Text>
            <Text style={styles.kpiValue}>{currency(kpis.ventasValidas)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Ticket prom.</Text>
            <Text style={styles.kpiValue}>{currency(kpis.ticketPromedio)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>% Conversión</Text>
            <Text style={styles.kpiValue}>{pct(kpis.conversion)}</Text>
          </View>
        </View>

        {/* Detalle por Turnos */}
        <Text style={styles.sectionTitle}>Desempeño por Turnos</Text>
        <View style={styles.shiftTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.col1]}>Turno</Text>
            <Text style={[styles.headerText, styles.col2]}>Recibidas</Text>
            <Text style={[styles.headerText, styles.col3]}>Contestadas</Text>
            <Text style={[styles.headerText, styles.col4]}>% Atenc.</Text>
            <Text style={[styles.headerText, styles.col5]}>Trans.</Text>
            <Text style={[styles.headerText, styles.col6]}>% Conv.</Text>
          </View>
          
          {/* Turno Día */}
          <View style={styles.tableRow}>
            <Text style={[styles.rowText, styles.col1]}>Día (08:00 - 16:00)</Text>
            <Text style={[styles.rowText, styles.col2]}>{fmt(kpisByShift.Día.recibidas)}</Text>
            <Text style={[styles.rowText, styles.col3]}>{fmt(kpisByShift.Día.contestadas)}</Text>
            <Text style={[styles.rowText, styles.col4]}>{pct(kpisByShift.Día.atencion)}</Text>
            <Text style={[styles.rowText, styles.col5]}>{fmt(kpisByShift.Día.trans)}</Text>
            <Text style={[styles.rowText, styles.col6]}>{pct(kpisByShift.Día.conv)}</Text>
          </View>

          {/* Turno Noche */}
          <View style={styles.tableRow}>
            <Text style={[styles.rowText, styles.col1]}>Noche (16:00 - 00:00)</Text>
            <Text style={[styles.rowText, styles.col2]}>{fmt(kpisByShift.Noche.recibidas)}</Text>
            <Text style={[styles.rowText, styles.col3]}>{fmt(kpisByShift.Noche.contestadas)}</Text>
            <Text style={[styles.rowText, styles.col4]}>{pct(kpisByShift.Noche.atencion)}</Text>
            <Text style={[styles.rowText, styles.col5]}>{fmt(kpisByShift.Noche.trans)}</Text>
            <Text style={[styles.rowText, styles.col6]}>{pct(kpisByShift.Noche.conv)}</Text>
          </View>
        </View>

        <View style={{ marginTop: 40, padding: 15, backgroundColor: '#fff7ed', borderRadius: 8, borderWidth: 1, borderColor: '#ffedd5' }}>
          <Text style={{ fontSize: 9, color: '#9a3412', fontWeight: 'bold', marginBottom: 5 }}>Nota del Sistema:</Text>
          <Text style={{ fontSize: 8, color: '#c2410c', lineHeight: 1.4 }}>
            Este reporte ha sido generado automáticamente por el sistema de Monitoreo Call Center. 
            Los datos reflejan el estado de la operación para la fecha seleccionada. 
            Para cualquier discrepancia, favor consultar los archivos fuente originales.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Pizza Hut - Monitoreo Call Center v1.0.4</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
