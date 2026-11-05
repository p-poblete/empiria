// INICIO: Entrada de la aplicación web
function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Empiria · Gestión de investigación")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// FIN: Entrada de la aplicación web

// INICIO: Composición de plantillas HTML
// Evalúa inclusiones anidadas: Reportes compone sus dos submódulos HTML.
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

// FIN: Composición de plantillas HTML

// INICIO: Consulta y validación de datos para reportes
// La disponibilidad se deriva del contenido de BaseDatos.gs.
function obtenerDatosReportes() {
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

// INICIO: FA-007 de CU-005 · Consolidado del ciclo en Google Sheets
// Localiza el libro registrado para el ciclo y verifica permisos (paso 2); si no
// existe, lo crea, incorpora los datos y registra su identificador para no
// duplicarlo (paso 3). Un fallo se propaga al cliente como FA-017.
function obtenerConsolidadoCiclo(ciclo) {
  if (!ciclo) throw new Error("Ciclo no indicado.");
  var propiedades = PropertiesService.getScriptProperties();
  var clave = "CONSOLIDADO_" + ciclo;
  var id = propiedades.getProperty(clave);
  if (id) {
    try {
      return DriveApp.getFileById(id).getUrl();
    } catch (error) {
      // El identificador registrado ya no es accesible: se vuelve a crear.
    }
  }
  var libro = SpreadsheetApp.create("Empiria · Consolidado " + ciclo);
  var filas = [["ID", "Investigador", "Carrera", "RENACYT", "Publicaciones", "Proyectos", "Eventos"]];
  obtenerDatosReportes().investigadores.forEach(function (inv) {
    var delCiclo = function (lista) {
      return lista.filter(function (item) { return item.ciclo === ciclo; }).length;
    };
    filas.push([inv.id, inv.nombre, inv.carrera || "", inv.renacytNivel || "",
      delCiclo(inv.publicaciones), delCiclo(inv.proyectos), delCiclo(inv.eventos)]);
  });
  var hoja = libro.getSheets()[0];
  hoja.getRange(1, 1, filas.length, filas[0].length).setValues(filas);
  hoja.protect().setDescription("Consolidado de solo consulta").setWarningOnly(true);
  propiedades.setProperty(clave, libro.getId());
  return libro.getUrl();
}
// FIN: FA-007 de CU-005 · Consolidado del ciclo en Google Sheets
