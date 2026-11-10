import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificacionContext'

// Reglas de validación del formulario (devuelven un objeto con un mensaje por campo con error)
function validar({ nombre, email, telefono, password, repetir }) {
  const errores = {}

  if (nombre.trim().length < 2) errores.nombre = 'Ingresa tu nombre.'
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errores.email = 'Ingresa un correo válido.'
  if (!/^9\d{8}$/.test(telefono)) errores.telefono = 'Ingresa un celular de 9 dígitos que comience con 9.'
  if (password.length < 6) errores.password = 'La contraseña debe tener al menos 6 caracteres.'
  if (repetir !== password) errores.repetir = 'Las contraseñas no coinciden.'

  return errores
}

export default function Registro() {
  const { registrar } = useAuth()
  const { notificar } = useNotificacion()
  const navigate = useNavigate()

  const [campos, setCampos] = useState({
    nombre: '', email: '', telefono: '', password: '', repetir: '',
  })
  const [errores, setErrores] = useState({})

  const cambiar = (e) => {
    const { name, value } = e.target
    // El teléfono solo admite dígitos y máximo 9
    const limpio = name === 'telefono' ? value.replace(/\D/g, '').slice(0, 9) : value
    setCampos((prev) => ({ ...prev, [name]: limpio }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  const enviar = (e) => {
    e.preventDefault()

    const nuevos = validar(campos)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const resultado = registrar({
      nombre: campos.nombre.trim(),
      email: campos.email.trim().toLowerCase(),
      telefono: campos.telefono,
      password: campos.password,
    })

    if (!resultado.ok) {
      setErrores({ email: resultado.error })
      return
    }

    notificar('Cuenta creada correctamente. Ya puedes iniciar sesión.')
    navigate('/login')
  }

  return (
    <main className="container my-5" style={{ minHeight: '50vh' }}>
      <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{ maxWidth: 480 }}>
        <h2 className="text-naranja fw-bold mb-1">Crear Cuenta</h2>
        <p className="text-muted">Regístrate para comprar y guardar tu dirección de entrega.</p>

        <form onSubmit={enviar} noValidate>
          <CampoFormulario
            id="nombre"
            etiqueta="Nombre completo"
            value={campos.nombre}
            onChange={cambiar}
            error={errores.nombre}
            autoComplete="name"
          />
          <CampoFormulario
            id="email"
            etiqueta="Correo Electrónico"
            type="email"
            value={campos.email}
            onChange={cambiar}
            error={errores.email}
            autoComplete="email"
          />
          <CampoFormulario
            id="telefono"
            etiqueta="Teléfono celular"
            inputMode="numeric"
            placeholder="9XXXXXXXX"
            value={campos.telefono}
            onChange={cambiar}
            error={errores.telefono}
            autoComplete="tel-national"
          />
          <CampoFormulario
            id="password"
            etiqueta="Contraseña"
            type="password"
            value={campos.password}
            onChange={cambiar}
            error={errores.password}
            autoComplete="new-password"
          />
          <CampoFormulario
            id="repetir"
            etiqueta="Repetir contraseña"
            type="password"
            value={campos.repetir}
            onChange={cambiar}
            error={errores.repetir}
            autoComplete="new-password"
          />

          <div className="d-grid mt-4">
            <button type="submit" className="btn btn-naranja rounded-pill fw-semibold py-2">
              Crear cuenta
            </button>
          </div>
        </form>

        <p className="text-center text-muted small mt-3 mb-0">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-naranja fw-semibold text-decoration-none">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
