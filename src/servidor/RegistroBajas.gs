// Baja lógica y auditada: nunca borra filas de BD ni de la copia.
function solicitarBajaRegistro_(idOrigen, motivo) {
  var config = configuracionRegistro_();
  if (!String(motivo || '').trim() || String(motivo).length > 1000) errorRegistro_('MOTIVO_BAJA_INVALIDO');
  var bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);
  try {
    var bd = SpreadsheetApp.openById(config.bd);
    var origenes = tablaRegistro_(bd, 'SYS - Orígenes').filas.filter(function(o) { return o['ID origen'] === idOrigen; });
    if (origenes.length !== 1 || origenes[0]['Estado sincronización'] !== 'Sincronizado') errorRegistro_('ORIGEN_BAJA_INVALIDO');
    var bajas = tablaRegistro_(bd, 'SYS - Bajas');
    var anterior = bajas.filas.find(function(b) { return b['ID origen'] === idOrigen && ['Pendiente', 'Aprobada'].indexOf(b.Estado) !== -1; });
    if (anterior) return { idSolicitud: anterior['ID solicitud'], estado: anterior.Estado };
    var solicitud = guardarFilaRegistro_(bajas, { 'ID solicitud': 'BAJ-' + Utilities.getUuid(), 'ID origen': idOrigen, 'ID investigador solicitante': origenes[0]['ID investigador Empiria'], Motivo: String(motivo).trim(), Estado: 'Pendiente', 'Fecha solicitud': new Date() });
    return { idSolicitud: solicitud['ID solicitud'], estado: solicitud.Estado };
  } finally {
    bloqueo.releaseLock();
  }
}

function resolverBajaRegistro_(idSolicitud, aprobar, motivo) {
  var config = configuracionRegistro_();
  if (typeof aprobar !== 'boolean' || !String(motivo || '').trim() || String(motivo).length > 1000) errorRegistro_('RESOLUCION_INVALIDA');
  var bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);
  try {
    var bd = SpreadsheetApp.openById(config.bd);
    var bajas = tablaRegistro_(bd, 'SYS - Bajas');
    var candidatas = bajas.filas.filter(function(b) { return b['ID solicitud'] === idSolicitud; });
    if (candidatas.length !== 1 || candidatas[0].Estado !== 'Pendiente') errorRegistro_('SOLICITUD_NO_PENDIENTE');
    var solicitud = candidatas[0];
    solicitud.Estado = aprobar ? 'Aprobada' : 'Rechazada';
    solicitud['Operador resolución'] = config.correo;
    solicitud['Fecha resolución'] = new Date();
    solicitud.Resolución = String(motivo).trim();
    guardarFilaRegistro_(bajas, solicitud, solicitud._fila);
    return { idSolicitud: idSolicitud, estado: solicitud.Estado, borradoFisico: false };
  } finally {
    bloqueo.releaseLock();
  }
}

function conocidosRegistro_(bd, origenes) {
  var bajas = tablaRegistro_(bd, 'SYS - Bajas').filas.filter(function(b) { return b.Estado === 'Aprobada'; });
  return origenes.map(function(o) { return { seccion: o['Sección origen'], id: o['ID registro origen'], canonica: o['ID contribución canónica'], padre: o['ID registro padre origen'], retirado: bajas.some(function(b) { return b['ID origen'] === o['ID origen']; }) }; });
}
