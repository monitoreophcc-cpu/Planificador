# Fase 3 - Aislamiento de Superficies Inestables

Fecha de arranque: 2026-04-05  
Rama de trabajo: `codex-saneamiento-fase-0`

## Objetivo

La Fase 3 no busca desarrollar nuevas capacidades. Busca reducir ruido operativo:

- aislar superficies Beta o experimentales del flujo principal
- retirar residuos que contaminan el repo sin aportar estabilidad
- dejar explícita la prioridad siguiente del saneamiento

## Decisión de alcance

La funcionalidad de análisis y reportes avanzados sigue siendo importante a futuro, pero queda fuera del foco actual.

En esta fase se adopta esta regla:

- `call-center-analysis` y `analysis-beta` quedan congelados como superficie Beta
- el producto principal no debe depender de esa superficie para navegar o compilar sus flujos críticos
- la deuda estructural del core tiene prioridad por encima del desarrollo Beta

## Contaminantes detectados al abrir la fase

- acceso directo a `Análisis (Beta)` desde el shell principal
- utilidades del dominio Beta reutilizadas desde reportes del core
- archivo residual `src/ui/planning/SwapModal.tsx.broken`
- carpetas Beta mezcladas con `src/` aunque hoy no formen parte del foco de estabilidad

## Acciones aplicadas al abrir Fase 3

- se retiró el acceso a `Análisis (Beta)` desde `src/ui/stats/StatsView.tsx`
- el formatter usado por `PointsReportView` dejó de depender del dominio Beta y pasó a `src/lib/formatters.ts`
- `getMonthlyPointsSummary` ya no tipa su entrada con el servicio Beta completo, solo con un contrato mínimo
- se eliminó `src/ui/planning/SwapModal.tsx.broken`

## Consolidación estructural aplicada

Se completó una pasada adicional sobre duplicidades y límites de infraestructura:

- la persistencia canónica de estado quedó consolidada en `src/persistence/storage.ts`
- se reubicaron las helpers de flags UI a `src/persistence/localStorage.ts`
- se retiró la carpeta legacy `persistence/` fuera de `src`
- se retiró la capa duplicada `src/application/persistence/*`, que ya no tenía consumidores reales
- `PointsReportView` dejó de depender de `useOperationalDashboardStore`
- se creó `src/store/useReportingDataStore.ts` para el dato suplementario de reporting que sí puede servir al core
- la superficie Beta sigue alimentando ese dato cuando procesa o restaura sesiones, pero ya no arrastra su store operativo al reporte de puntos
- el hook `use-toast` que solo consumía `analysis-beta` se movió a `src/ui/reports/analysis-beta/hooks/use-toast.ts`
- los stores Beta `useOperationalDashboardStore` y `useAgentPerformanceStore` migraron a `src/ui/reports/analysis-beta/store/`
- la persistencia de sesiones Beta migró a `src/ui/reports/analysis-beta/persistence/analysis-session.db.ts`
- `src/store/` volvió a contener solo stores del core y soporte transversal
- `src/infra/persistence/` dejó de alojar persistencia exclusiva de la superficie Beta
- `CallCenterAnalysisView` salió de `src/ui/stats/reports/` y ahora vive en `src/ui/reports/analysis-beta/`
- `src/ui/stats/reports/` dejó de contener vistas Beta mezcladas con reportes del core
- el contrato de correlación operativo dejó de vivir bajo `call-center-analysis` y pasó a `src/domain/reporting/correlation/correlation.types.ts`
- el core (`usePlannerContext`, semántica y tendencias de reporting) ya no depende del dominio Beta para tipar correlación

## Estado esperado tras esta apertura

- la UI principal deja de ofrecer una entrada activa a una superficie congelada
- los reportes del core reducen acoplamiento con el dominio Beta
- el repo queda más claro respecto a qué zonas están activas y cuáles no

## Verificación del bloque estructural

Resultado tras la consolidación:

- `npm run lint`: pasa
- `npm run typecheck`: pasa
- `npm test`: pasa (`57 suites`, `309 tests`)
- `npm run build`: pasa

Bundle medido tras esta pasada:

- `/` = `6.06 kB`
- `First Load JS` = `94.6 kB`

## Prioridad siguiente

La prioridad posterior a esta apertura es:

1. deuda estructural del core
2. mejoras de calidad de vida y pulido
3. saneamiento específico de superficies Beta, solo cuando vuelva a ser prioridad

## Pendientes intencionalmente fuera de esta fase

- reactivar o endurecer `CallCenterAnalysisView`
- sanear internamente `src/domain/call-center-analysis/**`
- decidir el destino final de `src/domain/agent-mapping/**`, que sigue congelado y excluido del pipeline principal
- decidir si `src/components/prediction/WeeklyPredictionCard*` se mantiene como superficie auxiliar o migra formalmente a Beta
- cerrar la arquitectura final de `analysis-beta`
- decidir si `analysis-beta` necesita un punto de entrada propio fuera de la navegación principal para futuras reactivaciones
