package com.gasvolcan.productos.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Catálogo y categorías: públicos (GET). Crear/editar/desactivar productos: ADMIN.
 * Stock (descontar/aumentar): ADMIN o la clave interna de order-service.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtDecoder jwtDecoder,
                                           @Value("${app.internal.key}") String claveInterna) throws Exception {
        // El claim "rol" (CLIENTE | VENDEDOR | ADMIN) se convierte en la autoridad ROLE_CLIENTE / ROLE_ADMIN
        JwtGrantedAuthoritiesConverter autoridades = new JwtGrantedAuthoritiesConverter();
        autoridades.setAuthoritiesClaimName("rol");
        autoridades.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter convertidor = new JwtAuthenticationConverter();
        convertidor.setJwtGrantedAuthoritiesConverter(autoridades);

        http
                .csrf(csrf -> csrf.disable()) // API stateless con JWT en cabecera: no hay cookies de sesión
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new InternalKeyFilter(claveInterna), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Esta regla va ANTES del GET público: los desactivados son solo del ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/v1/productos/desactivados").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/productos/**", "/api/v1/categorias/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/productos/*/stock/*").hasAnyRole("ADMIN", "INTERNAL")
                        .requestMatchers(HttpMethod.POST, "/api/v1/productos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/productos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/productos/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> {
                    oauth.jwt(jwt -> jwt.decoder(jwtDecoder).jwtAuthenticationConverter(convertidor));
                    oauth.authenticationEntryPoint((req, res, ex) ->
                            escribir(res, HttpStatus.UNAUTHORIZED, "Token ausente, inválido o vencido"));
                    oauth.accessDeniedHandler((req, res, ex) ->
                            escribir(res, HttpStatus.FORBIDDEN, "No tienes permisos para esta acción"));
                });

        return http.build();
    }

    /** Solo mientras React llame directo a este servicio. Con el Gateway, el CORS vive allá. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") List<String> origenes) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origenes);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/api/**", config);
        return fuente;
    }

    // Los mensajes son fijos (sin datos del usuario), por eso es seguro armar el JSON a mano.
    private static void escribir(HttpServletResponse res, HttpStatus status, String mensaje) throws IOException {
        res.setStatus(status.value());
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"timestamp\":\"" + LocalDateTime.now() + "\",\"status\":" + status.value()
                + ",\"error\":\"" + status.getReasonPhrase() + "\",\"mensaje\":\"" + mensaje
                + "\",\"detalles\":null}");
    }
}
