# Empiria · Gestión de investigación

Aplicación web de demostración en Google Apps Script, con interfaz en español.

## Organización

| Carpeta | Contenido |
| --- | --- |
| `src/servidor/` | Código del servidor y datos de demostración (`.gs`). |
| `src/vistas/` | Página principal, vistas y componentes HTML. |
| `src/estilos/` | Estilos compartidos. |
| `src/scripts/` | JavaScript del navegador. |
| `docs/` | Instrucciones y auditoría visual. |
| `recursos/imagenes/` | Imágenes y referencias SVG. |
| `recursos/diseno/` | Guía visual y diagrama Excalidraw. |
| `datos/` | Hoja de cálculo de referencia. |
| `archivos/` | Archivo ZIP existente. |

`AGENTS.md` y `skills-lock.json` permanecen en la raíz como configuración del repositorio y de las herramientas.

## Uso en Google Apps Script

Crea en el editor de Apps Script los archivos de `src/`, conservando sus nombres originales y acentos, sin añadir las carpetas al nombre. Por ejemplo, `src/vistas/Index.html` corresponde al archivo HTML `Index`, y `src/estilos/Estilos.html` corresponde a `Estilos`.

Las llamadas `include('…')` y `createTemplateFromFile('Index')` conservan los nombres del proyecto de Apps Script. Las carpetas organizan el repositorio local.

Previsualiza mediante **Deploy → Test deployments** con un despliegue de aplicación web. Abrir `Index.html` directamente no evalúa las inclusiones del servidor. No hay compilación de la aplicación; las pruebas locales se describen abajo.

## Actualización con Alpine.js

El [plan de migración](docs/PLAN_MIGRACION_ALPINE.md) recoge las etapas, criterios de evaluación y estado de avance para CU-002 y CU-005. Ambos CUs incorporan navegación, estados de carga y poblamiento reactivo con Alpine 3.17.5. La [guía del código](docs/GUIA_ALPINE.md) explica el recorrido de cada petición y las directivas utilizadas.

Al copiar esta versión al editor de Apps Script, incluye los HTML `Navegacion`, `Reactivos` y `TablaPublicaciones`, además de los archivos existentes. Alpine se carga desde CDN y requiere conexión a Internet.

## Pruebas locales

Con Node.js 22 o superior:

```bash
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

Las pruebas componen los HTML, ejecutan Alpine real y prueban los endpoints bajo dobles de los servicios de Google. No despliegan ni necesitan una cuenta de Google. GitHub Actions ejecuta estas comprobaciones al subir cambios y en los pull requests.

La publicación es una simulación de Classroom; el acceso de demostración no autentica usuarios. El despliegue en Apps Script queda pospuesto. La configuración y los límites de esta demo están en la guía.

## Probar sin Apps Script

```bash
npm ci
npm run preview
```

Abre **http://127.0.0.1:4173**. La vista local compone los HTML del proyecto y ejecuta sus endpoints en Node con servicios de Google simulados, incluidos los consolidados de solo consulta. No usa cuentas de Google ni crea archivos en Sheets o tareas en Classroom. Los datos se mantienen en memoria y se pierden al detener el proceso; recargar la página inicia otra sesión de demostración.

Se usa el reloj real: para publicar, elige una fecha futura dentro del ciclo 2026-II. Alpine se sirve localmente; estilos e iconos externos requieren Internet. Puedes cambiar el puerto con `EMPIRIA_PUERTO` y la espera simulada con `EMPIRIA_LATENCIA_MS` (500 ms por defecto). Detén el servidor con Ctrl+C.
