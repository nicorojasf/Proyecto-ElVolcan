import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CarritoProvider, useCarrito } from '../context/CarritoContext'

// Producto de ejemplo para no depender de productos.js
const cilindro = {
  codigo: 'CL001',
  nombre: 'Cilindro GLP 5 kg',
  precioResidencial: 6500,
  precioComercial: 6000,
  stock: 2,
}

// Renderiza el hook "useCarrito" dentro de su Provider
const renderCarrito = () =>
  renderHook(() => useCarrito(), { wrapper: CarritoProvider })

describe('CarritoContext', () => {
  it('agrega un producto y calcula el total con precio residencial', () => {
    const { result } = renderCarrito()

    act(() => result.current.agregar(cilindro))

    expect(result.current.carrito).toHaveLength(1)
    expect(result.current.totalItems).toBe(1)
    expect(result.current.total).toBe(6500)
  })

  it('no permite superar el stock disponible', () => {
    const { result } = renderCarrito()

    // El stock es 2, pero intentamos agregar 3 veces
    act(() => result.current.agregar(cilindro))
    act(() => result.current.agregar(cilindro))
    act(() => result.current.agregar(cilindro))

    expect(result.current.carrito[0].cantidad).toBe(2)
  })

  it('usa precio comercial al cambiar el tipo de cliente', () => {
    const { result } = renderCarrito()

    act(() => result.current.agregar(cilindro))
    act(() => result.current.setTipoCliente('comercial'))

    expect(result.current.total).toBe(6000)
  })

  it('elimina el producto cuando la cantidad llega a 0', () => {
    const { result } = renderCarrito()

    act(() => result.current.agregar(cilindro))
    act(() => result.current.cambiarCantidad('CL001', -1))

    expect(result.current.carrito).toHaveLength(0)
  })
})