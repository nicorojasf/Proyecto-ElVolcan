package com.gasvolcan.productos.controller;

import com.gasvolcan.productos.dto.ProductoResponse;
import com.gasvolcan.productos.exception.RecursoNoEncontradoException;
import com.gasvolcan.productos.exception.StockInsuficienteException;
import com.gasvolcan.productos.service.ProductoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas del controller con la seguridad real activa (perfil dev). ProductoService se simula con un mock
 * y los tokens se firman aquí con el mismo secreto, tal como lo haría auth-service.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class ProductoControllerTest {

    @Value("${jwt.secret}")
    private String secreto;

    @Value("${app.internal.key}")
    private String claveInterna;

    private String token(String rol) {
        NimbusJwtEncoder encoder = new NimbusJwtEncoder(
                new ImmutableSecret<>(new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256")));
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject("usuario@correo.cl")
                .issuedAt(ahora)
                .expiresAt(ahora.plusSeconds(600))
                .claim("uid", 1L)
                .claim("rol", rol)
                .build();
        return "Bearer " + encoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoService productoService;

    private ProductoResponse cilindro11() {
        return new ProductoResponse("CL002", "Cilindros de Gas", "Cilindro GLP 11 kg",
                "Cilindro estándar doméstico", "Unidad", 12000, 11000, 200, "/imagenes/c11k.png");
    }

    @Test
    @DisplayName("GET /api/productos devuelve 200 con los campos que usa el frontend")
    void listarDevuelve200() throws Exception {
        when(productoService.listar(null)).thenReturn(List.of(cilindro11()));

        mockMvc.perform(get("/api/v1/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("CL002"))
                .andExpect(jsonPath("$[0].categoria").value("Cilindros de Gas"))
                .andExpect(jsonPath("$[0].precioResidencial").value(12000))
                .andExpect(jsonPath("$[0].precioComercial").value(11000))
                .andExpect(jsonPath("$[0].img").value("/imagenes/c11k.png"));
    }

    @Test
    @DisplayName("GET /api/productos/{codigo} inexistente devuelve 404")
    void obtenerInexistenteDevuelve404() throws Exception {
        when(productoService.obtener("XX999"))
                .thenThrow(new RecursoNoEncontradoException("No existe el producto XX999"));

        mockMvc.perform(get("/api/v1/productos/XX999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje").value("No existe el producto XX999"));
    }

    @Test
    @DisplayName("POST /api/productos válido devuelve 201")
    void crearValidoDevuelve201() throws Exception {
        when(productoService.crear(any())).thenReturn(cilindro11());

        String json = """
                {
                  "codigo": "CL002", "categoria": "Cilindros de Gas", "nombre": "Cilindro GLP 11 kg",
                  "descripcion": "Cilindro estándar doméstico", "unidad": "Unidad",
                  "precioResidencial": 12000, "precioComercial": 11000, "stock": 200,
                  "img": "/imagenes/c11k.png"
                }
                """;

        mockMvc.perform(post("/api/v1/productos").header("Authorization", token("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigo").value("CL002"));
    }

    @Test
    @DisplayName("POST /api/productos con precio negativo devuelve 400 con detalle del campo")
    void crearInvalidoDevuelve400() throws Exception {
        String json = """
                {
                  "codigo": "CL002", "categoria": "Cilindros de Gas", "nombre": "Cilindro GLP 11 kg",
                  "unidad": "Unidad", "precioResidencial": -5, "precioComercial": 11000, "stock": 200
                }
                """;

        mockMvc.perform(post("/api/v1/productos").header("Authorization", token("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.precioResidencial").exists());
    }

    @Test
    @DisplayName("PUT descontar con stock insuficiente devuelve 409")
    void descontarSinStockDevuelve409() throws Exception {
        when(productoService.descontarStock(eq("CL002"), anyInt()))
                .thenThrow(new StockInsuficienteException("CL002", 3, 10));

        mockMvc.perform(put("/api/v1/productos/CL002/stock/descontar")
                        .header("X-Internal-Key", claveInterna)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\": 10}"))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("PUT descontar con cantidad 0 devuelve 400")
    void descontarCantidadCeroDevuelve400() throws Exception {
        mockMvc.perform(put("/api/v1/productos/CL002/stock/descontar")
                        .header("X-Internal-Key", claveInterna)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\": 0}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/productos sin token devuelve 401")
    void crearSinTokenDevuelve401() throws Exception {
        mockMvc.perform(post("/api/v1/productos").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/productos con token de CLIENTE devuelve 403")
    void crearComoClienteDevuelve403() throws Exception {
        mockMvc.perform(post("/api/v1/productos").header("Authorization", token("CLIENTE"))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/productos/{codigo} sin token devuelve 401")
    void desactivarSinTokenDevuelve401() throws Exception {
        mockMvc.perform(delete("/api/v1/productos/CL002")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT descontar sin token ni clave interna devuelve 401")
    void descontarSinCredencialesDevuelve401() throws Exception {
        mockMvc.perform(put("/api/v1/productos/CL002/stock/descontar")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"cantidad\": 1}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT descontar con clave interna incorrecta devuelve 401")
    void descontarClaveIncorrectaDevuelve401() throws Exception {
        mockMvc.perform(put("/api/v1/productos/CL002/stock/descontar").header("X-Internal-Key", "otra")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"cantidad\": 1}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT descontar con clave interna devuelve 200")
    void descontarConClaveInternaDevuelve200() throws Exception {
        when(productoService.descontarStock(eq("CL002"), anyInt())).thenReturn(cilindro11());

        mockMvc.perform(put("/api/v1/productos/CL002/stock/descontar").header("X-Internal-Key", claveInterna)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"cantidad\": 1}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("La clave interna NO permite crear productos (solo stock)")
    void claveInternaNoCreaProductos() throws Exception {
        mockMvc.perform(post("/api/v1/productos").header("X-Internal-Key", claveInterna)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("El VENDEDOR puede ver el catálogo pero no crear productos (403)")
    void vendedorSoloLectura() throws Exception {
        when(productoService.listar(null)).thenReturn(List.of(cilindro11()));

        mockMvc.perform(get("/api/v1/productos").header("Authorization", token("VENDEDOR")))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/productos").header("Authorization", token("VENDEDOR"))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /desactivados: 401 sin token, 403 para CLIENTE y VENDEDOR, 200 para ADMIN")
    void desactivadosSoloAdmin() throws Exception {
        when(productoService.listarDesactivados()).thenReturn(List.of(cilindro11()));

        mockMvc.perform(get("/api/v1/productos/desactivados")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/productos/desactivados").header("Authorization", token("CLIENTE")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/productos/desactivados").header("Authorization", token("VENDEDOR")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/productos/desactivados").header("Authorization", token("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("CL002"));
    }

    @Test
    @DisplayName("PUT /{codigo}/activar: solo el ADMIN puede reactivar un producto")
    void activarSoloAdmin() throws Exception {
        when(productoService.activar("CL002")).thenReturn(cilindro11());

        mockMvc.perform(put("/api/v1/productos/CL002/activar")).andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/v1/productos/CL002/activar").header("Authorization", token("VENDEDOR")))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/v1/productos/CL002/activar").header("Authorization", token("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigo").value("CL002"));
    }
}
