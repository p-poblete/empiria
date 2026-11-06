# Entrega Alpine — CU-002 y CU-005

Preparar con `node scripts/preparar-entrega-alpine.cjs`. La carpeta temporal contiene
25 archivos de aplicación separados y esta guía. No contiene configuración privada.
El paquete anterior con Index reunido queda sustituido por esta versión modular.

## Archivos exactos en Apps Script

Crear como **Secuencia de comandos** (el editor añade `.gs`):

```text
Código.gs          Entrada web doGet e inclusión de HTML
TareasServidor.gs          CU-002: catálogo, publicación demo y cancelación
ReportesServidor.gs        CU-005: consulta y validación de reportes
Consolidados.gs    Consulta o creación del consolidado Sheets
BaseDatos.gs       Datos de demostración
```

Crear como **HTML** (el editor añade `.html`):

```text
Index.html
Login.html
Marca.html
Inicio.html
Ciclo.html
Clases.html
Tareas.html
Plantillas.html
Reportes.html
ReporteInvestigador.html
ReporteCarrera.html
TablaPublicaciones.html
Navegacion.html
FlujosTareas.html
CondicionesPrueba.html
Scripts.html
Reactivos.html
AlpineTareas.html
AlpineReportes.html
Estilos.html
```

Son **25 archivos de aplicación**: cinco `.gs` y veinte `.html`.
Conservar además **appsscript.json** y **EmpiriaRegistro.gs** ya configurados.
No copiar los siete Registro*.gs porque duplicarían EmpiriaRegistro.gs.
Demostracion.html no está incluido por la aplicación actual.
Todos los nombres base son únicos, incluidos servidor y vistas HTML.

## Actualizar Apps Script

1. Conservar copia de los archivos remotos si tienen cambios propios.
2. Reemplazar Código.gs, BaseDatos.gs y todos los HTML existentes con los archivos del mismo nombre del paquete nuevo. Crear los que falten y los tres nuevos .gs: TareasServidor, ReportesServidor y Consolidados.
3. **Reemplazar Código.gs es obligatorio**: ahora contiene solo doGet/include. No dejar las funciones antiguas en ese archivo porque se duplicarían con los módulos nuevos. Revisar también que no exista otro doGet en archivos antiguos.
4. Copiar el Index.html modular de este paquete; necesita todos los HTML listados. No mezclarlo con el Index reunido del paquete anterior.
5. Conservar appsscript.json, propiedades y EmpiriaRegistro.gs. No hace falta ejecutar funciones manuales de registro para la entrega Alpine.
6. Guardar y abrir **Implementar → Implementaciones de prueba → Aplicación web**. Abrir la URL `/dev` con la cuenta editora: usa el último código guardado.
7. Si se presentará la URL `/exec`, actualizar su versión: **Implementar → Gestionar implementaciones → Editar → Versión: Nueva versión → Implementar**. Conservar ejecutar como y acceso actuales. Probar la URL final con la cuenta de la entrega.

## Recorrido mínimo de aceptación en Google

- Iniciar la sesión de demostración y navegar entre Inicio, Tareas y Reportes; entrar en los reportes investigador/carrera. Las vistas deben cambiar sin recargar la página.
- CU-002: entrar en Tareas. La consulta obtenerPlantillasTarea debe terminar y poblar el selector. Asignar tarea, usar título e instrucciones ficticios, fecha futura del ciclo 2026-II, plantilla disponible y rango Hoja1 a Hoja3. Crear: durante la petición cambia el botón y se bloquea el formulario; al terminar vuelve al estado habitual y aparece el resultado del servidor.
- CU-005: entrar en Reportes. Durante obtenerDatosReportes se muestra carga; al terminar aparecen selectores y publicaciones. Cambiar investigador/carrera y buscar en publicaciones: las filas cambian con x-for.
- Para demostrar carga si Google responde muy rápido, usar la limitación de red de las herramientas del navegador. No hace falta añadir retrasos artificiales al servidor.
- Comprobar error/reintento de reportes desde Condiciones de prueba, opción Repositorio no disponible; restaurar Disponible y reintentar. Confirmar que no queda bloqueado.
- Comprobar consola sin errores Alpine y que descargas y acciones de las vistas siguen disponibles.

La publicación CU-002 sigue siendo una simulación procesada por el servidor; CU-005
consulta los datos de demostración de BaseDatos.gs. Las llamadas google.script.run
son reales en Apps Script. La integración real Classroom/Sheets no está cerrada.
No presentar la demostración como integración real.

## Evidencia y explicación individual

| Requisito | CU-002 | CU-005 |
| --- | --- | --- |
| Navegación Alpine | Navegacion.html, store navegacion, x-show | Mismo store y pestañas investigador/carrera |
| Carga reactiva | AlpineTareas.html: cargandoPlantillas/publicando; Tareas.html: :disabled y x-text | AlpineReportes.html: cargando y finally; Reportes.html: mensaje y controles |
| Datos del servidor | obtenerPlantillasTarea → plantillas/disponibles → x-for de opciones | obtenerDatosReportes → datos → tablas → x-for de filas en TablaPublicaciones.html |

Para estudiar: [explicación del código](EXPLICACION_ENTREGA_ALPINE.md), [PDF](EXPLICACION_ENTREGA_ALPINE.pdf) y [guía de directivas](GUIA_ALPINE.md).
llamarServidor, en Reactivos.html, convierte callbacks de google.script.run en una
promesa. try inicia la petición, catch informa errores y finally restaura carga.
x-model sincroniza controles; x-for crea elementos desde arrays; :key identifica
cada elemento; x-text escribe texto; x-show conserva el DOM al cambiar de vista.

Las pruebas locales usan Alpine real y endpoints con servicios Google simulados;
la validación final exige recorrer ambos CUs en la URL de Apps Script.
