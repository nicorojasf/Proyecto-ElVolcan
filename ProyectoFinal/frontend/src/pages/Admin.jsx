import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificacionContext'
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
  const { notificar } = useNotificacion()
  const navigate = useNavigate()
  const [vistaId, setVistaId] = useState('dashboard')

  // Solo entra el administrador; cualquier otra persona vuelve al login
  if (!sesion?.esAdmin) return <Navigate to="/login" replace />

  const vista = vistas.find((v) => v.id === vistaId)

  // Los datos se leen en cada render, así siempre se ven los más recientes
  const datos = leerDatosAdmin()
  const pedidos = leerPedidos()

  const salir = () => {
    cerrarSesion()
    notificar('Sesión cerrada correctamente.')
    navigate('/')
  }

  const contenido = {
    dashboard: <Dashboard datos={datos} pedidos={pedidos} usuarios={usuarios} onIr={setVistaId} />,
    ordenes: <Ordenes pedidos={pedidos} />,
    productos: <Productos datos={datos} />,
    categorias: <Categorias />,
    usuarios: <Usuarios usuarios={usuarios} />,
    reportes: <Reportes pedidos={pedidos} />,
    perfil: <Perfil sesion={sesion} />,
  }[vistaId]

  const botonMenu = (v) => (
    <button
      key={v.id}
      type="button"
      className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 px-4 ${
        vistaId === v.id ? 'active' : ''
      }`}
      onClick={() => setVistaId(v.id)}
    >
      <i className={`bi ${v.icono} fs-5`}></i>
      {v.texto}
    </button>
  )

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        {/* Menú lateral del panel */}
        <aside className="col-12 col-md-3 col-xl-2 bg-white border-end p-0 d-flex flex-column">
          <div className="p-3 border-bottom d-flex align-items-center gap-2 fw-bold">
            <i className="bi bi-fire text-naranja fs-4"></i> Gas El Volcán
          </div>

          <div className="list-group list-group-flush flex-grow-1">
            {vistas.filter((v) => !v.aparte).map(botonMenu)}
            <Link to={tienda.ruta} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 px-4">
              <i className={`bi ${tienda.icono} fs-5`}></i>
              {tienda.texto}
            </Link>
          </div>

          <div className="list-group list-group-flush border-top">
            {vistas.filter((v) => v.aparte).map(botonMenu)}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 px-4 text-danger"
              onClick={salir}
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Contenido de la vista elegida */}
        <main className="col-12 col-md-9 col-xl-10 p-4">
          <div className="mb-4">
            <h2 className="fw-bold mb-0">
              <i className={`bi ${vista.icono} text-naranja me-2`}></i>
              {vista.texto}
            </h2>
            <p className="text-muted mb-0">{vista.subtitulo}</p>
          </div>

          {contenido}
        </main>

      </div>
    </div>
  )
}
