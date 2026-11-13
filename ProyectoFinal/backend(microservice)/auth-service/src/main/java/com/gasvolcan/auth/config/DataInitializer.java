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
 * Crea la cuenta ADMIN al iniciar, si no existe. El correo y la clave vienen de variables
 * de entorno (ADMIN_EMAIL / ADMIN_PASSWORD); si faltan, no se crea ningún admin.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminNombre;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.admin.email:}") String adminEmail,
                           @Value("${app.admin.password:}") String adminPassword,
                           @Value("${app.admin.nombre:Administrador}") String adminNombre) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminNombre = adminNombre;
    }

    @Override
    public void run(String... args) {
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.warn("ADMIN_EMAIL / ADMIN_PASSWORD no definidos: no se creó cuenta de administrador.");
            return;
        }

        String email = adminEmail.trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            return;
        }

        Usuario admin = new Usuario();
        admin.setNombre(adminNombre);
        admin.setEmail(email);
        admin.setTelefono("900000000");
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRol(Rol.ADMIN);
        admin.setTipoCliente(TipoCliente.COMERCIAL);
        usuarioRepository.save(admin);
        log.info("Cuenta de administrador creada: {}", email);
    }
}
