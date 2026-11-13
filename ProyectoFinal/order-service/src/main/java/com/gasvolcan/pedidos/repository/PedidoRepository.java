package com.gasvolcan.pedidos.repository;

import com.gasvolcan.pedidos.model.EstadoPedido;
import com.gasvolcan.pedidos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Con "join fetch" los detalles vienen cargados: open-in-view está apagado y no hay sesión después.

    @Query("select distinct p from Pedido p left join fetch p.detalles where p.id = :id")
    Optional<Pedido> buscarConDetalle(@Param("id") Long id);

    @Query("select distinct p from Pedido p left join fetch p.detalles where p.usuarioId = :usuarioId order by p.fecha desc")
    List<Pedido> buscarPorUsuario(@Param("usuarioId") Long usuarioId);

    @Query("select distinct p from Pedido p left join fetch p.detalles order by p.fecha desc")
    List<Pedido> buscarTodos();

    @Query("select distinct p from Pedido p left join fetch p.detalles where p.estado = :estado order by p.fecha desc")
    List<Pedido> buscarPorEstado(@Param("estado") EstadoPedido estado);

    /**
     * Cambio de estado ATÓMICO: solo se aplica si el pedido sigue en el estado que leímos.
     * Si dos administradores cambian el mismo pedido a la vez, solo uno gana (devuelve 0 al otro).
     */
    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Pedido p set p.estado = :nuevo where p.id = :id and p.estado = :actual")
    int cambiarEstado(@Param("id") Long id, @Param("actual") EstadoPedido actual, @Param("nuevo") EstadoPedido nuevo);
}
