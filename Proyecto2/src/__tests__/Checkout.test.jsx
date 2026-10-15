import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Checkout from '../pages/Checkout'
import { AuthProvider } from '../context/AuthContext'
import { CarritoProvider } from '../context/CarritoContext'
import { NotificacionProvider } from '../context/NotificacionContext'

const REGION = 'Región Metropolitana de Santiago'

const cilindro5 = {
  codigo: 'CL001',
  nombre: 'Cilindro GLP 5 kg',
  precioResidencial: 6500,
  precioComercial: 6000,
  stock: 10,
  img: '/imagenes/c5k.png',
}

const cilindro45 = {
  codigo: 'CL004',
  nombre: 'Cilindro GLP 45 kg',
  precioResidencial: 45000,
  precioComercial: 40000,
  stock: 30,
  img: '/imagenes/c45k.png',
}

function prepararDatos(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito))
  localStorage.setItem(
    'usuariosRegistrados',
    JSON.stringify([
      { nombre: 'Ana Pérez', email: 'ana@duocuc.cl', telefono: '912345678', password: '123456' },
    ])
  )
  localStorage.setItem(
    'sesionActiva',
    JSON.stringify({ nombre: 'Ana Pérez', email: 'ana@duocuc.cl', esAdmin: false })
  )
}

const renderCheckout = () =>
  render(
    <MemoryRouter initialEntries={['/checkout']}>
      <NotificacionProvider>
        <AuthProvider>
          <CarritoProvider>
            <Routes>
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </CarritoProvider>
        </AuthProvider>
      </NotificacionProvider>
    </MemoryRouter>
  )

async function llenarDireccion(user) {
  await user.type(screen.getByLabelText('Calle'), 'Av. Libertad')
  await user.type(screen.getByLabelText('Número'), '123')
  await user.selectOptions(screen.getByLabelText('Región'), REGION)
  await user.selectOptions(screen.getByLabelText('Comuna'), 'Cerrillos')
}

const usuarioGuardado = () => JSON.parse(localStorage.getItem('usuariosRegistrados'))[0]

describe('Checkout', () => {
  it('pago exitoso: muestra la boleta, guarda la dirección y vacía el carrito', async () => {
    const user = userEvent.setup()
    prepararDatos([{ ...cilindro5, cantidad: 1 }])
    renderCheckout()

    await llenarDireccion(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar y pagar' }))

    expect(screen.getByText(/Se ha realizado la compra\. nro #\d+/)).toBeInTheDocument()
    expect(screen.getByText('Total pagado: $6.500')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('carrito'))).toHaveLength(0)
    expect(usuarioGuardado().direccion).toMatchObject({
      calle: 'Av. Libertad',
      numero: '123',
      region: REGION,
      comuna: 'Cerrillos',
    })
    expect(JSON.parse(localStorage.getItem('pedidos'))[0].estado).toBe('pagado')
  })

  it('pago fallido: explica el motivo, conserva el carrito y no guarda la dirección', async () => {
    const user = userEvent.setup()
    prepararDatos([{ ...cilindro45, cantidad: 13 }])
    renderCheckout()

    await llenarDireccion(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar y pagar' }))

    expect(screen.getByText(/No se pudo realizar el pago\. nro #\d+/)).toBeInTheDocument()
    expect(screen.getByText(/Stock insuficiente de Cilindro GLP 45 kg/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('carrito'))).toHaveLength(1)
    expect(usuarioGuardado().direccion).toBeUndefined()
    expect(JSON.parse(localStorage.getItem('pedidos'))[0].estado).toBe('fallido')
  })
})
