package com.gasvolcan.pedidos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Una línea del pedido. Guarda una copia del nombre y del precio cobrado: el historial no cambia si el catálogo cambia. */
@Entity
@Table(name = "detalle_pedido")
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @Column(name = "codigo_producto", nullable = false, length = 20)
    private String codigoProducto;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 200)
    private String img;

    @Column(name = "precio_unitario", nullable = false)
    private Integer precioUnitario;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Integer subtotal;

    /** Se marca al devolver el stock de esta línea (pedido cancelado), para no devolverlo dos veces. */
    @Column(name = "stock_restaurado", nullable = false)
    private boolean stockRestaurado = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }

    public String getCodigoProducto() { return codigoProducto; }
    public void setCodigoProducto(String codigoProducto) { this.codigoProducto = codigoProducto; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }

    public Integer getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(Integer precioUnitario) { this.precioUnitario = precioUnitario; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Integer getSubtotal() { return subtotal; }
    public void setSubtotal(Integer subtotal) { this.subtotal = subtotal; }

    public boolean isStockRestaurado() { return stockRestaurado; }
    public void setStockRestaurado(boolean stockRestaurado) { this.stockRestaurado = stockRestaurado; }
}
