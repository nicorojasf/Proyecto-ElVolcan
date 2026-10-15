import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Registro from '../pages/Registro'
import { AuthProvider } from '../context/AuthContext'
import { NotificacionProvider } from '../context/NotificacionContext'

const navegarMock = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, useNavigate: () => navegarMock }
})

describe('Registro', () => {
  it('con datos válidos guarda el usuario, avisa y navega a /login', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <NotificacionProvider>
          <AuthProvider>
            <Registro />
          </AuthProvider>
        </NotificacionProvider>
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre y Apellido'), 'Juan Pérez')
    await user.type(screen.getByLabelText('Correo Electrónico'), 'juan@duocuc.cl')
    await user.type(screen.getByLabelText('Teléfono / Celular'), '912345678')
    await user.type(screen.getByLabelText('Contraseña'), '123456')
    await user.type(screen.getByLabelText('Confirmar Contraseña'), '123456')
    await user.click(screen.getByRole('button', { name: 'Registrarse' }))

    expect(
      await screen.findByText('¡Cuenta creada con éxito, Juan Pérez! Ya puedes iniciar sesión.')
    ).toBeInTheDocument()
    expect(navegarMock).toHaveBeenCalledWith('/login')
    expect(JSON.parse(localStorage.getItem('usuariosRegistrados'))[0].email).toBe('juan@duocuc.cl')
  })
})
