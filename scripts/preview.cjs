// Vista local, sin cuenta de Google. Comparte los endpoints y la composición de
// las pruebas; únicamente los servicios de Apps Script se sustituyen en memoria.
const http = require('node:http');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { servidorDemo, paginaCompuesta } = require('../tests/soporte.cjs');
const puerto = Number(process.env.EMPIRIA_PUERTO || 4173);
const latencia = Number(process.env.EMPIRIA_LATENCIA_MS || 500);
if (!Number.isInteger(puerto) || puerto < 1024 || puerto > 65535 || !Number.isFinite(latencia) || latencia < 0 || latencia > 5000) throw new Error('Puerto o latencia de vista local inválidos.');
const origen = 'http://127.0.0.1:' + puerto;
const libros = new Map();
const propiedades = new Map();
function urlLibro(id) { return origen + '/consolidado/' + id; }
const servicios = {
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => propiedades.get(k) || null, setProperty: (k, v) => propiedades.set(k, v) }) },
  DriveApp: { getFileById: id => { if (!libros.has(id)) throw new Error('Archivo local inexistente.'); return { getUrl: () => urlLibro(id) }; } },
  SpreadsheetApp: { create: nombre => {
    const id = randomUUID();
    const libro = { nombre, filas: [] };
    libros.set(id, libro);
    return { getId: () => id, getUrl: () => urlLibro(id), getSheets: () => [{
      getRange: () => ({ setValues: filas => { libro.filas = filas; } }),
      protect: () => ({ setDescription: () => ({ setWarningOnly() {} }) })
    }] };
  } }
};
const backend = servidorDemo({ relojReal: true, servicios });
const metodos = new Set(['obtenerPlantillasTarea', 'publicarActividadDemo', 'cancelarActividadDemo', 'obtenerDatosReportes', 'obtenerConsolidadoCiclo']);
const puente = `<script>
(function() {
  function runner(exito, fallo) {
    return new Proxy({
      withSuccessHandler: function(fn) { return runner(fn, fallo); },
      withFailureHandler: function(fn) { return runner(exito, fn); }
    }, { get: function(objeto, nombre) {
      if (nombre in objeto) return objeto[nombre];
      return function() {
        fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ metodo: nombre, argumentos: Array.prototype.slice.call(arguments) }) })
          .then(function(respuesta) { return respuesta.json(); })
          .then(function(datos) { if (datos.error) throw new Error(datos.error); if (exito) exito(datos.resultado); })
          .catch(function(error) { if (fallo) fallo(error); else console.error(error); });
      };
    } });
  }
  window.google = { script: { run: runner() } };
})();
</script>`;
function responder(res, codigo, tipo, contenido) {
  res.writeHead(codigo, { 'Content-Type': tipo + ';charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(contenido);
}
function escapar(valor) { return String(valor).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const servidor = http.createServer(async (req, res) => {
  if (![ '127.0.0.1:' + puerto, 'localhost:' + puerto ].includes(req.headers.host)) return responder(res, 403, 'text/plain', 'Host no permitido.');
  try {
    const ruta = new URL(req.url, origen).pathname;
    if (req.method === 'GET' && ruta === '/') {
      // Se recompone al recargar para recoger cambios en los HTML del proyecto.
      const aviso = '<div style="position:fixed;bottom:8px;right:8px;z-index:100;background:#fff4cc;color:#513b00;padding:6px 10px;border:1px solid #d6b75a;border-radius:6px;font:12px sans-serif;pointer-events:none">Vista local · Google simulado · datos temporales</div>';
      const html = paginaCompuesta().replace('</head>', puente + '</head>')
        .replace('https://cdn.jsdelivr.net/npm/alpinejs@3.17.5/dist/cdn.min.js', '/alpine.js')
        .replace('<title>Empiria · Gestión de investigación</title>', '<title>Empiria · Vista local</title>')
        .replace('</body>', aviso + '</body>');
      return responder(res, 200, 'text/html', html);
    }
    if (req.method === 'GET' && ruta === '/alpine.js') return responder(res, 200, 'application/javascript', fs.readFileSync(require.resolve('alpinejs/dist/cdn.min.js')));
    if (req.method === 'GET' && ruta.startsWith('/consolidado/')) {
      const libro = libros.get(ruta.slice('/consolidado/'.length));
      if (!libro) return responder(res, 404, 'text/plain', 'Consolidado local no encontrado.');
      const filas = libro.filas.map((fila, i) => '<tr>' + fila.map(celda => '<' + (i ? 'td' : 'th') + '>' + escapar(celda) + '</' + (i ? 'td' : 'th') + '>').join('') + '</tr>').join('');
      return responder(res, 200, 'text/html', '<!doctype html><html lang="es"><meta charset="utf-8"><title>Consolidado local</title><style>body{font:15px system-ui;padding:24px;color:#172f42}table{border-collapse:collapse}td,th{padding:10px;border:1px solid #c8d4de;text-align:left}</style><h1>' + escapar(libro.nombre) + '</h1><p>Vista local de demostración. No se creó ningún archivo en Google Sheets.</p><table>' + filas + '</table></html>');
    }
    if (req.method === 'POST' && ruta === '/api') {
      if (req.headers.origin && ![origen, 'http://localhost:' + puerto].includes(req.headers.origin)) return responder(res, 403, 'application/json', JSON.stringify({ error: 'Origen no permitido.' }));
      let cuerpo = '';
      for await (const fragmento of req) {
        cuerpo += fragmento;
        if (Buffer.byteLength(cuerpo) > 65536) return responder(res, 413, 'application/json', JSON.stringify({ error: 'Petición demasiado grande.' }));
      }
      const datos = JSON.parse(cuerpo);
      if (!metodos.has(datos.metodo) || !Array.isArray(datos.argumentos)) return responder(res, 400, 'application/json', JSON.stringify({ error: 'Petición local inválida.' }));
      await new Promise(resolve => setTimeout(resolve, latencia));
      try { return responder(res, 200, 'application/json', JSON.stringify({ resultado: backend[datos.metodo](...datos.argumentos) })); }
      catch (error) { return responder(res, 200, 'application/json', JSON.stringify({ error: error.message })); }
    }
    responder(res, 404, 'text/plain', 'No encontrado.');
  } catch (error) { responder(res, 500, 'application/json', JSON.stringify({ error: error.message })); }
});
servidor.on('error', error => { console.error('No se pudo iniciar la vista local: ' + error.message); process.exitCode = 1; });
servidor.listen(puerto, '127.0.0.1', () => console.log('Empiria local: ' + origen + '\nServicios de Google simulados. Datos en memoria; se pierden al detener el servidor.'));
