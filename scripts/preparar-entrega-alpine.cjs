// Prepara la aplicación modular para copiar al espacio plano de Apps Script.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { paginaCompuesta } = require('../tests/soporte.cjs');
const raiz = path.resolve(__dirname, '..');
const destino = fs.mkdtempSync(path.join(os.tmpdir(), 'empiria-entrega-alpine-'));
const html = paginaCompuesta();
assert.equal(html.includes('<?'), false, 'Quedó una inclusión sin resolver');
for (const modulo of ['navegacion', 'tareas', 'reportes']) {
  assert.ok(html.includes("Alpine.store('" + modulo + "'"), 'Falta store ' + modulo);
}
for (const nombre of ['Código.gs', 'TareasServidor.gs', 'ReportesServidor.gs', 'Consolidados.gs', 'BaseDatos.gs']) {
  const codigo = fs.readFileSync(path.join(raiz, 'src/servidor', nombre), 'utf8');
  new vm.Script(codigo, { filename: nombre });
  fs.writeFileSync(path.join(destino, nombre), codigo);
}
const nombres = new Set(['Código', 'TareasServidor', 'ReportesServidor', 'Consolidados', 'BaseDatos']);
for (const carpeta of ['vistas', 'scripts', 'estilos']) {
  for (const nombre of fs.readdirSync(path.join(raiz, 'src', carpeta)).filter(n => n.endsWith('.html') && n !== 'Demostracion.html')) {
    assert.equal(nombres.has(path.parse(nombre).name), false, 'Nombre duplicado: ' + nombre);
    nombres.add(path.parse(nombre).name);
    fs.copyFileSync(path.join(raiz, 'src', carpeta, nombre), path.join(destino, nombre));
  }
}
fs.copyFileSync(path.join(raiz, 'docs/ENTREGA_ALPINE.md'), path.join(destino, 'LEEME.md'));
console.log(destino);
