package com.gasvolcan.pedidos.dto;

import com.gasvolcan.pedidos.model.DetallePedido;

/** Mismos nombres que los items que usa el frontend (codigo, nombre, img, precio, cantidad, subtotal). */
public record ItemResponse(
        String codigo,
        String nombre,
        String img,
        Integer precio,
        Integer cantidad,
        Integer subtotal
) {
    public static ItemResponse de(DetallePedido d) {
        return new ItemResponse(d.getCodigoProducto(), d.getNombre(), d.getImg(),
                d.getPrecioUnitario(), d.getCantidad(), d.getSubtotal());
    }
}
