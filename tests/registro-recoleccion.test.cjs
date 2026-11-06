const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash, randomUUID } = require('node:crypto');
const { servidorDemo } = require('./soporte.cjs');
const esquema = require('../docs/esquema-sheets.json');

function hoja(nombre, datos) {
  return {
    nombre, datos, fallarAntes: false, fallarDespues: false,
    getLastRow() { return this.datos.length; },
    getLastColumn() { return this.datos[0].length; },
    getRange(fila, columna, alto = 1, ancho = 1) {
      const h = this;
      return {
        getValues() { return Array.from({ length: alto }, (_, i) => Array.from({ length: ancho }, (_, j) => h.datos[fila - 1 + i]?.[columna - 1 + j] ?? '')); },
        getFormulas() { return Array.from({ length: alto }, () => Array(ancho).fill('')); },
        setValues(valores) {
          if (h.fallarAntes) { h.fallarAntes = false; throw new Error('Fallo antes de guardar'); }
          valores.forEach((r, i) => r.forEach((v, j) => {
            h.datos[fila - 1 + i] ||= h.datos[0].map(() => '');
            h.datos[fila - 1 + i][columna - 1 + j] = v;
          }));
          if (h.fallarDespues) { h.fallarDespues = false; throw new Error('Fallo tras guardar'); }
        },
        setValue(valor) { this.setValues([[valor]]); }
      };
    }
  };
}

