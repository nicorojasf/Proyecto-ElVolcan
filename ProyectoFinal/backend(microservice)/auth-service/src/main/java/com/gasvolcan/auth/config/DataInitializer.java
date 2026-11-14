package com.gasvolcan.auth.config;

import com.gasvolcan.auth.model.Rol;
import com.gasvolcan.auth.model.TipoCliente;
import com.gasvolcan.auth.model.Usuario;
import com.gasvolcan.auth.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crea las cuentas ADMIN y VENDEDOR al iniciar, si no existen. Correo y clave vienen de variables
 * de entorno (ADMIN_EMAIL / ADMIN_PASSWORD y VENDEDOR_EMAIL / VENDEDOR_PASSWORD); si faltan, no se crea esa cuenta.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminNombre;
    private final String vendedorEmail;
    private final String vendedorPassword;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.admin.email:}") String adminEmail,
                           @Value("${app.admin.password:}") String adminPassword,
                           @Value("${app.admin.nombre:Administrador}") String adminNombre,
                           @Value("${app.vendedor.email:}") String vendedorEmail,
                           @Value("${app.vendedor.password:}") String vendedorPassword) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminNombre = adminNombre;
        this.vendedorEmail = vendedorEmail;
        this.vendedorPassword = vendedorPassword;
    }

    @Override
    public void run(String... args) {
        crearSiNoExiste(adminEmail, adminPassword, adminNombre, "900000000", Rol.ADMIN);
        crearSiNoExiste(vendedorEmail, vendedorPassword, "Vendedor", "900000001", Rol.VENDEDOR);
    }

    private void crearSiNoExiste(String correo, String clave, String nombre, String telefono, Rol rol) {
        if (correo.isBlank() || clave.isBlank()) {
            log.warn("Sin correo/clave para el rol {}: no se creó esa cuenta.", rol);
            return;
        }

        String email = correo.trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            return;
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        usuario.setTelefono(telefono);
        usuario.setPasswordHash(passwordEncoder.encode(clave));
        usuario.setRol(rol);
        usuario.setTipoCliente(TipoCliente.COMERCIAL);
        usuarioRepository.save(usuario);
        log.info("Cuenta {} creada: {}", rol, email);
    }
}
