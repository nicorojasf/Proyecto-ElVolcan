package com.gasvolcan.pedidos.service;

import com.gasvolcan.pedidos.model.Pedido;
import com.gasvolcan.pedidos.repository.PedidoRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

/**
 * Guarda el pedido con sus detalles en UNA sola transacción y le asigna su número visible.
 * Está aparte de PedidoService para que PedidoService pueda llamar a product-service
 * sin mantener una transacción de base de datos abierta mientras espera la red.
 */
@Component
public class PedidoGuardador {

    private final PedidoRepository pedidoRepository;

    public PedidoGuardador(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional
    public Pedido guardar(Pedido pedido) {
        Pedido guardado = pedidoRepository.save(pedido); // el INSERT ya asigna el id (IDENTITY)
        String fecha = guardado.getFecha().format(DateTimeFormatter.BASIC_ISO_DATE);
        guardado.setNumero(String.format("%s%04d", fecha, guardado.getId()));
        guardado.setCodigo(String.format("ORDER%05d", guardado.getId()));
        return guardado; // el cambio de numero/codigo se confirma junto con el commit
    }
}
