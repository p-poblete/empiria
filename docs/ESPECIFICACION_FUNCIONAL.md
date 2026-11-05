# Especificación funcional y de datos de Empiria

Fecha de revisión: 15 de octubre de 2026. Alcance: código presente en `src/` del repositorio, aplicación de demostración en español denominada **Empiria · Gestión de investigación**. Este documento describe lo implementado; los textos de intención de una pantalla no se consideran funcionalidades completas.

## 1. Fuentes y criterio de interpretación

| Fuente | Responsabilidad comprobada |
| --- | --- |
| [`Index.html`](../src/vistas/Index.html) | Composición de la página, navegación, contexto de ciclo y cuenta visible. |
| [`Login.html`](../src/vistas/Login.html) | Pantalla de acceso simulado. |
| [`Inicio.html`](../src/vistas/Inicio.html), [`Ciclo.html`](../src/vistas/Ciclo.html), [`Clases.html`](../src/vistas/Clases.html) | Inicio y pantallas en borrador. |
| [`Tareas.html`](../src/vistas/Tareas.html), [`Plantillas.html`](../src/vistas/Plantillas.html) | Formularios, biblioteca y confirmaciones. |
| [`Reportes.html`](../src/vistas/Reportes.html) | Contenedor y acciones comunes de reportes. |
| [`ReporteInvestigador.html`](../src/vistas/ReporteInvestigador.html), [`ReporteCarrera.html`](../src/vistas/ReporteCarrera.html) | Secciones, controles y diálogos de los dos reportes. |
| [`Scripts.html`](../src/scripts/Scripts.html) | Estado del navegador, validaciones, filtros, cálculos, representaciones y descargas. |
| [`Código.gs`](../src/servidor/Código.gs) | Entrada web, inclusión de HTML y consulta de datos. |
| [`BaseDatos.gs`](../src/servidor/BaseDatos.gs) | Registros ficticios de investigación. |
| [`Estilos.html`](../src/estilos/Estilos.html) | Presentación y dependencias visuales compartidas. |

Se distinguen datos **registrados** (copiados de una fuente), **calculados** (producidos por una función), **simulados** (cambios locales o mensajes sin operación externa equivalente) y **borradores** (pantallas informativas sin gestión implementada).

Los SVG, el diagrama de diseño, la hoja de referencia y el ZIP del repositorio no son fuentes consultadas por el servidor para calcular los reportes. La aplicación no lee automáticamente una hoja de cálculo para construir `BASE_DATOS_EMPIRIA`.

## 2. Actores y sistemas participantes

| Actor o participante | Acciones y límites reales |
| --- | --- |
| Usuario de la demostración, presentado como «Director Investigador» | Accede, navega, selecciona ciclos, simula tareas y plantillas, consulta y descarga reportes. No existe selección de rol ni comprobación de permisos. |
| Investigador registrado | Entidad sobre la que se informa. No tiene una sesión, pantalla de captura o flujo de entrega propios implementados. |
| Persona que mantiene el proyecto Apps Script | Modifica los registros de `BaseDatos.gs` y publica/previsualiza el proyecto. Es una actividad fuera de la interfaz. |
| Navegador | Conserva estado temporal, calcula indicadores, abre enlaces y crea archivos de descarga; proporciona impresión/guardado como PDF. |
| Google Apps Script | Evalúa plantillas HTML y responde a `obtenerDatosReportes()`. |
| Google Sheets | Destino de enlaces; `sheets.new` puede abrir una hoja externa. La aplicación no captura su identificador ni sincroniza su contenido. |
| Google Classroom | Mencionado en la interfaz y en el mensaje de éxito. No hay llamada a su API ni publicación implementada. |
| CTI Vitae y sitios de evidencias | Destinos externos de consulta. No se importan perfiles ni se verifica la existencia de documentos. |

No están implementados actores separados de administrador, evaluador, docente autenticado o investigador remitente; tampoco aprobaciones, OAuth o autorización por rol.

## 3. Precondiciones generales y ciclo de vida

1. Crear los archivos `.gs` y HTML en un proyecto de Google Apps Script con sus nombres base y acentos, sin prefijos de carpeta. El espacio de nombres de Apps Script es plano.
2. Ejecutar como aplicación web mediante un despliegue de prueba o publicación de Apps Script. `doGet()` evalúa `Index`, establece el título y utiliza `XFrameOptionsMode.ALLOWALL`.
3. `include(filename)` evalúa cada plantilla, incluidas las inclusiones anidadas de Reportes.
4. Disponer de JavaScript habilitado. Las ventanas externas y la impresión dependen del navegador; las dependencias visuales externas requieren acceso a sus recursos.
5. Para reportes poblados, `BASE_DATOS_EMPIRIA.investigadores` debe contener investigadores válidos. No se requiere una cuenta Google validada por el código de acceso simulado.

Al cargar el documento, el acceso está visible y el panel principal oculto. El contexto inicial es **Ciclo 2026-II**, estado **ACTIVO**, clase **Investigadores 2026-II**. La vista inicial del panel es Tareas.

Las plantillas, su estado de uso, las búsquedas, los filtros y los datos de reportes en caché se conservan en variables JavaScript. No se usan una base de escritura, `localStorage` ni almacenamiento de sesión para estos cambios. Recargar la página reinicia ese estado. Cerrar sesión no equivale a recargar: no vacía el arreglo de plantillas ni la caché de reportes.

## 4. Inventario de módulos

| Módulo | Identificador | Estado y objetivo |
| --- | --- | --- |
| Acceso | `view-login` | Entrada simulada al panel. |
| Inicio | `view-inicio` | Bienvenida y accesos a otros módulos. |
| Ciclo | `view-ciclo` | Borrador informativo de gestión de ciclos. |
| Clases | `view-clases` | Borrador informativo de gestión de clases. |
| Plantillas | `view-plantillas` | Biblioteca temporal, filtro y alta simulada. |
| Tareas | `view-tareas` | Formulario con validaciones y asignación simulada. |
| Reportes | `view-reportes` | Consulta de datos de servidor, análisis por investigador y por carrera/línea, exportaciones. |

### 4.1. Estructura compartida del panel

- **Barra lateral:** marca Empiria, botón para contraer/expandir, seis botones de navegación, perfil fijo «Director Investigador», leyenda «Cuenta de demostración» y cierre de sesión.
- **Cabecera:** título y subtítulo del módulo y selector global de ciclo.
- **Contenido:** una vista de módulo visible a la vez; las demás se ocultan con `hidden`.
- **Accesibilidad implementada:** enlace para saltar al contenido, atributos de estado de navegación, etiquetas de controles, regiones de estado y diálogos de reportes.

`switchTab()` acepta únicamente las claves de `MODULOS`. Oculta las vistas, marca el botón activo, cambia título/subtítulo y cierra el desplegable de ciclos. Al entrar en Plantillas vuelve a renderizar la biblioteca; al entrar en Tareas actualiza su bloqueo por ciclo; al entrar en Reportes intenta inicializar sus datos.

### 4.2. Selector global de ciclo

| Ciclo ofrecido | Estado fijo | Clase por `MAPEO_CLASES` |
| --- | --- | --- |
| Ciclo 2026-II | ACTIVO | Investigadores 2026-II |
| Ciclo 2026-I | CERRADO | Investigadores 2026-I |
| Ciclo 2025-II | CERRADO | Investigadores 2025-II |

La condición activo/cerrado no se calcula a partir de la fecha del día. `selectCiclo(nombre, estado)` actualiza la etiqueta global, los campos de contexto de Tareas, el estado de bloqueo y los reportes si ya existe caché. Una clave sin correspondencia en `MAPEO_CLASES` produce «Sin clase asignada».

Al seleccionar un ciclo cerrado con el formulario de tarea abierto, se cancela y reinicia el formulario. Al cambiar entre contextos no se consulta nuevamente el servidor de reportes.

## 5. Módulo de acceso y cierre de sesión

**Composición:** marca, nombre del producto, texto de acceso y botón «Continuar con Google». No hay campos de usuario o contraseña.

**Flujo básico ACC-01 — entrar.** Actor: usuario de demostración. Precondición: documento cargado y acceso visible.

1. Pulsa «Continuar con Google».
2. `iniciarSesion()` oculta el acceso y muestra el panel.
3. Renderiza las plantillas, prepara el selector de plantillas y activa Tareas.
4. Resultado: panel disponible con la identidad fija de demostración.

**Alternativas:** no existe flujo de credenciales incorrectas, consentimiento OAuth o recuperación de contraseña. Si faltan los contenedores de acceso/panel, la función no ejecuta el cambio.

**Flujo básico ACC-02 — salir.** Precondición: panel visible.

1. Pulsa «Cerrar Sesión».
2. Se cierran los modales de éxito de tarea y de alta de plantilla, y se cancela el formulario de tarea.
3. Se oculta el panel, se muestra el acceso y se restaura Ciclo 2026-II activo.
4. Se selecciona Tareas y se actualizan los reportes ya cargados al ciclo restablecido.

