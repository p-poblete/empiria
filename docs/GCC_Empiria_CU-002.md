# 

# **SIS-INVESTIGACIÓN**

# **CU-002: Generar Actividad de Seguimiento**

# 

# **Caso de Uso: Generar Actividad de Seguimiento**

## 

## **1\. Datos generales del caso de uso**

### **1.1 Breve descripción del caso de uso**

Este caso de uso describe el proceso mediante el cual el Director de Investigación publica una actividad de seguimiento en Google Classroom para los investigadores del ciclo académico activo. El Director accede a la plataforma web Empiria, selecciona el módulo de Tareas, completa el formulario de asignación con los datos de la actividad y la plantilla base, y publica la tarea en Google Classroom. El sistema valida las precondiciones del ciclo, la clase y la plantilla, aplica control de concurrencia, crea la tarea con la plantilla adjunta en modo de trabajo individual por estudiante y registra el identificador de la tarea en la base de datos del sistema.

### **1.2 Actores del caso de uso**

| ACTOR | DESCRIPCIÓN |
| :---- | :---- |
| Director de Investigación | Usuario principal que accede a la plataforma Empiria con su cuenta institucional, selecciona el módulo de Tareas, configura los parámetros de la actividad y publica la tarea en Google Classroom. |
| Sistema | Plataforma web Empiria (HTML \+ Google Apps Script) que valida las precondiciones, presenta los formularios, verifica el control de concurrencia, crea la tarea en Google Classroom, registra el identificador de la tarea en la base de datos y muestra los mensajes de resultado al Director. |

### 

### **1.3 Precondiciones**

| PRECONDICIÓN |
| :---- |
| 1\. La base de datos del sistema está disponible. |
| 2\. Existe un ciclo académico con estado "Activo" registrado en la base de datos del sistema. |
| 3\. El ciclo activo tiene registrado un identificador de clase de Google Classroom válido. |
| 4\. El ciclo activo tiene una plantilla base asociada, almacenada en Google Drive. |
| 5\. La plantilla base es accesible para Google Classroom y no contiene elementos protegidos que impidan su clonación. |
| 6\. El Director de Investigación tiene el rol de Profesor en la clase de Google Classroom vinculada al ciclo activo. |
| 7\. La clase de Google Classroom vinculada al ciclo activo tiene al menos un estudiante asignado, correspondiente a un investigador con estado "Activo". |

### **1.4 Glosario de Términos**

| TÉRMINO | DESCRIPCIÓN |
| :---- | :---- |
| Ciclo Académico | Periodo lectivo identificado por un año y un semestre (por ejemplo, 2026-I, 2026-II). Constituye la unidad temporal sobre la cual se organiza el seguimiento de investigación. |
| Ciclo Activo | Ciclo académico vigente en la base de datos del sistema. Solo un ciclo puede tener el estado "Activo" a la vez. |
| Ciclo Cerrado | Ciclo académico finalizado. Su información permanece disponible para consulta, pero no admite nuevas publicaciones ni modificaciones. |
| Ciclo Seleccionado | Ciclo académico que el Director de Investigación elige en el selector global de la plataforma. Por defecto, el ciclo seleccionado es el ciclo activo. |
| Base de Datos del Sistema | Repositorio de datos del sistema que almacena la información de ciclos, investigadores, plantillas, transacciones y registros de auditoría. |
| Plataforma Empiria | Aplicación web (HTML \+ Google Apps Script) que sirve como interfaz principal del sistema. |
| Plantilla Base | Archivo de Google Sheets que sirve como modelo para que cada investigador complete su información académica. |
| Actividad de Seguimiento | Tarea creada en Google Classroom que contiene la plantilla base adjunta en modo de trabajo individual por estudiante. |
| Modo de Trabajo Individual | Configuración de Google Classroom que genera automáticamente una copia editable de un archivo adjunto para cada estudiante de la clase. |
| Copia Individualizada | Réplica de la plantilla base generada automáticamente por Google Classroom para un investigador específico. |
| Rango de Hojas | Conjunto de hojas específicas de la plantilla base que se incluirán en la tarea. Se define mediante el nombre de la hoja inicial y el nombre de la hoja final. |
| Identificador de Tarea | Código único que Google Classroom asigna a la tarea al momento de su creación. |
| Fecha y Hora de Entrega | Momento límite establecido por el Director de Investigación para que los investigadores entreguen su plantilla completada. |
| Transacción | Registro del intento de publicación con su estado (En Proceso, Completado, Fallido o Cancelado) en la base de datos del sistema. |
| Control de Concurrencia | Mecanismo que impide que se ejecuten dos publicaciones simultáneas sobre el mismo ciclo activo. |
| Reintento Progresivo | Estrategia que repite una operación fallida tras una espera creciente entre intentos. |

