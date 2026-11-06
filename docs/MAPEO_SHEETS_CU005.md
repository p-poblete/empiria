# CU-005: contrato de lectura de Google Sheets

Estado: diseño verificado contra encabezados y notas de los libros el 2026-11-05. No implementa todavía el lector ni acredita integración en Apps Script. No se copiaron filas personales ni se modificaron los libros.

Actualización posterior: por solicitud del usuario se completó la estructura de ambos libros y se limpiaron los formularios antiguos. Contrato vigente: revisión 3, encabezados en fila 1 y datos en fila 2. Ver [cambios aplicados y verificaciones](SHEETS_V2_APLICADO.md) y [contrato de columnas](esquema-sheets.json). El mapeo inicial siguiente describe las tablas originales; no se instaló el recolector ni el lector real.

## Fuentes y recorrido

Arquitectura acordada: [flujo de registro mediante copias individuales de Classroom](FLUJO_REGISTRO_CLASSROOM.md). CU-002 asigna, el investigador completa su copia, la recolección lee y vuelca en BD, y CU-005 consulta esa BD. No se plantea un registro web independiente ni escritura directa desde la plantilla. Las notas de los libros sobre integración Apps Script se concretan con este flujo.

- [BD](https://docs.google.com/spreadsheets/d/1JOwi7O7ZdHK16TMNMydyng7rG6aaONDSctEYa1vMjl0/edit): tablas persistentes de consulta.
- [Plantilla](https://docs.google.com/spreadsheets/d/1JyxAew7j0FXtmOHduXpe2PpVgX0qKmNUvBGzADfK76I/edit): captura `R - ...`, con contexto y campos; no es el repositorio de CU-005. Sus instrucciones plantean guardar por Apps Script, pero no se verificó ese proceso.

Recorrido propuesto: controlador Alpine de reportes → `obtenerDatosReportes` → lector de Sheets en servidor → normalización y validación → respuesta de consulta → tablas, indicadores y exportaciones. Reutilizar cálculos puros existentes después de corregir identidad y cobertura de datos.

## Mapeo de ficha

Fuente: `DB - Reg. Investigador`, encabezados en fila 1, 32 columnas.

| Contrato actual | Columna | Tratamiento |
| --- | --- | --- |
| `id` | `ID` | Es ID de registro según las notas; no asumir que equivale al ID maestro de persona. Definir clave canónica antes de unir contribuciones. |
| `nombre` | `Nombres`, `Apellidos` | Componer para presentar; nunca usar como clave de relación. |
| `dedicacion`, `categoria`, `carrera` | `Tipo de dedicación`, `Categoría`, `Carrera profesional` | Texto normalizado, conservar valor original para diagnóstico. |
| `renacytCodigo` | `Código RENACYT` | Texto; conservar ceros y prefijos. |
| `renacytGrupo`, `renacytNivel` | `Grupo y nivel RENACYT`, `Nivel clasificación RENACYT` | Separar grupo de clasificación; no interpretar etiquetas desconocidas como cero. |
| `ctivitaeUrl` | `CTIVITAE` | Admitir solo enlaces válidos; faltante permanece vacío. |
| `linea1`, `linea2`, nuevo `linea3` | `Línea de investigación 1/2/3` | El contrato debe preservar las tres líneas y actualizar el helper de líneas. |
| `dias` | `Disponibilidad lunes/martes/miércoles/jueves/viernes` | Definir valores admitidos: no usar simple presencia de texto, porque «No» también tiene contenido. |
| `dni`, `correo` | `DNI`, `Correo` | Solo devolver si la consulta está autorizada y realmente los requiere. No usar DNI como clave pública. |

Conservar internamente ciclo de captura, validación y marcas de actualización para resolver versiones. No mezclar fichas históricas sin una regla explícita. El registrante y el sujeto de la ficha pueden ser distintos.

## Mapeo de contribuciones

Cada fila requiere `origenTabla`, `idOrigen` y clave técnica compuesta `origenTabla:idOrigen`; esta evita colisiones entre secciones, pero no deduplica por sí sola una contribución real capturada dos veces. Requiere identidad canónica adicional cuando exista ese caso.

| Tabla | Colección/tipo | Columnas hacia contrato |
| --- | --- | --- |
| `DB - Journal` | `publicaciones`, Journal | `TÍTULO DEL ARTÍCULO` → titulo; `NOMBRE DEL JOURNAL/REVISTAS` → evento; `LINEA DE INVESTIGACIÓN` → linea; `INDEXACIÓN` → indexacion; `H-INDEX` → hIndex; `CUARTIL` → cuartil; `JIF - Journal Impact Factor` → jif; `JCI - Journla Citation Indicator` → jci; `FECHA DE PUBLICACIÓN` → fecha; `ESTADO` → estado. |
| `DB - Conferencia` | `publicaciones`, Conferencia | Título/línea/indexación/H-index/fecha/estado equivalentes; `NOMBRE DEL EVENTO` → evento; `RANKING` → rankingConferencia. No convertir ranking de conferencia en cuartil. |
| `DB - Revistas (editor)` | actividad editorial | Revista, indexación, H-index, cuartil, JIF y JCI disponibles; no hay título de artículo ni fecha de publicación. Separar de producción de artículos, aunque el filtro actual ofrece Editor. |
| `DB - Otras publicaciones` | `publicaciones`, Otro | `Título publicación` → titulo; `Tipo` → subtipo preservado; `Editorial`, `Rol`, `Estado`, `Link de evidencia`. No hay fecha de publicación explícita. |
| `DB - Proyectos internos` | `proyectos`, Interno | `N° proyecto` → numeroProyecto; `Título del proyecto` → titulo; `Tipo de Proyecto` → tipoProyecto; `Estado del proyecto` → estado; `Fecha inicio/fin` → fechaInicio/fechaFin; `Línea de investigación` → linea; objetivos/resultados para detalle; presupuesto/ejecutado si su unidad está confirmada. |
| `DB - Proyectos externos` | `proyectos`, Externo | Campos equivalentes y `Entidad que financia` → financiador. Preservar aportaciones monetarias y no monetarias por separado. |
| `DB - Eventos académicos` | `eventos` | `NOMBRE DEL EVENTO` → titulo; `TIPO DE EVENTO` → tipo; `MODALIDAD` → modalidad; `ESTADO` → estado; `FECHA` → fecha; `ROL` → rol; país/ciudad y enlaces de evidencia. No hay línea explícita ni ámbito nacional/internacional. |

Guardar ambos enlaces de evidencia cuando existan; no perder uno al reducirlos al actual `urlEvidencia`. Fecha de registro o guardado no sustituye la fecha académica. La falta de línea en un evento no autoriza atribuirle todas las líneas del investigador.

## Relaciones y fuentes complementarias

- `DB - Semilleros` y `DB - Grupo Investigación`: nombre, responsable e integrantes en texto. No unir automáticamente por similitud de nombre; hace falta membresía por ID con vigencia para poblar `grupos` y `semilleros` del investigador.
- `DB - Control Proyectos externos`: documentos del proyecto, no nuevos proyectos. Vincular por clave canónica; no basta el título. `Nº Proyecto` es candidato a correspondencia, pendiente de verificar unicidad y alcance.
- Tablas `ACT - ...`: `ID registro` parece referencia al padre, pero la semántica debe confirmarse. Actividades no son proyectos ni eventos académicos nuevos por defecto.
- `DB - Base`: catálogo `Tipo de catálogo`/`Valor`; verificar contenido y vocabularios antes de usarlo para opciones o validaciones. No acredita un catálogo de ciclos activos.
- `ID tarea / Classroom` e `ID entrega` aportan trazabilidad. No bastan para conocer tareas esperadas, vencimiento o entrega completada. `Estado de validación` no equivale a estado de entrega.

## Contrato propuesto y cambios necesarios

Mantener ficha de investigadores, pero separar colecciones canónicas de contribuciones y relaciones. Agregar metadatos de fuente, cobertura y advertencias. Es una evolución del contrato, no una respuesta intercambiable con la actual sin adaptar el cliente.

```text
investigadores: [{ idPersona, nombre, lineas, ...camposAutorizados }]
contribuciones: [{ idContribucion, origenTabla, idOrigen, tipo,
                  cicloCaptura, fechaAcademica, ...campos }]
participaciones: [{ idContribucion, idPersona, rol }]
membresias: [{ idPersona, idGrupoOSemillero, tipo, ...vigencia }]
metadatos: { fuente, consultadoEn, cobertura, advertencias }
```

No tomar `ID investigador (registrante)` como participación implícita: las instrucciones de BD lo prohíben expresamente como supuesto. No construir `autores` desde nombres de investigadores anidados como hace actualmente `registrosReporte()`; comparar IDs y resolver nombres solo para mostrar. Conservar contribuciones sin relación verificada, pero excluirlas de indicadores personales y advertir cobertura incompleta.

## Disponibilidad de indicadores

| Indicador | Condición para publicarlo |
| --- | --- |
| Ficha y filtros personales | Identidad estable, versión y vocabularios resueltos. |
| Publicaciones, Q1–Q2, Scopus/WoS | Atribución y deduplicación verificadas; definir estados incluidos y excluir actividad editorial del conteo de artículos. |
| H-index medio del medio | Solo valores numéricos presentes; ausente no es cero. El cálculo actual de calidad individual usa `Number(pub.hIndex) || 0` y debe corregirse. |
| Proyectos por estado | Identidad del proyecto y participantes verificados. |
| Financiamiento y ejecución | Unidad monetaria confirmada; no etiquetar PEN por defecto. No inferir avance físico desde porcentaje de gasto. |
| Eventos y participaciones | Relación persona/evento; diferenciar evento único de participación. Ámbito requiere fuente explícita. |
| Cumplimiento de entregas | Falta catálogo de tareas/asignaciones esperadas y estados efectivos; mostrar «No disponible», no `0 / 0` como resultado real. |
| Rankings/productividad | Cobertura suficiente y regla aprobada; no ordenar personas con atribuciones incompletas como si fueran datos completos. |

El ciclo de captura y el periodo académico de la contribución son dimensiones distintas. La UI actual filtra por `item.ciclo`; definir qué dimensión consulta antes de adaptar ese campo. No asignar ciclo actual a filas históricas sin ciclo.

## Secuencia de implementación propuesta

1. Resolver identidad personal, participantes, periodo y política de registros validados. Preparar propuesta de tablas auxiliares sin modificar aún la BD.
2. Crear lector de servidor configurado mediante propiedades del script; validar nombres de pestaña y encabezados, leer rangos usados en bloque y normalizar fechas/números. No exponer acceso arbitrario a IDs o rangos enviados por el navegador. Evitar devolver DNI, celular o correos por defecto.
3. Separar explícitamente modo demo y Sheets. Un fallo de Sheets debe mostrar error, nunca sustituirse silenciosamente por BaseDatos.gs. La vista local continúa con fixtures sintéticos.
4. Implementar modelo de consulta Alpine con una sola selección y resultado para tablas, indicadores, detalles y exportaciones; advertir datos incompletos. Mantener adaptadores separados para gráficos y descargas.
5. Actualizar consolidado desde el mismo repositorio y reglas, con protección de lectura y control de duplicados; el actual no actualiza libros existentes.
6. Probar con fixtures sintéticos: encabezados faltantes, filas vacías, números/fechas, duplicados, autores compartidos, referencias inexistentes, ausentes, permisos y errores. Integración real y despliegue solo cuando el usuario los solicite.

## Decisiones por confirmar

Queda acordado que la identidad del declarante se obtiene del propietario de la entrega/copia de Classroom mediante correspondencia verificada con Empiria. Faltan el mecanismo de esa correspondencia, identidad estable de registros en la copia y relaciones de participación. Propuesta: tablas auxiliares de personas, correspondencia de fichas y participaciones; mantener registrante como auditoría. Después confirmar ciclo consultable, estados válidos y política de recolección. Estas brechas no justifican inventar relaciones ni alterar datos originales.
