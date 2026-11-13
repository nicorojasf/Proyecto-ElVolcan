package com.gasvolcan.pedidos.repository;

import com.gasvolcan.pedidos.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update DetallePedido d set d.stockRestaurado = true where d.id = :id")
    int marcarStockRestaurado(@Param("id") Long id);
}