### **1.5 Referencias Externas**

Este caso de uso se apoya en las siguientes APIs y servicios de Google:

- **Google Classroom API:** para la creación y publicación de tareas y la asignación de materiales en modo de trabajo individual por estudiante.  
- **Google Drive API:** para la verificación de la existencia, accesibilidad y permisos de la plantilla base.  
- **Google Apps Script:** como plataforma de ejecución del backend y de la aplicación web.

  ### **1.6 Alcance del Caso de Uso**

Este caso de uso cubre únicamente el flujo de publicación de una actividad de seguimiento en Google Classroom a partir del formulario del módulo Tareas. Quedan fuera del alcance de este caso de uso:  
Este caso de uso cubre únicamente el flujo de publicación de una actividad de seguimiento en Google Classroom a partir del formulario del módulo Tareas. Quedan fuera del alcance de este caso de uso:

- La gestión de ciclos académicos (crear, activar, cerrar). Corresponde a **CU-001**.  
- La gestión de plantillas base (subir, validar, listar). Corresponde a **CU-003**.  
- La consulta de respuestas de investigadores. Corresponde a **CU-004**.  
- La generación de reportes. Corresponde a **CU-005**.  
- La navegación general por la plataforma y el inicio de sesión. Corresponde a **CU-000**.

## **2\. Flujo de Eventos**

### **2.1 Flujo Básico**

| ACTOR (Director de Investigación) | SISTEMA |
| :---- | :---- |
| 1\. El Director de Investigación accede a la plataforma Empiria con su cuenta institucional. |  |
|  | 2\. El sistema valida la sesión del Director de Investigación. |
|  | 3\. El sistema valida la disponibilidad de la base de datos del sistema. |
|  | 4\. El sistema lee el ciclo activo desde la base de datos del sistema. |
|  | 5\. El sistema lee la lista de ciclos disponibles y sus estados. |
|  | 6\. El sistema presenta el panel principal con el ciclo activo seleccionado por defecto y el menú de navegación. |
| 7\. El Director de Investigación selecciona el módulo "Tareas" en el menú de navegación. |  |
|  | 8\. El sistema presenta la vista del módulo Tareas con el botón "Asignar tarea". |
| 9\. El Director de Investigación presiona el botón "Asignar tarea". |  |
|  | 10\. El sistema valida que el ciclo seleccionado tenga estado "Activo". |
|  | 11\. El sistema valida que el ciclo seleccionado tenga un identificador de clase de Google Classroom registrado. |
|  | 12\. El sistema valida que el ciclo seleccionado tenga una plantilla base asociada. |
|  | 13\. El sistema valida que el archivo de la plantilla base exista en Google Drive. |
|  | 14\. El sistema valida que la plantilla base sea accesible para Google Classroom. |
|  | 15\. El sistema obtiene la lista de estudiantes asignados a la clase de Google Classroom del ciclo seleccionado. |
|  | 16\. El sistema valida que la clase tenga al menos un estudiante asignado. |
|  | 17\. El sistema presenta el formulario de asignación de tarea con los campos: ciclo (solo lectura), clase (solo lectura), título, descripción, fecha, hora, selector de plantilla y rango de hojas. |
| 18\. El Director de Investigación ingresa el título de la actividad. |  |
| 19\. El Director de Investigación ingresa la descripción de la actividad. |  |
| 20\. El Director de Investigación selecciona la fecha de entrega. |  |
| 21\. El Director de Investigación selecciona la hora de entrega. |  |
| 22\. El Director de Investigación selecciona la plantilla base desde el selector. |  |
| 23\. El Director de Investigación define el rango de hojas de la plantilla. |  |
| 24\. El Director de Investigación presiona el botón "Crear Tarea". |  |
|  | 25\. El sistema valida que el título no esté vacío. |
|  | 26\. El sistema valida que la descripción no esté vacía. |
|  | 27\. El sistema valida que la fecha y hora de entrega sean posteriores a la fecha y hora actuales. |
|  | 28\. El sistema valida que la fecha y hora de entrega no excedan la fecha de fin del ciclo seleccionado. |
|  | 29\. El sistema valida que se haya seleccionado una plantilla base. |
|  | 30\. El sistema valida que el rango de hojas sea coherente con la estructura de la plantilla. |
|  | 31\. El sistema valida que no exista una tarea con el mismo nombre en la clase de Google Classroom del ciclo seleccionado. |
|  | 32\. El sistema verifica que no exista otra publicación en curso para el mismo ciclo seleccionado. |
|  | 33\. El sistema deshabilita el botón "Crear Tarea" y muestra un indicador de progreso. |
|  | 34\. El sistema registra el inicio de la transacción con estado "En Proceso" en la base de datos del sistema. |
|  | 35\. El sistema crea la tarea en Google Classroom con el título, la descripción y la fecha y hora de entrega definidos. |
|  | 36\. El sistema adjunta la plantilla base a la tarea en modo de trabajo individual por estudiante. |
|  | 37\. El sistema publica la tarea en Google Classroom. |
|  | 38\. El sistema recibe el identificador de la tarea asignado por Google Classroom. |
|  | 39\. El sistema registra el identificador de la tarea en la base de datos del sistema. |
|  | 40\. El sistema actualiza el estado de la transacción a "Completado" en la base de datos del sistema. |
|  | 41\. El sistema registra la operación en el registro de auditoría con marca temporal, ciclo, investigador responsable e identificador de la tarea. |
|  | 42\. El sistema muestra el modal de confirmación con el mensaje "¡Tarea Asignada\!" y el detalle de la publicación. |
| 43\. El Director de Investigación revisa el modal de confirmación. |  |
| 44\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 45\. El sistema cierra el modal, limpia el formulario y oculta el formulario de asignación. |
|  | 46\. Google Classroom envía las notificaciones por correo electrónico a los investigadores asignados. |
|  | 47\. El caso de uso termina exitosamente. |

