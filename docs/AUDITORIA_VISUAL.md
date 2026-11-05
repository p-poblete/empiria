# Empiria · Auditoría visual

Revisión del 14 de octubre de 2026. Alcance: todos los archivos HTML, incluidos los componentes generados por Scripts.html y la presentación del reporte exportado. La propuesta conserva la identidad azul existente y prioriza lectura de información académica, jerarquía de acciones y navegación frecuente.

## Hallazgos y correcciones

| Prioridad | Ubicación | Hallazgo | Corrección |
| --- | --- | --- | --- |
| Alta | Index.html, Login.html, Inicio.html, Código.gs | Nombre anterior en acceso, marca, pie y título de Apps Script | Identidad Empiria y título de navegador coherente; se conserva la clase técnica marca-sgiu |
| Alta | Estilos.html, reportes | Todos los botones de reportes recibían fondo azul, incluidos filtros, cierres y detalles | Acciones principales azules; filtros secundarios con borde; detalles con superficie neutra |
| Alta | Tareas.html | Etiquetas horizontales estrechas competían con valores e instrucciones | Etiquetas asociadas a sus campos y colocadas encima; contexto de solo lectura diferenciado |
| Alta | Estilos.html, tarjetas de plantillas | Nombres extensos y estado compartían una fila sin espacio suficiente | Fila adaptable, nombres completos con salto de línea y acciones de altura uniforme |
| Alta | Estilos.html, navegación móvil | Seis columnas con etiquetas de 9 px | Tres columnas en dos filas, etiquetas de 12 px y objetivos de 44 px |
| Media | Estilos.html, reportes | Metadatos y tablas con texto de 9–11 px | Escala de notas de 12 px; controles de 14 px; números tabulares |
| Media | Estilos.html, producción del investigador | Altura rígida de 480 px incluso con poco contenido | Altura adaptable con límite en escritorio; contenido fluido en móvil |
| Media | Estilos.html, tablas y gráficos | Lectura de tablas extensas y cantidades en columnas demasiado estrechas | Cabeceras de tabla fijas dentro del desplazamiento; texto largo adaptable; columna de cantidades según contenido |
| Media | Estilos.html, controles y modales | Radios, transiciones y tamaños dispersos | Tokens compartidos, transiciones explícitas, superficies y sombra de diálogo consistentes |
| Media | Index.html, Plantillas.html | Falta de salto al contenido y etiquetas sin asociación explícita | Enlace de salto, destino enfocable y asociaciones label/for |
| Media | Estilos.html, móvil e impresión | Cabecera fija ocupaba espacio vertical; tarjetas podían limitar contenido impreso | Cabecera móvil en flujo normal y reglas de impresión sin límite de altura en producción |

## Sistema de diseño

- Paleta: primario `#0649d8`, hover `#0538a6`, selección `#edf3ff`, superficie `#ffffff`, fondo `#f5f6f8`, texto `#171a21`, secundario `#586171`, borde `#e2e5eb`.
- Estados: éxito `#047857`, advertencia `#805500`, error `#b91c1c`. Se conservan las etiquetas textuales y los colores existentes de clasificación RENACYT y las series de gráficos.
- Tipografía: Inter, con respaldo sans-serif. Tokens de 12/14/16/22/30 px para notas, controles, secciones, título e indicadores. En móvil los campos editables usan 16 px para evitar zoom automático.
- Espaciado: escala central de 4/8/12/16/24/32 px, compatible con las utilidades Tailwind existentes.
- Radios: controles 8 px, paneles 12 px, diálogos 16 px. Sombra ligera en superficies y elevada en diálogos.
- Interacción: objetivo base de 44 px, foco visible, hover con contraste, estado deshabilitado conservado y movimiento reducido respetado.
- Layout: sidebar lateral reducible en escritorio, navegación de tres columnas en móvil, rejillas adaptables, tablas con desplazamiento interno y formularios con etiquetas superiores.

## Archivos modificados

- Estilos.html: sistema visual compartido para todos los módulos.
- Index.html: marca, navegación, salto al contenido y metadatos.
- Login.html e Inicio.html: identidad y presentación.
- Tareas.html y Plantillas.html: presentación y asociación de etiquetas.
- Scripts.html: exclusivamente cuatro textos de presentación (botón y reporte HTML exportado).
- Código.gs: exclusivamente el título visible del web app.
- AUDITORIA_VISUAL.md: hallazgos, decisiones y verificación.

## Verificaciones realizadas

