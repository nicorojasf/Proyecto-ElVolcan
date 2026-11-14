package com.gasvolcan.pedidos.service;

import com.gasvolcan.pedidos.client.ProductoClient;
import com.gasvolcan.pedidos.client.ProductoDto;
import com.gasvolcan.pedidos.dto.ClienteDto;
import com.gasvolcan.pedidos.dto.CrearPedidoRequest;
import com.gasvolcan.pedidos.dto.DireccionDto;
import com.gasvolcan.pedidos.dto.ItemRequest;
import com.gasvolcan.pedidos.dto.PedidoResponse;
import com.gasvolcan.pedidos.exception.DatosInvalidosException;
import com.gasvolcan.pedidos.exception.EstadoInvalidoException;
import com.gasvolcan.pedidos.exception.RecursoNoEncontradoException;
import com.gasvolcan.pedidos.exception.StockInsuficienteException;
import com.gasvolcan.pedidos.model.DetallePedido;
import com.gasvolcan.pedidos.model.DireccionEntrega;
import com.gasvolcan.pedidos.model.EstadoPedido;
import com.gasvolcan.pedidos.model.Pedido;
import com.gasvolcan.pedidos.model.TipoCliente;
import com.gasvolcan.pedidos.repository.DetallePedidoRepository;
import com.gasvolcan.pedidos.repository.PedidoRepository;
import com.gasvolcan.pedidos.security.UsuarioActual;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PedidoServiceTest {

    private PedidoRepository pedidoRepository;
    private DetallePedidoRepository detalleRepository;
    private PedidoGuardador guardador;
    private ProductoClient productos;
    private PedidoService service;

    private final UsuarioActual residencial = new UsuarioActual(1L, "ana@correo.cl", false, false, TipoCliente.RESIDENCIAL);
    private final UsuarioActual comercial = new UsuarioActual(2L, "taller@correo.cl", false, false, TipoCliente.COMERCIAL);
    private final UsuarioActual admin = new UsuarioActual(99L, "admin@admin.cl", true, false, TipoCliente.COMERCIAL);

    @BeforeEach
    void preparar() {
        pedidoRepository = mock(PedidoRepository.class);
        detalleRepository = mock(DetallePedidoRepository.class);
        guardador = mock(PedidoGuardador.class);
        productos = mock(ProductoClient.class);
        service = new PedidoService(pedidoRepository, detalleRepository, guardador, productos);

        when(guardador.guardar(any(Pedido.class))).thenAnswer(inv -> {
            Pedido p = inv.getArgument(0);
            p.setId(7L);
            p.setNumero("202611120007");
            p.setCodigo("ORDER00007");
            return p;
        });
    }

    // ---------- helpers ----------

    private ProductoDto producto(String codigo, int residencial, int comercial, int stock) {
        return new ProductoDto(codigo, "Producto " + codigo, residencial, comercial, stock, codigo + ".png");
    }

    private DireccionDto direccion(String tipo, String depto) {
        return new DireccionDto("Los Aromos", "123", tipo, depto, "Metropolitana", "Maipú", null);
    }

    private CrearPedidoRequest request(DireccionDto direccion, ItemRequest... items) {
        return new CrearPedidoRequest(new ClienteDto("Ana", "Pérez", "ana@correo.cl"), direccion, List.of(items));
    }

    private Pedido pedidoGuardado(long id, long usuarioId, EstadoPedido estado) {
        Pedido p = new Pedido();
        p.setId(id);
        p.setNumero("2026111200" + id);
        p.setCodigo("ORDER0000" + id);
        p.setUsuarioId(usuarioId);
        p.setUsuarioEmail("ana@correo.cl");
        p.setTipoCliente(TipoCliente.RESIDENCIAL);
        p.setClienteNombre("Ana");
        p.setClienteApellidos("Pérez");
        p.setClienteCorreo("ana@correo.cl");
        DireccionEntrega d = new DireccionEntrega();
        d.setCalle("Los Aromos");
        d.setNumeroCalle("123");
        d.setTipo("casa");
        d.setRegion("Metropolitana");
        d.setComuna("Maipú");
        p.setDireccion(d);
        p.setEstado(estado);
        p.setTotal(2000);
        DetallePedido linea = new DetallePedido();
        linea.setId(5L);
        linea.setCodigoProducto("CL001");
        linea.setNombre("Cilindro");
        linea.setPrecioUnitario(1000);
        linea.setCantidad(2);
        linea.setSubtotal(2000);
        p.agregarDetalle(linea);
        return p;
    }

    // ---------- crear ----------

    @Test
    @DisplayName("Cliente residencial: se cobra el precio residencial y se descuenta el stock")
    void crearResidencial() {
        when(productos.obtener("CL001")).thenReturn(producto("CL001", 1000, 800, 10));

        PedidoResponse resp = service.crear(request(direccion("casa", null), new ItemRequest("CL001", 2)), residencial);

        assertEquals(2000, resp.total());
        assertEquals(1000, resp.items().get(0).precio());
        assertEquals(EstadoPedido.PENDIENTE, resp.estado());
        assertEquals(TipoCliente.RESIDENCIAL, resp.tipoCliente());
        verify(productos).descontarStock("CL001", 2);
    }

    @Test
    @DisplayName("Cliente comercial: se cobra el precio comercial")
    void crearComercial() {
        when(productos.obtener("CL001")).thenReturn(producto("CL001", 1000, 800, 10));

        PedidoResponse resp = service.crear(request(direccion("casa", null), new ItemRequest("CL001", 2)), comercial);

        assertEquals(1600, resp.total());
        assertEquals(800, resp.items().get(0).precio());
    }

    @Test
    @DisplayName("Si un código viene repetido se suma en una sola línea y se descuenta una vez")
    void itemsRepetidosSeUnen() {
        when(productos.obtener("CL001")).thenReturn(producto("CL001", 1000, 800, 10));

        PedidoResponse resp = service.crear(request(direccion("casa", null),
                new ItemRequest("CL001", 1), new ItemRequest("CL001", 2)), residencial);

        assertEquals(1, resp.items().size());
        assertEquals(3, resp.items().get(0).cantidad());
        verify(productos, times(1)).descontarStock("CL001", 3);
    }

    @Test
    @DisplayName("Sin stock suficiente: error 409 y no se descuenta ni se guarda nada")
    void stockInsuficiente() {
        when(productos.obtener("CL001")).thenReturn(producto("CL001", 1000, 800, 1));

        assertThrows(StockInsuficienteException.class,
                () -> service.crear(request(direccion("casa", null), new ItemRequest("CL001", 5)), residencial));

        verify(productos, never()).descontarStock(anyString(), anyInt());
        verify(guardador, never()).guardar(any(Pedido.class));
    }

    @Test
    @DisplayName("Si falla el descuento del segundo producto, se devuelve el stock del primero")
    void fallaElSegundoDescuento() {
        when(productos.obtener("A")).thenReturn(producto("A", 100, 90, 10));
        when(productos.obtener("B")).thenReturn(producto("B", 200, 180, 10));
        doThrow(new StockInsuficienteException("se agotó")).when(productos).descontarStock("B", 1);

        assertThrows(StockInsuficienteException.class, () -> service.crear(
                request(direccion("casa", null), new ItemRequest("A", 1), new ItemRequest("B", 1)), residencial));

        verify(productos).aumentarStock("A", 1);
        verify(productos, never()).aumentarStock("B", 1);
        verify(guardador, never()).guardar(any(Pedido.class));
    }

    @Test
    @DisplayName("Si falla el guardado en la base, se devuelve todo el stock descontado")
    void fallaElGuardado() {
        when(productos.obtener("CL001")).thenReturn(producto("CL001", 1000, 800, 10));
        doThrow(new IllegalStateException("base caída")).when(guardador).guardar(any(Pedido.class));

        assertThrows(IllegalStateException.class,
                () -> service.crear(request(direccion("casa", null), new ItemRequest("CL001", 2)), residencial));

        verify(productos).aumentarStock("CL001", 2);
    }

    @Test
    @DisplayName("Un departamento exige el número de depto")
    void deptoObligatorio() {
        assertThrows(DatosInvalidosException.class, () -> service.crear(
                request(direccion("departamento", " "), new ItemRequest("CL001", 1)), residencial));

        verify(productos, never()).obtener(anyString());
    }

    // ---------- consultas ----------

    @Test
    @DisplayName("Un pedido ajeno se ve como inexistente; el admin sí lo puede ver")
    void pedidoAjeno() {
        when(pedidoRepository.buscarConDetalle(10L)).thenReturn(Optional.of(pedidoGuardado(10L, 1L, EstadoPedido.PENDIENTE)));

        assertThrows(RecursoNoEncontradoException.class, () -> service.obtener(10L, comercial));
        assertEquals(10L, service.obtener(10L, residencial).id());
        assertEquals(10L, service.obtener(10L, admin).id());
    }

    // ---------- estados ----------

    @Test
    @DisplayName("Cancelar un pedido pendiente devuelve el stock y marca la línea")
    void cancelarDevuelveStock() {
        Pedido pedido = pedidoGuardado(1L, 1L, EstadoPedido.PENDIENTE);
        when(pedidoRepository.buscarConDetalle(1L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.cambiarEstado(1L, EstadoPedido.PENDIENTE, EstadoPedido.CANCELADO)).thenReturn(1);

        service.cambiarEstado(1L, EstadoPedido.CANCELADO);

        verify(productos).aumentarStock("CL001", 2);
        verify(detalleRepository).marcarStockRestaurado(5L);
    }

    @Test
    @DisplayName("Una transición no permitida da conflicto y no toca la base")
    void transicionInvalida() {
        when(pedidoRepository.buscarConDetalle(1L))
                .thenReturn(Optional.of(pedidoGuardado(1L, 1L, EstadoPedido.PENDIENTE)));

        assertThrows(EstadoInvalidoException.class, () -> service.cambiarEstado(1L, EstadoPedido.ENTREGADO));

        verify(pedidoRepository, never()).cambiarEstado(any(Long.class), any(EstadoPedido.class), any(EstadoPedido.class));
    }

    @Test
    @DisplayName("Si otro admin cambió el estado al mismo tiempo, se avisa y no se devuelve stock")
    void cambioConcurrente() {
        when(pedidoRepository.buscarConDetalle(1L))
                .thenReturn(Optional.of(pedidoGuardado(1L, 1L, EstadoPedido.PENDIENTE)));
        when(pedidoRepository.cambiarEstado(1L, EstadoPedido.PENDIENTE, EstadoPedido.CANCELADO)).thenReturn(0);

        assertThrows(EstadoInvalidoException.class, () -> service.cambiarEstado(1L, EstadoPedido.CANCELADO));

        verify(productos, never()).aumentarStock(anyString(), anyInt());
    }

    @Test
    @DisplayName("Repetir la cancelación reintenta solo el stock que faltó, sin cambiar el estado")
    void reintentoDeCancelacion() {
        Pedido cancelado = pedidoGuardado(1L, 1L, EstadoPedido.CANCELADO); // su línea sigue sin restaurar
        when(pedidoRepository.buscarConDetalle(1L)).thenReturn(Optional.of(cancelado));

        service.cambiarEstado(1L, EstadoPedido.CANCELADO);

        verify(productos).aumentarStock("CL001", 2);
        verify(pedidoRepository, never()).cambiarEstado(any(Long.class), any(EstadoPedido.class), any(EstadoPedido.class));
    }

    @Test
    @DisplayName("Cancelar de nuevo un pedido ya totalmente devuelto da conflicto")
    void cancelarDosVeces() {
        Pedido cancelado = pedidoGuardado(1L, 1L, EstadoPedido.CANCELADO);
        cancelado.getDetalles().get(0).setStockRestaurado(true);
        when(pedidoRepository.buscarConDetalle(1L)).thenReturn(Optional.of(cancelado));

        assertThrows(EstadoInvalidoException.class, () -> service.cambiarEstado(1L, EstadoPedido.CANCELADO));

        verify(productos, never()).aumentarStock(anyString(), anyInt());
    }
}
