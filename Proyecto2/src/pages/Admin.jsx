import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import GraficoPedidos from '../components/GraficoPedidos'
import { useAuth } from '../context/AuthContext'
import { leerDatosAdmin, TAMANOS } from '../data/adminStore'

// Las dos secciones del menú lateral como datos
const vistas = [
  { id: 'dashboard',  boton: 'Dashboard General',    titulo: 'Dashboard General',                         icono: 'bi-speedometer2' },
  { id: 'inventario', boton: 'Inventario Cilindros', titulo: 'Inventario de Cilindros (Llenos vs Vacíos)', icono: 'bi-box-seam' },
]

// Tarjeta de un KPI (Pedidos Hoy, Ingresos, etc.)
function TarjetaKpi({ titulo, valor, color }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className={`card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-${color} bg-white`}>
        <span className="text-muted small d-block mb-1">{titulo}</span>
        <h3 className="fw-bold text-dark mb-0">{valor}</h3>
      </div>
    </div>
  )
}

// Tarjeta de inventario: recibe el stock como objeto { '5kg': 24, ... }
function TarjetaInventario({ titulo, icono, color, stock }) {
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

export default function Admin() {
  const { sesion, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [vista, setVista] = useState('dashboard')
  // Se lee una vez al abrir el panel (las ventas se guardan al pagar)
  const [datos] = useState(leerDatosAdmin)

  // Solo entra el administrador; cualquier otro va al login
  if (!sesion?.esAdmin) return <Navigate to="/login" replace />

  const salir = () => {
    cerrarSesion()
    navigate('/login')
  }

  const vistaActual = vistas.find((v) => v.id === vista)

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Encabezado propio del panel */}
      <header className="bg-header-principal shadow-sm sticky-top">
        <div className="container-fluid px-3 d-flex align-items-center justify-content-between h-100 py-3">
          <div className="d-flex align-items-center gap-3">
            <Link to="/">
              <img src="/imagenes/gas.png" alt="Gas El Volcán" className="logo-header-unico" />
            </Link>
            <span className="badge bg-warning text-dark fw-bold text-uppercase px-2 py-1">
              Panel Administrador
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-white text-end d-none d-sm-block">
              <small className="d-block opacity-75" style={{ color: '#d1c7bd' }}>Sesión iniciada</small>
              <strong className="small text-white">{sesion.email}</strong>
            </div>
            <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={salir}>
              <i className="bi bi-box-arrow-right me-1"></i> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container-fluid flex-grow-1 d-flex flex-column flex-md-row p-0">

        {/* Menú lateral */}
        <aside className="bg-white border-end p-3" style={{ width: 260 }}>
          <h6 className="text-uppercase text-muted fw-bold small mb-3 px-2">Navegación</h6>
          <div className="list-group list-group-flush gap-1 bg-transparent">
            {vistas.map((v) => (
              <button
                key={v.id}
                onClick={() => setVista(v.id)}
                className={`list-group-item list-group-item-action rounded-3 border-0 py-2 px-3 fw-semibold ${
                  vista === v.id ? 'active text-naranja bg-light' : 'text-dark'
                }`}
              >
                <i className={`bi ${v.icono} me-2`}></i> {v.boton}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-grow-1 p-4">

          {/* Encabezado de la sección activa */}
          <div className="bg-white p-4 rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center border-0">
            <div>
              <h1 className="h4 fw-bold mb-1" style={{ color: 'var(--color-cafe)' }}>
                {vistaActual.titulo}
              </h1>
              <p className="text-muted small mb-0">Monitoreo de operaciones en Chillán en tiempo real</p>
            </div>
            <button className="btn btn-naranja rounded-pill px-3 shadow-sm" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i> Exportar Reporte
            </button>
          </div>

          {/* VISTA 1: dashboard */}
          {vista === 'dashboard' && (
            <section>
              <div className="row g-3 mb-4">
                <TarjetaKpi titulo="Pedidos Hoy" valor={datos.pedidosHoy} color="warning" />
                <TarjetaKpi titulo="Cilindros Entregados" valor={datos.cilindrosEntregados} color="primary" />
                <TarjetaKpi titulo="Ingresos del Día" valor={`$${datos.ingresosDia.toLocaleString('es-CL')}`} color="success" />
                <TarjetaKpi titulo="Repartidores Activos" valor="4 / 5" color="danger" />
              </div>

              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold mb-3" style={{ color: 'var(--color-cafe)' }}>
                  <i className="bi bi-graph-up text-naranja me-2"></i>Rendimiento de Pedidos Semanales
                </h5>
                <GraficoPedidos />
              </div>
            </section>
          )}

          {/* VISTA 2: inventario */}
          {vista === 'inventario' && (
            <section>
              <div className="row g-4">
                <TarjetaInventario
                  titulo="Cilindros Llenos (Stock Venta)"
                  icono="bi-fire"
                  color="success"
                  stock={datos.stockLlenos}
                />
                <TarjetaInventario
                  titulo="Cilindros Vacíos (En Bodega)"
                  icono="bi-box"
                  color="secondary"
                  stock={datos.stockVacios}
                />
              </div>
            </section>
          )}
        </main>
      </div>

      <footer className="footer-principal py-3 mt-auto">
        <div className="container-fluid px-3 text-center text-md-start d-flex flex-column flex-md-row justify-content-between align-items-center small">
          <span className="text-secondary-custom">Gas El Volcán - Módulo de Gestión y Administración</span>
          <span className="text-secondary-custom">© 2026 Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  )
}
