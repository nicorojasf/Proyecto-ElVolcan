import { createContext, useContext, useEffect, useState } from 'react'

const CarritoContext = createContext()
export const useCarrito = () => useContext(CarritoContext)

export function CarritoProvider({ children }) {

  const [carrito, setCarrito] = useState(() =>
    (JSON.parse(localStorage.getItem('carrito')) || []).filter((p) => p.codigo)
  )

  const [tipoCliente, setTipoCliente] = useState(
    () => localStorage.getItem('tipoCliente') || 'residencial'
  )

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito))
  }, [carrito])

  useEffect(() => {
    localStorage.setItem('tipoCliente', tipoCliente)
  }, [tipoCliente])

  const precioDe = (producto) =>
    tipoCliente === 'comercial' ? producto.precioComercial : producto.precioResidencial

  const agregar = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.codigo === producto.codigo)
      if (existe) {
        if (existe.cantidad >= producto.stock) return prev
        return prev.map((p) =>
          p.codigo === producto.codigo ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

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

  const vaciar = () => setCarrito([])

  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0)
  const total = carrito.reduce((acc, p) => acc + precioDe(p) * p.cantidad, 0)

  return (
    <CarritoContext.Provider
      value={{ carrito, agregar, cambiarCantidad, vaciar, totalItems, total, tipoCliente, setTipoCliente, precioDe }}
    >
      {children}
    </CarritoContext.Provider>
  )
}