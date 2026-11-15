package com.gasvolcan.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API Gateway de Gas El Volcán: único punto de entrada para el frontend (puerto 8080).
 * Solo enruta: cada microservicio sigue validando el JWT por su cuenta (mismo JWT_SECRET)
 * y respondiendo su propio CORS. Las rutas están en application.yml.
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
