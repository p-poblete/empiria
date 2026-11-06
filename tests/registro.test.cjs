const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { servidorDemo } = require('./soporte.cjs');
const esquema = require('../docs/esquema-sheets.json');
const principal = 'R - Journal';
const clonar = valor => JSON.parse(JSON.stringify(valor));

function caso() {
  const s = servidorDemo();
  const filas = {};
  for (const nombre of [principal, 'R - Participantes']) {
    const c = s.contratoSeccionRegistro_(nombre);
    filas[nombre] = { encabezados: clonar(c.columnas), filas: [] };
  }
  const c = s.contratoSeccionRegistro_(principal);
  const fila = c.columnas.map(() => '');
  fila[c.columnas.indexOf('TÍTULO DEL ARTÍCULO')] = 'Artículo sintético';
  filas[principal].filas.push(fila);
  return { s, filas, fila, columnas: c.columnas };
}

test('contrato Apps Script coincide con el esquema vigente de los libros', () => {
  const s = servidorDemo();
  assert.equal(s.ESQUEMA_REGISTRO.version, esquema.version);
  assert.deepEqual(clonar(s.ESQUEMA_REGISTRO.captura), esquema.captura);
  assert.deepEqual(clonar(s.ESQUEMA_REGISTRO.tablasSistema), esquema.baseAuxiliar);
});

test('selección no consecutiva incluye auxiliares y excluye catálogos', () => {
  const s = servidorDemo();
  const r = s.seccionesRegistro_(['R - Journal', 'R - Proyectos internos']);
  assert.deepEqual(clonar(r.auxiliares), ['LEER PRIMERO', 'SYS - Contexto', 'R - Participantes', 'R - Actividades']);
  assert.throws(() => s.seccionesRegistro_(['R - Base']), /INVALIDA/);
  assert.throws(() => s.seccionesRegistro_([principal, principal]), /INVALIDA/);
  assert.throws(() => s.seccionesRegistro_([]), /VACIA/);
});

test('rechaza encabezados cambiados y secciones asignadas ausentes antes de escribir', () => {
  const { s, filas } = caso();
  filas[principal].encabezados[3] = 'Nombre cambiado';
  assert.throws(() => s.planificarCapturaRegistro_(filas, [principal]), /ESTRUCTURA/);
  delete filas[principal];
  assert.throws(() => s.planificarCapturaRegistro_(filas, [principal]), /ESTRUCTURA/);
});

test('IDs desconocidos, duplicados, retirados y relaciones manipuladas se rechazan', () => {
  const { s, filas, fila } = caso();
  fila[0] = 'ID-ajeno';
  assert.throws(() => s.planificarCapturaRegistro_(filas, [principal]), /ID_NO_RECONOCIDO/);
  const conocidos = [{ seccion: principal, id: 'ID-ajeno' }];
  filas[principal].filas.push([...fila]);
  assert.throws(() => s.planificarCapturaRegistro_(filas, [principal], conocidos), /ID_DUPLICADO/);
  filas[principal].filas.pop();
  fila[0] = '';
  assert.throws(() => s.planificarCapturaRegistro_(filas, [principal], conocidos), /RETIRADO/);
  fila[0] = 'ID-ajeno'; fila[1] = 'identidad-inventada';
  assert.throws(() => s.planificarCapturaRegistro_(filas, [principal], conocidos), /RELACION_TECNICA/);
});

test('vaciar datos conserva ID, emite aviso y no solicita borrar la BD', () => {
  const { s, filas, fila } = caso();
  fila.fill(''); fila[0] = 'registro-1';
  const plan = s.planificarCapturaRegistro_(filas, [principal], [{ seccion: principal, id: 'registro-1' }]);
  assert.equal(plan.registros.length, 0);
  assert.equal(plan.avisos[0].codigo, 'REGISTRO_VACIADO_SIN_BAJA');
  assert.equal('borrados' in plan, false);
});

