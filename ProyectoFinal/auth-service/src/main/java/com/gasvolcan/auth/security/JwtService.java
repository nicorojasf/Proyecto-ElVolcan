package com.gasvolcan.auth.security;

import com.gasvolcan.auth.model.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

/**
 * Emite el JWT. Claims que usarán el gateway y order-service:
 * sub = email, uid = id, nombre, rol (CLIENTE | ADMIN) y tipoCliente (RESIDENCIAL | COMERCIAL).
 */
@Service
public class JwtService {

    public static final String EMISOR = "gasvolcan-auth-service";

    public record TokenEmitido(String token, Instant expiraEn, long expiraEnSegundos) {
    }

    private final JwtEncoder encoder;
    private final long minutosExpiracion;

    public JwtService(JwtEncoder encoder, @Value("${jwt.expiration-minutes}") long minutosExpiracion) {
        this.encoder = encoder;
        this.minutosExpiracion = minutosExpiracion;
    }

    public TokenEmitido emitir(Usuario usuario) {
        Instant ahora = Instant.now();
        Duration vigencia = Duration.ofMinutes(minutosExpiracion);
        Instant expira = ahora.plus(vigencia);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(EMISOR)
                .subject(usuario.getEmail())
                .issuedAt(ahora)
                .expiresAt(expira)
                .claim("uid", usuario.getId())
                .claim("nombre", usuario.getNombre())
                .claim("rol", usuario.getRol().name())
                .claim("tipoCliente", usuario.getTipoCliente().name())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new TokenEmitido(token, expira, vigencia.toSeconds());
    }
}
