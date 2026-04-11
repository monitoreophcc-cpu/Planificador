# Guía para Agentes de IA sobre el Proyecto "Monitoreo Call Center"

## 1. Resumen del Proyecto

Este es un dashboard interactivo construido con Next.js y React para analizar el rendimiento de un call center. La aplicación permite a los usuarios cargar archivos de datos (CSV, XLS, XLSX) y visualiza KPIs, desgloses por turno y análisis gráficos. El objetivo principal es replicar y modernizar la funcionalidad de un dashboard HTML estático previo.

## 2. Arquitectura y Stack Tecnológico

- **Framework:** Next.js 14 con App Router.
- **Lenguaje:** TypeScript.
- **UI:** React, ShadCN UI, Tailwind CSS.
- **Gestión de Estado:** Zustand (`src/store/dashboard.store.ts`).
- **Gráficos:** `chart.js` con `react-chartjs-2`.
- **Análisis de Archivos:** `papaparse` para CSV y `xlsx` para Excel.
- **Notificaciones:** `react-hot-toast` a través del hook `useToast`.

---

## 3. **La Regla de Oro: Flujo de Datos Reactivo**

**NUNCA manipules el estado local de los componentes (`useState`) para almacenar datos globales o realizar cálculos.** El proyecto sigue un patrón de estado centralizado muy estricto.

El flujo de datos es unidireccional y reactivo:

1.  **Entrada de Datos (`FileLoadButtons.tsx`):** El usuario carga un archivo.
2.  **Servicio de Parseo (`parser.service.ts`):** El archivo se procesa, se limpia y se estructura en los tipos definidos en `src/types`. Se valida la consistencia de las fechas.
3.  **Almacén Global (`dashboard.store.ts`):** Los datos procesados (crudos y limpios) se guardan en el store de Zustand. **Este es el ÚNICO lugar donde reside el estado de los datos de la aplicación.**
4.  **Observador de KPIs (`KPIObserver.tsx`):** Este componente se suscribe a los cambios en el store. Cuando los datos cambian, invoca a los servicios de cálculo (`kpi.service.ts`, `chart.service.ts`).
5.  **Actualización del Store:** Los resultados de los cálculos (KPIs globales, KPIs por turno) se guardan de nuevo en el store de Zustand.
6.  **Renderizado en la UI:** Los componentes de la UI (gráficos, tarjetas, tablas) están suscritos al store de Zustand y se actualizan automáticamente cuando los KPIs o los datos cambian.

**Tu tarea como IA es modificar la lógica de negocio dentro de los servicios (`/services/*.ts`) y, si es necesario, ampliar el store (`/store/dashboard.store.ts`). La UI reaccionará sola.**

---

## 4. Estructura de Archivos Clave

-   `src/app/page.tsx`: Punto de entrada principal que ensambla todos los componentes del dashboard.
-   `src/store/dashboard.store.ts`: **El cerebro de la aplicación.** Contiene el estado global gestionado por Zustand. Si necesitas un nuevo dato disponible globalmente, añádelo aquí.
-   `src/services/`: Contiene toda la lógica de negocio. **La mayor parte de tu trabajo se realizará aquí.**
    -   `parser.service.ts`: Lógica para leer, validar y transformar los datos de los archivos cargados.
    -   `kpi.service.ts`: Lógica para calcular todos los KPIs numéricos (globales, por turno, por franja horaria).
    -   `chart.service.ts`: Lógica para preparar y agregar los datos específicamente para cada gráfico.
    -   `export.service.ts`: Lógica para generar los reportes en CSV y Excel.
-   `src/components/`: Contiene los componentes de React.
    -   `header/`: Componentes del encabezado (botones de carga, etc.).
    -   `kpis/`, `shifts/`, `tables/`, `charts/`: Componentes que visualizan los datos. Estos leen el estado del `dashboard.store`. **No deben contener lógica de negocio.**
    -   `ui/`: Componentes de bajo nivel de ShadCN. No los modifiques directamente; en su lugar, personaliza el tema en `globals.css`.
-   `src/types/dashboard.types.ts`: Define todas las interfaces de datos (e.j., `AnsweredCall`, `Transaction`, `ShiftKPIs`).
-   `src/lib/demo-data.ts`: Datos de ejemplo para el modo "Demo".

## 5. Directrices de Estilo y UI

-   **Colores:** La paleta de colores se gestiona a través de variables CSS en `src/app/globals.css`. Utiliza las variables del tema (`primary`, `secondary`, `destructive`, `accent`) siempre que sea posible.
-   **Gráficos:** Los colores de los gráficos se han fijado directamente en los componentes (`src/components/charts/*.tsx`) con valores hexadecimales (`#000000`, `#dc2626`, `#6b7280`) para asegurar la consistencia. No uses variables de tema aquí.
-   **Componentes:** Prefiere siempre usar o componer componentes de ShadCN UI (`/components/ui`) antes de crear HTML personalizado.

## 6. Cómo Abordar Cambios

-   **Para un nuevo cálculo o KPI:**
    1.  Añade la función de cálculo en el servicio apropiado (ej. `kpi.service.ts`).
    2.  Añade el nuevo estado al `dashboard.store.ts` y una acción para actualizarlo.
    3.  Llama a tu nueva función de servicio desde `KPIObserver.tsx` y actualiza el store.
    4.  Crea o modifica un componente en `src/components/` para mostrar el nuevo dato, leyéndolo desde el store.

-   **Para un cambio visual:**
    1.  Modifica los componentes de React directamente en `src/components/`.
    2.  Si es un cambio de estilo global, ajusta `src/app/globals.css`.

-   **Para modificar la lógica de un gráfico:**
    1.  Ve a `src/services/chart.service.ts` y ajusta la función que prepara los datos para ese gráfico.
    2.  El componente del gráfico en `src/components/charts/` debería actualizarse automáticamente.

Siguiendo estas directrices, asegurarás que el proyecto se mantenga robusto, mantenible y libre de efectos secundarios inesperados.