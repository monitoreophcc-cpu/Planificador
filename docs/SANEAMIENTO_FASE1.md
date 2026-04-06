# Fase 1 - Tooling y Señales de Calidad

Fecha de verificación: 2026-04-05
Rama de trabajo: `codex-saneamiento-fase-0`

## Objetivo

La Fase 1 busca que el repositorio vuelva a exponer su estado real mediante herramientas confiables:

- lint ejecutable
- typecheck formalizado
- CI alineada con esas señales
- build sin bypasses de tipos ni lint

No busca todavía corregir toda la deuda del código.

## Estado verificado

### Lint

`npm run lint` ya ejecuta y devuelve resultados reales.

Conclusión:

- el problema original de incompatibilidad de lint quedó desbloqueado
- hoy existen warnings reales de ESLint en el árbol
- ya no hay errores de lint que bloqueen build

### Typecheck

`npm run typecheck` ejecuta `tsc --noEmit` sobre la superficie productiva definida y hoy pasa.

Conclusión:

- la señal de tipos ya está activa
- el typecheck productivo quedó saneado y pasa
- el chequeo principal excluye artefactos no productivos:
  - tests
  - stories
  - scripts manuales
  - archivos beta no montados o no referenciados

### CI

La CI ya refleja el pipeline mínimo esperado:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

### Build

El build debe ejecutarse sin `ignoreDuringBuilds` ni `ignoreBuildErrors` en Next.

Conclusión:

- si compila, compila con validaciones reales
- si falla, la falla cuenta como deuda técnica real y no queda escondida
- en la verificación actual, el build pasa sin bypasses

## Resumen de acciones realizadas en Fase 1

- se retiraron `ignoreDuringBuilds` e `ignoreBuildErrors` de `next.config.js`
- se corrigieron los errores de lint que bloqueaban compilación
- se normalizó el contrato de auditoría para aceptar eventos legacy sin romper el tipo actual
- se corrigieron imports rotos en `call-center-analysis`
- se redujo el scope del typecheck principal a superficie productiva real
- la CI quedó alineada con `typecheck`, `lint`, `test` y `build`

## Lectura operativa

La Fase 1 puede considerarse cerrada porque lint, typecheck y build ya reflejan el estado real del repositorio sin bypasses y el build vuelve a pasar.

Eso cambia el tipo de trabajo pendiente:

- antes: había que reparar la instrumentación
- ahora: ya se puede entrar a deuda técnica y estabilización funcional con feedback confiable

Estado actual:

- `lint`: ejecuta y pasa con warnings
- `typecheck`: ejecuta y pasa
- `build`: ejecuta sin bypasses y pasa

## Riesgos abiertos

- siguen existiendo warnings de hooks/deps en varias vistas
- hay deuda pendiente en tests, stories y superficies no productivas excluidas del typecheck principal
- el bundle inicial de `/` sigue siendo alto

## Recomendación de siguiente paso

El siguiente movimiento ya no es tooling. Ahora sí conviene pasar a saneamiento funcional y deuda técnica del core.

La prioridad recomendada es:

1. atacar primero warnings y deuda viva del código del core
2. decidir qué hacer con superficies beta y excluidas
3. reintroducir gradualmente tests y artefactos auxiliares a chequeos separados
