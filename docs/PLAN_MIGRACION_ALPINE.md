# Plan de actualización tecnológica con Alpine.js

## Objetivo y alcance

Actualizar los dos casos de uso implementados sin rediseñar la interfaz ni cambiar Google Apps Script:

- **CU-002: Generar Actividad de Seguimiento**, módulo Tareas.
- **CU-005: Generar reporte de seguimiento de investigación**, módulo Reportes, con consultas por investigador y por carrera/línea.

La evaluación exige navegación con Alpine, estados reactivos durante llamadas al servidor y poblamiento de respuestas mediante Alpine, incluyendo `x-for` en al menos una funcionalidad de cada CU. La navegación es solo el primer avance; no completa esos tres requisitos.

## Etapas

### 1. Revisión y preparación

- [x] Confirmar los casos de uso contra `GCC_Empiria_CU-002.md` y `GCC_Empiria_CU-005.md`.
- [x] Crear la rama `feat/alpine-casos-uso` desde `main`.
- [x] Identificar las funciones que modifican la navegación y sus llamadas desde los flujos alternativos.
- [x] Definir un único estado compartido para navegación, conservando funciones puente temporales.

### 2. Navegación con Alpine

- [x] Incorporar Alpine con versión fija y carga diferida.
- [x] Controlar la vista activa, títulos y opción seleccionada con `Alpine.store`, `x-show`, `x-text`, `:class` y `:aria-current`.
- [x] Conservar el contexto del ciclo y los formularios al navegar.
- [x] Migrar las dos pestañas de reportes y sus acciones específicas, manteniendo navegación por teclado.
- [x] Mantener los flujos alternativos que llaman a `switchTab` y `cambiarSubmoduloReportes`.
- [ ] Confirmar el funcionamiento en un despliegue real de Apps Script.

### 3. CU-002: Tareas

- [ ] Cargar las plantillas disponibles del ciclo mediante una llamada real a Apps Script.
- [ ] Renderizar opciones con `x-for` y enlazar el formulario con `x-model`.
- [ ] Mostrar carga, errores y reintento al consultar plantillas.
- [ ] Mover la publicación simulada a una función del servidor, manteniendo su identificación como simulación de Classroom.
- [ ] Mostrar «Creando tarea…», bloquear envíos duplicados y restaurar controles al recibir éxito o error.
- [ ] Adaptar los flujos alternativos y de cancelación al contrato asíncrono.

### 4. CU-005: Reportes

- [ ] Reutilizar `obtenerDatosReportes()` como fuente del estado reactivo.
- [ ] Controlar carga, error y reintento mediante Alpine.
- [ ] Poblar investigadores y tablas de publicaciones con `x-for` en las dos modalidades.
- [ ] Enlazar filtros con `x-model` y conservar gráficos, detalles y descargas.
- [ ] Eliminar las mutaciones imperativas de los mismos elementos migrados.

### 5. Validación

- [ ] Validar ambos CUs completos: navegación, carga, éxito, error, vacío y doble envío.
- [ ] Comprobar los flujos alternativos y la conservación del ciclo seleccionado.
- [ ] Verificar llamadas reales y permisos en Apps Script; los servicios simulados locales no sustituyen esa prueba.

### 6. Entrega y explicación individual

- [ ] Documentar el uso de `x-data`, `x-show`, `x-model`, `x-for` y eventos.
- [ ] Preparar ejemplos del recorrido acción → carga → servidor → respuesta → vista para cada CU.
- [ ] Subir la rama y abrir un pull request con alcance, verificaciones y pendientes.

## Decisiones de la primera entrega

`Navegacion.html` registra el store `navegacion` durante `alpine:init`. `Index.html` carga Alpine **3.17.5** con `defer`; todas las vistas incluidas viven bajo el `x-data` del body. Las inclusiones de Apps Script mantienen el espacio de nombres plano.

