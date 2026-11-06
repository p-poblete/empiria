# Prueba individual de registro con Classroom

## Estado

Código preparado localmente, sin instalar ni ejecutar en Google. El proyecto facilitado por el usuario aparece como GCC_SI_Maquetado en metadatos, pero la descarga con el conector devuelve 403; no hay herramienta de Apps Script ni sesión local autenticada para sincronizarlo. No se creó ni publicó ninguna tarea real y no se enviaron invitaciones.

Clase, proyecto y cuenta de prueba están en `datos/registro-prueba.local.json`, ignorado por Git. No copiar esos datos al código público. Para otra instalación, partir de `datos/registro-prueba.example.json`.

## Archivo para el editor

Ejecutar `npm run preparar:registro`. Genera en una carpeta temporal:

- `EmpiriaRegistro.gs`: los siete módulos de registro y funciones privadas de arranque configuradas para la prueba local.
- `manifest-requerido.json`: servicio avanzado Classroom y permisos necesarios. Es una referencia para combinar con el manifiesto existente, no para reemplazarlo entero.

En el proyecto de Apps Script proporcionado, añadir un archivo de secuencia de comandos nuevo llamado `EmpiriaRegistro` y pegar el archivo generado. Conservar los archivos existentes. Activar el servicio avanzado **Google Classroom API**, identificador **Classroom**, versión **v1**. Comprobar los permisos del manifiesto existente contra el fragmento generado. No hace falta desplegar la web para ejecutar estas funciones desde el editor.

Ejecutar con la cuenta docente que administra la clase. Todas las funciones terminan en `_`: no son endpoints de `google.script.run`. El acceso también se comprueba contra la cuenta activa y la lista de administradores configurada.

## Recorrido de prueba

1. **`empiriaConfigurarPrueba_`** verifica el rol docente en la clase y configura propiedades. Si ya hay configuración distinta o administradores que no incluyen al operador, falla sin sustituirla.
2. **`empiriaPrepararPrueba_`** verifica que el investigador ya pertenece a la clase, prepara una plantilla específica con Journal y auxiliares, aplica protecciones, crea/reutiliza una tarea **DRAFT** dirigida solo a esa cuenta y registra identidad, asignación y secciones en BD. No invita ni publica. La plantilla maestra debe estar vacía de respuestas.
3. Revisar el borrador y su adjunto. **`empiriaPublicarPrueba_`** es una acción separada y explícita: publica esa tarea individual. El usuario gestiona las invitaciones a la clase.
4. El investigador abre la tarea para que Classroom materialice la copia; la entrega puede no tener archivo antes de abrirla. Completa un artículo sintético en la fila 2 de Journal. No rellenar IDs.
5. **`empiriaDiagnosticarPrueba_`** comprueba identidad, estructura y rangos protegidos sin escribir datos. Devuelve propietario y estado de las protecciones. Con la cuenta investigadora, intentar editar un encabezado, un ID y eliminar una fila/hoja; registrar qué permite realmente Classroom. Si el investigador es propietario, las protecciones no constituyen un bloqueo absoluto.
6. **`empiriaAplicarProtecciones_`** permite al docente configurar de nuevo las protecciones de la copia cuando sus permisos lo permitan. Repetir diagnóstico; una comprobación de rangos no sustituye probar con la cuenta investigadora.
7. **`empiriaPrepararReferencias_`** reserva IDs persistentes y los escribe en las filas con datos de la copia. Prepara selectores con `ID · título` y `ID · nombre` para vincular participantes/actividades; no importa todavía los datos académicos. Invocar de nuevo al añadir nuevos registros principales.
8. El investigador entrega la tarea. **`empiriaRecolectarPrueba_`** acepta solo estado TURNED_IN, valida todo el conjunto antes de guardar, importa en BD y registra los orígenes. Repetir para comprobar que actualiza el mismo destino sin duplicar. Si se necesita corregir la copia entregada, usar el flujo de Classroom y volver a entregar antes de recolectar.

## Restricciones verificables

- Solo se leen las secciones persistidas en `SYS - Secciones asignadas`, no una lista enviada por el navegador ni las hojas añadidas por el investigador.
- IDs desconocidos, duplicados, retirados o relaciones técnicas cambiadas bloquean la lectura. La copia queda vinculada a la entrega; cambiar el archivo exige revisión explícita.
- Se rechazan fórmulas, encabezados alterados y columnas adicionales en secciones asignadas. No se ejecutan como fórmulas los textos copiados a BD.
- Una recolección repetida conserva ID de origen y de destino. Una reserva interrumpida se recupera solo con contenido coincidente y único; ante ambigüedad requiere revisión.
- Vaciar datos no borra lo ya recolectado. No se borran físicamente filas ni pestañas desde el recolector.
- Nuevas contribuciones canónicas se crean con identidad **Pendiente**; no acreditan autoría ni deduplicación institucional definitiva. Los participantes se contrastan con personas verificadas y se conservan como relaciones pendientes de revisión.

## Bajas

El operador puede ejecutar desde el editor `solicitarBajaRegistro_(idOrigen, motivo)` y después `resolverBajaRegistro_(idSolicitud, aprobar, motivo)`. La solicitud se registra en `SYS - Bajas` y una resolución no se sobrescribe. Una baja aprobada impide que una nueva recolección reactive ese origen, sin eliminar los datos históricos. El futuro lector real de CU-005 deberá excluir esos orígenes; el reporte demo actual no consulta estas tablas.

## Alcance de esta implementación

- Módulos: RegistroEsquema, Registro, RegistroGoogle, RegistroReferencias, RegistroRecoleccion, RegistroBajas y RegistroPrueba.
- Los endpoints públicos de demostración y la interfaz Alpine mantienen su modo demo. El código real se ejecuta explícitamente desde el editor; no se conecta todavía a los botones de CU-002 ni a CU-005.
- La recogida inicial es por entrega individual y solo enviada. Quedan fuera de esta prueba la programación automática y la recolección masiva.
- La BD se amplió con `ID actividad` en las tres ACT y `SYS - Bajas`; estas estructuras están vacías y preparadas para el código. Los registros históricos no se corrigieron.
- Resultados de integración real: pendientes. No afirmar que funcionaron Classroom, sus permisos o las protecciones de copias hasta ejecutar este recorrido con ambas cuentas.

Fuentes: [materiales y copias individuales](https://developers.google.com/workspace/classroom/reference/rest/v1/Material), [gestión de tareas](https://developers.google.com/workspace/classroom/guides/manage-coursework), [protecciones de Sheets](https://developers.google.com/apps-script/reference/spreadsheet/protection).