**Postcondición y límite:** no se revoca una sesión Google; no se borran plantillas creadas ni filtros/caché en memoria. No hay cierre explícito de todos los diálogos nativos de reportes en esta función.

## 6. Módulos Inicio, Ciclo y Clases

### 6.1. Inicio

**Sección de bienvenida:** etiqueta «Tu espacio de investigación», título «Bienvenido a Empiria» y descripción del propósito.

**Sección de accesos:** cuatro botones: Asignar actividades → Tareas; Biblioteca de plantillas → Plantillas; Reportes de investigación → Reportes; Clases de investigación → Clases.

**Flujo INI-01:** con el panel visible, el usuario abre Inicio y pulsa un acceso; `switchTab()` muestra el destino. No hay indicadores propios, cálculos o carga de datos en Inicio.

### 6.2. Ciclo

Una tarjeta con «Gestión de Ciclos (Borrador)» y texto sobre administración de ciclos. No contiene tabla, formulario, altas, edición, cierre o reapertura. El selector de la cabecera es el único mecanismo implementado para cambiar el contexto.

**Flujo CIC-01:** abrir Ciclo → visualizar tarjeta. **Alternativa:** cambiar el ciclo desde la cabecera aplica las reglas de la sección 4.2, pero no modifica la tarjeta ni crea ciclos.

### 6.3. Clases

Una tarjeta con icono, «Gestión de Clases (Borrador)» y descripción de vinculación con Classroom por ciclo. No lista clases ni permite crear, importar, vincular o matricular participantes.

**Flujo CLA-01:** abrir Clases → visualizar tarjeta. La clase mostrada en Tareas se obtiene de `MAPEO_CLASES`; no procede de Classroom.

## 7. Módulo Tareas

### 7.1. Secciones y composición

| Sección | Elementos y comportamiento |
| --- | --- |
| Aviso de ciclo cerrado | Mensaje informativo visible solo en estado CERRADO. |
| Estado inicial | Tarjeta «Sin formulario activo» e instrucción para abrirlo. No es una lista de tareas. |
| Acción principal | «Asignar tarea», deshabilitada en ciclo cerrado. |
| Formulario | Ciclo y clase de solo lectura; título; fecha; instrucciones; hora; selector de plantilla disponible; Cancelar; Crear tarea; cierre mediante X. |
| Confirmación | Modal «¡Tarea Asignada!», texto con el título y botón Aceptar. |

### 7.2. Datos y validaciones

| Campo | Fuente o regla exacta |
| --- | --- |
| Ciclo | Contexto global, valor inicial Ciclo 2026-II. |
| Clase | Mapeo fijo del ciclo, valor inicial Investigadores 2026-II. |
| Título | Entrada del usuario con `trim()`; obligatorio. |
| Instrucciones | Entrada del usuario con `trim()`; obligatoria, leída como `descripcion`. |
| Fecha | Entrada de calendario; debe producir fecha/hora estrictamente futura. |
| Hora | Entrada de hora, inicial 23:59. Si está vacía, el cálculo utiliza 00:00. |
| Plantilla | ID no vacío; el selector ofrece solo `estado === 'disponible'`. |

La validación de futuro es `new Date(fecha + 'T' + (hora || '00:00')) > new Date()`, en la zona horaria del navegador. Una fecha vacía devuelve falso. El formulario utiliza `novalidate`: la lógica personalizada ejecuta las validaciones en orden título → instrucciones → fecha/hora → plantilla y se detiene en el primer fallo. Marca el control con `input-error`, lo enfoca y muestra un `alert`.

### 7.3. Flujo TAR-01 — asignar tarea simulada

**Actor:** usuario. **Precondiciones:** panel accesible, ciclo activo, al menos una plantilla disponible para completar la selección.

1. Abre Tareas y pulsa Asignar tarea.
2. Se actualiza el selector de plantillas y se muestra el formulario.
3. Completa título, instrucciones, fecha/hora futura y plantilla.
4. Pulsa Crear tarea; se validan los campos.
5. El botón se deshabilita y muestra «Creando…» y un indicador de espera.
6. Tras un temporizador de 1.200 ms, se busca la plantilla por ID.
7. Si existe, se cambia a `en_uso` y se le asigna el ciclo que tenga el campo de contexto al ejecutarse el temporizador.
8. Se muestra la confirmación con el título capturado, se reinicia/oculta el formulario y se actualizan biblioteca y selector.
9. El usuario cierra la confirmación con Aceptar.

**Postcondición real:** cambia el objeto de plantilla en memoria; no se guarda un objeto tarea, no se añade una entrega de reportes y no se solicita publicación a Classroom.

**Flujos alternativos:**

- **TAR-A1:** ciclo cerrado → botón deshabilitado. Si se invoca la apertura con ese estado, muestra «No se puede asignar tareas en un ciclo cerrado. Seleccione el ciclo activo.» y termina.
- **TAR-A2:** título vacío → «El título de la actividad es obligatorio.».
- **TAR-A3:** instrucciones vacías → «La descripción de la actividad es obligatoria.».
- **TAR-A4:** fecha ausente, inválida, igual o anterior al momento actual → «La fecha y hora de entrega deben ser posteriores a la actual.».
- **TAR-A5:** plantilla sin seleccionar → «Debe seleccionar una plantilla base.».
- **TAR-A6:** Cancelar o X → reinicia campos, errores y botón; vuelve al estado sin formulario.
- **TAR-A7:** sin plantillas disponibles → queda únicamente la opción inicial vacía; se necesita crear otra plantilla para completar el flujo normal.
- **TAR-A8:** cambio a ciclo cerrado durante la edición → cancela el formulario. Un temporizador ya iniciado no se cancela; el código tampoco revalida el ciclo al finalizarlo.

La función de envío no vuelve a comprobar el estado disponible de la plantilla ni el ciclo activo: esas restricciones se aplican en la interfaz de apertura/selección. No hay flujo de fallo de red de Classroom porque no existe esa solicitud.

## 8. Módulo Plantillas Base

### 8.1. Secciones y composición

1. Cabecera «Plantillas Base», descripción y botón Nueva plantilla.
2. Filtro exclusivo: Todas, Disponibles o En uso.
3. Cuadrícula de tarjetas: icono, `nombre + extension`, fecha de subida, número de hojas, estado, ciclo asociado o «Aún no asignada», enlace Abrir en Sheets.
4. Estado vacío «No hay plantillas» cuando el filtro no encuentra registros.
5. Modal Nueva Plantilla Base: nombre obligatorio, descripción opcional, explicación de apertura externa, Cancelar/X y Crear y abrir.

**Datos iniciales definidos en JavaScript:**

| ID | Nombre | Fecha | Hojas | Estado | Ciclo |
| --- | --- | --- | --- | --- | --- |
| P1 | Plantilla_Base_Proyectos_v1 | 15/03/2026 | 5 | disponible | ninguno |
| P2 | Plantilla_Informe_Financiero_v2 | 10/03/2026 | 3 | en_uso | Ciclo 2026-I |

Ambas extensiones son `.gsheet`. Sus URL contienen identificadores de demostración. No se consulta Drive para obtener fecha, hojas o disponibilidad.

### 8.2. Flujo PLA-01 — consultar biblioteca

**Precondición:** panel visible. Abrir Plantillas → renderizar el arreglo local → seleccionar filtro → mostrar coincidencias. Todas no restringe; las otras opciones comparan literalmente `estado`. Abrir en Sheets abre `urlSheets` en otra pestaña. Si no hay coincidencias se sustituye la cuadrícula por el estado vacío.

### 8.3. Flujo PLA-02 — crear plantilla simulada

**Actor:** usuario. **Precondición:** panel visible; no hay restricción por ciclo.

1. Pulsa Nueva plantilla; se abre y reinicia el formulario, con foco en el nombre.
2. Introduce nombre y opcionalmente descripción.
3. Pulsa Crear y abrir.
4. Se aplica `trim()` a ambos campos y se valida el nombre.
5. Se comprueba si algún nombre existente, convertido a minúsculas, coincide con el nuevo.
6. Se ejecuta `window.open('https://sheets.new', '_blank')`.
7. Se añade un objeto al arreglo local y se cierra/reinicia el modal.
8. Se actualizan la biblioteca y el selector de Tareas.

| Dato del objeto nuevo | Obtención exacta |
| --- | --- |
| ID | `'P' + (plantillas.length + 1)` antes de insertar. |
| Nombre/descripción | Entradas recortadas. |
| Extensión | Constante `.gsheet`. |
| Fecha de subida | `new Date().toLocaleDateString('es-PE')`, reloj del navegador. |
| Número de hojas | Constante 1; no se inspecciona la hoja abierta. |
| Estado | Constante `disponible`. |
| Ciclo asociado | `null`. |
| URL | Cadena ficticia `https://docs.google.com/spreadsheets/d/NUEVA` + `Date.now()` + `/edit`. |

**Alternativas:** nombre vacío → alerta «El nombre es obligatorio.»; nombre duplicado sin distinguir mayúsculas → «Ya existe una plantilla con ese nombre.»; Cancelar/X → cierre sin insertar. Si el navegador bloquea la apertura, el código no lo detecta y aun así añade la plantilla local.

