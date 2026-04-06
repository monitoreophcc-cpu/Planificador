# Fase 0 - Encapsulamiento y Baseline

Fecha de arranque: 2026-04-05
Rama de trabajo: `codex-saneamiento-fase-0`

## Objetivo

Esta fase no busca corregir errores masivamente. Su propósito es:

- delimitar qué partes del repositorio cuentan como producto activo
- separar superficies beta, experimentales o incompletas
- dejar un baseline técnico verificable antes de tocar tooling y código vivo

## Superficie núcleo

Para el saneamiento inicial, se considera núcleo operativo la app principal basada en:

- `src/app`
- `src/store`
- `src/hooks`
- `src/domain/planning`
- `src/domain/incidents`
- `src/domain/calendar`
- `src/domain/swaps`
- `src/domain/management`
- `src/application/ui-adapters`
- `src/ui/planning`
- `src/ui/logs`
- `src/ui/settings`
- `src/ui/stats`
- `src/ui/audit`
- `src/persistence`

Estas áreas tienen prioridad porque sostienen el flujo que hoy sí llega a build de producción.

## Superficies en observación

Estas zonas quedan explícitamente fuera del saneamiento inicial del core, salvo que bloqueen build, lint o typecheck del producto activo:

- `src/ui/reports/analysis-beta`
- `src/domain/call-center-analysis`
- `src/domain/agent-mapping`
- `src/components/prediction`
- scripts de prueba manual como `quick-test.ts`, `test-synthetic.ts` y similares
- código residual o transicional como `SwapModal.tsx.broken`

La regla es simple: si una de estas áreas no es crítica para el flujo principal, primero se aísla o se congela; no se mezcla con estabilización del core.

## Baseline técnico de arranque

Estado observado al iniciar el saneamiento:

- `npm run build`: pasa
- `npx tsc --noEmit`: falla con 128 errores en 36 archivos
- `npm run lint`: no ejecuta por incompatibilidad de configuración/tooling
- el build de Next omite validación de tipos y lint
- el bundle inicial de `/` es alto para una sola ruta principal

## Hallazgos estructurales ya confirmados

- El build actual no certifica salud real porque omite typecheck y lint.
- Hay desalineación entre `next`, `eslint` y `eslint-config-next`.
- Existen contratos de dominio evolucionados sin actualización pareja en tests y fixtures.
- Hay stores y eventos de auditoría con contratos de tipos inconsistentes.
- Hay módulos beta o incompletos que hoy contaminan el typecheck global.
- Existen capas duplicadas o transicionales en persistencia y UI.

## Criterio de cierre de Fase 0

Fase 0 se considera cerrada cuando:

- existe una rama de saneamiento dedicada
- el alcance del core está documentado
- las superficies beta o experimentales están identificadas
- el baseline técnico inicial quedó registrado

## Siguiente paso

La Fase 1 ataca exclusivamente tooling y señales de calidad:

- alinear versiones de lint
- hacer que `npm run lint` vuelva a correr
- formalizar `typecheck`
- preparar CI para reflejar el estado real del repositorio
