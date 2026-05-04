# Mapa de impresión — Reporte Operativo

## 1) Flujo de impresión en pantalla
1. **Vista base**: `OperationalReportView` renderiza el reporte dentro de `report-print-root` y separa elementos solo pantalla (`report-screen-only`).
2. **Header del reporte**: `OperationalInstitutionalView` monta `OperationalReportHeader` y le inyecta `onPrint={() => window.print()}`.
3. **Botón imprimir**: `OperationalReportHeader` delega en `ReportExportActions`, que ejecuta `onPrint` en el botón con icono de impresora.
4. **Motor nativo**: `window.print()` abre el diálogo del navegador.
5. **Estilos print**: `src/app/globals.css` aplica `@media print` para ocultar shell/acciones y optimizar tablas/saltos de página.

## 2) Componentes involucrados (UI)
- `src/ui/stats/reports/OperationalReportView.tsx`
- `src/ui/stats/reports/OperationalInstitutionalView.tsx`
- `src/ui/stats/reports/OperationalReportHeader.tsx`
- `src/ui/components/ReportExportActions.tsx`
- `src/app/globals.css`

## 3) Datos que se imprimen
1. `selectOperationalReport` toma estado global y período (`MONTH` o `QUARTER`).
2. `buildOperationalReport` construye métricas actual/anterior/año previo, riesgo, turnos, top incidentes y lectura.
3. Esos datos alimentan panel ejecutivo, tabla comparativa y listas de representantes.

## 4) Flujo alterno (exportación PDF)
- El botón "Descargar PDF" usa `exportOperationalReport`.
- `exportOperationalReport` renderiza `OperationalReportPdfDocument` con `@react-pdf/renderer` y descarga el archivo.
- **Importante**: este flujo no depende de `@media print`; es un render dedicado para PDF.

## 5) Puntos de ajuste recomendados
- **Layout impresión navegador**: `@media print` en `globals.css`.
- **Acciones visibles/ocultas**: clases `report-screen-only` / `report-print-only`.
- **Contenido mostrado**: `OperationalInstitutionalView` y subcomponentes (`ExecutivePanel`, `ComparisonTable`, `PersonList`).
- **Cálculo de contenido**: `selectOperationalReport` + `buildOperationalReport`.
- **PDF institucional**: `OperationalReportPdfDocument`.
