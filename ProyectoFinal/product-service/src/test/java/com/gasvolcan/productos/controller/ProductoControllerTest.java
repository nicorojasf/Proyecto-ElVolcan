package com.gasvolcan.productos.controller;

import com.gasvolcan.productos.dto.ProductoResponse;
import com.gasvolcan.productos.exception.RecursoNoEncontradoException;
import com.gasvolcan.productos.exception.StockInsuficienteException;
import com.gasvolcan.productos.service.ProductoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProductoController.class)
class ProductoControllerTest {

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

        mockMvc.perform(get("/api/productos"))
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

        mockMvc.perform(get("/api/productos/XX999"))
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

        mockMvc.perform(post("/api/productos").contentType(MediaType.APPLICATION_JSON).content(json))
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

        mockMvc.perform(post("/api/productos").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.precioResidencial").exists());
    }

    @Test
    @DisplayName("PUT descontar con stock insuficiente devuelve 409")
    void descontarSinStockDevuelve409() throws Exception {
        when(productoService.descontarStock(eq("CL002"), anyInt()))
                .thenThrow(new StockInsuficienteException("CL002", 3, 10));

        mockMvc.perform(put("/api/productos/CL002/stock/descontar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\": 10}"))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("PUT descontar con cantidad 0 devuelve 400")
    void descontarCantidadCeroDevuelve400() throws Exception {
        mockMvc.perform(put("/api/productos/CL002/stock/descontar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\": 0}"))
                .andExpect(status().isBadRequest());
    }
}
