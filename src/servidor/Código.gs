// INICIO: Entrada de la aplicación web
function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Empiria · Gestión de investigación")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// FIN: Entrada de la aplicación web

// INICIO: Composición de plantillas HTML
// Evalúa inclusiones anidadas: Reportes compone sus dos submódulos HTML.
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

// FIN: Composición de plantillas HTML

// INICIO: Consulta y validación de datos para reportes
// La disponibilidad se deriva del contenido de BaseDatos.gs.
function obtenerDatosReportes(opciones) {
  // Condiciones del prototipo: la petición sigue atravesando google.script.run.
  if (opciones && opciones.condicion === 'estructura') throw new Error('ESTRUCTURA: condición de prueba activa.');
  if (opciones && opciones.condicion === 'repositorio') throw new Error('REPOSITORIO: condición de prueba activa.');
  var base =
    typeof BASE_DATOS_EMPIRIA === "undefined"
      ? { investigadores: [] }
      : BASE_DATOS_EMPIRIA;
  // FA-012 de CU-005: los errores de estructura llevan el prefijo ESTRUCTURA para que
  // el cliente los distinga de una falla de conexión con el repositorio (FA-013).
  if (!base || !Array.isArray(base.investigadores)) {
    throw new Error(
      "ESTRUCTURA: BaseDatos.gs debe definir BASE_DATOS_EMPIRIA con una colección investigadores.",
    );
  }
  var investigadores = JSON.parse(JSON.stringify(base.investigadores));
  investigadores.forEach(function (inv, indice) {
    if (!inv || !inv.id || !inv.nombre)
      throw new Error(
        "ESTRUCTURA: investigador incompleto en BaseDatos.gs, fila " + (indice + 1) + ".",
      );
    ["publicaciones", "proyectos", "eventos", "entregas", "dias"].forEach(
      function (campo) {
        if (inv[campo] == null) inv[campo] = [];
        if (!Array.isArray(inv[campo]))
          throw new Error(
            "ESTRUCTURA: la colección " + campo + " de " + inv.id + " debe ser una lista.",
          );
      },
    );
    ["publicaciones", "proyectos", "eventos", "entregas"].forEach(
      function (campo) {
        inv[campo].forEach(function (registro) {
          if (
            !registro ||
            typeof registro !== "object" ||
            Array.isArray(registro)
          )
            throw new Error(
              "ESTRUCTURA: registro inválido en " + campo + " de " + inv.id + ".",
            );
        });
      },
    );
  });
  return { investigadores: investigadores };
}

// FIN: Consulta y validación de datos para reportes

// INICIO: FA-007 de CU-005 · Consolidado del ciclo en Google Sheets
// Localiza el libro registrado para el ciclo y verifica permisos (paso 2); si no
// existe, lo crea, incorpora los datos y registra su identificador para no
// duplicarlo (paso 3). Un fallo se propaga al cliente como FA-017.
function obtenerConsolidadoCiclo(ciclo) {
  if (!ciclo) throw new Error("Ciclo no indicado.");
  var propiedades = PropertiesService.getScriptProperties();
  var clave = "CONSOLIDADO_" + ciclo;
  var id = propiedades.getProperty(clave);
  if (id) {
    try {
      return DriveApp.getFileById(id).getUrl();
    } catch (error) {
      // El identificador registrado ya no es accesible: se vuelve a crear.
    }
  }
  var libro = SpreadsheetApp.create("Empiria · Consolidado " + ciclo);
  var filas = [["ID", "Investigador", "Carrera", "RENACYT", "Publicaciones", "Proyectos", "Eventos"]];
  obtenerDatosReportes().investigadores.forEach(function (inv) {
    var delCiclo = function (lista) {
      return lista.filter(function (item) { return item.ciclo === ciclo; }).length;
    };
    filas.push([inv.id, inv.nombre, inv.carrera || "", inv.renacytNivel || "",
      delCiclo(inv.publicaciones), delCiclo(inv.proyectos), delCiclo(inv.eventos)]);
  });
  var hoja = libro.getSheets()[0];
  hoja.getRange(1, 1, filas.length, filas[0].length).setValues(filas);
  hoja.protect().setDescription("Consolidado de solo consulta").setWarningOnly(true);
  propiedades.setProperty(clave, libro.getId());
  return libro.getUrl();
}
// FIN: FA-007 de CU-005 · Consolidado del ciclo en Google Sheets

// CU-002: catálogo de demostración. No consulta archivos privados ni Classroom.
function obtenerPlantillasTarea(ciclo) {
  if (!/^Ciclo 20\d{2}-(I|II)$/.test(ciclo || '')) throw new Error('Ciclo inválido.');
  return { ciclo: ciclo, plantillas: [
    { id: 'P1', nombre: 'Plantilla_Base_Proyectos_v1', extension: '.gsheet', fechaSubida: '15/03/2026', numHojas: 5, hojas: ['Hoja1', 'Hoja2', 'Hoja3', 'Hoja4', 'Hoja5'], estado: 'disponible', cicloAsociado: null, urlSheets: 'https://docs.google.com/spreadsheets/d/1abcDEMO123/edit' },
    { id: 'P2', nombre: 'Plantilla_Informe_Financiero_v2', extension: '.gsheet', fechaSubida: '10/03/2026', numHojas: 3, hojas: ['Hoja1', 'Hoja2', 'Hoja3'], estado: 'en_uso', cicloAsociado: 'Ciclo 2026-I', urlSheets: 'https://docs.google.com/spreadsheets/d/2defDEMO456/edit' }
  ] };
}

