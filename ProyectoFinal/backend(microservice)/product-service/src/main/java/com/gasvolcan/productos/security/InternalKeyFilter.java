package com.gasvolcan.productos.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/**
 * Autentica las llamadas de servicio a servicio (order-service) que traen la cabecera X-Internal-Key
 * con la clave compartida. Les da el rol INTERNAL, que solo sirve para los endpoints de stock.
 * No es un bean a propósito: lo crea SecurityConfig y se ejecuta solo dentro de la cadena de seguridad.
 */
public class InternalKeyFilter extends OncePerRequestFilter {

    public static final String CABECERA = "X-Internal-Key";

    private final byte[] clave;

    public InternalKeyFilter(String clave) {
        this.clave = clave.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String recibida = request.getHeader(CABECERA);
        if (recibida != null && MessageDigest.isEqual(clave, recibida.getBytes(StandardCharsets.UTF_8))) {
            SecurityContext contexto = SecurityContextHolder.createEmptyContext();
            contexto.setAuthentication(new UsernamePasswordAuthenticationToken(
                    "order-service", null, List.of(new SimpleGrantedAuthority("ROLE_INTERNAL"))));
            SecurityContextHolder.setContext(contexto);
        }
        chain.doFilter(request, response);
    }
}
