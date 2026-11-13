package com.gasvolcan.pedidos.dto;

import com.gasvolcan.pedidos.model.DireccionEntrega;
import com.gasvolcan.pedidos.model.EstadoPedido;
import com.gasvolcan.pedidos.model.Pedido;
import com.gasvolcan.pedidos.model.TipoCliente;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        String numero,
        String codigo,
        LocalDateTime fecha,
        EstadoPedido estado,
        TipoCliente tipoCliente,
        ClienteDto cliente,
        DireccionDto direccion,
        List<ItemResponse> items,
        Integer total
) {
    public static PedidoResponse de(Pedido p) {
        DireccionEntrega d = p.getDireccion();
        return new PedidoResponse(
                p.getId(),
                p.getNumero(),
                p.getCodigo(),
                p.getFecha(),
                p.getEstado(),
                p.getTipoCliente(),
                new ClienteDto(p.getClienteNombre(), p.getClienteApellidos(), p.getClienteCorreo()),
                new DireccionDto(d.getCalle(), d.getNumeroCalle(), d.getTipo(), d.getDepto(),
                        d.getRegion(), d.getComuna(), d.getIndicaciones()),
                p.getDetalles().stream().map(ItemResponse::de).toList(),
                p.getTotal());
    }
}
