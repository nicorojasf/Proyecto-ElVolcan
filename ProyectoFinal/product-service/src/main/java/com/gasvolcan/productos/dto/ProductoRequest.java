package com.gasvolcan.productos.dto;

import jakarta.validation.constraints.*;

/** Misma forma que ProductoResponse: "categoria" es el NOMBRE de la categoría. */
public record ProductoRequest(
        @NotBlank(message = "El código es obligatorio")
        @Size(max = 20, message = "El código admite máximo 20 caracteres")
        String codigo,

        @NotBlank(message = "La categoría es obligatoria")
        String categoria,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre admite máximo 150 caracteres")
        String nombre,

        @Size(max = 500, message = "La descripción admite máximo 500 caracteres")
        String descripcion,

        @NotBlank(message = "La unidad es obligatoria")
        String unidad,

        @NotNull(message = "El precio residencial es obligatorio")
        @PositiveOrZero(message = "El precio residencial no puede ser negativo")
        Integer precioResidencial,

        @NotNull(message = "El precio comercial es obligatorio")
        @PositiveOrZero(message = "El precio comercial no puede ser negativo")
        Integer precioComercial,

        @NotNull(message = "El stock es obligatorio")
        @PositiveOrZero(message = "El stock no puede ser negativo")
        Integer stock,

        String img
) {}
