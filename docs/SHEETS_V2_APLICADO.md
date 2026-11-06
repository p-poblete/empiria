# Estructura de Sheets aplicada — 2026-11-05

Se actualizaron los libros originales **Empiria_Registro** y **Empiria_Base_de_Datos**, por solicitud del usuario. Conservar los nombres al referirse a ellos en conversación. Identificación y mapeo de fuentes en `MAPEO_SHEETS_CU005.md`; contrato vigente (revisión 3) en `esquema-sheets.json`.

## Empiria_Registro

- Por nueva solicitud del usuario se retiraron los formularios antiguos de las 12 secciones. Antes de eliminarlos se revisaron sus campos: solo etiquetas e instrucciones, sin respuestas. Las tablas quedaron con encabezados en fila 1, datos desde fila 2, encabezado inmovilizado y filtros hasta el final de la cuadrícula. La revisión inicial con captura en fila 60 quedó sustituida.
- Los tres IDs técnicos iniciales están ocultos y sus encabezados tienen notas de responsabilidad del sistema. Se ocultan también campos complementarios no aplicables por sección. Ocultar no equivale a restringir permisos ni generar IDs.
- Cada bloque conserva los campos de su sección y añade `ID registro origen`, `ID contribución canónica`, `ID registro padre origen`, `Fecha académica adicional`, `Ciclo de contribución` y `Moneda`.
- `SYS - Contexto`: versión y contexto verificable de Classroom. Pestaña oculta, igual que `R - Base` (catálogos del sistema). Sus campos de sistema están vacíos; escribirlos manualmente no acredita identidad. El código deberá rellenarlos y validar su procedencia.
- `R - Participantes`: vínculo sección/registro/persona/rol, tipo y vigencia. `R - Actividades`: múltiples actividades por registro padre de proyecto interno, semillero o grupo.
- `LEER PRIMERO` se reescribió y se movió al principio del libro: instrucciones de llenado desde fila 2, una contribución por fila y una ficha personal por copia. Se eliminaron las instrucciones antiguas de captura en fila 61.

Solo una ficha personal por copia; varias contribuciones por sección se registran en filas separadas. El sistema debe generar IDs estables antes de la primera importación y conservarlos al actualizar. Los IDs quedaron vacíos: no se simularon personas, operaciones ni relaciones.

Al asignar solo un rango de secciones en CU-002, el generador deberá incluir también las hojas auxiliares requeridas de contexto, participantes y actividades. No basta copiar únicamente las antiguas pestañas del rango.

## Empiria_Base_de_Datos

Se conservaron sin reordenar las 12 tablas `DB - ...` y las 3 tablas `ACT - ...`. Se añadieron nueve pestañas:

| Pestaña | Responsabilidad |
| --- | --- |
| `SYS - Personas` | Correspondencia verificada investigador Empiria/usuario Classroom. |
| `SYS - Asignaciones` | Universo de destinatarios por tarea, ciclo y vencimiento. |
| `SYS - Entregas` | Estado y archivos de cada entrega. Una fila por archivo. |
| `SYS - Orígenes` | Identidad del origen, destino DB/ACT y metadatos de importación. |
| `SYS - Contribuciones` | Identidad canónica de contribuciones declaradas en distintas copias. |
| `SYS - Participantes` | Relaciones personales y procedencia; deduplicar por relación canónica al contar. |
| `SYS - Recolecciones` | Ejecución, conteos y resultado de cada lectura. |
| `SYS - Errores` | Fallos por origen y resolución; mensajes sin datos personales. |
| `SYS - Esquema` | Mapa de secciones, filas de captura y destinos. |
| `SYS - Secciones asignadas` | Lista autorizada de pestañas principales/auxiliares por clase y tarea. Añadida al acordar asignaciones parciales; vacía hasta implementar servidor. |
| `SYS - Bajas` | Solicitudes y resoluciones de baja lógica auditada. Añadida durante la preparación de la prueba real; vacía hasta ejecutar el código. |

La trazabilidad adicional se almacena en `SYS - Orígenes`, sin insertar columnas en las tablas antiguas. Vincula `Tabla destino` + `ID registro destino` y conserva `ID registro padre origen` para actividades/documentos. El recolector debe resolver ese padre al ID persistente de destino; `ID registro` en ACT mantiene su referencia al padre, no es ID único de actividad.

Se amplió `LEER PRIMERO`, filas 24–36. `SYS - Esquema` y sus instrucciones se actualizaron a revisión 3 y filas 1/2. Solo se escribieron encabezados, instrucciones y configuración: las nuevas tablas operativas están vacías.

## Verificación y límites

- Lectura posterior de todos los encabezados añadidos y de las filas de contexto/esquema: coincidencia con contrato.
- Desplegables de estados, tipos de vínculo y secciones verificados por sus reglas nativas; celdas operativas vacías.
- Confirmadas 16 pestañas en Registro y 25 en BD.
- Ampliación posterior de restricciones por tarea: BD tiene 26 pestañas al añadir `SYS - Secciones asignadas`. Encabezados y validación Principal/Auxiliar verificados mediante API. Contrato en `FLUJO_REGISTRO_CLASSROOM.md`; la lógica de selección y recolección restringida aún no se ejecuta.
- Preparación de integración: añadida `SYS - Bajas` (27 pestañas en BD) e `ID actividad` en M de ACT - Proyectos internos y O de ACT - Semilleros/Grupo Investigación, previa comprobación de columnas vacías. Permiten actualizar actividades sin confundir su ID con el del padre. Encabezados y estados verificados por lectura; ningún registro histórico fue movido ni corregido.
- Implementación local y recorrido de prueba: `PRUEBA_REGISTRO_CLASSROOM.md`. La generación de IDs/recolección existe ahora en código privado, pero todavía no se instaló ni ejecutó en Google.
- Limpieza posterior: encabezados de las 12 secciones cotejados antes/después; columnas A:C ocultas verificadas en metadatos en ficha y Journal. Contexto y catálogo ocultos confirmados; encabezados inmovilizados restablecidos después de eliminar filas. Los IDs de pestaña se conservaron.
- Encabezados y muestra de fila 2 de las 15 tablas originales de BD comparados con lectura previa: sin cambios. Las escrituras no apuntaron a sus datos.
- Formato comprobado mediante API: encabezados grises y negrita, ajuste de texto, anchuras de columnas nuevas y avisos. No se dispuso de verificación visual en navegador.
- Crear tablas nativas devolvió error interno del conector; se usaron rangos con filtros y validación normal. No se afirma que existan tablas nativas o chips. El recolector debe leer por esquema y filas con contenido, no depender del filtro de 100 filas.
- Hay indicios de desalineación en registros históricos; no se corrigieron ni atribuyeron. Requieren auditoría separada antes de usarlos en indicadores.
- Sheets no impone relaciones ni unicidad automáticamente. Faltan generación de IDs, validación del contexto, recolector idempotente, deduplicación canónica y lector real de CU-005. Ningún Apps Script fue instalado o desplegado.

Siguiente paso: implementar el recolector contra este contrato con fixtures sintéticos y adaptar CU-005 al repositorio; mantener separado modo demo y modo real.
