// El operador prepara las referencias mientras la copia todavía es borrador.
// Los selectores muestran ID · título/nombre; la lectura resuelve el ID y vuelve
// a contrastarlo con identidad y relaciones persistidas en el servidor.
function prepararReferenciasEntregaRegistro_(idClase, idTarea, idEntrega) {
  var contexto = contextoEntregaRegistro_(idClase, idTarea, idEntrega, true);
  var bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);
  try {
    var libro = SpreadsheetApp.openById(contexto.idArchivo);
    vincularArchivoEntregaRegistro_(contexto);
    var origenes = tablaRegistro_(contexto.bd, 'SYS - Orígenes');
    var propios = origenes.filas.filter(function(o) { return coincideOrigenRegistro_(o, contexto) && contexto.seleccion.indexOf(o['Sección origen']) !== -1; });
    var instantanea = leerCapturaRegistro_(libro, contexto.seleccion);
    restaurarIdsPendientesRegistro_(libro, instantanea, propios);
    var conocidos = conocidosRegistro_(contexto.bd, propios);
    Object.keys(instantanea).forEach(function(n) { if (contexto.seleccion.indexOf(n) === -1) instantanea[n].filas = []; });
    var plan = planificarCapturaRegistro_(instantanea, contexto.seleccion, conocidos);
    var etiquetas = [];
    plan.registros.forEach(function(r) {
      if (!r.id) {
        r.id = 'REG-' + Utilities.getUuid();
        var canonica = r.seccion === 'R - Reg. Investigador' || r.seccion === 'R - Control Proyectos externos' ? '' : 'CON-' + Utilities.getUuid();
        guardarFilaRegistro_(origenes, {
          'ID origen': 'ORI-' + Utilities.getUuid(), 'ID clase Classroom': contexto.idClase, 'ID tarea Classroom': contexto.idTarea,
          'ID entrega Classroom': contexto.idEntrega, 'ID archivo copia': contexto.idArchivo, 'Sección origen': r.seccion, 'ID registro origen': r.id,
          'ID registro destino': 'BD-' + Utilities.getUuid(), 'ID contribución canónica': canonica, 'ID investigador Empiria': contexto.idPersona,
          'Ciclo de asignación': contexto.ciclo, 'Huella contenido': huellaRegistro_(r.valores.slice(1)), 'Estado sincronización': 'Pendiente', 'Fecha primera recolección': new Date()
        });
        libro.getSheetByName(r.seccion).getRange(r.fila, 1, 1, 2).setValues([[r.id, canonica]]);
      }
      var titulo = r.valores[r.contrato.inicioDatos];
      etiquetas.push(r.id + ' · ' + String(titulo || r.seccion).slice(0, 100));
    });
    var personas = tablaRegistro_(contexto.bd, 'SYS - Personas').filas.filter(function(p) { return p['Estado identidad'] === 'Verificada'; }).map(function(p) { return p['ID investigador Empiria'] + ' · ' + p['Nombre de presentación']; });
    ['R - Participantes', 'R - Actividades'].forEach(function(nombre) {
      var hoja = libro.getSheetByName(nombre);
      if (!hoja) return;
      if (etiquetas.length) hoja.getRange(2, 3, hoja.getMaxRows() - 1, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(etiquetas, true).setAllowInvalid(false).build());
      if (nombre === 'R - Participantes' && personas.length) hoja.getRange(2, 4, hoja.getMaxRows() - 1, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(personas, true).setAllowInvalid(false).build());
    });
    return { referenciasPreparadas: etiquetas.length, importado: false };
  } finally {
    bloqueo.releaseLock();
  }
}
