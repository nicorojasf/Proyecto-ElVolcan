import { TAMANOS } from '../../data/adminStore'

export function KpiColor({ titulo, valor, detalle, icono, color }) {
  const textoOscuro = color === 'warning'
  return (
    <div className="col-12 col-md-4">
      <div className={`rounded-4 shadow-sm p-4 h-100 bg-${color} ${textoOscuro ? 'text-dark' : 'text-white'}`}>
        <div className="d-flex align-items-center gap-3">
          <i className={`bi ${icono} display-5`}></i>
          <div>
            <span className="d-block small fw-semibold">{titulo}</span>
            <span className="d-block h2 fw-bold mb-0">{valor}</span>
          </div>
        </div>
        <small className="d-block mt-3">{detalle}</small>
      </div>
    </div>
  )
}

export function TarjetaKpi({ titulo, valor, color }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className={`card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-${color} bg-white`}>
        <span className="text-muted small d-block mb-1">{titulo}</span>
        <h3 className="fw-bold text-dark mb-0">{valor}</h3>
      </div>
    </div>
  )
}

export function TarjetaInventario({ titulo, icono, color, stock }) {
  return (
    <div className="col-12 col-md-6">
      <div className={`card border-0 shadow-sm rounded-4 p-4 bg-white h-100 border-top border-4 border-${color}`}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className={`bg-${color} bg-opacity-15 p-3 rounded-circle text-${color} fs-4`}>
            <i className={`bi ${icono}`}></i>
          </div>
          <h3 className="h5 fw-bold text-dark mb-0">{titulo}</h3>
        </div>
        <p className="text-muted mb-0 fs-5">
          {TAMANOS.map((tam, i) => (
            <span key={tam}>
              <strong className="text-dark">{tam}:</strong> {stock[tam]}
              {i < TAMANOS.length - 1 && ' | '}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
