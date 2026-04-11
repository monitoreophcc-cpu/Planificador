# Release Notes - Nexo — Control Operativo v1.0.0

**Fecha:** 2026-01-12  
**Tipo:** Initial Production Release  
**Estado:** PWA Completa

---

## 📋 Resumen

Nexo — Control Operativo es una herramienta de gestión operativa para equipos de representantes, diseñada para registro diario de incidencias, planificación semanal, y análisis ejecutivo de desempeño. Esta versión inicial establece la base sólida de una PWA (Progressive Web App) profesional, instalable, y funcional offline.

---

## ✨ Características Principales

### 🗓️ Planificación Semanal
- Planner visual con estados semánticos claros (WORKING, OFF, VACATION, LICENSE, ABSENT, HOLIDAY)
- Drag & drop para asignaciones de turno
- Wizard guiado para horarios especiales
- Validación de conflictos en tiempo real

### 📝 Registro Diario
- Registro de eventos operativos (ausencias, tardanzas, errores, otros)
- Vista de incidencias del día
- Seguimiento de ausencias en curso
- Jerarquía visual narrativa (contexto → acción → resultado)

### 📊 Estadísticas y Reportes
- **Resumen Mensual:** Vista ejecutiva con KPIs, gráficas y tabla detallada
- **Reporte de Puntos:** Tabla administrativa por rol y turno
- **Reporte Ejecutivo:** Herramienta de decisión (riesgo → reconocimiento → contexto)

### ⚙️ Configuración
- Gestión de representantes con drag & drop
- Configuración de días libres base
- Horarios especiales con wizard guiado
- Auditoría del sistema (próximamente)

---

## 🚀 PWA - Progressive Web App

### Instalación
- Instalable en desktop y móvil
- Modo standalone (sin barra de navegador)
- Icono en pantalla de inicio

### Offline
- **Shell:** Abre siempre, incluso sin conexión
- **Vistas:** Acceso a planificación, estadísticas y configuración offline
- **Datos:** Lectura completa offline, escritura bloqueada honestamente
- **Banner:** "Modo consulta" visible cuando offline

### Performance
- Primera carga < 2s
- Navegación instantánea entre vistas
- Cache inteligente (Shell Cache First, Views Stale-While-Revalidate)

### Actualizaciones
- Updates silenciosos sin interrumpir trabajo
- Nueva versión se activa en próximo reload natural
- Sin banners molestos, sin prompts

---

## 🎨 Diseño y UX

### Jerarquía Visual
- Header con autoridad silenciosa
- Daily Log con ritmo narrativo claro
- Stats con estructura de decisión ejecutiva
- Colores semánticos respetados (verde = trabaja, rojo = problema, gris = off)

### Accesibilidad
- Navegación por teclado completa
- ARIA labels en elementos críticos
- Contraste AA en estados importantes

### Principios
- **Autoridad silenciosa:** No pide atención, la merece cuando algo falla
- **Un color = una verdad:** Verde WORKING, Rojo ABSENT, Gris OFF
- **Honestidad offline:** Sistema no miente sobre capacidades

---

## 🔧 Tecnología

- **Framework:** Next.js 14.2 (App Router, Static Export)
- **State:** Zustand + IndexedDB
- **UI:** React 18, Framer Motion, Lucide Icons
- **Charts:** Chart.js + react-chartjs-2
- **PWA:** Service Worker manual (sin plugins, control total)
- **Cache:** Versionado explícito, estrategias por tipo de ruta

---

## 📦 Instalación

### Requisitos
- Node.js 20+
- npm 10+

### Build
```bash
npm install
npm run build
```

Output estático en `/out` listo para deploy.

### Deploy
Cualquier hosting estático:
- Vercel
- Netlify
- GitHub Pages
- S3 + CloudFront

---

## 🧪 Validación

### Tests Críticos Pasados
- ✅ Cold start < 2s
- ✅ Offline honesto (lee todo, no guarda)
- ✅ Updates silenciosos
- ✅ Jerarquía visual narrativa
- ✅ Lighthouse PWA > 90

### Browsers Soportados
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 🚫 Limitaciones Conocidas

- Icons PWA son placeholders (192x192, 512x512 pendientes)
- Auditoría del sistema deshabilitada (próximamente)
- No hay export PDF (fuera de scope v1.0)
- No hay layout tablet optimizado (fuera de scope v1.0)

---

## 🔮 Roadmap (Post-v1.0)

- **v1.1:** UX offline fino (deshabilitar botones específicos)
- **v1.2:** Export PDF / modo auditoría
- **v1.3:** Layout tablet / multi-dispositivo
- **v2.0:** Sincronización multi-usuario (evaluación)

---

## 📝 Notas Técnicas

### Service Worker
- Versión: `v1.0.0`
- Estrategia: Soft update (no auto-skipWaiting)
- Cache: Shell + Views, Network only para acciones

### Cache Invalidation
Para forzar actualización de cache:
1. Cambiar `SW_VERSION` en `public/sw.js`
2. Rebuild
3. Usuarios actualizan en próximo reload

---

## 👥 Créditos

Sistema diseñado para operaciones reales, no para marketing.

**Filosofía:** Herramienta que desaparece mientras trabajas, aparece cuando algo falla.

---

## 📄 Licencia

Uso interno. Todos los derechos reservados.
