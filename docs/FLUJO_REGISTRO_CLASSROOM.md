# Flujo acordado de registro y consulta

Decisión confirmada por el usuario el 2026-11-05. Define el comportamiento objetivo; no acredita que la integración real esté implementada. No requiere un formulario web de registro independiente.

## Recorrido

1. **CU-002 — Asignación:** el Director configura la actividad y la plantilla de registro. El servidor valida el contexto y publica en la clase del ciclo con una copia individual de la plantilla para cada miembro destinatario de Classroom. Registra la tarea y su contexto. Debe respetar el rango de hojas definido por la actividad.
2. **Captura individual:** cada investigador completa la copia que Classroom le asigna. La plantilla es el formulario de captura; no escribe directamente en la BD como parte de esta decisión.
3. **Recolección:** el servidor identifica las entregas y sus archivos, lee las secciones de cada copia, valida y normaliza sus registros y los vuelca en las tablas correspondientes de la BD. Esta responsabilidad pertenece al flujo de recolección/seguimiento, separado de la publicación y del reporte.
4. **CU-005 — Consulta:** Apps Script lee la BD y devuelve datos autorizados a Alpine. Alpine coordina filtros, resultados, indicadores, detalles y descargas. El reporte no recorre las copias de Classroom en cada consulta.

```text
Plantilla → CU-002 / Classroom → copias individuales → investigadores
                                                        ↓
CU-005 / Alpine ← Apps Script ← BD ← recolección de las copias
```

## Restricción de pestañas por tarea

Decisión del usuario: cada actividad puede asignar solo ciertas pestañas de Empiria_Registro. «Páginas» se entiende aquí como pestañas/hojas del libro.

- El Director selecciona al menos una sección principal. La selección objetivo es una lista explícita y puede contener secciones no consecutivas. El rango inicial/final actual solo expresa un subconjunto continuo; deberá traducirse a la lista o sustituirse por selección múltiple.
- El servidor valida las secciones contra el catálogo real de la plantilla y genera un libro específico de la tarea, conservando solo las secciones elegidas y sus auxiliares necesarias. No modificar la plantilla maestra. Preparar este libro antes de la distribución de copias individuales.
- Incluir `LEER PRIMERO` y `SYS - Contexto`; incluir Participantes/Actividades solo cuando corresponda a las secciones elegidas. No incluir `R - Base` como captura ordinaria. La ficha personal no es requisito de cada tarea: identidad del declarante se resuelve con Classroom.
- Persistir en `SYS - Secciones asignadas` la lista de secciones autorizadas por clase/tarea, plantilla específica y versión de esquema. Se añadió esta tabla vacía a Empiria_Base_de_Datos; la generación/publicación reales todavía no la rellenan.
- El recolector usa esa configuración persistida, nunca las pestañas que el alumno decida crear o las celdas editables de contexto. Solo importa secciones asignadas y relaciones hacia sus registros. Una sección excluida no es faltante, no implica una entrega incumplida y no causa borrados en BD.
- Si falta una sección asignada o cambia su estructura, registrar error de validación por origen. No sustituir datos anteriores ni afirmar recolección completa. Validar referencias de participantes y actividades contra registros de secciones permitidas.
- El libro específico omite las pestañas excluidas. Ocultar pestañas o columnas en una copia no es una restricción de acceso ni sustituye la validación del servidor. La integridad de IDs y las protecciones de edición son controles separados.

Estado del código revisado: `publicarActividadDemo` valida rango de hojas en un catálogo ficticio, pero no crea ni recorta un libro real. Esta sección establece el contrato para implementarlo; no acredita integración activa.

## Restricciones de edición dentro del registro

Aclaración del usuario: la restricción solicitada se refiere a qué puede modificar/eliminar el investigador, no solo a qué pestañas recibe. La selección parcial de pestañas se conserva como requisito independiente.

