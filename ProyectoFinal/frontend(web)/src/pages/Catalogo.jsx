import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categorias } from '../data/productos'
import { getProductos } from '../services/api'
import { useCarrito } from '../context/CarritoContext'
import TarjetaProducto from '../components/TarjetaProducto'

export default function Catalogo() {
  const { slug } = useParams()   // lee la parte variable de la URL: /productos/:slug
  const { tipoCliente, setTipoCliente } = useCarrito()

  // ESTADOS de la carga de productos desde el backend
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)   // sube en 1 al presionar "Reintentar"

  const categoria = categorias.find((c) => c.slug === slug)   // undefined en "/productos"
  const categoriaInvalida = slug && !categoria

  // Pide los productos al backend cada vez que cambia la categoría de la URL
  // (los hooks siempre van ANTES de cualquier return)
  useEffect(() => {
    if (categoriaInvalida) return

    let cancelado = false   // evita guardar una respuesta vieja si el usuario ya cambió de página
    setCargando(true)
    setError('')

    getProductos(slug)
      .then((datos) => {
        if (!cancelado) setLista(datos)
      })
      .catch(() => {
        if (!cancelado) setError('No pudimos cargar los productos. Revisa que el servicio esté encendido.')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => { cancelado = true }
  }, [slug, categoriaInvalida, intento])

  // Si la URL trae una categoría que no existe
  if (categoriaInvalida) {
    return (
      <main className="container my-5" style={{ minHeight: '50vh' }}>
        <h2 className="text-naranja">Categoría no encontrada</h2>
        <Link to="/productos" className="btn btn-naranja rounded-pill px-4 mt-3">
          Ver todos los productos
        </Link>
      </main>
    )
  }

  const titulo = categoria ? categoria.nombre : 'Todos los productos'

  return (
    <main className="container my-5">

      {/* Migas de pan */}
      <div className="caja-breadcrumb d-inline-block px-3 py-2 mb-3">
        <nav aria-label="breadcrumb" className="m-0">
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none text-naranja fw-semibold">Inicio</Link>
            </li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
              {titulo}
            </li>
          </ol>
        </nav>
      </div>

      {/* Título */}
      <div className="caja-titulo-pagina p-4 mb-4">
        <h2 className="fw-bold mb-1">{titulo}</h2>
        <p className="text-secondary m-0">
          Mostrando precios para cliente <strong>{tipoCliente}</strong>.
        </p>
      </div>

      {/* Filtros de categoría + selector de tipo de cliente */}
      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
        <div className="d-flex flex-wrap gap-2">
          <Link
            to="/productos"
            className={`btn btn-selector btn-sm rounded-pill px-3 ${!categoria ? 'active' : ''}`}
          >
            Todos
          </Link>
          {categorias.map((c) => (
            <Link
              key={c.slug}
              to={`/productos/${c.slug}`}
              className={`btn btn-selector btn-sm rounded-pill px-3 ${
                categoria?.slug === c.slug ? 'active' : ''
              }`}
            >
              {c.nombre}
            </Link>
          ))}
        </div>

        <div className="d-flex gap-2">
          {['residencial', 'comercial'].map((t) => (
            <button
              key={t}
              className={`btn btn-selector btn-sm rounded-pill px-3 text-capitalize ${
                tipoCliente === t ? 'active' : ''
              }`}
              onClick={() => setTipoCliente(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Estado de la carga: cargando, error o productos */}
      {cargando && (
        <div className="text-center py-5">
          <div className="spinner-border text-naranja" role="status" />
          <p className="text-secondary mt-3 mb-0">Cargando productos...</p>
        </div>
      )}

      {!cargando && error && (
        <div className="alert alert-danger d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && lista.length === 0 && (
        <p className="text-secondary py-4">No hay productos disponibles en esta categoría.</p>
      )}

      {/* Grilla de productos */}
      {!cargando && !error && (
        <div className="row g-4 mb-5">
          {lista.map((p) => (
            <TarjetaProducto key={p.codigo} producto={p} />
          ))}
        </div>
      )}
    </main>
  )
}
