import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificacionContext'

export default function Login() {
  const { iniciarSesion } = useAuth()
  const { notificar } = useNotificacion()
  const navigate = useNavigate()

  const [campos, setCampos] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState({})

  const cambiar = (e) => {
    const { name, value } = e.target
    setCampos((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  const enviar = (e) => {
    e.preventDefault()

    const email = campos.email.trim().toLowerCase()
    const nuevos = {}
    if (!email) nuevos.email = 'Ingresa tu correo.'
    if (!campos.password) nuevos.password = 'Ingresa tu contraseña.'
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const resultado = iniciarSesion(email, campos.password)
    if (!resultado.ok) {
      notificar('Correo o contraseña incorrectos.', 'danger')
      return
    }

    const primerNombre = resultado.sesion.nombre.split(' ')[0]
    notificar(`¡Bienvenido de vuelta, ${primerNombre}!`)
    navigate(resultado.sesion.esAdmin ? '/admin' : '/')
  }

  return (
    <main className="container my-5" style={{ minHeight: '50vh' }}>
      <div className="bg-white rounded-4 shadow-sm p-4 mx-auto" style={{ maxWidth: 440 }}>
        <h2 className="text-naranja fw-bold mb-1">Iniciar Sesión</h2>
        <p className="text-muted">Ingresa con tu cuenta de Gas El Volcán.</p>

        <form onSubmit={enviar} noValidate>
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
            id="password"
            etiqueta="Contraseña"
            type="password"
            value={campos.password}
            onChange={cambiar}
            error={errores.password}
            autoComplete="current-password"
          />

          <div className="d-grid mt-4">
            <button type="submit" className="btn btn-naranja rounded-pill fw-semibold py-2">
              Ingresar
            </button>
          </div>
        </form>

        <p className="text-center text-muted small mt-3 mb-0">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-naranja fw-semibold text-decoration-none">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  )
}
