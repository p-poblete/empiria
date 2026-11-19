// INICIO: Entrada de la aplicación web
function doGet() {
  var plantilla = HtmlService.createTemplateFromFile("Index");
  // Invocación REST 1: parámetros del sistema desde Spring Boot al ingresar.
  plantilla.configuracionInicial = jsonParaHtml_(cargarConfiguracionInicial_());
  return plantilla
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
