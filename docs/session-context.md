# Estado de sesión — 2026-11-05

## Repositorio y alcance

Repositorio público: https://github.com/p-poblete/empiria. Rama `feat/alpine-casos-uso`; PR #1 hacia main conocido abierto, no fusionado. La entrega actual añade backend privado de registro y separación de stores Alpine; revisar el estado de Git y del PR al retomar. No fusionar ni desplegar la web automáticamente.

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

El usuario autorizó separar Alpine por vista y revisar/subir los cambios locales al PR #1. Dos bloques de revisión: backend privado/contrato de Sheets y organización de Alpine. Verificados 27 tests de servidor y 16 escenarios de navegador después de separar stores; composición local incluye los HTML nuevos. Configuración de clase/cuenta/proyecto se conserva solo en el JSON local ignorado; escaneo de candidatos públicos sin esos valores. El PR debe describir integración Google pendiente y UI todavía demo; no fusionar ni desplegar.