La hoja que pueda abrir `sheets.new` no queda vinculada al objeto. No existen subida de archivos, edición, eliminación, recuperación de plantilla usada o persistencia del alta. La descripción se conserva en el objeto nuevo, pero no se muestra en la tarjeta.

## 9. Reportes: carga y preparación común

### 9.1. Contenedor

Cabecera de reportes, botón Filtros generales y Descargar para el submódulo activo, botón Abrir consolidado en Sheets, pestañas Por investigador y Por carrera y línea de investigación, mensaje de estado y botón Reintentar carga. Las pestañas también responden a flechas izquierda/derecha y Home/End.

El consolidado abre una URL fija de Google Sheets desde `abrirGoogleSheetsReporte()`. No genera una hoja ni vuelca los filtros o los resultados actuales.

### 9.2. Flujo REP-01 — cargar datos

**Actor:** usuario; participantes: navegador y Apps Script. **Precondición:** abrir Reportes por primera vez, sin carga en curso ni caché.

1. `inicializarModuloReportes()` marca carga en curso, informa «Cargando datos de investigación…», oculta Reintentar y deshabilita los selectores del módulo.
2. Si existe `google.script.run`, solicita `obtenerDatosReportes()` con manejadores de éxito/error.
3. El servidor toma `BASE_DATOS_EMPIRIA`; si no está definida usa `{ investigadores: [] }`.
4. Verifica que la base exista y que `investigadores` sea un arreglo.
5. Clona los investigadores mediante serialización JSON.
6. Exige `id` y `nombre` verdaderos en cada investigador.
7. Para `publicaciones`, `proyectos`, `eventos`, `entregas` y `dias`: si el campo es nulo/ausente, lo reemplaza por `[]`; si no es arreglo, lanza error.
8. En las cuatro colecciones de registros exige objetos no nulos que no sean arreglos. No valida todos sus campos internos, unicidad, estados o fechas.
9. Devuelve investigadores, disponibilidad y KPI de servidor.
10. El cliente valida que la respuesta tenga arreglo de investigadores, guarda solo ese arreglo en caché, prepara filtros y renderiza ambos reportes.

**Alternativas:**

- **REP-A1 — base vacía:** mensaje «No hay investigadores registrados. Los reportes se muestran sin resultados.»; no se generan investigadores de relleno.
- **REP-A2 — error del servidor o respuesta inválida:** mensaje «No se pudieron cargar los reportes. Intenta nuevamente.» y botón Reintentar. El detalle técnico del error no se presenta al usuario.
- **REP-A3 — sin API Apps Script:** procesa un arreglo vacío y muestra «Vista local: la carga de datos requiere ejecutar la aplicación en Google Apps Script.».
- **REP-A4 — caché existente o carga en curso:** la inicialización termina sin nueva solicitud. Navegar o cambiar filtros reutiliza la caché. Incluso una carga vacía queda almacenada.

En el código revisado no existe `SIMULAR_SIN_INVESTIGADORES`; para obtener el estado sin registros se utiliza `investigadores: []` en la base. Esto prevalece sobre menciones históricas de esa bandera en instrucciones.

### 9.3. KPI devueltos por el servidor y uso real

| Campo | Cálculo en `obtenerDatosReportes()` |
| --- | --- |
| `hayInvestigadores` | `investigadores.length > 0`. |
| `kpis.renacyt` | Número de investigadores cuyo `renacytCodigo` sea verdadero. |
| `kpis.journals` | Publicaciones concatenadas con `tipo === 'Journal'` y `ranking` Q1 o Q2. |
| `kpis.eventos` | Longitud de todos los eventos concatenados. |
| `kpis.cumplimiento` | Literal `'0%'`; no es un porcentaje calculado. |

Estos KPI no se utilizan en la renderización actual: `renderizarVistaReportes()` conserva únicamente `data.investigadores`. Además, la concatenación del servidor no elimina duplicados por ID. Los indicadores visibles se calculan en el cliente con las reglas siguientes.

### 9.4. Reglas comunes de registros

`registrosReporte(investigadores, campo, linea, ciclo)` realiza lo siguiente:

1. Recorre la colección indicada de cada investigador.
2. Si hay línea seleccionada y el registro tiene `linea`, exige igualdad literal; si no tiene línea, acepta según las líneas del investigador.
3. Si hay ciclo seleccionado, exige `item.ciclo === ciclo`; no lo deduce de la fecha.
4. Deduplica dentro de esa colección usando `item.id` o, si falta, `inv.id + '-' + indice`.
5. Conserva los campos de la primera aparición y reemplaza `autores` por `[inv.nombre]`.
6. Si encuentra el mismo ID, añade el nombre del investigador si aún no está en ese arreglo. No combina los otros campos de versiones posteriores.

Por tanto, `autores` en los reportes representa investigadores asociados dentro de la selección procesada, aunque la fuente contenga otro arreglo de autores. La identificación de participaciones por nombre puede confluir si dos investigadores comparten nombre.

`lineasInvestigador()` toma `inv.lineas` si es verdadero; en otro caso usa `[linea1, linea2]`. Elimina valores falsos y duplicados, y ordena con configuración española. La primera línea mostrada puede diferir del orden original `linea1`/`linea2`.

## 10. Reporte por investigador

### 10.1. Secciones

| Sección | Composición y fuente |
| --- | --- |
| Selección | Selector de investigador, con nombre e ID; los filtros generales delimitan sus opciones. |
| Filtros generales | Carrera, línea, categoría, dedicación, día, grupo RENACYT, nivel RENACYT, grupo de investigación, semillero, ciclo y periodo semestre/año. |
| Estadísticas | Cinco tarjetas: publicaciones totales, Q1–Q2, Scopus/WoS, entregas completadas/total, posición general. |
| Dedicación | Días L/Ma/Mi/J/V resaltados por pertenencia a `dias`, dedicación y categoría. Sin arreglo de días informa ausencia. |
| Perfil académico | Nombre, DNI, correo, carrera, categoría, nivel/código/grupo RENACYT, líneas y enlace CTI Vitae. Datos registrados, sin consulta externa. |
| Promedio de calidad | Velocímetro del promedio de H-index de las publicaciones filtradas. |
| Proyectos | Barras por estado de los proyectos filtrados. |
| Publicaciones | Filtros de registros, buscador, tamaño de página, CSV, contador, tabla y navegación. |
| Proyectos y Eventos | Cada sección tiene filtros, buscador, tamaño, CSV, Ver tabla, contador, tarjetas y paginación. Abrir una tarjeta muestra la tabla del registro en un diálogo. |
| Descarga | Selección de secciones, elementos y formato. |

### 10.2. Selección, periodo y filtros generales

Los filtros de persona se combinan con **Y**. Los atributos escalares requieren igualdad literal; los arreglos de días, grupos, semilleros o líneas requieren pertenencia. No se construyen opciones dependientes para todos esos filtros: se obtienen de la base completa.

Si el investigador previamente seleccionado sigue siendo una opción, se conserva; de lo contrario se elige la primera opción. Si no hay opciones se muestra «Sin opciones disponibles» y se deshabilita el selector.

El ciclo del diálogo está sincronizado con el contexto global. `sincronizarCicloInvestigador()` considera activo exclusivamente Ciclo 2026-II; cualquier otro ciclo que aparezca en los datos se trata como cerrado al seleccionarlo desde ese control.

`datosPeriodoInvestigador()` obtiene publicaciones, proyectos, eventos y entregas del investigador, aplica la línea general y restringe:

- **Semestre:** igualdad exacta con el ciclo global.
- **Año:** igualdad de los primeros diez caracteres del texto de ciclo, por ejemplo `Ciclo 2026`. No utiliza el año de `fecha`.

El periodo anual no incorpora automáticamente registros sin ciclo aunque tengan una fecha del año seleccionado.

### 10.3. Indicadores del investigador: fórmulas exactas

Sea `D` la colección del investigador después de línea y periodo, **antes** de filtros específicos, búsqueda, filtros de columna y paginación. Sea `P = D.publicaciones`.

| Indicador | Regla |
| --- | --- |
| Publicaciones totales | `P.length`, sin exigir estado Publicado. |
| Publicaciones Q1–Q2 | Cuenta `p.cuartil` exactamente Q1 o Q2; no usa `ranking` como respaldo y no exige Journal. |
| Publicaciones Scopus/WoS | Cuenta registros cuya `indexacion` cumpla `/scopus\|wos/i` (alternativas Scopus o WoS, sin distinguir mayúsculas). La cadena «Web of Science» sin «WoS» no coincide con esta regla. |
| Entregas completadas / total | Numerador: entregas con estado exactamente `Completada`; denominador: total de entregas de D. Se muestra una razón textual, no un porcentaje. |
| Posición en ranking general | 1 + cantidad de investigadores con valor RENACYT mayor, o mismo valor y mayor número de publicaciones + proyectos + eventos del periodo/línea. |

