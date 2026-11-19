// INICIO: Integración REST con Spring Boot (servicios-rest/)
// Tres invocaciones:
//   1. doGet → GET /api/parametros (parámetros iniciales inyectados en Index).
//   2. Vista Configuración → PUT /api/parametros/{codigo} (guardar un parámetro).
//   3. Vistas Reportes y Configuración → GET /api/catalogos (catálogos de la aplicación).
// La URL base y el token se guardan en Propiedades del script, no en el código.

var PROPIEDAD_URL_SPRING = 'SPRING_BASE_URL';
var PROPIEDAD_TOKEN_SPRING = 'SPRING_TOKEN';

// Ejecutar desde el editor con la URL pública del puerto 8080 de Codespaces, p. ej.:
// configurarServiciosSpring('https://NOMBRE-8080.app.github.dev', '');
function configurarServiciosSpring(url, token) {
  var base = normalizarUrlSpring_(url);
  var propiedades = PropertiesService.getScriptProperties();
  propiedades.setProperty(PROPIEDAD_URL_SPRING, base);
  if (token) propiedades.setProperty(PROPIEDAD_TOKEN_SPRING, String(token));
  else propiedades.deleteProperty(PROPIEDAD_TOKEN_SPRING);
  return 'Servicios Spring configurados en ' + base;
}

// Prueba manual desde el editor: registra las dos consultas en el log.
function probarServiciosSpring() {
  Logger.log(JSON.stringify(obtenerParametrosSistema()));
  Logger.log(JSON.stringify(obtenerCatalogosSistema()));
}

function normalizarUrlSpring_(url) {
  var base = String(url || '').trim().replace(/\/+$/, '');
  // http solo se admite para la vista local; Google exige una URL pública HTTPS.
  if (!/^https:\/\/[^\s/?#]+$/.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base))
    throw new Error('CONFIGURACION: la URL de Spring debe ser https://dominio sin ruta.');
  return base;
}

function urlSpring_(ruta) {
  var base = PropertiesService.getScriptProperties().getProperty(PROPIEDAD_URL_SPRING);
  if (!base) throw new Error('CONFIGURACION: falta SPRING_BASE_URL. Ejecute configurarServiciosSpring(url) en el editor.');
  return normalizarUrlSpring_(base) + ruta;
}

// Basadas en el código de ejemplo del curso. Cambios: muteHttpExceptions para leer
// el código de error de Spring, se devuelve también el código HTTP y el log de
// error usa la variable url (el ejemplo usaba "path", que no existe).
function execGet(url) {
  return execPeticion_(url, { method: 'get' });
}

function execPost(url, obj) {
  return execPeticion_(url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(obj) });
}

function execPut(url, obj) {
  return execPeticion_(url, { method: 'put', contentType: 'application/json', payload: JSON.stringify(obj) });
}

function execPeticion_(url, opciones) {
  opciones.muteHttpExceptions = true;
  opciones.headers = { Accept: 'application/json' };
  var token = PropertiesService.getScriptProperties().getProperty(PROPIEDAD_TOKEN_SPRING);
  if (token) opciones.headers['X-Empiria-Token'] = token;
  try {
    var response = UrlFetchApp.fetch(url, opciones);
    var responseCode = response.getResponseCode();
    var responseBody = response.getContentText();
    Logger.log(opciones.method.toUpperCase() + ' ' + url + ' → ' + responseCode);
    return { codigo: responseCode, cuerpo: responseBody };
  } catch (e) {
    Logger.log('Error en peticion ' + url + ' con metodo ' + opciones.method.toUpperCase() + ': ' + e.message);
    throw new Error('CONEXION: no se pudo contactar el servicio Spring. ' + e.message);
  }
}

// Convierte la respuesta en JSON o en un error legible para la interfaz.
function leerRespuestaSpring_(respuesta) {
  var datos = null;
  try { datos = JSON.parse(respuesta.cuerpo); } catch (e) { datos = null; }
  if (respuesta.codigo < 200 || respuesta.codigo >= 300) {
    var mensaje = datos && datos.mensaje ? datos.mensaje : 'respuesta HTTP ' + respuesta.codigo + '.';
    throw new Error('REST ' + respuesta.codigo + ': ' + mensaje);
  }
  if (datos === null) throw new Error('REST: el servicio no devolvió JSON. Verifique que el puerto de Codespaces sea público.');
  return datos;
}

function validarParametros_(datos) {
  if (!datos || !Array.isArray(datos.parametros) || datos.parametros.some(function(p) { return !p || !p.codigo || typeof p.valor !== 'string'; }))
    throw new Error('ESTRUCTURA: respuesta de parámetros inválida.');
  return datos;
}

// Invocación 1 (doGet). Nunca lanza: si Spring no responde, la app abre igual
// y la vista Configuración informa el motivo.
function cargarConfiguracionInicial_() {
  try {
    return { disponible: true, origen: 'doGet', datos: validarParametros_(leerRespuestaSpring_(execGet(urlSpring_('/api/parametros')))) };
  } catch (e) {
    return { disponible: false, origen: 'doGet', error: String(e.message || e) };
  }
}

// JSON seguro para insertarlo dentro de <script> en la plantilla.
function jsonParaHtml_(valor) {
  // Desde ES2019, U+2028/U+2029 son válidos en literales; solo se escapa '<'.
  return JSON.stringify(valor).replace(/</g, '\\u003c');
}

// Endpoints para google.script.run.
function obtenerParametrosSistema() {
  return validarParametros_(leerRespuestaSpring_(execGet(urlSpring_('/api/parametros'))));
}

// Invocación 2.
function actualizarParametroSistema(codigo, valor) {
  if (!/^[A-Z][A-Z0-9_]{1,59}$/.test(codigo || '')) throw new Error('VALIDACION: código de parámetro inválido.');
  if (typeof valor !== 'string' || valor.length > 200) throw new Error('VALIDACION: el valor debe ser texto de hasta 200 caracteres.');
  var parametro = leerRespuestaSpring_(execPut(urlSpring_('/api/parametros/' + codigo), { valor: valor }));
  if (!parametro || parametro.codigo !== codigo) throw new Error('ESTRUCTURA: respuesta de actualización inválida.');
  return parametro;
}

// Invocación 3.
function obtenerCatalogosSistema() {
  var datos = leerRespuestaSpring_(execGet(urlSpring_('/api/catalogos')));
  var listas = ['facultades', 'carreras', 'planesEstudio', 'lineasInvestigacion', 'ciclosAcademicos'];
  if (!datos || listas.some(function(nombre) {
    return !Array.isArray(datos[nombre]) || datos[nombre].some(function(item) { return !item || !item.id || !item.descripcion; });
  })) throw new Error('ESTRUCTURA: respuesta de catálogos inválida.');
  return datos;
}

// FIN: Integración REST con Spring Boot
