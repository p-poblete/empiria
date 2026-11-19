package pe.empiria.servicios.parametros;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Parámetro del sistema. El valor siempre viaja como texto para que Apps Script
 * lo trate de forma uniforme; {@code tipo}, {@code minimo} y {@code maximo}
 * indican cómo interpretarlo y validarlo.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Parametro(
    String codigo,
    String valor,
    TipoParametro tipo,
    String grupo,
    String descripcion,
    String unidad,
    Integer minimo,
    Integer maximo,
    boolean editable) {

  Parametro conValor(String nuevoValor) {
    return new Parametro(codigo, nuevoValor, tipo, grupo, descripcion, unidad, minimo, maximo, editable);
  }
}
