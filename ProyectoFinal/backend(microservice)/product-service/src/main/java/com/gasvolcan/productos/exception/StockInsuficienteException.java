package com.gasvolcan.productos.exception;

public class StockInsuficienteException extends RuntimeException {
    public StockInsuficienteException(String codigo, int disponible, int solicitado) {
        super("Stock insuficiente para " + codigo + ": disponible " + disponible + ", solicitado " + solicitado);
    }
}
