import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

// Cuentas con acceso al panel de administrador
const EMAILS_ADMIN = ['admin@admin.cl', 'admin@admin.com']

// Lee un valor JSON de localStorage sin romper si está corrupto
const leer = (clave, porDefecto) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? porDefecto
  } catch {
    return porDefecto
  }
}

export function AuthProvider({ children }) {
  // Mismas claves que usaba app.js, así no se pierden cuentas ya guardadas
  const [usuarios, setUsuarios] = useState(() => leer('usuariosRegistrados', []))
  const [sesion, setSesion] = useState(() => leer('sesionActiva', null))

  useEffect(() => {
    localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios))
  }, [usuarios])

  useEffect(() => {
    if (sesion) localStorage.setItem('sesionActiva', JSON.stringify(sesion))
    else localStorage.removeItem('sesionActiva')
  }, [sesion])

  // Devuelve { ok: true } o { ok: false, error: '...' }
  const registrar = ({ nombre, email, telefono, password }) => {
    if (usuarios.some((u) => u.email === email)) {
      return { ok: false, error: 'Este correo institucional ya se encuentra registrado.' }
    }
    setUsuarios((prev) => [...prev, { nombre, email, telefono, password }])
    return { ok: true }
  }

  // Devuelve { ok: true, sesion } o { ok: false }
  const iniciarSesion = (email, password) => {
    const usuario = usuarios.find((u) => u.email === email && u.password === password)
    const esAdmin = EMAILS_ADMIN.includes(email)

    if (!usuario && !esAdmin) return { ok: false }

    const nueva = {
      nombre: esAdmin ? 'Administrador' : usuario.nombre,
      email,
      esAdmin,
    }
    setSesion(nueva)
    return { ok: true, sesion: nueva }
  }

  const cerrarSesion = () => setSesion(null)

  const eliminarUsuario = (email) =>
    setUsuarios((prev) => prev.filter((u) => u.email !== email))

  return (
    <AuthContext.Provider
      value={{ usuarios, sesion, registrar, iniciarSesion, cerrarSesion, eliminarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  )
}