### 

### **2.2  Flujos Alternativos**

#### *2.2.1 FA-001: Sesión inválida o expirada al acceder*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 2 del Flujo Básico, el sistema detecta que la sesión del Director de Investigación no es válida o ha expirado. |
|  | 2\. El sistema redirige al Director de Investigación a la pantalla de inicio de sesión. |
|  | 3\. El sistema muestra el mensaje: "Su sesión ha expirado. Inicie sesión nuevamente para continuar." |
| 4\. El Director de Investigación inicia sesión nuevamente. |  |
|  | 5\. El flujo regresa al paso 1 del Flujo Básico. |

#### 

#### *2.2.2 FA-002: La base de datos del sistema no está disponible*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 3 del Flujo Básico, el sistema no puede conectar con la base de datos del sistema. |
|  | 2\. El sistema muestra el mensaje: "El servicio no está disponible en este momento. Intente nuevamente en unos minutos." |
| 3\. El Director de Investigación presiona el botón "Reintentar". |  |
|  | 4\. El sistema reintenta la conexión hasta tres veces. |
|  | 5\. Si la conexión falla después de los tres intentos, el caso de uso termina sin permitir el acceso. |

#### 

#### *2.2.3 FA-003: No existe un ciclo activo*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 4 del Flujo Básico, el sistema detecta que no existe un ciclo con estado "Activo". |
|  | 2\. El sistema muestra el mensaje: "No existe un ciclo académico activo. Active un ciclo antes de continuar." |
| 3\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 4\. El sistema redirige al Director de Investigación al módulo de Ciclos. |
|  | 5\. El caso de uso termina sin generar la actividad. |

#### 

#### *2.2.4 FA-004: El ciclo seleccionado tiene estado "Cerrado"*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. El Director de Investigación selecciona un ciclo con estado "Cerrado" en el selector global. |  |
| 2\. El Director de Investigación selecciona el módulo "Tareas". |  |
|  | 3\. Durante el paso 8 del Flujo Básico, el sistema detecta que el ciclo seleccionado no está activo. |
|  | 4\. El sistema presenta la vista del módulo Tareas en modo de solo consulta. |
|  | 5\. El sistema deshabilita el botón "Asignar tarea". |
|  | 6\. El sistema muestra el mensaje: "El ciclo seleccionado está cerrado. Seleccione el ciclo activo para publicar nuevas actividades." |
| 7\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 8\. El caso de uso termina sin generar la actividad. |

#### 

