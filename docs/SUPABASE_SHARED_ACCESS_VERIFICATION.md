# Verificación de Shared Access en Supabase

Esta checklist existe para decidir si la migración de rollback `20260416190000_restore_google_only_access.sql` debe ejecutarse en un entorno real.

## Qué revisar por entorno

1. Historial de migraciones aplicado.
2. Existencia de la tabla `public.app_access_roles`.
3. Políticas RLS con sufijos o nombres tipo `shared` / `owner`.
4. Que el runtime ya no dependa de `app_access_roles` después del saneamiento.

## SQL de verificación

```sql
select
  to_regclass('public.app_access_roles') as app_access_roles_table;

select schemaname, tablename, policyname
from pg_policies
where schemaname = 'public'
  and (
    policyname ilike '%shared%'
    or policyname ilike '%owner%'
    or policyname ilike '%reader%'
  )
order by tablename, policyname;

select version, name
from supabase_migrations.schema_migrations
where version in (
  '20260416173000',
  '20260416190000'
)
order by version;
```

## Regla de decisión

1. Si no existe `app_access_roles` y tampoco aparecen políticas `shared`/`owner`, no ejecutes el rollback en ese entorno.
2. Si existe evidencia de la migración `20260416173000_add_shared_access_roles.sql`, aplica primero el rollback en dev o staging.
3. No tocar producción hasta validar el flujo completo en un entorno no productivo.

## Validación manual después del rollback

1. Login con Google.
2. Carga inicial desde Supabase.
3. Escritura y lectura de sync.
4. Refresco remoto.
5. Cola offline pendiente y recuperación online.
6. Confirmar que no hay errores por dependencias a `app_access_roles`.
