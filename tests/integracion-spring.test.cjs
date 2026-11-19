const test = require('node:test');
const assert = require('node:assert/strict');
const { servidorDemo, paginaCompuesta } = require('./soporte.cjs');

// Spring simulado: registra cada petición y responde según la ruta.
function conSpring(responder, propiedadesIniciales = { SPRING_BASE_URL: 'https://empiria-8080.app.github.dev' }) {
  const propiedades = new Map(Object.entries(propiedadesIniciales));
  const peticiones = [];
  const s = servidorDemo({ servicios: {
    Logger: { log() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => propiedades.get(k) || null, setProperty: (k, v) => propiedades.set(k, v), deleteProperty: k => propiedades.delete(k) }) },
    UrlFetchApp: { fetch: (url, opciones) => {
      peticiones.push({ url, ...opciones });
      const [codigo, cuerpo] = responder(url, opciones);
      return { getResponseCode: () => codigo, getContentText: () => typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo) };
    } }
  } });
  return { s, peticiones, propiedades };
}
const PARAMETROS = { version: 1, actualizado: '2026-11-19T10:00:00-05:00', parametros: [{ codigo: 'CICLO_VIGENTE', valor: '2026-II', editable: false }, { codigo: 'ID_CARPETA_PLANTILLAS', valor: 'DEMO-CARPETA-PLANTILLAS-0001', editable: true }] };
const CATALOGOS = { facultades: [{ id: 'FAC-ING', descripcion: 'Ingeniería' }], carreras: [{ id: 'CAR-SIS', descripcion: 'Ingeniería de Sistemas', idFacultad: 'FAC-ING' }], planesEstudio: [], lineasInvestigacion: [], ciclosAcademicos: [] };

test('doGet consulta parámetros (invocación 1) y no falla sin Spring', () => {
  const { s, peticiones } = conSpring(() => [200, PARAMETROS]);
  const inicial = s.cargarConfiguracionInicial_();
  assert.equal(inicial.disponible, true);
  assert.equal(inicial.datos.parametros[0].valor, '2026-II');
  assert.equal(peticiones[0].url, 'https://empiria-8080.app.github.dev/api/parametros');
  assert.equal(peticiones[0].muteHttpExceptions, true);
  const sinUrl = conSpring(() => [200, PARAMETROS], {}).s.cargarConfiguracionInicial_();
  assert.equal(sinUrl.disponible, false);
  assert.match(sinUrl.error, /SPRING_BASE_URL/);
  const caido = conSpring(() => { throw new Error('DNS'); }).s.cargarConfiguracionInicial_();
  assert.match(caido.error, /CONEXION/);
  const html = conSpring(() => [200, '<html>Codespaces login</html>']).s.cargarConfiguracionInicial_();
  assert.match(html.error, /no devolvió JSON/);
});

test('actualiza un parámetro con PUT, token y errores de Spring (invocación 2)', () => {
  const { s, peticiones } = conSpring((url, op) => op.method === 'put' && JSON.parse(op.payload).valor === 'corto'
    ? [400, { mensaje: 'ID_CARPETA_PLANTILLAS debe ser un ID de Drive (10 a 100 letras, números, - o _).' }]
    : [200, { codigo: 'ID_CARPETA_PLANTILLAS', valor: JSON.parse(op.payload).valor }], { SPRING_BASE_URL: 'https://x.app.github.dev/', SPRING_TOKEN: 'tk' });
  assert.equal(s.actualizarParametroSistema('ID_CARPETA_PLANTILLAS', '1AbC-carpeta_2026').valor, '1AbC-carpeta_2026');
  assert.equal(peticiones[0].url, 'https://x.app.github.dev/api/parametros/ID_CARPETA_PLANTILLAS');
  assert.equal(peticiones[0].method, 'put');
  assert.equal(peticiones[0].headers['X-Empiria-Token'], 'tk');
  assert.throws(() => s.actualizarParametroSistema('ID_CARPETA_PLANTILLAS', 'corto'), /REST 400: ID_CARPETA_PLANTILLAS debe ser un ID de Drive/);
  assert.throws(() => s.actualizarParametroSistema('../otro', '1'), /VALIDACION/);
  assert.throws(() => s.actualizarParametroSistema('ID_CARPETA_PLANTILLAS', 5), /VALIDACION/);
  assert.equal(peticiones.length, 2);
});

test('consulta catálogos y valida su estructura (invocación 3)', () => {
  assert.equal(conSpring(() => [200, CATALOGOS]).s.obtenerCatalogosSistema().carreras[0].id, 'CAR-SIS');
  assert.throws(() => conSpring(() => [200, { ...CATALOGOS, carreras: [{ id: 'X' }] }]).s.obtenerCatalogosSistema(), /ESTRUCTURA/);
  assert.throws(() => conSpring(() => [404, { mensaje: 'No existe.' }]).s.obtenerCatalogosSistema(), /REST 404/);
});

test('configura solo URLs HTTPS base y escapa la configuración inyectada', () => {
  const { s, propiedades } = conSpring(() => [200, {}], {});
  s.configurarServiciosSpring('https://nombre-8080.app.github.dev/', 'abc');
  assert.equal(propiedades.get('SPRING_BASE_URL'), 'https://nombre-8080.app.github.dev');
  assert.equal(propiedades.get('SPRING_TOKEN'), 'abc');
  s.configurarServiciosSpring('https://nombre-8080.app.github.dev');
  assert.equal(propiedades.has('SPRING_TOKEN'), false);
  assert.throws(() => s.configurarServiciosSpring('http://ejemplo.com'), /CONFIGURACION/);
  assert.throws(() => s.configurarServiciosSpring('https://ejemplo.com/api'), /CONFIGURACION/);
  assert.equal(s.jsonParaHtml_({ a: '</script>' }), '{"a":"\\u003c/script>"}');
  const html = paginaCompuesta({ configuracionInicial: { disponible: false, error: '</script><b>' } });
  assert.ok(html.includes('window.EMPIRIA_CONFIG_INICIAL = {"disponible":false,"error":"\\u003c/script>\\u003cb>"};'));
});
