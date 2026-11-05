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

Previsualiza mediante **Deploy → Test deployments** con un despliegue de aplicación web. Abrir `Index.html` directamente no evalúa las inclusiones del servidor. No hay un comando de compilación ni un ejecutor de pruebas configurados.

## Actualización con Alpine.js

El [plan de migración](docs/PLAN_MIGRACION_ALPINE.md) recoge las etapas, criterios de evaluación y estado de avance para CU-002 y CU-005. La primera entrega incorpora navegación reactiva con Alpine 3.17.5; carga y poblamiento reactivo desde el servidor siguen pendientes.

Al copiar esta versión al editor de Apps Script, incluye el nuevo HTML `Navegacion`, además de los archivos existentes. Alpine se carga desde CDN y requiere conexión a Internet.
