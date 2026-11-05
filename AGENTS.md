# Repository Guidelines

## Project Structure & Module Organization

This repository contains the Spanish-language SGIU research and task management demo, implemented as a Google Apps Script web app. Files are organized by responsibility:

- `src/servidor/`: `Código.gs` (server entry point and HTML inclusion helper) and `BaseDatos.gs` (demonstration data).
- `src/vistas/`: `Index.html` and the HTML views and components included through Apps Script template expressions.
- `src/scripts/Scripts.html`: browser JavaScript for demo sessions, cycles, tasks, templates, and reports.
- `src/estilos/Estilos.html`: shared CSS and external Tailwind, Font Awesome, and Google Fonts dependencies.
- `docs/`: instructions and visual audit.
- `recursos/imagenes/` and `recursos/diseno/`: image references, design guide, and Excalidraw diagram.
- `datos/`: reference spreadsheet.
- `archivos/`: existing ZIP archive.

There are no separate test or build directories.

## Build, Test, and Development Commands

No package manager, build command, test runner, or deployment CLI is configured. Use the Google Apps Script editor to create matching script and HTML files from `src/`, preserving base names and accents without the local directory prefixes. The Apps Script project uses a flat file namespace, so template references such as `include('Estilos')` remain unchanged. Preview the app through **Deploy → Test deployments** with a web app deployment.

Opening `Index.html` directly does not evaluate its server template includes. Validate integrated behavior in Apps Script, especially the `google.script.run` report request.

## Coding Style & Naming Conventions

Follow the existing two-space indentation, semicolon-terminated JavaScript, and `var` declarations. Use descriptive Spanish camelCase names such as `crearTarea` and `cicloEstadoActual`; use uppercase snake case for configuration flags such as `SIMULAR_SIN_INVESTIGADORES`.

Keep DOM IDs consistent between markup and JavaScript. Put shared styles in `Estilos.html`, client behavior in `Scripts.html`, and server functions in `Código.gs`. Preserve Spanish interface text. No formatter or linter is configured.

## Testing Guidelines

Verification is currently manual; no automated framework or coverage threshold exists. Exercise login/logout, tab navigation, active and closed cycles, task validation, template creation/filtering, and report rendering. Check browser console errors and layout after UI changes.

Test reports with `SIMULAR_SIN_INVESTIGADORES` set to both `false` and `true` to cover populated data and the FA-005 empty state. Restore the default `false` before submitting.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout, so no existing commit convention can be confirmed. Use short, imperative subjects describing one focused change. In pull requests, explain the behavior changed, link relevant issues, list manual checks performed, and attach screenshots for visible changes.

## Security & Configuration

Login and report records are demonstration data. Do not treat the simulated login as authentication or commit credentials or real researcher records. Keep sample spreadsheet links clearly identifiable as placeholders.
