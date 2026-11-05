# Escenarios de demostración

La tuerquita de la esquina superior derecha abre el selector de CU-002 y CU-005. Está disponible también desde el inicio de sesión. Elija un flujo y pulse **Probar escenario**. La tarjeta inferior indica qué acción ejecutar; **Restablecer** desactiva el escenario, cancela procesos pendientes y recupera los datos de consulta anteriores.

En Apps Script, agregue también el archivo HTML **Demostracion**, incluido desde Index. No se requieren cambios en los archivos del servidor.

## CU-002

- FA-001: muestra sesión expirada y permite iniciar sesión.
- FA-002: presenta el servicio caído con tres intentos; el último termina el acceso.
- FA-003: impide asignar y dirige a Ciclos al aceptar.
- FA-004: selecciona un ciclo cerrado y deshabilita Asignar tarea.
- FA-005 a FA-009: pulse Asignar tarea para ver cada precondición incumplida.
- FA-010: prepara un rango inválido. Crear tarea debe conservar el formulario y bloquear el envío. Corrija el nombre usando la lista de hojas. También puede vaciar título, descripción o plantilla, o ingresar una fecha pasada.
- FA-011: prepara un título duplicado; modifíquelo antes de reintentar.
- FA-012: bloquea otra publicación sobre el mismo ciclo.
- FA-013: Cancelar o X descarta los datos e informa la cancelación.
- FA-014: Crear tarea permite cancelar la publicación simulada sin mostrar éxito posterior.
- FA-015 a FA-018: Crear tarea muestra errores de permisos, cuota, adjunto o conexión. La cuota muestra tres reintentos con esperas crecientes; conexión permite recuperar el servicio simulado.
- FA-019: Crear tarea simula expiración durante el procesamiento y permite volver a Tareas al iniciar sesión.
- FA-020: comunica la transición simulada de una transacción antigua a Fallido; la sesión continúa normalmente.

## CU-005

Los escenarios usan un conjunto ficticio propio con contribuciones de los ciclos 2026-I y 2026-II, sin modificar BaseDatos.gs.

- FA-001 y FA-002: abren la modalidad correspondiente.
- FA-003: abre filtros y dispone de suficientes publicaciones para paginar.
- FA-004: abre el detalle de una contribución.
- FA-005: abre filtros del gráfico de series en carrera y línea.
- FA-006: abre la descarga con selección de contenido y formatos.
- FA-007: el botón de Sheets muestra una apertura simulada sin crear archivos.
- FA-008: solicita iniciar sesión nuevamente.
- FA-009: aplica una carrera sin investigadores; seleccione Todos para recuperar resultados.
- FA-010: conserva ficha y dedicación, sin contribuciones en el ciclo activo. Cambie al ciclo 2026-I para ver una publicación.
- FA-011: deja ausentes H-index y montos para observar No registrado.
- FA-012 y FA-013: ocultan las cifras y permiten recuperar la carga con Reintentar.
- FA-014: aplica una búsqueda sin coincidencias; borre el texto para recuperar registros.
- FA-015: abre un detalle sin evidencia. La ficha ofrece el portal general CTI Vitae.
- FA-016: deja las secciones sin marcar. Seleccione contenido y PDF para simular bloqueo de ventana; también puede cancelar el diálogo.
- FA-017: pulse Sheets para ver el fallo y reintentar sobre el consolidado existente simulado.
- FA-018: permite consultar, filtrar y exportar un ciclo cerrado.
- FA-019: cambie ciclo o modalidad para comprobar el recálculo.
- FA-020: aplique filtros, cierre y vuelva a abrir el diálogo para comprobar que se conservan.

Las condiciones externas (sesión, permisos, cuota, transacciones y archivos de Google) se simulan. Las validaciones y los controles locales de consulta sí ejecutan el comportamiento del maquetado. Restablecer descarta la edición de tareas abierta; no modifica registros reales.
