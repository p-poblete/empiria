# Colaborar en Empiria

1. Clona el repositorio y crea una rama desde `main` para cada cambio.
2. Lee `AGENTS.md` y el contexto actual en `docs/session-context.md`.
3. Mantén los textos en español y los nombres de archivo que usa Apps Script.
4. Ejecuta `npm ci` y `npm test`. Para interfaz: instala Chromium con `npx playwright install chromium` y ejecuta `npm run test:browser`.
5. Abre un pull request hacia `main` con el problema, la solución y las pruebas realizadas. Añade capturas si cambia la interfaz.
6. Espera la revisión de un compañero antes de fusionar. Esta es la práctica del equipo; la rama todavía no tiene protección obligatoria configurada.

Las pruebas son locales y usan datos de demostración. No subas credenciales, archivos `.clasprc.json`, datos reales de investigadores ni exportaciones de cuentas personales. El despliegue en Apps Script se hará cuando el equipo lo acuerde.

Para explicar la actualización tecnológica, consulta [la guía de Alpine](docs/GUIA_ALPINE.md).
