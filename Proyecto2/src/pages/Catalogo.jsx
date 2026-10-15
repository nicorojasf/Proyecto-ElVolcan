import { Link, useParams } from 'react-router-dom'
import { productos, categorias } from '../data/productos'
import { useCarrito } from '../context/CarritoContext'
import TarjetaProducto from '../components/TarjetaProducto'

export default function Catalogo() {
  const { slug } = useParams()
  const { tipoCliente, setTipoCliente } = useCarrito()

  const categoria = categorias.find((c) => c.slug === slug)

  if (slug && !categoria) {
    return (
      <main className="container my-5" style={{ minHeight: '50vh' }}>
        <h2 className="text-naranja">Categoría no encontrada</h2>
        <Link to="/productos" className="btn btn-naranja rounded-pill px-4 mt-3">
          Ver todos los productos
        </Link>
      </main>
    )
  }

  const lista = categoria
    ? productos.filter((p) => p.categoria === categoria.nombre)
    : productos
  const titulo = categoria ? categoria.nombre : 'Todos los productos'

  return (
    <main className="container my-5">

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

      <div className="caja-titulo-pagina p-4 mb-4">
        <h2 className="fw-bold mb-1">{titulo}</h2>
        <p className="text-secondary m-0">
          Mostrando precios para cliente <strong>{tipoCliente}</strong>.
        </p>
      </div>

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

      <div className="row g-4 mb-5">
        {lista.map((p) => (
          <TarjetaProducto key={p.codigo} producto={p} />
        ))}
      </div>
    </main>
  )
}