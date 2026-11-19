package pe.empiria.servicios.catalogos;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import pe.empiria.servicios.catalogos.Modelos.CicloAcademico;
import pe.empiria.servicios.catalogos.Modelos.Carrera;
import pe.empiria.servicios.catalogos.Modelos.Elemento;
import pe.empiria.servicios.catalogos.Modelos.Facultad;
import pe.empiria.servicios.catalogos.Modelos.LineaInvestigacion;
import pe.empiria.servicios.catalogos.Modelos.PlanEstudio;
import pe.empiria.servicios.comun.RecursoNoEncontradoException;

/**
 * Catálogos predeterminados, sin base de datos. Las descripciones de carreras y
 * líneas coinciden con los registros de demostración para que los filtros de
 * CU-005 sigan encontrando resultados.
 */
@Service
public class ServicioCatalogos {

  private final Catalogos catalogos = new Catalogos(
      "2026-11-19",
      List.of(
          new Facultad("FAC-ING", "Facultad de Ingeniería", "FING"),
          new Facultad("FAC-CEM", "Facultad de Ciencias Empresariales", "FCEM"),
          new Facultad("FAC-ARQ", "Facultad de Arquitectura", "FARQ"),
          new Facultad("FAC-DER", "Facultad de Derecho", "FDER"),
          new Facultad("FAC-CSH", "Facultad de Ciencias Sociales y Humanidades", "FCSH")),
      List.of(
          new Carrera("CAR-SIS", "Ingeniería de Sistemas", "FAC-ING"),
          new Carrera("CAR-SOF", "Ingeniería de Software", "FAC-ING"),
          new Carrera("CAR-IND", "Ingeniería Industrial", "FAC-ING"),
          new Carrera("CAR-AMB", "Ingeniería Ambiental", "FAC-ING"),
          new Carrera("CAR-ICO", "Ingeniería Comercial", "FAC-CEM"),
          new Carrera("CAR-ANI", "Administración y Negocios Internacionales", "FAC-CEM"),
          new Carrera("CAR-ARQ", "Arquitectura y Urbanismo", "FAC-ARQ"),
          new Carrera("CAR-DER", "Derecho", "FAC-DER"),
          new Carrera("CAR-PSI", "Psicología", "FAC-CSH"),
          new Carrera("CAR-CCO", "Ciencias de la Comunicación", "FAC-CSH")),
      List.of(
          new PlanEstudio("PLA-SIS-2020", "Plan 2020 · Ingeniería de Sistemas", "CAR-SIS", 2020, 220, false),
          new PlanEstudio("PLA-SIS-2024", "Plan 2024 · Ingeniería de Sistemas", "CAR-SIS", 2024, 220, true),
          new PlanEstudio("PLA-SOF-2024", "Plan 2024 · Ingeniería de Software", "CAR-SOF", 2024, 220, true),
          new PlanEstudio("PLA-IND-2024", "Plan 2024 · Ingeniería Industrial", "CAR-IND", 2024, 220, true),
          new PlanEstudio("PLA-AMB-2024", "Plan 2024 · Ingeniería Ambiental", "CAR-AMB", 2024, 220, true),
          new PlanEstudio("PLA-ICO-2024", "Plan 2024 · Ingeniería Comercial", "CAR-ICO", 2024, 210, true),
          new PlanEstudio("PLA-ANI-2024", "Plan 2024 · Administración y Negocios Internacionales", "CAR-ANI", 2024, 210, true),
          new PlanEstudio("PLA-ARQ-2022", "Plan 2022 · Arquitectura y Urbanismo", "CAR-ARQ", 2022, 240, true),
          new PlanEstudio("PLA-DER-2022", "Plan 2022 · Derecho", "CAR-DER", 2022, 240, true),
          new PlanEstudio("PLA-PSI-2024", "Plan 2024 · Psicología", "CAR-PSI", 2024, 220, true),
          new PlanEstudio("PLA-CCO-2024", "Plan 2024 · Ciencias de la Comunicación", "CAR-CCO", 2024, 210, true)),
      List.of(
          new LineaInvestigacion("LIN-01", "Inteligencia Artificial y Ciencia de Datos", "CAR-SIS"),
          new LineaInvestigacion("LIN-02", "Sistemas Distribuidos", "CAR-SIS"),
          new LineaInvestigacion("LIN-03", "Ingeniería de Software", "CAR-SIS"),
          new LineaInvestigacion("LIN-04", "Calidad y arquitectura de software", "CAR-SOF"),
          new LineaInvestigacion("LIN-05", "Ingeniería de requisitos", "CAR-SOF"),
          new LineaInvestigacion("LIN-06", "Optimización de procesos", "CAR-IND"),
          new LineaInvestigacion("LIN-07", "Logística sostenible", "CAR-IND"),
          new LineaInvestigacion("LIN-08", "Gestión Ambiental", "CAR-AMB"),
          new LineaInvestigacion("LIN-09", "Recursos Hídricos", "CAR-AMB"),
          new LineaInvestigacion("LIN-10", "Analítica comercial", "CAR-ICO"),
          new LineaInvestigacion("LIN-11", "Comportamiento del consumidor", "CAR-ICO"),
          new LineaInvestigacion("LIN-12", "Internacionalización empresarial", "CAR-ANI"),
          new LineaInvestigacion("LIN-13", "Gestión estratégica", "CAR-ANI"),
          new LineaInvestigacion("LIN-14", "Diseño urbano sostenible", "CAR-ARQ"),
          new LineaInvestigacion("LIN-15", "Patrimonio y habitabilidad", "CAR-ARQ"),
          new LineaInvestigacion("LIN-16", "Derechos fundamentales", "CAR-DER"),
          new LineaInvestigacion("LIN-17", "Justicia y transformación digital", "CAR-DER"),
          new LineaInvestigacion("LIN-18", "Salud mental comunitaria", "CAR-PSI"),
          new LineaInvestigacion("LIN-19", "Psicología educativa", "CAR-PSI"),
          new LineaInvestigacion("LIN-20", "Comunicación pública de la ciencia", "CAR-CCO"),
          new LineaInvestigacion("LIN-21", "Narrativas digitales", "CAR-CCO")),
      List.of(
          new CicloAcademico("2026-II", "Ciclo 2026-II", "ACTIVO", "2026-08-17", "2026-12-31"),
          new CicloAcademico("2026-I", "Ciclo 2026-I", "CERRADO", "2026-03-16", "2026-06-30"),
          new CicloAcademico("2025-II", "Ciclo 2025-II", "CERRADO", "2025-08-18", "2025-12-31")),
      List.of(
          new Elemento("CAT-PRI", "Principal"),
          new Elemento("CAT-ASO", "Asociado"),
          new Elemento("CAT-AUX", "Auxiliar")),
      List.of(
          new Elemento("DED-DE", "Dedicación Exclusiva"),
          new Elemento("DED-TC", "Tiempo Completo"),
          new Elemento("DED-TP", "Tiempo Parcial")),
      List.of(
          new Elemento("REN-I", "Nivel I"),
          new Elemento("REN-II", "Nivel II"),
          new Elemento("REN-III", "Nivel III"),
          new Elemento("REN-IV", "Nivel IV"),
          new Elemento("REN-V", "Nivel V"),
          new Elemento("REN-VI", "Nivel VI"),
          new Elemento("REN-VII", "Nivel VII"),
          new Elemento("REN-SC", "Sin clasificación")),
      List.of(
          new Elemento("ACT-PUB", "Publicación"),
          new Elemento("ACT-PRO", "Proyecto de investigación"),
          new Elemento("ACT-EVE", "Evento académico"),
          new Elemento("ACT-ENT", "Entrega de seguimiento")));

  private final Map<String, List<?>> porNombre = new LinkedHashMap<>();

  public ServicioCatalogos() {
    porNombre.put("facultades", catalogos.facultades());
    porNombre.put("carreras", catalogos.carreras());
    porNombre.put("planesEstudio", catalogos.planesEstudio());
    porNombre.put("lineasInvestigacion", catalogos.lineasInvestigacion());
    porNombre.put("ciclosAcademicos", catalogos.ciclosAcademicos());
    porNombre.put("categoriasDocente", catalogos.categoriasDocente());
    porNombre.put("dedicaciones", catalogos.dedicaciones());
    porNombre.put("nivelesRenacyt", catalogos.nivelesRenacyt());
    porNombre.put("tiposActividad", catalogos.tiposActividad());
  }

  public Catalogos todos() {
    return catalogos;
  }

  public List<?> uno(String nombre) {
    List<?> lista = porNombre.get(nombre);
    if (lista == null)
      throw new RecursoNoEncontradoException("No existe el catálogo " + nombre + ". Disponibles: " + String.join(", ", porNombre.keySet()) + ".");
    return lista;
  }
}
