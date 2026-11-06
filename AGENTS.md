# Repository Guidelines

## Project Structure & Module Organization

This repository contains the Spanish-language SGIU research and task management demo, implemented as a Google Apps Script web app. Files are organized by responsibility:

- `src/servidor/`: `Código.gs` (web entry point and HTML inclusion), `TareasServidor.gs` (CU-002), `ReportesServidor.gs` (CU-005 queries), `Consolidados.gs` (Sheets exports), and `BaseDatos.gs` (demonstration data). Registro*.gs contains the separate real registration backend.
- `src/vistas/`: `Index.html` and the HTML views and components included through Apps Script template expressions.
- `src/scripts/Scripts.html`: browser JavaScript for demo sessions, cycles, tasks, templates, and reports.
- `src/estilos/Estilos.html`: shared CSS and external Tailwind, Font Awesome, and Google Fonts dependencies.
- `docs/`: instructions and visual audit.
- `recursos/imagenes/` and `recursos/diseno/`: image references, design guide, and Excalidraw diagram.
- `datos/`: reference spreadsheet.
- `archivos/`: existing ZIP archive.

Local verification lives in `tests/`. There is no application build step.

## Build, Test, and Development Commands

Use Node.js 22+ with `npm ci`, `npm test` (server and syntax), and `npm run test:browser` (Playwright). Install Chromium first with `npx playwright install chromium`, or set `EMPIRIA_CHROMIUM_PATH` to an existing compatible executable. There is no application build step or deployment CLI configured. Use the Google Apps Script editor to create matching script and HTML files from `src/`, preserving base names and accents without the local directory prefixes. The Apps Script project uses a flat file namespace, so template references such as `include('Estilos')` remain unchanged. Preview the app through **Deploy → Test deployments** with a web app deployment.

Opening `Index.html` directly does not evaluate its server template includes. Validate integrated behavior in Apps Script, especially the `google.script.run` report request.

## Coding Style & Naming Conventions

Follow the existing two-space indentation, semicolon-terminated JavaScript, and `var` declarations. Use descriptive Spanish camelCase names such as `crearTarea` and `cicloEstadoActual`; use uppercase snake case for configuration flags such as `SIMULAR_SIN_INVESTIGADORES`.

Keep DOM IDs consistent between markup and JavaScript. Put shared styles in `Estilos.html`, client behavior in `Scripts.html`, and server functions in the corresponding responsibility module (`Código.gs`, `TareasServidor.gs`, `ReportesServidor.gs`, or `Consolidados.gs`). Preserve Spanish interface text. No formatter or linter is configured.

## Testing Guidelines

Automated local checks use Node's test runner and Playwright; GitHub Actions runs both. Browser tests execute real endpoint code with Google services doubled and do not replace verification in Apps Script. There is no coverage threshold. Exercise login/logout, tab navigation, active and closed cycles, task validation, template creation/filtering, and report rendering. Check browser console errors and layout after UI changes.

Test report data, empty and error responses using the in-memory fixtures in `tests/`; do not modify demonstration records just to run tests. The old `SIMULAR_SIN_INVESTIGADORES` flag is no longer used. Preserve server-side validation and the explicit simulated nature of Classroom publishing.

## Commit & Pull Request Guidelines

Work on a feature branch and submit changes through a pull request against `main`. Use short, imperative subjects describing one focused change. In pull requests, explain the behavior changed, link relevant issues, list manual checks performed, and attach screenshots for visible changes.

## Security & Configuration

Login and report records are demonstration data. Do not treat the simulated login as authentication or commit credentials or real researcher records. Keep sample spreadsheet links clearly identifiable as placeholders.

## Alpine migration

Read `docs/PLAN_MIGRACION_ALPINE.md` and `docs/GUIA_ALPINE.md` for the current state. Keep Alpine as the only owner of migrated selects, form fields and publication tables; update stores rather than assigning `innerHTML`, `value`, or `disabled` on those nodes. `AlpineTareas.html` and `AlpineReportes.html` own their respective reactive stores; `Reactivos.html` contains the shared Apps Script promise adapter, and `Navegacion.html` contains shared navigation. Preserve their includes and registration before Alpine starts. The user postponed deployment to Apps Script; do not deploy unless explicitly requested.
