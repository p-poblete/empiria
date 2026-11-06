// Recolección explícita desde el editor. Nunca se ejecuta al abrir la web.
function huellaRegistro_(valores) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(valores), Utilities.Charset.UTF_8));
}

function destinoCapturaRegistro_(registro, origenes, contexto) {
  var campos = {};
  registro.contrato.columnas.forEach(function(nombre, i) { campos[nombre] = registro.valores[i]; });
  var destino = registro.contrato.destino;
  if (registro.seccion === 'R - Participantes') {
    destino = 'SYS - Participantes';
    var origen = origenes.filas.find(function(o) { return coincideOrigenRegistro_(o, contexto) && o['Sección origen'] === registro.valores[1] && o['ID registro origen'] === registro.valores[2]; });
    if (!origen || !origen['ID contribución canónica']) errorRegistro_('CONTRIBUCION_SIN_IDENTIDAD');
    campos['ID contribución canónica'] = origen['ID contribución canónica'];
    campos['Estado validación'] = 'Pendiente';
  }
  if (registro.seccion === 'R - Actividades') {
    destino = String(registro.valores[1]).replace(/^R - /, 'ACT - ');
    var padre = origenes.filas.find(function(o) { return coincideOrigenRegistro_(o, contexto) && o['Sección origen'] === registro.valores[1] && o['ID registro origen'] === registro.valores[2]; });
    if (!padre) errorRegistro_('PADRE_NO_IMPORTADO');
    campos['ID registro'] = padre['ID registro destino'];
  }
  return { tabla: destino, campos: campos, clave: registro.seccion === 'R - Actividades' ? 'ID actividad' : registro.seccion === 'R - Participantes' ? 'ID vínculo' : 'ID' };
}

function restaurarIdsPendientesRegistro_(libro, instantanea, origenes) {
  origenes.forEach(function(o) {
    if (o['Estado sincronización'] !== 'Pendiente') return;
    var hoja = instantanea[o['Sección origen']];
    if (!hoja) return;
    var existente = hoja.filas.find(function(f) { return String(f[0]) === String(o['ID registro origen']); });
    if (existente) {
      if (o['ID contribución canónica'] && existente[1] === '') {
        var indice = hoja.filas.indexOf(existente);
        libro.getSheetByName(o['Sección origen']).getRange(indice + 2, 2).setValue(o['ID contribución canónica']);
        existente[1] = o['ID contribución canónica'];
      }
      return;
    }
    var candidatas = hoja.filas.map(function(f, i) { return { valores: f, fila: i + 2 }; }).filter(function(f) {
      return !f.valores[0] && huellaRegistro_(f.valores.slice(1).map(valorRegistro_)) === o['Huella contenido'];
    });
    if (candidatas.length !== 1) errorRegistro_('RESERVA_REQUIERE_REVISION');
    libro.getSheetByName(o['Sección origen']).getRange(candidatas[0].fila, 1).setValue(o['ID registro origen']);
    hoja.filas[candidatas[0].fila - 2][0] = o['ID registro origen'];
    if (o['ID contribución canónica']) {
      libro.getSheetByName(o['Sección origen']).getRange(candidatas[0].fila, 2).setValue(o['ID contribución canónica']);
      hoja.filas[candidatas[0].fila - 2][1] = o['ID contribución canónica'];
    }
  });
}

