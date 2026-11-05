# **SIS-INVESTIGACIÓN**

# **CU-005: Generar reporte de seguimiento de investigación**

# **Caso de Uso: Generar reporte de seguimiento de investigación**

## **1\. Datos generales del caso de uso**

### 

### **1.1. Breve descripción**

El Director de Investigación accede al módulo Reportes de Empiria y consulta la información académica y de seguimiento de investigación correspondiente al ciclo seleccionado. El sistema permite realizar dos modalidades de consulta: Reporte por Investigador y Reporte por Carrera y Línea de Investigación. En ambas modalidades presenta la información registrada, genera indicadores y gráficos, habilita la exploración de publicaciones, proyectos y eventos, y permite descargar resultados o abrir el consolidado asociado en Google Sheets. Las operaciones de consulta no modifican la información de origen.

El flujo básico comprende el acceso, la carga de datos y la elección del tipo de reporte. Las dos modalidades de consulta se desarrollan como flujos alternativos principales (FA-001 y FA-002) que se incorporan en un mismo punto del flujo básico. Las acciones comunes —filtros de registros, detalles, gráficos, exportación y consolidado— se describen como flujos alternativos reutilizables, invocados desde cualquiera de las dos consultas cuando corresponda.

### **1.2. Actores y participantes**

| Actor o participante | Responsabilidad |
| :---- | :---- |
| Director de Investigación | Usuario principal que accede a la plataforma Empiria con su cuenta institucional, selecciona el módulo de Reporte, configura ciclo y modalidad de consulta, aplica filtros, revisa indicadores, examina evidencias y solicita descargas. |
| Sistema | Plataforma web Empiria (HTML \+ Google Apps Script) que valida el acceso, obtiene y prepara los registros, calcula indicadores, controla los filtros y genera las salidas de consulta. |

### **1.3. Precondiciones**

### 

| PRECONDICIÓN |
| :---- |
| 1\. La base de datos del sistema está disponible. |
| 2\. El Director posee una sesión válida y autorización para consultar información de investigación. |
| 3\. El sistema conoce el ciclo seleccionado; puede estar activo o cerrado. Los ciclos cerrados son consultables en modo de solo lectura. |
| 4\. Los investigadores disponibles tienen un identificador único (id) y nombre (nombre). Sus colecciones de publicaciones, proyectos, eventos y entregas son conjuntos válidos, incluso cuando están vacíos. |
| 5\. Para atribuir una contribución a una persona, su relación con el investigador es verificable; para agrupar instituciones se dispone también del identificador de cada contribución. |
| 6\. La apertura del consolidado en Google Sheets requiere un archivo autorizado o permisos para obtenerlo/crearlo. |

### **1.4. Glosario**

| Término | Definición operativa |
| :---- | :---- |
| Ciclo seleccionado | Contexto académico vigente en la cabecera; se usa al consultar y exportar. |
| Periodo | Consulta de un semestre/ciclo o de todos los ciclos del año seleccionado. |
| Filtros generales | Criterios que delimitan investigadores, carrera, línea y periodo. |
| Filtros específicos | Criterios aplicados a la colección de publicaciones, proyectos o eventos. |
| Contribución | Publicación, proyecto o evento asociado a uno o más investigadores. |
| Registro único | Contribución contada una sola vez por su identificador, aun cuando tenga varios participantes. |
| Participación | Relación entre un investigador y una contribución; una contribución puede producir varias participaciones. |
| Entrega | Respuesta de un investigador a una actividad de seguimiento. |
| H-index del medio | Índice informado para la revista o conferencia, distinto del H-index personal del investigador. |
| RENACYT | Registro y clasificación de investigadores correspondiente a CONCYTEC. |
| CTI Vitae | Perfil académico externo que se abre desde un enlace registrado. |
| Reporte consolidado | Libro de Google Sheets del ciclo que reúne la información de consulta. |

### **1.5. Servicios externos**

- Google Apps Script: servicio de consulta, procesamiento y presentación.  
- Google Sheets y Drive: consulta de datos, documentos, evidencias y consolidado.  
- CTI Vitae: acceso externo a perfiles registrados.  
- Navegador: descarga de HTML, CSV y JSON, e impresión o guardado como PDF.

### 

### **1.6. Alcance y exclusiones**

Este caso de uso abarca la consulta individual y agregada, filtros, indicadores, gráficos, comparativas, acceso a evidencias, descargas y apertura del consolidado. Quedan fuera del alcance de este caso de uso:

- La navegación general por la plataforma y el inicio de sesión. Corresponde a CU-000.  
- La gestión de ciclos académicos (crear, activar, cerrar). Corresponde a CU-001.  
- La creación y configuración de actividades. Corresponde a CU-002.  
- La administración y validación de plantillas base. Corresponde a CU-003.  
- La gestión, seguimiento y revisión de entregas. Corresponde a CU-004.

