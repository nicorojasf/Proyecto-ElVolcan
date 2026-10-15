import { useState } from 'react'
import { useCarrito } from '../context/CarritoContext'
import { categorias } from '../data/productos'

export default function TarjetaProducto({ producto }) {
  const { carrito, agregar, precioDe } = useCarrito()
  const [agregado, setAgregado] = useState(false)

  const enCarrito = carrito.find((p) => p.codigo === producto.codigo)?.cantidad || 0
  const sinStock = producto.stock === 0
  const llegoAlMaximo = enCarrito >= producto.stock
  const pocasUnidades = producto.stock > 0 && producto.stock <= 10
  const icono = categorias.find((c) => c.nombre === producto.categoria)?.icono

  const handleClick = () => {
    agregar(producto)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1000)
  }

  const textoBoton = () => {
    if (sinStock) return 'Agotado'
    if (llegoAlMaximo) return 'Máximo en carrito'
    if (agregado) return '¡Agregado! ✓'
    return 'Añadir al Carrito'
  }

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
      <div className="tarjeta-custom p-4 text-center d-flex flex-column justify-content-between h-100">
        <div>
          <div className="contenedor-imagen-producto mb-3 d-flex align-items-center justify-content-center">
            {producto.img ? (
              <img src={producto.img} alt={producto.nombre} className="img-fluid img-cilindro" />
            ) : (
              <i className={`bi ${icono} fs-1 text-naranja`}></i>
            )}
          </div>

          <small className="text-muted d-block mb-1">{producto.codigo}</small>
          <h5 className="fw-bold text-dark mb-1">{producto.nombre}</h5>
          <p className="text-muted small mb-3">{producto.descripcion}</p>

          <h4 className="fw-bold text-naranja mb-1">
            ${precioDe(producto).toLocaleString('es-CL')}
          </h4>
          <small className="text-muted d-block mb-2">por {producto.unidad.toLowerCase()}</small>

          {pocasUnidades && (
            <span className="badge bg-warning text-dark mb-3">
              ¡Quedan solo {producto.stock}!
            </span>
          )}
        </div>

        <button
          className={`btn btn-naranja w-100 rounded-pill fw-semibold py-2 ${
            agregado ? 'bg-success text-white' : ''
          }`}
          onClick={handleClick}
          disabled={sinStock || llegoAlMaximo}
        >
          {textoBoton()}
        </button>
      </div>
    </div>
  )
}