package pe.empiria.servicios.catalogos;

/** Contenedor de los tipos de elemento de cada catálogo (ID + descripción + relaciones). */
public final class Modelos {
  private Modelos() {
  }

  public record Elemento(String id, String descripcion) {
  }

  public record Facultad(String id, String descripcion, String siglas) {
  }

  public record Carrera(String id, String descripcion, String idFacultad) {
  }

  public record PlanEstudio(String id, String descripcion, String idCarrera, int anio, int creditos, boolean vigente) {
  }

  public record LineaInvestigacion(String id, String descripcion, String idCarrera) {
  }

  public record CicloAcademico(String id, String descripcion, String estado, String fechaInicio, String fechaFin) {
  }
}
