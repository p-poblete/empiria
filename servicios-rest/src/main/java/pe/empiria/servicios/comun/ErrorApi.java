package pe.empiria.servicios.comun;

import java.time.OffsetDateTime;

/** Cuerpo uniforme de error para que Apps Script muestre un mensaje legible. */
public record ErrorApi(int estado, String error, String mensaje, OffsetDateTime fecha) {
}