function entorno() {
  const seccion = esquema.captura.find(c => c.hoja === 'R - Journal');
  const filas = [seccion.columnas, seccion.columnas.map(() => '')].map(r => [...r]);
  filas[1][3] = 'Título de prueba';
  const copiaHojas = {
    'R - Journal': hoja('R - Journal', filas),
    'R - Participantes': hoja('R - Participantes', [esquema.registroAuxiliar.find(s => s.title === 'R - Participantes').columns])
  };
  const bdHojas = Object.fromEntries(esquema.baseAuxiliar.map(s => [s.title, hoja(s.title, [[...s.columns]])]));
  const core = seccion.columnas.slice(3, -3);
  bdHojas['DB - Journal'] = hoja('DB - Journal', [['ID', 'Fecha registro', 'Fuente', ...core, 'ID investigador (registrante)', 'Ciclo académico', 'ID tarea / Classroom', 'ID entrega', 'Fecha y hora de guardado', 'Fecha última actualización', 'Estado de validación']]);
  const bd = { getSheetByName: n => bdHojas[n] };
  const copia = { getSheetByName: n => copiaHojas[n] };
  let bloqueado = false;
  const s = servidorDemo({ servicios: {
    SpreadsheetApp: { openById: id => id === 'bd' ? bd : copia },
    Utilities: { getUuid: randomUUID, DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' }, computeDigest: (_, t) => createHash('sha256').update(t).digest(), base64EncodeWebSafe: b => b.toString('base64url') },
    LockService: { getScriptLock: () => ({ waitLock() { assert.equal(bloqueado, false); bloqueado = true; }, releaseLock() { bloqueado = false; } }) }
  } });
  s.contextoEntregaRegistro_ = () => ({ bd, idClase: 'clase', idTarea: 'tarea', idEntrega: 'entrega', idArchivo: 'copia', idPersona: 'persona', ciclo: 'Ciclo 2026-II', seleccion: ['R - Journal'] });
  s.configuracionRegistro_ = () => ({ bd: 'bd', plantilla: 'maestra', correo: 'docente@example.test' });
  return { s, bdHojas, copiaHojas, bloqueado: () => bloqueado };
}

test('recolectar dos veces conserva IDs y actualiza el mismo destino sin duplicar', () => {
  const e = entorno();
  assert.equal(e.s.recolectarEntregaRegistro_().creados, 1);
  const id = e.copiaHojas['R - Journal'].datos[1][0];
  assert.ok(id.startsWith('REG-'));
  e.copiaHojas['R - Journal'].datos[1][3] = 'Título corregido';
  assert.equal(e.s.recolectarEntregaRegistro_().actualizados, 1);
  assert.equal(e.bdHojas['DB - Journal'].datos.length, 2);
  assert.equal(e.bdHojas['SYS - Orígenes'].datos.length, 2);
  assert.equal(e.copiaHojas['R - Journal'].datos[1][0], id);
  assert.ok(e.bdHojas['DB - Journal'].datos[1].includes('Título corregido'));
  assert.equal(e.bloqueado(), false);
});

test('fallo tras guardar destino se reintenta sin crear otra fila', () => {
  const e = entorno();
  e.bdHojas['DB - Journal'].fallarDespues = true;
  assert.throws(() => e.s.recolectarEntregaRegistro_(), /Fallo tras guardar/);
  assert.equal(e.bloqueado(), false);
  e.s.recolectarEntregaRegistro_();
  assert.equal(e.bdHojas['DB - Journal'].datos.length, 2);
  assert.equal(e.bdHojas['SYS - Orígenes'].datos.length, 2);
});

test('fallo al escribir ID en copia se recupera desde la reserva persistente', () => {
  const e = entorno();
  e.copiaHojas['R - Journal'].fallarAntes = true;
  assert.throws(() => e.s.recolectarEntregaRegistro_(), /Fallo antes/);
  assert.equal(e.copiaHojas['R - Journal'].datos[1][0], '');
  e.s.recolectarEntregaRegistro_();
  assert.equal(e.bdHojas['DB - Journal'].datos.length, 2);
  assert.equal(e.bdHojas['SYS - Orígenes'].datos.length, 2);
});

test('alterar IDs y encabezados rechaza la lectura sin modificar datos existentes', () => {
  const e = entorno();
  e.s.recolectarEntregaRegistro_();
  const previo = JSON.stringify(e.bdHojas['DB - Journal'].datos);
  const copia = e.copiaHojas['R - Journal'];
  const id = copia.datos[1][0];
  copia.datos[1][0] = 'inventado';
  assert.throws(() => e.s.recolectarEntregaRegistro_(), /ID_NO_RECONOCIDO/);
  copia.datos[1][0] = id;
  copia.datos[0][3] = 'alterado';
  assert.throws(() => e.s.recolectarEntregaRegistro_(), /ESTRUCTURA_ALTERADA/);
  assert.equal(JSON.stringify(e.bdHojas['DB - Journal'].datos), previo);
});

test('vaciar un registro recolectado informa y conserva el destino', () => {
  const e = entorno();
  e.s.recolectarEntregaRegistro_();
  const previo = JSON.stringify(e.bdHojas['DB - Journal'].datos);
  e.copiaHojas['R - Journal'].datos[1].fill('', 3);
  const r = e.s.recolectarEntregaRegistro_();
  assert.equal(r.avisos[0].codigo, 'REGISTRO_VACIADO_SIN_BAJA');
  assert.equal(JSON.stringify(e.bdHojas['DB - Journal'].datos), previo);
});

test('la baja requiere solicitud y resolución y no se revierte al recolectar otra vez', () => {
  const e = entorno();
  e.s.recolectarEntregaRegistro_();
  const origen = e.bdHojas['SYS - Orígenes'].datos[1][0];
  const solicitud = e.s.solicitarBajaRegistro_(origen, 'Registro de prueba descartado');
  assert.equal(e.s.solicitarBajaRegistro_(origen, 'Reintento').idSolicitud, solicitud.idSolicitud);
  assert.equal(e.s.resolverBajaRegistro_(solicitud.idSolicitud, true, 'Baja verificada').borradoFisico, false);
  const previo = JSON.stringify(e.bdHojas['DB - Journal'].datos);
  const r = e.s.recolectarEntregaRegistro_();
  assert.equal(r.avisos[0].codigo, 'REGISTRO_RETIRADO');
  assert.equal(JSON.stringify(e.bdHojas['DB - Journal'].datos), previo);
  assert.throws(() => e.s.resolverBajaRegistro_(solicitud.idSolicitud, false, 'Reescribir resolución'), /NO_PENDIENTE/);
});

test('cambiar el archivo de una entrega ya vinculada se rechaza', () => {
  const e = entorno();
  e.s.recolectarEntregaRegistro_();
  const contexto = e.s.contextoEntregaRegistro_();
  e.s.contextoEntregaRegistro_ = () => ({ ...contexto, idArchivo: 'otra-copia' });
  assert.throws(() => e.s.recolectarEntregaRegistro_(), /COPIA_DE_ENTREGA_CAMBIADA/);
  assert.equal(e.bdHojas['DB - Journal'].datos.length, 2);
});

test('la preparación crea un borrador individual y al repetir no duplica tarea ni asignaciones', () => {
  const e = entorno();
  const propiedades = new Map([['EMPIRIA_PRUEBA_CONFIG', JSON.stringify({ idClase: 'clase', correoInvestigador: 'persona@example.test', ciclo: 'Ciclo 2026-II' })]]);
  e.s.PropertiesService = { getScriptProperties: () => ({ getProperty: k => propiedades.get(k) || null, setProperty: (k, v) => propiedades.set(k, v) }) };
  let tarea, creadas = 0;
  e.s.Classroom = {
    UserProfiles: { get: () => ({ id: 'usuario', name: { fullName: 'Persona sintética' } }) },
    Courses: {
      Teachers: { get: () => ({ userId: 'docente' }) }, Students: { get: () => ({ userId: 'usuario' }) },
      CourseWork: {
        list: () => ({ courseWork: tarea ? [tarea] : [] }), get: () => tarea,
        create: datos => { creadas++; tarea = { ...JSON.parse(JSON.stringify(datos)), id: 'tarea-1' }; return tarea; }
      }
    }
  };
  e.s.prepararPlantillaRegistro_ = () => ({ idPlantillaTarea: 'plantilla-tarea' });
  const primera = e.s.prepararPruebaRegistro_();
  const segunda = e.s.prepararPruebaRegistro_();
  assert.equal(primera.idTarea, segunda.idTarea);
  assert.equal(creadas, 1);
  assert.equal(tarea.state, 'DRAFT');
  assert.equal(tarea.assigneeMode, 'INDIVIDUAL_STUDENTS');
  assert.deepEqual(tarea.individualStudentOptions.studentIds, ['usuario']);
  assert.equal(tarea.materials[0].driveFile.shareMode, 'STUDENT_COPY');
  assert.equal(e.bdHojas['SYS - Asignaciones'].datos.length, 2);
  assert.equal(e.bdHojas['SYS - Secciones asignadas'].datos.length, 5);
  assert.equal(primera.invitacionesEnviadas, 0);
});

test('si la cuenta no pertenece a la clase no prepara plantilla ni crea tarea', () => {
  const e = entorno();
  e.s.PropertiesService = { getScriptProperties: () => ({ getProperty: k => k === 'EMPIRIA_PRUEBA_CONFIG' ? JSON.stringify({ idClase: 'clase', correoInvestigador: 'persona@example.test', ciclo: 'Ciclo 2026-II' }) : null }) };
  let preparadas = 0;
  e.s.prepararPlantillaRegistro_ = () => { preparadas++; };
  e.s.Classroom = { UserProfiles: { get: () => ({ id: 'usuario' }) }, Courses: { Teachers: { get() {} }, Students: { get() { throw new Error('No pertenece a la clase'); } } } };
  assert.throws(() => e.s.prepararPruebaRegistro_(), /No pertenece/);
  assert.equal(preparadas, 0);
  assert.equal(e.bdHojas['SYS - Asignaciones'].datos.length, 1);
  assert.equal(e.bloqueado(), false);
});

test('la lectura rechaza fórmulas y columnas añadidas en la copia', () => {
  const e = entorno();
  const hoja = e.copiaHojas['R - Journal'];
  const libro = { getSheetByName: n => e.copiaHojas[n] };
  const original = hoja.getRange;
  hoja.getRange = function(...args) {
    const rango = original.apply(this, args);
    rango.getFormulas = () => [[''], ['=IMPORTXML("x")']];
    return rango;
  };
  assert.throws(() => e.s.leerCapturaRegistro_(libro, ['R - Journal']), /FORMULA_EN_CAPTURA/);
  hoja.getRange = original;
  hoja.datos[0].push('columna inesperada');
  assert.throws(() => e.s.leerCapturaRegistro_(libro, ['R - Journal']), /COLUMNAS_AÑADIDAS/);
});