## **2\. Flujo de eventos**

### **2.1. Flujo básico**

| ACTOR (Director de Investigación) | SISTEMA |
| :---- | :---- |
| 1\. Accede a Empiria con su cuenta institucional. |  |
|  | 2\. Válida la sesión y los permisos de consulta. |
|  | 3\. Comprueba el repositorio, obtiene el ciclo seleccionado y recupera la información de investigadores y contribuciones. |
| 4\. Selecciona Reportes en la navegación. |  |
|  | 5\. Presenta las pestañas Por investigador y Por carrera y línea de investigación, los Filtros generales, Descargar y Abrir consolidado en Sheets. |
| 6\. Selecciona una modalidad. | 7\. Ejecuta FA-001 (investigador) o FA-002 (carrera y línea); presenta la consulta resultante. |
| 8\. Examina la información y, si lo necesita, filtra, abre detalles, explora gráficos, descarga o consulta el consolidado. |  |
|  | 9\. Ejecuta las operaciones comunes FA-003 a FA-007, conserva el contexto y actualiza únicamente las secciones afectadas. |
| 10\. Finaliza la consulta o cambia de módulo. |  |
|  | 11\. El caso de uso termina exitosamente. |

### **2.2 Flujos Alternativos**

#### *2.2.1 FA-001: Consultar reporte por investigador*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 6 del Flujo Básico, el Director selecciona «Por investigador» como modalidad de consulta. |  |
|  | 2\. Presenta el selector de investigador y filtros generales: carrera, línea, categoría, dedicación, disponibilidad, clasificación RENACYT, grupo, semillero, ciclo y periodo. |
| 3\. Define filtros generales y selecciona un investigador. |  |
|  | 4\. Limita el selector a investigadores compatibles; obtiene su ficha y contribuciones del ciclo/línea elegidos. |
|  | 5\. Presenta Dedicación y Ficha del investigador sin filtros internos de atributos fijos. |
|  | 6\. Calcula el Resumen: publicaciones, Q1–Q2, Scopus/WoS, entregas y posición general. |
|  | 7\. Presenta las Estadísticas: posición de ranking, H-index medio del medio académico y proyectos por estado. |
| 8\. Consulta Publicaciones, Proyectos y Eventos. |  |
|  | 9\. Muestra sus registros y habilita filtros, detalle, búsqueda, orden y paginación mediante FA-003 y FA-004. |
| 10\. Continúa consultando o regresa a la selección de reportes. |  |
|  | 11\. El flujo retorna al paso 8 del Flujo Básico para continuar la consulta. |

#### *2.2.2 FA-002: Consultar reporte por carrera y línea de investigación*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 6 del Flujo Básico, el Director selecciona «Por carrera y línea de investigación» como modalidad de consulta. |  |
|  | 2\. Presenta filtros de carrera, línea, investigador opcional, ciclo y periodo. |
| 3\. Selecciona carrera y línea; opcionalmente un investigador. |  |
|  | 4\. Actualiza las opciones dependientes y reúne investigadores compatibles, incluso si carecen de actividad. |
|  | 5\. Obtiene publicaciones, proyectos y eventos relacionados; elimina duplicaciones por ID y aplica el periodo y los filtros de colección. |
|  | 6\. Calcula los Indicadores principales y las estadísticas de Producción científica, Investigadores, Proyectos y Eventos académicos. |
| 7\. Elige una comparativa o un grupo estadístico. |  |
|  | 8\. Presenta rankings por carrera/línea, gráficos de evolución, ficha de investigadores y colecciones correspondientes. |
| 9\. Examina los detalles o solicita una descarga. |  |
|  | 10\. Aplica FA-003 a FA-006 cuando corresponda. |
| 11\. Termina la consulta. |  |
|  | 12\. El flujo retorna al paso 8 del Flujo Básico para continuar la consulta. |

#### *2.2.3 FA-003: Filtrar, buscar, ordenar y paginar contribuciones*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 8 del Flujo Básico, el Director abre los filtros de Publicaciones, Proyectos o Eventos. |  |
|  | 2\. Presenta los criterios de la sección. |
| 3\. Selecciona filtros, escribe una búsqueda o elige orden. |  |
|  | 4\. Aplica los criterios y muestra coincidencias; al cambiar filtros, búsqueda, orden o tamaño, regresa a la primera página. |
| 5\. Selecciona 10, 25 o 50 registros por página y navega. |  |
|  | 6\. Presenta la página solicitada y el total de coincidencias, manteniendo los filtros. |
| 7\. Cierra filtros o pulsa Restablecer. |  |
|  | 8\. Cerrar conserva los criterios aplicados y Restablecer los elimina. El flujo retorna al paso 8 del Flujo Básico, en la colección consultada. |

