# Fase 5 - Compuertas de Calidad

Fecha de cierre técnico: 2026-04-07  
Rama de trabajo: `codex-saneamiento-fase-0`

## Objetivo

La Fase 5 busca que el repositorio deje de degradarse en silencio.

Su objetivo fue:

- eliminar bypasses de build
- hacer obligatorias las compuertas de calidad en CI
- dejar el repositorio listo para bloquear merges cuando fallen esas compuertas

## Estado en el repositorio

### Build sin bypasses

Resultado:

- `ignoreBuildErrors` ya no está presente
- `ignoreDuringBuilds` ya no está presente
- `next build` valida de verdad lint y tipos

Archivo relevante:

- `next.config.js`

### CI alineada con el estado real

Resultado:

La CI del repositorio ejecuta:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

Archivo relevante:

- `.github/workflows/ci.yml`

### Estado técnico verificado

Al cierre de esta fase:

- `npm run lint`: pasa
- `npm test`: pasa
- `npm run build`: pasa
- `npm run typecheck`: pasa

## Lo que sí quedó cerrado

Del lado del código y del repositorio, la Fase 5 quedó resuelta.

Eso significa que:

- el build ya no oculta errores
- la CI ya representa el contrato mínimo de calidad
- cualquier regresión importante ahora aparece de forma visible

## Lo que depende de GitHub

Hay un punto que no vive en el repositorio y depende de configuración remota:

- protección de rama en `main`
- checks requeridos para bloquear merges

Ese punto no se puede garantizar solo con archivos del repo.

## Criterio de lectura

La Fase 5 puede leerse así:

- cerrada desde el punto de vista técnico del repositorio
- pendiente de validación/configuración remota en GitHub si se quiere sellar el bloqueo de merges

## Conclusión

La degradación silenciosa del repositorio ya quedó resuelta en código.

Lo único que queda para blindar completamente esta fase es aplicar o confirmar en GitHub:

1. branch protection sobre `main`
2. required status checks sobre el workflow `CI`
