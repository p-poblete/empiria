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
- [ ] Confirmar el funcionamiento en un despliegue real de Apps Script. **Pospuesto por decisión del usuario; no forma parte de esta entrega local.**

### 3. CU-002: Tareas

- [x] Cargar las plantillas disponibles del ciclo mediante una llamada real a Apps Script.
- [x] Renderizar opciones con `x-for` y enlazar el formulario con `x-model`.
- [x] Mostrar carga, errores y reintento al consultar plantillas.
- [x] Mover la publicación simulada a una función del servidor, manteniendo su identificación como simulación de Classroom.
- [x] Mostrar «Creando tarea…», bloquear envíos duplicados y restaurar controles al recibir éxito o error.
- [x] Adaptar los flujos alternativos y de cancelación al contrato asíncrono.

### 4. CU-005: Reportes

- [x] Reutilizar `obtenerDatosReportes()` como fuente del estado reactivo.
- [x] Controlar carga, error y reintento mediante Alpine.
- [x] Poblar investigadores y tablas de publicaciones con `x-for` en las dos modalidades.
- [x] Enlazar filtros con `x-model` y conservar gráficos, detalles y descargas.
- [x] Eliminar las mutaciones imperativas de los mismos elementos migrados.

### 5. Validación local y posterior integración

- [x] Validar localmente ambos CUs con los endpoints reales bajo dobles de los servicios de Google: navegación, carga, éxito, error, vacío y doble envío.
- [x] Comprobar los flujos alternativos y la conservación del ciclo seleccionado.
- [ ] Verificar llamadas reales y permisos en Apps Script. **Pospuesto por decisión del usuario.** Los servicios simulados locales no sustituyen esa prueba.

### 6. Entrega y explicación individual

- [x] Documentar el uso de `x-data`, `x-show`, `x-model`, `x-for` y eventos.
- [x] Preparar ejemplos del recorrido acción → carga → servidor → respuesta → vista para cada CU.
- [x] Subir la rama y abrir un pull request con alcance, verificaciones y pendientes.

## Decisiones de arquitectura

`Navegacion.html` registra el store `navegacion` durante `alpine:init`. `Index.html` carga Alpine **3.17.5** con `defer`; todas las vistas incluidas viven bajo el `x-data` del body. Las inclusiones de Apps Script mantienen el espacio de nombres plano.

| Estado | Responsabilidad |
| --- | --- |
| `sesionIniciada` | Alternar el acceso de demostración y el espacio de trabajo. No representa autenticación real. |
| `vistaActual` | Seleccionar Inicio, Ciclo, Clases, Plantillas, Tareas o Reportes. |
| `reporteActual` | Elegir investigador o carrera y línea. |
| `reportesVisibles` | Ocultar pestañas y paneles durante la carga o ante un error. Su valor se actualiza desde la carga reactiva del CU-005. |

Los eventos de navegación usan `@click`. `switchTab()` y `cambiarSubmoduloReportes()` delegan al store para conservar los flujos existentes. Los callbacks de entrada se ejecutan con `Alpine.nextTick`, después de que `x-show` haya mostrado la vista, para que los gráficos puedan medir su contenedor. Los stores de `AlpineTareas.html` y `AlpineReportes.html` controlan carga, respuestas, formularios y filtros; `Reactivos.html` conserva el adaptador compartido de Apps Script. `TablaPublicaciones.html` comparte el renderizado reactivo entre ambas modalidades.

La navegación usa `x-show`, en lugar de destruir las vistas, para conservar filtros y formularios. `x-cloak` evita mostrar los módulos antes de inicializar Alpine. Los selectores de anchura de reportes leen atributos reactivos, porque Alpine oculta con `display` y ya no con la clase `hidden`.

## Mapa de cambios y dependencias

- `src/vistas/Index.html`: carga de Alpine, raíz reactiva, menú y cabecera.
- `src/vistas/Navegacion.html`: estado y métodos de navegación.
- `src/vistas/Inicio.html`: accesos directos reactivos.
- Vistas de los seis módulos: visibilidad con `x-show`.
- `src/vistas/Reportes.html`, `ReporteInvestigador.html`, `ReporteCarrera.html`: pestañas, accesibilidad y paneles.
- `src/scripts/Scripts.html`: puentes de compatibilidad, cálculos y presentación existente.
- `src/scripts/Reactivos.html`: adaptador compartido de promesas de Apps Script.
- `src/scripts/AlpineTareas.html` y `AlpineReportes.html`: estado reactivo de cada módulo, con registro durante `alpine:init`.
- `src/vistas/TablaPublicaciones.html`: columnas, filas y vacío de ambas tablas de publicaciones.
- `src/servidor/Código.gs`: catálogo de plantillas, publicación y cancelación simuladas.
- `tests/` y `.github/workflows/verificaciones.yml`: comprobaciones locales y en GitHub.
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

Esta sección documenta el primer avance. Las etapas restantes se completaron después; véase el cierre siguiente.

## Cierre de las etapas 3 a 6 — 2026-11-05

Implementados carga y poblamiento reactivos en ambos CUs. Tareas consulta plantillas y publica una simulación mediante endpoints de Apps Script, con validación del servidor, reintentos idempotentes y cancelación compensada. Reportes carga sus datos, mantiene selectores con `x-model`/`x-for` y representa publicaciones filtradas y paginadas con `x-for` en las dos modalidades. Se mantiene la generación de gráficos y exportaciones existente.