#### *2.2.4 FA-004: Consultar detalles y evidencias*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 8 del Flujo Básico, el Director abre los detalles de una publicación, proyecto o evento. |  |
|  | 2\. Muestra los campos adicionales, participantes y evidencias registrados; en proyectos incluye actividades y documentos de control cuando existen. |
| 3\. Selecciona un enlace de evidencia autorizado. |  |
|  | 4\. Abre el recurso externo sin alterar los datos del registro. |
| 5\. Cierra el detalle. |  |
|  | 6\. El sistema regresa a la colección con los filtros y la página conservados. El flujo retorna al paso 8 del Flujo Básico. |

#### *2.2.5 FA-005: Consultar gráficos y modificar su presentación*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 8 del Flujo Básico, el Director abre los controles de un gráfico del reporte por carrera y línea. |  |
|  | 2\. Ofrece agrupación por ciclo, mes, semana o día, series y rangos disponibles. |
| 3\. Cambia agrupación, series o rango. |  |
|  | 4\. Actualiza únicamente ese gráfico, sin alterar el contexto general ni otras estadísticas. |
| 5\. Pulsa Restablecer o cierra. |  |
|  | 6\. El sistema restablece los valores predeterminados o mantiene los criterios vigentes. El flujo retorna al paso 8 del Flujo Básico. |

#### *2.2.6 FA-006: Descargar resultados*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 8 del Flujo Básico, el Director selecciona «Descargar» en el reporte actual. |  |
|  | 2\. Ofrece secciones, elementos y formato HTML, CSV, JSON o PDF. |
| 3\. Marca contenido y pulsa Generar reporte. |  |
|  | 4\. Verifica que exista una sección y un elemento seleccionados; en reporte individual comprueba la selección de investigador. |
|  | 5\. Genera el resultado según contexto y filtros, incluyendo las coincidencias completas, sin recorte por paginación. |
| 6\. Guarda el archivo o utiliza el diálogo de impresión. |  |
|  | 7\. El sistema descarga HTML, CSV o JSON, o abre la impresión para guardar como PDF. El flujo retorna al paso 8 del Flujo Básico. |

#### *2.2.7 FA-007: Abrir reporte consolidado en Google Sheets*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 8 del Flujo Básico, el Director pulsa «Abrir consolidado en Sheets». |  |
|  | 2\. Localiza el archivo del ciclo seleccionado y verifica permisos. |
|  | 3\. Si no existe, lo crea y registra su identificador para evitar duplicados; incorpora datos y permisos de consulta. |
|  | 4\. Abre la URL autorizada en otra pestaña. |
| 5\. Consulta el consolidado. |  |
|  | 6\. El sistema conserva la sesión de Empiria. El flujo retorna al paso 8 del Flujo Básico. |

#### *2.2.8 FA-008: Sesión inválida o expirada*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 2 del Flujo Básico o durante una operación protegida, el sistema detecta que la sesión no es válida o ha expirado. |
|  | 2\. Bloquea la consulta protegida y solicita autenticación. |
| 3\. Inicia sesión nuevamente. |  |
|  | 4\. El flujo retorna al paso 2 del Flujo Básico después de una nueva autenticación. |

#### *2.2.9 FA-009: No existen investigadores compatibles*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 3 del Flujo Básico o al aplicar los filtros de FA-001 o FA-002, el sistema no encuentra investigadores compatibles. |
|  | 2\. Presenta Sin opciones disponibles, deshabilita el selector individual y muestra valores vacíos y conteos de cero. |
| 3\. Ajusta los filtros. |  |
|  | 4\. El sistema recalcula los resultados. El flujo retorna a FA-001 o FA-002, según la modalidad seleccionada. |

#### *2.2.10 FA-010: El investigador no tiene contribuciones en el periodo*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 4 de FA-001, el sistema detecta que el investigador no tiene contribuciones en el periodo seleccionado. |
|  | 2\. Conserva su Ficha y Dedicación; muestra conteos de 0 y promedios sin denominador como No registrado. |
| 3\. Cambia periodo o finaliza la consulta. |  |
|  | 4\. El flujo retorna a FA-001 si el Director cambia el periodo; si decide no continuar, el caso de uso termina. |

#### *2.2.11 FA-011: Datos insuficientes para calcular una tasa o promedio*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el cálculo de indicadores en FA-001 o FA-002, el sistema detecta un denominador igual a cero o la ausencia de un monto válido. |
|  | 2\. Muestra No registrado, sin reemplazar ausencias por cero ni dividir entre cero. |
| 3\. Continúa la consulta. |  |
|  | 4\. El sistema mantiene los demás indicadores válidos. El flujo retorna a FA-001 o FA-002, según corresponda. |