// La sesión identifica una demostración, no autentica usuarios. El caché expira
// a las seis horas; no constituye persistencia ni control de acceso de producción.
function conRegistroDemo_(sesion, accion) {
  if (!/^[a-zA-Z0-9-]{10,100}$/.test(sesion || '')) throw new Error('Sesión de demostración inválida.');
  var bloqueo = LockService.getUserLock();
  bloqueo.waitLock(10000);
  try {
    var cache = CacheService.getUserCache();
    var clave = 'EMPIRIA_DEMO_' + sesion;
    var registro = JSON.parse(cache.get(clave) || '{}');
    var resultado = accion(registro);
    // Acota el caché para una sesión de prácticas. Reiniciar la página abre otra.
    if (Object.keys(registro).length > 100) throw new Error('Límite de 100 operaciones de demostración por sesión. Recargue la página.');
    cache.put(clave, JSON.stringify(registro), 21600);
    return resultado;
  } finally {
    bloqueo.releaseLock();
  }
}

function validarOperacionDemo_(id) {
  if (!/^[a-zA-Z0-9-]{10,100}$/.test(id || '')) throw new Error('Identificador de operación inválido.');
}

function publicarActividadDemo(datos, opciones) {
  datos = datos || {};
  opciones = opciones || {};
  validarOperacionDemo_(datos.idOperacion);
  return conRegistroDemo_(opciones.sesion, function(registro) {
    var anterior = registro[datos.idOperacion];
    // Reenviar la misma operación nunca crea otra tarea, incluso si fue cancelada.
    if (anterior) return anterior;
    if (datos.ciclo !== 'Ciclo 2026-II') throw new Error('VALIDACION: solo se puede publicar en el ciclo activo.');
    if (!String(datos.titulo || '').trim() || !String(datos.descripcion || '').trim()) throw new Error('VALIDACION: título y descripción obligatorios.');
    if (String(datos.titulo).length > 300 || String(datos.descripcion).length > 5000) throw new Error('VALIDACION: título o descripción demasiado largos.');
    datos.titulo = String(datos.titulo).trim();
    datos.descripcion = String(datos.descripcion).trim();
    var entrega = new Date(datos.fecha + 'T' + datos.hora + ':00-05:00');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha || '') || !/^\d{2}:\d{2}$/.test(datos.hora || '') || isNaN(entrega.getTime()) || entrega <= new Date() || entrega > new Date('2026-12-31T23:59:59-05:00')) throw new Error('VALIDACION: fecha fuera del periodo permitido (hora de Lima).');
    if (new Date(entrega.getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 16) !== datos.fecha + 'T' + datos.hora) throw new Error('VALIDACION: fecha de calendario inválida.');
    var plantilla = obtenerPlantillasTarea(datos.ciclo).plantillas.find(function(p) { return p.id === datos.plantillaId; });
    if (!plantilla || plantilla.estado !== 'disponible') throw new Error('VALIDACION: plantilla no disponible en el catálogo del servidor.');
    var inicio = plantilla.hojas.indexOf(datos.hojaInicial);
    var fin = plantilla.hojas.indexOf(datos.hojaFinal);
    if (inicio < 0 || fin < inicio) throw new Error('VALIDACION: rango de hojas inválido.');
    if (Object.keys(registro).some(function(id) { var t = registro[id]; return t.estado === 'Completado' && t.ciclo === datos.ciclo && t.titulo === datos.titulo; })) throw new Error('DUPLICADO: ya existe una tarea con el mismo nombre en esta clase.');
    // Fallos de la API simulada, seleccionados por el panel de condiciones.
    var errores = { sinPermisos: 'PERMISOS: no tiene el rol de Profesor (403).', cuota: 'CUOTA: peticiones excedidas (429).', sinConexion: 'CONEXION: servicio no disponible.', adjunto: 'ADJUNTO: no se pudo adjuntar la plantilla; se revirtió la tarea parcial.' };
    if (errores[opciones.comportamiento]) throw new Error(errores[opciones.comportamiento]);
    var resultado = { idOperacion: datos.idOperacion, idTarea: 'DEMO-' + Utilities.getUuid(), estado: 'Completado', ciclo: datos.ciclo, titulo: datos.titulo, simulacion: true };
    registro[datos.idOperacion] = resultado;
    return resultado;
  });
}

function cancelarActividadDemo(idOperacion, sesion) {
  validarOperacionDemo_(idOperacion);
  return conRegistroDemo_(sesion, function(registro) {
    // Se registra incluso si la cancelación llegó antes que publicarActividadDemo.
    // Si llegó después, revierte el registro simulado. Nunca modifica Classroom.
    registro[idOperacion] = { idOperacion: idOperacion, estado: 'Cancelado', simulacion: true };
    return registro[idOperacion];
  });
}
