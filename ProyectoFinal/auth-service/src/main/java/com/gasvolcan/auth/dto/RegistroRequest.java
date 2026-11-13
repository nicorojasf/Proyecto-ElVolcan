package com.gasvolcan.auth.dto;

import com.gasvolcan.auth.model.TipoCliente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos de registro. No incluye el rol a propósito: toda cuenta nueva es CLIENTE.
 * Las reglas son las mismas que valida hoy el formulario de React.
 */
public record RegistroRequest(
        @NotBlank(message = "Ingresa tu nombre.")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres.")
        String nombre,

        @NotBlank(message = "Ingresa tu correo.")
        @Email(message = "Ingresa un correo válido.")
        @Size(max = 120, message = "El correo es demasiado largo.")
        String email,

        @NotBlank(message = "Ingresa tu teléfono.")
        @Pattern(regexp = "^9\\d{8}$", message = "Ingresa un celular de 9 dígitos que comience con 9.")
        String telefono,

        @NotBlank(message = "Ingresa una contraseña.")
        @Size(min = 6, max = 72, message = "La contraseña debe tener entre 6 y 72 caracteres.")
        String password,

        /** Opcional. Si no viene, el cliente se crea como RESIDENCIAL. */
        TipoCliente tipoCliente
) {
}
