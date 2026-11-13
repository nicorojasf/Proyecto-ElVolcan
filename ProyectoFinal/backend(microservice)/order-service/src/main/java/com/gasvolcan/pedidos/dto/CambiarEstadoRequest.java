package com.gasvolcan.pedidos.dto;

import com.gasvolcan.pedidos.model.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoRequest(
        @NotNull(message = "El estado es obligatorio.")
        EstadoPedido estado
) {
}
