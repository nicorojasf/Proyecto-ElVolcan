import { formatearDireccion } from '../../data/direccion'

export default function Ordenes({ pedidos }) {
  const lista = [...pedidos].reverse()

  if (lista.length === 0) {
    return <p className="bg-white rounded-4 shadow-sm p-4 text-muted mb-0">Aún no hay órdenes registradas.</p>
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>N° orden</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Dirección de entrega</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.numero}>
                <td>
                  <strong>#{p.numero}</strong>
                  <small className="d-block text-muted">{p.codigo}</small>
                </td>
                <td>{new Date(p.fecha).toLocaleString('es-CL')}</td>
                <td>{p.cliente.nombre} {p.cliente.apellidos}</td>
                <td>{formatearDireccion(p.direccion)}</td>
                <td>${p.total.toLocaleString('es-CL')}</td>
                <td>
                  <span
                    className={`badge ${p.estado === 'pagado' ? 'bg-success' : 'bg-danger'}`}
                    title={p.motivo}
                  >
                    {p.estado === 'pagado' ? 'Pagado' : 'Fallido'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
