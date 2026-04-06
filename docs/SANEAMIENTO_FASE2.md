# Fase 2 - Warnings y Deuda del Core

Fecha de arranque: 2026-04-05
Rama de trabajo: `codex-saneamiento-fase-0`

## Objetivo

La Fase 2 entra después de estabilizar el tooling y busca reducir deuda técnica visible en la superficie productiva del sistema.

El foco inicial es:

- corregir warnings del core que ya expone `lint`
- atacar deuda inmediata en código vivo
- evitar que el saneamiento se diluya en tests, stories o utilidades auxiliares

## Alcance inicial

Se consideran prioritarios en esta fase:

- `src/ui/logs`
- `src/ui/planning`
- `src/ui/settings`
- `src/ui/stats/reports`
- `src/store`
- `src/domain/*` que afecte el flujo operativo principal

## Criterio operativo

En esta fase se prefieren arreglos pequeños, verificables y de bajo riesgo:

- dependencias correctas en hooks
- simplificación de lógica redundante
- limpieza de deuda obvia en stores y contratos vivos

Quedan fuera del primer barrido:

- tests
- stories
- scripts manuales
- superficies beta auxiliares que no afecten el flujo principal

## Línea de salida provisional

La fase avanza bien si:

- disminuyen los warnings del core en `npm run lint`
- no reaparecen fallos en `typecheck`
- `npm run build` sigue pasando sin bypasses

## Avance actual

Barrido ya resuelto en el core:

- warnings de dependencias de hooks en `DailyLogView`
- warnings de dependencias de hooks en `PlanningSection`
- warning de dependencias en `SwapModal`
- warning de `useEffect` en `ManagerScheduleManagement`
- warning de dependencias en `OperationalAnalysisView`
- cleanup real del autosave en `src/app/page.tsx`
- eliminación del artefacto versionado `tsconfig.tsbuildinfo`

Estado verificado tras este barrido:

- `npm run lint`: pasa
- `npm run typecheck`: pasa
- los warnings restantes ya no pertenecen al core intervenido

## Estado tras limpieza de lint remanente

Se corrigieron los últimos warnings visibles en:

- `WeeklyPredictionCard.stories.tsx`
- `analysis-beta/AgentPerformanceTable`
- `analysis-beta/header/FileLoadButtons`
- `analysis-beta/header/SessionHistory`

Resultado actual:

- `npm run lint`: sin warnings ni errores
- `npm run typecheck`: pasa
- `npm run build`: pasa sin bypasses

Eso deja la Fase 2 lista para elegir el siguiente frente:

1. seguir limpiando beta y warnings remanentes
2. atacar deuda estructural del core
3. reducir bundle inicial

## Estado tras reducción de bundle inicial

Se aplicó carga diferida a vistas pesadas del shell principal y a los paneles de estadísticas:

- `src/ui/AppShell.tsx`
- `src/ui/stats/StatsView.tsx`

Resultado medido con `npm run build`:

- antes: `/` pesaba `477 kB` y el `First Load JS` era `625-626 kB`
- después: `/` pesa `4.22 kB` y el `First Load JS` bajó a `154 kB`

Validación posterior al cambio:

- `npm run lint`: pasa
- `npm run typecheck`: pasa
- `npm run build`: pasa sin bypasses

Lectura práctica:

- el shell dejó de arrastrar vistas completas que no se usan en la carga inicial
- la navegación principal ahora difiere la mayor parte del costo de planificación, configuración y reportes
- el siguiente candidato natural, si se quiere seguir bajando el bundle, es revisar dependencias animadas/globales como `framer-motion`

## Estado tras limpieza del shell compartido

Se hizo un segundo barrido de carga inicial para recortar dependencias que seguían entrando por el shell:

- se eliminó el `UndoToast` duplicado dentro de `src/ui/AppShell.tsx`
- el `UndoToast` quedó sin dependencia de `framer-motion`
- el cálculo de resumen mensual para el modal de persona se movió a `src/ui/monthly/LazyPersonDetailModal.tsx`

Resultado medido con `npm run build` después de ese barrido:

- antes de este paso: `/` pesaba `4.22 kB` y el `First Load JS` era `154 kB`
- después de este paso: `/` pesa `4.12 kB` y el `First Load JS` bajó a `117 kB`

Verificación:

- `npm run lint`: pasa
- `npm run typecheck`: pasa
- `npm run build`: pasa sin bypasses

Lectura práctica:

- ya no se carga en el arranque el resumen mensual del modal de detalle
- el shell dejó de arrastrar una librería de animación para un toast que normalmente está vacío
- la mejora adicional ya entra en zona de menor retorno; para seguir bajando habría que perfilar el bundle compartido con más detalle

## Perfilado del bundle compartido

Se hizo un barrido adicional para identificar si todavía había librerías de producto entrando en el `shared bundle`.

Ajustes aplicados y conservados:

- `src/store/useAppStore.ts` dejó de importar `date-fns` en nivel módulo y usa helpers locales para fechas simples
- `src/store/useAppStore.ts` difiere la carga de persistencia en `initialize`
- `src/app/page.tsx` difiere la carga de persistencia del autosave

Resultado medido:

- antes de este barrido: `/` = `4.12-4.13 kB`, `First Load JS` = `117 kB`
- después de este barrido: `/` = `4.13 kB`, `First Load JS` = `114 kB`

Hallazgo importante:

- `/_not-found` sigue pesando `89.4 kB`
- el `shared by all` pesa `88.5 kB`

Interpretación:

