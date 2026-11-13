package com.gasvolcan.productos.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String mensaje,
        Map<String, String> detalles
) {
    public static ErrorResponse of(int status, String error, String mensaje) {
        return new ErrorResponse(LocalDateTime.now(), status, error, mensaje, null);
    }

    public static ErrorResponse of(int status, String error, String mensaje, Map<String, String> detalles) {
        return new ErrorResponse(LocalDateTime.now(), status, error, mensaje, detalles);
    }
}