#### *2.2.5 FA-005: El ciclo seleccionado no tiene clase de Google Classroom asociada*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 11 del Flujo Básico, el sistema detecta que el ciclo seleccionado no tiene un identificador de clase registrado. |
|  | 2\. El sistema muestra el mensaje: "El ciclo seleccionado no tiene una clase de Google Classroom asociada. Configure la clase antes de continuar." |
| 3\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 4\. El caso de uso termina sin generar la actividad. |

#### 

#### *2.2.6 FA-006: El ciclo seleccionado no tiene plantilla base asociada*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 12 del Flujo Básico, el sistema detecta que el ciclo seleccionado no tiene una plantilla base asociada. |
|  | 2\. El sistema muestra el mensaje: "El ciclo seleccionado no tiene una plantilla base asociada. Configure una plantilla antes de continuar." |
| 3\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 4\. El caso de uso termina sin generar la actividad. |

#### *2.2.7 FA-007: La plantilla base no existe en Google Drive*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 13 del Flujo Básico, el sistema no encuentra el archivo de la plantilla base en Google Drive. |
|  | 2\. El sistema muestra el mensaje: "La plantilla base asociada al ciclo no existe en Google Drive. Verifique el enlace del archivo." |
| 3\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 4\. El caso de uso termina sin generar la actividad. |

#### *2.2.8 FA-008: La plantilla base no es accesible para Google Classroom*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 14 del Flujo Básico, el sistema detecta que la plantilla base tiene restricciones de acceso que impiden su uso por Google Classroom. |
|  | 2\. El sistema muestra el mensaje: "La plantilla base no es accesible para Google Classroom. Verifique los permisos del archivo en Google Drive." |
| 3\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 4\. El caso de uso termina sin generar la actividad. |

#### *2.2.9 FA-009: La clase de Google Classroom no tiene estudiantes asignados*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 16 del Flujo Básico, el sistema detecta que la clase no tiene estudiantes asignados. |
|  | 2\. El sistema muestra el mensaje: "La clase de Google Classroom del ciclo seleccionado no tiene estudiantes asignados. Asigne investigadores a la clase antes de continuar." |
| 3\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 4\. El caso de uso termina sin generar la actividad. |

#### *2.2.10 FA-010: Datos del formulario incompletos o inválidos*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. El Director de Investigación deja un campo obligatorio vacío o ingresa una fecha inválida. |  |
| 2\. El Director de Investigación presiona el botón "Crear Tarea". |  |
|  | 3\. Durante los pasos 25, 26, 27, 28, 29 o 30 del Flujo Básico, el sistema detecta la inconsistencia. |
|  | 4\. El sistema muestra el mensaje correspondiente:   • "El título de la actividad es obligatorio."   • "La descripción de la actividad es obligatoria."   • "La fecha y hora de entrega deben ser posteriores a la fecha y hora actuales."   • "La fecha y hora de entrega no pueden exceder la fecha de fin del ciclo seleccionado."   • "Debe seleccionar una plantilla base."   • "El rango de hojas no es válido para la plantilla seleccionada." |
| 5\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 6\. El flujo regresa al paso 18 del Flujo Básico. |

#### *2.2.11 FA-011: Ya existe una tarea con el mismo nombre en la clase*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 31 del Flujo Básico, el sistema detecta que ya existe una tarea con el mismo nombre en la clase de Google Classroom del ciclo seleccionado. |
|  | 2\. El sistema muestra el mensaje: "Ya existe una tarea con el mismo nombre en esta clase. Modifique el título de la actividad antes de continuar." |
| 3\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 4\. El flujo regresa al paso 18 del Flujo Básico. |

#### *2.2.12 FA-012: Ya existe una publicación en curso*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 32 del Flujo Básico, el sistema detecta que existe otra publicación en curso para el mismo ciclo seleccionado. |
|  | 2\. El sistema muestra el mensaje: "Ya existe una publicación en curso. Espere a que finalice antes de iniciar una nueva." |
| 3\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 4\. El caso de uso termina sin generar la actividad. |

#### *2.2.13 FA-013: El Director cancela el formulario antes de publicar*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. En cualquier momento entre los pasos 18 y 24 del Flujo Básico, el Director de Investigación presiona el botón "Cancelar". |  |
|  | 2\. El sistema descarta los datos del formulario. |
|  | 3\. El sistema oculta el formulario de asignación y muestra el placeholder del módulo Tareas. |
|  | 4\. El sistema muestra el mensaje: "Publicación cancelada." |
|  | 5\. El caso de uso termina sin generar la actividad. |

