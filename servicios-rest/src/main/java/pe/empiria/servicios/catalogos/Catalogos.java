package pe.empiria.servicios.catalogos;

import java.util.List;
import pe.empiria.servicios.catalogos.Modelos.CicloAcademico;
import pe.empiria.servicios.catalogos.Modelos.Carrera;
import pe.empiria.servicios.catalogos.Modelos.Elemento;
import pe.empiria.servicios.catalogos.Modelos.Facultad;
import pe.empiria.servicios.catalogos.Modelos.LineaInvestigacion;
import pe.empiria.servicios.catalogos.Modelos.PlanEstudio;

/** Respuesta de GET /api/catalogos: todos los catálogos en una sola invocación. */
public record Catalogos(
    String version,
    List<Facultad> facultades,
    List<Carrera> carreras,
    List<PlanEstudio> planesEstudio,
    List<LineaInvestigacion> lineasInvestigacion,
    List<CicloAcademico> ciclosAcademicos,
    List<Elemento> categoriasDocente,
    List<Elemento> dedicaciones,
    List<Elemento> nivelesRenacyt,
    List<Elemento> tiposActividad) {
}
