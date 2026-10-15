export default function Perfil({ sesion }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" style={{ maxWidth: 520 }}>
      <div className="d-flex align-items-center gap-3 mb-3">
        <div
          className="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center"
          style={{ width: 56, height: 56, fontSize: '1.4rem' }}
        >
          {sesion.nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <h5 className="fw-bold mb-0">{sesion.nombre}</h5>
          <span className="badge bg-warning text-dark">Administrador</span>
        </div>
      </div>
      <p className="mb-1 text-muted small">Correo de la cuenta</p>
      <p className="fw-semibold mb-3">{sesion.email}</p>
      <p className="mb-0 text-muted small">
        Esta cuenta tiene acceso al panel de administración de Gas El Volcán.
      </p>
    </div>
  )
}