#### *2.2.12 FA-012: Estructura de datos de consulta inválida*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 3 del Flujo Básico, el sistema detecta investigadores sin identificador o nombre, o colecciones con estructura inválida. |
|  | 2\. Detiene la carga y muestra No se pudieron cargar los reportes. |
| 3\. Pulsa Reintentar. |  |
|  | 4\. El flujo retorna al paso 3 del Flujo Básico para intentar nuevamente la carga de datos. |

#### *2.2.13 FA-013: Repositorio o servicio no disponible*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 3 del Flujo Básico, el sistema detecta un error de conexión con la fuente de datos. |
|  | 2\. Muestra un error de disponibilidad y no presenta cifras parciales como consolidadas. |
| 3\. Pulsa Reintentar. |  |
|  | 4\. El flujo retorna al paso 3 del Flujo Básico si la conexión se restablece; de lo contrario, el caso de uso termina sin resultados. |

#### *2.2.14 FA-014: Filtros sin coincidencias*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 8 del Flujo Básico, una búsqueda o filtro de una colección no devuelve coincidencias. |
|  | 2\. Muestra estado vacío, contador 0 y página 1/1; conserva los controles. |
| 3\. Restablece los filtros. |  |
|  | 4\. El sistema recalcula la sección. El flujo retorna a FA-003. |

#### *2.2.15 FA-015: Falta CTI Vitae o evidencia registrada*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante la consulta de la ficha o los detalles en FA-001 o FA-004, el sistema detecta que no existe un enlace válido de CTI Vitae o de evidencia. |
|  | 2\. Muestra Sin evidencia adjunta o identifica el acceso al portal general CTI Vitae, sin atribuir un perfil. |
| 3\. Continúa consultando. |  |
|  | 4\. El sistema conserva los datos y filtros previos. El flujo retorna a FA-001 o FA-004, según la consulta de origen. |

#### *2.2.16 FA-016: Descarga incompleta, cancelada o bloqueada*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante la descarga de FA-006, el Director solicita un archivo sin seleccionar secciones o campos, cancela la operación o el navegador bloquea el PDF. |  |
|  | 2\. Informa el requisito faltante o bloqueo; no confirma un archivo no descargado. |
| 3\. Corrige la selección o vuelve al reporte. |  |
|  | 4\. El flujo retorna a FA-006 si el Director corrige la selección; si cancela, retorna al paso 8 del Flujo Básico sin modificar los datos. |

#### *2.2.17 FA-017: Error de Google Sheets/Drive, permisos o cuota*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante la apertura del consolidado en FA-007, el sistema detecta un error de permisos, cuota o conexión con Google Sheets o Drive. |
|  | 2\. Registra la incidencia y comprueba si ya existe un archivo antes de reintentar. |
| 3\. Solicita reintento o regresa a Reportes. |  |
|  | 4\. El flujo retorna a FA-007 cuando el Director reintenta o al paso 8 del Flujo Básico si abandona la apertura del consolidado. |

#### *2.2.18 FA-018: Consulta de un ciclo cerrado*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 8 del Flujo Básico, el Director selecciona un ciclo con estado «Cerrado». |  |
|  | 2\. Presenta datos históricos en modo de consulta y permite filtrado y exportación, sin edición. |
| 3\. Continúa con la modalidad deseada. |  |
|  | 4\. El sistema ejecuta FA-001 o FA-002 con datos históricos en modo de solo lectura y, al concluir, retorna al paso 8 del Flujo Básico. |

#### *2.2.19 FA-019: Cambio de ciclo o modalidad durante la consulta*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 8 del Flujo Básico, el Director cambia el ciclo global o la modalidad de reporte. |  |
|  | 2\. Recalcula las colecciones y restablece selectores incompatibles, sin modificar registros. |
| 3\. Continúa consultando. |  |
|  | 4\. El sistema ejecuta FA-001 o FA-002 con el nuevo contexto y, al concluir, retorna al paso 8 del Flujo Básico. |

#### *2.2.20 FA-020: Cierre del diálogo de filtros*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante la aplicación de filtros en FA-003 o FA-005, el Director cierra el diálogo sin pulsar «Restablecer». |  |
|  | 2\. Conserva los filtros ya aplicados. |
| 3\. Abre nuevamente el diálogo. |  |
|  | 4\. El sistema muestra los valores vigentes. El flujo retorna a FA-003 o FA-005, según el diálogo de origen. |

## **3\. Reglas de negocio y criterios de aceptación**

