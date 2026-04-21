# ANALISIS DE LLAMADAS - LIMITACIONES OPERATIVAS

Última actualización: 2026-04-18

---

## Hallazgo confirmado

En la revisión del 18 de abril de 2026 se comparó el archivo operativo `[EXPORT_TRS.XLS](./EXPORT_TRS.XLS)` contra `[TRANSACCIONES POS Q1 2026.XLS](./TRANSACCIONES%20POS%20Q1%202026.XLS)`.

Conclusión:

- `EXPORT_TRS.XLS` llegó al límite histórico del formato `.xls`: `65,535` filas totales.
- Eso equivale a `65,534` registros de datos más encabezado.
- El archivo sí cubre del `2026-01-01` al `2026-03-31`, pero no alcanza a contener todas las transacciones del trimestre.
- Por eso un trimestre completo en un solo `.xls` puede venir truncado aunque el rango de fechas parezca correcto.

## Discrepancias observadas en Q1 2026

Comparación entre total POS y total de filas en `EXPORT_TRS`:

- Enero 2026: POS `27,416` vs `EXPORT_TRS` `22,909`
- Febrero 2026: POS `24,801` vs `EXPORT_TRS` `20,354`
- Marzo 2026: POS `27,455` vs `EXPORT_TRS` `22,271`

Esto confirma que la discrepancia mensual no es solamente un problema de visualización o de parser. También existe una limitación real en el archivo fuente cuando se intenta exportar demasiado volumen en `.xls`.

## Criterio operativo actual

- El análisis de llamadas debe cargarse por mes, no por trimestre, cuando la fuente venga en `.xls`.
- Siempre que sea posible, conviene exportar en `.xlsx` o `.csv`.
- El tablero sirve como seguimiento operativo diario y mensual.
- El cierre contable/comercial definitivo debe seguir contrastándose con el POS cuando el período o la fuente lo requieran.

## Qué significa esto para el uso diario

- Las cifras del análisis pueden diferir del POS al cierre de mes.
- Esa diferencia puede venir de dos causas al mismo tiempo:
  1. el archivo `EXPORT_TRS` puede venir truncado por límite de filas
  2. POS y `EXPORT_TRS` no siempre representan exactamente el mismo universo operativo

## Decisión de producto vigente

- La conciliación automática contra POS queda como deuda pendiente.
- La recomendación oficial de operación es: cargar histórico mes por mes y no usar un `.xls` trimestral como fuente única de cierre.

## Cierre operativo dentro de la app

Desde la fase de snapshots mensuales, los Excel se tratan como materia prima de importación y no como datos vivos sincronizables.

- La PC que carga los archivos conserva las filas crudas en IndexedDB para trabajo local y drilldown inmediato.
- El cierre mensual sincronizable se guarda como snapshot procesado en Supabase: KPIs, turnos, detalle por hora, acumulados, representantes, plataformas y sucursales.
- Otra PC con la misma sesión de Google puede consultar esos resultados mensuales sin volver a cargar los Excel originales.
- Si más adelante gerencia exige auditoría de archivos fuente, Supabase Storage queda como una fase separada para respaldo de archivos pesados, no como base principal del dashboard.

Este criterio reduce memoria, evita subir raw arrays gigantes y deja explícito que el cierre operativo de la app puede seguir discrepando del POS hasta que exista una conciliación formal.
