// Integración privada para ejecutar desde el editor de Apps Script.
// Requiere Classroom avanzado y propiedades explícitas; la demo no la invoca.
function configuracionRegistro_() {
  var props = PropertiesService.getScriptProperties();
  var correo = Session.getActiveUser().getEmail();
  var administradores = JSON.parse(props.getProperty('EMPIRIA_ADMINISTRADORES') || '[]');
  if (!correo || !Array.isArray(administradores) || administradores.indexOf(correo) === -1) errorRegistro_('ACCESO_DENEGADO');
  var bd = props.getProperty('EMPIRIA_BD_ID');
  var plantilla = props.getProperty('EMPIRIA_PLANTILLA_ID');
  if (!bd || !plantilla || bd === plantilla) errorRegistro_('CONFIGURACION_INVALIDA');
  return { bd: bd, plantilla: plantilla, correo: correo };
}

function tablaRegistro_(libro, nombre) {
  var hoja = libro.getSheetByName(nombre);
  if (!hoja || hoja.getLastRow() < 1 || hoja.getLastRow() > 20000) errorRegistro_('TABLA_INVALIDA');
  var valores = hoja.getRange(1, 1, hoja.getLastRow(), hoja.getLastColumn()).getValues();
  var encabezados = valores.shift().map(String);
  if (encabezados.some(function(n, i) { return !n || encabezados.indexOf(n) !== i; })) errorRegistro_('ENCABEZADOS_INVALIDOS');
  return { hoja: hoja, encabezados: encabezados, filas: valores.map(function(fila, i) {
    var objeto = { _fila: i + 2 };
    encabezados.forEach(function(nombre, j) { objeto[nombre] = fila[j]; });
    return objeto;
  }) };
}

function guardarFilaRegistro_(tabla, objeto, fila) {
  var datos = tabla.encabezados.map(function(nombre) { return normalizarCeldaDestinoRegistro_(objeto[nombre] == null ? '' : objeto[nombre]); });
  var destino = fila || tabla.hoja.getLastRow() + 1;
  tabla.hoja.getRange(destino, 1, 1, datos.length).setValues([datos]);
  objeto._fila = destino;
  if (!fila) tabla.filas.push(objeto);
  return objeto;
}

function protegerLibroRegistro_(libro) {
  var config = configuracionRegistro_();
  libro.getSheets().forEach(function(hoja) {
    var nombre = hoja.getName();
    var rangos = rangosEditablesRegistro_(nombre, hoja.getMaxRows(), hoja.getMaxColumns());
    var protecciones = hoja.getProtections(SpreadsheetApp.ProtectionType.SHEET).filter(function(p) { return p.getDescription().indexOf('Empiria —') === 0; });
    var proteccion = protecciones[0] || hoja.protect();
    proteccion.setDescription('Empiria — estructura y campos técnicos; datos académicos editables');
    proteccion.setWarningOnly(false);
    proteccion.addEditor(Session.getEffectiveUser());
    proteccion.removeEditors(proteccion.getEditors().filter(function(usuario) { return usuario.getEmail() !== Session.getEffectiveUser().getEmail(); }));
    if (proteccion.canDomainEdit()) proteccion.setDomainEdit(false);
    proteccion.setUnprotectedRanges(rangos.map(function(r) { return hoja.getRange(r.fila, r.columna, r.filas, r.columnas); }));
    if (nombre.indexOf('R - ') === 0 && nombre !== 'R - Base') hoja.hideColumns(1, contratoSeccionRegistro_(nombre).inicioDatos);
  });
  return { archivo: libro.getId(), operador: config.correo, limite: 'El propietario puede cambiar las protecciones.' };
}

function prepararPlantillaRegistro_(seleccion, nombre) {
  var config = configuracionRegistro_();
  var secciones = seccionesRegistro_(seleccion);
  var conservar = secciones.principales.concat(secciones.auxiliares);
  var original = SpreadsheetApp.openById(config.plantilla);
  conservar.forEach(function(n) { if (!original.getSheetByName(n)) errorRegistro_('PLANTILLA_INCOMPLETA'); });
  var base = leerCapturaRegistro_(original, seleccion);
  if (Object.keys(base).some(function(n) { return base[n].filas.some(function(f) { return f.some(function(v) { return v !== '' && v != null; }); }); })) errorRegistro_('PLANTILLA_CONTIENE_DATOS');
  var copia = DriveApp.getFileById(config.plantilla).makeCopy(String(nombre || 'Empiria — actividad de seguimiento'));
  try {
    var libro = SpreadsheetApp.openById(copia.getId());
    libro.getSheets().forEach(function(hoja) { if (conservar.indexOf(hoja.getName()) === -1) libro.deleteSheet(hoja); });
    libro.getSheetByName('SYS - Contexto').getRange(2, 2).setValue(String(ESQUEMA_REGISTRO.version));
    ['R - Participantes', 'R - Actividades'].forEach(function(n) {
      var hoja = libro.getSheetByName(n);
      if (!hoja) return;
      var opciones = seleccion.filter(function(nombre) { return n === 'R - Participantes' || ['R - Proyectos internos', 'R - Semilleros', 'R - Grupo Investigación'].indexOf(nombre) !== -1; });
      hoja.getRange(2, 2, hoja.getMaxRows() - 1, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(opciones, true).setAllowInvalid(false).build());
    });
    protegerLibroRegistro_(libro);
    SpreadsheetApp.flush();
    return { idPlantillaTarea: copia.getId(), secciones: secciones, version: ESQUEMA_REGISTRO.version, publicado: false };
  } catch (error) {
    // Solo descarta la copia recién creada, nunca la plantilla maestra.
    copia.setTrashed(true);
    throw error;
  }
}

