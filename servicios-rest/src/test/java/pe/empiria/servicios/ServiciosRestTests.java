package pe.empiria.servicios;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "empiria.token=secreto-prueba")
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ServiciosRestTests {

  @Autowired
  MockMvc mvc;

  private org.springframework.test.web.servlet.ResultActions actualizar(String codigo, String cuerpo, String token) throws Exception {
    var peticion = put("/api/parametros/" + codigo).contentType(MediaType.APPLICATION_JSON).content(cuerpo);
    if (token != null) peticion.header("X-Empiria-Token", token);
    return mvc.perform(peticion);
  }

  @Test
  void listaParametrosRequeridos() throws Exception {
    mvc.perform(get("/api/parametros")).andExpect(status().isOk())
        .andExpect(jsonPath("$.version").value(1))
        .andExpect(jsonPath("$.parametros[?(@.codigo=='MIN_HORAS_DOCENTE')].valor").value("8"))
        .andExpect(jsonPath("$.parametros[?(@.codigo=='MAX_HORAS_DOCENTE')].valor").value("40"))
        .andExpect(jsonPath("$.parametros[?(@.codigo=='CICLO_VIGENTE')].valor").value("2026-II"))
        .andExpect(jsonPath("$.parametros[?(@.codigo=='ID_CARPETA_PLANTILLAS')].tipo").value("ID_DRIVE"));
  }

  @Test
  void parametroInexistenteDevuelve404() throws Exception {
    mvc.perform(get("/api/parametros/NO_EXISTE")).andExpect(status().isNotFound())
        .andExpect(jsonPath("$.mensaje").value("No existe el parámetro NO_EXISTE."));
  }

  @Test
  void actualizaParametroConTokenYSubeVersion() throws Exception {
    actualizar("MAX_HORAS_DOCENTE", "{\"valor\":\" 36 \"}", "secreto-prueba").andExpect(status().isOk())
        .andExpect(jsonPath("$.valor").value("36"));
    mvc.perform(get("/api/parametros")).andExpect(jsonPath("$.version").value(2));
  }

  @Test
  void rechazaEscrituraSinToken() throws Exception {
    actualizar("MAX_HORAS_DOCENTE", "{\"valor\":\"36\"}", null).andExpect(status().isUnauthorized());
    actualizar("MAX_HORAS_DOCENTE", "{\"valor\":\"36\"}", "otro").andExpect(status().isUnauthorized());
  }

  @Test
  void validaTipoRangoSoloLecturaYCoherencia() throws Exception {
    actualizar("MAX_HORAS_DOCENTE", "{\"valor\":\"abc\"}", "secreto-prueba").andExpect(status().isBadRequest());
    actualizar("MAX_HORAS_DOCENTE", "{\"valor\":\"99\"}", "secreto-prueba").andExpect(status().isBadRequest());
    actualizar("CICLO_VIGENTE", "{\"valor\":\"2027-I\"}", "secreto-prueba").andExpect(status().isBadRequest());
    actualizar("FECHA_FIN_CICLO", "{\"valor\":\"2026-02-30\"}", "secreto-prueba").andExpect(status().isBadRequest());
    actualizar("ID_CARPETA_PLANTILLAS", "{\"valor\":\"corto\"}", "secreto-prueba").andExpect(status().isBadRequest());
    actualizar("MIN_HORAS_DOCENTE", "{\"valor\":\"45\"}", "secreto-prueba").andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.mensaje").value("MIN_HORAS_DOCENTE no puede superar a MAX_HORAS_DOCENTE."));
    actualizar("MAX_HORAS_DOCENTE", "{}", "secreto-prueba").andExpect(status().isBadRequest());
    // El rechazo por coherencia no deja el valor inválido guardado.
    mvc.perform(get("/api/parametros/MIN_HORAS_DOCENTE")).andExpect(jsonPath("$.valor").value("8"));
    mvc.perform(get("/api/parametros")).andExpect(jsonPath("$.version").value(1));
  }

  @Test
  void devuelveCatalogosConIdYDescripcion() throws Exception {
    mvc.perform(get("/api/catalogos")).andExpect(status().isOk())
        .andExpect(jsonPath("$.facultades.length()").value(5))
        .andExpect(jsonPath("$.carreras.length()").value(10))
        .andExpect(jsonPath("$.carreras[0].id").value("CAR-SIS"))
        .andExpect(jsonPath("$.carreras[0].idFacultad").value("FAC-ING"))
        .andExpect(jsonPath("$.lineasInvestigacion.length()").value(21))
        .andExpect(jsonPath("$.planesEstudio[0].vigente").value(false))
        .andExpect(jsonPath("$.ciclosAcademicos[0].estado").value("ACTIVO"));
    mvc.perform(get("/api/catalogos/carreras")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(10));
    mvc.perform(get("/api/catalogos/otros")).andExpect(status().isNotFound());
  }
}
