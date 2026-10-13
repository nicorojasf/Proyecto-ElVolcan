import { Link } from 'react-router-dom'

// Props: cantidad (número del badge), onMenu y onCarrito (funciones)
export default function Navbar({ cantidad = 0, onMenu, onCarrito }) {
  return (
    <header className="shadow-sm sticky-top">
      <nav className="navbar navbar-expand bg-header-principal p-0">
        <div className="container-fluid px-2 px-sm-3 h-100 d-flex align-items-end justify-content-between flex-nowrap">

          {/* IZQUIERDA: logo y botón de menú */}
          <div className="d-flex align-items-end gap-2 gap-sm-3 pb-2">
            <Link className="navbar-brand p-0 m-0 d-flex align-items-center" to="/">
              <img src="/imagenes/gas.png" alt="Gas El Volcán" className="logo-header-unico" />
            </Link>

            <button
              className="btn text-white d-flex align-items-center gap-2 border-0 p-0 shadow-none mb-1"
              onClick={onMenu}
              aria-label="Abrir menú"
            >
              <i className="bi bi-list fs-3 text-naranja"></i>
              {/* El texto solo aparece desde pantallas "sm" (576px) hacia arriba */}
              <span className="fw-semibold fs-5 lh-1 d-none d-sm-inline">Menú</span>
            </button>
          </div>

          {/* DERECHA: carrito, cuenta y registro */}
          <div className="d-flex align-items-end gap-2 gap-sm-3 pb-2 mb-1">
            <button
              className="btn nav-link text-white d-flex align-items-center gap-1 p-0 border-0 shadow-none"
              onClick={onCarrito}
              aria-label="Abrir carrito"
            >
              <i className="bi bi-cart3 fs-5"></i>
              <span className="badge bg-danger rounded-pill">{cantidad}</span>
            </button>

            {/* El separador solo se ve en pantallas medianas y grandes */}
            <span className="text-white-50 lh-1 d-none d-sm-inline">|</span>

            <Link to="/login" className="nav-link text-white d-flex align-items-center p-0" title="Iniciar Sesión">
              <i className="bi bi-person-circle fs-5"></i>
            </Link>

            <Link to="/registro" className="btn btn-naranja btn-sm px-2 px-sm-3 rounded-pill fw-semibold boton-registro">
              Registrarse
            </Link>
          </div>

        </div>
      </nav>
    </header>
  )
}
