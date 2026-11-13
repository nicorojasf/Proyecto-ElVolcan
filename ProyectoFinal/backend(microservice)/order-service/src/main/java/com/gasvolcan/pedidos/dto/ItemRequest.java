package com.gasvolcan.pedidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Solo código y cantidad: el precio SIEMPRE lo recalcula el servidor con product-service. */
public record ItemRequest(
        @NotBlank(message = "El código del producto es obligatorio.")
        String codigo,

        @NotNull(message = "La cantidad es obligatoria.")
        @Positive(message = "La cantidad debe ser mayor a 0.")
        Integer cantidad
) {
}
