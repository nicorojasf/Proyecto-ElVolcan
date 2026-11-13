package com.gasvolcan.productos.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categorias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Parte de la URL del frontend: /productos/:slug */
    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    /** Clase de bootstrap-icons, ej: bi-fire */
    @Column(nullable = false, length = 50)
    private String icono;
}
