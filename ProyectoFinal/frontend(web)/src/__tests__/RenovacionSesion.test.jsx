import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'
import * as api from '../services/api'

vi.mock('../services/api', () => ({
  login: vi.fn(),
  registrarUsuario: vi.fn(),
  borrarToken: vi.fn(),
  renovarToken: vi.fn(),
}))

function Estado() {
  const { sesion } = useAuth()
  return <p>{sesion ? `Sesión de ${sesion.nombre} (${sesion.rol})` : 'Sin sesión'}</p>
}

const iniciar = () => {
  localStorage.setItem('sesionActiva', JSON.stringify({
    id: 1, nombre: 'Ana', email: 'ana@duocuc.cl', rol: 'CLIENTE', expira: Date.now() + 5 * 60 * 1000,
  }))
  render(<AuthProvider><Estado /></AuthProvider>)
}

describe('Renovación automática del token', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('un minuto antes de vencer pide un token nuevo y extiende la sesión', async () => {
    api.renovarToken.mockResolvedValue({
      usuario: { id: 1, nombre: 'Ana', email: 'ana@duocuc.cl', rol: 'CLIENTE', tipoCliente: 'RESIDENCIAL' },
      expiraEnSegundos: 7200,
    })
    iniciar()

    await act(async () => { await vi.advanceTimersByTimeAsync(4 * 60 * 1000 + 1000) })

    expect(api.renovarToken).toHaveBeenCalledTimes(1)
    const guardada = JSON.parse(localStorage.getItem('sesionActiva'))
    expect(guardada.expira).toBeGreaterThan(Date.now() + 60 * 60 * 1000)
    expect(screen.getByText('Sesión de Ana (CLIENTE)')).toBeInTheDocument()
  })

  it('si el backend rechaza la renovación, cierra la sesión', async () => {
    api.renovarToken.mockRejectedValue(new Error('Token vencido'))
    iniciar()

    await act(async () => { await vi.advanceTimersByTimeAsync(4 * 60 * 1000 + 1000) })

    expect(screen.getByText('Sin sesión')).toBeInTheDocument()
    expect(api.borrarToken).toHaveBeenCalled()
  })
})
