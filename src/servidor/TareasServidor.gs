// CU-002: catálogo de demostración. No consulta archivos privados ni Classroom.
function obtenerPlantillasTarea(ciclo) {
  if (!/^Ciclo 20\d{2}-(I|II)$/.test(ciclo || '')) throw new Error('Ciclo inválido.');
  return { ciclo: ciclo, plantillas: [
    { id: 'P1', nombre: 'Plantilla_Base_Proyectos_v1', extension: '.gsheet', fechaSubida: '15/03/2026', numHojas: 5, hojas: ['Hoja1', 'Hoja2', 'Hoja3', 'Hoja4', 'Hoja5'], estado: 'disponible', cicloAsociado: null, urlSheets: 'https://docs.google.com/spreadsheets/d/1abcDEMO123/edit' },
    { id: 'P2', nombre: 'Plantilla_Informe_Financiero_v2', extension: '.gsheet', fechaSubida: '10/03/2026', numHojas: 3, hojas: ['Hoja1', 'Hoja2', 'Hoja3'], estado: 'en_uso', cicloAsociado: 'Ciclo 2026-I', urlSheets: 'https://docs.google.com/spreadsheets/d/2defDEMO456/edit' }
  ] };
}

// La sesión identifica una demostración, no autentica usuarios. El caché expira
// a las seis horas; no constituye persistencia ni control de acceso de producción.
function conRegistroDemo_(sesion, accion) {
  if (!/^[a-zA-Z0-9-]{10,100}$/.test(sesion || '')) throw new Error('Sesión de demostración inválida.');
  var bloqueo = LockService.getUserLock();
  bloqueo.waitLock(10000);
  try {
    var cache = CacheService.getUserCache();
    var clave = 'EMPIRIA_DEMO_' + sesion;
    var registro = JSON.parse(cache.get(clave) || '{}');
    var resultado = accion(registro);
    // Acota el caché para una sesión de prácticas. Reiniciar la página abre otra.
    if (Object.keys(registro).length > 100) throw new Error('Límite de 100 operaciones de demostración por sesión. Recargue la página.');
    cache.put(clave, JSON.stringify(registro), 21600);
    return resultado;
  } finally {
    bloqueo.releaseLock();
  }
}

function validarOperacionDemo_(id) {
  if (!/^[a-zA-Z0-9-]{10,100}$/.test(id || '')) throw new Error('Identificador de operación inválido.');
}

function publicarActividadDemo(datos, opciones) {
  datos = datos || {};
  opciones = opciones || {};
  validarOperacionDemo_(datos.idOperacion);
  return conRegistroDemo_(opciones.sesion, function(registro) {
    var anterior = registro[datos.idOperacion];
    // Reenviar la misma operación nunca crea otra tarea, incluso si fue cancelada.
    if (anterior) return anterior;
    if (datos.ciclo !== 'Ciclo 2026-II') throw new Error('VALIDACION: solo se puede publicar en el ciclo activo.');
    if (!String(datos.titulo || '').trim() || !String(datos.descripcion || '').trim()) throw new Error('VALIDACION: título y descripción obligatorios.');
    if (String(datos.titulo).length > 300 || String(datos.descripcion).length > 5000) throw new Error('VALIDACION: título o descripción demasiado largos.');
    datos.titulo = String(datos.titulo).trim();
    datos.descripcion = String(datos.descripcion).trim();
    var entrega = new Date(datos.fecha + 'T' + datos.hora + ':00-05:00');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha || '') || !/^\d{2}:\d{2}$/.test(datos.hora || '') || isNaN(entrega.getTime()) || entrega <= new Date() || entrega > new Date('2026-12-31T23:59:59-05:00')) throw new Error('VALIDACION: fecha fuera del periodo permitido (hora de Lima).');
    if (new Date(entrega.getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 16) !== datos.fecha + 'T' + datos.hora) throw new Error('VALIDACION: fecha de calendario inválida.');
    var plantilla = obtenerPlantillasTarea(datos.ciclo).plantillas.find(function(p) { return p.id === datos.plantillaId; });
    if (!plantilla || plantilla.estado !== 'disponible') throw new Error('VALIDACION: plantilla no disponible en el catálogo del servidor.');
    var inicio = plantilla.hojas.indexOf(datos.hojaInicial);
    var fin = plantilla.hojas.indexOf(datos.hojaFinal);
    if (inicio < 0 || fin < inicio) throw new Error('VALIDACION: rango de hojas inválido.');
    if (Object.keys(registro).some(function(id) { var t = registro[id]; return t.estado === 'Completado' && t.ciclo === datos.ciclo && t.titulo === datos.titulo; })) throw new Error('DUPLICADO: ya existe una tarea con el mismo nombre en esta clase.');
    // Fallos de la API simulada, seleccionados por el panel de condiciones.
    var errores = { sinPermisos: 'PERMISOS: no tiene el rol de Profesor (403).', cuota: 'CUOTA: peticiones excedidas (429).', sinConexion: 'CONEXION: servicio no disponible.', adjunto: 'ADJUNTO: no se pudo adjuntar la plantilla; se revirtió la tarea parcial.' };
    if (errores[opciones.comportamiento]) throw new Error(errores[opciones.comportamiento]);
    var resultado = { idOperacion: datos.idOperacion, idTarea: 'DEMO-' + Utilities.getUuid(), estado: 'Completado', ciclo: datos.ciclo, titulo: datos.titulo, simulacion: true };
    registro[datos.idOperacion] = resultado;
    return resultado;
  });
}

function cancelarActividadDemo(idOperacion, sesion) {
  validarOperacionDemo_(idOperacion);
  return conRegistroDemo_(sesion, function(registro) {
    // Se registra incluso si la cancelación llegó antes que publicarActividadDemo.
    // Si llegó después, revierte el registro simulado. Nunca modifica Classroom.
    registro[idOperacion] = { idOperacion: idOperacion, estado: 'Cancelado', simulacion: true };
    return registro[idOperacion];
  });
}
