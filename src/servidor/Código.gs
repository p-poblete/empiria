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
