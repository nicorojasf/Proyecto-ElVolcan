export default function Usuarios({ usuarios, miEmail, onEliminar }) {
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
              <th>Rol</th>
              <th>Tipo de cliente</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.telefono}</td>
                <td>{u.rol}</td>
                <td>{u.tipoCliente}</td>
                <td className="text-end">
                  {u.email !== miEmail && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onEliminar(u)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
