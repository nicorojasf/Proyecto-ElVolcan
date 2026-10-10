import { Offcanvas } from 'react-bootstrap'
import { useCarrito } from '../context/CarritoContext'

export default function Carrito({ show, onHide }) {
  const { carrito, cambiarCantidad, total, precioDe } = useCarrito()
  return (
    <Offcanvas show={show} onHide={onHide} placement="end" id="offcanvasCarrito">
      <Offcanvas.Header closeButton className="border-bottom bg-light">
        <Offcanvas.Title className="fw-bold text-dark d-flex align-items-center gap-2">
          <i className="bi bi-cart3 text-naranja"></i> Tu Carrito
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column justify-content-between p-3">

        <div className="d-flex flex-column gap-3 overflow-auto">
          {carrito.length === 0 ? (
            <p className="text-center text-muted my-4">El carrito está vacío.</p>
          ) : (
            carrito.map((p) => (
              <div
                key={p.codigo}
                className="d-flex align-items-center justify-content-between p-2 border rounded bg-white shadow-sm"
              >
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={p.img}
                    alt={p.nombre}
                    style={{ width: 40, height: 40, objectFit: 'contain' }}
                  />
                  <div>
                    <h6 className="mb-0 fw-bold fs-6 text-dark">{p.nombre}</h6>
                    <small className="text-muted">${precioDe(p).toLocaleString('es-CL')}</small>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary py-0 px-2"
                    onClick={() => cambiarCantidad(p.codigo, -1)}
                  >
                    -
                  </button>
                  <span className="fw-bold text-dark">{p.cantidad}</span>
                  <button
                    className="btn btn-sm btn-outline-secondary py-0 px-2"
                    onClick={() => cambiarCantidad(p.codigo, 1)}
                    disabled={p.cantidad >= p.stock}
                    >
                    +
                    </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-top pt-3 mt-3">
          <div className="d-flex justify-content-between align-items-center mb-3 fs-5 fw-bold text-dark">
            <span>Total:</span>
            <span className="text-naranja">${total.toLocaleString('es-CL')}</span>
          </div>
          <button
            className="btn btn-naranja w-100 py-2 rounded-pill fw-semibold"
            disabled={carrito.length === 0}
          >
            Ir a Pagar
          </button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  )
}