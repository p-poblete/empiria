package pe.empiria.servicios.parametros;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Parámetro del sistema. El valor viaja como texto; {@code tipo} indica cómo se
 * valida y {@code casoUso} qué parte de Empiria lo utiliza.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Parametro(
    String codigo,
    String valor,
    TipoParametro tipo,
    String grupo,
    String casoUso,
    String descripcion,
    boolean editable) {

  Parametro conValor(String nuevoValor) {
    return new Parametro(codigo, nuevoValor, tipo, grupo, casoUso, descripcion, editable);
  }
}
