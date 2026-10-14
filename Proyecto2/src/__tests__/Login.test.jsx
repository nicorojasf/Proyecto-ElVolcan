import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'

// MOCK: useNavigate como función espía para verificar a dónde redirige
const navegarMock = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, useNavigate: () => navegarMock }
})

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  )

// Escribe credenciales y envía el formulario
async function ingresar(user, email, password) {
  if (email) await user.type(screen.getByLabelText('Correo Electrónico'), email)
  if (password) await user.type(screen.getByLabelText('Contraseña'), password)
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('Login', () => {
  beforeEach(() => {
    navegarMock.mockClear()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('muestra errores de validación si los campos están vacíos', async () => {
    const user = userEvent.setup()
    renderLogin()

    await ingresar(user)

    expect(screen.getByText('Ingrese un correo válido.')).toBeInTheDocument()
    expect(screen.getByText('Ingrese su contraseña.')).toBeInTheDocument()
    expect(navegarMock).not.toHaveBeenCalled()
  })

  it('avisa credenciales incorrectas si el usuario no está registrado', async () => {
    const user = userEvent.setup()
    renderLogin()

    await ingresar(user, 'nadie@duocuc.cl', 'clave123')

    expect(window.alert).toHaveBeenCalledWith('Credenciales incorrectas o usuario no registrado.')
    expect(navegarMock).not.toHaveBeenCalled()
  })

  it('un usuario registrado inicia sesión, recibe bienvenida y va a "/"', async () => {
    // Usuario previo en localStorage (el AuthProvider lo lee al montarse)
    localStorage.setItem(
      'usuariosRegistrados',
      JSON.stringify([
        { nombre: 'Ana', email: 'ana@duocuc.cl', telefono: '912345678', password: '123456' },
      ])
    )
    const user = userEvent.setup()
    renderLogin()

    await ingresar(user, 'ana@duocuc.cl', '123456')

    expect(window.alert).toHaveBeenCalledWith('¡Bienvenido de vuelta, Ana!')
    expect(navegarMock).toHaveBeenCalledWith('/')
  })

  it('la cuenta administradora redirige a /admin', async () => {
    const user = userEvent.setup()
    renderLogin()

    await ingresar(user, 'admin@admin.cl', 'cualquiera')

    expect(navegarMock).toHaveBeenCalledWith('/admin')
  })
})
