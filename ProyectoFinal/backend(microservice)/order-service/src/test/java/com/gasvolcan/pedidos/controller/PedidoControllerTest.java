package com.gasvolcan.pedidos.controller;

import com.gasvolcan.pedidos.client.ProductoClient;
import com.gasvolcan.pedidos.client.ProductoDto;
import com.gasvolcan.pedidos.exception.ProductoInvalidoException;
import com.gasvolcan.pedidos.exception.ServicioNoDisponibleException;
import com.gasvolcan.pedidos.exception.StockInsuficienteException;
import com.jayway.jsonpath.JsonPath;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
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

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Flujo completo con H2 en memoria (perfil dev). product-service se simula con un mock y los tokens
 * se firman aquí con el mismo secreto, tal como lo haría auth-service.
 * Cada test usa su propio uid de usuario para no mezclar pedidos entre tests.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class PedidoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoClient productos;

    @Value("${jwt.secret}")
    private String secreto;

    // ---------- helpers ----------

    private String token(long uid, String rol, String tipoCliente) {
        NimbusJwtEncoder encoder = new NimbusJwtEncoder(
                new ImmutableSecret<>(new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256")));
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject("usuario" + uid + "@correo.cl")
                .issuedAt(ahora)
                .expiresAt(ahora.plusSeconds(600))
                .claim("uid", uid)
                .claim("rol", rol)
                .claim("tipoCliente", tipoCliente)
                .build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }

    private String cliente(long uid) {
        return "Bearer " + token(uid, "CLIENTE", "RESIDENCIAL");
    }

    private String comercial(long uid) {
        return "Bearer " + token(uid, "CLIENTE", "COMERCIAL");
    }

    private String admin() {
        return "Bearer " + token(9000, "ADMIN", "COMERCIAL");
    }

    private void productoDisponible() {
        when(productos.obtener("CL001")).thenReturn(new ProductoDto("CL001", "Cilindro 15kg", 20000, 18000, 10, "c.png"));
    }

    private String cuerpo(String items) {
        return "{\"cliente\":{\"nombre\":\"Ana\",\"apellidos\":\"Pérez\",\"correo\":\"ana@correo.cl\"},"
                + "\"direccion\":{\"calle\":\"Los Aromos\",\"numero\":\"123\",\"tipo\":\"casa\","
                + "\"region\":\"Metropolitana\",\"comuna\":\"Maipú\"},\"items\":" + items + "}";
    }

    private static final String UN_CILINDRO = "[{\"codigo\":\"CL001\",\"cantidad\":2}]";

    /** Crea un pedido y devuelve su id. */
    private long crearPedido(String autorizacion) throws Exception {
        productoDisponible();
        String respuesta = mockMvc.perform(post("/api/v1/pedidos").header("Authorization", autorizacion)
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo(UN_CILINDRO)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(respuesta, "$.id")).longValue();
    }

    // ---------- crear ----------

    @Test
    @DisplayName("Con solo código y cantidad se crea el pedido, se recalcula el precio y baja el stock")
    void crearPedido() throws Exception {
        productoDisponible();

        mockMvc.perform(post("/api/v1/pedidos").header("Authorization", cliente(101))
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo(UN_CILINDRO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.total").value(40000))
                .andExpect(jsonPath("$.items[0].precio").value(20000))
                .andExpect(jsonPath("$.items[0].nombre").value("Cilindro 15kg"))
                .andExpect(jsonPath("$.numero").isNotEmpty())
                .andExpect(jsonPath("$.codigo").value(org.hamcrest.Matchers.startsWith("ORDER")))
                .andExpect(jsonPath("$.cliente.correo").value("ana@correo.cl"));

        verify(productos).descontarStock("CL001", 2);
    }

    @Test
    @DisplayName("Un cliente comercial paga el precio comercial")
    void precioComercial() throws Exception {
        productoDisponible();

        mockMvc.perform(post("/api/v1/pedidos").header("Authorization", comercial(102))
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo(UN_CILINDRO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipoCliente").value("COMERCIAL"))
                .andExpect(jsonPath("$.total").value(36000));
    }

    @Test
    @DisplayName("Si el cliente manda un precio, se ignora")
    void precioDelClienteSeIgnora() throws Exception {
        productoDisponible();

        mockMvc.perform(post("/api/v1/pedidos").header("Authorization", cliente(103))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo("[{\"codigo\":\"CL001\",\"cantidad\":1,\"precio\":1}]")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(20000));
    }

    @Test
    @DisplayName("Sin token se responde 401 y no se toca el stock")
    void sinToken() throws Exception {
        mockMvc.perform(post("/api/v1/pedidos").contentType(MediaType.APPLICATION_JSON).content(cuerpo(UN_CILINDRO)))
                .andExpect(status().isUnauthorized());

        verify(productos, never()).descontarStock(anyString(), anyInt());
    }

    @Test
    @DisplayName("Un pedido sin productos o con datos malos da 400 con detalle por campo")
    void datosInvalidos() throws Exception {
        mockMvc.perform(post("/api/v1/pedidos").header("Authorization", cliente(104))
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo("[]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.items").exists());

        mockMvc.perform(post("/api/v1/pedidos").header("Authorization", cliente(104))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo("[{\"codigo\":\"CL001\",\"cantidad\":0}]")))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/pedidos").header("Authorization", cliente(104))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cliente\":{\"nombre\":\"\",\"apellidos\":\"P\",\"correo\":\"malo\"},"
                                + "\"direccion\":{\"calle\":\"ab\",\"numero\":\"x\",\"tipo\":\"casa\","
                                + "\"region\":\"R\",\"comuna\":\"C\"},\"items\":" + UN_CILINDRO + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles['cliente.nombre']").exists())
                .andExpect(jsonPath("$.detalles['cliente.correo']").exists())
                .andExpect(jsonPath("$.detalles['direccion.calle']").exists())
                .andExpect(jsonPath("$.detalles['direccion.numero']").exists());
    }

    @Test
    @DisplayName("Sin stock: 409, y el pedido no queda guardado")
    void sinStock() throws Exception {
        productoDisponible();
        doThrow(new StockInsuficienteException("No hay stock suficiente de CL001."))
                .when(productos).descontarStock("CL001", 2);

        mockMvc.perform(post("/api/v1/pedidos").header("Authorization", cliente(105))
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo(UN_CILINDRO)))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/v1/pedidos/mis-pedidos").header("Authorization", cliente(105)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("Un producto que no existe da 400")
    void productoInexistente() throws Exception {
        when(productos.obtener("CL001")).thenThrow(new ProductoInvalidoException("El producto CL001 no existe."));

        mockMvc.perform(post("/api/v1/pedidos").header("Authorization", cliente(106))
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo(UN_CILINDRO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Si product-service no responde, se devuelve 503")
    void productServiceCaido() throws Exception {
        when(productos.obtener("CL001")).thenThrow(new ServicioNoDisponibleException("No se pudo contactar a product-service."));

        mockMvc.perform(post("/api/v1/pedidos").header("Authorization", cliente(107))
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo(UN_CILINDRO)))
                .andExpect(status().isServiceUnavailable());
    }

    // ---------- consultas ----------

    @Test
    @DisplayName("Mis pedidos muestra solo los del usuario con sesión")
    void misPedidos() throws Exception {
        crearPedido(cliente(201));

        mockMvc.perform(get("/api/v1/pedidos/mis-pedidos").header("Authorization", cliente(201)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].items[0].codigo").value("CL001"));

        mockMvc.perform(get("/api/v1/pedidos/mis-pedidos").header("Authorization", cliente(202)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("La lista completa es solo para ADMIN")
    void listaSoloAdmin() throws Exception {
        crearPedido(cliente(203));

        mockMvc.perform(get("/api/v1/pedidos").header("Authorization", cliente(203)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/pedidos").header("Authorization", admin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        mockMvc.perform(get("/api/v1/pedidos").param("estado", "PENDIENTE").header("Authorization", admin()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/pedidos").param("estado", "NO_EXISTE").header("Authorization", admin()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Un pedido lo ve su dueño y el admin; para otro cliente no existe (404)")
    void verPedido() throws Exception {
        long id = crearPedido(cliente(204));

        mockMvc.perform(get("/api/v1/pedidos/" + id).header("Authorization", cliente(204))).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/pedidos/" + id).header("Authorization", admin())).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/pedidos/" + id).header("Authorization", cliente(205))).andExpect(status().isNotFound());
    }

    // ---------- estados ----------

    @Test
    @DisplayName("El admin avanza el estado paso a paso y no puede saltarse el orden")
    void cambiarEstado() throws Exception {
        long id = crearPedido(cliente(301));

        mockMvc.perform(put("/api/v1/pedidos/" + id + "/estado").header("Authorization", admin())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"CONFIRMADO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CONFIRMADO"));

        mockMvc.perform(put("/api/v1/pedidos/" + id + "/estado").header("Authorization", admin())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"ENTREGADO\"}"))
                .andExpect(status().isConflict());

        mockMvc.perform(put("/api/v1/pedidos/" + id + "/estado").header("Authorization", admin())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"EN_CAMINO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EN_CAMINO"));
    }

    @Test
    @DisplayName("Un cliente no puede cambiar estados (403)")
    void clienteNoCambiaEstado() throws Exception {
        long id = crearPedido(cliente(302));

        mockMvc.perform(put("/api/v1/pedidos/" + id + "/estado").header("Authorization", cliente(302))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"CONFIRMADO\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Cancelar devuelve el stock, y cancelar otra vez da conflicto")
    void cancelar() throws Exception {
        long id = crearPedido(cliente(303));

        mockMvc.perform(put("/api/v1/pedidos/" + id + "/estado").header("Authorization", admin())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"CANCELADO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CANCELADO"));

        verify(productos).aumentarStock("CL001", 2);

        mockMvc.perform(put("/api/v1/pedidos/" + id + "/estado").header("Authorization", admin())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"CANCELADO\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Cambiar el estado de un pedido que no existe da 404")
    void estadoDePedidoInexistente() throws Exception {
        mockMvc.perform(put("/api/v1/pedidos/999999/estado").header("Authorization", admin())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"CONFIRMADO\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("El VENDEDOR ve la lista y el detalle de cualquier pedido, pero no puede cambiar su estado")
    void vendedorSoloLectura() throws Exception {
        long id = crearPedido(cliente(401));
        String vendedor = "Bearer " + token(9100, "VENDEDOR", "COMERCIAL");

        mockMvc.perform(get("/api/v1/pedidos").header("Authorization", vendedor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        mockMvc.perform(get("/api/v1/pedidos/" + id).header("Authorization", vendedor))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/v1/pedidos/" + id + "/estado").header("Authorization", vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"CONFIRMADO\"}"))
                .andExpect(status().isForbidden());
    }
}
