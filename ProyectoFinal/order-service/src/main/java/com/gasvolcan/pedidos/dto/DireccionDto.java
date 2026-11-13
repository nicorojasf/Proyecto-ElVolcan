package com.gasvolcan.pedidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Misma forma que la dirección del frontend: calle, numero, tipo, depto, region, comuna, indicaciones. */
public record DireccionDto(
        @NotBlank(message = "Ingresa el nombre de la calle.")
        @Size(min = 3, max = 150, message = "La calle debe tener entre 3 y 150 caracteres.")
        String calle,

        @NotBlank(message = "Ingresa el número.")
        @Pattern(regexp = "^\\d{1,6}$", message = "Ingresa el número (solo dígitos).")
        String numero,

        @NotBlank(message = "Indica si es casa o departamento.")
        @Pattern(regexp = "^(casa|departamento)$", message = "El tipo debe ser 'casa' o 'departamento'.")
        String tipo,

        @Size(max = 30, message = "El número de departamento es demasiado largo.")
        String depto,

        @NotBlank(message = "Selecciona una región.")
        @Size(max = 100, message = "La región es demasiado larga.")
        String region,

        @NotBlank(message = "Selecciona una comuna.")
        @Size(max = 100, message = "La comuna es demasiado larga.")
        String comuna,

        @Size(max = 300, message = "Las indicaciones son demasiado largas (máximo 300).")
        String indicaciones
) {
}