- Sintaxis de Scripts.html validada con Node.js.
- Comparación exacta con las copias previas: los únicos cambios del JavaScript son cuatro textos; google.script.run, validaciones, cálculos y procesos permanecen idénticos.
- Se ejecutó obtenerDatosReportes en contextos aislados con SIMULAR_SIN_INVESTIGADORES=false y true. Los resultados coinciden exactamente con la versión original en ambos estados. El archivo mantiene false como valor predeterminado.
- Verificados 167 IDs únicos y preservados, 99 manejadores HTML idénticos y referencias label/for válidas.
- Inclusiones HTML resueltas en una copia temporal para inspección estática; comprobadas las llaves CSS y las referencias de variables del tema.
- No se instalaron dependencias ni se cambiaron la arquitectura o las fuentes de datos.

## Limitaciones y pendientes

No se pudo inspeccionar el resultado renderizado: el navegador Brave instalado falló al arrancar por restricciones del entorno (setsockopt no permitido) y el servidor local tampoco pudo abrir sockets. No se tomaron capturas ni se verificaron consola, medidas reales, contraste de todos los estados compuestos o navegación con teclado en un navegador.

Pendiente en Deploy → Test deployments de Apps Script:

1. Revisar escritorio, tablet y móvil (1440, 1024, 768 y 375 px), especialmente el sidebar reducido, nombres extensos y tablas.
2. Recorrer acceso/salida, seis módulos, ciclos activos/cerrados, validaciones y creación de tareas, creación y filtros de plantillas.
3. Abrir todos los diálogos de filtros, descarga y detalle; comprobar foco y desplazamiento en pantallas de poca altura.
4. Verificar reportes poblados y FA-005 con google.script.run real, restaurando false al terminar.
5. Comprobar descarga HTML e impresión PDF. La exportación conserva su hoja de estilos autónoma; se ha incorporado Empiria a su encabezado y título.

Ciclo y Clases siguen mostrando las vistas de borrador existentes. La gestión del foco y el cierre por teclado de los dos modales construidos con div siguen pendientes de una intervención de comportamiento fuera del alcance visual autorizado. Las alertas nativas existentes se conservan.

Referencia de auditoría: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), consultada durante la revisión; aplicada a foco, etiquetas, movimiento reducido, legibilidad, contenido largo y tamaño de interacción.


## Actualización según Instrucciones

Se implementaron los cambios solicitados posteriormente en el archivo Instrucciones:

- Filtros generales y descarga junto al consolidado de Sheets; se elimina la tarjeta de filtros generales. Los botones específicos del investigador se ocultan al consultar carrera.
- Datos de la ficha en recuadros; clasificación en una tercera columna en escritorio, adaptable en pantallas pequeñas. Progresión neutro–dorado hacia los niveles RENACYT superiores.
- Estadísticas sin párrafo explicativo, tarjetas con tintes y posición del ranking destacada frente al total.
- Corrección de la referencia DOM de proyectos y eventos: el contenido se captura antes de moverlo a su tarjeta. La apertura usa ese contenido en el diálogo.
- Días de disponibilidad en una fila, gráficos compactos y sin líneas divisorias.
- HTML/PDF conserva la estructura completa del reporte, elimina las secciones no seleccionadas y reutiliza el CSS central. El PDF propone A3 horizontal para dar espacio a las tres columnas; la paginación depende del navegador y del volumen de datos. CSV y JSON conservan sus formatos de datos.

Verificación de esta actualización: sintaxis JS válida; prueba con DOM simulado de apertura de proyecto/evento en investigador y carrera; ranking poblado y sin datos; estructura de ficha, IDs únicos y referencias de diálogos válidas. Las comprobaciones de identidad exacta de Scripts.html descritas en la auditoría inicial corresponden al estado anterior: esta actualización sí modifica el comportamiento necesario para reparar los detalles y la exportación. No se modificaron Código.gs, cálculos, validaciones ni google.script.run. Continúa pendiente la validación renderizada y de impresión en Apps Script por las restricciones ya documentadas.

## Segunda actualización de Instrucciones

- Ficha restaurada a la distribución original de dos columnas, con la clasificación dentro del bloque de acreditación. Solo las respuestas llevan fondo redondeado; se mantiene el dorado según RENACYT.
- Sombras en paneles y respuestas, más pronunciadas al pasar el cursor. Se conserva la preferencia de movimiento reducido.
- Mayor separación entre gráficos y filtros compactos en la esquina superior derecha de Publicaciones, Proyectos y Eventos; en dispositivos táctiles conservan altura de 44 px.
- Información de proyectos y eventos en tablas Campo/Información, incluidos evidencia, descripción y valores cero.
- Cabeceras ordenables con botones accesibles, indicador de dirección y aria-sort. Se comparan números, fechas y texto por su dato principal; también se habilitan en los diálogos. La exportación conserva el texto de las cabeceras.
- Eliminado el aviso ordinario «Datos de demostración…» de reportes y del encabezado exportado; se conservan mensajes de carga, error y ausencia de investigadores. Estadísticas continúa sin el párrafo explicativo. Filtros generales y descarga permanecen como acciones de cabecera, sin tarjetas o secciones visibles independientes.

