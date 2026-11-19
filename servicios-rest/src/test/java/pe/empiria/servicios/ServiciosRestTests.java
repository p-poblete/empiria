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
        .andExpect(jsonPath("$.parametros.length()").value(3))
        .andExpect(jsonPath("$.parametros[0].codigo").value("CICLO_VIGENTE"))
        .andExpect(jsonPath("$.parametros[0].valor").value("2026-II"))
        .andExpect(jsonPath("$.parametros[0].editable").value(false))
        .andExpect(jsonPath("$.parametros[1].codigo").value("ID_CARPETA_PLANTILLAS"))
        .andExpect(jsonPath("$.parametros[1].casoUso").value("CU-002"))
        .andExpect(jsonPath("$.parametros[2].codigo").value("ID_HOJA_BASE_DATOS"))
        .andExpect(jsonPath("$.parametros[2].tipo").value("ID_DRIVE"));
  }

  @Test
  void parametroInexistenteDevuelve404() throws Exception {
    mvc.perform(get("/api/parametros/NO_EXISTE")).andExpect(status().isNotFound())
        .andExpect(jsonPath("$.mensaje").value("No existe el parámetro NO_EXISTE."));
  }

  @Test
  void actualizaParametroConTokenYSubeVersion() throws Exception {
    actualizar("ID_CARPETA_PLANTILLAS", "{\"valor\":\" 1AbC-carpeta_2026 \"}", "secreto-prueba").andExpect(status().isOk())
        .andExpect(jsonPath("$.valor").value("1AbC-carpeta_2026"));
    mvc.perform(get("/api/parametros")).andExpect(jsonPath("$.version").value(2));
  }

  @Test
  void rechazaEscrituraSinToken() throws Exception {
    actualizar("ID_HOJA_BASE_DATOS", "{\"valor\":\"1AbC-hoja_2026\"}", null).andExpect(status().isUnauthorized());
    actualizar("ID_HOJA_BASE_DATOS", "{\"valor\":\"1AbC-hoja_2026\"}", "otro").andExpect(status().isUnauthorized());
  }

  @Test
  void validaFormatoSoloLecturaYDuplicados() throws Exception {
    actualizar("ID_CARPETA_PLANTILLAS", "{\"valor\":\"corto\"}", "secreto-prueba").andExpect(status().isBadRequest());
    actualizar("ID_CARPETA_PLANTILLAS", "{\"valor\":\"https://drive.google.com/x\"}", "secreto-prueba").andExpect(status().isBadRequest());
    actualizar("CICLO_VIGENTE", "{\"valor\":\"2027-I\"}", "secreto-prueba").andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.mensaje").value("El parámetro CICLO_VIGENTE es de solo lectura."));
    actualizar("ID_HOJA_BASE_DATOS", "{\"valor\":\"DEMO-CARPETA-PLANTILLAS-0001\"}", "secreto-prueba").andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.mensaje").value("ID_HOJA_BASE_DATOS no puede tener el mismo ID que ID_CARPETA_PLANTILLAS."));
    actualizar("ID_HOJA_BASE_DATOS", "{}", "secreto-prueba").andExpect(status().isBadRequest());
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
