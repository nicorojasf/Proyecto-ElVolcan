package com.gasvolcan.pedidos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos de contacto de quien recibe. Mismas reglas que el Checkout de React. */
public record ClienteDto(
        @NotBlank(message = "Ingresa tu nombre.")
        @Size(max = 100, message = "El nombre es demasiado largo.")
        String nombre,

        @NotBlank(message = "Ingresa tus apellidos.")
        @Size(max = 100, message = "Los apellidos son demasiado largos.")
        String apellidos,

        @NotBlank(message = "Ingresa tu correo.")
        @Email(message = "Ingresa un correo válido.")
        @Size(max = 120, message = "El correo es demasiado largo.")
        String correo
) {
}
