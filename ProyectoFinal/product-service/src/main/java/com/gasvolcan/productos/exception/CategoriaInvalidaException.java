package com.gasvolcan.productos.exception;

public class CategoriaInvalidaException extends RuntimeException {
    public CategoriaInvalidaException(String nombre) {
        super("La categoría '" + nombre + "' no existe");
    }
}
