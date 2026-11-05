const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { servidorDemo, paginaCompuesta } = require('./soporte.cjs');
const opciones = { sesion: 'demo-sesion-pruebas', comportamiento: 'correcto' };
function actividad(id = 'operacion-prueba-1') {
  return { idOperacion: id, titulo: 'Seguimiento de noviembre', descripcion: 'Revisar avances', ciclo: 'Ciclo 2026-II', fecha: '2026-12-10', hora: '23:59', plantillaId: 'P1', hojaInicial: 'Hoja1', hojaFinal: 'Hoja3' };
}

test('publicar y reenviar la misma operación devuelve el mismo identificador', () => {
  const s = servidorDemo();
  const uno = s.publicarActividadDemo(actividad(), opciones);
  const dos = s.publicarActividadDemo(actividad(), opciones);
  assert.equal(uno.estado, 'Completado');
  assert.equal(uno.simulacion, true);
  assert.equal(uno.idTarea, dos.idTarea);
  assert.throws(() => s.publicarActividadDemo(actividad('operacion-prueba-2'), opciones), /DUPLICADO/);
});

test('cancelar antes o después impide confirmar una publicación con ese ID', () => {
  const s = servidorDemo();
  const datos = actividad();
  s.cancelarActividadDemo(datos.idOperacion, opciones.sesion);
  assert.equal(s.publicarActividadDemo(datos, opciones).estado, 'Cancelado');
  const otros = actividad('operacion-prueba-2');
  s.publicarActividadDemo(otros, opciones);
  s.cancelarActividadDemo(otros.idOperacion, opciones.sesion);
  assert.equal(s.publicarActividadDemo(otros, opciones).estado, 'Cancelado');
});

test('valida ciclo, fecha, plantilla y rango en servidor, aunque se omita el cliente', () => {
  const s = servidorDemo();
  for (const cambio of [{ ciclo: 'Ciclo 2026-I' }, { fecha: '2026-10-01' }, { fecha: '2026-11-31' }, { fecha: '2027-01-01' }, { plantillaId: 'P2' }, { hojaInicial: 'Hoja5', hojaFinal: 'Hoja1' }, { titulo: '' }]) {
    assert.throws(() => s.publicarActividadDemo({ ...actividad(), ...cambio }, opciones), /VALIDACION/);
  }
  assert.throws(() => s.cancelarActividadDemo('x', opciones.sesion), /inválido/);
  assert.throws(() => s.publicarActividadDemo(actividad(), { ...opciones, sesion: 'x' }), /inválida/);
  assert.equal(s.publicarActividadDemo(actividad(), opciones).estado, 'Completado');
});

test('los cuatro fallos simulados permiten reintentar la misma operación', () => {
  const s = servidorDemo();
  for (const [comportamiento, mensaje] of [['sinPermisos', /PERMISOS/], ['cuota', /CUOTA/], ['adjunto', /ADJUNTO/], ['sinConexion', /CONEXION/]]) {
    assert.throws(() => s.publicarActividadDemo(actividad(), { ...opciones, comportamiento }), mensaje);
  }
  assert.equal(s.publicarActividadDemo(actividad(), opciones).estado, 'Completado');
});

test('reportes: datos, vacío, estructura inválida y repositorio no disponible', () => {
  const s = servidorDemo();
  assert.ok(s.obtenerDatosReportes().investigadores.length > 0);
  assert.throws(() => s.obtenerDatosReportes({ condicion: 'estructura' }), /ESTRUCTURA/);
  assert.throws(() => s.obtenerDatosReportes({ condicion: 'repositorio' }), /REPOSITORIO/);
  s.BASE_DATOS_EMPIRIA = { investigadores: [] };
  assert.equal(s.obtenerDatosReportes().investigadores.length, 0);
  s.BASE_DATOS_EMPIRIA = { investigadores: [{ id: '1', nombre: 'Prueba', publicaciones: 'mal' }] };
  assert.throws(() => s.obtenerDatosReportes(), /ESTRUCTURA/);
});

test('composición Apps Script y sintaxis de todos los bloques del cliente', () => {
  const html = paginaCompuesta();
  assert.ok(!html.includes('<?!='));
  let cuenta = 0;
  for (const bloque of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    new vm.Script(bloque[1]);
    cuenta++;
  }
  assert.ok(cuenta >= 8);
});
