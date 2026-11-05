# Estado de sesión — 2026-11-05

Repositorio público: https://github.com/p-poblete/empiria. Git inicializado y copia inicial publicada en main. Rama actual de trabajo: `feat/alpine-casos-uso`.

## Actualización tecnológica

Plan acordado en `docs/PLAN_MIGRACION_ALPINE.md`. El usuario autorizó ejecutar las etapas 1 y 2: preparación y navegación. Se confirmaron los nombres formales CU-002 (Generar Actividad de Seguimiento) y CU-005 (Generar reporte de seguimiento de investigación).

Implementado Alpine 3.17.5 con versión fija y defer; store de navegación en el nuevo HTML `Navegacion`; navegación principal, acceso de demostración, títulos y pestañas de Reportes reactivos. Los puentes switchTab/cambiarSubmoduloReportes conservan los flujos alternativos. Los datos, formularios y llamadas al servidor mantienen su implementación previa. Para Apps Script se debe añadir el HTML Navegacion.

Verificaciones: sintaxis JS, composición sin IDs duplicados ni referencias literales ausentes; Chromium con Alpine real y servicio de reportes simulado: seis módulos, accesos directos, conservación de formulario/ciclo/pestaña, carga/éxito/error/reintento, teclado, salida/reentrada y flujo sin ciclo activo. Sin errores JS/Alpine. Capturas a 1440/768/390 y revisión visual de escritorio/móvil. No se probó un despliegue real de Apps Script.

Siguiente paso: etapa 3, CU-002 (plantillas desde servidor, x-for/x-model y estados de carga/publicación). Después CU-005. La integración en Google y el cumplimiento completo de la rúbrica siguen pendientes. El grafo existente es anterior a esta migración; no se reconstruyó, verificar las relaciones en fuente.

## Hallazgos previos pendientes

`obtenerConsolidadoCiclo` conserva datos antiguos cuando el libro ya existe, no usa bloqueo contra duplicados y la protección de advertencia no garantiza solo consulta ni configura acceso de lectores. No se corrigieron en esta migración.
