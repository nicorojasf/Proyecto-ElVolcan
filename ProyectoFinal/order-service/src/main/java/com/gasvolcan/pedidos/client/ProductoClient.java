package com.gasvolcan.pedidos.client;

/** Puerta de entrada a product-service. Es una interfaz para poder simularla en los tests. */
public interface ProductoClient {

    /** @throws com.gasvolcan.pedidos.exception.ProductoInvalidoException si el producto no existe o está desactivado */
    ProductoDto obtener(String codigo);

    /** Descuento atómico en product-service. @throws com.gasvolcan.pedidos.exception.StockInsuficienteException si no alcanza */
    void descontarStock(String codigo, int cantidad);

    /** Devuelve stock (pedido cancelado o compensación de un pedido fallido). */
    void aumentarStock(String codigo, int cantidad);
}
