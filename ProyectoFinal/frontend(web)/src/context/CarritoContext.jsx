import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const CarritoContext = createContext()
export const useCarrito = () => useContext(CarritoContext)

export function CarritoProvider({ children }) {

  // El .filter descarta carritos guardados con el formato antiguo (sin 'codigo')
  const [carrito, setCarrito] = useState(() =>
    (JSON.parse(localStorage.getItem('carrito')) || []).filter((p) => p.codigo)
  )

  // useAuth() es undefined si no hay AuthProvider (por ejemplo, en algunos tests)
  const auth = useAuth()
  const tipoDeLaCuenta = auth?.sesion?.tipoCliente?.toLowerCase()

  // ¿Precios residenciales o comerciales? Un visitante sin sesión puede elegir libremente.
  // Con sesión manda el tipo de la cuenta: order-service cobra según el tipo que viene en el token,
  // así el total que se muestra siempre coincide con el que se cobra.
  const [tipoElegido, setTipoElegido] = useState(
    () => localStorage.getItem('tipoCliente') || 'residencial'
  )
  const tipoCliente = tipoDeLaCuenta ?? tipoElegido
  const tipoBloqueado = Boolean(tipoDeLaCuenta)
  const setTipoCliente = (tipo) => {
    if (!tipoBloqueado) setTipoElegido(tipo)
  }

  // Admin y vendedor pueden VER los precios de ambos tipos de cliente (solo para consultar el catálogo).
  // El carrito y el cobro siguen usando el tipo de su cuenta, porque order-service cobra según el token.
  const esPersonal = Boolean(auth?.sesion?.esAdmin || auth?.sesion?.esVendedor)
  const [tipoVistaPersonal, setTipoVistaPersonal] = useState('residencial')
  const tipoVista = esPersonal ? tipoVistaPersonal : tipoCliente
  const vistaBloqueada = tipoBloqueado && !esPersonal
  const setTipoVista = (tipo) => {
    if (esPersonal) setTipoVistaPersonal(tipo)
    else setTipoCliente(tipo)
  }

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito))
  }, [carrito])

  useEffect(() => {
    localStorage.setItem('tipoCliente', tipoElegido)
  }, [tipoElegido])

  // Devuelve el precio que corresponde según el tipo de cliente actual
  const precioDe = (producto, tipo = tipoCliente) =>
    tipo === 'comercial' ? producto.precioComercial : producto.precioResidencial

  // Agrega un producto, pero nunca más unidades que el stock disponible
  const agregar = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.codigo === producto.codigo)
      if (existe) {
        if (existe.cantidad >= producto.stock) return prev   // sin stock: no cambia nada
        return prev.map((p) =>
          p.codigo === producto.codigo ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  // Suma o resta; la cantidad nunca supera el stock y al llegar a 0 se elimina
  const cambiarCantidad = (codigo, cambio) => {
    setCarrito((prev) =>
      prev
        .map((p) =>
          p.codigo === codigo
            ? { ...p, cantidad: Math.min(p.cantidad + cambio, p.stock) }
            : p
        )
        .filter((p) => p.cantidad > 0)
    )
  }

  // Deja el carrito vacío (se usa después de una compra exitosa)
  const vaciar = () => setCarrito([])

  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0)
  const total = carrito.reduce((acc, p) => acc + precioDe(p) * p.cantidad, 0)

  return (
    <CarritoContext.Provider
      value={{ carrito, agregar, cambiarCantidad, vaciar, totalItems, total, tipoCliente, setTipoCliente, tipoBloqueado, tipoVista, setTipoVista, vistaBloqueada, esPersonal, precioDe }}
    >
      {children}
    </CarritoContext.Provider>
  )
}