package com.gasvolcan.pedidos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CrearPedidoRequest(
        @NotNull(message = "Faltan los datos del cliente.")
        @Valid
        ClienteDto cliente,

        @NotNull(message = "Falta la dirección de entrega.")
        @Valid
        DireccionDto direccion,

        @NotEmpty(message = "El pedido debe tener al menos un producto.")
        @Size(max = 50, message = "Un pedido no puede tener más de 50 productos distintos.")
        @Valid
        List<ItemRequest> items
) {
}
