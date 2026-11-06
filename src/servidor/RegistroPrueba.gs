// Preparación real de una prueba individual. Ejecutar únicamente desde el editor.
// No invita usuarios y no publica la tarea: crea/reutiliza un borrador verificable.
function prepararPruebaRegistro_() {
  configuracionRegistro_();
  var bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);
  try {
    return prepararPruebaSinBloqueoRegistro_();
  } finally {
    bloqueo.releaseLock();
  }
}

function prepararPruebaSinBloqueoRegistro_() {
  var config = configuracionRegistro_();
  var props = PropertiesService.getScriptProperties();
  var prueba = JSON.parse(props.getProperty('EMPIRIA_PRUEBA_CONFIG') || '{}');
  if (!prueba.idClase || !prueba.correoInvestigador || !prueba.ciclo) errorRegistro_('PRUEBA_SIN_CONFIGURAR');
  var seleccion = seccionesRegistro_(prueba.secciones || ['R - Journal']);
  Classroom.Courses.Teachers.get(prueba.idClase, 'me');
  var perfil = Classroom.UserProfiles.get(prueba.correoInvestigador);
  // Si falta la membresía, falla sin enviar invitaciones.
  Classroom.Courses.Students.get(prueba.idClase, perfil.id);
  var bd = SpreadsheetApp.openById(config.bd);
  var personas = tablaRegistro_(bd, 'SYS - Personas');
  var matches = personas.filas.filter(function(p) { return String(p['ID usuario Classroom']) === String(perfil.id); });
  if (matches.length > 1) errorRegistro_('IDENTIDAD_DUPLICADA');
  var persona = matches[0];
  if (persona && persona['Estado identidad'] !== 'Verificada') errorRegistro_('IDENTIDAD_REQUIERE_REVISION');
  if (!persona) persona = guardarFilaRegistro_(personas, { 'ID investigador Empiria': 'INV-' + Utilities.getUuid(), 'ID usuario Classroom': String(perfil.id), 'Nombre de presentación': perfil.name && perfil.name.fullName || '', 'Correo institucional': prueba.correoInvestigador, 'Estado identidad': 'Verificada', 'Fecha verificación': new Date() });
  var operacion = JSON.parse(props.getProperty('EMPIRIA_PRUEBA_OPERACION') || '{}');
  var firma = JSON.stringify([String(prueba.idClase), String(perfil.id), prueba.ciclo, seleccion.principales]);
  if (operacion.firma && operacion.firma !== firma) errorRegistro_('PRUEBA_CONFIGURACION_CAMBIADA');
  if (!operacion.id) {
    operacion = { id: Utilities.getUuid(), firma: firma };
    props.setProperty('EMPIRIA_PRUEBA_OPERACION', JSON.stringify(operacion));
  }
  if (!operacion.plantilla) {
    operacion.plantilla = prepararPlantillaRegistro_(seleccion.principales, 'Empiria — plantilla de prueba ' + operacion.id).idPlantillaTarea;
    props.setProperty('EMPIRIA_PRUEBA_OPERACION', JSON.stringify(operacion));
  }
  var titulo = 'Empiria — prueba de registro [' + operacion.id + ']';
  var tarea;
  if (operacion.tarea) tarea = Classroom.Courses.CourseWork.get(prueba.idClase, operacion.tarea);
  else {
    // Recupera una respuesta de create perdida sin publicar otra tarea al reintentar.
    var token, coincidencias = [];
    do {
      var pagina = Classroom.Courses.CourseWork.list(prueba.idClase, { courseWorkStates: ['DRAFT', 'PUBLISHED'], pageSize: 100, pageToken: token });
      coincidencias = coincidencias.concat((pagina.courseWork || []).filter(function(t) { return t.title === titulo; }));
      token = pagina.nextPageToken;
    } while (token);
    if (coincidencias.length > 1) errorRegistro_('BORRADOR_DUPLICADO_REVISAR');
    tarea = coincidencias[0] || Classroom.Courses.CourseWork.create({
      title: titulo, description: 'Prueba individual de captura, protecciones y recolección de Empiria. Usar solo datos sintéticos.',
      workType: 'ASSIGNMENT', state: 'DRAFT', assigneeMode: 'INDIVIDUAL_STUDENTS', individualStudentsOptions: { studentIds: [String(perfil.id)] },
      materials: [{ driveFile: { driveFile: { id: operacion.plantilla }, shareMode: 'STUDENT_COPY' } }]
    }, prueba.idClase);
    operacion.tarea = String(tarea.id);
    props.setProperty('EMPIRIA_PRUEBA_OPERACION', JSON.stringify(operacion));
  }
  var materiales = tarea.materials || [];
  var alumnos = tarea.individualStudentsOptions && tarea.individualStudentsOptions.studentIds || [];
  if (tarea.assigneeMode !== 'INDIVIDUAL_STUDENTS' || alumnos.length !== 1 || String(alumnos[0]) !== String(perfil.id) ||
      materiales.length !== 1 || !materiales[0].driveFile || !materiales[0].driveFile.driveFile || materiales[0].driveFile.shareMode !== 'STUDENT_COPY' || String(materiales[0].driveFile.driveFile.id) !== String(operacion.plantilla) || ['DRAFT', 'PUBLISHED'].indexOf(tarea.state) === -1) errorRegistro_('BORRADOR_ALTERADO');
  var asignaciones = tablaRegistro_(bd, 'SYS - Asignaciones');
  var asignadas = asignaciones.filas.filter(function(a) { return String(a['ID clase Classroom']) === String(prueba.idClase) && String(a['ID tarea Classroom']) === String(tarea.id) && String(a['ID usuario Classroom']) === String(perfil.id); });
  if (asignadas.length > 1) errorRegistro_('ASIGNACION_DUPLICADA');
  if (!asignadas.length) guardarFilaRegistro_(asignaciones, { 'ID asignación': Utilities.getUuid(), 'ID clase Classroom': String(prueba.idClase), 'ID tarea Classroom': String(tarea.id), 'ID usuario Classroom': String(perfil.id), 'ID investigador Empiria': persona['ID investigador Empiria'], 'Ciclo de asignación': prueba.ciclo, 'ID plantilla': operacion.plantilla, 'Versión esquema': String(ESQUEMA_REGISTRO.version), 'Fecha asignación': new Date(), 'Estado asignación': 'Asignada' });
  var secciones = tablaRegistro_(bd, 'SYS - Secciones asignadas');
  seleccion.principales.concat(seleccion.auxiliares).forEach(function(nombre) {
    var existentes = secciones.filas.filter(function(s) { return String(s['ID clase Classroom']) === String(prueba.idClase) && String(s['ID tarea Classroom']) === String(tarea.id) && s['Sección captura'] === nombre; });
    if (existentes.length > 1) errorRegistro_('SECCION_ASIGNADA_DUPLICADA');
    if (!existentes.length) guardarFilaRegistro_(secciones, { 'ID clase Classroom': String(prueba.idClase), 'ID tarea Classroom': String(tarea.id), 'ID plantilla de tarea': operacion.plantilla, 'Versión esquema': String(ESQUEMA_REGISTRO.version), 'Sección captura': nombre, 'Tipo de sección': seleccion.principales.indexOf(nombre) !== -1 ? 'Principal' : 'Auxiliar' });
  });
  return { idClase: String(prueba.idClase), idTarea: String(tarea.id), estado: tarea.state, urlTarea: tarea.alternateLink || '', idPlantillaTarea: operacion.plantilla, idInvestigador: persona['ID investigador Empiria'], invitacionesEnviadas: 0 };
}