Se añadieron pruebas de servidor y navegador, flujo de comprobaciones en GitHub y [guía de explicación individual](GUIA_ALPINE.md). Las pruebas de navegador ejecutan Alpine real y el código de endpoints en un VM con dobles de CacheService y LockService. No equivalen a una validación con cuentas de Google.

Por instrucción del usuario, el despliegue y su validación se posponen. No se subió código a Apps Script ni se modificaron archivos en Google. Los problemas previos del consolidado (actualización, duplicados y permisos) se mantienen como trabajo separado.

## Pendientes de organización de Alpine — 2026-11-05

### Fuente confirmada para CU-005

Preparación de prueba real de restricciones/recolección: [PRUEBA_REGISTRO_CLASSROOM.md](PRUEBA_REGISTRO_CLASSROOM.md). Backend privado implementado localmente; no instalado en Google. La interfaz pública continúa en modo demo y CU-005 todavía consume BaseDatos.gs.

Estructura de captura y recolección V2 aplicada a ambos libros con autorización del usuario: [detalle](SHEETS_V2_APLICADO.md). Datos originales preservados; integración de servidor pendiente.

Flujo de negocio confirmado: [registro mediante copias individuales de Classroom](FLUJO_REGISTRO_CLASSROOM.md). CU-002 distribuye la plantilla, los investigadores completan sus copias, la recolección vuelca sus datos en BD y CU-005 consulta la BD. Esta definición sustituye cualquier supuesto de registro web independiente o guardado directo desde la plantilla.

Mapeo detallado, brechas y secuencia propuesta: [MAPEO_SHEETS_CU005.md](MAPEO_SHEETS_CU005.md).

El usuario indicó Google Sheets como repositorio de consulta. Se inspeccionaron metadatos, encabezados y notas de diseño en lectura, sin modificar los libros:

- BD: Empiria_Base_de_Datos (identificador en configuración local privada)
- Plantilla de captura: Empiria_Registro (identificador en configuración local privada)

La BD contiene tablas `DB - ...` de investigadores, publicaciones (Journal/Conferencia y otras), eventos, proyectos, grupos y semilleros; también tablas `ACT - ...`. La plantilla contiene formularios `R - ...`; sus notas indican envío a la BD mediante Apps Script. La inspección no verifica que ese envío esté implementado.

Arquitectura propuesta: Alpine solicita la consulta a Apps Script; el servidor lee las tablas de la BD, valida encabezados y transforma los registros al contrato del reporte. El navegador recibe solo campos necesarios y autorizados. La plantilla es entrada de captura, no la fuente directa de CU-005.

Brechas a resolver antes de atribuir indicadores: las notas de BD aclaran que `ID investigador (registrante)` identifica a quien guarda, no necesariamente al autor o responsable; tampoco se debe asumir que el ciclo de captura equivale al periodo de la contribución. Definir relación de participantes y claves de contribución para evitar atribuciones y conteos incorrectos. No se verificaron filas de datos ni completitud de indicadores. Mantener ausentes como no registrados, sin sustituirlos por datos demo.

Reevaluación de alcance: separar archivos mejora mantenimiento, pero no completa los casos de uso. La migración anterior cubre los criterios tecnológicos locales; CU-002 sigue simulando Classroom y CU-005 consulta datos de demostración. No presentar ese cierre como integración funcional completa.

Prioridad propuesta, aún sin implementar:

1. CU-002: un controlador Alpine del flujo completo (abrir, validar desde el modelo, enviar, reintentar, cancelar y presentar resultado), incluidos errores por campo, modal y estado de operación. Sustituir la lectura del formulario desde el DOM y el estado repartido entre Scripts, Reactivos y FlujosTareas. El servidor debe seguir siendo responsable de validar y ejecutar la operación.
2. CU-005: un modelo de consulta coherente para filtros, selección, colecciones, indicadores, detalles y exportaciones. Derivar las salidas del mismo resultado filtrado, conservando las reglas de cálculo existentes. Alpine controla la presentación; los cálculos puros y adaptadores de gráficos/exportación pueden seguir separados.
3. Definir y completar contratos con servicios reales: contexto y plantillas autorizadas, publicación y registro persistente para CU-002; repositorio real autorizado y consolidado actualizado para CU-005. Esto requiere trabajo de servidor e integración, no más directivas Alpine. Mantener el despliegue pospuesto hasta solicitud explícita.
4. Verificar los flujos completos con pruebas existentes ampliadas donde cambie el comportamiento; distinguir evidencia local con dobles de evidencia de integración real.

- [x] Separar la lógica reactiva por vista: `AlpineTareas.html` y `AlpineReportes.html`; mantener utilidades compartidas en `Reactivos.html` y registro propio en cada módulo. Conservar las directivas de presentación (`x-model`, `x-for`, `x-show`, eventos) en las vistas. Inclusiones actualizadas; composición de pruebas y vista local descubren automáticamente los HTML nuevos. Esta separación conserva el comportamiento y los puentes anteriores en Scripts/FlujosTareas; no completa la migración de esos renderizadores ni conecta el backend real.