| ID | Regla / criterio verificable |
| ----- | ----- |
| RN-005-01 | El periodo de consulta se determina por el campo ciclo, no por la fecha de publicación. |
| RN-005-02 | Las contribuciones compartidas se cuentan una vez por ID en totales únicos; las participaciones se cuentan por investigador. |
| RN-005-03 | Los rankings comparan investigadores, carreras o líneas bajo el mismo periodo y criterios. |
| RN-005-04 | Una publicación registrada no equivale necesariamente a publicada; un proyecto aprobado no es finalizado. |
| RN-005-05 | Las sumas monetarias utilizan montos válidos y preservan la diferencia entre cero registrado y dato ausente. |
| RN-005-06 | El avance declarado del proyecto no se confunde con la ejecución calculada a partir de importes. |
| RN-005-07 | Los promedios y porcentajes sin denominador muestran No registrado. |
| RN-005-08 | Los filtros generales, de colección, de tabla y de gráfico respetan su alcance definido. |
| RN-005-09 | La existencia de un enlace de evidencia no certifica su contenido o validez. |
| RN-005-10 | Las exportaciones incluyen todas las coincidencias correspondientes y no solo la página visible. |
| RN-005-11 | Los ciclos cerrados se consultan sin alterar el histórico. |
| RN-005-12 | No se atribuyen contribuciones a investigadores sin una relación de participación verificable. |

## **4\. Especificación de interfaz y datos de los reportes**

### **4.1 Estructura de interfaz**

| Elemento | Descripción y regla |
| :---- | :---- |
| Panel Reportes | Pestañas individual y carrera/línea, botón Filtros generales, Descargar y Abrir consolidado en Sheets. |
| Filtros generales | Se aplican a investigadores y contexto temporal; no equivalen a filtros internos de las contribuciones. |
| Dedicación y Ficha | Secciones informativas sin filtros internos de categoría, RENACYT o dedicación. |
| Resumen individual | Cinco indicadores fijos correspondientes al investigador y periodo/línea seleccionados. |
| Estadísticas individuales | Posición general, H-index medio de medios y estados de proyectos. |
| Carrera/línea | Indicadores principales, cuatro grupos estadísticos, comparativas, gráficos, investigadores y colecciones. |
| Colecciones | Tablas o tarjetas de publicaciones, proyectos y eventos, buscador, filtros, contador, orden y paginación. |
| Exportación | Selección de secciones y campos; HTML, CSV, JSON o impresión/guardado como PDF. |

### **4.2 Variables utilizadas y cómo se calculan**

Las variables representan el universo de cálculo después de aplicar los filtros generales y el periodo; los registros compartidos se deduplican por ID cuando se calculan contribuciones únicas.

