# Fase 4 - Deuda Técnica Fina del Core

Fecha de cierre: 2026-04-07  
Rama de trabajo: `codex-saneamiento-fase-0`

## Objetivo

La Fase 4 toma el relevo después de estabilizar el tooling, sanear el core y aislar superficies Beta.

Su objetivo fue:

- eliminar god files y hooks demasiado anchos del core activo
- separar responsabilidades entre vistas, hooks, helpers, slices y shells
- bajar el acoplamiento interno sin tocar la lógica de negocio de `src/domain`
- mantener el pipeline completo en verde durante todo el refactor

No fue una fase de features nuevas. Fue una fase de mantenibilidad, claridad y reducción de riesgo de cambio.

## Criterio de trabajo

En esta fase se aplicó una regla simple:

- si un archivo mezclaba UI + derivaciones + side effects + validación + composición, se partía
- si un archivo era grande pero coherente, se dejaba
- si un helper de dominio estaba grande pero justificaba su complejidad, no se tocaba por deporte

## Frentes resueltos

### 1. Shell, stores y bootstrap

Se redujo el ancho de los ensambladores principales para que dejaran de concentrar detalles de UI o sincronización:

- `src/store/useAppStore.ts`
- `src/store/appStoreUiBridge.ts`
- `src/store/appStoreCloudSync.ts`
- `src/store/appStorePersistence.ts`
- `src/store/eventLogSlice.ts`
- `src/store/planningCalendarSlice.ts`
- `src/store/incidentSlice.ts`
- `src/store/swapSlice.ts`
- `src/store/incidentRemoval.ts`
- `src/store/useAppUiStore.ts`

Resultado:

- el store raíz quedó como ensamblador y ciclo de vida, no como depósito de toda la lógica
- las acciones de UI y los puentes entre stores salieron del store principal
- las rutas de sync cloud y persistencia quedaron más explícitas

### 2. Daily Log

El flujo de log diario fue una de las superficies con más mezcla de responsabilidades y recibió la mayor cantidad de cortes:

- `src/ui/logs/DailyLogView.tsx`
- `src/ui/logs/useDailyLogController.tsx`
- `src/ui/logs/useDailyLogFormState.ts`
- `src/ui/logs/useDailyLogSubmission.tsx`
- `src/ui/logs/useDailyLogDerivedData.ts`
- `src/ui/logs/useDailyLogOperationalDerived.ts`
- `src/ui/logs/useDailyLogIncidentDerived.ts`
- `src/ui/logs/dailyLogOperationalData.ts`
- `src/ui/logs/dailyLogRepresentativeFilter.ts`
- `src/ui/logs/dailyLogConflictCheck.ts`
- `src/ui/logs/dailyLogIncidentList.ts`
- `src/ui/logs/DailyLogToolbar.tsx`
- `src/ui/logs/DailyLogSidebar.tsx`
- `src/ui/logs/DailyLogSidebarRepresentativeList.tsx`
- `src/ui/logs/DailyLogIncidentForm.tsx`
- `src/ui/logs/AbsenceConfirmationModal.tsx`

Resultado:

- la vista principal dejó de mezclar control, render, flujos de formulario y modales
- la derivación de datos quedó separada de la interacción del usuario
- los formularios y modales quedaron más pequeños y con estilos reutilizables

### 3. Planner y swaps

El bloque operativo del planner también quedó mucho más modular:

- `src/ui/planning/PlanningSection.tsx`
- `src/ui/planning/PlanningSectionContent.tsx`
- `src/ui/planning/PlanningSectionModals.tsx`
- `src/ui/planning/usePlanningSectionActions.ts`
- `src/ui/planning/planningSectionOverrideFlow.ts`
- `src/ui/planning/planningSectionCommentFlow.ts`
- `src/ui/planning/SwapModal.tsx`
- `src/ui/planning/SwapModalContent.tsx`
- `src/ui/planning/useSwapModalState.ts`
- `src/ui/planning/useSwapModalDerivedState.ts`
- `src/ui/planning/swapModalStateHelpers.ts`

Resultado:

- el planner quedó más cerca de un coordinador que de una vista omnisciente
- el flujo del modal de swaps dejó de concentrar estado inicial, cálculos derivados y validación en un solo hook
- los modales operativos ahora tienen contratos más claros

### 4. Settings y gestión

La zona de configuración y gestión operativa perdió varios archivos demasiado anchos:

