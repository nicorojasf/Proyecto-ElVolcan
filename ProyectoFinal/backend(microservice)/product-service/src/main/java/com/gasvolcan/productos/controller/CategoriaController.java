package com.gasvolcan.productos.controller;

import com.gasvolcan.productos.dto.CategoriaResponse;
import com.gasvolcan.productos.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categorias")
@Tag(name = "Categorías")
public class CategoriaController {

    private final ProductoService productoService;

    public CategoriaController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    @Operation(summary = "Listar categorías (slug, nombre e ícono)")
    public List<CategoriaResponse> listar() {
        return productoService.listarCategorias();
    }
}