| Variable | Explicación en palabras | Cómo se obtiene | Fórmula simple |
| :---- | :---- | :---- | :---- |
| investigadoresSeleccionados | Personas de la carrera, línea e investigador elegidos. | Filtrar investigadores por criterios generales. | filtrar(investigadores, filtrosGenerales) |
| publicacionesUnicas | Publicaciones distintas asociadas a la selección. | Reunir publicaciones y quitar IDs repetidos. | únicosPorId(publicacionesSeleccionadas) |
| proyectosUnicos | Proyectos distintos de la selección. | Reunir proyectos y quitar IDs repetidos. | únicosPorId(proyectosSeleccionados) |
| eventosUnicos | Eventos distintos de la selección. | Reunir eventos y quitar IDs repetidos. | únicosPorId(eventosSeleccionados) |
| publicacionesTotales | Cantidad total de publicaciones, sin importar el estado. | Contar publicaciones del contexto. | contar(publicacionesUnicas) |
| publicacionesQ1Q2 | Publicaciones clasificadas Q1 o Q2. | Contar cuartiles reconocidos en las publicaciones. | contar(publicaciones con cuartil Q1 o Q2) |
| publicacionesIndexadas | Publicaciones reconocidas como Scopus o WoS. | Examinar indexación registrada. | contar(publicaciones Scopus o WoS) |
| investigadoresRenacyt | Personas con nivel RENACYT reconocido. | Contar valores RENACYT Distinguido o I–VII. | contar(investigadores con nivel reconocido) |
| porcentajeRenacyt | Proporción de investigadores con nivel reconocido. | Dividir RENACYT entre investigadores seleccionados. | 100 × investigadoresRenacyt / totalInvestigadores |
| entregasCompletadas | Entregas individuales finalizadas. | Contar estados «Completada». | contar(entregas con estado Completada) |
| totalEntregas | Todas las entregas del investigador en el periodo. | Contar entregas vinculadas. | contar(entregasSeleccionadas) |
| valorRenacyt | Valor usado solo para ordenar niveles en el ranking individual. | Traducir nivel a escala: Distinguido 8; I 7; …; VII 1; otro 0\. | valorSegúnNivel(nivelRenacyt) |
| contribucionesInvestigador | Número de publicaciones, proyectos y eventos de una persona. | Sumar sus tres conteos del mismo periodo y línea. | publicacionesPersona \+ proyectosPersona \+ eventosPersona |
| posicionRanking | Puesto del investigador respecto a personas con mayor nivel o mayor producción a igual nivel. | Contar quienes lo superan. | 1 \+ contar(investigadores con mejor clasificación) |
| hIndexMedio | Promedio de H-index de los medios de publicación con valor válido. | Sumar índices y dividir por cantidad válida. | suma(indicesValidos) / contar(indicesValidos) |
| proyectosActivos | Proyectos aprobados o en desarrollo/ejecución. | Contar estados normalizados admitidos. | contar(proyectos con estado activo) |
| presupuestoTotal | Presupuesto total registrado en proyectos. | Sumar importes válidos. | suma(presupuestosValidos) |
| presupuestoEjecutado | Importe ejecutado registrado. | Sumar importes válidos del campo ejecutado. | suma(ejecutadosValidos) |
| porcentajeEjecucion | Relación financiera solo de proyectos con ambos importes. | Sumar ejecutado y presupuesto sobre los mismos proyectos. | 100 × ejecutadoConAmbos / presupuestoConAmbos |
| proyectosFinalizados | Proyectos con estado de cierre finalizado. | Contar estado finalizado. | contar(proyectos con estado Finalizado) |
| tasaFinalizacion | Proporción de proyectos finalizados. | Dividir finalizados entre proyectos totales. | 100 × proyectosFinalizados / totalProyectos |
| eventosRealizados | Participaciones en eventos realizados. | Sumar participantes de eventos realizados; como mínimo uno por registro. | suma(participacionesPorEventoRealizado) |
| productividadMedia | Publicaciones únicas por investigador seleccionado. | Dividir publicaciones entre población. | publicacionesTotales / totalInvestigadores |
| totalPaginas | Cantidad de páginas de una colección. | Dividir coincidencias entre tamaño y redondear hacia arriba. | máximo(1, techo(totalCoincidencias / tamañoPagina)) |

Reglas de cálculo: dividir solo si el denominador es mayor que cero. Si faltan valores numéricos válidos, mostrar No registrado; un cero efectivamente registrado se conserva. Los importes son PEN. Para el ranking, si dos investigadores tienen igual nivel RENACYT e igual total de contribuciones, comparten posición.

### **4.3 Diccionario de datos — Filtros generales**

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Investigador | Registrado y contextual | Investigadores.id, nombre | — |
| Carrera profesional | Registrado y contextual | Investigadores.carrera | — |
| Línea de investigación | Registrado y contextual | Investigadores.lineas | — |
| Categoría y dedicación | Registrado y contextual | categoria, dedicacion | — |
| Disponibilidad semanal | Registrado y contextual | dias | — |
| Grupo y nivel RENACYT | Registrado y contextual | renacytGrupo, renacytNivel | — |
| Grupo de investigación y semillero | Registrado y vinculado | grupos, semilleros | — |
| Ciclo y periodo | Contextual | Selector global, ciclo | Semestre: ciclo exacto; año: mismo año del ciclo. |

Los filtros de atributos personales permiten seleccionar investigadores; no se repiten dentro de las secciones Ficha y Dedicación.

### **4.4 Diccionario de datos — Dedicación y Ficha del investigador**

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Días disponibles | Registrado y derivado | dias | Resaltar día si está en dias. |
| Tipo de dedicación | Registrado | dedicacion | — |
| Categoría docente | Registrado | categoria | — |
| Nombre, ID, DNI y correo | Registrado | nombre, id, dni, correo | — |
| Carrera y líneas | Registrado y derivado | carrera, lineas | Líneas sin vacíos ni duplicados. |
| Código, grupo y nivel RENACYT | Registrado | renacytCodigo, renacytGrupo, renacytNivel | — |
| Perfil CTI Vitae | Registrado | ctivitaeUrl | — |
| Pertenencia a grupos y semilleros | Vinculado | grupos, semilleros | — |

### **4.5 Diccionario de datos — Resumen y estadísticas por investigador**

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Publicaciones totales | Agregado | publicaciones del investigador | contar(publicacionesDelPeriodo) |
| Publicaciones Q1–Q2 | Agregado | publicaciones.cuartil | contar(cuartil \= Q1 o Q2) |
| Publicaciones Scopus/WoS | Agregado | publicaciones.indexacion | contar(indexación con Scopus o WoS) |
| Entregas completadas / total | Agregado | entregas.estado | entregasCompletadas / totalEntregas como cantidades. |
| Posición general | Agregado | RENACYT y contribuciones de todos | 1 \+ investigadoresConMejorClasificacion |
| H-index medio de medios | Agregado | publicaciones.hIndex | suma(indicesValidos) / contar(indicesValidos) |
| Velocímetro de H-index | Derivado | H-index de medios comparables | 100 × hIndexMedio / hIndexMaximo |
| Proyectos por estado | Agregado | proyectos.estado | contar(proyectos de cada estado) |

