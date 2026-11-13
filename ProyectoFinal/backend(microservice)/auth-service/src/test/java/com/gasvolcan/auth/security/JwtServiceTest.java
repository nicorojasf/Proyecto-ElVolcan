package com.gasvolcan.auth.security;

import com.gasvolcan.auth.model.Rol;
import com.gasvolcan.auth.model.TipoCliente;
import com.gasvolcan.auth.model.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import javax.crypto.SecretKey;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRETO = "clave-de-prueba-con-mas-de-32-caracteres-ok";

    private Usuario usuario() {
        Usuario u = new Usuario();
        u.setId(7L);
        u.setNombre("Ana Pérez");
        u.setEmail("ana@correo.cl");
        u.setRol(Rol.CLIENTE);
        u.setTipoCliente(TipoCliente.COMERCIAL);
        return u;
    }

    @Test
    @DisplayName("El token emitido se puede verificar y trae los claims esperados")
    void tokenContieneClaims() {
        JwtConfig cfg = new JwtConfig();
        SecretKey clave = cfg.jwtSecretKey(SECRETO);
        JwtService servicio = new JwtService(cfg.jwtEncoder(clave), 60);
        JwtDecoder decoder = cfg.jwtDecoder(clave);

        JwtService.TokenEmitido emitido = servicio.emitir(usuario());
        Jwt jwt = decoder.decode(emitido.token());

        assertEquals("ana@correo.cl", jwt.getSubject());
        assertEquals("CLIENTE", jwt.getClaimAsString("rol"));
        assertEquals("COMERCIAL", jwt.getClaimAsString("tipoCliente"));
        assertEquals(7L, ((Number) jwt.getClaim("uid")).longValue());
        assertEquals(3600L, emitido.expiraEnSegundos());
    }

    @Test
    @DisplayName("Un token firmado con otro secreto es rechazado")
    void tokenConOtroSecretoSeRechaza() {
        JwtConfig cfg = new JwtConfig();
        SecretKey clave = cfg.jwtSecretKey(SECRETO);
        SecretKey otra = cfg.jwtSecretKey("otro-secreto-distinto-de-mas-de-32-caracteres");
        String token = new JwtService(cfg.jwtEncoder(otra), 60).emitir(usuario()).token();

        assertThrows(JwtException.class, () -> cfg.jwtDecoder(clave).decode(token));
    }

    @Test
    @DisplayName("Un secreto menor a 32 caracteres impide arrancar")
    void secretoCortoSeRechaza() {
        JwtConfig cfg = new JwtConfig();
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> cfg.jwtSecretKey("corta"));
        assertTrue(ex.getMessage().contains("32"));
    }
}
