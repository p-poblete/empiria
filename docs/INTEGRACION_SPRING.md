# Integración de Apps Script con Spring Boot

Actividad del curso: tres invocaciones desde el proyecto Apps Script hacia servicios REST de Spring Boot que devuelven objetos predeterminados, sin base de datos.

## Las tres invocaciones

| # | Disparador en Apps Script | Función `.gs` | Servicio REST | Uso en la interfaz |
|---|---|---|---|---|
| 1 | `doGet` (ingreso a la aplicación) | `cargarConfiguracionInicial_` → `execGet` | `GET /api/parametros` | Se inyecta en `Index` como `EMPIRIA_CONFIG_INICIAL`; `CICLO_VIGENTE` fija el ciclo inicial y la vista **Configuración** lo muestra sin otra petición. |
| 2 | Botón **Guardar** de un parámetro (vista Configuración) | `actualizarParametroSistema` → `execPut` | `PUT /api/parametros/{codigo}` con `{"valor": "…"}` | Muestra «Guardado en Spring Boot» o el mensaje de validación de Spring (400). |
| 3 | Entrar en **Reportes** o **Configuración** | `obtenerCatalogosSistema` → `execGet` | `GET /api/catalogos` | Los filtros de carrera y línea de CU-005 usan los catálogos (las líneas se filtran por la carrera elegida); la vista Configuración muestra las nueve tablas. |

Otros recursos: `GET /api/parametros/{codigo}` y `GET /api/catalogos/{nombre}`.

### Parámetros

`CICLO_VIGENTE`, `FECHA_INICIO_CICLO`, `FECHA_FIN_CICLO`, `MIN_HORAS_DOCENTE`, `MAX_HORAS_DOCENTE`, `MIN_HORAS_INVESTIGACION`, `ID_CARPETA_PLANTILLAS`, `MAX_HOJAS_PLANTILLA`, `DIAS_RECORDATORIO_ENTREGA`, `ID_HOJA_BASE_DATOS`, `MONEDA_REPORTES` y `ZONA_HORARIA`. Cada uno trae `codigo`, `valor`, `tipo` (ENTERO, TEXTO, FECHA o ID_DRIVE), `grupo`, `descripcion`, `unidad`, `minimo`, `maximo` y `editable`.

Spring valida el tipo, el rango, los parámetros de solo lectura y la coherencia entre ellos: MIN ≤ MAX de horas e inicio de ciclo anterior al fin. Cada cambio aceptado incrementa `version`. Los valores se guardan en memoria y vuelven a los predeterminados al reiniciar el servicio. Los IDs de Drive son marcadores `DEMO-…`.

### Catálogos

`facultades`, `carreras` (`idFacultad`), `planesEstudio` (`idCarrera`, `anio`, `creditos`, `vigente`), `lineasInvestigacion` (`idCarrera`), `ciclosAcademicos` (`estado`, `fechaInicio`, `fechaFin`), `categoriasDocente`, `dedicaciones`, `nivelesRenacyt` y `tiposActividad`. Todos tienen `id` y `descripcion`. Las descripciones de carreras y líneas coinciden con `BaseDatos.gs` para que los filtros sigan encontrando registros.

## 1. Ejecutar Spring Boot en Codespaces

1. En GitHub: **Code → Codespaces → Create codespace** sobre la rama de trabajo. `.devcontainer/` instala Java 21 y compila el proyecto.
2. En la terminal:
   ```bash
   cd servicios-rest
   ./mvnw spring-boot:run
   ```
   Opcional: `EMPIRIA_TOKEN=un-secreto ./mvnw spring-boot:run` exige la cabecera `X-Empiria-Token` en el PUT.
3. Pestaña **Ports** → puerto 8080 → clic derecho → **Port visibility → Public**. Por consola: `gh codespace ports visibility 8080:public -c NOMBRE_CODESPACE`.
4. Copia la URL reenviada, por ejemplo `https://NOMBRE-8080.app.github.dev`, y comprueba `…/api/parametros` en el navegador.

Si el puerto es privado, Google recibe la página de inicio de sesión de GitHub y la app muestra «el servicio no devolvió JSON». El Codespace se detiene por inactividad: arráncalo antes de presentar. La URL se mantiene mientras el Codespace siga existiendo.

## 2. Configurar Apps Script

1. Añade o reemplaza en el editor:
   - `IntegracionSpring.gs` (nuevo) y `Código.gs` (`doGet` actualizado).
   - `Configuracion.html` y `AlpineSistema.html` (nuevos).
   - `Index.html`, `Scripts.html` y `AlpineReportes.html` (modificados).

   `node scripts/preparar-entrega-alpine.cjs` deja todos los archivos en una carpeta temporal.
2. Si `appsscript.json` declara `oauthScopes`, agrega `https://www.googleapis.com/auth/script.external_request`. Sin ese permiso, `UrlFetchApp` falla.
3. Ejecuta una vez desde el editor, seleccionando una función auxiliar que llame a:
   ```js
   configurarServiciosSpring('https://NOMBRE-8080.app.github.dev', ''); // segundo argumento: token, si se usó
   ```
   La URL queda en Propiedades del script (`SPRING_BASE_URL`), no en el código.
4. Ejecuta `probarServiciosSpring` y revisa el registro de ejecución: deben aparecer parámetros y catálogos.
5. Prueba la implementación `/dev`: inicio (ciclo), **Configuración** (guardar un valor válido y uno inválido) y **Reportes** (filtros de carrera y línea).

Si Spring no responde, la app abre igual. La vista Configuración muestra el motivo, y Reportes vuelve a los valores presentes en los datos.

## 3. Probar en local sin Google

```bash
cd servicios-rest && ./mvnw spring-boot:run     # terminal 1
npm run preview                                  # terminal 2 → http://127.0.0.1:4173
```

La vista local ejecuta el mismo `IntegracionSpring.gs` con `UrlFetchApp` simulado mediante curl, contra `http://127.0.0.1:8080`, o contra `EMPIRIA_SPRING_URL` si se define.

Pruebas: `npm test` incluye `tests/integracion-spring.test.cjs`, y `cd servicios-rest && ./mvnw test` ejecuta las pruebas MockMvc de los endpoints.

## Cambios respecto del código de ejemplo

`execGet`, `execPost` y `execPut` conservan la idea del ejemplo del 13 de noviembre, con estos cambios:
- `muteHttpExceptions` para leer el código y el mensaje de error de Spring.
- Devuelven `{codigo, cuerpo}`.
- El `catch` registra `url`: el ejemplo usaba `path`, una variable que no existe.
- Envían el token opcional.
