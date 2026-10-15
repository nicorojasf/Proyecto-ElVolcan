import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import FormularioEntrega from '../components/FormularioEntrega'
import TablaPedido from '../components/TablaPedido'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificacionContext'
import { normalizarDireccion, validarCliente, validarDireccion } from '../data/direccion'
import { armarItems, procesarPago } from '../data/pedidosStore'

function valoresIniciales(sesion, usuarioActual) {
  const [nombre = '', ...resto] = (sesion?.nombre || '').split(' ')
  return {
    nombre,
    apellidos: resto.join(' '),
    correo: sesion?.email || '',
    ...normalizarDireccion(usuarioActual?.direccion),
  }
}

function separar(c) {
  return {
    cliente: { nombre: c.nombre.trim(), apellidos: c.apellidos.trim(), correo: c.correo.trim() },
    direccion: {
      calle: c.calle.trim(),
      numero: c.numero,
      tipo: c.tipo,
      depto: c.tipo === 'departamento' ? c.depto.trim() : '',
      region: c.region,
      comuna: c.comuna,
      indicaciones: c.indicaciones.trim(),
    },
  }
}

function Pagina({ children }) {
  return (
    <main className="container my-5">
      <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{ maxWidth: 900 }}>
        {children}
      </div>
    </main>
  )
}

function CajaTotal({ texto, total }) {
  return (
    <div className="border rounded-4 shadow-sm text-center fw-bold fs-5 p-3 my-3">
      {texto}: ${total.toLocaleString('es-CL')}
    </div>
  )
}

export default function Checkout() {
  const { carrito, total, precioDe, vaciar } = useCarrito()
  const { sesion, usuarioActual, guardarDireccion } = useAuth()
  const { notificar } = useNotificacion()

  const [campos, setCampos] = useState(() => valoresIniciales(sesion, usuarioActual))
  const [errores, setErrores] = useState({})
  const [orden, setOrden] = useState(null)

  if (!sesion) return <Navigate to="/login" replace />

  const cambiar = (e) => {
    const { name, value } = e.target
    const limpio = name === 'numero' ? value.replace(/\D/g, '').slice(0, 6) : value
    setCampos((prev) => ({
      ...prev,
      [name]: limpio,
      ...(name === 'region' ? { comuna: '' } : {}),
    }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  const elegirTipo = (tipo) => {
    setCampos((prev) => ({ ...prev, tipo, depto: tipo === 'casa' ? '' : prev.depto }))
    setErrores((prev) => ({ ...prev, depto: '' }))
  }

  const pagar = () => {
    const nuevos = { ...validarCliente(campos), ...validarDireccion(campos) }
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const { cliente, direccion } = separar(campos)
    const resultado = procesarPago({ carrito, precioDe, cliente, direccion, email: sesion.email })

    if (resultado.estado === 'pagado') {
      guardarDireccion(sesion.email, direccion)
      vaciar()
    }
    setOrden(resultado)
  }

  if (orden) {
    const exito = orden.estado === 'pagado'

    return (
      <Pagina>
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-1">
          <h2 className="h3 fw-bold d-flex align-items-center gap-2 mb-0">
            <i className={`bi ${exito ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'}`}></i>
            {exito ? 'Se ha realizado la compra.' : 'No se pudo realizar el pago.'} nro #{orden.numero}
          </h2>
          {exito && <small className="text-muted">Código orden: {orden.codigo}</small>}
        </div>
        <p className="text-muted">{exito ? 'Detalle de la compra' : 'Detalle de compra'}</p>

        {!exito && (
          <>
            <div className="alert alert-danger">{orden.motivo}</div>
            <div className="text-center mb-4 no-imprimir">
              <button
                type="button"
                className="btn btn-success btn-lg px-5 text-uppercase"
                onClick={() => setOrden(null)}
              >
                Volver a realizar el pago
              </button>
            </div>
          </>
        )}

        <FormularioEntrega valores={{ ...orden.cliente, ...orden.direccion }} soloLectura />
        <TablaPedido items={orden.items} />
        <CajaTotal texto="Total pagado" total={orden.total} />

        {exito && (
          <div className="d-flex flex-wrap justify-content-center gap-2 no-imprimir">
            <button type="button" className="btn btn-danger btn-sm" onClick={() => window.print()}>
              Imprimir boleta en PDF
            </button>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => notificar(`Boleta enviada a ${orden.cliente.correo}.`)}
            >
              Enviar boleta por email
            </button>
            <Link to="/productos" className="btn btn-outline-secondary btn-sm">
              Seguir comprando
            </Link>
          </div>
        )}
      </Pagina>
    )
  }

  if (carrito.length === 0) {
    return (
      <Pagina>
        <h2 className="h3 fw-bold">Tu carrito está vacío</h2>
        <p className="text-muted">Agrega productos antes de finalizar la compra.</p>
        <Link to="/productos" className="btn btn-naranja rounded-pill px-4">Ver productos</Link>
      </Pagina>
    )
  }

  return (
    <Pagina>
      <h2 className="h3 fw-bold mb-1">Finalizar compra</h2>
      <p className="text-muted">Completa la siguiente información</p>

      <form onSubmit={(e) => { e.preventDefault(); pagar() }} noValidate>
        <FormularioEntrega
          valores={campos}
          errores={errores}
          onChange={cambiar}
          onTipo={elegirTipo}
        />

        <TablaPedido items={armarItems(carrito, precioDe)} />
        <CajaTotal texto="Total a pagar" total={total} />

        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-naranja py-2 rounded-pill fw-semibold">
            Confirmar y pagar
          </button>
          <Link to="/productos" className="btn btn-outline-secondary py-2 rounded-pill">
            Seguir comprando
          </Link>
        </div>
      </form>
    </Pagina>
  )
}
