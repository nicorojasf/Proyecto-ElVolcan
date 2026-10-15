import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { leerDatosAdmin } from '../data/adminStore'
import { leerPedidos } from '../data/pedidosStore'
import Dashboard from './admin/Dashboard'
import Ordenes from './admin/Ordenes'
import Productos from './admin/Productos'
import Categorias from './admin/Categorias'
import Usuarios from './admin/Usuarios'
import Reportes from './admin/Reportes'
import Perfil from './admin/Perfil'
import { vistas, tienda } from './admin/vistas'

export default function Admin() {
  const { sesion, usuarios, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [vista, setVista] = useState('dashboard')
  const [datos] = useState(leerDatosAdmin)
  const [pedidos] = useState(leerPedidos)

  if (!sesion?.esAdmin) return <Navigate to="/login" replace />

  const salir = () => {
    cerrarSesion()
    navigate('/login')
  }

  const vistaActual = vistas.find((v) => v.id === vista)

  const botonMenu = (v) => (
    <button
      key={v.id}
      onClick={() => setVista(v.id)}
      className={`list-group-item list-group-item-action rounded-3 border-0 py-2 px-3 fw-semibold ${
        vista === v.id ? 'active text-naranja bg-light' : 'text-dark'
      }`}
    >
      <i className={`bi ${v.icono} me-2`}></i> {v.texto}
    </button>
  )

  return (
    <div className="d-flex flex-column min-vh-100">

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

          <div className="text-white text-end d-none d-sm-block">
            <small className="d-block opacity-75" style={{ color: '#d1c7bd' }}>Sesión iniciada</small>
            <strong className="small text-white">{sesion.email}</strong>
          </div>
        </div>
      </header>

      <div className="container-fluid flex-grow-1 d-flex flex-column flex-md-row p-0">

        <aside className="admin-aside bg-white border-end p-3 d-flex flex-column">
          <h6 className="text-uppercase text-muted fw-bold small mb-3 px-2">Navegación</h6>
          <div className="list-group list-group-flush gap-1 bg-transparent">
            {vistas.filter((v) => !v.aparte).map(botonMenu)}
          </div>

          <hr />
          <div className="list-group list-group-flush gap-1 bg-transparent">
            {vistas.filter((v) => v.aparte).map(botonMenu)}
          </div>

          <div className="d-grid gap-2 mt-4 mt-md-auto pt-3">
            <Link to={tienda.ruta} className="btn btn-dark">
              <i className={`bi ${tienda.icono} me-2`}></i>{tienda.texto}
            </Link>
            <button className="btn btn-danger" onClick={salir}>
              <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
            </button>
          </div>
        </aside>

        <main className="flex-grow-1 p-4 overflow-hidden">

          <div className="bg-white p-4 rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center border-0">
            <div>
              <h1 className="h4 fw-bold mb-1" style={{ color: 'var(--color-cafe)' }}>
                {vistaActual.texto}
              </h1>
              <p className="text-muted small mb-0">{vistaActual.subtitulo}</p>
            </div>
            <button className="btn btn-naranja rounded-pill px-3 shadow-sm no-imprimir" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i> Exportar Reporte
            </button>
          </div>

          {vista === 'dashboard' && (
            <Dashboard datos={datos} pedidos={pedidos} usuarios={usuarios} onIr={setVista} />
          )}
          {vista === 'ordenes' && <Ordenes pedidos={pedidos} />}
          {vista === 'productos' && <Productos datos={datos} />}
          {vista === 'categorias' && <Categorias />}
          {vista === 'usuarios' && <Usuarios usuarios={usuarios} />}
          {vista === 'reportes' && <Reportes pedidos={pedidos} />}
          {vista === 'perfil' && <Perfil sesion={sesion} />}
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