- `src/ui/settings/RepresentativeManagement.tsx`
- `src/ui/settings/RepresentativeForm.tsx`
- `src/ui/settings/ManagerScheduleManagement.tsx`
- `src/ui/settings/useManagerScheduleManagement.ts`
- `src/ui/settings/useManagerScheduleActions.ts`
- `src/ui/settings/useManagerScheduleDnd.ts`
- `src/ui/settings/useManagerStructuralLog.ts`
- `src/ui/settings/HolidayManagement.tsx`
- `src/ui/settings/QuickGuide.tsx`
- `src/ui/settings/SettingsSystemContent.tsx`

Resultado:

- la gestión de managers dejó de mezclar DnD, logging estructural, navegación y acciones de negocio en un solo hook
- formularios y vistas de settings pasaron a ser contenedores más legibles

### 5. Reportes y visualización

También se refactorizó la capa activa de reportes del core:

- `src/ui/stats/overview/StatsOverview.tsx`
- `src/ui/stats/reports/OperationalAnalysisResults.tsx`
- `src/ui/stats/reports/OperationalReportView.tsx`
- `src/ui/stats/reports/ExecutiveReportView.tsx`
- `src/ui/stats/reports/PointsReportView.tsx`
- `src/ui/coverage/CoverageChart.tsx`
- `src/application/stats/getCoverageRiskSummary.ts`
- `src/application/stats/coverageRiskSummaryHelpers.ts`
- `src/application/analysis/buildOperationalAnalysis.ts`
- `src/application/reports/buildOperationalReport.ts`

Resultado:

- las vistas de reportes dejaron de mezclar cálculo, copy y render
- el análisis operativo y los resúmenes de cobertura quedaron más fáciles de mantener

### 6. Capa híbrida y sync cloud

La integración con Supabase también quedó separada en responsabilidades:

- `src/persistence/supabase-sync.ts`
- `src/persistence/supabase-sync-data.ts`
- `src/persistence/supabase-sync-runtime.ts`
- `src/persistence/supabase-sync-types.ts`
- `src/persistence/supabase-sync-serializers.ts`
- `src/persistence/supabase-sync-deserializers.ts`
- `src/persistence/supabase-sync-weekly-plans.ts`

Resultado:

- la serialización y la lógica runtime ya no conviven en un solo archivo grande
- la sincronización híbrida quedó más defendible para futuras iteraciones

## Resultado técnico al cierre

Verificación final del repo al cierre de Fase 4:

- `npm run lint`: pasa
- `npm test`: pasa (`58 suites`, `311 tests`)
- `npm run build`: pasa
- `npm run typecheck`: pasa

Build medido al cierre:

- `/` = `21.4 kB`
- `First Load JS` = `171 kB`

## Estado del core tras la cacería de god files

El core activo ya no presenta god files claros del tipo:

- una vista principal que también decide negocio
- un hook que concentra navegación, validación, side effects y estado local masivo
- un store raíz que además resuelve UI, persistencia, sync y flujos operativos en un solo archivo

Lo que sigue arriba por tamaño ahora cae más bien en estas categorías:

- ensambladores razonables
- helpers densos pero coherentes
- componentes medianos que todavía pueden pulirse, pero que ya no bloquean mantenibilidad

Ejemplos de archivos grandes pero hoy justificables:

- `src/store/useAppStore.ts`
- `src/store/specialScheduleSlice.ts`
- `src/store/useAppUiStore.ts`
- `src/ui/coverage/CoverageRuleModal.tsx`
- `src/persistence/supabase-sync-runtime.ts`

## Criterio de cierre cumplido

La Fase 4 puede darse por cerrada porque:

- la deuda gruesa de god files del core fue desarmada
- el pipeline completo sigue verde
- no se reabrió la superficie Beta
- el refactor no tocó `src/domain` ni los archivos explícitamente prohibidos

## Pendientes posteriores a Fase 4

Lo que queda ya no pertenece a esta fase y debe tratarse como trabajo posterior:

- optimización de bundle y performance
- endurecimiento operativo de Supabase/Auth con validación manual real en entorno productivo
- pulido fino de componentes medianos que ya no son deuda crítica
- reactivación o saneamiento de superficies Beta solo cuando vuelva a ser prioridad

## Conclusión

Fase 4 cerró el tramo más delicado del saneamiento del core.

El repositorio queda ahora en un punto mucho más sano:

- tooling confiable
- core estable
- superficies Beta aisladas
- deuda estructural gruesa reducida
- pipeline completo verificable

El siguiente paso ya no es “seguir cazando monstruos”, sino decidir una Fase 5 con objetivo explícito:

1. performance
2. endurecimiento de integración cloud
3. pulido y calidad de vida
