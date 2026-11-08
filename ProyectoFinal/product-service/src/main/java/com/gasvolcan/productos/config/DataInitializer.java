package com.gasvolcan.productos.config;

import com.gasvolcan.productos.model.Categoria;
import com.gasvolcan.productos.model.Producto;
import com.gasvolcan.productos.repository.CategoriaRepository;
import com.gasvolcan.productos.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Carga el catálogo de src/data/productos.js solo si la base está vacía. */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoriaRepository categorias;
    private final ProductoRepository productos;

    public DataInitializer(CategoriaRepository categorias, ProductoRepository productos) {
        this.categorias = categorias;
        this.productos = productos;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (categorias.count() > 0 || productos.count() > 0) {
            return;
        }

        Categoria cilindros   = categorias.save(cat("cilindros",   "Cilindros de Gas",       "bi-fire"));
        Categoria reguladores = categorias.save(cat("reguladores", "Reguladores",            "bi-speedometer2"));
        Categoria mangueras   = categorias.save(cat("mangueras",   "Mangueras y Conexiones", "bi-tools"));
        Categoria accesorios  = categorias.save(cat("accesorios",  "Accesorios",             "bi-grid-fill"));

        // Cilindros de Gas
        productos.save(prod("CL001", cilindros, "Cilindro GLP 5 kg",
                "Cilindro de gas licuado de petróleo 5 kg. Para uso residencial (cocina, calefacción pequeña).",
                "Unidad", 6500, 6000, 80, "/imagenes/c5k.png"));
        productos.save(prod("CL002", cilindros, "Cilindro GLP 11 kg",
                "Cilindro estándar doméstico. El más utilizado en hogares chilenos. Compatible con reguladores estándar.",
                "Unidad", 12000, 11000, 200, "/imagenes/c11k.png"));
        productos.save(prod("CL003", cilindros, "Cilindro GLP 15 kg",
                "Cilindro de mayor capacidad para hogares de alto consumo o locales pequeños.",
                "Unidad", 16000, 14500, 90, "/imagenes/c15k.png"));
        productos.save(prod("CL004", cilindros, "Cilindro GLP 45 kg",
                "Cilindro industrial. Uso comercial: restaurantes, talleres, calefacción de locales.",
                "Unidad", 45000, 40000, 30, "/imagenes/c45k.png"));

        // Reguladores
        productos.save(prod("RG001", reguladores, "Regulador doméstico estándar",
                "Regulador de 1 etapa para cilindros 5, 11 y 15 kg. Presión de salida 28 mbar.",
                "Unidad", 8990, 8200, 45, "/imagenes/rg001.png"));
        productos.save(prod("RG002", reguladores, "Regulador de alta presión",
                "Regulador para cocinas industriales o equipos de mayor consumo. Presión regulable.",
                "Unidad", 18990, 17000, 12, "/imagenes/rg002.png"));
        productos.save(prod("RG003", reguladores, "Regulador dual (2 salidas)",
                "Permite conectar dos artefactos simultáneamente al mismo cilindro.",
                "Unidad", 14990, 13500, 18, "/imagenes/rg003.png"));

        // Mangueras y Conexiones
        productos.save(prod("MG001", mangueras, "Manguera gas 1.5 m",
                "Manguera flexible homologada. Diámetro interior 9mm. Compatible con reguladores estándar.",
                "Unidad", 3990, 3500, 80, "/imagenes/mg001.png"));
        productos.save(prod("MG002", mangueras, "Manguera gas 3 m",
                "Manguera larga para instalaciones donde el artefacto está alejado del cilindro.",
                "Unidad", 6990, 6200, 50, "/imagenes/mg002.png"));
        productos.save(prod("MG003", mangueras, "Abrazadera metálica",
                "Abrazadera de acero para asegurar la conexión manguera-regulador y manguera-artefacto.",
                "Unidad", 990, 800, 200, "/imagenes/mg003.png"));
        productos.save(prod("MG004", mangueras, "Kit conexión completo (regulador + manguera 1.5m + abrazaderas)",
                "Todo lo necesario para instalar un cilindro nuevo.",
                "Kit", 12990, 11500, 25, "/imagenes/mg004.png"));

        // Accesorios
        productos.save(prod("AC001", accesorios, "Carro porta cilindro 11/15 kg",
                "Carro metálico con ruedas para transportar cilindros dentro del hogar con seguridad.",
                "Unidad", 12990, 11000, 20, "/imagenes/ac001.png"));
        productos.save(prod("AC002", accesorios, "Tapa protectora para válvula",
                "Tapa de plástico ABS para proteger la válvula del cilindro durante el transporte.",
                "Unidad", 1490, 1200, 60, "/imagenes/ac002.png"));
        productos.save(prod("AC003", accesorios, "Detector de gas a batería",
                "Sensor electroquímico. Alarma sonora y visual ante fuga de gas GLP o metano.",
                "Unidad", 19990, 17000, 8, "/imagenes/ac003.png"));

        log.info("Catálogo inicial cargado: {} categorías y {} productos", categorias.count(), productos.count());
    }

    private Categoria cat(String slug, String nombre, String icono) {
        return Categoria.builder().slug(slug).nombre(nombre).icono(icono).build();
    }

    private Producto prod(String codigo, Categoria categoria, String nombre, String descripcion,
                          String unidad, int precioRes, int precioCom, int stock, String img) {
        return Producto.builder()
                .codigo(codigo).categoria(categoria).nombre(nombre).descripcion(descripcion)
                .unidad(unidad).precioResidencial(precioRes).precioComercial(precioCom)
                .stock(stock).img(img).activo(true)
                .build();
    }
}