Pruebas de esta actualización: sintaxis JS/CSS; orden numérico, cronológico y alfabético en ambos sentidos con DOM simulado; reaplicación de manejadores al copiar cabeceras al diálogo; tablas vacías; escape de contenido y enlaces de evidencia; apertura de proyectos y eventos en ambos submódulos; estructura HTML, IDs únicos y referencias de controles. No se modificaron Google Apps Script, los cálculos de indicadores ni las validaciones. La inspección renderizada e impresión real siguen pendientes por las restricciones del entorno.


## Tercera actualización de Instrucciones

- Respuestas de la ficha más compactas: padding de 5/9 px, radio de 14 px y ancho ajustado al contenido. Se elimina la altura mínima anterior que dejaba espacio sobrante.
- Separación explícita de 48 px entre los gráficos, con prioridad sobre las utilidades de espaciado.
- Ranking con acabado metálico dorado para el primer puesto y tonos progresivamente más suaves según cercanía relativa al primer lugar. El último puesto y el estado sin datos usan un neutro. No cambia el cálculo del ranking.
- Proyectos y Eventos del investigador pasan a tablas de registros con cabeceras, desplazamiento horizontal y ordenación como Publicaciones. Se incluyen todos sus campos, los adicionales, los ceros y los valores booleanos; los ausentes se indican con raya. Se eliminan las instrucciones de apertura de detalles. El reporte por carrera conserva sus diálogos.
- Se elimina la línea de contexto anterior a Estadísticas y su actualización de JavaScript.

Verificación: sintaxis JS/CSS; tablas con datos reales de demostración y estados vacíos; campos adicionales, datos estructurados, cero y false; escape de HTML y rechazo de enlaces de evidencia no HTTP(S); seis variantes de ranking; correspondencia entre cabeceras y celdas; IDs únicos; regresión de ordenación numérica, cronológica y alfabética en ambos sentidos con DOM simulado. Código.gs y google.script.run no se modificaron. Continúa pendiente la inspección renderizada en Apps Script.


## Cuarta actualización de Instrucciones: colecciones de producción

Se implementan las nuevas interacciones solicitadas para Reporte por Investigador:

- Proyectos y Eventos vuelven a bloques individuales. Cada bloque abre un diálogo con la tabla de su registro; la acción «Ver tabla» permite consultar la colección paginada en el mismo diálogo.
- Publicaciones: Título, Tipo, Revista / Evento, Indexación, Calidad, H-index, Fecha, Estado y Acciones.
- Proyectos: Código, Título, Tipo, Financiamiento, Rol, Estado, Inicio / Fin, Presupuesto y Acciones.
- Eventos: Evento, Tipo, Rol, Modalidad, Fecha, Ubicación, Estado y Acciones.
- «Ver detalles» despliega la información complementaria debajo de la fila, incluidos los campos específicos solicitados. Los campos adicionales del registro se conservan en los detalles. Los datos ausentes aparecen como «No registrado»; no se generan fechas, métricas ni evidencias ficticias. Imágenes y documentos se consultan mediante sus enlaces disponibles.
- Cada sección tiene buscador por título/código/nombre, filtros específicos existentes, contador, paginación de 10/25/50, estados coloreados y exportación CSV. La búsqueda ignora acentos; la ordenación se aplica antes de paginar, con valores ausentes al final.
- El CSV incluye todos los resultados de filtros y búsqueda, también los de otras páginas, y todos los campos presentes. Se conserva el escape de texto para evitar fórmulas al abrirlo en una hoja de cálculo.
- La descarga general HTML/PDF/CSV/JSON también usa los resultados filtrados y buscados. El HTML/PDF incorpora las tablas completas con los detalles abiertos, sin limitarse a la página visible.
- La ordenación de cabeceras dispone de aria-sort y conserva el foco. Los detalles indican aria-expanded y los controles tienen etiquetas. El reporte por carrera mantiene su comportamiento anterior.

Archivos modificados: ReporteInvestigador.html, Scripts.html, Estilos.html y este documento. La ampliación de comportamiento está autorizada por la nueva versión de Instrucciones. No cambia Código.gs, google.script.run, las validaciones de tareas/plantillas o el cálculo de indicadores.

