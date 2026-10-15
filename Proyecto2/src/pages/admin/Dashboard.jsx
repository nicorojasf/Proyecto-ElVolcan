import { Link } from 'react-router-dom'
import GraficoPedidos from '../../components/GraficoPedidos'
import { productos } from '../../data/productos'
import { KpiColor, TarjetaKpi } from './Tarjetas'
import { vistas, tienda } from './vistas'

export default function Dashboard({ datos, pedidos, usuarios, onIr }) {
  const pagados = pedidos.filter((p) => p.estado === 'pagado')
  const ingresos = pagados.reduce((acc, p) => acc + p.total, 0)
  const stockCatalogo = productos.reduce((acc, p) => acc + p.stock, 0)
  const conDireccion = usuarios.filter((u) => u.direccion).length

  const claseTarjeta = 'card h-100 w-100 border-0 shadow-sm rounded-4 p-3 text-center text-dark text-decoration-none tarjeta-categoria'

  return (
    <section>
      <div className="row g-3 mb-4">
        <KpiColor titulo="Compras" valor={pagados.length} icono="bi-cart3" color="primary"
          detalle={`Ingresos acumulados: $${ingresos.toLocaleString('es-CL')}`} />
        <KpiColor titulo="Productos" valor={productos.length} icono="bi-box-seam" color="success"
          detalle={`Unidades en catálogo: ${stockCatalogo}`} />
        <KpiColor titulo="Usuarios" valor={usuarios.length} icono="bi-people-fill" color="warning"
          detalle={`Con dirección guardada: ${conDireccion}`} />
      </div>

      <div className="row g-3 mb-4">
        {vistas.map((v) => (
          <div key={v.id} className="col-12 col-sm-6 col-xl-3">
            <button type="button" className={claseTarjeta} onClick={() => onIr(v.id)}>
              <i className={`bi ${v.icono} fs-3 text-primary mb-2`}></i>
              <span className="fw-bold">{v.texto}</span>
              <small className="text-muted">{v.descripcion}</small>
            </button>
          </div>
        ))}
        <div className="col-12 col-sm-6 col-xl-3">
          <Link to={tienda.ruta} className={claseTarjeta}>
            <i className={`bi ${tienda.icono} fs-3 text-primary mb-2`}></i>
            <span className="fw-bold">{tienda.texto}</span>
            <small className="text-muted">{tienda.descripcion}</small>
          </Link>
        </div>
      </div>

      <h5 className="fw-bold mb-3">Métricas del día</h5>
      <div className="row g-3 mb-4">
        <TarjetaKpi titulo="Pedidos Hoy" valor={datos.pedidosHoy} color="warning" />
        <TarjetaKpi titulo="Cilindros Entregados" valor={datos.cilindrosEntregados} color="primary" />
        <TarjetaKpi titulo="Ingresos del Día" valor={`$${datos.ingresosDia.toLocaleString('es-CL')}`} color="success" />
        <TarjetaKpi titulo="Repartidores Activos" valor="4 / 5" color="danger" />
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <h5 className="fw-bold mb-3" style={{ color: 'var(--color-cafe)' }}>
          <i className="bi bi-graph-up text-naranja me-2"></i>Rendimiento de Pedidos Semanales
        </h5>
        <GraficoPedidos />
      </div>
    </section>
  )
}
