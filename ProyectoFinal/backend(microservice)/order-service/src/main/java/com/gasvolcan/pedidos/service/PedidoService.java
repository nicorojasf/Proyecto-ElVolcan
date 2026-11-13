package com.gasvolcan.pedidos.service;

import com.gasvolcan.pedidos.client.ProductoClient;
import com.gasvolcan.pedidos.client.ProductoDto;
import com.gasvolcan.pedidos.dto.CrearPedidoRequest;
import com.gasvolcan.pedidos.dto.DireccionDto;
import com.gasvolcan.pedidos.dto.ItemRequest;
import com.gasvolcan.pedidos.dto.PedidoResponse;
import com.gasvolcan.pedidos.exception.DatosInvalidosException;
import com.gasvolcan.pedidos.exception.EstadoInvalidoException;
import com.gasvolcan.pedidos.exception.ProductoInvalidoException;
import com.gasvolcan.pedidos.exception.RecursoNoEncontradoException;
import com.gasvolcan.pedidos.exception.ServicioNoDisponibleException;
import com.gasvolcan.pedidos.exception.StockInsuficienteException;
import com.gasvolcan.pedidos.model.DetallePedido;
import com.gasvolcan.pedidos.model.DireccionEntrega;
import com.gasvolcan.pedidos.model.EstadoPedido;
import com.gasvolcan.pedidos.model.Pedido;
import com.gasvolcan.pedidos.model.TipoCliente;
import com.gasvolcan.pedidos.repository.DetallePedidoRepository;
import com.gasvolcan.pedidos.repository.PedidoRepository;
import com.gasvolcan.pedidos.security.UsuarioActual;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Sin @Transactional a propósito: este servicio llama a product-service por red y no conviene
 * tener una transacción abierta esperando. Las escrituras atómicas viven en PedidoGuardador
 * y en las consultas "update" de los repositorios.
 */
@Service
public class PedidoService {

    private static final Logger log = LoggerFactory.getLogger(PedidoService.class);

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detalleRepository;
    private final PedidoGuardador guardador;
    private final ProductoClient productos;

    public PedidoService(PedidoRepository pedidoRepository,
                         DetallePedidoRepository detalleRepository,
                         PedidoGuardador guardador,
                         ProductoClient productos) {
        this.pedidoRepository = pedidoRepository;
        this.detalleRepository = detalleRepository;
        this.guardador = guardador;
        this.productos = productos;
    }

    // ------------------------------------------------------------------ crear

    public PedidoResponse crear(CrearPedidoRequest req, UsuarioActual usuario) {
        validarDireccion(req.direccion());
        Pedido pedido = armarPedido(req, usuario);

        // 1) Consultar precio y stock actuales (nunca se confía en lo que manda el cliente)
        int total = 0;
        for (Map.Entry<String, Integer> item : unirItems(req.items()).entrySet()) {
            String codigo = item.getKey();
            int cantidad = item.getValue();

            ProductoDto producto = productos.obtener(codigo);
            if (producto.stock() < cantidad) {
                throw new StockInsuficienteException("Stock insuficiente para " + codigo
                        + ": disponible " + producto.stock() + ", solicitado " + cantidad);
            }

            int precio = usuario.tipoCliente() == TipoCliente.COMERCIAL
                    ? producto.precioComercial() : producto.precioResidencial();
            DetallePedido detalle = new DetallePedido();
            detalle.setCodigoProducto(codigo);
            detalle.setNombre(producto.nombre());
            detalle.setImg(producto.img());
            detalle.setPrecioUnitario(precio);
            detalle.setCantidad(cantidad);
            detalle.setSubtotal(precio * cantidad);
            pedido.agregarDetalle(detalle);
            total += detalle.getSubtotal();
        }
        pedido.setTotal(total);

        // 2) Descontar. El descuento de product-service es atómico, así que si entre el paso 1
        //    y este alguien más compró, aquí falla y se devuelve lo que ya se había descontado.
        List<DetallePedido> descontados = new ArrayList<>();
        try {
            for (DetallePedido d : pedido.getDetalles()) {
                productos.descontarStock(d.getCodigoProducto(), d.getCantidad());
                descontados.add(d);
            }
        } catch (RuntimeException e) {
            devolverStock(descontados);
            throw e;
        }

        // 3) Guardar. Si la base falla, también se devuelve el stock.
        try {
            return PedidoResponse.de(guardador.guardar(pedido));
        } catch (RuntimeException e) {
            devolverStock(descontados);
            throw e;
        }
    }

    // --------------------------------------------------------------- consultas

    public List<PedidoResponse> misPedidos(UsuarioActual usuario) {
        return pedidoRepository.buscarPorUsuario(usuario.id()).stream().map(PedidoResponse::de).toList();
    }

    public List<PedidoResponse> listar(EstadoPedido estado) {
        List<Pedido> pedidos = estado == null
                ? pedidoRepository.buscarTodos()
                : pedidoRepository.buscarPorEstado(estado);
        return pedidos.stream().map(PedidoResponse::de).toList();
    }

