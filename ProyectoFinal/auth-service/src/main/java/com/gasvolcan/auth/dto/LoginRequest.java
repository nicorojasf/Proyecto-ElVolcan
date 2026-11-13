package com.gasvolcan.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Ingresa tu correo.") String email,
        @NotBlank(message = "Ingresa tu contraseña.") String password
) {
}
