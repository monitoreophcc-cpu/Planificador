# Nexo — Control Operativo

Aplicación web para operación diaria, planificación semanal, reportes y configuración operativa de equipos con turnos `DAY` / `NIGHT`.

## Estado actual

- Stack actual: `Next.js 16` + `React 19` + `TypeScript` + `Zustand`
- Autenticación: `Supabase Auth`
- Persistencia local: almacenamiento del navegador + respaldos locales
- Sincronización en nube: `Supabase` con estrategia híbrida local-first
- UI: App Router, Radix UI, Framer Motion, Chart.js y Recharts
- Testing: `Jest`

## Qué hace la app

Nexo está pensada para un flujo operativo real, no para “optimizar” automáticamente ni para inventar decisiones.

La app se organiza en 4 áreas principales:

### 1. Registro Diario

- Registro de incidencias del día
- Seguimiento de ausencias, licencias, vacaciones, tardanzas, errores y otros eventos
- Lectura rápida del estado operativo antes de registrar
- Cálculo de impacto sobre cobertura y visualización de incidencias activas

### 2. Planificación

- Grilla semanal de representantes
- Reglas de cobertura por alcance
- Feriados, horarios especiales y excepciones
- Cambios de turno, swaps y ajustes manuales
- Respeto de reglas de vacaciones y licencias sobre días hábiles

### 3. Reportes

- Resumen mensual
- Reporte de incidencias y puntos
- Reporte operativo / comparativo
- Lectura ejecutiva para revisar tensión operativa, riesgo y desempeño

### 4. Configuración

- Gestión de representantes
- Calendario maestro de feriados
- Reglas y parámetros del sistema
- Salud de sincronización
- Respaldos, auditoría e historial

## Sincronización y persistencia

El proyecto ya no es solo local. Hoy trabaja con un modelo híbrido:

- El estado operativo principal se guarda en el navegador para respuesta rápida
- Si el usuario inicia sesión, la app sincroniza con Supabase
- Cuando el navegador vuelve a estar online, la cola pendiente intenta vaciarse
- La app refresca el estado remoto al recuperar foco, al volver a una pestaña visible y en intervalos periódicos
- La hidratación inicial evita sobrescribir nube con snapshots locales viejos

Actualmente la sincronización cloud cubre:

- `representatives`
- `weekly_plans`
- `incidents`
- `swaps`
- `coverage_rules`

Nota importante:

- Las coberturas manuales del `useCoverageStore` siguen siendo locales por navegador en esta etapa

## Principios de producto

- No corrige decisiones humanas automáticamente
- No infiere datos faltantes
- No oculta inconsistencias del mundo real
- Sí deja rastro, contexto y lectura operativa para decidir mejor

## Arquitectura

La base del proyecto sigue una separación por capas:

```text
src/
├── app/            # Entradas Next.js App Router
├── application/    # Adaptadores, presentadores y casos de uso
├── domain/         # Lógica de negocio y reglas deterministas
├── hooks/          # Hooks de React
├── lib/            # Integraciones y helpers compartidos
├── persistence/    # Persistencia local, sync y serialización
├── store/          # Zustand slices, sync y estado global
└── ui/             # Shell, vistas y componentes visuales
```

Puntos relevantes del estado actual:

- `src/store/useAppStore.ts`: store principal
- `src/store/appStoreCloudSync.ts`: bootstrap y watcher de sincronización cloud
- `src/persistence/supabase-sync.ts`: lectura y escritura con Supabase
- `src/ui/logs/`: experiencia de registro diario
- `src/ui/planning/`: planner semanal
- `src/ui/stats/`: reportes y vistas ejecutivas
- `src/ui/settings/`: configuración, ayuda y recuperación

## Stack

| Área | Tecnología |
| --- | --- |
| Framework | Next.js 16.2.x |
| UI | React 19 |
| Lenguaje | TypeScript 5 |
| Estado | Zustand + Immer |
| Auth / Cloud | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Animación | Framer Motion |
| Componentes base | Radix UI |
| Charts | Chart.js, react-chartjs-2, Recharts |
| Persistencia local | `idb`, localStorage, backup local |
| Testing | Jest + jsdom |

## Requisitos

- `Node.js 20+`
- `npm`
- Proyecto de Supabase con Auth habilitado

## Variables de entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Compatibilidad:

- También acepta `NEXT_PUBLIC_SUPABASE_ANON_KEY` como fallback del publishable key

## Desarrollo

```bash
npm install
npm run dev
```

La app abre en:

- `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
npm test
```

## Calidad y validación

La base incluye pruebas de:

- dominio
- integración
- regresión
- stores
- UI crítica
- sincronización cloud

Antes de cerrar cambios grandes, normalmente conviene correr:

```bash
npm test
npm run build
```

## PWA

La app está preparada como PWA:

- `manifest.json`
- `service worker`
- caché de shell
- instalación en navegador compatible

Si cambias branding o recursos instalables, puede ser necesario reinstalar la PWA para ver el nombre actualizado de inmediato.

## Documentación útil

En `docs/` hay documentación histórica y técnica relevante:

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [LIMITACIONES_SISTEMA.md](./docs/LIMITACIONES_SISTEMA.md)
- [HOLIDAYS_AND_VACATIONS.md](./docs/HOLIDAYS_AND_VACATIONS.md)
- [PRUEBAS_HOSTILES.md](./docs/PRUEBAS_HOSTILES.md)
- [MANUAL_DE_USUARIO.md](./docs/MANUAL_DE_USUARIO.md)
- [RELEASE_NOTES.md](./docs/RELEASE_NOTES.md)

## Resumen corto

Nexo es un sistema operativo interno para registrar lo que pasó, planificar lo que debe pasar y leer cómo viene la operación, con persistencia local, autenticación por Supabase y sincronización híbrida entre dispositivos.