function recolectarEntregaRegistro_(idClase, idTarea, idEntrega) {
  var contexto = contextoEntregaRegistro_(idClase, idTarea, idEntrega);
  var bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);
  var ejecucion, resumen;
  try {
    var libro = SpreadsheetApp.openById(contexto.idArchivo);
    vincularArchivoEntregaRegistro_(contexto);
    var origenes = tablaRegistro_(contexto.bd, 'SYS - Orígenes');
    var propios = origenes.filas.filter(function(o) { return coincideOrigenRegistro_(o, contexto); });
    var instantanea = leerCapturaRegistro_(libro, contexto.seleccion);
    restaurarIdsPendientesRegistro_(libro, instantanea, propios);
    var conocidos = conocidosRegistro_(contexto.bd, propios);
    var plan = planificarCapturaRegistro_(instantanea, contexto.seleccion, conocidos);
    var personas = tablaRegistro_(contexto.bd, 'SYS - Personas').filas;
    plan.registros.filter(function(r) { return r.seccion === 'R - Participantes'; }).forEach(function(r) {
      if (personas.filter(function(p) { return String(p['ID investigador Empiria']) === String(r.valores[3]) && p['Estado identidad'] === 'Verificada'; }).length !== 1) errorRegistro_('PARTICIPANTE_NO_VERIFICADO');
      if (['Autoría', 'Participación', 'Membresía', 'Responsabilidad'].indexOf(r.valores[5]) === -1) errorRegistro_('VINCULO_INVALIDO');
    });
    // Preflight de destinos antes de modificar datos de captura o tablas de datos.
    var tablas = {};
    plan.registros.forEach(function(r) {
      var nombre = r.contrato.destino || (r.seccion === 'R - Participantes' ? 'SYS - Participantes' : String(r.valores[1]).replace(/^R - /, 'ACT - '));
      if (!tablas[nombre]) tablas[nombre] = tablaRegistro_(contexto.bd, nombre);
      var clave = r.seccion === 'R - Actividades' ? 'ID actividad' : r.seccion === 'R - Participantes' ? 'ID vínculo' : 'ID';
      if (tablas[nombre].encabezados.indexOf(clave) === -1) errorRegistro_('DESTINO_SIN_ID_ESTABLE');
      if (r.contrato.destino && r.contrato.columnas.slice(3, -3).some(function(n) { return tablas[nombre].encabezados.indexOf(n) === -1; })) errorRegistro_('DESTINO_INCOMPATIBLE');
    });
    var contribuciones = tablaRegistro_(contexto.bd, 'SYS - Contribuciones');
    var bitacora = tablaRegistro_(contexto.bd, 'SYS - Recolecciones');
    var errores = tablaRegistro_(contexto.bd, 'SYS - Errores');
    resumen = { creados: 0, actualizados: 0, avisos: plan.avisos, idEjecucion: Utilities.getUuid() };
    ejecucion = guardarFilaRegistro_(bitacora, { 'ID ejecución': resumen.idEjecucion, Inicio: new Date(), Estado: 'En proceso', 'ID clase Classroom': contexto.idClase, 'ID tarea Classroom': contexto.idTarea, 'Versión recolector': '1' });
    plan.registros.forEach(function(r) {
      var origen = propios.find(function(o) { return o['Sección origen'] === r.seccion && o['ID registro origen'] === r.id; });
      if (!origen) {
        r.id = 'REG-' + Utilities.getUuid();
        var canonica = r.contrato.destino && r.seccion !== 'R - Reg. Investigador' && r.seccion !== 'R - Control Proyectos externos' ? 'CON-' + Utilities.getUuid() : '';
        origen = guardarFilaRegistro_(origenes, {
          'ID origen': 'ORI-' + Utilities.getUuid(), 'ID clase Classroom': contexto.idClase, 'ID tarea Classroom': contexto.idTarea,
          'ID entrega Classroom': contexto.idEntrega, 'ID archivo copia': contexto.idArchivo, 'Sección origen': r.seccion, 'ID registro origen': r.id,
          'ID registro destino': 'BD-' + Utilities.getUuid(), 'ID contribución canónica': canonica, 'ID registro padre origen': '',
          'ID investigador Empiria': contexto.idPersona, 'Ciclo de asignación': contexto.ciclo,
          'Huella contenido': huellaRegistro_(r.valores.slice(1)), 'Estado sincronización': 'Pendiente', 'Fecha primera recolección': new Date()
        });
        propios.push(origen);
        // La reserva persistente precede al ID en la copia. Un fallo se recupera
        // únicamente si existe una coincidencia exacta y única de contenido.
        libro.getSheetByName(r.seccion).getRange(r.fila, 1).setValue(r.id);
        r.valores[0] = r.id;
      }
      if (origen['ID contribución canónica'] && !contribuciones.filas.some(function(c) { return c['ID contribución canónica'] === origen['ID contribución canónica']; })) {
        guardarFilaRegistro_(contribuciones, { 'ID contribución canónica': origen['ID contribución canónica'], 'Tipo de contribución': r.seccion, 'Estado identidad': 'Pendiente' });
      }
      if (r.contrato.inicioDatos === 3 && origen['ID contribución canónica']) {
        libro.getSheetByName(r.seccion).getRange(r.fila, 2).setValue(origen['ID contribución canónica']);
        r.valores[1] = origen['ID contribución canónica'];
      }
      var destino = destinoCapturaRegistro_(r, origenes, contexto);
      var tabla = tablas[destino.tabla];
      var anteriores = tabla.filas.filter(function(f) { return f[destino.clave] === origen['ID registro destino']; });
      if (anteriores.length > 1) errorRegistro_('DESTINO_DUPLICADO');
      var fila = anteriores[0];
      var valores = Object.assign({}, fila || {}, destino.campos);
      valores[destino.clave] = origen['ID registro destino'];
      valores['ID investigador (registrante)'] = contexto.idPersona;
      valores['Ciclo académico'] = contexto.ciclo;
      valores['ID tarea / Classroom'] = contexto.idTarea;
      valores['ID entrega'] = contexto.idEntrega;
      valores['Fecha y hora de guardado'] = fila && fila['Fecha y hora de guardado'] || new Date();
      valores['Fecha última actualización'] = new Date();
      valores['Fuente'] = 'Classroom';
      valores['Estado de validación'] = 'Pendiente';
      valores['ID origen'] = origen['ID origen'];
      guardarFilaRegistro_(tabla, valores, fila && fila._fila);
      if (fila) resumen.actualizados++; else resumen.creados++;
      origen['Tabla destino'] = destino.tabla;
      origen['Estado sincronización'] = 'Sincronizado';
      origen['Fecha última recolección'] = new Date();
      origen['Huella contenido'] = huellaRegistro_(r.valores.slice(1));
      origen['Fecha académica'] = destino.campos['Fecha académica adicional'] || '';
      origen['Ciclo de contribución'] = destino.campos['Ciclo de contribución'] || '';
      origen['Moneda'] = destino.campos['Moneda'] || '';
      guardarFilaRegistro_(origenes, origen, origen._fila);
    });
    ejecucion.Estado = plan.avisos.length ? 'Parcial' : 'Completada';
    ejecucion.Fin = new Date();
    ejecucion['Copias leídas'] = 1;
    ejecucion['Registros creados'] = resumen.creados;
    ejecucion['Registros actualizados'] = resumen.actualizados;
    ejecucion['Registros con error'] = plan.avisos.length;
    guardarFilaRegistro_(bitacora, ejecucion, ejecucion._fila);
    return resumen;
  } catch (error) {
    try {
      bitacora = bitacora || tablaRegistro_(contexto.bd, 'SYS - Recolecciones');
      errores = errores || tablaRegistro_(contexto.bd, 'SYS - Errores');
      if (!ejecucion) ejecucion = guardarFilaRegistro_(bitacora, { 'ID ejecución': Utilities.getUuid(), Inicio: new Date(), Estado: 'Fallida', 'ID clase Classroom': contexto.idClase, 'ID tarea Classroom': contexto.idTarea, 'Versión recolector': '1' });
      else ejecucion.Estado = 'Parcial';
      ejecucion.Fin = new Date();
      guardarFilaRegistro_(bitacora, ejecucion, ejecucion._fila);
      guardarFilaRegistro_(errores, { 'ID error': Utilities.getUuid(), 'ID ejecución': ejecucion['ID ejecución'], Fecha: new Date(), 'ID archivo copia': contexto.idArchivo, Código: 'RECOLECCION_INTERRUMPIDA', 'Mensaje sin datos personales': 'Revisar ejecución y reintentar; no se eliminaron registros.', 'Estado resolución': 'Pendiente' });
    } catch (errorBitacora) {
      throw new Error(String(error.message || error) + ' [AUDITORIA_NO_DISPONIBLE]');
    }
    throw error;
  } finally {
    bloqueo.releaseLock();
  }
}
