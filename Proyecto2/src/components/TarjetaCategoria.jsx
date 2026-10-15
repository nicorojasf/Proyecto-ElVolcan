import { Link } from 'react-router-dom'

export default function TarjetaCategoria({ titulo, ruta }) {
  return (
    <div className="col-6 col-md-3">
      <div className="tarjeta-categoria p-3 rounded-4 shadow-sm text-center d-flex flex-column align-items-center justify-content-between h-100">
        <span className="fw-bold text-dark mb-3">{titulo}</span>
        <Link to={ruta} className="btn btn-danger btn-sm w-100 rounded-pill">
          Ver más
        </Link>
      </div>
    </div>
  )
}