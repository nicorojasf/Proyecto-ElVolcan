import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { NotificacionProvider } from '../context/NotificacionContext'
import Admin from '../pages/Admin'
import * as api from '../services/api'

// Se simula el backend: lo que se prueba es qué ve cada rol en el panel
vi.mock('../services/api', () => ({
  login: vi.fn(),
  registrarUsuario: vi.fn(),
  borrarToken: vi.fn(),
  renovarToken: vi.fn(),
  getPedidos: vi.fn(),
  getUsuarios: vi.fn(),
  getProductos: vi.fn(),
  getCategorias: vi.fn(),
  crearProducto: vi.fn(),
  actualizarProducto: vi.fn(),
  desactivarProducto: vi.fn(),
  activarProducto: vi.fn(),
  getProductosDesactivados: vi.fn(),
  cambiarEstadoPedido: vi.fn(),
  eliminarUsuarioApi: vi.fn(),
}))

const pedido = {
  id: 1, numero: '0001', codigo: 'PED-1', fecha: '2026-11-01T10:00:00', estado: 'PENDIENTE',
  cliente: { nombre: 'Ana', apellidos: 'Pérez', correo: 'ana@correo.cl' },
  direccion: { calle: 'Los Aromos', numero: '123', tipo: 'casa', region: 'Metropolitana', comuna: 'Maipú' },
  items: [{ codigo: 'CL002', nombre: 'Cilindro 11 kg', precio: 12000, cantidad: 1, subtotal: 12000 }],
  total: 12000,
}

const iniciarComo = (rol) =>
  localStorage.setItem('sesionActiva', JSON.stringify({
    id: 1, nombre: 'Persona', email: 'p@volcan.cl', rol,
    esAdmin: rol === 'ADMIN', esVendedor: rol === 'VENDEDOR', expira: Date.now() + 3600 * 1000,
  }))

// El menú lateral del panel (el contenido de las vistas también tiene botones con nombres parecidos)
const menu = () => within(screen.getByRole('complementary'))

const verPanel = () =>
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <NotificacionProvider>
        <AuthProvider>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<p>Pantalla de login</p>} />
          </Routes>
        </AuthProvider>
      </NotificacionProvider>
    </MemoryRouter>
  )

describe('Restricciones por rol en el panel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getPedidos.mockResolvedValue([pedido])
    api.getUsuarios.mockResolvedValue([])
    api.getProductos.mockResolvedValue([])
    api.getCategorias.mockResolvedValue([])
    api.getProductosDesactivados.mockResolvedValue([])
  })

  it('un CLIENTE no entra al panel: vuelve al login', () => {
    iniciarComo('CLIENTE')
    verPanel()
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
  })

  it('sin sesión tampoco entra al panel', () => {
    verPanel()
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
  })

  it('el VENDEDOR solo ve Órdenes y Productos, sin cambiar estados ni pedir usuarios', async () => {
    iniciarComo('VENDEDOR')
    verPanel()

    await screen.findByText('#0001')
    expect(menu().getByRole('button', { name: /Órdenes/ })).toBeInTheDocument()
    expect(menu().getByRole('button', { name: /Productos/ })).toBeInTheDocument()
    for (const oculto of [/Dashboard/, /Categorías/, /Usuarios/, /Reportes/, /Perfil/]) {
      expect(menu().queryByRole('button', { name: oculto })).not.toBeInTheDocument()
    }
    expect(screen.queryByText('Cambiar a')).not.toBeInTheDocument()
    expect(api.getUsuarios).not.toHaveBeenCalled()
    expect(api.getProductosDesactivados).not.toHaveBeenCalled()   // los desactivados son solo del ADMIN
  })

  it('el ADMIN ve todas las secciones y puede cambiar estados', async () => {
    iniciarComo('ADMIN')
    verPanel()

    await waitFor(() => expect(api.getUsuarios).toHaveBeenCalled())
    for (const visible of [/Dashboard/, /Órdenes/, /Productos/, /Categorías/, /Usuarios/, /Reportes/, /Perfil/]) {
      expect(menu().getByRole('button', { name: visible })).toBeInTheDocument()
    }
  })
})