    public PedidoResponse obtener(Long id, UsuarioActual usuario) {
        Pedido pedido = buscar(id);
        // El pedido de otra persona se responde igual que uno que no existe
        if (!usuario.admin() && !pedido.getUsuarioId().equals(usuario.id())) {
            throw new RecursoNoEncontradoException("No existe el pedido " + id);
        }
        return PedidoResponse.de(pedido);
    }

    // ------------------------------------------------------------------ estados

    public PedidoResponse cambiarEstado(Long id, EstadoPedido destino) {
        Pedido pedido = buscar(id);
        EstadoPedido actual = pedido.getEstado();

        // Reintento de una cancelación que quedó a medias (product-service no respondía)
        if (destino == EstadoPedido.CANCELADO && actual == EstadoPedido.CANCELADO) {
            if (!hayStockPorRestaurar(pedido)) {
                throw new EstadoInvalidoException("El pedido ya está cancelado.");
            }
            restaurarStock(pedido);
            return PedidoResponse.de(buscar(id));
        }

        if (!actual.permiteCambiarA(destino)) {
            throw new EstadoInvalidoException("No se puede pasar un pedido de " + actual + " a " + destino + ".");
        }
        if (pedidoRepository.cambiarEstado(id, actual, destino) == 0) {
            throw new EstadoInvalidoException(
                    "El pedido cambió de estado mientras lo actualizabas. Vuelve a intentarlo.");
        }
        if (destino == EstadoPedido.CANCELADO) {
            restaurarStock(pedido);
        }
        return PedidoResponse.de(buscar(id));
    }

    // ---------------------------------------------------------------- auxiliares

    private Pedido buscar(Long id) {
        return pedidoRepository.buscarConDetalle(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el pedido " + id));
    }

    private void validarDireccion(DireccionDto d) {
        if ("departamento".equals(d.tipo()) && (d.depto() == null || d.depto().isBlank())) {
            throw new DatosInvalidosException("Ingresa el número de tu departamento.");
        }
    }

    private Pedido armarPedido(CrearPedidoRequest req, UsuarioActual usuario) {
        Pedido pedido = new Pedido();
        pedido.setUsuarioId(usuario.id());
        pedido.setUsuarioEmail(usuario.email());
        pedido.setTipoCliente(usuario.tipoCliente());
        pedido.setClienteNombre(req.cliente().nombre().trim());
        pedido.setClienteApellidos(req.cliente().apellidos().trim());
        pedido.setClienteCorreo(req.cliente().correo().trim());

        DireccionDto d = req.direccion();
        DireccionEntrega direccion = new DireccionEntrega();
        direccion.setCalle(d.calle().trim());
        direccion.setNumeroCalle(d.numero());
        direccion.setTipo(d.tipo());
        direccion.setDepto("departamento".equals(d.tipo()) ? d.depto().trim() : null);
        direccion.setRegion(d.region().trim());
        direccion.setComuna(d.comuna().trim());
        direccion.setIndicaciones(d.indicaciones() == null || d.indicaciones().isBlank()
                ? null : d.indicaciones().trim());
        pedido.setDireccion(direccion);
        return pedido;
    }

    /** Si el mismo código viene dos veces, se suman las cantidades en una sola línea. */
    private Map<String, Integer> unirItems(List<ItemRequest> items) {
        Map<String, Integer> cantidades = new LinkedHashMap<>();
        for (ItemRequest item : items) {
            cantidades.merge(item.codigo().trim(), item.cantidad(), Integer::sum);
        }
        return cantidades;
    }

    /** Compensación de un pedido que no se pudo completar: si algo falla, solo se deja constancia. */
    private void devolverStock(List<DetallePedido> detalles) {
        for (DetallePedido d : detalles) {
            try {
                productos.aumentarStock(d.getCodigoProducto(), d.getCantidad());
            } catch (RuntimeException e) {
                log.error("NO se pudo devolver el stock de {} x{} tras un pedido fallido: hay que corregirlo a mano.",
                        d.getCodigoProducto(), d.getCantidad(), e);
            }
        }
    }

    private boolean hayStockPorRestaurar(Pedido pedido) {
        return pedido.getDetalles().stream().anyMatch(d -> !d.isStockRestaurado());
    }

    /** Devuelve el stock línea por línea; cada línea queda marcada para no devolverla dos veces. */
    private void restaurarStock(Pedido pedido) {
        try {
            for (DetallePedido d : pedido.getDetalles()) {
                if (d.isStockRestaurado()) {
                    continue;
                }
                try {
                    productos.aumentarStock(d.getCodigoProducto(), d.getCantidad());
                } catch (ProductoInvalidoException e) {
                    // El producto se desactivó o borró después de la compra: no hay stock que devolver
                    log.warn("El producto {} ya no existe; no se devuelve su stock.", d.getCodigoProducto());
                }
                detalleRepository.marcarStockRestaurado(d.getId());
            }
        } catch (ServicioNoDisponibleException e) {
            throw new ServicioNoDisponibleException("El pedido quedó cancelado, pero no se pudo devolver todo el "
                    + "stock (product-service no responde). Repite la cancelación para reintentar.");
        }
    }
}