Para el ranking se procesan **todos** los investigadores de la caché, aunque los otros filtros generales hayan limitado el selector de personas. La línea seleccionada y el periodo sí se utilizan al contar las contribuciones de cada comparable.

| Nivel RENACYT literal | Valor interno |
| --- | --- |
| Distinguido | 8 |
| Nivel I | 7 |
| Nivel II | 6 |
| Nivel III | 5 |
| Nivel IV | 4 |
| Nivel V | 3 |
| Nivel VI | 2 |
| Nivel VII | 1 |
| Cualquier otro/ausente | 0 |

Todos los investigadores tienen valor numérico, incluido 0; el denominador del ranking general es el total de investigadores comparables. Los empates completos comparten posición y pueden producir saltos posteriores. La calidad media se prepara en el arreglo de comparables, pero no decide el ranking general visible.

### 10.4. Gráficos del investigador

- **H-index medio:** filtra publicaciones mediante el diálogo de publicaciones; toma las que tengan `hIndex != null`; suma `Number(hIndex)` y divide por el número de esos registros. No calcula el índice h personal a partir de citas. Esta función no aplica la validación numérica estricta de las estadísticas por carrera; una cadena vacía puede convertirse en 0 y un valor no numérico puede producir `NaN`.
- **Escala del velocímetro:** máximo entre 1 y los `Number(hIndex) || 0` de publicaciones de todos los investigadores para el mismo periodo/línea. No usa los filtros específicos de publicaciones para fijar ese máximo.
- **Aguja:** ángulo `-90 + 180 × limitar(media / maximo, 0, 1)`; tramo coloreado `100 × media / maximo`. La media se muestra con un decimal. Si no hay valores informa «Sin H-index registrado.».
- **Proyectos:** cuenta por estado después del diálogo de filtros de proyectos. Si hay proyectos, incluye Aprobado, En desarrollo y Finalizado aun con cero, y agrega otros estados registrados. La barra usa `100 × cantidad / max(1, mayor cantidad)`.

Las estadísticas del investigador no se reducen al aplicar filtros específicos de publicaciones/proyectos/eventos; las colecciones y los gráficos correspondientes sí. La búsqueda y los filtros de cabecera afectan solo las colecciones y sus exportaciones.

### 10.5. Flujo REP-INV-01

**Precondiciones:** datos cargados; para resultados poblados, al menos un investigador que coincida con los filtros.

1. Seleccionar Por investigador.
2. Abrir Filtros generales y establecer atributos, ciclo y semestre/año.
3. Seleccionar investigador entre las opciones resultantes.
4. El sistema completa ficha/dedicación y calcula estadísticas y gráficos.
5. Consultar publicaciones, proyectos y eventos; aplicar los filtros de registros si procede.
6. Buscar, ordenar, filtrar columnas, paginar, abrir un proyecto/evento o exportar.

**Alternativas:** sin persona → ficha con guiones y «Sin investigador seleccionado», estadísticas sin persona y colecciones sin resultados; sin registros del periodo → conteos cero y estados vacíos según la sección; sin URL CTI Vitae válida → enlace al portal general `https://ctivitae.concytec.gob.pe`; sin evidencia válida → «Sin evidencia adjunta». Cerrar/Listo en un diálogo de filtros solo lo cierra: los cambios se aplican inmediatamente y no se revierten.

## 11. Reporte por carrera y línea de investigación

### 11.1. Secciones

1. **Filtros generales:** carrera, línea, investigador y periodo (ciclo de cabecera o todos los ciclos registrados).
2. **Estadísticas:** selector de grupo entre indicadores principales, producción científica, investigadores, proyectos y eventos académicos; área de tarjetas o detalle.
3. **Comparativas y Rankings:** selector de una de siete comparaciones y tabla de resultados.
4. **Gráficos de producción científica:** series temporales, publicaciones en columnas, proyectos y eventos; cada gráfico tiene sus propios filtros.
5. **Investigadores:** contador y tarjetas con nombre, carrera y nivel RENACYT; cada tarjeta abre la ficha con dedicación y perfil.
6. **Publicaciones, Proyectos y Eventos:** mismas herramientas de colección que el reporte individual, con estado independiente.
7. **Descarga:** estadísticas, gráficos, investigadores, publicaciones, proyectos, eventos y comparativas.

### 11.2. Población y conjuntos de cálculo

`investigadoresCarreraReporte(true)` selecciona por carrera, pertenencia a línea y, si se elige, ID de persona. No filtra investigadores por existencia de actividad en el periodo.

Al cambiar carrera se reconstruyen sus líneas; al cambiar línea se reconstruyen los investigadores elegibles. Los selectores conservan su valor previo si sigue siendo válido; si no, pasan a la primera opción, que en estos controles es Todos/Todas.

Sea `I` esa población. Se obtienen registros deduplicados de I por línea y por ciclo, salvo que periodo sea `todos`. Luego se aplican los filtros específicos de las tres colecciones. Los resultados son `P` (publicaciones), `R` (proyectos) y `E` (eventos).

**P, R y E alimentan estadísticas y gráficos de carrera.** La búsqueda de colección, los filtros de cabecera, la paginación y los filtros propios de gráficos no reducen esas estadísticas. I no se reduce al filtrar registros; por ello los denominadores de investigadores pueden permanecer iguales.

### 11.3. Convenciones numéricas

`numeroEstadistica()` acepta valores convertibles a número, finitos y mayores o iguales a cero. Rechaza nulo, cadena vacía, booleanos, negativos, infinitos y valores no numéricos. Cero es un valor registrado.

Una suma monetaria devuelve `{valor, registrados, total}`. Suma solo importes aceptados; `valor` es `null` si no existe ninguno, incluso si la lista está vacía. `registrados` cuenta importes aceptados y `total` es la longitud de la lista.

`porcentajeEstadistica(parte, total)` devuelve `100 × parte / total` si total es verdadero, o `null` si es cero. `null` se muestra «No registrado». Los porcentajes no se limitan a 100.

El formato estadístico usa `es-PE`, hasta dos decimales, enteros cuando corresponde y PEN con cero decimales para moneda. El redondeo de presentación no cambia el valor numérico exportado.

### 11.4. Indicadores principales

| Indicador | Cálculo |
| --- | --- |
| Investigadores activos | `I.length`. «Activo» significa asociado a la selección, sin comprobación de altas, bajas o actividad efectiva. |
| Investigadores RENACYT | Cuenta nivel con `valorRenacytReporte(nivel) > 0`; porcentaje = cantidad / I.length × 100. No utiliza presencia del código como el KPI de servidor. |
| Publicaciones totales | `P.length`, sin exigir Publicado. |
| Publicaciones Q1–Q2 | Cuenta cuartil reconocido Q1/Q2 por `cuartilEstadistica()`. |
| Proyectos activos | Estado normalizado sin acentos y en minúsculas igual a aprobado, en desarrollo o en ejecucion. |
| Financiamiento total | Suma válida de `presupuesto` de R. No prueba desembolso. |
| Eventos realizados | Suma de participaciones de eventos con estado normalizado realizado; cada evento aporta `max(1, autores.length)`. Puede superar el número de eventos distintos. |
| Productividad promedio | `P.length / I.length`; sin investigadores devuelve null. |

`cuartilEstadistica()` toma `pub.cuartil || pub.ranking || ''` y reconoce solo Q1–Q4 exactos. Si `cuartil` tiene un valor verdadero no reconocido, no intenta después recuperar un ranking válido. No exige tipo Journal.

### 11.5. Grupo Producción científica

| Dato | Obtención |
| --- | --- |
| Por ciclo/semestre | Cuenta P por texto `ciclo`. |
| Evolución anual | Extrae un año 20xx de `ciclo`; si no existe, toma los primeros cuatro caracteres de `fecha` cuando comienza por cuatro dígitos y guion. |
| Por tipo | Journal → Journals; Conferencia → Conferencias; cualquier otro → Otras. |
| Por indexación | Si contiene Scopus → Scopus; si contiene WoS o Web of Science → WoS; si normalizada es «sin indexacion» → Sin indexación; otra cadena no vacía → Otras; ausente → No registrado. |
| Por cuartil | Cuatro filas Q1–Q4, con conteo por cuartil reconocido, incluso cero. |
| Con cuartil | Número de publicaciones con cuartil reconocido Q1–Q4. |
| Sin cuartil | `P.length - conCuartil`. |
| H-index promedio | Media de H-index numéricamente válidos en publicaciones tipo Journal o Conferencia. Excluye otros tipos. |
| H-index de revistas/conferencias | Misma media restringida respectivamente a Journal o Conferencia. Sin valores aceptados → null. |
| Q1–Q2 / cuartil conocido | `100 × publicacionesQ12 / conCuartil`. |
| Por estado | Cuenta P por `estado`, sin reclasificar estados. |

En las agrupaciones estadísticas, las claves vacías se sustituyen por «No registrado» y se ordenan alfabéticamente en español con comparación numérica.

### 11.6. Grupo Investigadores

