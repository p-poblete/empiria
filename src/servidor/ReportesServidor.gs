// INICIO: Consulta y validación de datos para reportes
// La disponibilidad se deriva del contenido de BaseDatos.gs.
function obtenerDatosReportes(opciones) {
  // Condiciones del prototipo: la petición sigue atravesando google.script.run.
  if (opciones && opciones.condicion === 'estructura') throw new Error('ESTRUCTURA: condición de prueba activa.');
  if (opciones && opciones.condicion === 'repositorio') throw new Error('REPOSITORIO: condición de prueba activa.');
  var base =
    typeof BASE_DATOS_EMPIRIA === "undefined"
      ? { investigadores: [] }
      : BASE_DATOS_EMPIRIA;
  // FA-012 de CU-005: los errores de estructura llevan el prefijo ESTRUCTURA para que
  // el cliente los distinga de una falla de conexión con el repositorio (FA-013).
  if (!base || !Array.isArray(base.investigadores)) {
    throw new Error(
      "ESTRUCTURA: BaseDatos.gs debe definir BASE_DATOS_EMPIRIA con una colección investigadores.",
    );
  }
  var investigadores = JSON.parse(JSON.stringify(base.investigadores));
  investigadores.forEach(function (inv, indice) {
    if (!inv || !inv.id || !inv.nombre)
      throw new Error(
        "ESTRUCTURA: investigador incompleto en BaseDatos.gs, fila " + (indice + 1) + ".",
      );
    ["publicaciones", "proyectos", "eventos", "entregas", "dias"].forEach(
      function (campo) {
        if (inv[campo] == null) inv[campo] = [];
        if (!Array.isArray(inv[campo]))
          throw new Error(
            "ESTRUCTURA: la colección " + campo + " de " + inv.id + " debe ser una lista.",
          );
      },
    );
    ["publicaciones", "proyectos", "eventos", "entregas"].forEach(
      function (campo) {
        inv[campo].forEach(function (registro) {
          if (
            !registro ||
            typeof registro !== "object" ||
            Array.isArray(registro)
          )
            throw new Error(
              "ESTRUCTURA: registro inválido en " + campo + " de " + inv.id + ".",
            );
        });
      },
    );
  });
  return { investigadores: investigadores };
}

// FIN: Consulta y validación de datos para reportes
