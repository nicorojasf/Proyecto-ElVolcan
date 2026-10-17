import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TarjetaProducto from '../components/TarjetaProducto'
import { CarritoProvider } from '../context/CarritoContext'

const producto = {
  codigo: 'CL001',
  categoria: 'Cilindros de Gas',
  nombre: 'Cilindro GLP 5 kg',
  descripcion: 'Cilindro de 5 kg',
  unidad: 'Unidad',
  precioResidencial: 6500,
  precioComercial: 6000,
  stock: 1,
  img: '/imagenes/c5k.png',
}

// La tarjeta necesita el Provider porque usa useCarrito()
const renderTarjeta = (p = producto) =>
  render(
    <CarritoProvider>
      <TarjetaProducto producto={p} />
    </CarritoProvider>
  )

describe('TarjetaProducto', () => {
 
  it('muestra nombre y precio formateado en pesos chilenos', () => {
    renderTarjeta()

    expect(screen.getByText('Cilindro GLP 5 kg')).toBeInTheDocument()
  
    expect(screen.getByText('$6.500')).toBeInTheDocument()
  })

 
  it('muestra "Agotado" y deshabilita el botón si no hay stock', () => {
    renderTarjeta({ ...producto, stock: 0 })

    const boton = screen.getByRole('button', { name: 'Agotado' })
    expect(boton).toBeDisabled()
  })

  
  it('al hacer clic cambia a "Máximo en carrito" cuando se alcanza el stock', async () => {
    const user = userEvent.setup()
    renderTarjeta()   

    await user.click(screen.getByRole('button', { name: 'Añadir al Carrito' }))

    const boton = screen.getByRole('button', { name: 'Máximo en carrito' })
    expect(boton).toBeDisabled()
  })
})