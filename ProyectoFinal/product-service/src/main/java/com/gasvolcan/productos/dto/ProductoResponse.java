package com.gasvolcan.productos.dto;

import com.gasvolcan.productos.model.Producto;

/** Mismos nombres de campo que src/data/productos.js del frontend. */
public record ProductoResponse(
        String codigo,
        String categoria,
        String nombre,
        String descripcion,
        String unidad,
        Integer precioResidencial,
        Integer precioComercial,
        Integer stock,
        String img
) {
    public static ProductoResponse from(Producto p) {
        return new ProductoResponse(
                p.getCodigo(),
                p.getCategoria().getNombre(),
                p.getNombre(),
                p.getDescripcion(),
                p.getUnidad(),
                p.getPrecioResidencial(),
                p.getPrecioComercial(),
                p.getStock(),
                p.getImg()
        );
    }
}
