# Descarga de reportes

La descarga de ambos reportes permite desplegar cada sección y elegir sus campos,
indicadores o gráficos. Las secciones desmarcadas y los elementos sin seleccionar
se excluyen de HTML, PDF, CSV y JSON. Las colecciones mantienen los filtros actuales.
Las opciones se restablecen al abrir nuevamente el diálogo.

HTML y PDF usan un documento independiente en A4 vertical. Las tablas anchas se
presentan en bloques de hasta cuatro campos y una columna correlativa «N.º» para
relacionar los registros entre bloques. Los encabezados se repiten al continuar
en otra página. Las series temporales largas se dividen en tramos con un pequeño
solapamiento para conservar la continuidad.

## Comprobaciones locales realizadas

- Sintaxis del JavaScript del cliente.
- Selección de un campo de publicaciones y exclusión de las demás secciones.
- Selección de una métrica dentro de un grupo de estadísticas.
- Generación de tablas divididas con las colecciones de BaseDatos.gs.
- Generación del documento sin investigadores ni publicaciones.

No se consiguió generar un PDF con el navegador local de prueba. La revisión
visual de la paginación queda pendiente en la vista previa de impresión.

## Validación en Google Apps Script

1. Abrir ambos reportes y descargar todas las secciones en HTML y PDF.
2. Comprobar A4 vertical, márgenes, encabezados repetidos y que ninguna celda
   salga de la tabla. Relacionar las continuaciones mediante «N.º».
3. Probar títulos, enlaces y campos anidados extensos; comprobar la continuidad
   de filas especialmente altas en varias páginas.
4. Elegir solo un indicador, un gráfico y algunos campos de una colección.
   Descargar en los cuatro formatos y verificar que se omiten los demás datos.
5. Desmarcar todos los elementos: debe solicitarse al menos un elemento.
6. Probar una serie con muchos periodos: debe continuar en tramos legibles.
7. Probar BaseDatos.gs con `investigadores: []` y restaurar después los datos
   originales. Este checkout usa la colección vacía en lugar de la antigua
   bandera `SIMULAR_SIN_INVESTIGADORES`.