Verificación realizada con Node.js, DOM simulado, análisis HTML y PostCSS: 67 registros por sección; búsqueda por título/código con y sin acentos; paginación y límites 10/25/50; orden ascendente/descendente antes de paginar; exportación de todas las páginas; integración con los filtros existentes; bloques de proyectos; apertura de diálogos; alternancia accesible de detalles; estados vacíos; esquema y alineación de columnas; IDs y etiquetas; campos adicionales; escape HTML y enlaces; datos originales sin mutaciones; salidas de servidor poblada y FA-005. El resultado renderizado, las descargas reales y la impresión siguen pendientes de validación manual en Apps Script por las restricciones del entorno.


## Alturas iguales y datos en columnas principales

Publicaciones, Proyectos y Eventos tienen una altura compartida de 640 px en escritorio y 680 px en móvil. Sus contenidos desplazan dentro del cuadro y los controles permanecen en su estructura. La impresión y descarga visual mantienen altura libre para no recortar datos.

Los campos antes desplegados desde Acciones ahora son columnas de la tabla principal, incluidos autores, métricas, objetivos, resultados, documentos y campos adicionales. Acciones conserva solo el enlace de evidencia o el aviso de su ausencia. Se conservan los bloques de Proyectos/Eventos y sus diálogos, así como búsqueda, filtros, ordenación, paginación y CSV.

Archivos: Scripts.html, Estilos.html y este documento. Verificado con análisis JS/CSS y DOM simulado: campos en celdas visibles, correspondencia entre columnas y celdas, ausencia de filas de detalles ocultas, enlaces y exportación CSV. Pendiente la medición visual en navegador por las restricciones del entorno.

## Perfil según image.png y simplificación de controles

Se inspeccionó la referencia image.png y se adaptó su estructura al tema claro de Empiria: icono de perfil, nombre, carrera/categoría, insignia RENACYT, datos en dos columnas, líneas de investigación y enlace CTI Vitae al pie. Se eliminan los fondos, radios y sombras de las respuestas; RENACYT conserva el único recuadro y utiliza la progresión neutro/champán/dorado/metálico según su nivel, equivalente a los umbrales de la tarjeta de ranking.

En Proyectos y Eventos, el selector de tamaño, CSV y Ver tabla comparten una fila; la búsqueda ocupa la fila anterior. Se retira el rango «1–1 de 1» de los tres pies. La paginación muestra flechas con etiquetas accesibles y «actual / total», sin palabras visibles de navegación. Se mantienen las alturas de 640 px en escritorio y 680 px en móvil, con desplazamiento interior.

Las cabeceras categóricas (Tipo, Estado, Indexación, Calidad, Rol, Modalidad, Línea, etc.) abren selección múltiple. Se aceptan varios valores de una columna y se combinan las restricciones entre columnas. Las cabeceras numéricas, fechas, códigos y títulos conservan ordenación; las columnas descriptivas y documentales son de lectura. Los filtros activos se señalan en cabecera y contador, pueden limpiarse con Mostrar todos y se aplican también a la exportación CSV.

Archivos modificados: ReporteInvestigador.html, Scripts.html, Estilos.html y este documento. Verificación con Node.js/DOM simulado, análisis HTML y PostCSS: selección múltiple, combinación de filtros, limpieza, ordenación, CSV filtrado de todas las páginas, paginación, etiquetas/IDs y estructura del perfil. No cambia Código.gs ni google.script.run. Continúa pendiente la comprobación renderizada e integrada en Apps Script; la imagen de referencia sí fue inspeccionada.

## Selección de ciclo y catálogos completos

- El ciclo elegido se distingue en negrita y con fondo de selección dentro del desplegable; se actualiza aria-pressed y solo queda una opción marcada. El selector tiene sombra y una elevación mayor al pasar el cursor.
- Las líneas de investigación vuelven a etiquetas redondeadas con sombra.
- Los filtros específicos y las cabeceras combinan los catálogos de opciones con los valores de todos los investigadores y ciclos cargados, independientemente de la tabla o página visible. Se conservan las selecciones activas. Las opciones sin coincidencias siguen disponibles y pueden producir un estado vacío.

Archivos: Index.html, Scripts.html, Estilos.html y este documento. Verificación con Node.js/DOM simulado y PostCSS: selección exclusiva de cada ciclo, opciones de otros investigadores/ciclos, catálogos sin registros y regresión de filtros múltiples, ordenación, paginación y CSV. No se modifica la comunicación con Apps Script. La revisión visual integrada sigue pendiente.