| Dato | Obtención |
| --- | --- |
| Por carrera, nivel, categoría y dedicación | Distribuciones de I por el campo registrado correspondiente. |
| Con publicaciones | Investigadores de I cuyo nombre aparece en autores de al menos una publicación de P. |
| Sin publicaciones | `I.length - conPublicaciones`. |
| Participan en proyectos | Investigadores de I cuyo nombre aparece en autores de al menos un proyecto de R. |
| Contribuciones por investigador | Suma, para cada persona de I, del número de registros de P + R + E que la incluyen en autores; divide entre I.length. Una contribución compartida cuenta para cada persona asociada. |
| Actividad por ciclo | Para cada ciclo no vacío de P + R + E, número de personas de I presentes en autores de al menos uno de sus registros. |

Estas distribuciones no reconstruyen un estado administrativo histórico: no existen fechas de alta/baja utilizadas por el cálculo.

### 11.7. Grupo Proyectos

| Dato | Obtención |
| --- | --- |
| Internos/externos y estado | Agrupa R por `tipo` y `estado` registrados. |
| Iniciados por ciclo | Obtiene fecha con `fechaInicio || inicio || fecha`; si cumple patrón de fecha y mes 1–12, meses 1–6 → Ciclo año-I, 7–12 → Ciclo año-II. Cuenta por ese ciclo derivado. |
| Finalizados por ciclo | Solo estado normalizado finalizado; fecha `fechaFin || fin`, convertida a ciclo con la misma regla. |
| Finalizados sin fecha de fin | Finalizados cuya fecha de fin no permite derivar ciclo. No se utiliza la fecha general como sustituto del cierre. |
| Presupuesto total | Suma válida de presupuesto de R; muestra cantidad de presupuestos registrados frente al total. |
| Presupuesto ejecutado | Suma válida de ejecutado de R, independiente de que exista presupuesto en ese registro. |
| Porcentaje de ejecución | Selecciona únicamente proyectos con presupuesto y ejecutado válidos; `100 × suma(ejecutado de pares) / suma(presupuesto de pares)`. No es la media de porcentajes individuales. |
| Registros con ambos importes | Número de proyectos seleccionados para esa razón. |
| Presupuesto externo | Suma válida de presupuesto en proyectos cuyo tipo sea exactamente Externo. |
| Tasa de finalización | `100 × finalizados normalizados / R.length`. |
| Área temática | Agrupa por `area || linea`. |
| Entidad financiadora | Agrupa por `financiador`. |
| Presupuesto por carrera/línea | Rankings comparativos descritos en 11.9; usan su propia población global. |

`cicloFechaEstadistica()` comprueba el patrón y el mes, pero no valida completamente si el día existe en el calendario. Es una validación distinta de la usada en los gráficos temporales.

`avance` es un porcentaje registrado: no se calcula como ejecutado/presupuesto. Se usa para mostrar/ordenar cuando corresponde; puede diferir de la ejecución financiera.

### 11.8. Grupo Eventos académicos

| Dato | Obtención |
| --- | --- |
| Total de participaciones | Suma `max(1, autores.length)` de todos los eventos de E, incluidos Programado y Cancelado si no se filtraron. |
| Eventos realizados por ciclo | Cuenta eventos distintos con estado normalizado realizado, agrupados por `ciclo`; aquí no suma autores. |
| Tipo, rol y modalidad | Agrupa E por el respectivo campo. |
| Nacional / Internacional | Toma `ambito || alcance || ''`, normaliza y acepta nacional/internacional. Otros o ausentes → Ámbito no registrado. No lo infiere del lugar o del país. |

### 11.9. Comparativas y rankings

Las comparativas se reconstruyen desde **todos los investigadores de la caché**, agrupados por cada carrera y por cada línea. No se limitan a la carrera, línea o persona elegida en los filtros generales de este reporte. Sí usan el periodo de carrera y sus filtros específicos de publicaciones, proyectos y eventos. Una persona puede pertenecer a varias líneas; los totales de líneas no son necesariamente sumables.

| Opción visible | Resultado y cálculo |
| --- | --- |
| Carreras por publicaciones | Conteo deduplicado de publicaciones de cada carrera. |
| Líneas por publicaciones Q1–Q2 | Conteo Q1/Q2 con `cuartilEstadistica()` para cada línea. |
| Carreras por proyectos finalizados | Cuenta estado exactamente `Finalizado`; esta comparación es literal, a diferencia del grupo estadístico normalizado. |
| Líneas por financiamiento | Suma válida de presupuestos de cada línea. |
| Productividad por carrera | Publicaciones / investigadores de cada carrera. |
| Investigadores RENACYT por carrera | Porcentaje con nivel reconocido > 0 dentro de cada carrera. |
| Producción comparativa entre ciclos | Filas carrera + ciclo con cantidades de publicaciones, proyectos y eventos. |

El orden inicial de los rankings es descendente por valor, con null tratado como -1 y desempate por nombre en español. No se recortan a un «top» fijo ni se asignan puestos numéricos. Existe la utilidad `habilitarOrdenTablasReportes()` para añadir orden por cabecera a tablas generales, pero no se invoca en el código revisado. Por tanto, los rankings muestran el orden inicial descrito; no se considera implementada su activación interactiva. Las tablas de colecciones sí tienen manejadores propios de orden.

### 11.10. Flujo REP-CAR-01

**Precondición:** datos cargados.

1. Abrir la pestaña Por carrera y línea de investigación.
2. Elegir carrera, línea, persona opcional y periodo desde Filtros generales.
3. El sistema determina I y las tres colecciones, aplica filtros específicos y recalcula las estadísticas.
4. Elegir grupo estadístico y comparativa sin volver a consultar el servidor.
5. Consultar gráficos, perfiles y colecciones; aplicar filtros de gráfico o colección.
6. Descargar secciones o un CSV de colección si se necesita.

**Alternativas:** ninguna persona asociada → lista vacía y contador cero; registros sin coincidencias → colecciones y gráficos vacíos; denominador cero → No registrado en razones; ningún importe válido → No registrado en sumas; cerrar el diálogo conserva los filtros ya aplicados.

## 12. Filtros y representación de colecciones en ambos reportes

### 12.1. Diálogos de filtros de registros

| Colección | Filtros implementados | Orden disponible |
| --- | --- | --- |
| Publicaciones | Tipo, estado, indexación, cuartil, ranking de conferencia, H-index mínimo/máximo, lugar, presencia de evidencia. | Fecha descendente, impacto/H-index descendente, cuartil ascendente. |
| Proyectos | Financiamiento Interno/Externo, estado, tipo de proyecto, área, rol, financiador, presupuesto mínimo/máximo, evidencia. | Fecha, presupuesto o avance, descendentes. |
| Eventos | Estado, tipo, modalidad, rol, lugar, evidencia. | Fecha descendente. |

Los filtros de texto comparan exactamente el campo registrado. «País o ciudad» filtra el campo **`lugar`**, no una búsqueda parcial sobre `pais` o `ciudad`. Cuartil usa `cuartil` y ranking de conferencia usa `rankingConferencia`, sin respaldo en `ranking`.

Los límites son inclusivos. Si existe al menos un extremo y el campo numérico es nulo/ausente, se excluye el registro. La comparación utiliza `Number()` y no la validación estricta `numeroEstadistica()`; no hay normalización automática de un mínimo mayor que el máximo.

Con evidencia significa que `urlEvidencia` es una cadena que cumple `^https?://[^\s]+$`, sin distinguir mayúsculas. No verifica respuesta HTTP, accesibilidad, contenido, ni la presencia de documentos en otros campos.

Las opciones se obtienen del catálogo de todos los investigadores, sin depender de persona, ciclo, búsqueda o página, y se unen a catálogos fijos. Por ello pueden existir opciones que no produzcan coincidencias en la selección actual.

**Catálogos fijos:**

- Publicación: Journal, Conferencia, Editor, Otro; estados En preparación, En revisión, Aceptado, Publicado, Rechazado; indexaciones Scopus, WoS, Otras, Sin indexación; cuartiles Q1–Q4.
- Proyecto: Interno, Externo; Aprobado, En desarrollo, Finalizado; Investigación básica/aplicada; roles Principal, Responsable, Integrante.
- Evento: Realizado, Programado, Cancelado; tipos Conferencia, Congreso, Taller, Revisión, Seminario, Simposio, Jornada, Curso, Otro; modalidades Virtual, Presencial, Híbrida, Otra; roles Expositor, Ponente, Organizador, Revisor, Asistente.

Los valores adicionales de la base también pueden aparecer. No existe un catálogo fijo exclusivo que rechace otros valores al cargar datos.

### 12.2. Campos de tabla y detalles

| Colección | Columnas base |
| --- | --- |
| Publicaciones | Título, Tipo, Revista/Evento, Indexación, Calidad, H-index, Fecha, Estado. |
| Proyectos | Código, Título, Tipo de proyecto, Financiamiento, Rol, Estado, Inicio/Fin, Presupuesto. |
| Eventos | Evento, Tipo, Rol, Modalidad, Fecha, Ubicación, Estado. |

