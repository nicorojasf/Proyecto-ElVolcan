import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Registro from '../pages/Registro'
import { AuthProvider } from '../context/AuthContext'

// MOCK: reemplazamos useNavigate por una función espía, el resto de react-router-dom queda real
const navegarMock = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, useNavigate: () => navegarMock }
})

// Registro usa useAuth(), Link y useNavigate: necesita ambos Providers
const renderRegistro = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Registro />
      </AuthProvider>
    </MemoryRouter>
  )

// Completa el formulario con datos válidos (cada test puede sobrescribir un campo)
async function llenarFormulario(user, datos = {}) {
  const v = {
    nombre: 'Juan Pérez',
    email: 'juan@duocuc.cl',
    telefono: '912345678',
    contrasena: '123456',
    confirmar: '123456',
    ...datos,
  }
  await user.type(screen.getByLabelText('Nombre y Apellido'), v.nombre)
  await user.type(screen.getByLabelText('Correo Electrónico'), v.email)
  await user.type(screen.getByLabelText('Teléfono / Celular'), v.telefono)
  await user.type(screen.getByLabelText('Contraseña'), v.contrasena)
  await user.type(screen.getByLabelText('Confirmar Contraseña'), v.confirmar)
}

describe('Registro - validación del formulario', () => {
  beforeEach(() => {
    navegarMock.mockClear()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('muestra errores y no navega si el formulario está vacío', async () => {
    const user = userEvent.setup()
    renderRegistro()

    await user.click(screen.getByRole('button', { name: 'Registrarse' }))

    expect(screen.getByText('El nombre y apellido son obligatorios.')).toBeInTheDocument()
    expect(screen.getByText(/correo institucional \(@duocuc\.cl\)/)).toBeInTheDocument()
    expect(screen.getByText('La contraseña debe contener al menos 6 caracteres.')).toBeInTheDocument()
    expect(navegarMock).not.toHaveBeenCalled()
  })

  it('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    renderRegistro()

    await llenarFormulario(user, { confirmar: '654321' })
    await user.click(screen.getByRole('button', { name: 'Registrarse' }))

    expect(screen.getByText('Las contraseñas no coinciden. Verifíquelas.')).toBeInTheDocument()
    expect(navegarMock).not.toHaveBeenCalled()
  })

  it('con datos válidos guarda el usuario, avisa y navega a /login', async () => {
    const user = userEvent.setup()
    renderRegistro()

    await llenarFormulario(user)
    await user.click(screen.getByRole('button', { name: 'Registrarse' }))

    expect(window.alert).toHaveBeenCalledWith(
      '¡Cuenta creada con éxito, Juan Pérez! Ya puedes iniciar sesión.'
    )
    expect(navegarMock).toHaveBeenCalledWith('/login')
    // AuthProvider persiste los usuarios en localStorage
    expect(JSON.parse(localStorage.getItem('usuariosRegistrados'))[0].email).toBe('juan@duocuc.cl')
  })
})
