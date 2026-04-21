# Supabase - despliegue de snapshots mensuales

Última actualización: 2026-04-21

Este documento deja el procedimiento seguro para activar en Supabase la sincronización de snapshots mensuales procesados del análisis de llamadas.

## Estado local

- La app ya construye snapshots mensuales compactos desde los archivos importados localmente.
- Los raw Excel quedan como materia prima local en IndexedDB.
- La migración pendiente es `supabase/migrations/20260421123000_create_call_center_monthly_snapshots.sql`.
- El MCP de Supabase puede aparecer autenticado en Codex, pero esta conversación no expuso herramientas MCP para ejecutar SQL.
- La Supabase CLI necesita login propio; el OAuth del MCP no sustituye `supabase login`.

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
