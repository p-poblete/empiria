package pe.empiria.servicios.parametros;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import pe.empiria.servicios.comun.RecursoNoEncontradoException;
import pe.empiria.servicios.comun.SolicitudInvalidaException;

/**
 * Parámetros predeterminados en memoria. Aún no hay base de datos: los cambios
 * duran mientras el proceso esté en ejecución y se pierden al reiniciarlo.
 */
@Service
public class ServicioParametros {

  private static final Pattern ID_DRIVE = Pattern.compile("[A-Za-z0-9_-]{10,100}");
  private static final Pattern TEXTO = Pattern.compile("[\\p{L}\\p{N} ._/-]{1,100}");

  private final Map<String, Parametro> parametros = new LinkedHashMap<>();
  private long version = 1;
  private OffsetDateTime actualizado = OffsetDateTime.now();

  public ServicioParametros() {
    // Ciclo académico
    agregar("CICLO_VIGENTE", "2026-II", TipoParametro.TEXTO, "Ciclo académico",
        "Ciclo académico actual; la aplicación lo selecciona al iniciar.", null, null, null, false);
    agregar("FECHA_INICIO_CICLO", "2026-08-17", TipoParametro.FECHA, "Ciclo académico",
        "Inicio del ciclo vigente (AAAA-MM-DD).", null, null, null, true);
    agregar("FECHA_FIN_CICLO", "2026-12-31", TipoParametro.FECHA, "Ciclo académico",
        "Último día para registrar actividades del ciclo vigente (AAAA-MM-DD).", null, null, null, true);
    // Carga docente e investigación
    agregar("MIN_HORAS_DOCENTE", "8", TipoParametro.ENTERO, "Carga docente",
        "Mínima cantidad de horas semanales a dictar por un docente.", "horas/semana", 0, 60, true);
    agregar("MAX_HORAS_DOCENTE", "40", TipoParametro.ENTERO, "Carga docente",
        "Máxima cantidad de horas semanales a dictar por un docente.", "horas/semana", 1, 60, true);
    agregar("MIN_HORAS_INVESTIGACION", "4", TipoParametro.ENTERO, "Carga docente",
        "Horas semanales mínimas dedicadas a investigación por un investigador.", "horas/semana", 0, 40, true);
    // Tareas y plantillas (CU-002)
    agregar("ID_CARPETA_PLANTILLAS", "DEMO-CARPETA-PLANTILLAS-0001", TipoParametro.ID_DRIVE, "Tareas y plantillas",
        "ID de la carpeta de Google Drive con las plantillas de seguimiento del investigador (valor de ejemplo).",
        null, null, null, true);
    agregar("MAX_HOJAS_PLANTILLA", "20", TipoParametro.ENTERO, "Tareas y plantillas",
        "Cantidad máxima de hojas que puede tener una plantilla de seguimiento.", "hojas", 1, 200, true);
    agregar("DIAS_RECORDATORIO_ENTREGA", "3", TipoParametro.ENTERO, "Tareas y plantillas",
        "Días de anticipación para recordar la fecha de entrega de una tarea.", "días", 0, 30, true);
    // Reportes (CU-005)
    agregar("ID_HOJA_BASE_DATOS", "DEMO-HOJA-BASE-DATOS-0001", TipoParametro.ID_DRIVE, "Reportes",
        "ID del libro de Google Sheets con la base de datos de investigación (valor de ejemplo).",
        null, null, null, true);
    agregar("MONEDA_REPORTES", "PEN", TipoParametro.TEXTO, "Reportes",
        "Moneda en la que se expresan los montos de financiamiento.", null, null, null, false);
    agregar("ZONA_HORARIA", "America/Lima", TipoParametro.TEXTO, "Reportes",
        "Zona horaria para fechas límite y reportes.", null, null, null, false);
  }

  private void agregar(String codigo, String valor, TipoParametro tipo, String grupo, String descripcion,
      String unidad, Integer minimo, Integer maximo, boolean editable) {
    parametros.put(codigo, new Parametro(codigo, valor, tipo, grupo, descripcion, unidad, minimo, maximo, editable));
  }

  public synchronized RespuestaParametros listar() {
    return new RespuestaParametros(version, actualizado, new ArrayList<>(parametros.values()));
  }

  public synchronized Parametro obtener(String codigo) {
    Parametro parametro = parametros.get(codigo);
    if (parametro == null) throw new RecursoNoEncontradoException("No existe el parámetro " + codigo + ".");
    return parametro;
  }

  public synchronized Parametro actualizar(String codigo, String valor) {
    Parametro actual = obtener(codigo);
    if (!actual.editable()) throw new SolicitudInvalidaException("El parámetro " + codigo + " es de solo lectura.");
    String limpio = valor == null ? "" : valor.trim();
    validar(actual, limpio);
    Parametro nuevo = actual.conValor(limpio);
    parametros.put(codigo, nuevo);
    validarCoherencia(codigo, actual);
    version++;
    actualizado = OffsetDateTime.now();
    return nuevo;
  }

  private void validar(Parametro p, String valor) {
    switch (p.tipo()) {
      case ENTERO -> {
        int numero;
        try {
          numero = Integer.parseInt(valor);
        } catch (NumberFormatException e) {
          throw new SolicitudInvalidaException(p.codigo() + " debe ser un número entero.");
        }
        if (numero < p.minimo() || numero > p.maximo())
          throw new SolicitudInvalidaException(p.codigo() + " debe estar entre " + p.minimo() + " y " + p.maximo() + ".");
      }
      case FECHA -> {
        try {
          LocalDate.parse(valor);
        } catch (DateTimeParseException e) {
          throw new SolicitudInvalidaException(p.codigo() + " debe tener formato AAAA-MM-DD.");
        }
      }
      case ID_DRIVE -> {
        if (!ID_DRIVE.matcher(valor).matches())
          throw new SolicitudInvalidaException(p.codigo() + " debe ser un ID de Drive (10 a 100 letras, números, - o _).");
      }
      case TEXTO -> {
        if (!TEXTO.matcher(valor).matches())
          throw new SolicitudInvalidaException(p.codigo() + " contiene caracteres no permitidos.");
      }
    }
  }

  /** Revierte el cambio si rompe una relación entre parámetros. */
  private void validarCoherencia(String codigo, Parametro anterior) {
    String error = null;
    if (entero("MIN_HORAS_DOCENTE") > entero("MAX_HORAS_DOCENTE"))
      error = "MIN_HORAS_DOCENTE no puede superar a MAX_HORAS_DOCENTE.";
    else if (entero("MIN_HORAS_INVESTIGACION") > entero("MAX_HORAS_DOCENTE"))
      error = "MIN_HORAS_INVESTIGACION no puede superar a MAX_HORAS_DOCENTE.";
    else if (!LocalDate.parse(valor("FECHA_INICIO_CICLO")).isBefore(LocalDate.parse(valor("FECHA_FIN_CICLO"))))
      error = "FECHA_INICIO_CICLO debe ser anterior a FECHA_FIN_CICLO.";
    if (error != null) {
      parametros.put(codigo, anterior);
      throw new SolicitudInvalidaException(error);
    }
  }

  private String valor(String codigo) {
    return parametros.get(codigo).valor();
  }

  private int entero(String codigo) {
    return Integer.parseInt(valor(codigo));
  }
}
