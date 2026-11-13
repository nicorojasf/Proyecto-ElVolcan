package com.gasvolcan.auth.controller;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Prueba el flujo completo (registro, login, perfil, roles) con H2 en memoria (perfil dev). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AuthControllerTest {

    private static final String CLAVE = "Clave1234";

    @Autowired
    private MockMvc mockMvc;

    private String jsonRegistro(String email, String extra) {
        return "{\"nombre\":\"Ana Pérez\",\"email\":\"" + email + "\",\"telefono\":\"912345678\","
                + "\"password\":\"" + CLAVE + "\"" + extra + "}";
    }

    private void registrar(String email) throws Exception {
        mockMvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro(email, "")))
                .andExpect(status().isCreated());
    }

    private String login(String email, String password) throws Exception {
        String cuerpo = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(cuerpo, "$.token");
    }

    @Test
    @DisplayName("Registro devuelve 201, rol CLIENTE y nunca expone la contraseña")
    void registroOk() throws Exception {
        mockMvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("registro.ok@correo.cl", ",\"tipoCliente\":\"COMERCIAL\"")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("registro.ok@correo.cl"))
                .andExpect(jsonPath("$.rol").value("CLIENTE"))
                .andExpect(jsonPath("$.tipoCliente").value("COMERCIAL"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("No se puede registrar un ADMIN enviando el rol en el cuerpo")
    void registroIgnoraRol() throws Exception {
        mockMvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("intento.admin@correo.cl", ",\"rol\":\"ADMIN\"")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rol").value("CLIENTE"));
    }

    @Test
    @DisplayName("Registro con correo repetido devuelve 409")
    void registroDuplicado() throws Exception {
        registrar("duplicado@correo.cl");
        mockMvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro("DUPLICADO@correo.cl", "")))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Registro con datos inválidos devuelve 400 con detalle por campo")
    void registroInvalido() throws Exception {
        mockMvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"A\",\"email\":\"no-es-correo\",\"telefono\":\"123\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.email").exists())
                .andExpect(jsonPath("$.detalles.telefono").exists())
                .andExpect(jsonPath("$.detalles.password").exists());
    }

    @Test
    @DisplayName("Login con clave incorrecta devuelve 401")
    void loginIncorrecto() throws Exception {
        registrar("login.malo@correo.cl");
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"login.malo@correo.cl\",\"password\":\"incorrecta\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Con el token de login se accede al perfil")
    void perfilConToken() throws Exception {
        registrar("perfil@correo.cl");
        String token = login("perfil@correo.cl", CLAVE);

        mockMvc.perform(get("/api/auth/perfil").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("perfil@correo.cl"))
                .andExpect(jsonPath("$.tipoCliente").value("RESIDENCIAL"));
    }

    @Test
    @DisplayName("Perfil sin token o con token falso devuelve 401")
    void perfilSinToken() throws Exception {
        mockMvc.perform(get("/api/auth/perfil")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/auth/perfil").header("Authorization", "Bearer token.falso.xyz"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Lista de usuarios: 403 para CLIENTE y 200 para ADMIN")
    void listaSoloAdmin() throws Exception {
        registrar("cliente.lista@correo.cl");
        String tokenCliente = login("cliente.lista@correo.cl", CLAVE);
        mockMvc.perform(get("/api/auth/usuarios").header("Authorization", "Bearer " + tokenCliente))
                .andExpect(status().isForbidden());

        String tokenAdmin = login("admin@admin.cl", "Gasvolcan26");
        mockMvc.perform(get("/api/auth/usuarios").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("El admin inicial queda con rol ADMIN")
    void adminInicial() throws Exception {
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@admin.cl\",\"password\":\"Gasvolcan26\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.rol").value("ADMIN"));
    }

    private long registrarYObtenerId(String email) throws Exception {
        String cuerpo = mockMvc.perform(post("/api/auth/registro").contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRegistro(email, "")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(cuerpo, "$.id")).longValue();
    }

    private long idDe(String token) throws Exception {
        String cuerpo = mockMvc.perform(get("/api/auth/perfil").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(cuerpo, "$.id")).longValue();
    }

    @Test
    @DisplayName("El admin elimina un cliente (204) y ese cliente ya no puede iniciar sesión")
    void adminEliminaCliente() throws Exception {
        long id = registrarYObtenerId("a.eliminar@correo.cl");
        String tokenAdmin = login("admin@admin.cl", "Gasvolcan26");

        mockMvc.perform(delete("/api/auth/usuarios/" + id).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"a.eliminar@correo.cl\",\"password\":\"" + CLAVE + "\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Un CLIENTE no puede eliminar usuarios (403) y sin token da 401")
    void clienteNoElimina() throws Exception {
        long id = registrarYObtenerId("victima@correo.cl");
        registrar("atacante@correo.cl");
        String tokenCliente = login("atacante@correo.cl", CLAVE);

        mockMvc.perform(delete("/api/auth/usuarios/" + id).header("Authorization", "Bearer " + tokenCliente))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/auth/usuarios/" + id))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Eliminar un id inexistente devuelve 404")
    void eliminarInexistente() throws Exception {
        String tokenAdmin = login("admin@admin.cl", "Gasvolcan26");

        mockMvc.perform(delete("/api/auth/usuarios/999999").header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("El admin no puede eliminar su propia cuenta (400)")
    void adminNoSeElimina() throws Exception {
        String tokenAdmin = login("admin@admin.cl", "Gasvolcan26");
        long idAdmin = idDe(tokenAdmin);

        mockMvc.perform(delete("/api/auth/usuarios/" + idAdmin).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isBadRequest());
    }
}
