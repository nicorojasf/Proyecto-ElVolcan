import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CarritoProvider, useCarrito } from '../context/CarritoContext'

const cilindro = {
  codigo: 'CL001',
  nombre: 'Cilindro GLP 5 kg',
  precioResidencial: 6500,
  precioComercial: 6000,
  stock: 2,
}

const renderCarrito = () =>
  renderHook(() => useCarrito(), { wrapper: CarritoProvider })

describe('CarritoContext', () => {
  
  it('no permite superar el stock disponible', () => {
    const { result } = renderCarrito()

    act(() => result.current.agregar(cilindro))
    act(() => result.current.agregar(cilindro))
    act(() => result.current.agregar(cilindro))

    expect(result.current.carrito[0].cantidad).toBe(2)
  })
})