function contextoEntregaRegistro_(idClase, idTarea, idEntrega, permitirBorrador) {
  var config = configuracionRegistro_();
  Classroom.Courses.Teachers.get(idClase, 'me');
  var entrega = Classroom.Courses.CourseWork.StudentSubmissions.get(idClase, idTarea, idEntrega);
  // Política inicial explícita: se recolectan solo entregas enviadas.
  if (entrega.state !== 'TURNED_IN' && !(permitirBorrador && ['NEW', 'CREATED', 'RECLAIMED_BY_STUDENT', 'RETURNED'].indexOf(entrega.state) !== -1)) errorRegistro_('ENTREGA_NO_ENVIADA');
  var bd = SpreadsheetApp.openById(config.bd);
  var personas = tablaRegistro_(bd, 'SYS - Personas').filas.filter(function(p) {
    return String(p['ID usuario Classroom']) === String(entrega.userId) && p['Estado identidad'] === 'Verificada';
  });
  if (personas.length !== 1 || !personas[0]['ID investigador Empiria']) errorRegistro_('IDENTIDAD_NO_VERIFICADA');
  var asignaciones = tablaRegistro_(bd, 'SYS - Asignaciones').filas.filter(function(a) {
    return String(a['ID clase Classroom']) === String(idClase) && String(a['ID tarea Classroom']) === String(idTarea) &&
      String(a['ID usuario Classroom']) === String(entrega.userId) && String(a['ID investigador Empiria']) === String(personas[0]['ID investigador Empiria']) && a['Estado asignación'] === 'Asignada';
  });
  if (asignaciones.length !== 1) errorRegistro_('ASIGNACION_NO_REGISTRADA');
  var seleccion = tablaRegistro_(bd, 'SYS - Secciones asignadas').filas.filter(function(s) {
    return String(s['ID clase Classroom']) === String(idClase) && String(s['ID tarea Classroom']) === String(idTarea);
  });
  if (!seleccion.length || seleccion.some(function(s) { return String(s['Versión esquema']) !== String(ESQUEMA_REGISTRO.version) || String(s['ID plantilla de tarea']) !== String(asignaciones[0]['ID plantilla']); })) errorRegistro_('CONTRATO_ASIGNACION_INVALIDO');
  var principales = seleccion.filter(function(s) { return s['Tipo de sección'] === 'Principal'; }).map(function(s) { return s['Sección captura']; });
  var esperado = seccionesRegistro_(principales);
  var todas = esperado.principales.concat(esperado.auxiliares).sort();
  if (JSON.stringify(todas) !== JSON.stringify(seleccion.map(function(s) { return s['Sección captura']; }).sort())) errorRegistro_('AUXILIARES_INVALIDAS');
  var archivos = (entrega.assignmentSubmission && entrega.assignmentSubmission.attachments || []).filter(function(a) { return a.driveFile && a.driveFile.id; });
  // Una plantilla de registro por entrega; no elegir arbitrariamente otro adjunto.
  if (archivos.length !== 1) errorRegistro_('COPIA_NO_IDENTIFICADA');
  var idArchivo = String(archivos[0].driveFile.id);
  if ([config.bd, config.plantilla, String(asignaciones[0]['ID plantilla'])].indexOf(idArchivo) !== -1) errorRegistro_('ARCHIVO_NO_INDIVIDUAL');
  return { bd: bd, idClase: String(idClase), idTarea: String(idTarea), idEntrega: String(idEntrega), idArchivo: idArchivo,
    idPersona: String(personas[0]['ID investigador Empiria']), idUsuario: String(entrega.userId), estadoEntrega: entrega.state, ciclo: asignaciones[0]['Ciclo de asignación'], seleccion: principales };
}

function vincularArchivoEntregaRegistro_(contexto) {
  var tabla = tablaRegistro_(contexto.bd, 'SYS - Entregas');
  var previas = tabla.filas.filter(function(e) { return String(e['ID clase Classroom']) === contexto.idClase && String(e['ID tarea Classroom']) === contexto.idTarea && String(e['ID entrega Classroom']) === contexto.idEntrega; });
  if (previas.length > 1 || previas.some(function(e) { return String(e['ID archivo copia']) !== contexto.idArchivo || String(e['ID investigador Empiria']) !== contexto.idPersona; })) errorRegistro_('COPIA_DE_ENTREGA_CAMBIADA');
  var fila = previas[0];
  guardarFilaRegistro_(tabla, { 'ID clase Classroom': contexto.idClase, 'ID tarea Classroom': contexto.idTarea, 'ID entrega Classroom': contexto.idEntrega,
    'ID usuario Classroom': contexto.idUsuario, 'ID investigador Empiria': contexto.idPersona, 'ID archivo copia': contexto.idArchivo,
    'Estado Classroom': contexto.estadoEntrega, 'Fecha actualización origen': new Date() }, fila && fila._fila);
}

