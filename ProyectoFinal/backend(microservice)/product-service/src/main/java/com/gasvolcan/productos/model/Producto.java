package com.gasvolcan.productos.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "productos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Código de negocio, el mismo que usa el frontend (CL001, RG001...) */
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, length = 30)
    private String unidad;

    /** Precios en pesos chilenos, sin decimales */
    @Column(name = "precio_residencial", nullable = false)
    private Integer precioResidencial;

    @Column(name = "precio_comercial", nullable = false)
    private Integer precioComercial;

    @Column(nullable = false)
    private Integer stock;

    @Column(length = 200)
    private String img;

    /** Borrado lógico: un producto desactivado no aparece en el catálogo */
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
