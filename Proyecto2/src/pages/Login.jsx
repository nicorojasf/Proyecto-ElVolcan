import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { usuarios, iniciarSesion, eliminarUsuario } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})

  // Al escribir en un campo se borra su error
  const cambiar = (campo, setValor) => (e) => {
    setValor(e.target.value)
    setErrores((prev) => ({ ...prev, [campo]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nuevos = {}

    if (!email || !email.includes('@')) nuevos.email = 'Ingrese un correo válido.'
    if (!password) nuevos.password = 'Ingrese su contraseña.'

    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const resultado = iniciarSesion(email, password)
    if (!resultado.ok) {
      alert('Credenciales incorrectas o usuario no registrado.')
      return
    }

    alert(`¡Bienvenido de vuelta, ${resultado.sesion.nombre}!`)
    navigate(resultado.sesion.esAdmin ? '/admin' : '/')
  }

  const handleEliminar = (usuario) => {
    if (confirm(`¿Deseas eliminar la cuenta de ${usuario.email}?`)) {
      eliminarUsuario(usuario.email)
    }
  }

  return (
    <main className="auth-wrapper">
      <div className="auth-container">
        <h2 className="auth-title">Iniciar Sesión</h2>

        {/* Cuentas guardadas: clic para rellenar el correo, tacho para borrar */}
        {usuarios.length > 0 && (
          <div className="mb-3 text-start p-2 border rounded bg-light">
            <small className="d-block fw-bold text-muted mb-2">Cuentas registradas:</small>
            {usuarios.map((u) => (
              <div
                key={u.email}
                className="d-flex justify-content-between align-items-center mb-1 bg-white p-1 px-2 border rounded small shadow-sm"
              >
                <span
                  className="text-truncate text-dark fw-semibold"
                  style={{ cursor: 'pointer', maxWidth: 240 }}
                  title="Clic para rellenar"
                  onClick={() => setEmail(u.email)}
                >
                  {u.nombre} ({u.email})
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger py-0 px-1 ms-2"
                  title="Eliminar cuenta guardada"
                  onClick={() => handleEliminar(u)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <CampoFormulario
            id="email"
            etiqueta="Correo Electrónico"
            type="email"
            placeholder="ejemplo@correo.cl"
            value={email}
            onChange={cambiar('email', setEmail)}
            error={errores.email}
          />

          <CampoFormulario
            id="password"
            etiqueta="Contraseña"
            type="password"
            placeholder="********"
            value={password}
            onChange={cambiar('password', setPassword)}
            error={errores.password}
          />

          <button
            type="submit"
            className="btn btn-naranja w-100 py-2 rounded-pill fw-semibold auth-btn mt-2"
          >
            Ingresar
          </button>
        </form>

        <div className="auth-links mt-4 text-center">
          <span className="text-muted">¿No tienes una cuenta?</span>
          <Link to="/registro" className="text-naranja fw-semibold text-decoration-none ms-1">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </main>
  )
}
