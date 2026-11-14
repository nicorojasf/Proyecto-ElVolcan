import { createContext, useContext, useEffect, useState } from 'react'
import { borrarToken, login, registrarUsuario, renovarToken } from '../services/api'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const leer = (clave, porDefecto) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? porDefecto
  } catch {
    return porDefecto
  }
}

// El backend (auth-service) no guarda la dirección de entrega, así que se recuerda aquí por correo.
const leerDirecciones = () => leer('direccionesGuardadas', {})

// Arma el objeto de sesión que se guarda en localStorage a partir de la respuesta del backend.
// Roles: CLIENTE (solo tienda), VENDEDOR (solo ve productos y órdenes) y ADMIN (todo).
const armarSesion = (usuario, expiraEnSegundos) => ({
  expira: Date.now() + (expiraEnSegundos ?? 0) * 1000,
  id: usuario.id,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
  esAdmin: usuario.rol === 'ADMIN',
  esVendedor: usuario.rol === 'VENDEDOR',
  tipoCliente: usuario.tipoCliente,
})

// Faltan estos milisegundos para que venza el token cuando se pide la renovación.
const MARGEN_RENOVACION = 60 * 1000

export function AuthProvider({ children }) {
  // Una sesión guardada solo se restaura si su token sigue vigente; la validación real la hace el backend.
  const [sesion, setSesion] = useState(() => {
    const guardada = leer('sesionActiva', null)
    return guardada?.expira && guardada.expira > Date.now() ? guardada : null
  })
  const [direcciones, setDirecciones] = useState(leerDirecciones)

  useEffect(() => {
    try {
      if (sesion) localStorage.setItem('sesionActiva', JSON.stringify(sesion))
      else localStorage.removeItem('sesionActiva')
    } catch { /* sin storage */ }
  }, [sesion])

  useEffect(() => {
    try {
      localStorage.setItem('direccionesGuardadas', JSON.stringify(direcciones))
    } catch { /* sin storage */ }
  }, [direcciones])

  // Crea una cuenta CLIENTE en auth-service. Devuelve { ok } o { ok: false, error }.
  const registrar = async ({ nombre, email, telefono, password, tipoCliente }) => {
    try {
      await registrarUsuario({ nombre, email, telefono, password, tipoCliente })
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  // Valida credenciales en auth-service; el JWT queda guardado para las llamadas a los otros servicios.
  const iniciarSesion = async (email, password) => {
    try {
      const { usuario, expiraEnSegundos } = await login(email, password)
      const nueva = armarSesion(usuario, expiraEnSegundos)
      setSesion(nueva)
      return { ok: true, sesion: nueva }
    } catch (e) {
      return { ok: false, error: e.message, status: e.status }
    }
  }

  const cerrarSesion = () => {
    borrarToken()
    setSesion(null)
  }

  // Renovación automática: poco antes de vencer pide un token nuevo; si el backend lo rechaza, cierra la sesión.
  const expira = sesion?.expira
  useEffect(() => {
    if (!expira) return
    const espera = Math.max(expira - MARGEN_RENOVACION - Date.now(), 0)
    const temporizador = setTimeout(async () => {
      try {
        const { usuario, expiraEnSegundos } = await renovarToken()
        setSesion(armarSesion(usuario, expiraEnSegundos))
      } catch {
        borrarToken()
        setSesion(null)
      }
    }, espera)
    return () => clearTimeout(temporizador)
  }, [expira])

  const guardarDireccion = (email, direccion) =>
    setDirecciones((prev) => ({ ...prev, [email]: direccion }))

  const usuarioActual = sesion ? { ...sesion, direccion: direcciones[sesion.email] } : undefined

  return (
    <AuthContext.Provider
      value={{ sesion, usuarioActual, registrar, iniciarSesion, cerrarSesion, guardarDireccion }}
    >
      {children}
    </AuthContext.Provider>
  )
}
