package pe.empiria.servicios.parametros;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import pe.empiria.servicios.comun.RecursoNoEncontradoException;
import pe.empiria.servicios.comun.SolicitudInvalidaException;

/**
 * Parámetros predeterminados de Empiria, en memoria. Aún no hay base de datos:
 * los cambios duran mientras el proceso esté en ejecución.
 */
@Service
public class ServicioParametros {

  private static final Pattern ID_DRIVE = Pattern.compile("[A-Za-z0-9_-]{10,100}");
  private static final Pattern CICLO = Pattern.compile("20\\d{2}-(I|II)");

  private final Map<String, Parametro> parametros = new LinkedHashMap<>();
  private long version = 1;
  private OffsetDateTime actualizado = OffsetDateTime.now();

  public ServicioParametros() {
    agregar("CICLO_VIGENTE", "2026-II", TipoParametro.CICLO, "Ciclo académico", "CU-002 y CU-005",
        "Ciclo académico actual. La aplicación lo selecciona al ingresar; se cambia desde la gestión de ciclos.", false);
    agregar("ID_CARPETA_PLANTILLAS", "DEMO-CARPETA-PLANTILLAS-0001", TipoParametro.ID_DRIVE, "Tareas y plantillas", "CU-002",
        "ID de la carpeta de Google Drive con las plantillas de seguimiento del investigador (valor de ejemplo).", true);
    agregar("ID_HOJA_BASE_DATOS", "DEMO-HOJA-BASE-DATOS-0001", TipoParametro.ID_DRIVE, "Reportes", "CU-005",
        "ID del libro de Google Sheets Empiria_Base_de_Datos del que se leen los reportes (valor de ejemplo).", true);
  }

  private void agregar(String codigo, String valor, TipoParametro tipo, String grupo, String casoUso,
      String descripcion, boolean editable) {
    parametros.put(codigo, new Parametro(codigo, valor, tipo, grupo, casoUso, descripcion, editable));
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
    // Una carpeta y un libro de Drive no pueden compartir ID.
    for (Parametro otro : parametros.values())
      if (otro.tipo() == TipoParametro.ID_DRIVE && !otro.codigo().equals(codigo) && otro.valor().equals(limpio))
        throw new SolicitudInvalidaException(codigo + " no puede tener el mismo ID que " + otro.codigo() + ".");
    Parametro nuevo = actual.conValor(limpio);
    parametros.put(codigo, nuevo);
    version++;
    actualizado = OffsetDateTime.now();
    return nuevo;
  }

  private void validar(Parametro p, String valor) {
    switch (p.tipo()) {
      case ID_DRIVE -> {
        if (!ID_DRIVE.matcher(valor).matches())
          throw new SolicitudInvalidaException(p.codigo() + " debe ser un ID de Drive (10 a 100 letras, números, - o _).");
      }
      case CICLO -> {
        if (!CICLO.matcher(valor).matches())
          throw new SolicitudInvalidaException(p.codigo() + " debe tener formato AAAA-I o AAAA-II.");
      }
    }
  }
}
