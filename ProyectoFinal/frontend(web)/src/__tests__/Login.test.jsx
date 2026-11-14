import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'
import * as api from '../services/api'
import { AuthProvider } from '../context/AuthContext'
import { NotificacionProvider } from '../context/NotificacionContext'

// El login ahora va a auth-service: se simula la respuesta del backend
vi.mock('../services/api', () => ({
  login: vi.fn(),
  registrarUsuario: vi.fn(),
  borrarToken: vi.fn(),
}))

const navegarMock = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, useNavigate: () => navegarMock }
})

describe('Login', () => {
  // PRUEBA 10: login correcto contra auth-service (simulado) y mock de useNavigate
  it('un usuario registrado inicia sesión, recibe bienvenida y va a "/"', async () => {
    api.login.mockResolvedValue({
      token: 'jwt-falso',
      usuario: { id: 1, nombre: 'Ana', email: 'ana@duocuc.cl', rol: 'CLIENTE', tipoCliente: 'RESIDENCIAL' },
    })
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
    expect(api.login).toHaveBeenCalledWith('ana@duocuc.cl', '123456')
    expect(navegarMock).toHaveBeenCalledWith('/')
  })

  it('con credenciales incorrectas muestra el error y no navega', async () => {
    navegarMock.mockClear()
    const error = new Error('Credenciales inválidas')
    error.status = 401
    api.login.mockRejectedValue(error)
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
    await user.type(screen.getByLabelText('Contraseña'), 'mala-clave')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
    expect(navegarMock).not.toHaveBeenCalled()
  })
})