function leerCapturaRegistro_(libro, seleccion) {
  var secciones = seccionesRegistro_(seleccion);
  var nombres = secciones.principales.concat(secciones.auxiliares.filter(function(n) { return n.indexOf('R - ') === 0; }));
  var instantanea = {};
  nombres.forEach(function(nombre) {
    var hoja = libro.getSheetByName(nombre);
    if (!hoja) errorRegistro_('SECCION_ASIGNADA_AUSENTE');
    var contrato = contratoSeccionRegistro_(nombre);
    if (hoja.getLastRow() > 2000) errorRegistro_('LIMITE_FILAS');
    if (hoja.getLastColumn() > contrato.columnas.length) errorRegistro_('COLUMNAS_AÑADIDAS');
    var rango = hoja.getRange(1, 1, Math.max(1, hoja.getLastRow()), contrato.columnas.length);
    if (rango.getFormulas().some(function(fila) { return fila.some(function(f) { return !!f; }); })) errorRegistro_('FORMULA_EN_CAPTURA');
    var filas = rango.getValues();
    var encabezados = filas.shift();
    if (nombre === 'R - Participantes' || nombre === 'R - Actividades') filas.forEach(function(f) {
      f[2] = String(f[2] || '').split(' · ')[0];
      if (nombre === 'R - Participantes') f[3] = String(f[3] || '').split(' · ')[0];
    });
    instantanea[nombre] = { encabezados: encabezados, filas: filas };
  });
  return instantanea;
}

function coincideOrigenRegistro_(o, contexto) {
  return String(o['ID clase Classroom']) === contexto.idClase && String(o['ID tarea Classroom']) === contexto.idTarea &&
    String(o['ID entrega Classroom']) === contexto.idEntrega && String(o['ID archivo copia']) === contexto.idArchivo;
}

function diagnosticarEntregaRegistro_(idClase, idTarea, idEntrega) {
  var contexto = contextoEntregaRegistro_(idClase, idTarea, idEntrega, true);
  var libro = SpreadsheetApp.openById(contexto.idArchivo);
  var origenes = tablaRegistro_(contexto.bd, 'SYS - Orígenes').filas.filter(function(o) { return coincideOrigenRegistro_(o, contexto); });
  var conocidos = conocidosRegistro_(contexto.bd, origenes);
  var plan = planificarCapturaRegistro_(leerCapturaRegistro_(libro, contexto.seleccion), contexto.seleccion, conocidos);
  var necesarias = seccionesRegistro_(contexto.seleccion);
  var protecciones = libro.getSheets().filter(function(h) { return necesarias.principales.concat(necesarias.auxiliares).indexOf(h.getName()) !== -1; }).map(function(h) {
    var p = h.getProtections(SpreadsheetApp.ProtectionType.SHEET).filter(function(p) { return !p.isWarningOnly(); });
    var esperado = rangosEditablesRegistro_(h.getName(), h.getMaxRows(), h.getMaxColumns());
    var actual = p.length === 1 ? p[0].getUnprotectedRanges().map(function(r) { return { fila: r.getRow(), columna: r.getColumn(), filas: r.getNumRows(), columnas: r.getNumColumns() }; }) : [];
    return { seccion: h.getName(), protegida: p.length === 1, rangosCorrectos: p.length === 1 && JSON.stringify(esperado) === JSON.stringify(actual), dominioPuedeEditar: p.length === 1 ? consultarDominioProteccionRegistro_(p[0]) : null };
  });
  return { estructuraValida: true, registros: plan.registros.length, avisos: plan.avisos, protecciones: protecciones,
    propietario: DriveApp.getFileById(contexto.idArchivo).getOwner().getEmail(), escrituras: false };
}

function aplicarProteccionesEntregaRegistro_(idClase, idTarea, idEntrega) {
  var contexto = contextoEntregaRegistro_(idClase, idTarea, idEntrega, true);
  var libro = SpreadsheetApp.openById(contexto.idArchivo);
  // Valida encabezados y fórmulas antes de tocar protecciones de una copia.
  leerCapturaRegistro_(libro, contexto.seleccion);
  return protegerLibroRegistro_(libro);
}

// null significa que Google no permitió consultar este permiso.
function consultarDominioProteccionRegistro_(proteccion) {
  try { return proteccion.canDomainEdit(); }
  catch (error) {
    console.warn('No se pudo consultar el permiso de dominio: ' + error.message);
    return null;
  }
}
