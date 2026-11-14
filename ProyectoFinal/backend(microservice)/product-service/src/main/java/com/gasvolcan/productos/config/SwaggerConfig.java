package com.gasvolcan.productos.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String ESQUEMA = "bearerAuth";

    // El esquema "bearerAuth" hace aparecer el botón Authorize en Swagger para pegar el JWT
    // y probar los endpoints protegidos (crear, editar, desactivar y activar productos).
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Product Service - Gas El Volcán")
                        .version("1.0")
                        .description("API de catálogo de productos, categorías y control de stock."))
                .components(new Components().addSecuritySchemes(ESQUEMA,
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA));
    }
}
