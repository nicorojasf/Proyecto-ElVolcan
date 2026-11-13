package com.gasvolcan.pedidos.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Lo que order-service necesita de la respuesta de product-service (el resto de los campos se ignora). */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ProductoDto(
        String codigo,
        String nombre,
        Integer precioResidencial,
        Integer precioComercial,
        Integer stock,
        String img
) {
}
