# Proceso manual de vinculación de representantes (Reporte de llamadas)

Este documento describe cómo completar manualmente el vínculo entre nombres del reporte de transacciones y representantes del sistema.

## Cuándo usarlo

Úsalo cuando en la tabla de **Representantes del día** aparezca la etiqueta **"Sin vínculo"**.

## Flujo visual (nuevo)

1. Abre la pestaña **Operación** → bloque **Rendimiento comercial** → **Representantes del día**.
2. En cada fila **Sin vínculo**, pulsa el botón **Vincular**.
3. Selecciona un representante activo en el modal y confirma con **Guardar vínculo**.
4. La fila cambiará a **Vinculado (manual)** y el contador `x/y vinculados` se actualizará.

> Este vínculo visual funciona en la sesión actual (no persiste todavía en base de datos).

## Archivo de configuración manual (persistencia por código)

Editar:

`src/ui/reports/analysis-beta/config/manualRepresentativeLinks.ts`

## Paso a paso por código

1. Identifica los agentes con etiqueta **Sin vínculo**.
2. Abre el archivo `manualRepresentativeLinks.ts`.
3. Agrega entradas con este formato:

```ts
export const MANUAL_REPRESENTATIVE_LINKS = [
  { agentName: 'M. Peña', representativeName: 'Maria Pena' },
];
```

4. Guarda el archivo y recarga la vista.
5. Verifica que la fila cambie a **Vinculado (manual)** y que suba el indicador `x/y vinculados`.

## Reglas importantes

- `agentName`: debe ser exactamente como llega desde transacciones.
- `representativeName`: debe coincidir con el nombre del representante activo en el sistema.
- Si el representante está inactivo, la vinculación manual no se aplicará.

## Nota técnica

La lógica de vínculo manual se evalúa antes del vínculo automático normalizado.
