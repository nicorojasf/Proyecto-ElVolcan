import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CampoFormulario from '../components/CampoFormulario'

describe('CampoFormulario', () => {
  it('asocia la etiqueta con el input y le pasa el resto de las props', () => {
    render(
      <CampoFormulario
        id="email"
        etiqueta="Correo Electrónico"
        type="email"
        placeholder="ejemplo@correo.cl"
      />
    )

    // getByLabelText solo funciona si label.htmlFor == input.id
    const input = screen.getByLabelText('Correo Electrónico')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'ejemplo@correo.cl')
    expect(input).toHaveAttribute('name', 'email')
  })

  it('sin error no muestra mensaje ni la clase is-invalid', () => {
    render(<CampoFormulario id="nombre" etiqueta="Nombre" />)

    expect(screen.getByLabelText('Nombre')).not.toHaveClass('is-invalid')
    expect(document.querySelector('.invalid-feedback-personalizado')).toBeNull()
  })

  it('con error muestra el mensaje y marca el input como inválido', () => {
    render(<CampoFormulario id="nombre" etiqueta="Nombre" error="El nombre es obligatorio." />)

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveClass('is-invalid')
  })

  it('llama a onChange cada vez que el usuario escribe', async () => {
    const user = userEvent.setup()
    // MOCK: función espía como prop
    const onChange = vi.fn()
    render(<CampoFormulario id="nombre" etiqueta="Nombre" value="" onChange={onChange} />)

    await user.type(screen.getByLabelText('Nombre'), 'abc')

    expect(onChange).toHaveBeenCalledTimes(3)
  })
})
