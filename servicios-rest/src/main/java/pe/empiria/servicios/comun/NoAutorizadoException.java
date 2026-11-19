package pe.empiria.servicios.comun;

public class NoAutorizadoException extends RuntimeException {
  public NoAutorizadoException(String mensaje) {
    super(mensaje);
  }
}
