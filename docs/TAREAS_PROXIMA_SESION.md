# Tareas para la próxima sesión

## ¿Qué parte es viable en este momento?

### Viable de inmediato (bajo esfuerzo / impacto rápido)
- Renombrar la pestaña **"Análisis"** por **"Gráficas"**.
- Quitar **"PIZZA HUT"** del header del reporte.
- Renombrar el reporte de **"Call center Beta"** a **"Análisis de llamadas"**.
- Definir una jerarquización inicial de contenido por pestaña (orden de KPIs, tablas y gráficas sin cambiar lógica de datos).

### Viable en una siguiente iteración corta
- Crear sub-pestañas en **Operación** para reducir scroll (requiere ajuste de navegación/estado UI).
- Incorporar lectura mensual reutilizando componentes/servicios existentes de reporte mensual.
- Mostrar desempeño por representante con métricas ya disponibles en el reporte actual.

### Viable con dependencias previas (esfuerzo medio/alto)
- Enlazar nombres de representantes del reporte con los registrados en el sistema para seguimiento integral de:
  - incidencias,
  - transacciones,
  - ventas,
  - ticket promedio.
- Ajustar ventas para descontar impuestos por representante y obtener ticket promedio real (requiere definir regla fiscal/porcentaje y fuente de verdad).

## Pendientes originales

### Pendientes principales
- Terminar la interfaz del reporte beta.
- Establecer una jerarquización de la información mostrada en cada pestaña o apartado.

### Operación
- Crear sub-pestañas para reducir el exceso de scroll.
- Incorporar lectura mensual.
- Mostrar desempeño por representante.

### Integración y métricas por representante
- Enlazar nombres de los representantes del reporte con los registrados en el sistema para trackear su rendimiento general en:
  - incidencias,
  - transacciones,
  - ventas,
  - ticket promedio.

### Ajustes de cálculo
- Ajustar las ventas: a las sumas que muestra el reporte se les debe descontar impuestos por representante para calcular el ticket promedio real.

### Cambios de naming/UI
- Renombrar la pestaña **"Análisis"** por **"Gráficas"**.
- Quitar **"PIZZA HUT"** del header del reporte.
- Renombrar el reporte de **"Call center Beta"** a **"Análisis de llamadas"**.