Las tablas añaden los campos complementarios siguientes, y descubren otros campos presentes en los registros. No son tablas limitadas a las columnas base.

- Publicaciones: autores, línea, JIF, JCI, país, ciudad y enlace de publicación.
- Proyectos: objetivos, línea, área, financiador, recursos humanos, ejecutado, resultados, documentos de control y actividades.
- Eventos: enlace del evento, imágenes y documentación.
- Otros campos registrados pueden añadir ID, ciclo, descripción, fechas, avance, ámbito, etc. `urlEvidencia` se presenta como acción de evidencia, en lugar de columna descubierta automáticamente. JIF/JCI mayúsculos no generan duplicado si ya existe la columna equivalente minúscula.

**Campos compuestos calculados por `datoColeccionInv()`:**

| Campo | Regla |
| --- | --- |
| Código | Primer valor verdadero entre `codigo`, `numeroProyecto`, `id`, o vacío. |
| Calidad | `cuartil || rankingConferencia || ranking || ''`. |
| Periodo | Concatena inicio (`fechaInicio || inicio || fecha`) y fin (`fechaFin || fin`) existentes con ` / `. La celda visual representa también el extremo ausente como No registrado. |
| Ubicación | Une país y ciudad no vacíos con coma; si no existen usa lugar. |
| JIF/JCI | Usa `jif`/`jci` salvo nulo/ausente; entonces `JIF`/`JCI`. |

El resto son valores registrados. JIF, JCI, H-index, presupuesto, ejecutado y avance no se consultan en servicios bibliométricos ni se recalculan al abrir el registro.

En las tarjetas de proyecto/evento se muestran título, código o tipo, fecha general y estado. Abrirlas muestra la tabla de un solo registro, con campos complementarios y evidencia. Ver tabla abre la página actual de la colección en el mismo diálogo, con navegación; no abre de una vez todos los resultados.

Las URL válidas se muestran como enlaces. Los arreglos y objetos pueden representarse como listas/detalles anidados. Los nulos o cadenas vacías se muestran «No registrado» en colecciones; otras zonas usan guion o mensajes específicos. Las fechas de celda se transforman de `AAAA-MM-DD` a `DD/MM/AAAA` por patrón textual; no es una validación completa de calendario.

### 12.3. Búsqueda, filtros de cabecera y orden

La búsqueda compara una cadena compuesta por título, nombre, código, número de proyecto, ID y autores. Recorta la consulta, elimina diacríticos y pasa a minúsculas. No busca en todos los campos del registro.

Los filtros de cabecera admiten varias opciones por columna: **O** entre los valores de una misma columna y **Y** entre columnas. Cero opciones significa sin restricción. Sus comparaciones utilizan la representación textual del dato compuesto o registrado. Mostrar todos limpia únicamente la columna activa.

Cabeceras con filtro: tipo, tipoProyecto, indexacion, calidad, estado, rol, modalidad, linea, area, financiador, pais, ciudad, ciclo y ubicacion.

Cabeceras con orden: titulo, codigo, id, evento, nombre, fecha, fechaInicio, fechaFin, periodo, hIndex, jif, jci, presupuesto, ejecutado y avance. Las restantes son de lectura. El orden alterna ascendente/descendente, coloca ausentes al final en ambos sentidos, compara números como números si ambos valores son numéricos y el resto mediante comparación española con opción numérica.

Cada colección de cada submódulo tiene su propio estado de búsqueda, página, tamaño, orden y filtros de cabecera. Actualizar los datos reinicia la página a 1, pero conserva búsqueda y filtros de cabecera. Cambiar el orden base del diálogo elimina la columna de orden específica anterior.

### 12.4. Paginación y contadores

Tras filtros de diálogo, se aplican búsqueda, filtros de cabecera y orden. Sea N el resultado completo y T el tamaño de página:

- T permitido: 10, 25 o 50; cualquier otro valor se convierte en 10.
- Páginas: `max(1, ceil(N / T))`.
- Página actual: se limita al intervalo 1…páginas.
- Índice inicial: `(pagina - 1) × T`.
- Registros visibles: segmento desde ese índice hasta antes de `inicio + T`.
- Contador: N resultados, más número de columnas con selección de filtro si corresponde.
- Los botones anterior/siguiente se deshabilitan en los extremos. Con cero registros sigue existiendo página 1/1.

Buscar, cambiar tamaño, ordenar o cambiar filtros de columna vuelve a página 1. Ni paginar ni buscar recalcula los KPI. La exportación de colección toma los N resultados, no solo la página visible.

## 13. Gráficos por carrera: filtros y cálculos

### 13.1. Alcance y controles

Parten de P, R y E ya filtrados por contexto y diálogos de colección. Cada gráfico tiene estado independiente y controles de temporalidad (ciclo, mes, semana o día), rango de ciclos inicial/final y, si corresponde, rango de meses/semanas/días. Las series permiten escoger publicaciones, proyectos totales, internos, externos y eventos; puede desmarcarse todo.

| Gráfico | Agrupación inicial | Otras agrupaciones |
| --- | --- | --- |
| Series temporales | Ciclo | Mes, semana y día; selección de indicadores. |
| Publicaciones | Ranking/calidad | Indexación, tipo, estado, periodo. |
| Proyectos | Financiamiento (`tipo`) | Estado, tipo de proyecto, periodo. |
| Eventos | Estado | Tipo, modalidad, rol, periodo. |

Los cambios se aplican inmediatamente. Restablecer limpia rangos y devuelve temporalidad ciclo, cinco indicadores en series y agrupación inicial en los otros gráficos. Cambiar temporalidad limpia los extremos de fecha. Si se invierte un rango, se vacía el extremo anterior opuesto al recién modificado.

Los rangos de ciclo comparan textos con `localeCompare('es', {numeric:true})`; no se calculan fechas de inicio/fin de un ciclo académico. Los filtros no pueden recuperar registros excluidos previamente por el periodo general: para comparar ciclos completos hay que permitirlos primero en Filtros generales.

### 13.2. Fechas y periodos

- Publicaciones/eventos usan `fecha`; proyectos usan `fechaInicio || fecha` (en este gráfico no se usa el alias `inicio`).
- Se acepta únicamente fecha real de calendario `AAAA-MM-DD`, validada al convertir a UTC y comparar la cadena de vuelta.
- Mes: primer día del mes; límites inclusivos hasta su último día.
- Semana: lunes a domingo; numeración semanal por el año del jueves de la semana, con identificación `AAAA-Wnn`.
- Día: fecha individual.
- Sin fecha válida: se excluye de mes/semana/día; aún puede participar en la vista por ciclo.
- Un rango fecha inválido excluye los registros de esa vista; los controles validan los valores antes de almacenarlos.

### 13.3. Series y agrupaciones

Por ciclo se construye la unión de los ciclos existentes en las tres colecciones; ausencia de ciclo → «Sin ciclo registrado». Cada fila contiene conteos de publicaciones, proyectos, internos (tipo exacto Interno), externos (Externo) y eventos. No se insertan automáticamente ciclos ausentes.

Por fecha se agrupan registros en el inicio de su mes/semana/día y se ordenan cronológicamente. Se completan con ceros los intervalos entre el primer y último periodo con registros; no se prolonga la serie hasta extremos de filtro sin datos.

Las agrupaciones categóricas cuentan un registro por grupo; ausencia de atributo → «Sin registrar». Ranking de publicaciones usa el campo compuesto Calidad. Agrupar por periodo usa las filas temporales y el conteo de la colección respectiva.

### 13.4. Representación calculada

- **Columnas y barras:** altura/anchura porcentual = `100 × valor / max(1, valor máximo de grupos)`; las etiquetas muestran cantidades reales.
- **Pasteles:** omiten grupos de valor no positivo. Total = suma de grupos; arco proporcional = `100 × valor / total`; porcentaje de leyenda = `Math.round(100 × valor / total)`. Los porcentajes redondeados pueden no sumar 100. Proyectos/eventos usan barras cuando agrupan por periodo.
- **Series:** escala vertical máxima entre 1 y todos los valores de indicadores seleccionados; coordenada vertical `110 - 90 × valor / maximo`. Los puntos se espacian uniformemente por periodo y el gráfico amplía su ancho según la cantidad de filas.
- **Estados vacíos:** sin contribuciones, sin datos o solicitud de seleccionar al menos un indicador, según corresponda. Ninguna serie usa entregas ni mide cumplimiento.

**Flujo REP-GRA-01:** con carrera renderizada, abrir filtro de un gráfico → cambiar temporalidad/rangos/agrupación/indicadores → redibujar → cerrar o restablecer. Alternativas: todo desmarcado en series muestra aviso; sin fechas válidas produce vacío; rango invertido libera el extremo opuesto.

## 14. Exportaciones y descargas

### 14.1. CSV de colección

**Flujo EXP-01:** aplicar contexto/filtros/búsqueda/orden → pulsar CSV en Publicaciones, Proyectos o Eventos → generar archivo con todos los registros coincidentes → actualizar contador con el número exportado.

