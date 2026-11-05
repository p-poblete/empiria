const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const raiz = path.resolve(__dirname, '..');
const AHORA = '2026-11-05T15:00:00-05:00';

function servidorDemo(opciones = {}) {
  const almacen = new Map();
  let bloqueado = false;
  const contexto = {
    Date: opciones.relojReal ? Date : class extends Date {
      constructor(...args) { super(...(args.length ? args : [AHORA])); }
      static now() { return new Date(AHORA).getTime(); }
    },
    Utilities: { getUuid: randomUUID },
    CacheService: { getUserCache: () => ({ get: clave => almacen.get(clave) || null, put: (clave, valor) => almacen.set(clave, valor) }) },
    LockService: { getUserLock: () => ({
      waitLock() { if (bloqueado) throw new Error('Acceso concurrente sin liberar bloqueo.'); bloqueado = true; },
      releaseLock() { bloqueado = false; }
    }) }
  };
  Object.assign(contexto, opciones.servicios || {});
  vm.createContext(contexto);
  ['BaseDatos.gs', 'Código.gs'].forEach(nombre => vm.runInContext(fs.readFileSync(path.join(raiz, 'src/servidor', nombre), 'utf8'), contexto));
  return contexto;
}

function paginaCompuesta() {
  const archivos = {};
  ['vistas', 'scripts', 'estilos'].forEach(carpeta => {
    fs.readdirSync(path.join(raiz, 'src', carpeta)).filter(nombre => nombre.endsWith('.html')).forEach(nombre => {
      archivos[nombre.slice(0, -5)] = fs.readFileSync(path.join(raiz, 'src', carpeta, nombre), 'utf8');
    });
  });
  function incluir(nombre) {
    if (!archivos[nombre]) throw new Error('Inclusión inexistente: ' + nombre);
    return archivos[nombre].replace(/<\?!= include\('([^']+)'\); \?>/g, (_, hijo) => incluir(hijo));
  }
  return incluir('Index');
}

module.exports = { servidorDemo, paginaCompuesta, AHORA, raiz };
