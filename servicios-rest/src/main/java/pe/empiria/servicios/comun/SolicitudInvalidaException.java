package pe.empiria.servicios.comun;

public class SolicitudInvalidaException extends RuntimeException {
  public SolicitudInvalidaException(String mensaje) {
    super(mensaje);
  }
}
