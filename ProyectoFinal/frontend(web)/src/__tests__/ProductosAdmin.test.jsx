import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Productos from '../pages/admin/Productos'

const productos = [{
  codigo: 'CL002', nombre: 'Cilindro 11 kg', categoria: 'Cilindros de Gas', descripcion: 'Doméstico',
  unidad: 'Unidad', precioResidencial: 12000, precioComercial: 11000, stock: 50, img: '',
}]
const categorias = [{ slug: 'cilindros', nombre: 'Cilindros de Gas', icono: 'bi-fire' }]
const datos = { stockLlenos: 50 }

const mostrar = (props = {}) =>
  render(
    <Productos datos={datos} productos={productos} categorias={categorias}
      onGuardar={vi.fn().mockResolvedValue(true)} onDesactivar={vi.fn()} {...props} />
  )

describe('Productos del panel: CRUD solo para el administrador', () => {
  it('el VENDEDOR (solo lectura) ve el catálogo sin botones de crear, editar ni desactivar', () => {
    mostrar({ soloLectura: true })
    expect(screen.getByText('Cilindro 11 kg')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Nuevo producto/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Desactivar/ })).not.toBeInTheDocument()
  })

  it('el ADMIN crea un producto: el formulario envía los precios y el stock como números', async () => {
    const onGuardar = vi.fn().mockResolvedValue(true)
    mostrar({ onGuardar })
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: /Nuevo producto/ }))
    await usuario.type(screen.getByLabelText('Código'), 'CL099')
    await usuario.type(screen.getByLabelText('Nombre'), 'Cilindro 5 kg')
    await usuario.type(screen.getByLabelText('Precio residencial'), '8000')
    await usuario.type(screen.getByLabelText('Precio comercial'), '7000')
    await usuario.type(screen.getByLabelText('Stock'), '20')
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onGuardar).toHaveBeenCalledTimes(1)
    const [enviado, esNuevo] = onGuardar.mock.calls[0]
    expect(esNuevo).toBe(true)
    expect(enviado).toMatchObject({
      codigo: 'CL099', nombre: 'Cilindro 5 kg', categoria: 'Cilindros de Gas',
      precioResidencial: 8000, precioComercial: 7000, stock: 20,
    })
  })

  it('el ADMIN edita un producto: el código no se puede cambiar', async () => {
    const onGuardar = vi.fn().mockResolvedValue(true)
    mostrar({ onGuardar })
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Editar Cilindro 11 kg' }))
    expect(screen.getByLabelText('Código')).toBeDisabled()
    await usuario.clear(screen.getByLabelText('Stock'))
    await usuario.type(screen.getByLabelText('Stock'), '75')
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))

    const [enviado, esNuevo] = onGuardar.mock.calls[0]
    expect(esNuevo).toBe(false)
    expect(enviado).toMatchObject({ codigo: 'CL002', stock: 75 })
  })

  it('el ADMIN desactiva un producto', async () => {
    const onDesactivar = vi.fn()
    mostrar({ onDesactivar })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Desactivar Cilindro 11 kg' }))
    expect(onDesactivar).toHaveBeenCalledWith(productos[0])
  })

  it('el ADMIN ve los productos desactivados y puede reactivarlos', async () => {
    const onActivar = vi.fn()
    const apagado = { ...productos[0], codigo: 'CL099', nombre: 'Cilindro 5 kg' }
    mostrar({ desactivados: [apagado], onActivar })

    expect(screen.getByText('Productos desactivados')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reactivar Cilindro 5 kg' }))
    expect(onActivar).toHaveBeenCalledWith(apagado)
  })

  it('el VENDEDOR no ve la lista de desactivados', () => {
    mostrar({ soloLectura: true, desactivados: [{ ...productos[0], codigo: 'CL099', nombre: 'Cilindro 5 kg' }] })
    expect(screen.queryByText('Productos desactivados')).not.toBeInTheDocument()
  })
})
