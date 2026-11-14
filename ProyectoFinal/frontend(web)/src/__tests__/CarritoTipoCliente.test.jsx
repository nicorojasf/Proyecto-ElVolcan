import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../context/AuthContext'
import { CarritoProvider, useCarrito } from '../context/CarritoContext'

const envoltorio = ({ children }) => (
  <AuthProvider>
    <CarritoProvider>{children}</CarritoProvider>
  </AuthProvider>
)

// Deja una sesión vigente guardada, como si la persona ya hubiera iniciado sesión
const iniciarSesionEnStorage = (tipoCliente) =>
  localStorage.setItem(
    'sesionActiva',
    JSON.stringify({
      id: 1, nombre: 'Ana', email: 'ana@duocuc.cl', esAdmin: false,
      tipoCliente, expira: Date.now() + 60 * 60 * 1000,
    })
  )

describe('Carrito: el tipo de cliente lo define la cuenta', () => {
  it('con una cuenta COMERCIAL usa precios comerciales y no se puede cambiar', () => {
    iniciarSesionEnStorage('COMERCIAL')
    const { result } = renderHook(() => useCarrito(), { wrapper: envoltorio })

    expect(result.current.tipoCliente).toBe('comercial')
    expect(result.current.tipoBloqueado).toBe(true)

    act(() => result.current.setTipoCliente('residencial'))
    expect(result.current.tipoCliente).toBe('comercial')
  })

  it('con una cuenta RESIDENCIAL no puede forzar precios comerciales', () => {
    iniciarSesionEnStorage('RESIDENCIAL')
    const { result } = renderHook(() => useCarrito(), { wrapper: envoltorio })

    act(() => result.current.setTipoCliente('comercial'))
    expect(result.current.tipoCliente).toBe('residencial')
  })

  it('un visitante sin sesión sí puede elegir el tipo', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper: envoltorio })

    expect(result.current.tipoBloqueado).toBe(false)
    act(() => result.current.setTipoCliente('comercial'))
    expect(result.current.tipoCliente).toBe('comercial')
  })

  it('el ADMIN puede ver los precios de ambos tipos, pero el cobro sigue el tipo de su cuenta', () => {
    localStorage.setItem(
      'sesionActiva',
      JSON.stringify({
        id: 9, nombre: 'Admin', email: 'admin@admin.cl', rol: 'ADMIN', esAdmin: true,
        tipoCliente: 'COMERCIAL', expira: Date.now() + 60 * 60 * 1000,
      })
    )
    const { result } = renderHook(() => useCarrito(), { wrapper: envoltorio })
    const producto = { precioResidencial: 12000, precioComercial: 11000 }

    act(() => result.current.setTipoVista('residencial'))
    expect(result.current.tipoVista).toBe('residencial')
    expect(result.current.precioDe(producto, result.current.tipoVista)).toBe(12000)

    act(() => result.current.setTipoVista('comercial'))
    expect(result.current.tipoVista).toBe('comercial')

    // El carrito y el cobro no cambian: siempre el tipo de la cuenta
    expect(result.current.tipoCliente).toBe('comercial')
    expect(result.current.precioDe(producto)).toBe(11000)
  })

  it('un CLIENTE no puede cambiar la vista de precios', () => {
    iniciarSesionEnStorage('RESIDENCIAL')
    const { result } = renderHook(() => useCarrito(), { wrapper: envoltorio })

    expect(result.current.vistaBloqueada).toBe(true)
    act(() => result.current.setTipoVista('comercial'))
    expect(result.current.tipoVista).toBe('residencial')
  })
})
