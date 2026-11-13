package com.gasvolcan.pedidos.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.gasvolcan.pedidos.model.EstadoPedido.CANCELADO;
import static com.gasvolcan.pedidos.model.EstadoPedido.CONFIRMADO;
import static com.gasvolcan.pedidos.model.EstadoPedido.EN_CAMINO;
import static com.gasvolcan.pedidos.model.EstadoPedido.ENTREGADO;
import static com.gasvolcan.pedidos.model.EstadoPedido.PENDIENTE;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EstadoPedidoTest {

    @Test
    @DisplayName("El camino normal avanza de a un paso")
    void caminoNormal() {
        assertTrue(PENDIENTE.permiteCambiarA(CONFIRMADO));
        assertTrue(CONFIRMADO.permiteCambiarA(EN_CAMINO));
        assertTrue(EN_CAMINO.permiteCambiarA(ENTREGADO));
    }

    @Test
    @DisplayName("No se puede saltar pasos ni retroceder")
    void sinSaltosNiRetrocesos() {
        assertFalse(PENDIENTE.permiteCambiarA(EN_CAMINO));
        assertFalse(PENDIENTE.permiteCambiarA(ENTREGADO));
        assertFalse(CONFIRMADO.permiteCambiarA(PENDIENTE));
        assertFalse(EN_CAMINO.permiteCambiarA(CONFIRMADO));
    }

    @Test
    @DisplayName("Se cancela solo antes de salir a reparto")
    void cancelacion() {
        assertTrue(PENDIENTE.permiteCambiarA(CANCELADO));
        assertTrue(CONFIRMADO.permiteCambiarA(CANCELADO));
        assertFalse(EN_CAMINO.permiteCambiarA(CANCELADO));
        assertFalse(ENTREGADO.permiteCambiarA(CANCELADO));
    }

    @Test
    @DisplayName("ENTREGADO y CANCELADO son finales")
    void estadosFinales() {
        for (EstadoPedido destino : EstadoPedido.values()) {
            assertFalse(ENTREGADO.permiteCambiarA(destino));
            assertFalse(CANCELADO.permiteCambiarA(destino));
        }
    }
}
