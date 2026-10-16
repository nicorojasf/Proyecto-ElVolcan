
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const EMAILS_ADMIN = ['admin@admin.cl', 'admin@admin.com']
const PASSWORD_ADMIN = 'Gasvolcan26'

const leer = (clave, porDefecto) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? porDefecto
  } catch {
    return porDefecto
  }
}

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState(() => leer('usuariosRegistrados', []))
  const [sesion, setSesion] = useState(() => leer('sesionActiva', null))

  useEffect(() => {
    localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios))
  }, [usuarios])

  useEffect(() => {
    if (sesion) localStorage.setItem('sesionActiva', JSON.stringify(sesion))
    else localStorage.removeItem('sesionActiva')
  }, [sesion])

  const registrar = ({ nombre, email, telefono, password }) => {
    if (EMAILS_ADMIN.includes(email)) {
      return { ok: false, error: 'Este correo no está disponible para registro.' }
    }
    if (usuarios.some((u) => u.email === email)) {
      return { ok: false, error: 'Este correo institucional ya se encuentra registrado.' }
    }
    setUsuarios((prev) => [...prev, { nombre, email, telefono, password }])
    return { ok: true }
  }

  const iniciarSesion = (email, password) => {
    const esAdmin = EMAILS_ADMIN.includes(email)

    if (esAdmin) {
      if (password !== PASSWORD_ADMIN) return { ok: false }
    }

    const usuario = usuarios.find((u) => u.email === email && u.password === password)
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

  const guardarDireccion = (email, direccion) =>
    setUsuarios((prev) => prev.map((u) => (u.email === email ? { ...u, direccion } : u)))

  const usuarioActual = usuarios.find((u) => u.email === sesion?.email)

  return (
    <AuthContext.Provider
      value={{
        usuarios, sesion, usuarioActual,
        registrar, iniciarSesion, cerrarSesion, eliminarUsuario, guardarDireccion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
