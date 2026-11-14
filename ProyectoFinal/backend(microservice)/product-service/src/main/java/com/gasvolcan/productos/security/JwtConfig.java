package com.gasvolcan.productos.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Verifica (HS256) los JWT que firma auth-service. Debe usar exactamente el mismo JWT_SECRET.
 * Este servicio solo verifica; nunca emite tokens.
 */
@Configuration
public class JwtConfig {

    /** HS256 exige una clave de al menos 256 bits (32 bytes). */
    private static final int MIN_BYTES = 32;

    @Bean
    public SecretKey jwtSecretKey(@Value("${jwt.secret}") String secreto) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < MIN_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET debe tener al menos 32 caracteres (hoy tiene " + bytes.length + ").");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
        return NimbusJwtDecoder.withSecretKey(jwtSecretKey).macAlgorithm(MacAlgorithm.HS256).build();
    }
}
