package com.gasvolcan.auth.controller;

import com.gasvolcan.auth.dto.LoginRequest;
import com.gasvolcan.auth.dto.LoginResponse;
import com.gasvolcan.auth.dto.RegistroRequest;
import com.gasvolcan.auth.dto.UsuarioResponse;
import com.gasvolcan.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Registra un cliente nuevo (rol CLIENTE)")
    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse registro(@Valid @RequestBody RegistroRequest request) {
        return authService.registrar(request);
    }

    @Operation(summary = "Inicia sesión y devuelve el JWT")
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "Renueva el token: con un JWT vigente entrega uno nuevo (sesión deslizante)")
    @PostMapping("/refresh")
    public LoginResponse refresh(@AuthenticationPrincipal Jwt jwt) {
        return authService.renovar(jwt.getSubject());
    }

    @Operation(summary = "Datos del usuario dueño del token (incluye tipo de cliente)")
    @GetMapping("/perfil")
    public UsuarioResponse perfil(@AuthenticationPrincipal Jwt jwt) {
        return authService.perfil(jwt.getSubject());
    }

    @Operation(summary = "Lista de usuarios (solo ADMIN)")
    @GetMapping("/usuarios")
    public List<UsuarioResponse> usuarios() {
        return authService.listar();
    }

    @Operation(summary = "Elimina un usuario (solo ADMIN)")
    @DeleteMapping("/usuarios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        authService.eliminar(id, jwt.getSubject());
    }
}
