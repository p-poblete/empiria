package pe.empiria.servicios.parametros;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SolicitudActualizacion(@NotNull @Size(max = 200) String valor) {
}
