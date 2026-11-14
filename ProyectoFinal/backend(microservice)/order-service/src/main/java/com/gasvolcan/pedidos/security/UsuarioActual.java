package com.gasvolcan.pedidos.security;

import com.gasvolcan.pedidos.exception.NoAutorizadoException;
import com.gasvolcan.pedidos.model.TipoCliente;
import org.springframework.security.oauth2.jwt.Jwt;

/** Datos del dueño del token (los emite auth-service): uid, sub (correo), rol y tipoCliente. */
public record UsuarioActual(Long id, String email, boolean admin, boolean vendedor, TipoCliente tipoCliente) {

    /** ADMIN y VENDEDOR pueden consultar los pedidos de cualquier cliente (el vendedor solo en lectura). */
    public boolean puedeVerTodos() {
        return admin || vendedor;
    }

    public static UsuarioActual de(Jwt jwt) {
        Object uid = jwt.getClaim("uid");
        if (!(uid instanceof Number numero)) {
            throw new NoAutorizadoException("El token no trae el id del usuario.");
        }
        return new UsuarioActual(
                numero.longValue(),
                jwt.getSubject(),
                "ADMIN".equals(jwt.getClaimAsString("rol")),
                "VENDEDOR".equals(jwt.getClaimAsString("rol")),
                TipoCliente.desde(jwt.getClaimAsString("tipoCliente")));
    }
}
