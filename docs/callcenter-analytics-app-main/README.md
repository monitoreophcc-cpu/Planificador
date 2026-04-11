# Monitoreo Call Center v1.0.1

**Solución analítica elegante y profesional para el monitoreo integral de KPIs de call center y rendimiento transaccional, diseñada para optimizar la toma de decisiones estratégicas mediante una interfaz moderna y reactiva.**

Este proyecto es una aplicación web interactiva construida con Next.js y ShadCN UI para el monitoreo y análisis de métricas de un call center. La aplicación replica y moderniza la funcionalidad de un dashboard HTML anterior, proporcionando una interfaz rica para la visualización de datos de llamadas contestadas, abandonadas y transacciones de ventas.

## Características Principales

- **Gestión de Datos:** Carga dinámica de archivos CSV, XLS o XLSX con validación de fechas para asegurar la consistencia del reporte.
- **KPIs Globales:** Visualización instantánea de Recibidas, Contestadas, Abandonadas, % de Atención y % de Conversión.
- **Análisis por Turno:** Desglose detallado para los turnos de Día (09:00-15:30) y Noche (16:00-23:30) en intervalos de 30 minutos.
- **Auditoría de Transacciones:** Herramienta integrada para validar estatus, plataformas y canales reales de ventas (DOP).
- **Exportación:** Generación de reportes completos en formatos CSV y Excel organizados por secciones.
- **Diseño Corporativo:** Interfaz sutil y elegante utilizando la paleta de colores de la empresa (Rojo, Negro y Gris).

## Cómo Empezar

1. Inicie la aplicación.
2. Cargue los archivos correspondientes: **Contestadas**, **Abandonadas** y **Transacciones**.
3. Use el botón **"Demo"** para explorar la funcionalidad con datos de ejemplo preconfigurados.
4. Navegue entre las pestañas **"Vista Principal"** para tablas y KPIs, y **"Análisis Gráfico"** para tendencias visuales.
5. Utilice el icono de la lupa para acceder a la **Auditoría de Transacciones**.

## Arquitectura

- **Framework:** Next.js 15 (App Router)
- **Estado:** Zustand (Flujo reactivo y centralizado)
- **UI:** Tailwind CSS, ShadCN UI, Lucide Icons
- **Gráficos:** Chart.js con React-Chartjs-2
