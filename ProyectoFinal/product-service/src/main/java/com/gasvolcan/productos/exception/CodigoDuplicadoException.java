package com.gasvolcan.productos.exception;

public class CodigoDuplicadoException extends RuntimeException {
    public CodigoDuplicadoException(String codigo) {
        super("Ya existe un producto con el código " + codigo);
    }
}
