import { Offcanvas } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { categorias } from '../data/productos'

// Los 7 enlaces del menú como datos (antes eran 7 bloques HTML casi iguales)
const items = [
  { texto: 'Todos los productos', icono: 'bi-shop', to: '/productos' },
  ...categorias.map((c) => ({
    texto: c.nombre,
    icono: c.icono,
    to: `/productos/${c.slug}`,
  })),
]

// Props: show (¿está abierto?) y onHide (función para cerrarlo)
export default function MenuLateral({ show, onHide }) {
  const { pathname } = useLocation()   // ruta actual, ej: "/cilindros"

  return (
    <Offcanvas show={show} onHide={onHide} id="offcanvasMenu">
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title className="fw-bold text-dark d-flex align-items-center gap-2">
          <i className="bi bi-fire text-naranja"></i> Gas El Volcán
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="p-0">
        <div className="list-group list-group-flush menu-lateral-list">
          {items.map((item) => (
            <Link
              key={item.texto}
              to={item.to}
              onClick={onHide}
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 px-4 ${
                pathname === item.to ? 'active' : ''
              }`}
            >
              <span className="d-flex align-items-center gap-3">
                <i className={`bi ${item.icono} fs-5 text-naranja`}></i>
                {item.texto}
              </span>
              <i className="bi bi-chevron-right small text-muted"></i>
            </Link>
          ))}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  )
}