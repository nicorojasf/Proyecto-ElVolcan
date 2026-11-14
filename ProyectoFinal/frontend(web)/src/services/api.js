// Direcciones de los microservicios (las ve el NAVEGADOR, por eso son localhost + puerto publicado).
// Cuando exista el API Gateway basta con definir VITE_API_URL=http://localhost:8080 y todo pasa por él.
const GATEWAY = import.meta.env.VITE_API_URL
const PRODUCT_URL = GATEWAY ?? import.meta.env.VITE_PRODUCT_URL ?? 'http://localhost:8081'
const AUTH_URL = GATEWAY ?? import.meta.env.VITE_AUTH_URL ?? 'http://localhost:8082'
const ORDER_URL = GATEWAY ?? import.meta.env.VITE_ORDER_URL ?? 'http://localhost:8083'

// Todas las rutas del backend están versionadas (/api/v1/...)
const CLAVE_TOKEN = 'token'

export const guardarToken = (token) => {
  try { localStorage.setItem(CLAVE_TOKEN, token) } catch { /* sin storage */ }
}
export const leerToken = () => {
  try { return localStorage.getItem(CLAVE_TOKEN) } catch { return null }
}
export const borrarToken = () => {
  try { localStorage.removeItem(CLAVE_TOKEN) } catch { /* sin storage */ }
}

// Los 3 servicios responden los errores con { status, error, mensaje, detalles }.
async function pedir(base, ruta, { metodo = 'GET', cuerpo, conToken = false } = {}) {
  const headers = {}
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'
  const token = conToken ? leerToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(`${base}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta nuevamente.')
  }

  if (!respuesta.ok) {
    let mensaje = `El servidor respondió con error ${respuesta.status}`
    try {
      const error = await respuesta.json()
      if (error?.mensaje) mensaje = error.mensaje
    } catch { /* la respuesta no era JSON */ }
    const e = new Error(mensaje)
    e.status = respuesta.status
    throw e
  }
  return respuesta.status === 204 ? null : respuesta.json()
}

// ---------- product-service (8081) ----------
// Pide los productos al backend. Si se pasa un slug (ej: 'cilindros'), filtra por categoría.
export function getProductos(slug) {
  const ruta = slug ? `/api/v1/productos?categoria=${encodeURIComponent(slug)}` : '/api/v1/productos'
  return pedir(PRODUCT_URL, ruta)
}
export const getCategorias = () => pedir(PRODUCT_URL, '/api/v1/categorias')
// CRUD de productos: crear, editar y desactivar son solo del ADMIN (el backend responde 403 a los demás)
export const crearProducto = (producto) =>
  pedir(PRODUCT_URL, '/api/v1/productos', { metodo: 'POST', cuerpo: producto, conToken: true })
export const actualizarProducto = (codigo, producto) =>
  pedir(PRODUCT_URL, `/api/v1/productos/${encodeURIComponent(codigo)}`, { metodo: 'PUT', cuerpo: producto, conToken: true })
// Productos desactivados (solo ADMIN) y reactivación
export const getProductosDesactivados = () =>
  pedir(PRODUCT_URL, '/api/v1/productos/desactivados', { conToken: true })
export const activarProducto = (codigo) =>
  pedir(PRODUCT_URL, `/api/v1/productos/${encodeURIComponent(codigo)}/activar`, { metodo: 'PUT', conToken: true })
export const desactivarProducto = (codigo) =>
  pedir(PRODUCT_URL, `/api/v1/productos/${encodeURIComponent(codigo)}`, { metodo: 'DELETE', conToken: true })

// ---------- auth-service (8082) ----------
export const registrarUsuario = (datos) =>
  pedir(AUTH_URL, '/api/v1/auth/registro', { metodo: 'POST', cuerpo: datos })

// Devuelve { token, tipo, expiraEnSegundos, usuario } y deja el token guardado para las demás llamadas.
export async function login(email, password) {
  const resultado = await pedir(AUTH_URL, '/api/v1/auth/login', { metodo: 'POST', cuerpo: { email, password } })
  guardarToken(resultado.token)
  return resultado
}
// Renovación: con el token vigente pide uno nuevo y lo deja guardado (sesión deslizante).
export async function renovarToken() {
  const resultado = await pedir(AUTH_URL, '/api/v1/auth/refresh', { metodo: 'POST', conToken: true })
  guardarToken(resultado.token)
  return resultado
}
export const getPerfil = () => pedir(AUTH_URL, '/api/v1/auth/perfil', { conToken: true })
export const getUsuarios = () => pedir(AUTH_URL, '/api/v1/auth/usuarios', { conToken: true })
export const eliminarUsuarioApi = (id) =>
  pedir(AUTH_URL, `/api/v1/auth/usuarios/${id}`, { metodo: 'DELETE', conToken: true })

// ---------- order-service (8083) ----------
// pedido = { cliente: {nombre, apellidos, correo}, direccion: {...}, items: [{codigo, cantidad}] }
// El precio NO se envía: lo recalcula order-service con product-service.
export const crearPedido = (pedido) =>
  pedir(ORDER_URL, '/api/v1/pedidos', { metodo: 'POST', cuerpo: pedido, conToken: true })
export const getMisPedidos = () => pedir(ORDER_URL, '/api/v1/pedidos/mis-pedidos', { conToken: true })
export const getPedidos = (estado) =>
  pedir(ORDER_URL, estado ? `/api/v1/pedidos?estado=${encodeURIComponent(estado)}` : '/api/v1/pedidos', { conToken: true })
export const getPedido = (id) => pedir(ORDER_URL, `/api/v1/pedidos/${id}`, { conToken: true })
export const cambiarEstadoPedido = (id, estado) =>
  pedir(ORDER_URL, `/api/v1/pedidos/${id}/estado`, { metodo: 'PUT', cuerpo: { estado }, conToken: true })
