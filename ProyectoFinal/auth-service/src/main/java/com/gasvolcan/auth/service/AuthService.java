package com.gasvolcan.auth.service;

import com.gasvolcan.auth.dto.LoginRequest;
import com.gasvolcan.auth.dto.LoginResponse;
import com.gasvolcan.auth.dto.RegistroRequest;
import com.gasvolcan.auth.dto.UsuarioResponse;
import com.gasvolcan.auth.exception.DatosInvalidosException;
import com.gasvolcan.auth.exception.EmailDuplicadoException;
import com.gasvolcan.auth.exception.NoAutorizadoException;
import com.gasvolcan.auth.exception.RecursoNoEncontradoException;
import com.gasvolcan.auth.model.Rol;
import com.gasvolcan.auth.model.TipoCliente;
import com.gasvolcan.auth.model.Usuario;
import com.gasvolcan.auth.repository.UsuarioRepository;
import com.gasvolcan.auth.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class AuthService {

    /** BCrypt solo considera los primeros 72 bytes de la contraseña. */
    private static final int MAX_BYTES_PASSWORD = 72;
    public static final String MSG_CREDENCIALES = "Correo o contraseña incorrectos.";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    // Hash de relleno: se compara cuando el correo no existe para que login tarde parecido
    // exista o no la cuenta (evita adivinar qué correos están registrados midiendo tiempos).
    private final String hashRelleno;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.hashRelleno = passwordEncoder.encode("relleno-no-es-una-clave-real");
    }

    // Sin @Transactional a propósito: si el INSERT choca con el índice único,
    // la excepción se captura aquí y no debe dejar una transacción marcada como rollback.
    public UsuarioResponse registrar(RegistroRequest req) {
        if (req.password().getBytes(StandardCharsets.UTF_8).length > MAX_BYTES_PASSWORD) {
            throw new DatosInvalidosException("La contraseña es demasiado larga.");
        }

        String email = normalizar(req.email());
        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailDuplicadoException();
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(req.nombre().trim());
        usuario.setEmail(email);
        usuario.setTelefono(req.telefono());
        usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        usuario.setRol(Rol.CLIENTE); // nunca viene del cliente
        usuario.setTipoCliente(req.tipoCliente() != null ? req.tipoCliente() : TipoCliente.RESIDENCIAL);

        try {
            return UsuarioResponse.de(usuarioRepository.saveAndFlush(usuario));
        } catch (DataIntegrityViolationException e) {
            // Dos registros simultáneos con el mismo correo: gana uno, el otro cae aquí
            throw new EmailDuplicadoException();
        }
    }

    public LoginResponse login(LoginRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(normalizar(req.email())).orElse(null);

        String hash = usuario != null ? usuario.getPasswordHash() : hashRelleno;
        boolean coincide = passwordEncoder.matches(req.password(), hash);
        if (usuario == null || !coincide) {
            throw new NoAutorizadoException(MSG_CREDENCIALES);
        }

        JwtService.TokenEmitido emitido = jwtService.emitir(usuario);
        return new LoginResponse(emitido.token(), "Bearer", emitido.expiraEnSegundos(), UsuarioResponse.de(usuario));
    }

    public UsuarioResponse perfil(String email) {
        return usuarioRepository.findByEmail(normalizar(email))
                .map(UsuarioResponse::de)
                .orElseThrow(() -> new NoAutorizadoException("La sesión ya no es válida."));
    }

    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::de).toList();
    }

    public void eliminar(Long id, String emailSolicitante) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario " + id));
        if (usuario.getEmail().equalsIgnoreCase(emailSolicitante)) {
            throw new DatosInvalidosException("No puedes eliminar tu propia cuenta.");
        }
        usuarioRepository.delete(usuario);
    }

    private String normalizar(String email) {
        return email.trim().toLowerCase();
    }
}
