# Fase 6 - Deuda Restante sin Incendio

Fecha de cierre práctico: 2026-04-07  
Rama de trabajo: `codex-saneamiento-fase-0`

## Objetivo

La Fase 6 toma lo que quedaba del plan original una vez apagado el incendio:

- consolidar persistencia
- endurecer autosave y bootstrap
- eliminar residuos sueltos
- bajar la carga inicial
- dejar documentación actualizada

## Estado de los puntos del plan original

### 1. Persistencia duplicada

Resultado:

- la carpeta legacy `persistence/` fuera de `src` ya no forma parte del sistema activo
- la persistencia canónica quedó en `src/persistence/storage.ts`

Estado:

- resuelto

### 2. Autosave y suscripción

Resultado:

- `src/app/page.tsx` ya no deja la app colgada si falla bootstrap
- el autosave tiene cleanup real
- la persistencia y el backup quedaron desacoplados del primer render

Estado:

- resuelto

### 3. Residuos de archivos rotos

Resultado:

- `src/ui/planning/SwapModal.tsx.broken` ya no existe

Estado:

- resuelto

### 4. Documentación

Resultado:

- se documentaron Fases 0 a 5
- se creó un resumen operativo del saneamiento
- esta fase deja documentado también el cierre práctico del trabajo restante

Estado:

- resuelto

## Performance y bundle

Durante esta fase se hizo una pasada específica de performance:

- el shell principal quedó desacoplado de cargas no críticas
- el bloque `session + sync + header` dejó de entrar completo en el arranque
- la sesión del header pasó a `dynamic()`
- la capa cloud del store raíz dejó de importarse en frío
- `/login` dejó de cargar Supabase y navegación cliente en el primer render

Archivos relevantes:

- `src/ui/AppShellHeader.tsx`
- `src/store/useAppStore.ts`
- `src/app/login/page.tsx`
- `src/app/login/LoginButton.tsx`

## Resultado medido

Estado anterior al cierre práctico de Fase 6:

- `/` = `21.4 kB`
- `First Load JS` = `171 kB`
- `/login` = `62.3 kB`

Estado actual:

- `/` = `6.38 kB`
- `First Load JS` = `95.2 kB`
- `/login` = `683 B`

Lectura práctica:

- la ruta principal volvió a un rango sano
- el login dejó de arrastrar dependencias pesadas antes del clic
- el shared bundle sigue estando dominado por el runtime base de Next/React

## Verificación al cierre

- `npm run lint`: pasa
- `npm test`: pasa
- `npm run build`: pasa
- `npm run typecheck`: pasa

## Qué queda fuera de esta fase

Lo pendiente ya no es deuda estructural urgente:

- validación remota de branch protection en GitHub
- validación operativa completa de OAuth y round-trip con Supabase real
- optimizaciones finas adicionales si se quiere exprimir más el bundle compartido

## Conclusión

La Fase 6 puede darse por cerrada en términos prácticos.

La deuda restante del plan original ya no tiene forma de incendio:

- la persistencia quedó consolidada
- el bootstrap quedó endurecido
- los residuos fueron retirados
- la documentación quedó actualizada
- el bundle volvió a un nivel razonable
