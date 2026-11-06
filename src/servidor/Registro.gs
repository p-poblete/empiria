// Funciones privadas: no se exponen mediante google.script.run.
// Los adaptadores de Google están en RegistroGoogle.gs.
function errorRegistro_(codigo) {
  throw new Error('REGISTRO: ' + codigo);
}

function seccionesRegistro_(seleccion) {
  if (!Array.isArray(seleccion) || !seleccion.length) errorRegistro_('SELECCION_VACIA');
  var catalogo = ESQUEMA_REGISTRO.captura.filter(function(s) { return s.hoja !== 'R - Base'; });
  var unicas = [];
  seleccion.forEach(function(nombre) {
    if (!catalogo.some(function(s) { return s.hoja === nombre; }) || unicas.indexOf(nombre) !== -1) errorRegistro_('SELECCION_INVALIDA');
    unicas.push(nombre);
  });
  var auxiliares = ['LEER PRIMERO', 'SYS - Contexto'];
  if (unicas.some(function(n) { return n !== 'R - Reg. Investigador'; })) auxiliares.push('R - Participantes');
  if (unicas.some(function(n) { return ['R - Proyectos internos', 'R - Semilleros', 'R - Grupo Investigación'].indexOf(n) !== -1; })) auxiliares.push('R - Actividades');
  return { principales: unicas, auxiliares: auxiliares };
}

function contratoSeccionRegistro_(nombre) {
  var principal = ESQUEMA_REGISTRO.captura.find(function(s) { return s.hoja === nombre; });
  if (principal) return { nombre: nombre, columnas: principal.columnas, inicioDatos: 3, destino: principal.destino };
  var auxiliar = ESQUEMA_REGISTRO.auxiliares.find(function(s) { return s.title === nombre && nombre !== 'SYS - Contexto'; });
  if (!auxiliar) errorRegistro_('SECCION_DESCONOCIDA');
  return { nombre: nombre, columnas: auxiliar.columns, inicioDatos: 1, destino: null };
}

function valorRegistro_(valor) {
  if (valor == null) return '';
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    if (isNaN(valor.getTime())) errorRegistro_('FECHA_INVALIDA');
    return valor;
  }
  if (typeof valor === 'number' && !isFinite(valor)) errorRegistro_('NUMERO_INVALIDO');
  return typeof valor === 'string' ? valor.trim() : valor;
}

// Solo devuelve un plan: ninguna escritura ocurre antes de validar todas las hojas.
function planificarCapturaRegistro_(instantanea, seleccion, conocidos) {
  var permitidas = seccionesRegistro_(seleccion);
  var nombres = permitidas.principales.concat(permitidas.auxiliares.filter(function(n) { return n.indexOf('R - ') === 0; }));
  var plan = { registros: [], avisos: [], ignoradas: Object.keys(instantanea).filter(function(n) { return nombres.indexOf(n) === -1; }) };
  var vistos = {}, referencias = {};
  conocidos = conocidos || [];
  nombres.forEach(function(nombre) {
    var hoja = instantanea[nombre];
    var contrato = contratoSeccionRegistro_(nombre);
    if (!hoja || !Array.isArray(hoja.encabezados) || JSON.stringify(hoja.encabezados) !== JSON.stringify(contrato.columnas)) errorRegistro_('ESTRUCTURA_ALTERADA');
    var datosFicha = 0;
    (hoja.filas || []).forEach(function(fila, indice) {
      if (!Array.isArray(fila) || fila.length !== contrato.columnas.length) errorRegistro_('FILA_INVALIDA');
      fila = fila.map(valorRegistro_);
      var id = String(fila[0]);
      if (id) {
        if (vistos[id]) errorRegistro_('ID_DUPLICADO');
        vistos[id] = true;
        if (!conocidos.some(function(c) { return c.seccion === nombre && c.id === id; })) errorRegistro_('ID_NO_RECONOCIDO');
      }
      if (id && conocidos.some(function(c) { return c.seccion === nombre && c.id === id && c.retirado; })) {
        plan.avisos.push({ codigo: 'REGISTRO_RETIRADO', seccion: nombre, id: id });
        return;
      }
      var tieneDatos = fila.slice(contrato.inicioDatos).some(function(v) { return v !== ''; });
      if (!tieneDatos) {
        if (id) plan.avisos.push({ codigo: 'REGISTRO_VACIADO_SIN_BAJA', seccion: nombre, id: id });
        return;
      }
      if (nombre === 'R - Reg. Investigador' && (++datosFicha > 1 || indice !== 0)) errorRegistro_('FICHA_UNICA');
      if (contrato.inicioDatos === 3) {
        var anterior = conocidos.find(function(c) { return c.seccion === nombre && c.id === id; });
        if (String(fila[1]) !== String(anterior && anterior.canonica || '') || String(fila[2]) !== String(anterior && anterior.padre || '')) errorRegistro_('RELACION_TECNICA_ALTERADA');
      }
      var registro = { seccion: nombre, fila: indice + 2, id: id, valores: fila, contrato: contrato };
      plan.registros.push(registro);
      if (id && contrato.inicioDatos === 3) referencias[nombre + '\n' + id] = true;
    });
  });
  conocidos.forEach(function(c) {
    // Las secciones no asignadas no se consideran faltantes ni se borran.
    if (nombres.indexOf(c.seccion) !== -1 && !vistos[c.id]) errorRegistro_('ID_RETIRADO_O_MODIFICADO');
  });
  plan.registros.forEach(function(r) {
    if (r.seccion === 'R - Participantes' || r.seccion === 'R - Actividades') {
      var seccion = String(r.valores[1]), idPadre = String(r.valores[2]);
      if (permitidas.principales.indexOf(seccion) === -1 || !referencias[seccion + '\n' + idPadre]) errorRegistro_('REFERENCIA_INVALIDA');
      if (r.seccion === 'R - Actividades' && ['R - Proyectos internos', 'R - Semilleros', 'R - Grupo Investigación'].indexOf(seccion) === -1) errorRegistro_('PADRE_ACTIVIDAD_INVALIDO');
    }
  });
  return plan;
}

function rangosEditablesRegistro_(nombre, filas, columnas) {
  if (nombre === 'R - Base' || nombre === 'SYS - Contexto' || nombre === 'LEER PRIMERO') return [];
  var contrato = contratoSeccionRegistro_(nombre);
  if (columnas < contrato.columnas.length || filas < 2) errorRegistro_('CUADRICULA_INVALIDA');
  return [{ fila: 2, columna: contrato.inicioDatos + 1, filas: nombre === 'R - Reg. Investigador' ? 1 : filas - 1, columnas: contrato.columnas.length - contrato.inicioDatos }];
}

function normalizarCeldaDestinoRegistro_(valor) {
  // Evita que entradas de captura se conviertan en fórmulas al guardarse en BD.
  return typeof valor === 'string' && /^[=+@-]/.test(valor) ? "'" + valor : valor;
}
