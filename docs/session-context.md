# Estado vigente — entrega del 2026-11-06

Usuario autorizó publicar todos los cambios y la explicación en la rama principal de GitHub. Sustituye la restricción anterior de no fusionar. Preparada explicación en docs/EXPLICACION_ENTREGA_ALPINE.md y PDF de 7 páginas, centrada en arquitectura, flujo servidor/Alpine de ambos CUs y defensa individual. README enlaza guía e instalación modular. Servidor dividido en Código.gs, TareasServidor.gs, ReportesServidor.gs, Consolidados.gs y BaseDatos.gs; 20 HTML separados, nombres únicos. Generador scripts/preparar-entrega-alpine.cjs prepara paquete sin configuración privada.

Verificaciones finales: 27 pruebas servidor, 16 escenarios navegador, PDF renderizado e inspeccionado, texto completo extraíble y diff --check. Cambio local del login que quitaba x-show conservado como parche /tmp/empiria-login-cambio-local.patch; directiva restaurada para evitar que la pantalla bloquee la aplicación. Eliminados enlaces con IDs privados de hojas en dos documentos antiguos; no se reescribe historial. Correcciones de Classroom y diagnóstico incluidas. La publicación demo y datos demo siguen separados de la integración real.

Siguiente paso: publicar commits en main y comprobar Actions. Google Apps Script: usuario indicó haber copiado archivos, pero falta confirmar recorrido completo y versión /exec; no afirmar despliegue remoto verificado. Para retomar, consultar primero este estado vigente; las secciones siguientes conservan antecedentes.

# Estado de sesión — 2026-11-05

## Repositorio y alcance

Repositorio público: https://github.com/p-poblete/empiria. Rama `feat/alpine-casos-uso`; [PR #1](https://github.com/p-poblete/empiria/pull/1) abierto, sin fusionar. Cambios publicados: `3296f6c` (registro/recolección) y `2eb6f79` (separación Alpine). GitHub Actions aprobado para `2eb6f79`; Git estaba limpio y sincronizado antes de esta actualización documental. No fusionar ni desplegar la web automáticamente.

## Decisión de registro vigente

CU-002 distribuye una plantilla de Sheets como copia individual en Classroom → investigador completa copia → servidor recolector valida y vuelca a BD → CU-005 consulta BD. No hay registro web independiente ni escritura directa de la plantilla a BD. Identidad del declarante desde Classroom; no asumir autoría ni participante único. Ver `FLUJO_REGISTRO_CLASSROOM.md`.

Usuario autorizó completar Sheets y luego probar restricciones reales. Creó una clase nueva y facilitó cuenta de prueba y proyecto Apps Script GCC_SI_Maquetado. Datos de clase/cuenta/proyecto en `datos/registro-prueba.local.json`, ignorado por Git; no copiarlos a código público. El usuario gestiona invitaciones. No se enviaron invitaciones ni se creó/publicó una tarea real.

## Sheets aplicados

Referirse por nombre: **Empiria_Registro** y **Empiria_Base_de_Datos**. Registro tiene 16 pestañas; formularios antiguos retirados, encabezados fila 1/datos fila 2, IDs A:C ocultos y 16 protecciones de hoja reales con excepciones en captura. Ficha solo fila 2; contexto y catálogos ocultos. Propietario puede cambiar las protecciones; falta comprobarlo con copia real de Classroom.

BD tiene 27 pestañas: tablas originales preservadas, SYS para identidad, asignaciones, entregas, orígenes, contribuciones, participantes, recolecciones, errores, esquema, secciones asignadas y bajas. Se añadió ID actividad en M de ACT - Proyectos internos y O de ACT - Semilleros/Grupo Investigación, sin cambiar registros históricos. Estructuras operativas nuevas vacías. Readbacks de encabezados/validaciones aprobados. Hay indicios de desalineación histórica, sin corregir ni atribuir. Detalle en `SHEETS_V2_APLICADO.md`, mapeo en `MAPEO_SHEETS_CU005.md`, contrato vigente revisión 3 en `esquema-sheets.json`.

## Implementación de registro

Siete módulos privados en src/servidor/Registro*.gs: contrato, validación, Google, referencias, recolección, bajas y preparación de prueba. Configuración administrativa explícita y funciones terminadas en _; no expuestas por google.script.run. Preparan libro por tarea, protecciones, borrador individual, identidad, IDs persistentes, referencias asistidas, importación repetible y bajas lógicas. Rechazan alteraciones de estructura/IDs/fórmulas, cambios de archivo y referencias inválidas. Solo se recolectan entregas TURNED_IN. Contribuciones canónicas se crean Pendientes; no acreditan deduplicación ni autoría.

La interfaz Alpine y endpoints públicos siguen en modo demo: CU-002 simula Classroom, CU-005 lee BaseDatos.gs. No se conectaron estos botones al backend real; el código nuevo se invoca explícitamente desde el editor. Recolección masiva/programada y lector real CU-005 siguen pendientes.

