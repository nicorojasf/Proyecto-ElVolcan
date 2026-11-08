package com.gasvolcan.productos.service;

import com.gasvolcan.productos.dto.ProductoRequest;
import com.gasvolcan.productos.dto.ProductoResponse;
import com.gasvolcan.productos.exception.CategoriaInvalidaException;
import com.gasvolcan.productos.exception.CodigoDuplicadoException;
import com.gasvolcan.productos.exception.RecursoNoEncontradoException;
import com.gasvolcan.productos.exception.StockInsuficienteException;
import com.gasvolcan.productos.model.Categoria;
import com.gasvolcan.productos.model.Producto;
import com.gasvolcan.productos.repository.CategoriaRepository;
import com.gasvolcan.productos.repository.ProductoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private ProductoService productoService;

    private Categoria categoria() {
        return Categoria.builder().id(1L).slug("cilindros").nombre("Cilindros de Gas").icono("bi-fire").build();
    }

    private Producto producto(int stock) {
        return Producto.builder().id(1L).codigo("CL002").categoria(categoria())
                .nombre("Cilindro GLP 11 kg").unidad("Unidad")
                .precioResidencial(12000).precioComercial(11000)
                .stock(stock).activo(true).build();
    }

    private ProductoRequest request(String categoriaNombre) {
        return new ProductoRequest("CL002", categoriaNombre, "Cilindro GLP 11 kg", "desc",
                "Unidad", 12000, 11000, 200, "/imagenes/c11k.png");
    }

    @Test
    @DisplayName("descontarStock: descuenta y devuelve el producto actualizado")
    void descontarOk() {
        when(productoRepository.descontarStock("CL002", 5)).thenReturn(1);
        when(productoRepository.findByCodigoAndActivoTrue("CL002")).thenReturn(Optional.of(producto(195)));

        ProductoResponse resp = productoService.descontarStock("CL002", 5);

        assertEquals(195, resp.stock());
    }

    @Test
    @DisplayName("descontarStock: lanza StockInsuficiente si el UPDATE no afectó filas y el producto existe")
    void descontarSinStock() {
        when(productoRepository.descontarStock("CL002", 50)).thenReturn(0);
        when(productoRepository.findByCodigoAndActivoTrue("CL002")).thenReturn(Optional.of(producto(3)));

        assertThrows(StockInsuficienteException.class, () -> productoService.descontarStock("CL002", 50));
    }

    @Test
    @DisplayName("descontarStock: lanza RecursoNoEncontrado si el producto no existe")
    void descontarProductoInexistente() {
        when(productoRepository.descontarStock("XX999", 1)).thenReturn(0);
        when(productoRepository.findByCodigoAndActivoTrue("XX999")).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> productoService.descontarStock("XX999", 1));
    }

    @Test
    @DisplayName("crear: rechaza un código duplicado y no guarda nada")
    void crearDuplicado() {
        when(productoRepository.existsByCodigo("CL002")).thenReturn(true);

        assertThrows(CodigoDuplicadoException.class, () -> productoService.crear(request("Cilindros de Gas")));
        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("crear: rechaza una categoría que no existe")
    void crearCategoriaInvalida() {
        when(productoRepository.existsByCodigo("CL002")).thenReturn(false);
        when(categoriaRepository.findByNombre("Inventada")).thenReturn(Optional.empty());

        assertThrows(CategoriaInvalidaException.class, () -> productoService.crear(request("Inventada")));
    }

    @Test
    @DisplayName("crear: guarda y devuelve el producto con la categoría por nombre")
    void crearOk() {
        when(productoRepository.existsByCodigo("CL002")).thenReturn(false);
        when(categoriaRepository.findByNombre("Cilindros de Gas")).thenReturn(Optional.of(categoria()));
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductoResponse resp = productoService.crear(request("Cilindros de Gas"));

        assertEquals("CL002", resp.codigo());
        assertEquals("Cilindros de Gas", resp.categoria());
    }

    @Test
    @DisplayName("desactivar: marca activo=false en vez de borrar")
    void desactivarEsBorradoLogico() {
        Producto p = producto(10);
        when(productoRepository.findByCodigoAndActivoTrue("CL002")).thenReturn(Optional.of(p));

        productoService.desactivar("CL002");

        assertEquals(false, p.getActivo());
        verify(productoRepository).save(p);
    }
}