test('una sección no asignada no se importa ni se exige por registros anteriores', () => {
  const { s, filas } = caso();
  filas['R - Conferencia'] = { encabezados: ['alterado'], filas: [['valor']] };
  const plan = s.planificarCapturaRegistro_(filas, [principal], [{ seccion: 'R - Conferencia', id: 'antiguo' }]);
  assert.equal(plan.registros.length, 1);
  assert.ok(plan.ignoradas.includes('R - Conferencia'));
});

test('participantes no pueden referenciar secciones excluidas ni registros inexistentes', () => {
  const { s, filas, fila } = caso();
  fila[0] = 'registro-1';
  filas['R - Participantes'].filas.push(['', 'R - Conferencia', 'registro-1', 'persona-1', 'Autor', 'Autoría', '', '']);
  assert.throws(() => s.planificarCapturaRegistro_(filas, [principal], [{ seccion: principal, id: 'registro-1' }]), /REFERENCIA_INVALIDA/);
  filas['R - Participantes'].filas[0][1] = principal;
  assert.equal(s.planificarCapturaRegistro_(filas, [principal], [{ seccion: principal, id: 'registro-1' }]).registros.length, 2);
});

test('ficha admite únicamente fila 2 y protecciones dejan IDs y cabeceras fuera', () => {
  const s = servidorDemo();
  assert.deepEqual(clonar(s.rangosEditablesRegistro_('R - Reg. Investigador', 941, 26)), [{ fila: 2, columna: 4, filas: 1, columnas: 23 }]);
  assert.equal(s.rangosEditablesRegistro_('SYS - Contexto', 1000, 26).length, 0);
  const c = s.contratoSeccionRegistro_('R - Reg. Investigador');
  const vacia = c.columnas.map(() => ''); const datos = [...vacia]; datos[3] = 'dato';
  assert.throws(() => s.planificarCapturaRegistro_({ 'R - Reg. Investigador': { encabezados: c.columnas, filas: [vacia, datos] } }, ['R - Reg. Investigador']), /FICHA_UNICA/);
});

test('no ejecuta fórmulas introducidas como datos ni normaliza ausentes como cero', () => {
  const s = servidorDemo();
  assert.equal(s.normalizarCeldaDestinoRegistro_('=IMPORTXML("url")'), '\'=IMPORTXML("url")');
  assert.equal(s.normalizarCeldaDestinoRegistro_(0), 0);
  assert.equal(s.valorRegistro_(''), '');
  assert.throws(() => s.valorRegistro_(Infinity), /NUMERO_INVALIDO/);
});

test('sin identidad administrativa explícita falla cerrado antes de acceder a Google', () => {
  const s = servidorDemo({ servicios: {
    Session: { getActiveUser: () => ({ getEmail: () => '' }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => null }) }
  } });
  assert.throws(() => s.configuracionRegistro_(), /ACCESO_DENEGADO/);
});

test('una reserva interrumpida restaura el mismo ID solo con contenido único exacto', () => {
  const s = servidorDemo({ servicios: { Utilities: {
    DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
    computeDigest: (_, texto) => createHash('sha256').update(texto).digest(),
    base64EncodeWebSafe: bytes => bytes.toString('base64url')
  } } });
  const fila = ['', '', '', 'Artículo sintético'];
  const datos = { [principal]: { filas: [fila] } };
  const reserva = { 'Sección origen': principal, 'ID registro origen': 'reservado', 'Estado sincronización': 'Pendiente', 'Huella contenido': s.huellaRegistro_(fila.slice(1)) };
  const escrituras = [];
  const libro = { getSheetByName: () => ({ getRange: (r, c) => ({ setValue: v => escrituras.push([r, c, v]) }) }) };
  s.restaurarIdsPendientesRegistro_(libro, datos, [reserva]);
  assert.deepEqual(escrituras, [[2, 1, 'reservado']]);
  assert.equal(fila[0], 'reservado');
  const duplicados = { [principal]: { filas: [['', '', '', 'Artículo sintético'], ['', '', '', 'Artículo sintético']] } };
  assert.throws(() => s.restaurarIdsPendientesRegistro_(libro, duplicados, [reserva]), /REVISION/);
});