| Estado | Responsabilidad |
| --- | --- |
| `sesionIniciada` | Alternar el acceso de demostración y el espacio de trabajo. No representa autenticación real. |
| `vistaActual` | Seleccionar Inicio, Ciclo, Clases, Plantillas, Tareas o Reportes. |
| `reporteActual` | Elegir investigador o carrera y línea. |
| `reportesVisibles` | Ocultar pestañas y paneles durante la carga o ante un error. No reemplaza aún el estado de carga del CU-005. |

Los eventos de navegación usan `@click`. `switchTab()` y `cambiarSubmoduloReportes()` delegan al store para conservar los flujos existentes. Los callbacks de entrada se ejecutan con `Alpine.nextTick`, después de que `x-show` haya mostrado la vista, para que los gráficos puedan medir su contenedor. El selector del ciclo, los formularios, las llamadas al servidor y el renderizado de datos conservan su implementación actual hasta las siguientes etapas.

La navegación usa `x-show`, en lugar de destruir las vistas, para conservar filtros y formularios. `x-cloak` evita mostrar los módulos antes de inicializar Alpine. Los selectores de anchura de reportes leen atributos reactivos, porque Alpine oculta con `display` y ya no con la clase `hidden`.

## Mapa de cambios y dependencias

- `src/vistas/Index.html`: carga de Alpine, raíz reactiva, menú y cabecera.
- `src/vistas/Navegacion.html`: estado y métodos de navegación.
- `src/vistas/Inicio.html`: accesos directos reactivos.
- Vistas de los seis módulos: visibilidad con `x-show`.
- `src/vistas/Reportes.html`, `ReporteInvestigador.html`, `ReporteCarrera.html`: pestañas, accesibilidad y paneles.
- `src/scripts/Scripts.html`: puentes de compatibilidad y visibilidad de paneles.
- `src/estilos/Estilos.html`: `x-cloak` y anchura según vista activa.

Para desplegar esta entrega hay que crear también el archivo HTML **Navegacion** en el editor de Apps Script. Abrir `Index.html` directamente no resuelve sus inclusiones.

## Referencias

- [Instalación oficial de Alpine](https://alpinejs.dev/essentials/installation).
- [Estado compartido con Alpine.store](https://alpinejs.dev/globals/alpine-store).
- [Visibilidad con x-show](https://alpinejs.dev/directives/show).

## Verificación de las etapas 1 y 2 — 2026-11-05

Comprobaciones locales realizadas sobre una composición de las inclusiones de Apps Script, ejecutada en Chromium con Alpine real y respuestas de `google.script.run` simuladas:

- Sintaxis válida de todos los bloques JavaScript de la página compuesta.
- Acceso de demostración, salida y reentrada; redirección a Tareas y a Ciclos cuando no hay ciclo activo.
- Una sola vista activa entre los seis módulos, con `aria-current` coherente y accesos directos de Inicio.
- Conservación del título introducido en el formulario al salir de Tareas y volver.
- Reportes: paneles ocultos durante la espera y ante error; recuperación mediante Reintentar; conservación de la pestaña seleccionada y reutilización de datos ya cargados.
- Pestañas de reportes con ratón, flechas y End; `aria-selected` y `tabindex` reactivos.
- Ciclo cerrado conservado al navegar; asignación de tareas deshabilitada.
- Capturas locales de Tareas y Reportes a 1440, 768 y 390 px; revisión visual de escritorio y móvil conservando el diseño existente.
- Sin errores de ejecución de JavaScript ni expresiones Alpine; sin IDs duplicados ni referencias literales `getElementById` ausentes.

Para repetir manualmente en Apps Script: copiar los archivos modificados y crear `Navegacion`; acceder a la aplicación, recorrer los módulos, rellenar Tareas y cambiar de vista, consultar Reportes, alternar sus pestañas con ratón y teclado, cambiar a un ciclo cerrado y comprobar el botón de asignación. Activar el error de repositorio en Condiciones de prueba, verificar la ocultación de paneles y recuperar la consulta al restablecer la condición.

No se ha probado un despliegue real de Google ni migrado el contrato del servidor. El siguiente trabajo es la etapa 3, CU-002.
