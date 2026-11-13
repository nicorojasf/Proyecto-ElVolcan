package com.gasvolcan.pedidos.model;

/** Viene en el JWT (claim tipoCliente) y decide qué precio se cobra. */
public enum TipoCliente {
    RESIDENCIAL,
    COMERCIAL;

    public static TipoCliente desde(String valor) {
        try {
            return valor == null ? RESIDENCIAL : valueOf(valor);
        } catch (IllegalArgumentException e) {
            return RESIDENCIAL;
        }
    }
}
