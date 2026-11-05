# Estado de sesión — 2026-11-05

Repositorio público: https://github.com/p-poblete/empiria. Rama de trabajo: `feat/alpine-casos-uso`; entrega para revisar mediante PR hacia main.

## Actualización tecnológica completada localmente

Plan en `docs/PLAN_MIGRACION_ALPINE.md` y guía de explicación individual en `docs/GUIA_ALPINE.md`. Casos formales: CU-002 (Generar Actividad de Seguimiento) y CU-005 (Generar reporte de seguimiento de investigación).

Alpine 3.17.5 controla navegación, acceso de demostración, títulos y pestañas. `Reactivos.html` añade stores tareas/reportes y un adaptador de promesas para google.script.run. Tareas obtiene plantillas del servidor, usa x-model/x-for y publica una simulación en Apps Script con validación, idempotencia y cancelación compensada. Reportes carga datos con estados reactivos, usa x-model/x-for en los selectores y renderiza publicaciones en ambas modalidades mediante TablaPublicaciones.html. Gráficos, detalles y exportaciones mantienen sus cálculos existentes.

Verificaciones: npm test (6 pruebas) y npm run test:browser (16 escenarios) pasaron. Incluyen errores/vacíos, doble envío, cuotas, permisos, conexión, cancelación antes/después de ejecutar, fallo de cancelación, filtros, búsqueda, orden, paginación, CSV, generación HTML/JSON/PDF, precondiciones, sesión y datos escapados. Sin errores JS/Alpine ni IDs duplicados. Capturas a 1440/768/390 y evidencia en docs/capturas. Se configuró GitHub Actions para ambas suites. Para usar un Chromium existente: EMPIRIA_CHROMIUM_PATH=/ruta/al/ejecutable npm run test:browser.

**El usuario pospuso explícitamente el despliegue en Apps Script.** No desplegar sin nueva solicitud. Las pruebas ejecutan los endpoints reales en un VM con servicios Google simulados; la integración y los permisos de Google siguen sin validar. Para el despliegue posterior se necesitan también los HTML Navegacion, Reactivos y TablaPublicaciones. No se integró Classroom real ni autenticación real.

Siguiente paso: revisar el PR con los compañeros. Después, cuando el usuario lo solicite, configurar y validar Apps Script. El grafo es anterior a la migración; verificar relaciones en fuente.

## Hallazgos previos y límites

El consolidado todavía conserva datos antiguos cuando ya existe, no bloquea duplicados y su protección de advertencia no garantiza solo consulta ni configura lectores. No se corrigieron en esta migración. El catálogo y ciclo activo siguen siendo de demostración (2026-II); las plantillas locales de CU-003 no están registradas en el servidor. La idempotencia simulada usa caché temporal por sesión; no es persistencia de producción.
