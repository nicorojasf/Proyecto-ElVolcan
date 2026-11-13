import { formatearDireccion, normalizarDireccion } from '../../data/direccion'

export default function Usuarios({ usuarios }) {
  if (usuarios.length === 0) {
    return <p className="bg-white rounded-4 shadow-sm p-4 text-muted mb-0">Aún no hay usuarios registrados.</p>
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Dirección guardada</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.email}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.telefono}</td>
                <td>{u.direccion ? formatearDireccion(normalizarDireccion(u.direccion)) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
