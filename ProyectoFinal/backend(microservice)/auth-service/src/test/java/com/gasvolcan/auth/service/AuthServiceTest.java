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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private UsuarioRepository repo;
    private JwtService jwtService;
    private PasswordEncoder encoder;
    private AuthService service;

    @BeforeEach
    void preparar() {
        repo = mock(UsuarioRepository.class);
        jwtService = mock(JwtService.class);
        encoder = new BCryptPasswordEncoder();
        service = new AuthService(repo, encoder, jwtService);
    }

    private RegistroRequest registro(String email, TipoCliente tipo) {
        return new RegistroRequest("  Ana Pérez ", email, "912345678", "Clave1234", tipo);
    }

    @Test
    @DisplayName("Registrar guarda al usuario como CLIENTE con la clave cifrada y el correo en minúsculas")
    void registrarGuardaCliente() {
        when(repo.existsByEmail("ana@correo.cl")).thenReturn(false);
        when(repo.saveAndFlush(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponse resp = service.registrar(registro(" Ana@Correo.cl ", null));

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(repo).saveAndFlush(captor.capture());
        Usuario guardado = captor.getValue();
        assertEquals("ana@correo.cl", guardado.getEmail());
        assertEquals("Ana Pérez", guardado.getNombre());
        assertEquals(Rol.CLIENTE, guardado.getRol());
        assertEquals(TipoCliente.RESIDENCIAL, guardado.getTipoCliente());
        assertNotEquals("Clave1234", guardado.getPasswordHash());
        assertTrue(encoder.matches("Clave1234", guardado.getPasswordHash()));
        assertEquals("ana@correo.cl", resp.email());
    }

    @Test
    @DisplayName("Registrar respeta el tipo de cliente COMERCIAL")
    void registrarComercial() {
        when(repo.existsByEmail("ana@correo.cl")).thenReturn(false);
        when(repo.saveAndFlush(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponse resp = service.registrar(registro("ana@correo.cl", TipoCliente.COMERCIAL));

        assertEquals(TipoCliente.COMERCIAL, resp.tipoCliente());
    }

    @Test
    @DisplayName("Registrar con un correo existente lanza conflicto y no guarda")
    void registrarDuplicado() {
        when(repo.existsByEmail("ana@correo.cl")).thenReturn(true);

        assertThrows(EmailDuplicadoException.class, () -> service.registrar(registro("ana@correo.cl", null)));
        verify(repo, never()).saveAndFlush(any(Usuario.class));
    }

    private Usuario existente() {
        Usuario u = new Usuario();
        u.setId(1L);
        u.setNombre("Ana");
        u.setEmail("ana@correo.cl");
        u.setTelefono("912345678");
        u.setPasswordHash(encoder.encode("Clave1234"));
        return u;
    }

    @Test
    @DisplayName("Login correcto devuelve el token y los datos del usuario")
    void loginOk() {
        Usuario u = existente();
        when(repo.findByEmail("ana@correo.cl")).thenReturn(Optional.of(u));
        when(jwtService.emitir(u)).thenReturn(new JwtService.TokenEmitido("tok", Instant.now(), 7200));

        LoginResponse resp = service.login(new LoginRequest("Ana@correo.cl", "Clave1234"));

        assertEquals("tok", resp.token());
        assertEquals("Bearer", resp.tipo());
        assertEquals(7200, resp.expiraEnSegundos());
        assertEquals("ana@correo.cl", resp.usuario().email());
    }

    @Test
    @DisplayName("Login con clave incorrecta o correo inexistente da el mismo error")
    void loginFalla() {
        when(repo.findByEmail("ana@correo.cl")).thenReturn(Optional.of(existente()));
        when(repo.findByEmail("nadie@correo.cl")).thenReturn(Optional.empty());

        NoAutorizadoException malaClave = assertThrows(NoAutorizadoException.class,
                () -> service.login(new LoginRequest("ana@correo.cl", "otra")));
        NoAutorizadoException sinCuenta = assertThrows(NoAutorizadoException.class,
                () -> service.login(new LoginRequest("nadie@correo.cl", "Clave1234")));

        assertEquals(malaClave.getMessage(), sinCuenta.getMessage());
        verify(jwtService, never()).emitir(any(Usuario.class));
    }

    @Test
    @DisplayName("Eliminar borra al usuario cuando lo pide otra persona")
    void eliminarOk() {
        Usuario u = existente();
        when(repo.findById(1L)).thenReturn(Optional.of(u));

        service.eliminar(1L, "admin@admin.cl");

        verify(repo).delete(u);
    }

    @Test
    @DisplayName("Eliminar un id inexistente lanza 'no encontrado'")
    void eliminarInexistente() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> service.eliminar(99L, "admin@admin.cl"));
        verify(repo, never()).delete(any(Usuario.class));
    }

    @Test
    @DisplayName("Nadie puede eliminar su propia cuenta")
    void eliminarPropiaCuenta() {
        when(repo.findById(1L)).thenReturn(Optional.of(existente()));

        assertThrows(DatosInvalidosException.class, () -> service.eliminar(1L, "Ana@Correo.cl"));
        verify(repo, never()).delete(any(Usuario.class));
    }
}
