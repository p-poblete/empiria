package pe.empiria.servicios.catalogos;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalogos")
public class ControladorCatalogos {

  private final ServicioCatalogos servicio;

  public ControladorCatalogos(ServicioCatalogos servicio) {
    this.servicio = servicio;
  }

  /** Invocación 3: Apps Script la llama al abrir Reportes o Configuración. */
  @GetMapping
  public Catalogos todos() {
    return servicio.todos();
  }

  @GetMapping("/{nombre}")
  public List<?> uno(@PathVariable String nombre) {
    return servicio.uno(nombre);
  }
}
