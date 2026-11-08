package com.gasvolcan.productos.dto;

import com.gasvolcan.productos.model.Categoria;

public record CategoriaResponse(String slug, String nombre, String icono) {
    public static CategoriaResponse from(Categoria c) {
        return new CategoriaResponse(c.getSlug(), c.getNombre(), c.getIcono());
    }
}