#### *2.2.14 FA-014: El Director cancela la publicación en curso*

| ACTOR | SISTEMA |
| :---- | :---- |
| 1\. Durante el paso 35 del Flujo Básico, el Director de Investigación presiona el botón "Cancelar Publicación". |  |
|  | 2\. El sistema detiene el procesamiento de la publicación. |
|  | 3\. El sistema verifica si la tarea ya fue creada en Google Classroom. |
|  | 4\. Si la tarea no fue creada, el sistema descarta la transacción y actualiza su estado a "Cancelado". |
|  | 5\. Si la tarea ya fue creada, el sistema elimina la tarea de Google Classroom. |
|  | 6\. El sistema actualiza el estado de la transacción a "Cancelado". |
|  | 7\. El sistema muestra el mensaje: "Publicación cancelada. No se generaron cambios en Google Classroom." |
| 8\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 9\. El caso de uso termina sin generar la actividad. |

#### 

#### *2.2.15 FA-015: Error de permisos en Google Classroom*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 35 del Flujo Básico, el sistema no puede crear la tarea porque el Director de Investigación no tiene el rol de Profesor en la clase. |
|  | 2\. El sistema registra el error en el registro de auditoría con el tipo "Permisos". |
|  | 3\. El sistema actualiza el estado de la transacción a "Fallido". |
|  | 4\. El sistema habilita nuevamente el botón "Crear Tarea". |
|  | 5\. El sistema muestra el mensaje: "Error de permisos. Asegúrese de tener el rol de Profesor en la clase de Google Classroom." |
| 6\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 7\. El caso de uso termina sin generar la actividad. |

#### *2.2.16 FA-016: Error de cuota excedida en las APIs de Google*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 35 del Flujo Básico, el sistema recibe una respuesta de cuota excedida desde las APIs de Google. |
|  | 2\. El sistema reintentar la operación hasta tres veces con espera progresiva entre intentos. |
|  | 3\. Si la operación se completa en algún reintento, el flujo continúa en el paso 38 del Flujo Básico. |
|  | 4\. Si la operación falla después de los tres intentos, el sistema registra el error en el registro de auditoría con el tipo "Cuota". |
|  | 5\. El sistema actualiza el estado de la transacción a "Fallido". |
|  | 6\. El sistema habilita nuevamente el botón "Crear Tarea". |
|  | 7\. El sistema muestra el mensaje: "El servicio de Google Classroom no está disponible en este momento. Intente nuevamente en unos minutos." |
| 8\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 9\. El caso de uso termina sin generar la actividad. |

#### *2.2.17 FA-017: Error al adjuntar la plantilla base a la tarea*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante el paso 36 del Flujo Básico, el sistema no puede adjuntar la plantilla base a la tarea. |
|  | 2\. El sistema registra el error en el registro de auditoría con el tipo "Adjunto". |
|  | 3\. El sistema elimina la tarea creada en Google Classroom. |
|  | 4\. El sistema actualiza el estado de la transacción a "Fallido". |
|  | 5\. El sistema habilita nuevamente el botón "Crear Tarea". |
|  | 6\. El sistema muestra el mensaje: "No se pudo adjuntar la plantilla base a la tarea. Verifique los permisos del archivo e intente nuevamente." |
| 7\. El Director de Investigación presiona el botón "Aceptar". |  |
|  | 8\. El caso de uso termina sin generar la actividad. |

#### *2.2.18 FA-018: Error de conexión con las APIs de Google*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante cualquier paso entre el 35 y el 38 del Flujo Básico, el sistema no recibe respuesta de las APIs de Google. |
|  | 2\. El sistema registra el error en el registro de auditoría con el tipo "Conexión". |
|  | 3\. El sistema actualiza el estado de la transacción a "Fallido". |
|  | 4\. El sistema habilita nuevamente el botón "Crear Tarea". |
|  | 5\. El sistema muestra el mensaje: "Error de conexión con los servicios de Google. Verifique su conexión e intente nuevamente." |
| 6\. El Director de Investigación presiona el botón "Reintentar". |  |
|  | 7\. El flujo regresa al paso 32 del Flujo Básico. |

