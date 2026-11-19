package pe.empiria.servicios.parametros;

import java.time.OffsetDateTime;
import java.util.List;

/** Listado completo con versión para detectar cambios desde Apps Script. */
public record RespuestaParametros(long version, OffsetDateTime actualizado, List<Parametro> parametros) {
}