Precisiones: el resumen individual utiliza la línea y el periodo seleccionados, no filtros internos de publicaciones. El H-index medio sí responde al filtro de Publicaciones. Q1–Q2 individual usa el campo cuartil registrado sin sustituirlo por ranking de conferencia. Su indicador Scopus/WoS identifica literalmente Scopus o WoS, sin expandir «Web of Science» cuando no aparece «WoS».

### **4.6 Diccionario de datos — Tablas de Publicaciones, Proyectos y Eventos**

Publicaciones

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Título, tipo y revista/evento | Registrado | titulo, tipo, evento | — |
| Autores | Vinculado | Relación publicación–investigador | — |
| Indexación y estado | Registrado | indexacion, estado | — |
| Calidad: cuartil/ranking | Derivado | cuartil, rankingConferencia, ranking | Primer valor disponible. |
| H-index del medio | Registrado | hIndex | — |
| Fecha, ciclo y línea | Registrado | fecha, ciclo, linea | — |
| JIF, JCI y ubicación | Registrado | jif, jci, pais, ciudad | — |
| Evidencia y publicación | Registrado | urlEvidencia, urlPublicacion | — |

Proyectos

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Código y título | Registrado y derivado | codigo, numeroProyecto, titulo | Código: primer valor disponible. |
| Tipo y financiación | Registrado | tipoProyecto, tipo | — |
| Rol, estado y línea | Registrado | rol, estado, linea | — |
| Fechas de inicio y fin | Registrado | fechaInicio, fechaFin | — |
| Presupuesto y ejecutado | Registrado | presupuesto, ejecutado | — |
| Avance declarado | Registrado | avance | No se calcula desde el presupuesto. |
| Financiador, área y objetivos | Registrado | financiador, area, objetivos | — |
| Participantes y actividades | Vinculado | Relaciones y actividades del proyecto | — |
| Evidencia y resultados | Registrado | urlEvidencia, resultados | — |

Eventos

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Nombre, tipo y rol | Registrado | titulo, tipo, rol | — |
| Modalidad y estado | Registrado | modalidad, estado | — |
| Fecha, ciclo y línea | Registrado | fecha, ciclo, linea | — |
| Ubicación | Derivado | pais, ciudad, lugar | País \+ ciudad; si faltan, lugar. |
| Participantes | Vinculado | Relación evento–investigador | — |
| Evidencia y detalle | Registrado | urlEvidencia, urlEvento, descripcion | — |

### **4.7 Diccionario de datos — Reporte por carrera y línea**

Indicadores principales

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Investigadores incluidos | Agregado | Investigadores filtrados | contar(investigadoresSeleccionados) |
| Investigadores RENACYT y porcentaje | Agregado | renacytNivel | 100 × investigadoresRenacyt / totalInvestigadores |
| Publicaciones totales | Agregado | Publicaciones únicas | contar(publicacionesUnicas) |
| Publicaciones Q1–Q2 | Agregado | cuartil o ranking reconocido | contar(publicaciones Q1 o Q2) |
| Proyectos activos | Agregado | proyectos.estado | contar(apro­bados o en desarrollo/ejecución) |
| Financiamiento total | Agregado | proyectos.presupuesto | suma(presupuestosValidos) |
| Eventos realizados | Agregado | eventos.estado, participantes | suma(participaciones en eventos realizados) |
| Productividad media | Agregado | Publicaciones e investigadores | publicacionesTotales / totalInvestigadores |

Producción científica

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Publicaciones por ciclo y año | Agregado | publicaciones.ciclo, fecha | Conteo por grupo temporal. |
| Publicaciones por tipo/estado/indexación | Agregado | tipo, estado, indexacion | Conteo por categoría. |
| Distribución Q1–Q4 | Agregado | cuartil / ranking | Conteo por cuartil reconocido. |
| Publicaciones con/sin cuartil | Agregado | Publicaciones y cuartiles | sinCuartil \= publicacionesTotales \- publicacionesConCuartil |
| H-index medio por medio | Agregado | hIndex, tipo | suma(indicesValidosJournalConferencia) / cantidadValida |
| Porcentaje Q1–Q2 de cuartil conocido | Agregado | Publicaciones Q1/Q2 y con cuartil | 100 × publicacionesQ1Q2 / publicacionesConCuartil |

