import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificacionContext'
import { calcularMetricas } from '../data/metricas'
import {
  activarProducto, actualizarProducto, cambiarEstadoPedido, crearProducto, desactivarProducto, eliminarUsuarioApi,
  getCategorias, getPedidos, getProductos, getProductosDesactivados, getUsuarios,
} from '../services/api'
import Dashboard from './admin/Dashboard'
import Ordenes from './admin/Ordenes'
import Productos from './admin/Productos'
import Categorias from './admin/Categorias'
import Usuarios from './admin/Usuarios'
import Reportes from './admin/Reportes'
import Perfil from './admin/Perfil'
import { vistas, tienda } from './admin/vistas'

export default function Admin() {
  const { sesion, cerrarSesion } = useAuth()
  const { notificar } = useNotificacion()
  const navigate = useNavigate()
  // ADMIN entra a todo; VENDEDOR solo ve Órdenes y Productos (lectura). El rol viene del token firmado por el backend.
  const rol = sesion?.rol ?? (sesion?.esAdmin ? 'ADMIN' : 'CLIENTE')
  const esAdmin = rol === 'ADMIN'
  const esPersonal = esAdmin || rol === 'VENDEDOR'
  const permitidas = vistas.filter((v) => v.roles.includes(rol))
  const [vistaId, setVistaId] = useState(esAdmin ? 'dashboard' : 'ordenes')

  // Datos reales: pedidos (order-service), usuarios (auth-service) y productos (product-service)
  const [pedidos, setPedidos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [productos, setProductos] = useState([])
  const [desactivados, setDesactivados] = useState([])
  const [categoriasApi, setCategoriasApi] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setError('')
    try {
      // La lista de usuarios es solo del ADMIN (para el vendedor el backend respondería 403)
      const [ped, usu, prod, cats, desac] = await Promise.all([
        getPedidos(),
        esAdmin ? getUsuarios() : Promise.resolve([]),
        getProductos(),
        getCategorias(),
        esAdmin ? getProductosDesactivados() : Promise.resolve([]),
      ])
      setDesactivados(desac)
      setCategoriasApi(cats)
      setPedidos(ped)
      setUsuarios(usu)
      setProductos(prod)
    } catch (e) {
      setError(e.status === 401 || e.status === 403
        ? 'Tu sesión expiró o no tienes permisos. Vuelve a iniciar sesión.'
        : e.message)
    } finally {
      setCargando(false)
    }
  }, [esAdmin])

  useEffect(() => {
    if (esPersonal) cargar()
  }, [esPersonal, cargar])

  // Solo entra el personal (admin o vendedor); cualquier otra persona vuelve al login
  if (!esPersonal) return <Navigate to="/login" replace />

  // Si la vista pedida no corresponde al rol, se muestra la primera permitida
  const vista = permitidas.find((v) => v.id === vistaId) ?? permitidas[0]
  const datos = calcularMetricas(pedidos, productos)

  const salir = () => {
    cerrarSesion()
    notificar('Sesión cerrada correctamente.')
    navigate('/')
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoPedido(id, estado)
      notificar('Estado del pedido actualizado.')
      await cargar() // también refresca el stock si se canceló
    } catch (e) {
      notificar(e.message, 'danger')
    }
  }

  const eliminarUsuario = async (u) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.nombre}?`)) return
    try {
      await eliminarUsuarioApi(u.id)
      notificar('Usuario eliminado.')
      await cargar()
    } catch (e) {
      notificar(e.message, 'danger')
    }
  }

  // CRUD de productos (solo ADMIN). Devuelve true si salió bien, para que el formulario se cierre.
  const guardarProducto = async (producto, esNuevo) => {
    try {
      if (esNuevo) await crearProducto(producto)
      else await actualizarProducto(producto.codigo, producto)
      notificar(esNuevo ? 'Producto creado.' : 'Producto actualizado.')
      await cargar()
      return true
    } catch (e) {
      notificar(e.message, 'danger')
      return false
    }
  }

  const quitarProducto = async (p) => {
    if (!window.confirm(`¿Desactivar "${p.nombre}"? Dejará de aparecer en la tienda.`)) return
    try {
      await desactivarProducto(p.codigo)
      notificar('Producto desactivado.')
      await cargar()
    } catch (e) {
      notificar(e.message, 'danger')
    }
  }

  const reactivarProducto = async (p) => {
    try {
      await activarProducto(p.codigo)
      notificar('Producto reactivado: ya aparece en la tienda.')
      await cargar()
    } catch (e) {
      notificar(e.message, 'danger')
    }
  }

  const contenido = {
    dashboard: <Dashboard datos={datos} pedidos={pedidos} usuarios={usuarios} productos={productos} onIr={setVistaId} />,
    ordenes: <Ordenes pedidos={pedidos} onCambiarEstado={cambiarEstado} soloLectura={!esAdmin} />,
    productos: (
      <Productos
        datos={datos}
        productos={productos}
        categorias={categoriasApi}
        soloLectura={!esAdmin}
        onGuardar={guardarProducto}
        desactivados={desactivados}
        onDesactivar={quitarProducto}
        onActivar={reactivarProducto}
      />
    ),
    categorias: <Categorias />,
    usuarios: <Usuarios usuarios={usuarios} miEmail={sesion.email} onEliminar={eliminarUsuario} />,
    reportes: <Reportes pedidos={pedidos} />,
    perfil: <Perfil sesion={sesion} />,
  }[vista.id]

  const botonMenu = (v) => (
    <button
      key={v.id}
      type="button"
      className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 px-4 ${
        vista.id === v.id ? 'active' : ''
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
            {permitidas.filter((v) => !v.aparte).map(botonMenu)}
            <Link to={tienda.ruta} className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 px-4">
              <i className={`bi ${tienda.icono} fs-5`}></i>
              {tienda.texto}
            </Link>
          </div>

          <div className="list-group list-group-flush border-top">
            {permitidas.filter((v) => v.aparte).map(botonMenu)}
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

          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center">
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={cargar}>Reintentar</button>
            </div>
          )}
          {cargando ? <p className="text-muted">Cargando datos...</p> : contenido}
        </main>

      </div>
    </div>
  )
}
