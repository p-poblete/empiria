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