Investigadores

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Distribución por carrera, RENACYT, categoría y dedicación | Agregado | Campos de Investigadores | Conteo por valor. |
| Con/sin publicaciones | Agregado | Relación autor–publicación | sinPublicaciones \= totalInvestigadores \- conPublicaciones |
| Participan en proyectos | Agregado | Relación investigador–proyecto | Contar personas con proyecto. |
| Contribuciones por investigador | Agregado | Participaciones de P, R y E | totalParticipaciones / totalInvestigadores |
| Investigadores con actividad por ciclo | Agregado | Participaciones y ciclo | Personas distintas por ciclo. |

Proyectos

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Internos/externos y estados | Agregado | proyectos.tipo, estado | Conteo por grupo. |
| Iniciados/finalizados por ciclo | Agregado | fechaInicio, fechaFin, estado | Contar por semestre derivado de fecha. |
| Presupuesto y ejecución | Agregado | presupuesto, ejecutado | Suma válida de cada importe. |
| Porcentaje de ejecución | Agregado | Proyectos con ambos importes | 100 × ejecutadoConAmbos / presupuestoConAmbos |
| Presupuesto externo | Agregado | tipo, presupuesto | Suma de proyectos Externos. |
| Tasa de finalización | Agregado | estado | 100 × proyectosFinalizados / totalProyectos |
| Proyectos por área y financiador | Agregado | area, financiador | Conteo por grupo. |

Eventos académicos

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Total de participaciones | Agregado | Eventos y participantes | suma(participantesPorEvento) |
| Eventos realizados por ciclo | Agregado | Eventos únicos, estado, ciclo | Contar realizados por ciclo. |
| Por tipo, rol y modalidad | Agregado | tipo, rol, modalidad | Conteo por grupo. |
| Nacionales / internacionales | Agregado | ambito, alcance | Conteo por ámbito registrado. |

### **4.8 Diccionario de datos — Comparativas, gráficos y exportaciones**

| Dato | Naturaleza | Fuente | Fórmula (si aplica) |
| :---- | :---- | :---- | :---- |
| Carreras por publicaciones | Agregado | Publicaciones por carrera | contar(publicacionesUnicasPorCarrera) |
| Líneas por Q1–Q2 | Agregado | Publicaciones por línea | contar(publicacionesQ1Q2PorLinea) |
| Carreras por proyectos finalizados | Agregado | Proyectos por carrera | contar(estado \= Finalizado) |
| Líneas por financiamiento | Agregado | Presupuestos por línea | suma(presupuestosValidosPorLinea) |
| Productividad por carrera | Agregado | Publicaciones e investigadores por carrera | publicacionesCarrera / investigadoresCarrera |
| RENACYT por carrera | Agregado | Niveles por carrera | 100 × renacytCarrera / investigadoresCarrera |
| Producción comparativa entre ciclos | Agregado | Contribuciones y ciclo | Conteo por carrera y ciclo. |
| Series de publicaciones/proyectos/eventos | Agregado | Colecciones y fechas | Conteo por ciclo, mes, semana o día. |
| Barra relativa | Derivado | Conteos de categorías | 100 × valorCategoria / valorMaximo |
| Segmento de gráfico circular | Derivado | Conteos de grupos | 100 × valorCategoria / totalCategorias |
| Páginas y contador | Agregado | Coincidencias de colección | máximo(1, techo(totalCoincidencias / tamañoPagina)) |
| CSV de colección | Derivado | Registros filtrados completos | Todas las coincidencias, sin recorte por página. |
| CSV de reporte | Derivado | Secciones seleccionadas | Filas Sección / Registro / Campo / Valor. |
| Consolidado de Google Sheets | Vinculado | Archivo por ID de ciclo | Reutilizar o crear por ciclo, sin duplicados. |

Alcance de filtros: los filtros generales afectan población y periodo; los filtros específicos de colecciones afectan sus registros y las estadísticas de carrera; búsqueda y paginación afectan únicamente las tablas y el CSV correspondiente; los controles de un gráfico afectan solo ese gráfico.

## **5\. Postcondiciones**

* Consulta individual exitosa: se presentan dedicación, ficha, resumen, estadísticas y contribuciones del investigador seleccionado.  
* Consulta por carrera/línea exitosa: se muestran indicadores agregados, comparativas, gráficos y contribuciones de la selección académica.  
* Exportación exitosa: se genera el formato solicitado con los datos aplicables a las secciones seleccionadas; la paginación no limita el contenido exportado.  
* Consolidado consultado: se abre el libro del ciclo con datos protegidos.  
* Sin resultados: los conteos se presentan como cero y las razones no calculables como No registrado.  
* Error: se informa al Director y se conservan los registros de origen sin cambios.

