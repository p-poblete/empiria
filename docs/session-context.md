# Estado de sesión — 2026-11-05

Repositorio público: https://github.com/p-poblete/empiria. Rama de trabajo: `feat/alpine-casos-uso`. [PR #1](https://github.com/p-poblete/empiria/pull/1) abierto hacia `main`, sin fusionar. Última implementación: `c448a91` (vista local). GitHub Actions aprobado también para esa versión; copia local sincronizada antes de guardar este resumen.

## Actualización tecnológica completada localmente

Plan en `docs/PLAN_MIGRACION_ALPINE.md` y guía de explicación individual en `docs/GUIA_ALPINE.md`. Casos formales: CU-002 (Generar Actividad de Seguimiento) y CU-005 (Generar reporte de seguimiento de investigación).

Alpine 3.17.5 controla navegación, acceso de demostración, títulos y pestañas. `Reactivos.html` añade stores tareas/reportes y un adaptador de promesas para google.script.run. Tareas obtiene plantillas del servidor, usa x-model/x-for y publica una simulación en Apps Script con validación, idempotencia y cancelación compensada. Reportes carga datos con estados reactivos, usa x-model/x-for en los selectores y renderiza publicaciones en ambas modalidades mediante TablaPublicaciones.html. Gráficos, detalles y exportaciones mantienen sus cálculos existentes.

Verificaciones: npm test (6 pruebas) y npm run test:browser (16 escenarios) pasaron. Incluyen errores/vacíos, doble envío, cuotas, permisos, conexión, cancelación antes/después de ejecutar, fallo de cancelación, filtros, búsqueda, orden, paginación, CSV, generación HTML/JSON/PDF, precondiciones, sesión y datos escapados. Sin errores JS/Alpine ni IDs duplicados. Capturas a 1440/768/390 y evidencia en docs/capturas. Se configuró GitHub Actions para ambas suites. Para usar un Chromium existente: EMPIRIA_CHROMIUM_PATH=/ruta/al/ejecutable npm run test:browser.

**El usuario pospuso explícitamente el despliegue en Apps Script.** No desplegar sin nueva solicitud. Las pruebas ejecutan los endpoints reales en un VM con servicios Google simulados; la integración y los permisos de Google siguen sin validar. Para el despliegue posterior se necesitan también los HTML Navegacion, Reactivos y TablaPublicaciones. No se integró Classroom real ni autenticación real.

Siguiente paso: recoger los resultados de la prueba manual del usuario en la vista local y corregir lo que encuentre; después revisar el PR con los compañeros. No fusionar ni desplegar automáticamente. Configurar y validar Apps Script solo cuando el usuario lo solicite. El grafo es anterior a la migración; verificar relaciones en fuente.

## Hallazgos previos y límites

El consolidado todavía conserva datos antiguos cuando ya existe, no bloquea duplicados y su protección de advertencia no garantiza solo consulta ni configura lectores. No se corrigieron en esta migración. El catálogo y ciclo activo siguen siendo de demostración (2026-II); las plantillas locales de CU-003 no están registradas en el servidor. La idempotencia simulada usa caché temporal por sesión; no es persistencia de producción.

## Vista local para probar — 2026-11-05

El usuario pidió ejecutar sin Apps Script. Añadido `npm run preview` (`scripts/preview.cjs`) y dejado activo en http://127.0.0.1:4173, solo accesible desde esta máquina. El cliente usa el código real, Alpine local y un puente HTTP hacia los endpoints con servicios Google simulados en memoria; también hay consolidado HTML local. El helper de pruebas acepta reloj real y servicios adicionales sin cambiar su comportamiento por defecto.

Verificado: 6 pruebas de servidor, carga en Chromium por HTTP de plantillas y 11 investigadores sin errores JS, y consolidado local sin acceso a Google. Navegador solicitado mediante xdg-open. La aplicación usa fecha real; publicar requiere entrega futura dentro de 2026-II. Recargar inicia otra sesión demo. No se desplegó en Apps Script.

## Cómo retomar

1. Leer este archivo y comprobar `git status` y el estado del PR #1; evitar cargar todo el historial.
2. Comprobar si http://127.0.0.1:4173 responde. Al cerrar esta sesión estaba activo (HTTP 200), pero el proceso puede no sobrevivir al cierre o reinicio. Si no responde, ejecutar `npm run preview` desde el proyecto; `npm ci` solo si faltan dependencias.
3. Abrir la vista local y continuar con las observaciones del usuario. No consta todavía su evaluación manual ni problemas reportados tras abrirla.
4. Para repetir desde cero, recargar la página; para detener el servidor, Ctrl+C en la terminal donde se inició. No confundir la vista local con un despliegue en Google.

La guía para las preguntas individuales está en `docs/GUIA_ALPINE.md`; el seguimiento de criterios, en `docs/PLAN_MIGRACION_ALPINE.md`. Los cambios de esta entrega están en GitHub y no se fusionaron a main.