Incluye columnas base, complementarias, descubiertas y campos originales adicionales, incluida evidencia si forma parte del registro. Los campos compuestos se resuelven con las mismas reglas de tabla. Los objetos/arreglos se serializan como JSON. No crea gráficos ni exporta solo las filas de la página.

### 14.2. Descarga de reporte completo o parcial

**Actor:** usuario. **Precondiciones:** datos preparados; en el reporte individual debe existir investigador seleccionado. En carrera puede generarse un reporte de resultados vacíos.

1. Pulsa Descargar.
2. El sistema prepara las secciones disponibles y sus elementos; al abrir de nuevo reconstruye los controles de elementos con selección inicial marcada.
3. Selecciona secciones, despliega sus elementos y elige indicadores o campos concretos.
4. Selecciona HTML, CSV, JSON o PDF y pulsa Generar reporte.
5. Verifica que exista alguna sección marcada y después algún elemento incluido.
6. Construye y filtra el objeto exportable, conservando los valores derivados de los filtros aplicables.
7. Descarga el archivo o abre el documento para impresión.

**Secciones individuales:** dedicación, ficha, estadísticas, gráficos, publicaciones, proyectos y eventos.

**Secciones de carrera:** estadísticas, gráficos, investigadores, publicaciones, proyectos, eventos y comparativas. Elegir un grupo estadístico visible no limita por sí solo la descarga: la exportación dispone del conjunto de grupos; los elementos elegidos determinan qué se incluye.

**Composición del objeto individual:** título, fecha/hora ISO del navegador, `demostracion: true` y secciones. La ficha exporta ID, nombre, DNI, correo, carrera, RENACYT, URL CTI válida registrada y líneas; la dedicación exporta días, tipo y categoría. Las estadísticas se toman del texto de las tarjetas ya renderizadas. Los gráficos exportan media H-index y conteos por estado de proyectos. Las colecciones usan todos los resultados después de búsqueda/filtros de cabecera, sin recorte por página.

**Composición del objeto de carrera:** título, fecha/hora ISO, carrera/línea o Todas, periodo, ciclo y secciones. Estadísticas y comparativas se toman de `estadisticasCarreraActual`; investigadores contiene los objetos completos de la población I antes de la selección de campos de exportación. Gráficos incluye filtros, filas temporales y registros de publicaciones/proyectos/eventos según el filtro propio de cada gráfico. Las filas temporales del objeto incluyen todos sus campos de conteo; los indicadores seleccionados gobiernan la representación visual de series.

En las colecciones, la elección de elementos proyecta campos de los objetos; no transforma automáticamente todos ellos a los campos visuales compuestos. En estadísticas individuales se eligen tarjetas; en estructuras anidadas se eligen rutas de indicadores. Los controles de una sección desmarcada quedan deshabilitados.

| Formato | Comportamiento exacto |
| --- | --- |
| HTML | Documento autónomo con estilos, tablas y representaciones de gráficos tomadas de la vista actual. Fecha de generación y, en carrera, contexto general. |
| CSV de reporte | Tabla vertical con cabeceras Sección, Registro, Campo, Valor. Recorre objetos/arreglos por rutas; no equivale al CSV tabular de colección. |
| JSON | `JSON.stringify(reporte, null, 2)`, conserva estructura y tipos serializables. |
| PDF | Abre una ventana con el HTML, espera fuentes y llama a `print()`. El usuario elige Guardar como PDF; no se produce un PDF binario en el servidor. |

El HTML divide tablas extensas en bloques de cuatro campos más correlativo, repite cabeceras y configura A4 vertical. Las series visuales largas se continúan en tramos. En CSV las comillas se duplican, las celdas se entrecomillan y textos que comienzan por `=`, `+`, `@`, `-`, tabulador o retorno se prefijan con apóstrofo para evitar fórmulas. El CSV de reporte incorpora BOM UTF-8 y finales CRLF.

Los archivos de reporte se nombran `reporte-investigador-ID.formato` o `empiria-reporte-carrera.formato`. Para formatos descargables se usa Blob, enlace temporal y revocación de URL tras un segundo.

**Alternativas EXP-A:**

- Sin investigador al abrir su descarga → alerta «Selecciona un investigador para descargar su reporte.».
- Sin sección marcada → «Selecciona al menos una sección.».
- Sin elementos incluidos → «Selecciona al menos un elemento dentro de las secciones.».
- Ventana PDF bloqueada → «Permite abrir ventanas emergentes para imprimir o guardar el PDF.».
- PDF iniciado → instrucción «En la ventana de impresión elige Guardar como PDF.»; cancelar la impresión no produce una confirmación de archivo guardado.
- Cancelar el diálogo → lo cierra, sin generar archivo.

## 15. Modelo de datos utilizado

### 15.1. Base e investigador

La base es un objeto con `version` e `investigadores`. `version` es metadata registrada y no interviene en los cálculos. Cada investigador contiene:

| Campo o grupo | Uso |
| --- | --- |
| `id`, `nombre` | Identidad mínima exigida; selección y asociación de autoría. |
| `dni`, `correo`, `carrera` | Ficha; carrera también filtra y agrupa. |
| `dedicacion`, `categoria` | Ficha/dedicación, filtros y distribuciones. |
| `renacytNivel`, `renacytCodigo`, `renacytGrupo` | Ficha y filtros; nivel determina clasificación/ranking cliente; código solo determina el KPI RENACYT del servidor. |
| `ctivitaeUrl` | Enlace opcional; portal general como respaldo visual. |
| `linea1`, `linea2` o `lineas` | Asociación temática, filtros y agrupaciones. |
| `dias` | Lista de abreviaturas de dedicación; no representa horas ni control de asistencia. |
| `grupos`, `semilleros` | Filtros generales individuales. |
| `publicaciones`, `proyectos`, `eventos`, `entregas` | Colecciones para consulta/cálculo. |

La base revisada contiene once investigadores ficticios. La aplicación no mantiene catálogos editables de carreras, líneas o personas: obtiene opciones a partir de los registros.

### 15.2. Registros de actividad

| Colección | Campos utilizados |
| --- | --- |
| Publicación | `id`, `titulo`, `evento`, `tipo`, `ranking`, `cuartil`, `rankingConferencia`, `hIndex`, `jif`/`JIF`, `jci`/`JCI`, `fecha`, `ciclo`, `linea`, `indexacion`, `estado`, `autores`, `pais`, `ciudad`, `lugar`, `urlPublicacion`, `urlEvidencia`. |
| Proyecto | `id`, `codigo`/`numeroProyecto`, `titulo`, `tipo`, `tipoProyecto`, `estado`, `rol`, `fecha`, `fechaInicio`/`inicio`, `fechaFin`/`fin`, `ciclo`, `linea`, `descripcion`, `objetivos`, `area`, `financiador`, `presupuesto`, `ejecutado`, `avance`, `recursosHumanos`, `resultados`, `documentosControl`, `actividades`, `urlEvidencia`. |
| Evento | `id`, `titulo`, `tipo`, `estado`, `fecha`, `ciclo`, `linea`, `rol`, `modalidad`, `ambito`/`alcance`, `pais`, `ciudad`, `lugar`, `descripcion`, `urlEvento`, `imagenes`, `documentacion`, `urlEvidencia`. |
| Entrega | `id`, `titulo`, `fecha`, `ciclo`, `linea`, `estado`, opcionalmente `urlEvidencia`; solo alimenta la razón completadas/total individual en la interfaz actual. |

No todos los registros incluyen todos los campos. La presentación descubre campos adicionales; su presencia no implica una validación ni una fórmula nueva. No hay CRUD de estas colecciones en la interfaz.

## 16. Ejemplos trazables de cálculo

Los ejemplos suponen la base entregada, Ciclo 2026-II y ausencia de filtros específicos o búsquedas.

**Investigador ID 1, Dr. Carlos Alberto Mendoza:**

- Publicaciones del semestre: PUB-1 → total 1.
- Q1–Q2 del semestre: PUB-1 es conferencia A1 y no tiene cuartil → 0.
- Scopus/WoS: PUB-1 tiene Scopus → 1.
- Entregas: ENT-1-0 está Pendiente → 0 / 1.
- Calidad media: H-index 14 de PUB-1 → 14,0; no se usa el H-index 22 de PUB-2 porque pertenece a 2026-I.
- Proyectos: PRO-1A está En desarrollo → una contribución en ese estado; presupuesto 20.000, ejecutado 9.000, avance registrado 45.

**El mismo investigador en Año 2026:** PUB-1 y PUB-2 → dos publicaciones, una Q1–Q2, media individual `(14 + 22) / 2 = 18`; entregas 1 / 2. PUB-3 es de 2025 y queda fuera.

**Carrera filtrada a investigador ID 1, ciclo actual:** población I de 1; P de 1; R de 1; E de 2. Productividad = 1/1 = 1; financiamiento = 20.000 PEN; ejecución = 9.000/20.000 × 100 = 45%; proyectos activos = 1; eventos realizados = 1 participación; total de participaciones = 2, porque incluye también el evento programado. Las comparativas siguen utilizando todas las carreras y líneas de la base.

