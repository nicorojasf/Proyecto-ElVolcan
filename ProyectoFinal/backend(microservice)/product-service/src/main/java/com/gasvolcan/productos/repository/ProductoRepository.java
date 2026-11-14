package com.gasvolcan.productos.repository;

import com.gasvolcan.productos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByActivoTrueOrderByCodigoAsc();

    List<Producto> findByCategoriaSlugAndActivoTrueOrderByCodigoAsc(String slug);

    List<Producto> findByActivoFalseOrderByCodigoAsc();

    Optional<Producto> findByCodigoAndActivoTrue(String codigo);

    Optional<Producto> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    /**
     * Descuento ATÓMICO: la condición "stock >= cantidad" se evalúa dentro del UPDATE,
     * así dos compras simultáneas nunca dejan el stock en negativo.
     * Devuelve 0 filas afectadas si no existe o no alcanza el stock.
     */
    @Modifying(clearAutomatically = true)
    @Query("""
            update Producto p set p.stock = p.stock - :cantidad
            where p.codigo = :codigo and p.activo = true and p.stock >= :cantidad
            """)
    int descontarStock(@Param("codigo") String codigo, @Param("cantidad") int cantidad);

    @Modifying(clearAutomatically = true)
    @Query("""
            update Producto p set p.stock = p.stock + :cantidad
            where p.codigo = :codigo and p.activo = true
            """)
    int aumentarStock(@Param("codigo") String codigo, @Param("cantidad") int cantidad);
}