## Prueba real y bloqueo actual

El conector Drive devuelve 403 al leer el código del proyecto Apps Script. No hay herramientas de edición Apps Script/Classroom ni sesión CLI local autenticada. No se sincronizó ni ejecutó código remoto. No pedir que publique el proyecto ni que comparta credenciales.

`npm run preparar:registro` genera en /tmp un EmpiriaRegistro.gs único y manifest-requerido.json. Contiene la configuración privada de prueba; no versionar el artefacto. Añadir un archivo nuevo al editor existente, activar servicio avanzado Classroom y combinar permisos del manifiesto conservando los actuales. No requiere despliegue web. Procedimiento completo en `PRUEBA_REGISTRO_CLASSROOM.md`: configurar, preparar DRAFT, revisar/publicar explícitamente, abrir copia con investigador, diagnosticar/aplicar protecciones, preparar IDs/referencias, entregar y recolectar dos veces. El usuario debe ejecutar esos pasos donde falta acceso de herramientas.

## Verificaciones y pendientes

- npm test: 27 pruebas aprobadas (incluye repetición sin duplicados, fallos antes/después de guardar, identidad, bajas y borrador dirigido a una sola cuenta).
- Navegador: 16 escenarios demo aprobados con EMPIRIA_CHROMIUM_PATH=/home/scoria/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome. Chromium esperado por la versión actual de Playwright no está instalado; usar ese existente.
- Contrato sincronizado con RegistroEsquema.gs; sintaxis del artefacto compuesto y git diff --check verificados.
- Siguiente paso: cargar artefacto en Apps Script y ejecutar recorrido con docente/investigador; registrar resultados reales. No dar integración por validada con las pruebas locales.
- Separación Alpine completada: AlpineTareas.html y AlpineReportes.html registran sus stores; Reactivos.html conserva llamarServidor. Las directivas siguen en las vistas y los puentes previos en Scripts/FlujosTareas se mantienen. Index incluye ambos módulos antes de alpine:init. Plan/guía actualizados. El grafo es anterior a la migración: verificar en fuente, no reconstruir automáticamente.
- Consolidado antiguo no actualiza libro existente ni resuelve duplicados/permisos de consulta. Autenticación pública sigue simulada; no usar como autorización del backend nuevo.
- Vista local disponible con npm run preview en http://127.0.0.1:4173 si se requiere; verificar proceso antes de afirmar que está activo.

## Entrega de los puntos 7 y 8

Completados: stores separados y cambios locales revisados/subidos al PR #1, con título y descripción actualizados al alcance completo. Verificados 27 tests de servidor, 16 escenarios de navegador y GitHub Actions. Configuración de clase/cuenta/proyecto solo en JSON local ignorado; escaneo de candidatos públicos sin esos valores. El PR distingue backend preparado de integración Google pendiente. No fusionado ni desplegado.

## Pendientes para la siguiente sesión, en orden

1. **Cargar y configurar Apps Script.** No consta todavía que el usuario haya pegado/ejecutado el código en GCC_SI_Maquetado. Regenerar el archivo con `npm run preparar:registro` si el artefacto temporal ya no existe. Usar siete módulos Registro*.gs o el archivo único, sin duplicarlos. Activar Classroom avanzado y combinar permisos/propiedades conservando configuración existente. Si se copia también la app web, añadir los nuevos HTML AlpineTareas y AlpineReportes y el Index actualizado. La alternativa de automatización es configurar clasp con autorización de Google; no existe un conector de edición confirmado y no se debe afirmar lo contrario.
2. **Ejecutar la prueba real individual.** Seguir PRUEBA_REGISTRO_CLASSROOM.md con clase y cuenta guardadas en la configuración local. Verificar pertenencia a la clase (invitaciones a cargo del usuario), preparar borrador, revisar/publicar esa tarea, abrir copia, comprobar propiedad y edición/borrado con ambas cuentas, preparar referencias, entregar y recolectar dos veces. Comprobar recuperación ante errores y bajas sin duplicados. Registrar evidencia real; las pruebas locales no sustituyen permisos de Google.
3. **Conectar CU-002 al servidor real.** La UI sigue llamando a publicarActividadDemo. Añadir endpoints con autorización real, selección de secciones, preparación de plantilla, asignación, estados de operación y manejo de cancelaciones/fallos. No exponer directamente funciones privadas ni utilizar el login demo como autorización.
4. **Operar la recolección desde la interfaz.** Controles para el Director: preparar referencias, diagnosticar, recolectar y tramitar bajas. Definir después recolección por varias entregas y ejecución programada; actualmente solo hay operaciones privadas por entrega individual enviada.
5. **Conectar CU-005 a Empiria_Base_de_Datos.** Sustituir BaseDatos.gs por lector autorizado, adaptar contrato y consulta Alpine para que tablas, indicadores y exportaciones compartan el resultado. Excluir bajas aprobadas; mostrar datos incompletos como tales, sin rellenar con demo o ceros inventados.
6. **Resolver calidad y relaciones.** Revisar correspondencia Classroom/persona, participantes y contribuciones canónicas compartidas; confirmar periodos y monedas. Auditar desalineaciones históricas antes de calcular indicadores. Completar actualización, duplicados y permisos de lectura del consolidado.
7. **Revisión con compañeros y cierre de entrega.** Revisar PR #1 junto con evidencia real y pendientes; fusionar o desplegar solo por nueva instrucción. La separación por archivos ya está hecha; quedan renderizadores y funciones imperativas en Scripts/FlujosTareas para migración gradual cuando corresponda.

