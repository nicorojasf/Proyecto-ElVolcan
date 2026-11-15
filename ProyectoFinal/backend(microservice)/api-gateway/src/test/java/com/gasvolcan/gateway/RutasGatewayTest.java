package com.gasvolcan.gateway;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;

@SpringBootTest
class RutasGatewayTest {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    @DisplayName("El gateway levanta con las 3 rutas, una por microservicio")
    void tieneUnaRutaPorMicroservicio() {
        List<Route> rutas = routeLocator.getRoutes().collectList().block();

        assertEquals(3, rutas.size());
        List<String> ids = rutas.stream().map(Route::getId).collect(Collectors.toList());
        assertTrue(ids.containsAll(List.of("product-service", "auth-service", "order-service")));
    }

    @Test
    @DisplayName("Cada ruta apunta al puerto de su microservicio")
    void cadaRutaApuntaASuServicio() {
        List<Route> rutas = routeLocator.getRoutes().collectList().block();

        assertEquals(8081, uriDe(rutas, "product-service"));
        assertEquals(8082, uriDe(rutas, "auth-service"));
        assertEquals(8083, uriDe(rutas, "order-service"));
    }

    private int uriDe(List<Route> rutas, String id) {
        return rutas.stream().filter(r -> r.getId().equals(id)).findFirst().orElseThrow().getUri().getPort();
    }
}
