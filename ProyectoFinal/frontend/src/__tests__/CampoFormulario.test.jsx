import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CampoFormulario from '../components/CampoFormulario'

describe('CampoFormulario', () => {
 
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

 
})