Para retomar: leer este archivo, comprobar `git status` y PR/Actions. Evitar reconstruir el grafo o repetir suites aprobadas salvo cambios o fallos nuevos. La vista local es opcional para revisar comportamiento demo; no confundirla con la integración real.

## Prueba real — 2026-11-06

Usuario pegó EmpiriaRegistro.gs y combinó manifiesto; configurar terminó sin errores. Para el selector añadió wrappers iniciarConfiguracionEmpiria y prepararPruebaEmpiria. Preparar falló en Classroom create por campo individualStudentOptions inválido. Corregido a individualStudentsOptions en fuente, prueba y artefacto /tmp/empiria-registro-CW4HvO/EmpiriaRegistro.gs. Falta aplicar reemplazo en editor Google y reintentar prepararPruebaEmpiria; operación conserva plantilla para reintento. No se publicó tarea.

Preparar reintentado por usuario: DRAFT creado correctamente (sin copiar IDs al resumen). Diagnóstico real llega a leer estructura y protecciones pero falla en canDomainEdit por autorización. Corregido diagnóstico local para informar null y aviso si Google deniega esa consulta; pendiente aplicar en editor y reintentar. No asumir permisos de investigador ni publicación sin confirmación.

## Cierre de entrega Alpine — 2026-11-06

Prioridad explícita: requisitos Alpine de CU-002 y CU-005 para entrega de hoy; posponer integración real Classroom. Auditoría fuente confirma navegación store/x-show, carga/restauración y datos servidor con x-for en ambos CUs. Añadidos docs/ENTREGA_ALPINE.md y scripts/preparar-entrega-alpine.cjs: genera tres archivos Código.gs, BaseDatos.gs e Index.html compuesto, sin configuración privada. Fuentes originales siguen modulares. Artefacto actual /tmp/empiria-entrega-alpine-66MvYX abierto en VS Code. Verificado composición sin includes pendientes, sintaxis servidor, 27 pruebas servidor y 16 escenarios navegador; diff --check limpio. No hay sesión Document Control conectada ni escritura Apps Script disponible: falta que usuario copie tres archivos conservando manifiesto/Registro y cambios remotos, pruebe /dev y actualice versión de implementación si presenta /exec. No afirmar actualización remota ni integración real. Diagnóstico previo reportó estructura/protecciones/rangos válidos, cero registros, permiso dominio desconocido; prueba cuenta investigadora pendiente.

## Servidor modular para entrega — 2026-11-06

Usuario autorizó separación por responsabilidad. Código.gs contiene solo doGet/include; funciones movidas sin cambios a Tareas.gs, Reportes.gs y Consolidados.gs; BaseDatos.gs conserva datos demo. Comparación de concatenación contra HEAD confirmó código idéntico. Actualizados AGENTS.md y GUIA_ALPINE. Paquete anterior de tres archivos queda sustituido: preparar-entrega-alpine.cjs ahora genera 5 GS y 20 HTML modulares más LEEME, sin registro privado. Carpeta actual /tmp/empiria-entrega-alpine-KVeEVI abierta en VS Code. Verificaciones posteriores: 27 tests servidor, 16 escenarios navegador y diff --check aprobados. Falta copiar al editor Google todos los archivos necesarios, reemplazando también Código.gs para evitar funciones duplicadas; conservar manifiesto/EmpiriaRegistro.gs. Pendiente validación /dev y versión /exec si se usa en entrega. No actualizado remoto, no commit/push ni despliegue.

Corrección de nombres del paquete: usuario señala colisión de nombres base en Apps Script. Renombrados Tareas.gs → TareasServidor.gs y Reportes.gs → ReportesServidor.gs; actualizadas guías/generador. Generador rechaza colisiones de nombre base entre GS/HTML. Paquete vigente /tmp/empiria-entrega-alpine-XxPARp (sustituye anteriores), abierto en VS Code. 27 tests aprobados y diff --check limpio; sin cambios de lógica desde los 16 escenarios aprobados.
