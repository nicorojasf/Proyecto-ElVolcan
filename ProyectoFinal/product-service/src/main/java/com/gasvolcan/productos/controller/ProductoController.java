package com.gasvolcan.productos.controller;

import com.gasvolcan.productos.dto.ProductoRequest;
import com.gasvolcan.productos.dto.ProductoResponse;
import com.gasvolcan.productos.dto.StockRequest;
import com.gasvolcan.productos.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@Tag(name = "Productos", description = "Catálogo y stock de Gas El Volcán")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    @Operation(summary = "Listar productos activos, opcionalmente filtrando por slug de categoría")
    public List<ProductoResponse> listar(@RequestParam(required = false) String categoria) {
        return productoService.listar(categoria);
    }

    @GetMapping("/{codigo}")
    @Operation(summary = "Obtener un producto por su código")
    public ProductoResponse obtener(@PathVariable String codigo) {
        return productoService.obtener(codigo);
    }

    @PostMapping
    @Operation(summary = "Crear un producto (administrador)")
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        ProductoResponse creado = productoService.crear(request);
        URI ubicacion = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{codigo}").buildAndExpand(creado.codigo()).toUri();
        return ResponseEntity.created(ubicacion).body(creado);
    }

    @PutMapping("/{codigo}")
    @Operation(summary = "Actualizar un producto (administrador)")
    public ProductoResponse actualizar(@PathVariable String codigo,
                                       @Valid @RequestBody ProductoRequest request) {
        return productoService.actualizar(codigo, request);
    }

    @DeleteMapping("/{codigo}")
    @Operation(summary = "Desactivar un producto: deja de aparecer en el catálogo (administrador)")
    public ResponseEntity<Void> desactivar(@PathVariable String codigo) {
        productoService.desactivar(codigo);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{codigo}/stock/descontar")
    @Operation(summary = "Descontar stock de forma atómica (uso interno de order-service)")
    public ProductoResponse descontarStock(@PathVariable String codigo,
                                           @Valid @RequestBody StockRequest request) {
        return productoService.descontarStock(codigo, request.cantidad());
    }

    @PutMapping("/{codigo}/stock/aumentar")
    @Operation(summary = "Aumentar stock: reposición o pedido cancelado")
    public ProductoResponse aumentarStock(@PathVariable String codigo,
                                          @Valid @RequestBody StockRequest request) {
        return productoService.aumentarStock(codigo, request.cantidad());
    }
}
