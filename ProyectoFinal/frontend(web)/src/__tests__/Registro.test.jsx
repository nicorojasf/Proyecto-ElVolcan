import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Registro from '../pages/Registro'
import * as api from '../services/api'
import { AuthProvider } from '../context/AuthContext'
import { NotificacionProvider } from '../context/NotificacionContext'

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

const renderizar = () =>
  render(
    <MemoryRouter>
      <NotificacionProvider>
        <AuthProvider>
          <Registro />
        </AuthProvider>
      </NotificacionProvider>
    </MemoryRouter>
  )

async function llenar(user) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
  await user.type(screen.getByLabelText('Correo Electrónico'), 'ANA@duocuc.cl')
  await user.type(screen.getByLabelText('Teléfono celular'), '912345678')
  await user.type(screen.getByLabelText('Contraseña'), '123456')
  await user.type(screen.getByLabelText('Repetir contraseña'), '123456')
}

describe('Registro', () => {
  beforeEach(() => {
    navegarMock.mockClear()
    api.registrarUsuario.mockReset()
  })

  it('con el formulario vacío muestra errores y no llama al servidor', async () => {
    const user = userEvent.setup()
    renderizar()

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('Ingresa tu nombre.')).toBeInTheDocument()
    expect(api.registrarUsuario).not.toHaveBeenCalled()
  })

  it('envía el correo en minúsculas y el tipo de cuenta elegido, y va al login', async () => {
    api.registrarUsuario.mockResolvedValue({ id: 1 })
    const user = userEvent.setup()
    renderizar()

    await llenar(user)
    await user.selectOptions(screen.getByLabelText('Tipo de cuenta'), 'COMERCIAL')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Cuenta creada correctamente. Ya puedes iniciar sesión.')).toBeInTheDocument()
    expect(api.registrarUsuario).toHaveBeenCalledWith({
      nombre: 'Ana Pérez',
      email: 'ana@duocuc.cl',
      telefono: '912345678',
      password: '123456',
      tipoCliente: 'COMERCIAL',
    })
    expect(navegarMock).toHaveBeenCalledWith('/login')
  })

  it('por defecto crea la cuenta como RESIDENCIAL', async () => {
    api.registrarUsuario.mockResolvedValue({ id: 1 })
    const user = userEvent.setup()
    renderizar()

    await llenar(user)
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await screen.findByText('Cuenta creada correctamente. Ya puedes iniciar sesión.')
    expect(api.registrarUsuario.mock.calls[0][0].tipoCliente).toBe('RESIDENCIAL')
  })

  it('si el servidor rechaza el correo (ya existe) lo muestra bajo el campo', async () => {
    const error = new Error('Este correo ya se encuentra registrado.')
    error.status = 409
    api.registrarUsuario.mockRejectedValue(error)
    const user = userEvent.setup()
    renderizar()

    await llenar(user)
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Este correo ya se encuentra registrado.')).toBeInTheDocument()
    expect(navegarMock).not.toHaveBeenCalled()
  })
})
