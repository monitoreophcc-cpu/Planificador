# Supabase - despliegue de snapshots mensuales

Última actualización: 2026-04-21

Este documento deja el procedimiento seguro para activar en Supabase la sincronización de snapshots mensuales procesados del análisis de llamadas.

## Estado local

- La app ya construye snapshots mensuales compactos desde los archivos importados localmente.
- Los raw Excel quedan como materia prima local en IndexedDB.
- La migración de referencia es `supabase/migrations/20260421123000_create_call_center_monthly_snapshots.sql`.
- El MCP de Supabase puede aparecer autenticado en Codex, pero esta conversación no expuso herramientas MCP para ejecutar SQL.
- La Supabase CLI necesita login propio; el OAuth del MCP no sustituye `supabase login`.

## Estado remoto verificado

Verificación del 21 de abril de 2026:

- `npx supabase link --project-ref oxtifrkcypgjiyhgyajo --yes` completó correctamente.
- `npx supabase db push --dry-run --linked` respondió `Remote database is up to date`.
- `npx supabase db push --linked` respondió `Remote database is up to date`.
- La API REST del proyecto respondió `200 []` al consultar `public.call_center_monthly_snapshots`.
- La consulta REST con columnas esperadas también respondió `200 []`, confirmando que existen:
  `user_id`, `month_key`, `month_label`, `snapshot_version`, `source_hash`, `source_manifest`, `loaded_dates`, `coverage`, `kpis`, `shift_kpis`, `operational_detail`, `daily_cumulative`, `representatives`, `platforms`, `branches`, `updated_at`, `synced_at`.
- Una prueba de inserción anónima con la publishable key respondió `401` con `new row violates row-level security policy`, confirmando que RLS bloquea escrituras sin usuario autenticado.
- El asesor de seguridad remoto (`npx supabase db advisors --linked --type security --level warn`) no reportó hallazgos sobre la tabla de snapshots; solo reportó el warning general `auth_leaked_password_protection`.
- En el runtime de la app, `call_center_daily_sources` quedó aislado en `report-source-cloud.service.ts`; el hook activo de sync ya usa snapshots mensuales y no sincroniza raw arrays como flujo normal.

Pendiente para auditoría completa:

- `npx supabase migration list --linked` todavía requiere contraseña de DB o `SUPABASE_DB_PASSWORD` para listar historial vía Postgres pooler.
- Verificar RLS/policies desde SQL Editor, MCP con permisos suficientes o CLI con contraseña de DB.
- El asesor de performance remoto y `db query --linked` se quedaron esperando conexión al pooler en esta sesión; repetirlos cuando esté disponible `SUPABASE_DB_PASSWORD`.

## Regla de seguridad

No aplicar migraciones con `--include-all`.

Antes de tocar remoto, verificar qué intentaría aplicar el CLI. Si el dry-run lista migraciones antiguas inesperadas, especialmente de shared access, detenerse y revisar historial.

## Comandos esperados

```powershell
npx supabase login
npx supabase link --project-ref oxtifrkcypgjiyhgyajo
npx supabase db push --dry-run --linked
```

El dry-run debe mostrar únicamente la migración nueva de snapshots mensuales o un conjunto ya revisado explícitamente.

## Diagnóstico de login CLI

Si `npx supabase link` devuelve `Access token not provided`, la sesión actual de la CLI no está autenticada aunque el MCP aparezca como OAuth.

En Windows, la CLI debe crear un perfil local en:

```text
C:\Users\Junior\.supabase\profile
```

En la sesión del 21 de abril de 2026 solo existía:

```text
C:\Users\Junior\.supabase\telemetry.json
```

Eso significa que el login no quedó disponible para `npx supabase` en este usuario/shell. Para corregirlo, ejecutar en una terminal normal:

```powershell
npx supabase login
npx supabase projects list
```

Si la terminal no permite flujo interactivo, generar un access token en Supabase Dashboard y usarlo localmente, sin pegarlo en chats ni commits:

```powershell
npx supabase login --token "<SUPABASE_ACCESS_TOKEN>"
npx supabase projects list
```

Después de eso, volver a ejecutar el enlace y el dry-run desde este repo.

Si el dry-run es seguro:

```powershell
npx supabase db push --linked
```

## Verificación SQL posterior

Ejecutar en Supabase SQL Editor, MCP `execute_sql`, o CLI si está autenticada:

```sql
select
  to_regclass('public.call_center_monthly_snapshots') as table_name;

select
  c.column_name,
  c.data_type,
  c.is_nullable
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = 'call_center_monthly_snapshots'
order by c.ordinal_position;

select
  relrowsecurity as rls_enabled
from pg_class
where oid = 'public.call_center_monthly_snapshots'::regclass;

select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'call_center_monthly_snapshots'
order by policyname;

select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'call_center_monthly_snapshots'
  and grantee = 'authenticated'
order by privilege_type;
```

## Validación funcional

Después de aplicar la migración:

- Iniciar sesión con Google.
- Cargar un mes de archivos del análisis de llamadas.
- Esperar sync sin errores de tabla faltante.
- Cerrar sesión o abrir otro navegador/PC con la misma cuenta.
- Verificar que el mes aparece sin volver a cargar Excel.
- Confirmar KPIs, acumulados, representantes, plataformas y sucursales.
- Cargar otro mes y verificar que ambos meses siguen disponibles.

## Criterio de rollback

Si la tabla se crea pero el runtime falla, no borrar datos manualmente de entrada. Primero revisar:

- Errores en consola relacionados con `call_center_monthly_snapshots`.
- Políticas RLS y `auth.uid()`.
- Que la sesión Google exista y el `user_id` enviado coincida con `auth.uid()`.
- Que el cliente esté usando la misma URL/proyecto Supabase que recibió la migración.

Si se decide revertir antes de datos productivos reales:

```sql
drop table if exists public.call_center_monthly_snapshots;
```

No usar este rollback si ya existen snapshots que deban conservarse.
