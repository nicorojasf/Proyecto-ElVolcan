import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario'
import { useAuth } from '../context/AuthContext'

const VACIO = { nombre: '', email: '', telefono: '', contrasena: '', confirmar: '' }

export default function Registro() {
  const { registrar } = useAuth()
  const navigate = useNavigate()

  // Un solo estado para todo el formulario en vez de uno por campo
  const [campos, setCampos] = useState(VACIO)
  const [errores, setErrores] = useState({})

  const cambiar = (e) => {
    const { name, value } = e.target
    setCampos((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const { nombre, email, telefono, contrasena, confirmar } = campos
    const nuevos = {}

    if (!nombre.trim()) nuevos.nombre = 'El nombre y apellido son obligatorios.'
    if (!email || !email.endsWith('@duocuc.cl'))
      nuevos.email = 'Debe registrarse obligatoriamente con un correo institucional (@duocuc.cl).'
    if (!telefono || telefono.length < 8)
      nuevos.telefono = 'Ingrese un número de teléfono de contacto válido.'
    if (!contrasena || contrasena.length < 6)
      nuevos.contrasena = 'La contraseña debe contener al menos 6 caracteres.'
    if (contrasena !== confirmar)
      nuevos.confirmar = 'Las contraseñas no coinciden. Verifíquelas.'

    return nuevos
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const nuevos = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const resultado = registrar({
      nombre: campos.nombre.trim(),
      email: campos.email.trim(),
      telefono: campos.telefono.trim(),
      password: campos.contrasena,
    })

    if (!resultado.ok) {
      setErrores({ email: resultado.error })
      return
    }

    alert(`¡Cuenta creada con éxito, ${campos.nombre}! Ya puedes iniciar sesión.`)
    navigate('/login')
  }

  return (
    <main className="auth-wrapper py-5">
      <div className="auth-container">
        <h2 className="auth-title">Crear Cuenta</h2>

        <form onSubmit={handleSubmit} noValidate>
          <CampoFormulario
            id="nombre"
            etiqueta="Nombre y Apellido"
            type="text"
            placeholder="Juan Pérez"
            value={campos.nombre}
            onChange={cambiar}
            error={errores.nombre}
          />
          <CampoFormulario
            id="email"
            etiqueta="Correo Electrónico"
            type="email"
            placeholder="ejemplo@correo.cl"
            value={campos.email}
            onChange={cambiar}
            error={errores.email}
          />
          <CampoFormulario
            id="telefono"
            etiqueta="Teléfono / Celular"
            type="tel"
            placeholder="+56 9 1234 5678"
            value={campos.telefono}
            onChange={cambiar}
            error={errores.telefono}
          />
          <CampoFormulario
            id="contrasena"
            etiqueta="Contraseña"
            type="password"
            placeholder="********"
            value={campos.contrasena}
            onChange={cambiar}
            error={errores.contrasena}
          />
          <CampoFormulario
            id="confirmar"
            etiqueta="Confirmar Contraseña"
            type="password"
            placeholder="********"
            value={campos.confirmar}
            onChange={cambiar}
            error={errores.confirmar}
          />

          <button
            type="submit"
            className="btn btn-naranja w-100 py-2 rounded-pill fw-semibold auth-btn mt-2"
          >
            Registrarse
          </button>
        </form>

        <div className="auth-links mt-4 text-center">
          <span className="text-muted">¿Ya tienes una cuenta?</span>
          <Link to="/login" className="text-naranja fw-semibold text-decoration-none ms-1">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </main>
  )
}