#### *2.2.19 FA-019: Sesión expirada durante el procesamiento*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Durante cualquier paso entre el 32 y el 39 del Flujo Básico, el sistema detecta que la sesión del Director de Investigación ha expirado. |
|  | 2\. El sistema actualiza el estado de la transacción a "Fallido". |
|  | 3\. El sistema muestra el mensaje: "Su sesión ha expirado. Inicie sesión nuevamente para continuar." |
| 4\. El Director de Investigación inicia sesión nuevamente. |  |
|  | 5\. El sistema redirige al Director de Investigación al módulo Tareas con el ciclo activo seleccionado. |

#### *2.2.20 FA-020: Transacción colgada por cierre inesperado*

| ACTOR | SISTEMA |
| :---- | :---- |
|  | 1\. Al iniciar una nueva sesión, el sistema detecta que existe una transacción con estado "En Proceso" cuya marca temporal supera los treinta minutos de antigüedad. |
|  | 2\. El sistema actualiza el estado de la transacción a "Fallido". |
|  | 3\. El sistema registra la operación en el registro de auditoría con el tipo "Transacción Colgada". |
|  | 4\. El sistema continúa con el flujo normal de la nueva sesión. |

## **3\. Reglas de negocio y criterios de aceptación**

| ID | Regla / criterio verificable |
| :---- | :---- |
| RN-002-01 | El sistema impide publicar actividades en ciclos cerrados o inexistentes. |
| RN-002-02 | Título, instrucciones, fecha/hora futura y plantilla son obligatorios. |
| RN-002-03 | La fecha de entrega respeta la fecha de finalización del ciclo. |
| RN-002-04 | La plantilla se adjunta a Classroom para crear una copia independiente por investigador. |
| RN-002-05 | Dos intentos concurrentes no provocan publicaciones duplicadas sobre la misma operación. |
| RN-002-06 | El sistema identifica y comunica ausencia de clase, estudiantes o permisos antes de confirmar. |
| RN-002-07 | El identificador real de Classroom y las incidencias quedan en transacciones y auditoría. |
| RN-002-08 | El formulario puede cancelarse y restaura los controles sin afectar tareas ya existentes. |
| RN-002-09 | La información de tareas pertenece al ciclo activo y conserva la relación con la plantilla seleccionada. |

### 

### **4\. Especificación de interfaz y datos de la actividad**

| Elemento | Descripción y regla |
| :---- | :---- |
| Navegación | El Director ingresa en Empiria y elige **Tareas** desde la barra lateral. El sistema presenta una sola vista activa, conserva el ciclo elegido en la cabecera y muestra **Asignar tarea**. |
| Ciclo académico | Campo de solo lectura en el formulario, tomado del selector global; solo los ciclos **Activos** permiten publicación. El cambio a un ciclo cerrado cancela la edición abierta. |
| Clase | Campo de solo lectura; identifica la clase de Classroom asociada al ciclo seleccionado. |
| Título | Obligatorio; se eliminan espacios iniciales y finales y se comprueba que no esté duplicado en la misma clase. |
| Instrucciones / descripción | Obligatorio; texto proporcionado por el Director, tras eliminar espacios periféricos. |
| Fecha de entrega | Obligatoria, con fecha válida y límite posterior al momento de publicación y no posterior al cierre del ciclo. |
| Hora de entrega | Selector horario; el valor inicial visible es **23:59**. La fecha y hora se procesan conjuntamente según la zona horaria del contexto institucional. |
| Plantilla base | Selector de plantillas disponibles, identificadas por ID; se comprueba que el archivo exista y sea accesible. |
| Rango de hojas | Permite delimitar las hojas a incluir; los extremos deben existir y encontrarse en orden dentro de la plantilla elegida. |
| Botones | **Crear tarea** valida y publica; **Cancelar** y **X** descartan la edición antes del envío. Durante la publicación, Crear tarea permanece deshabilitado para impedir dobles envíos. |
| Confirmación | Modal **¡Tarea Asignada\!** con identificación de actividad y ciclo; **Aceptar** cierra la confirmación y restablece el estado inicial. |

### **5\. Postcondiciones**

- **Éxito:** actividad publicada en Classroom con copia individual de la plantilla por estudiante; identificador almacenado; transacción completada; auditoría y confirmación visibles.  
- **Cancelación previa:** formulario cerrado sin publicación; información no persistida como tarea.  
- **Fallo:** no se informa éxito; queda registrado el estado fallido y se verifica o revierte cualquier actividad creada parcialmente antes de permitir un nuevo intento.