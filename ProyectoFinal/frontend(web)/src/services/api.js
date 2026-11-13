// Dirección del backend. Hoy apunta directo a product-service (puerto 8081).
// Cuando exista el API Gateway, solo cambia esta variable a http://localhost:8080
// creando un archivo .env con:  VITE_API_URL=http://localhost:8080
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081'

// Pide los productos al backend. Si se pasa un slug (ej: 'cilindros'), filtra por categoría.
export async function getProductos(slug) {
  const url = slug
    ? `${API_URL}/api/productos?categoria=${encodeURIComponent(slug)}`
    : `${API_URL}/api/productos`

  const respuesta = await fetch(url)
  if (!respuesta.ok) {
    throw new Error(`El servidor respondió con error ${respuesta.status}`)
  }
  return respuesta.json()
}
