package com.gasvolcan.productos.service;

import com.gasvolcan.productos.dto.CategoriaResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    // ---------- Consultas ----------

    @Transactional(readOnly = true)
    public List<ProductoResponse> listar(String categoriaSlug) {
        List<Producto> productos = (categoriaSlug == null || categoriaSlug.isBlank())
                ? productoRepository.findByActivoTrueOrderByCodigoAsc()
                : productoRepository.findByCategoriaSlugAndActivoTrueOrderByCodigoAsc(categoriaSlug);
        return productos.stream().map(ProductoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(String codigo) {
        return ProductoResponse.from(buscarActivo(codigo));
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarCategorias() {
        return categoriaRepository.findAll().stream().map(CategoriaResponse::from).toList();
    }

    // ---------- Administración ----------

    @Transactional
    public ProductoResponse crear(ProductoRequest req) {
        if (productoRepository.existsByCodigo(req.codigo())) {
            throw new CodigoDuplicadoException(req.codigo());
        }
        Producto producto = Producto.builder()
                .codigo(req.codigo())
                .categoria(buscarCategoria(req.categoria()))
                .nombre(req.nombre())
                .descripcion(req.descripcion())
                .unidad(req.unidad())
                .precioResidencial(req.precioResidencial())
                .precioComercial(req.precioComercial())
                .stock(req.stock())
                .img(req.img())
                .activo(true)
                .build();
        return ProductoResponse.from(productoRepository.save(producto));
    }

    /** El código no se modifica: es el identificador de negocio. */
    @Transactional
    public ProductoResponse actualizar(String codigo, ProductoRequest req) {
        Producto producto = buscarActivo(codigo);
        producto.setCategoria(buscarCategoria(req.categoria()));
        producto.setNombre(req.nombre());
        producto.setDescripcion(req.descripcion());
        producto.setUnidad(req.unidad());
        producto.setPrecioResidencial(req.precioResidencial());
        producto.setPrecioComercial(req.precioComercial());
        producto.setStock(req.stock());
        producto.setImg(req.img());
        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional
    public void desactivar(String codigo) {
        Producto producto = buscarActivo(codigo);
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    // ---------- Stock (lo usará order-service) ----------

    @Transactional
    public ProductoResponse descontarStock(String codigo, int cantidad) {
        int filas = productoRepository.descontarStock(codigo, cantidad);
        if (filas == 0) {
            // No se actualizó nada: o no existe, o no alcanza el stock
            Producto producto = buscarActivo(codigo);
            throw new StockInsuficienteException(codigo, producto.getStock(), cantidad);
        }
        return obtener(codigo);
    }

    @Transactional
    public ProductoResponse aumentarStock(String codigo, int cantidad) {
        if (productoRepository.aumentarStock(codigo, cantidad) == 0) {
            throw new RecursoNoEncontradoException("No existe el producto " + codigo);
        }
        return obtener(codigo);
    }

    // ---------- Auxiliares ----------

    private Producto buscarActivo(String codigo) {
        return productoRepository.findByCodigoAndActivoTrue(codigo)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el producto " + codigo));
    }

    private Categoria buscarCategoria(String nombre) {
        return categoriaRepository.findByNombre(nombre)
                .orElseThrow(() -> new CategoriaInvalidaException(nombre));
    }
}
