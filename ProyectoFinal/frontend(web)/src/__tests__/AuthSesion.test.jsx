import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { AuthProvider, useAuth } from '../context/AuthContext'

// Solo importa el comportamiento de la sesión guardada, no las llamadas al backend
vi.mock('../services/api', () => ({
  login: vi.fn(),
  registrarUsuario: vi.fn(),
  borrarToken: vi.fn(),
  renovarToken: vi.fn(),
}))

function MostrarSesion() {
  const { sesion } = useAuth()
  return <p>{sesion ? `Sesión de ${sesion.nombre}` : 'Sin sesión'}</p>
}

const renderizar = () =>
  render(
    <AuthProvider>
      <MostrarSesion />
    </AuthProvider>
  )

const guardar = (extra) =>
  localStorage.setItem('sesionActiva', JSON.stringify({ id: 1, nombre: 'Ana', email: 'ana@duocuc.cl', ...extra }))

describe('AuthContext: sesión guardada', () => {
  it('restaura la sesión si su token sigue vigente', () => {
    guardar({ expira: Date.now() + 60 * 60 * 1000 })
    renderizar()
    expect(screen.getByText('Sesión de Ana')).toBeInTheDocument()
  })

  it('descarta la sesión si su token ya venció', () => {
    guardar({ expira: Date.now() - 1000 })
    renderizar()
    expect(screen.getByText('Sin sesión')).toBeInTheDocument()
    expect(localStorage.getItem('sesionActiva')).toBeNull()
  })

  it('descarta una sesión antigua que no registra su vencimiento', () => {
    guardar({})
    renderizar()
    expect(screen.getByText('Sin sesión')).toBeInTheDocument()
  })
})
