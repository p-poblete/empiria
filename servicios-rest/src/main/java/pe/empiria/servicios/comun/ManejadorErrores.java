package pe.empiria.servicios.comun;

import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ManejadorErrores {

  @ExceptionHandler(RecursoNoEncontradoException.class)
  ResponseEntity<ErrorApi> noEncontrado(RecursoNoEncontradoException e) {
    return respuesta(HttpStatus.NOT_FOUND, e.getMessage());
  }

  @ExceptionHandler(SolicitudInvalidaException.class)
  ResponseEntity<ErrorApi> invalida(SolicitudInvalidaException e) {
    return respuesta(HttpStatus.BAD_REQUEST, e.getMessage());
  }

  @ExceptionHandler(NoAutorizadoException.class)
  ResponseEntity<ErrorApi> noAutorizado(NoAutorizadoException e) {
    return respuesta(HttpStatus.UNAUTHORIZED, e.getMessage());
  }

  @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
  ResponseEntity<ErrorApi> cuerpoInvalido(Exception e) {
    return respuesta(HttpStatus.BAD_REQUEST, "El cuerpo debe ser JSON con el campo 'valor'.");
  }

  private ResponseEntity<ErrorApi> respuesta(HttpStatus estado, String mensaje) {
    return ResponseEntity.status(estado)
        .body(new ErrorApi(estado.value(), estado.getReasonPhrase(), mensaje, OffsetDateTime.now()));
  }
}
