package com.gasvolcan.pedidos.controller;

import com.gasvolcan.pedidos.dto.CambiarEstadoRequest;
import com.gasvolcan.pedidos.dto.CrearPedidoRequest;
import com.gasvolcan.pedidos.dto.PedidoResponse;
import com.gasvolcan.pedidos.model.EstadoPedido;
import com.gasvolcan.pedidos.security.UsuarioActual;
import com.gasvolcan.pedidos.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
@Tag(name = "Pedidos", description = "Compras de Gas El Volcán")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @Operation(summary = "Crea un pedido (solo código y cantidad por producto) y descuenta el stock")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponse crear(@Valid @RequestBody CrearPedidoRequest request, @AuthenticationPrincipal Jwt jwt) {
        return pedidoService.crear(request, UsuarioActual.de(jwt));
    }

    @Operation(summary = "Historial de pedidos del usuario con sesión")
    @GetMapping("/mis-pedidos")
    public List<PedidoResponse> misPedidos(@AuthenticationPrincipal Jwt jwt) {
        return pedidoService.misPedidos(UsuarioActual.de(jwt));
    }

    @Operation(summary = "Todos los pedidos, opcionalmente filtrados por estado (ADMIN o VENDEDOR)")
    @GetMapping
    public List<PedidoResponse> listar(@RequestParam(required = false) EstadoPedido estado) {
        return pedidoService.listar(estado);
    }

    @Operation(summary = "Detalle de un pedido: el dueño, un VENDEDOR o un ADMIN")
    @GetMapping("/{id}")
    public PedidoResponse obtener(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return pedidoService.obtener(id, UsuarioActual.de(jwt));
    }

    @Operation(summary = "Cambia el estado (PENDIENTE > CONFIRMADO > EN_CAMINO > ENTREGADO, o CANCELADO) (solo ADMIN)")
    @PutMapping("/{id}/estado")
    public PedidoResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambiarEstadoRequest request) {
        return pedidoService.cambiarEstado(id, request.estado());
    }
}
