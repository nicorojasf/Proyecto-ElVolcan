import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Inicio from '../pages/Inicio'

// Inicio usa useNavigate y Link, por eso necesita un Router
const renderInicio = () =>
  render(
    <MemoryRouter>
      <Inicio />
    </MemoryRouter>
  )

describe('Inicio - formulario de pedido rápido', () => {
  // PRUEBA 8: el input solo acepta numeros, maximo 9
  it('el input solo acepta números y máximo 9 dígitos', async () => {
    const user = userEvent.setup()
    renderInicio()

    const input = screen.getByPlaceholderText('Ingresa tu número')
    await user.type(input, '9a1b2c3d4e5f6g7h8i999')

    expect(input).toHaveValue('912345678')
  })

  // PRUEBA 9: celular invalido muestra error
  it('muestra error si el celular es inválido', async () => {
    const user = userEvent.setup()
    renderInicio()

    await user.type(screen.getByPlaceholderText('Ingresa tu número'), '123')
    await user.click(screen.getByRole('button', { name: 'Pedir gas Online' }))

    expect(
      screen.getByText('Ingresa un celular válido de 9 dígitos que comience con 9.')
    ).toBeInTheDocument()
  })
})
