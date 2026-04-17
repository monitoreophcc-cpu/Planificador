# Coverage Integration Guide

Referencia archivada fuera de `src` para no dejar código placeholder dentro del runtime.

Puntos que preserva esta guía:

1. Inyectar coberturas activas al llamar `buildWeeklySchedule(...)`.
2. Renderizar el badge desde `dayResolution.computed.display.badge`.
3. Resolver `coverageId` con `findCoverageForDay(...)` cuando el badge sea `CUBIERTO` o `CUBRIENDO`.
4. Abrir `CoverageDetailModal` en modo `VIEW` para badges operativos.
5. Abrir `CoverageDetailModal` en modo `CREATE` desde la acción de nueva cobertura.

Checklist operativa:

1. Verificar que planner y daily log consumen la misma fuente de coberturas activas.
2. Confirmar que `AUSENCIA` no pisa el badge correcto cuando existe cobertura relacionada.
3. Confirmar que crear/cancelar una cobertura actualiza el badge sin dejar residuos visuales.
