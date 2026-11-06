// Genera un único archivo para añadir al editor sin sobrescribir el proyecto.
// La cuenta de prueba solo se lee desde configuración local ignorada por Git.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const raiz = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(raiz, 'datos/registro-prueba.local.json'), 'utf8'));
if (!/^\d+$/.test(config.idClase) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.correoInvestigador)) throw new Error('Clase o cuenta de prueba inválida.');
const configuracion = {
  EMPIRIA_BD_ID: config.idBD,
  EMPIRIA_PLANTILLA_ID: config.idPlantilla,
  EMPIRIA_PRUEBA_CONFIG: JSON.stringify({ idClase: config.idClase, correoInvestigador: config.correoInvestigador, ciclo: config.ciclo, secciones: config.secciones })
};
if (!configuracion.EMPIRIA_BD_ID || !configuracion.EMPIRIA_PLANTILLA_ID) throw new Error('Faltan libros de prueba.');
const archivos = fs.readdirSync(path.join(raiz, 'src/servidor')).filter(n => /^Registro.*\.gs$/.test(n)).sort();
const codigo = archivos.map(n => '// ===== ' + n + ' =====\n' + fs.readFileSync(path.join(raiz, 'src/servidor', n), 'utf8')).join('\n');
const arranque = `
// Configuración privada para esta prueba. Ejecutar manualmente desde el editor.
function empiriaConfigurarPrueba_() {
  var valores = ${JSON.stringify(configuracion, null, 2)};
  var correo = Session.getActiveUser().getEmail();
  if (!correo) throw new Error('No se pudo verificar la cuenta docente.');
  Classroom.Courses.Teachers.get(JSON.parse(valores.EMPIRIA_PRUEBA_CONFIG).idClase, 'me');
  var props = PropertiesService.getScriptProperties();
  var administradores = JSON.parse(props.getProperty('EMPIRIA_ADMINISTRADORES') || '[]');
  if (administradores.length && administradores.indexOf(correo) === -1) throw new Error('Administración existente: revisar sin sobrescribir.');
  Object.keys(valores).forEach(function(k) {
    if (props.getProperty(k) && props.getProperty(k) !== valores[k]) throw new Error('Configuración existente distinta: ' + k);
  });
  Object.keys(valores).forEach(function(k) { props.setProperty(k, valores[k]); });
  if (!administradores.length) props.setProperty('EMPIRIA_ADMINISTRADORES', JSON.stringify([correo]));
  return { configurado: true, publicado: false };
}

function empiriaPrepararPrueba_() {
  var resultado = prepararPruebaRegistro_();
  console.log(JSON.stringify(resultado));
  return resultado;
}

function empiriaPublicarPrueba_() {
  var resultado = prepararPruebaRegistro_();
  if (resultado.estado === 'DRAFT') {
    var tarea = Classroom.Courses.CourseWork.patch({ state: 'PUBLISHED' }, resultado.idClase, resultado.idTarea, { updateMask: 'state' });
    resultado.estado = tarea.state;
    resultado.urlTarea = tarea.alternateLink || '';
  }
  console.log(JSON.stringify(resultado));
  return resultado;
}

function empiriaEntregaPrueba_() {
  configuracionRegistro_();
  var props = PropertiesService.getScriptProperties();
  var prueba = JSON.parse(props.getProperty('EMPIRIA_PRUEBA_CONFIG') || '{}');
  var operacion = JSON.parse(props.getProperty('EMPIRIA_PRUEBA_OPERACION') || '{}');
  if (!operacion.tarea) throw new Error('Prepare primero el borrador.');
  var usuario = Classroom.UserProfiles.get(prueba.correoInvestigador);
  var pagina = Classroom.Courses.CourseWork.StudentSubmissions.list(prueba.idClase, operacion.tarea, { userId: usuario.id, pageSize: 100 });
  if (!pagina.studentSubmissions || pagina.studentSubmissions.length !== 1) throw new Error('No se identificó una entrega individual.');
  return { clase: prueba.idClase, tarea: operacion.tarea, entrega: pagina.studentSubmissions[0].id };
}

function empiriaDiagnosticarPrueba_() {
  var e = empiriaEntregaPrueba_();
  var resultado = diagnosticarEntregaRegistro_(e.clase, e.tarea, e.entrega);
  console.log(JSON.stringify(resultado));
  return resultado;
}

function empiriaPrepararReferencias_() {
  var e = empiriaEntregaPrueba_();
  var resultado = prepararReferenciasEntregaRegistro_(e.clase, e.tarea, e.entrega);
  console.log(JSON.stringify(resultado));
  return resultado;
}

function empiriaAplicarProtecciones_() {
  var e = empiriaEntregaPrueba_();
  var resultado = aplicarProteccionesEntregaRegistro_(e.clase, e.tarea, e.entrega);
  console.log(JSON.stringify(resultado));
  return resultado;
}

function empiriaRecolectarPrueba_() {
  var e = empiriaEntregaPrueba_();
  var resultado = recolectarEntregaRegistro_(e.clase, e.tarea, e.entrega);
  console.log(JSON.stringify(resultado));
  return resultado;
}
`;
const destino = fs.mkdtempSync(path.join(os.tmpdir(), 'empiria-registro-'));
fs.writeFileSync(path.join(destino, 'EmpiriaRegistro.gs'), codigo + '\n' + arranque, { mode: 0o600 });
fs.writeFileSync(path.join(destino, 'manifest-requerido.json'), JSON.stringify({
  timeZone: 'America/Lima', runtimeVersion: 'V8',
  dependencies: { enabledAdvancedServices: [{ userSymbol: 'Classroom', serviceId: 'classroom', version: 'v1' }] },
  oauthScopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/classroom.rosters.readonly', 'https://www.googleapis.com/auth/classroom.profile.emails', 'https://www.googleapis.com/auth/classroom.coursework.students']
}, null, 2) + '\n', { mode: 0o600 });
console.log(destino);
