// Prueba el cliente real con Alpine y ejecuta los endpoints reales en un VM con
// dobles de CacheService/LockService. No accede a cuentas ni archivos de Google.
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { servidorDemo, paginaCompuesta, AHORA } = require('./soporte.cjs');

(async function() {
  const html = paginaCompuesta();
  const servidor = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
    res.end(html);
  });
  await new Promise(resolve => servidor.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.EMPIRIA_CHROMIUM_PATH ? { executablePath: process.env.EMPIRIA_CHROMIUM_PATH } : {}) });
  const origen = 'http://127.0.0.1:' + servidor.address().port;
  const capturas = process.env.EMPIRIA_CAPTURAS || path.join(os.tmpdir(), 'empiria-capturas');
  fs.mkdirSync(capturas, { recursive: true });
  let cuenta = 0;
  try {
    async function escenario(nombre, comprobar) {
      if (process.env.EMPIRIA_ESCENARIO && !nombre.includes(process.env.EMPIRIA_ESCENARIO)) return;
      const backend = servidorDemo();
      const control = {};
      const llamadas = [];
      const errores = [];
      const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 1000 } });
      page.setDefaultTimeout(15000);
      page.on('pageerror', e => errores.push(e.message));
      page.on('console', m => { if (/Alpine Expression Error/.test(m.text())) errores.push(m.text()); });
      page.on('dialog', d => d.dismiss());
      await page.route('**/alpinejs@3.17.5/dist/cdn.min.js', route => route.fulfill({ path: require.resolve('alpinejs/dist/cdn.min.js'), contentType: 'application/javascript' }));
      await page.exposeFunction('__rpc', async (nombre, args) => {
        llamadas.push(nombre);
        const config = { ...control[nombre] };
        if (config.antes) await config.antes();
        if (config.error) throw new Error(config.error);
        const respuesta = config.respuesta || backend[nombre](...args);
        if (config.despues) await config.despues();
        return JSON.parse(JSON.stringify(respuesta));
      });
      await page.addInitScript(ahora => {
        const Fecha = Date;
        window.Date = class extends Fecha {
          constructor(...args) { super(...(args.length ? args : [ahora])); }
          static now() { return new Fecha(ahora).getTime(); }
        };
        function runner(exito, fallo) {
          return new Proxy({ withSuccessHandler: fn => runner(fn, fallo), withFailureHandler: fn => runner(exito, fn) }, {
            get: (obj, clave) => obj[clave] || ((...args) => window.__rpc(clave, args).then(exito).catch(fallo))
          });
        }
        window.google = { script: { run: runner() } };
      }, AHORA);
      try {
        await page.goto(origen, { waitUntil: 'load' });
        await page.waitForFunction(() => window.Alpine && Alpine.store('reportes') && Alpine.store('tareas'));
        await comprobar({ page, backend, control, llamadas });
        assert.deepEqual(errores, [], 'Errores JS/Alpine');
        const duplicados = await page.locator('[id]').evaluateAll(els => { const ids = els.map(el => el.id); return ids.filter((id, i) => ids.indexOf(id) !== i); });
        assert.deepEqual(duplicados, [], 'IDs duplicados tras actualizar la vista');
        console.log('OK ' + (++cuenta) + ': ' + nombre);
      } finally { await page.close(); }
    }
    async function entrar(page, modulo) {
      await page.evaluate(() => iniciarSesion());
      await page.waitForFunction(() => !Alpine.store('tareas').cargandoPlantillas);
      await page.locator('#btn-' + modulo).click();
      await page.waitForFunction(modulo => Alpine.store('navegacion').vistaActual === modulo, modulo);
      await page.evaluate(() => Alpine.nextTick());
      await page.waitForFunction(() => !Alpine.store('tareas').cargandoPlantillas);
    }
    async function prepararTarea(page, titulo = 'Actividad de prueba') {
      await entrar(page, 'tareas');
      await page.locator('#btn-asignar-tarea').click();
      for (const [id, valor] of [['input-titulo', titulo], ['input-descripcion', 'Descripción de seguimiento'], ['input-fecha', '2026-12-15'], ['input-hoja-inicial', 'Hoja1'], ['input-hoja-final', 'Hoja3']]) await page.locator('#' + id).fill(valor);
      await page.locator('#input-plantilla').selectOption('P1');
    }
    async function cargarReportes(page) {
      await entrar(page, 'reportes');
      await page.waitForFunction(() => !Alpine.store('reportes').cargando);
      assert.equal(await page.evaluate(() => Alpine.store('reportes').error), '');
    }
    function pendiente() {
      let liberar;
      const promesa = new Promise(resolve => { liberar = resolve; });
      return { esperar: () => promesa, liberar: () => liberar() };
    }

    await escenario('Tareas: catálogo del servidor, carga, doble envío y éxito', async ({ page, control, llamadas }) => {
      await prepararTarea(page);
      assert.equal(await page.locator('#input-plantilla option').count(), 2);
      assert.match(await page.locator('#ayuda-rango-hojas').innerText(), /Hoja5/);
      const pausa = pendiente();
      control.publicarActividadDemo = { despues: pausa.esperar };
      await page.locator('#btn-crear-tarea').click();
      await page.waitForFunction(() => Alpine.store('tareas').publicando);
      assert.equal(await page.locator('#texto-crear-tarea').innerText(), 'Creando tarea…');
      for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({ path: path.join(capturas, 'tareas-carga-' + width + '.png') });
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      assert(await page.locator('#btn-crear-tarea').isDisabled());
      await page.evaluate(() => crearTarea({ preventDefault() {} }));
      assert.equal(llamadas.filter(n => n === 'publicarActividadDemo').length, 1);
      pausa.liberar();
      await page.locator('#modal-exito').waitFor({ state: 'visible' });
      assert.match(await page.locator('#mensaje-exito-detalle').innerText(), /DEMO-/);
      assert.equal(await page.evaluate(() => Alpine.store('tareas').publicando), false);
      await page.locator('#modal-exito button').click();
      assert.equal(await page.locator('#input-titulo').inputValue(), '');
      assert(!await page.locator('#form-asignar-tarea').isVisible());
    });
    await escenario('Tareas: fallo y reintento del catálogo; respuesta vacía', async ({ page, control }) => {
      control.obtenerPlantillasTarea = { error: 'Sin conexión de prueba' };
      await entrar(page, 'tareas');
      assert.match(await page.evaluate(() => Alpine.store('tareas').errorPlantillas), /Sin conexión/);
      control.obtenerPlantillasTarea = {};
      await page.getByRole('button', { name: 'Reintentar plantillas' }).click();
      await page.waitForFunction(() => !Alpine.store('tareas').cargandoPlantillas && !Alpine.store('tareas').errorPlantillas);
      assert.equal(await page.evaluate(() => Alpine.store('tareas').disponibles.length), 1);
      control.obtenerPlantillasTarea = { respuesta: { ciclo: 'Ciclo 2026-II', plantillas: [] } };
      // No hay datos locales nuevos en esta sesión: el vacío del servidor debe verse.
      await page.evaluate(() => { return Alpine.store('tareas').cargarPlantillas(true); });
      assert.equal(await page.evaluate(() => Alpine.store('tareas').disponibles.length), 0);
    });
    await escenario('Tareas: cuota con tres reintentos, restauración y recuperación', async ({ page, llamadas }) => {
      await prepararTarea(page);
      await page.evaluate(() => { CONDICIONES_PRUEBA.comportamiento = 'cuota'; ESPERAS_REINTENTO_CLASSROOM = [10, 10, 10]; });
      await page.locator('#btn-crear-tarea').click();
      await page.waitForFunction(() => !Alpine.store('tareas').publicando);
      assert.equal(llamadas.filter(n => n === 'publicarActividadDemo').length, 4);
      assert.match(await page.evaluate(() => Alpine.store('tareas').errorPublicacion), /no está disponible/);
      assert(!await page.locator('#btn-crear-tarea').isDisabled());
      await page.evaluate(() => { CONDICIONES_PRUEBA.comportamiento = 'correcto'; });
      await page.locator('#btn-crear-tarea').click();
      await page.locator('#modal-exito').waitFor({ state: 'visible' });
    });
    for (const comportamiento of ['sinPermisos', 'adjunto', 'sinConexion']) {
      await escenario('Tareas: error ' + comportamiento + ' conserva formulario y permite recuperar', async ({ page }) => {
        await prepararTarea(page);
        await page.evaluate(c => { CONDICIONES_PRUEBA.comportamiento = c; }, comportamiento);
        await page.locator('#btn-crear-tarea').click();
        await page.waitForFunction(() => !Alpine.store('tareas').publicando);
        assert(await page.locator('#form-asignar-tarea').isVisible());
        assert.equal(await page.locator('#input-titulo').inputValue(), 'Actividad de prueba');
        await page.evaluate(() => { CONDICIONES_PRUEBA.comportamiento = 'correcto'; });
        if (comportamiento === 'sinConexion') await page.locator('#aviso-sistema-continuar').click();
        else await page.locator('#btn-crear-tarea').click();
        await page.locator('#modal-exito').waitFor({ state: 'visible' });
      });
    }
    for (const antes of [true, false]) {
      await escenario('Tareas: cancelación ' + (antes ? 'antes de ejecutar' : 'tras ejecutar, antes de responder'), async ({ page, control }) => {
        await prepararTarea(page);
        const pausa = pendiente();
        control.publicarActividadDemo = { [antes ? 'antes' : 'despues']: pausa.esperar };
        await page.locator('#btn-crear-tarea').click();
        await page.waitForFunction(() => Alpine.store('tareas').publicando);
        await page.locator('#btn-cancelar-publicacion').click();
        await page.waitForFunction(() => !Alpine.store('tareas').publicando && !Alpine.store('tareas').cancelando);
        pausa.liberar();
        await page.waitForFunction(() => transaccionesEmpiria[0].enVuelo === false);
        assert(!await page.locator('#modal-exito').isVisible());
        assert.equal(await page.evaluate(() => transaccionesEmpiria[0].estado), 'Cancelado');
      });
    }
    await escenario('Tareas: fallo de cancelación no oculta un éxito pendiente', async ({ page, control }) => {
      await prepararTarea(page);
      const pausa = pendiente();
      control.publicarActividadDemo = { despues: pausa.esperar };
      control.cancelarActividadDemo = { error: 'Fallo al cancelar' };
      await page.locator('#btn-crear-tarea').click();
      await page.waitForFunction(() => Alpine.store('tareas').publicando);
      await page.locator('#btn-cancelar-publicacion').click();
      await page.waitForFunction(() => !Alpine.store('tareas').cancelando);
      pausa.liberar();
      await page.locator('#modal-exito').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => transaccionesEmpiria[0].estado), 'Completado');
    });
    await escenario('Tareas: fallo de cancelación durante espera por cuota no duplica reintentos', async ({ page, control, llamadas }) => {
      await prepararTarea(page);
      control.cancelarActividadDemo = { error: 'Cancelación no disponible' };
      await page.evaluate(() => { CONDICIONES_PRUEBA.comportamiento = 'cuota'; ESPERAS_REINTENTO_CLASSROOM = [60000, 60000, 60000]; });
      await page.locator('#btn-crear-tarea').click();
      await page.waitForFunction(() => transaccionesEmpiria[0].esperandoReintento);
      await page.evaluate(() => { CONDICIONES_PRUEBA.comportamiento = 'correcto'; });
      await page.locator('#btn-cancelar-publicacion').click();
      await page.locator('#modal-exito').waitFor({ state: 'visible' });
      assert.equal(llamadas.filter(n => n === 'publicarActividadDemo').length, 2);
    });
    await escenario('Reportes: carga, x-for, búsqueda, filtros, orden, detalle y exportación', async ({ page, control }) => {
      const pausa = pendiente();
      control.obtenerDatosReportes = { antes: pausa.esperar };
      await entrar(page, 'reportes');
      await page.waitForFunction(() => Alpine.store('reportes').cargando);
      assert.match(await page.locator('#estado-reportes').innerText(), /Cargando/);
      assert(!await page.locator('.reporte-tabs').isVisible());
      pausa.liberar();
      await page.locator('#reporte-investigador').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#select-investigador option').count(), 11);
      assert(await page.locator('#tabla-publicaciones-body tr:visible').count() > 0);
      await page.locator('#inv-buscar-publicaciones').fill('sin coincidencias 123');
      await page.waitForFunction(() => Alpine.store('reportes').tablas.publicaciones.total === 0);
      await page.locator('#tabla-publicaciones-body .reporte-vacio').waitFor({ state: 'visible' });
      assert.match(await page.locator('#tabla-publicaciones-body').innerText(), /No hay publicaciones/);
      await page.locator('#inv-buscar-publicaciones').fill('');
      await page.locator('#tab-reporte-carrera').click();
      await page.locator('#reporte-carrera').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#carrera-publicaciones tbody tr:visible').count(), 10);
      await page.locator('#carrera-pie-publicaciones button').last().click();
      await page.waitForFunction(() => Alpine.store('reportes').tablas['carrera-publicaciones'].pagina === 2);
      await page.evaluate(() => Alpine.nextTick());
      assert.equal(await page.locator('#carrera-publicaciones tbody tr:visible').count(), 2);
      await page.locator('#carrera-publicaciones [data-columna="titulo"]').click();
      assert.equal(await page.locator('#carrera-publicaciones th[aria-sort="ascending"]').count(), 1);
      await page.locator('#carrera-publicaciones [data-columna="tipo"]').click();
      const opcionTipo = page.locator('#inv-columna-opciones input').first();
      const tipoElegido = await opcionTipo.getAttribute('value');
      await opcionTipo.check();
      await page.waitForFunction(tipo => Alpine.store('reportes').tablas['carrera-publicaciones'].filas.every(f => f.item.tipo === tipo), tipoElegido);
      await page.evaluate(() => { limpiarFiltroCabeceraInv(); document.getElementById('inv-dialogo-columna').close(); });
      const descarga = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Exportar publicaciones filtrados a CSV' }).last().click();
      assert.match((await descarga).suggestedFilename(), /publicaciones.*csv/);
      await page.evaluate(() => abrirFiltrosCarrera('generales'));
      await page.locator('#carrera-select').selectOption('Ingeniería de Sistemas');
      await page.waitForFunction(() => valorReporte('carrera-select') === 'Ingeniería de Sistemas');
      assert.equal(await page.evaluate(() => investigadoresCarreraReporte(true).length), 2);
      await page.evaluate(() => document.getElementById('carrera-dialogo-generales').close());
      await page.evaluate(() => abrirColeccionInv('carrera-publicaciones'));
      assert(await page.locator('#reporte-dialogo-detalle').isVisible());
      await page.evaluate(() => document.getElementById('reporte-dialogo-detalle').close());
      await page.locator('#tab-reporte-carrera').focus();
      await page.keyboard.press('Home');
      assert.equal(await page.locator('#tab-reporte-investigador').getAttribute('aria-selected'), 'true');
      // Los cuatro formatos se generan a partir de los mismos datos filtrados.
      const formatos = await page.evaluate(() => {
        const reporte = datosDescargaCarrera(['estadisticas', 'comparativas', 'graficos', 'publicaciones', 'proyectos', 'eventos', 'investigadores']);
        return { json: JSON.stringify(reporte), csv: csvDescargaInvestigador(reporte), html: htmlDescargaInvestigador(reporte, 'carrera') };
      });
      assert(formatoValido(formatos));
      const impresion = await browser.newPage();
      await impresion.setContent(formatos.html);
      const pdf = await impresion.pdf({ format: 'A4' });
      assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
      fs.writeFileSync(path.join(capturas, 'reporte-carrera.pdf'), pdf);
      await impresion.close();
      for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({ path: path.join(capturas, 'reportes-' + width + '.png') });
      }
    });
    function formatoValido(formatos) {
      return formatos.json.includes('secciones') && formatos.csv.length > 10 && formatos.html.includes('<html');
    }
    await escenario('Reportes: errores reales del endpoint, reintento y respuesta vacía', async ({ page, control }) => {
      await cargarReportes(page);
      for (const condicion of ['estructura', 'repositorio']) {
        await page.waitForFunction(() => !Alpine.store('reportes').cargando);
        await page.evaluate(c => { CONDICIONES_PRUEBA.repositorioReportes = c; return Alpine.store('reportes').cargar(true); }, condicion);
        await page.locator('.reporte-tabs').waitFor({ state: 'hidden' });
        assert(await page.locator('#reintentar-reportes').isVisible());
        await page.evaluate(() => { CONDICIONES_PRUEBA.repositorioReportes = 'disponible'; });
        await page.locator('#reintentar-reportes').click();
        await page.locator('.reporte-tabs').waitFor({ state: 'visible' });
      }
      await page.waitForFunction(() => !Alpine.store('reportes').cargando);
      control.obtenerDatosReportes = { respuesta: { investigadores: [] } };
      await page.evaluate(() => Alpine.store('reportes').cargar(true));
      assert.match(await page.locator('#estado-reportes').innerText(), /No hay investigadores/);
      assert(await page.locator('#select-investigador').isDisabled());
      assert.equal(await page.evaluate(() => Alpine.store('reportes').tablas.publicaciones.total), 0);
    });
    await escenario('Tareas: precondiciones bloquean el envío y conservan el acceso al formulario', async ({ page, llamadas }) => {
      await entrar(page, 'tareas');
      for (const condicion of ['sinCicloActivo', 'sinClase', 'sinPlantilla', 'archivoDrive', 'restringida', 'sinEstudiantes']) {
        await page.evaluate(async c => {
          CONDICIONES_PRUEBA[c] = true;
          await toggleFormTarea(true);
          CONDICIONES_PRUEBA[c] = false;
          document.getElementById('aviso-sistema').close();
        }, condicion);
        assert(!await page.locator('#form-asignar-tarea').isVisible());
      }
      assert.equal(llamadas.filter(n => n === 'publicarActividadDemo').length, 0);
      await page.locator('#btn-asignar-tarea').click();
      assert(await page.locator('#form-asignar-tarea').isVisible());
    });
    await escenario('Reportes: títulos del servidor se presentan como texto y enlaces inseguros se omiten', async ({ page, backend }) => {
      backend.BASE_DATOS_EMPIRIA.investigadores[0].publicaciones[0].titulo = '<img src=x onerror="window.inyectado=true">';
      backend.BASE_DATOS_EMPIRIA.investigadores[0].publicaciones[0].urlEvidencia = 'javascript:alert(1)';
      await cargarReportes(page);
      assert.match(await page.locator('#tabla-publicaciones-body').innerText(), /<img/);
      assert.equal(await page.locator('#tabla-publicaciones-body img').count(), 0);
      assert.equal(await page.locator('#tabla-publicaciones-body a[href^="javascript:"]').count(), 0);
      assert.equal(await page.evaluate(() => window.inyectado), undefined);
    });
    await escenario('Reportes: abrir consolidado indica carga y restaura el botón ante error', async ({ page, control }) => {
      await cargarReportes(page);
      const pausa = pendiente();
      control.obtenerConsolidadoCiclo = { antes: pausa.esperar, error: 'Sin permisos de prueba' };
      const boton = page.locator('#btn-abrir-consolidado');
      await boton.click();
      await page.waitForFunction(() => Alpine.store('reportes').abriendoConsolidado);
      assert(await boton.isDisabled());
      assert.match(await boton.innerText(), /Abriendo/);
      pausa.liberar();
      await page.waitForFunction(() => !Alpine.store('reportes').abriendoConsolidado);
      assert(await page.locator('#aviso-sistema').isVisible());
      assert(!await boton.isDisabled());
    });
    await escenario('Navegación, ciclo cerrado, sesión expirada y recuperación de colgadas', async ({ page }) => {
      await entrar(page, 'tareas');
      for (const nombre of ['inicio', 'ciclo', 'clases', 'plantillas', 'tareas', 'reportes']) {
        await page.locator('#btn-' + nombre).click();
        await page.waitForFunction(n => document.getElementById('btn-' + n).getAttribute('aria-current') === 'page', nombre);
        assert.equal(await page.locator('.view-panel:visible').count(), 1);
      }
      await page.evaluate(() => selectCiclo('Ciclo 2026-I', 'CERRADO'));
      await page.locator('#btn-tareas').click();
      assert(await page.locator('#btn-asignar-tarea').isDisabled());
      await page.evaluate(() => { selectCiclo('Ciclo 2026-II', 'ACTIVO'); CONDICIONES_PRUEBA.sesionProceso = true; });
      await prepararTarea(page);
      await page.locator('#btn-crear-tarea').click();
      await page.locator('#view-login').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => transaccionesEmpiria[0].estado), 'Fallido');
      await page.locator('#aviso-sistema-continuar').click();
      await page.locator('#view-tareas').waitFor({ state: 'visible' });
      await page.evaluate(() => { const tx = iniciarTransaccion('Ciclo 2026-II', 'Colgada', 'P1'); tx.fechaInicio = new Date(Date.now() - 35 * 60 * 1000).toISOString(); rescatarTransaccionesColgadas(); });
      assert.equal(await page.evaluate(() => transaccionesEmpiria.at(-1).estado), 'Fallido');
      await page.screenshot({ path: path.join(capturas, 'tareas-1440.png') });
    });
    console.log(cuenta + ' escenarios completados. Capturas: ' + capturas);
  } finally {
    await browser.close();
    await new Promise(resolve => servidor.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
