import { Fragment, useState } from 'react'
import { formatearDireccion } from '../../data/direccion'
import { ESTADOS, SIGUIENTES } from '../../data/metricas'

// soloLectura (VENDEDOR): ve la lista y el detalle, pero no ve el selector para cambiar el estado.
export default function Ordenes({ pedidos, onCambiarEstado, soloLectura = false }) {
  const [abierto, setAbierto] = useState(null)   // id del pedido con el detalle desplegado
  const lista = [...pedidos].sort((a, b) => b.id - a.id)

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
              {!soloLectura && <th>Cambiar a</th>}
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => {
              const estado = ESTADOS[p.estado] ?? { texto: p.estado, clase: 'bg-secondary' }
              const opciones = SIGUIENTES[p.estado] ?? []
              return (
                <Fragment key={p.id}>
                <tr>
                  <td>
                    <strong>#{p.numero}</strong>
                    <small className="d-block text-muted">{p.codigo}</small>
                  </td>
                  <td>{new Date(p.fecha).toLocaleString('es-CL')}</td>
                  <td>{p.cliente.nombre} {p.cliente.apellidos}</td>
                  <td>{formatearDireccion(p.direccion)}</td>
                  <td>${p.total.toLocaleString('es-CL')}</td>
                  <td><span className={`badge ${estado.clase}`}>{estado.texto}</span></td>
                  {!soloLectura && (
                  <td>
                    {opciones.length === 0 ? (
                      <span className="text-muted small">—</span>
                    ) : (
                      <select
                        className="form-select form-select-sm"
                        aria-label={`Cambiar estado del pedido ${p.numero}`}
                        value=""
                        onChange={(e) => e.target.value && onCambiarEstado(p.id, e.target.value)}
                      >
                        <option value="">Elegir...</option>
                        {opciones.map((o) => (
                          <option key={o} value={o}>{ESTADOS[o].texto}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  )}
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                    >
                      {abierto === p.id ? 'Ocultar' : 'Ver detalle'}
                    </button>
                  </td>
                </tr>
                {abierto === p.id && (
                  <tr>
                    <td colSpan={soloLectura ? 7 : 8} className="bg-light">
                      <strong>Productos del pedido</strong>
                      <ul className="mb-0">
                        {p.items.map((i) => (
                          <li key={i.codigo}>
                            {i.cantidad} × {i.nombre} — ${i.precio.toLocaleString('es-CL')} c/u
                            (subtotal ${i.subtotal.toLocaleString('es-CL')})
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
