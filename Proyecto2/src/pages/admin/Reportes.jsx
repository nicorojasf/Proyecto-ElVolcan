import { TarjetaKpi } from './Tarjetas'

export default function Reportes({ pedidos }) {
  const pagados = pedidos.filter((p) => p.estado === 'pagado')
  const fallidos = pedidos.length - pagados.length
  const ingresos = pagados.reduce((acc, p) => acc + p.total, 0)
  const ticket = pagados.length ? Math.round(ingresos / pagados.length) : 0

  const porProducto = {}
  pagados.forEach((p) =>
    p.items.forEach((i) => {
      const actual = porProducto[i.nombre] ?? { cantidad: 0, monto: 0 }
      porProducto[i.nombre] = { cantidad: actual.cantidad + i.cantidad, monto: actual.monto + i.subtotal }
    })
  )
  const ranking = Object.entries(porProducto)
    .sort((a, b) => b[1].cantidad - a[1].cantidad)
    .slice(0, 5)

  return (
    <section>
      <div className="row g-3 mb-4">
        <TarjetaKpi titulo="Ingresos totales" valor={`$${ingresos.toLocaleString('es-CL')}`} color="success" />
        <TarjetaKpi titulo="Órdenes pagadas" valor={pagados.length} color="primary" />
        <TarjetaKpi titulo="Pagos fallidos" valor={fallidos} color="danger" />
        <TarjetaKpi titulo="Ticket promedio" valor={`$${ticket.toLocaleString('es-CL')}`} color="warning" />
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <h5 className="fw-bold mb-3">Productos más vendidos</h5>
        {ranking.length === 0 ? (
          <p className="text-muted mb-0">Todavía no hay ventas para reportar.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr><th>Producto</th><th>Unidades</th><th>Monto vendido</th></tr>
              </thead>
              <tbody>
                {ranking.map(([nombre, r]) => (
                  <tr key={nombre}>
                    <td>{nombre}</td>
                    <td>{r.cantidad}</td>
                    <td>${r.monto.toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
