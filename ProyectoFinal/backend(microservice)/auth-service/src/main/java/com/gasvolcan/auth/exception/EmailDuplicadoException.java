package com.gasvolcan.auth.exception;

public class EmailDuplicadoException extends RuntimeException {
    public EmailDuplicadoException() {
        super("Este correo ya se encuentra registrado.");
    }
}