Estos resultados son ejemplos de la lógica implementada, no una validación de datos reales ni valores fijos que deban permanecer si se modifica la base.

## 17. Límites funcionales y diferencias que deben conservarse al interpretar resultados

1. Acceso Google, publicación en Classroom y vinculación de nuevas plantillas son simulaciones o aperturas de enlaces; no integraciones de escritura completas.
2. Ciclos y Clases son borradores. No existen creación/cierre de ciclo ni administración de clases desde esas vistas.
3. Crear tarea no crea entregas, proyectos ni publicaciones en reportes. Los dos conjuntos de datos están separados.
4. «Activo» en KPI de investigadores significa población seleccionada; en proyectos depende de estados; en ciclo es una bandera fija. Son tres significados distintos.
5. RENACYT de servidor usa presencia de código; RENACYT de estadísticas/ranking cliente usa nivel reconocido.
6. Q1–Q2 individual exige `cuartil`; carrera admite respaldo en `ranking`. El dato visual Calidad admite además ranking de conferencia.
7. La media H-index individual incluye cualquier tipo con dato no nulo y conversión numérica; la de carrera restringe Journal/Conferencia y números válidos no negativos.
8. El indicador individual Scopus/WoS y la clasificación de indexación por carrera tienen reglas textuales diferentes.
9. Eventos realizados del KPI de carrera suma participaciones; su distribución por ciclo cuenta eventos distintos.
10. Los filtros de registro en el reporte individual no cambian sus cinco tarjetas; en carrera sí cambian las estadísticas derivadas de colecciones.
11. Búsqueda y filtros de cabecera reducen colecciones/exportaciones, no los KPI ni los gráficos. Filtros propios de gráfico solo reducen su gráfico y los datos de ese gráfico exportados.
12. Los presupuestos y ejecución no se calculan desde transacciones; avance no se deriva de importes. No existe consolidación financiera externa.
13. No hay comprobación de existencia de enlaces ni de acreditación RENACYT, indexación, cuartil o métricas bibliométricas.
14. Las comparativas parten de la base global, incluso al seleccionar una sola carrera o persona en el reporte principal.
15. La caché no se invalida mediante un botón de actualización tras una carga exitosa; para obtener cambios de base se necesita una nueva carga del documento.
16. No hay un porcentaje de cumplimiento visible calculado a partir de las entregas; el 0% de servidor es literal y no se consume.

## 18. Glosario de términos

| Término | Significado específico en este proyecto |
| --- | --- |
| Empiria | Nombre visible de la aplicación de gestión de investigación. |
| SGIU | Denominación usada en las instrucciones del repositorio para la demostración; el código no define su expansión. |
| Módulo | Vista principal accesible desde la barra lateral. |
| Submódulo de reportes | Panel individual o por carrera/línea, dentro de Reportes. |
| Sección | Bloque de una vista: ficha, estadísticas, publicaciones, etc. |
| Actor | Persona o sistema que participa en un flujo; no implica un rol autorizado implementado. |
| Precondición | Estado que debe existir para ejecutar el flujo descrito. |
| Flujo básico | Secuencia normal de acciones y respuestas implementadas. |
| Flujo alternativo | Rama por validación, ausencia de datos, cancelación o condición distinta. |
| Ciclo | Etiqueta de periodo académico, por ejemplo Ciclo 2026-II; generalmente se compara como texto. |
| Semestre | En reporte individual, registros del ciclo seleccionado exacto. |
| Año | En reporte individual, registros cuyo prefijo de ciclo coincide hasta el año. |
| Clase | Nombre fijo vinculado a un ciclo por `MAPEO_CLASES`, sin objeto Classroom consultado. |
| Tarea | Actividad que el formulario permite simular; no se persiste como entidad. |
| Entrega | Registro de `entregas` en la base, independiente de las tareas simuladas. |
| Plantilla base | Objeto local con nombre, URL y disponibilidad para el formulario de tareas. |
| Disponible | Plantilla seleccionable porque su estado es `disponible`. |
| En uso | Plantilla con estado `en_uso`; el selector de nuevas tareas la excluye. |
| Investigador | Registro de persona con afiliación, clasificación y colecciones de actividad ficticias. |
| Carrera | Campo de afiliación profesional usado como filtro y agrupación. |
| Línea de investigación | Asociación temática de investigador/registro, utilizada para filtrar y comparar. |
| Dedicación | Campo de modalidad de dedicación y días declarados; no horas medidas. |
| Categoría | Clasificación docente registrada, como Principal, Asociado o Auxiliar. |
| RENACYT | Registro Nacional Científico, Tecnológico y de Innovación Tecnológica; en la aplicación sus campos son datos de demostración sin verificación. |
| CTI Vitae | Portal de consulta de perfiles al que se ofrecen enlaces; no fuente de importación implementada. |
| Grupo RENACYT | Campo textual de clasificación mostrado en ficha y filtros, distinto del grupo de investigación. |
| Grupo de investigación | Elemento del arreglo `grupos`, utilizado en filtros individuales. |
| Semillero | Elemento del arreglo `semilleros`, utilizado en filtros individuales. |
| Publicación | Registro de producción científica; puede estar en preparación, revisión u otro estado, no solo publicado. |
| Journal | Valor literal para publicación en revista. |
| Conferencia | Valor literal de publicación; también puede ser tipo de evento en otra colección. |
| Revista / Evento | Campo `evento` de una publicación que identifica el medio. |
| Indexación | Etiqueta registrada, por ejemplo Scopus o WoS; no validada externamente. |
| Scopus / WoS | Etiquetas de bases de indexación usadas por filtros y conteos; WoS corresponde a Web of Science. |
| Cuartil Q1–Q4 | Clasificación registrada utilizada para agrupación y conteo de calidad. |
| Ranking de conferencia | Clasificación registrada separada del cuartil, como A1 o A2. |
| Calidad | Campo compuesto visual de cuartil/ranking; en el velocímetro se refiere a la media de H-index de medios. |
| H-index | Métrica numérica registrada por publicación/medio. El proyecto no calcula un índice h personal por citas. |
| JIF / JCI | Métricas bibliométricas registradas (Journal Impact Factor / Journal Citation Indicator); solo se muestran/exportan. |
| Proyecto interno/externo | Clasificación de financiamiento por `tipo`; no identifica por sí sola al financiador. |
| Tipo de proyecto | Campo separado, por ejemplo Investigación básica o aplicada. |
| Presupuesto | Importe registrado de financiamiento del proyecto. |
| Ejecutado | Importe registrado como ejecución, sin transacciones que lo reconstruyan. |
| Avance | Porcentaje registrado del proyecto, independiente del cálculo financiero. |
| PEN | Moneda utilizada para presentar importes, sol peruano. |
| Evento académico | Registro de actividad con fecha, estado, modalidad y rol. |
| Participación | Asociación investigador-evento; un evento puede aportar varias participaciones por sus autores deduplicados. |
| Rol | Campo de participación en proyecto/evento, distinto del rol de acceso a la aplicación. |
| Ámbito | Clasificación nacional/internacional expresamente registrada en evento. |
| Evidencia | URL HTTP/HTTPS válida por patrón en `urlEvidencia`; no documento verificado. |
| KPI | Indicador principal calculado o devuelto; su significado depende de la fórmula documentada. |
| Productividad | Publicaciones de la selección divididas entre investigadores asociados. |
| Contribución | Asociación de una persona a publicación, proyecto o evento; cuenta por persona para el promedio de contribuciones. |
| Ranking general | Posición individual por nivel RENACYT y, en empate, cantidad de contribuciones del periodo/línea. |
| Comparativa | Recuento o razón por todas las carreras/líneas de la base con periodo y filtros específicos. |
| Deduplicación | Fusión de apariciones de un mismo ID dentro de una colección, conservando el primer registro y acumulando nombres asociados. |
| Caché | Copia de investigadores conservada en memoria del navegador tras la primera carga. |
| Filtro general | Condición de persona, afiliación o periodo que determina el contexto del reporte. |
| Filtro de registro | Condición específica de publicaciones, proyectos o eventos. |
| Filtro de cabecera | Selección multivalor de una columna que limita su colección. |
| Temporalidad | Unidad de agrupación del gráfico: ciclo, mes, semana o día. |
| UTC | Referencia horaria usada para evitar desplazamientos de fechas en gráficos temporales. |
| Histograma | Nombre interno del gráfico de publicaciones; representa conteos por categorías o periodo. |
| Paginación | Recorte de presentación en grupos de 10, 25 o 50 resultados. |
| CSV | Archivo de valores separados por comas; colección tabular o reporte vertical según el botón usado. |
| JSON | Archivo estructurado con datos y secciones seleccionadas. |
| HTML autónomo | Documento descargable con estilos y contenido para consulta visual. |
| PDF | Salida que el usuario obtiene mediante la impresión del navegador. |
| Datos de demostración | Registros ficticios sin acreditación de identidades, métricas o enlaces reales. |
