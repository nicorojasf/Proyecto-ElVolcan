package com.gasvolcan.auth.dto;

import com.gasvolcan.auth.model.Rol;
import com.gasvolcan.auth.model.TipoCliente;
import com.gasvolcan.auth.model.Usuario;

public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        String telefono,
        Rol rol,
        TipoCliente tipoCliente
) {
    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getTelefono(),
                u.getRol(), u.getTipoCliente());
    }
}
