# Plan: comparación entre días y períodos

## Estado actual (implementado)
- ✅ MVP inicial implementado: comparación de KPIs globales entre dos días.
- ✅ Soporta modo `Día completo`, `Por turno` y `Rango horario`.
- ✅ Soporta período completo por **semana** y **mes** tomando fechas base/objetivo.
- ✅ Incluye panel UI con selección de días y visualización de deltas absolutos y porcentuales.
- ✅ Incluye tabla comparativa por bloques de 30 minutos (contestadas y conversión).
- ✅ Incluye panel UI con selección de días y visualización de deltas absolutos y porcentuales.

## Objetivo
Permitir comparar KPIs entre:
1. **Días específicos** (ej. hoy vs ayer, lunes vs lunes anterior).
2. **Períodos de tiempo** (ej. 09:00-12:00 de distintos días).

## Fase 1 — Modelo de datos
- Definir un tipo `ComparisonConfig` con:
  - `baseDate`, `targetDate`
  - `periodMode`: `full_day | custom_range | shift`
  - `startTime`, `endTime` (cuando aplique)
  - `shift` (`Día | Noche`)
- Crear función de normalización para alinear ventanas de tiempo entre días.

## Fase 2 — Servicio de comparación
- Crear `comparison.service.ts` con funciones:
  - `compareGlobalKpis(config, dataset)`
  - `compareShiftKpis(config, dataset)`
  - `compareTimeSlots(config, dataset)`
- Calcular para cada métrica:
  - valor base
  - valor objetivo
  - delta absoluto
  - delta porcentual
  - dirección (`up`, `down`, `equal`)

## Fase 3 — Integración con store
- Agregar estado:
  - `comparisonConfig`
  - `comparisonResult`
  - `isComparisonEnabled`
- Crear acciones:
  - `setComparisonConfig`
  - `runComparison`
  - `clearComparison`
- Persistir solo la configuración (no necesariamente el resultado derivado).

## Fase 4 — UI de comparación
- Añadir panel con:
  - selector de día base y día objetivo
  - selector de período (día completo, turno, rango personalizado)
  - botón “Comparar”
- Mostrar tarjetas con deltas de KPIs y colores semáforo.
- Incorporar vista tabular por períodos de 30 min para detectar picos.

## Fase 5 — Validaciones y UX
- Validar que ambos días tengan datos para el período elegido.
- Mostrar estados vacíos y mensajes accionables.
- Agregar exportación de comparación (CSV/XLSX/PDF).

## Fase 6 — Pruebas
- Unit tests para `comparison.service.ts` con casos:
  - incremento, decremento y sin cambios
  - divisiones por cero
  - rangos sin datos
- Pruebas de integración de store + UI para flujo completo.

## Entregable incremental sugerido
1. **MVP:** comparar día completo (global KPIs).
2. **v2:** comparar por turno.
3. **v3:** comparar por rango horario y exportar reporte.
