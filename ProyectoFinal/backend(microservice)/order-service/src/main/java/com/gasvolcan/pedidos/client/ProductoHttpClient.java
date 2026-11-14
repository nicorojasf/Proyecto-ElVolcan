package com.gasvolcan.pedidos.client;

import com.gasvolcan.pedidos.exception.ProductoInvalidoException;
import com.gasvolcan.pedidos.exception.ServicioNoDisponibleException;
import com.gasvolcan.pedidos.exception.StockInsuficienteException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Component
public class ProductoHttpClient implements ProductoClient {

    private final RestClient restClient;

    public ProductoHttpClient(@Value("${app.productos.url}") String baseUrl,
                              @Value("${app.productos.internal-key}") String claveInterna) {
        HttpClient http = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory(http);
        fabrica.setReadTimeout(Duration.ofSeconds(5));
        this.restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(fabrica)
                .defaultHeader("X-Internal-Key", claveInterna).build();
    }

    @Override
    public ProductoDto obtener(String codigo) {
        try {
            ProductoDto producto = restClient.get()
                    .uri("/api/v1/productos/{codigo}", codigo)
                    .retrieve()
                    .body(ProductoDto.class);
            if (producto == null) {
                throw new ServicioNoDisponibleException("product-service devolvió una respuesta vacía.");
            }
            return producto;
        } catch (HttpClientErrorException e) {
            throw traducir(e, codigo);
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw noDisponible(e);
        }
    }

    @Override
    public void descontarStock(String codigo, int cantidad) {
        cambiarStock("descontar", codigo, cantidad);
    }

    @Override
    public void aumentarStock(String codigo, int cantidad) {
        cambiarStock("aumentar", codigo, cantidad);
    }

    private void cambiarStock(String operacion, String codigo, int cantidad) {
        try {
            restClient.put()
                    .uri("/api/v1/productos/{codigo}/stock/{operacion}", codigo, operacion)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"cantidad\":" + cantidad + "}")
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException e) {
            throw traducir(e, codigo);
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw noDisponible(e);
        }
    }

    private RuntimeException traducir(HttpClientErrorException e, String codigo) {
        int status = e.getStatusCode().value();
        if (status == 404) {
            return new ProductoInvalidoException("El producto " + codigo + " no existe o no está disponible.");
        }
        if (status == 409) {
            return new StockInsuficienteException("No hay stock suficiente de " + codigo + ".");
        }
        return new ServicioNoDisponibleException(
                "product-service rechazó la petición (HTTP " + status + ") para " + codigo + ".");
    }

    private ServicioNoDisponibleException noDisponible(Exception e) {
        return new ServicioNoDisponibleException(
                "No se pudo contactar a product-service. Intenta nuevamente en unos minutos.");
    }
}
