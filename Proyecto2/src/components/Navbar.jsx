import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Props: cantidad (número del badge), onMenu y onCarrito (funciones)
export default function Navbar({ cantidad = 0, onMenu, onCarrito }) {
  const { sesion, cerrarSesion } = useAuth()

  const handleCerrarSesion = () => {
    cerrarSesion()
    alert('Has cerrado sesión correctamente.')
  }

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

            {sesion ? (
              // Sesión activa: inicial + nombre y botón para salir
              <>
                <div
                  className="d-flex align-items-center gap-2 text-white"
                  title={`Sesión activa: ${sesion.nombre}`}
                >
                  <div
                    className="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: 32, height: 32, fontSize: '0.9rem' }}
                  >
                    {sesion.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="small d-none d-md-inline fw-semibold text-white">{sesion.nombre}</span>
                </div>
                <button
                  className="btn btn-outline-light btn-sm rounded-pill px-2 px-sm-3 fw-semibold boton-registro"
                  onClick={handleCerrarSesion}
                >
                  <span className="d-none d-sm-inline">Cerrar Sesión</span>
                  <span className="d-sm-none">Salir</span>
                </button>
              </>
            ) : (
              // Sin sesión: icono de login y botón de registro
              <>
                <Link to="/login" className="nav-link text-white d-flex align-items-center p-0" title="Iniciar Sesión">
                  <i className="bi bi-person-circle fs-5"></i>
                </Link>

                <Link to="/registro" className="btn btn-naranja btn-sm px-2 px-sm-3 rounded-pill fw-semibold boton-registro">
                  Registrarse
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </header>
  )
}
