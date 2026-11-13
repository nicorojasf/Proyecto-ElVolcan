package com.gasvolcan.auth.exception;

public class NoAutorizadoException extends RuntimeException {
    public NoAutorizadoException(String mensaje) {
        super(mensaje);
    }
}