- casi todo el peso restante compartido ya corresponde al suelo de `Next.js` + `React` + runtime común del App Router
- las optimizaciones de producto todavía pueden bajar algunos KB de la ruta `/`, pero ya no moverán mucho el `shared bundle`
- para lograr una reducción grande adicional habría que entrar en un refactor más profundo del store raíz o cambiar la arquitectura de carga del shell

## Refactor del store raíz

Se hizo un barrido más profundo sobre `src/store/useAppStore.ts` para separar carga en frío de lógica de dominio ejecutada solo bajo interacción:

- se creó `src/application/presenters/humanizeStore.ts` con el subconjunto mínimo de copy que el store necesita
- `useAppStore` dejó de importar en nivel módulo:
  - `validateIncident`
  - `resolveIncidentDates`
  - `buildDisciplinaryKey`
  - `calculatePoints`
- esos módulos ahora se cargan dentro de `addIncident`, que ya era async
- `useAppStore` dejó de importar `useAuditStore` en frío y ahora la escritura de auditoría se resuelve bajo demanda
- `src/domain/calendar/state.ts` dejó de depender de `date-fns` para obtener `dayOfWeek`

Resultado medido:

- antes de este refactor: `/` = `4.13 kB`, `First Load JS` = `114 kB`
- después del primer barrido del store: `/` = `4.16 kB`, `First Load JS` = `105 kB`
- después del desacople de auditoría: `/` = `4.16 kB`, `First Load JS` = `103 kB`

Lectura práctica:

- la mejora vino de sacar lógica de incidencias y auditoría del camino de arranque
- el costo de bootstrap del store quedó bastante más cerca del mínimo razonable sin romper la API pública
- el siguiente salto importante ya no es “lazy import adicional”, sino rediseñar bootstrap y estado raíz como capas separadas

## Separación shell/bootstrap vs dominio

Se hizo un corte arquitectónico adicional para que el shell no dependa directamente del store raíz:

- se creó `src/store/useAppUiStore.ts` para:
  - confirmaciones
  - navegación del shell
  - modales de detalle y turno mixto
  - confirmación de vacaciones
  - stack de undo
- `src/ui/AppShell.tsx` y `src/ui/components/UndoToast.tsx` dejaron de depender de `useAppStore`
- `src/app/page.tsx` dejó de importar el store raíz en frío y ahora hace bootstrap por `dynamic import`
- `HistoryEvent` se movió al dominio en `src/domain/history/types.ts`

Resultado medido:

- antes de este corte: `/` = `4.16 kB`, `First Load JS` = `103 kB`
- después de separar shell y bootstrap: `/` = `5.74 kB`, `First Load JS` = `94.5 kB`

Lectura práctica:

- aunque el tamaño de la ruta subió un poco, la carga inicial real bajó casi `9 kB`
- el shell ya no necesita traer el store de dominio para pintar navegación, modales y undo
- el bootstrap del estado quedó desacoplado y ahora carga el store solo cuando hace falta inicializarlo

## Endurecimiento de bootstrap y auditoría

Se hizo una pasada conservadora sobre dos riesgos del core detectados durante la revisión:

- `src/app/page.tsx` ya no deja la app colgada si falla una importación o la inicialización del store
- el autosave y el backup quedaron fuera del camino crítico del primer render
- la auditoría volvió a tener una sola fuente de verdad en `auditLog`
- `src/store/useAuditStore.ts` se retiró del repo para evitar divergencias entre vistas, backups y restore

Además, se normalizó la auditoría histórica:

- se agregó `src/domain/audit/normalizeAuditEvent.ts`
- se normaliza `auditLog` al cargar storage, importar backups y registrar eventos nuevos
- se añadieron pruebas puntuales para bootstrap y migración legacy:
  - `src/app/page.test.tsx`
  - `src/domain/audit/normalizeAuditEvent.test.ts`

Resultado después de este barrido:

- `npm run lint`: pasa
- `npm run typecheck`: pasa
- `npm run build`: pasa

## Cierre de compuertas de test del core

Durante esta fase se acordó dejar `call-center-analysis` fuera del runner principal por tratarse de una funcionalidad Beta. Para reflejar ese alcance:

- `jest.config.cjs` ignora `src/domain/call-center-analysis/`
- se corrigieron bloqueos de infraestructura y contratos en la suite principal:
  - fallback seguro para IDs de auditoría sin depender de `crypto.randomUUID`
  - `getDailyShiftStats` volvió a usar `WeeklyPlan` como base canónica de slots planeados
  - `getEffectiveDailyCoverage` ya no invalida planes completos cuando no recibe catálogo de representantes
  - se actualizaron fixtures de responsabilidad punitiva al contrato vigente
  - se retiró el arrastre de `vitest` en suites que corren bajo Jest
  - `belongsToShiftThisWeek` recuperó la visibilidad nativa por `mixProfile` sin alterar el scheduling efectivo global

Resultado verificado al cierre:

- `npm test`: pasa con el alcance de Fase 2 (`57 suites`, `309 tests`)
- `npm run lint`: pasa sin warnings
- `npm run typecheck`: pasa
- `npm run build`: pasa sin bypasses

Bundle actual medido:

- `/` = `6.09 kB`
- `First Load JS` = `94.8 kB`

## Estado final de Fase 2

La Fase 2 puede considerarse cerrada con el alcance acordado.

Queda explícitamente fuera de esta fase:

- `src/domain/call-center-analysis/**`

Pendientes para una fase posterior:

- saneamiento específico de la funcionalidad Beta de `call-center-analysis`
- decisiones de producto sobre `analysis-beta` si se quiere sacar de Beta o endurecer su cobertura
