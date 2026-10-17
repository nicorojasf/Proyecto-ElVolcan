import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'
import { NotificacionProvider } from '../context/NotificacionContext'

const navegarMock = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, useNavigate: () => navegarMock }
})

describe('Login', () => {
  // PRUEBA 10: login correcto, mock de useNavigate
  it('un usuario registrado inicia sesión, recibe bienvenida y va a "/"', async () => {
    localStorage.setItem(
      'usuariosRegistrados',
      JSON.stringify([
        { nombre: 'Ana', email: 'ana@duocuc.cl', telefono: '912345678', password: '123456' },
      ])
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <NotificacionProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </NotificacionProvider>
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Correo Electrónico'), 'ana@duocuc.cl')
    await user.type(screen.getByLabelText('Contraseña'), '123456')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('¡Bienvenido de vuelta, Ana!')).toBeInTheDocument()
    expect(navegarMock).toHaveBeenCalledWith('/')
  })
})