- Permitido: llenar y corregir datos académicos en las filas existentes de captura; una sola fila de ficha personal. Vaciar celdas de un borrador conserva la fila y sus IDs.
- Reservado al sistema: encabezados, tres IDs técnicos de secciones principales, ID de vínculo/actividad de auxiliares, contexto de asignación y catálogos. Los IDs de referencia de las auxiliares requieren selección/correspondencia validada; no equivalen a identidad acreditada por escribir un texto.
- Conservar nombres y estructura de hojas, filas y columnas; no eliminar filas completas para descartar un borrador. Una baja posterior a recolección debe ser explícita; no deducirla de una fila vacía ni de una pestaña ausente.
- Aplicadas en Empiria_Registro 16 protecciones de hoja con `warningOnly=false` y excepciones solo en rangos de datos. La ficha permite D2:Z2; otras secciones desde D2 hasta el último campo; auxiliares desde B2 (su ID técnico A queda protegido). Contexto, catálogos e instrucciones sin excepciones. Sin cambios en permisos de compartición del archivo.
- Verificados los 16 rangos protegidos, excepciones, ausencia de permiso a grupos/dominio y permanencia de encabezados. Los datos no se modificaron para probar las protecciones.
- Límite: el propietario del archivo siempre puede modificar las protecciones. No prometer bloqueo inalterable en copias de Classroom. Comprobar propietario, permisos y protecciones en copias reales; reconfigurar cuando corresponda y validar siempre encabezados, IDs y referencias desde el servidor. La aplicación de políticas a nuevas copias todavía no está implementada.

Fuentes oficiales: [protección de hojas](https://support.google.com/docs/answer/1218656?hl=es) y [Protection en Apps Script](https://developers.google.com/apps-script/reference/spreadsheet/protection).

## Identidad y trazabilidad

- Resolver la identidad del propietario de la entrega mediante la relación verificada entre usuario de Classroom e investigador de Empiria. El nombre o ID escrito en una celda no sustituye esa relación.
- Conservar clase, ciclo de asignación, tarea, entrega, archivo de origen, sección y registro de origen. El ciclo y la tarea provienen del contexto de asignación, no de texto editable de la plantilla.
- El propietario de la copia es quien declara la información. No equivale automáticamente a autor único, investigador principal ni a todos los participantes de una contribución.
- Para ficha personal, validar que el sujeto corresponde al investigador esperado; discrepancias requieren revisión. Para contribuciones compartidas, conservar participantes por ID y rol cuando se conozcan; no resolver homónimos por nombre.
- Mantener procedencia y fechas de recolección/actualización separadas de fecha académica y de estado de entrega/validación.

## Recolección repetible

- Cada registro capturado necesita un identificador estable dentro de su sección y archivo. La clave de importación combina clase/tarea/entrega/archivo/sección/registro de origen; no usar número de fila como identidad estable.
- Si la plantilla aún no guarda ese identificador, incorporarlo al contrato de captura antes de permitir actualizaciones automáticas. La asignación y conservación del ID deben ser responsabilidad controlada del sistema.
- Recolectar otra vez el mismo origen actualiza su registro de destino y conserva su ID en la BD; no añade otra fila por cada lectura.
- La identidad del origen evita duplicados de importación, pero no identifica una contribución compartida declarada en copias diferentes. Resolver su identidad canónica por separado antes de consolidar conteos institucionales.
- Validar antes de guardar; registrar por origen éxitos, errores y registros rechazados para permitir reintentos sin repetir los ya guardados. No afirmar éxito total si hubo fallos parciales.
- La ausencia de una fila en una lectura posterior no implica borrado automático de la BD. Definir política de bajas y correcciones antes de implementarlas.

## Límites de cada capa

| Capa | Responsabilidad |
| --- | --- |
| Alpine en CU-002 | Formulario, validaciones de ayuda, envío, espera, reintento, cancelación y resultado de asignación. |
| Servidor de CU-002 | Validaciones autorizadas, publicación real y registro persistente de la operación. |
| Plantilla individual | Captura de datos del investigador en sus secciones. |
| Servidor de recolección | Identificar entregas/copias, leer, validar, normalizar, relacionar y guardar sin duplicar importaciones. |
| BD de Sheets | Repositorio persistente de consulta y trazabilidad. |
| Servidor de CU-005 | Leer BD, aplicar acceso autorizado y preparar el contrato del reporte. |
| Alpine en CU-005 | Estado de consulta y presentación coherente de sus resultados. |

## Detalles pendientes de implementación

- Relación usuario Classroom ↔ ID investigador y catálogo de ciclos/clases/tareas.
- Identificador estable de registros dentro de la plantilla y correspondencia con tablas DB/ACT.
- Relaciones de autoría/participación y deduplicación entre copias.
- Momento de recolección: solo entregadas o también borradores; ejecución manual, programada o ambas. La decisión actual no fija esa política.
- Estados de entrega, revisión y bajas; autorización de acceso y errores parciales.

La plantilla y la BD compartidas se conservan. Cualquier cambio de esquema debe preservar sus datos y compatibilidad. El despliegue en Apps Script continúa pospuesto hasta solicitud explícita.
