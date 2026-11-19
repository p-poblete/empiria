package pe.empiria.servicios.parametros;

import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.empiria.servicios.comun.NoAutorizadoException;

@RestController
@RequestMapping("/api/parametros")
public class ControladorParametros {

  private final ServicioParametros servicio;
  private final String token;

  public ControladorParametros(ServicioParametros servicio, @Value("${empiria.token:}") String token) {
    this.servicio = servicio;
    this.token = token;
  }

  /** Invocación 1: Apps Script la llama desde doGet al ingresar a la aplicación. */
  @GetMapping
  public RespuestaParametros listar() {
    return servicio.listar();
  }

  @GetMapping("/{codigo}")
  public Parametro obtener(@PathVariable String codigo) {
    return servicio.obtener(codigo);
  }

  /** Invocación 2: guardado desde la vista Configuración. */
  @PutMapping("/{codigo}")
  public Parametro actualizar(@PathVariable String codigo,
      @RequestHeader(value = "X-Empiria-Token", required = false) String tokenRecibido,
      @Valid @RequestBody SolicitudActualizacion solicitud) {
    // Sin EMPIRIA_TOKEN configurado la escritura queda abierta (modo práctica).
    if (!token.isEmpty() && (tokenRecibido == null || !MessageDigest.isEqual(
        token.getBytes(StandardCharsets.UTF_8), tokenRecibido.getBytes(StandardCharsets.UTF_8))))
      throw new NoAutorizadoException("Token de integración ausente o inválido.");
    return servicio.actualizar(codigo, solicitud.valor());
  }
}
