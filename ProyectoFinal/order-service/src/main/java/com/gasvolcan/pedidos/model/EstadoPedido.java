package com.gasvolcan.pedidos.model;

import java.util.Set;

/**
 * Ciclo de vida: PENDIENTE -> CONFIRMADO -> EN_CAMINO -> ENTREGADO.
 * Se puede CANCELAR mientras no salga a reparto (PENDIENTE o CONFIRMADO); ahí se devuelve el stock.
 */
public enum EstadoPedido {
    PENDIENTE,
    CONFIRMADO,
    EN_CAMINO,
    ENTREGADO,
    CANCELADO;

    public boolean permiteCambiarA(EstadoPedido destino) {
        return siguientes().contains(destino);
    }

    private Set<EstadoPedido> siguientes() {
        return switch (this) {
            case PENDIENTE -> Set.of(CONFIRMADO, CANCELADO);
            case CONFIRMADO -> Set.of(EN_CAMINO, CANCELADO);
            case EN_CAMINO -> Set.of(ENTREGADO);
            case ENTREGADO, CANCELADO -> Set.of();
        };
    }
}
