import { registrarVenta, verificarStock } from './adminStore'

const CLAVE = 'pedidos'

export function leerPedidos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? []
  } catch {
    return []
  }
}

export function armarItems(carrito, precioDe) {
  return carrito.map((p) => ({
    codigo: p.codigo,
    nombre: p.nombre,
    img: p.img,
    precio: precioDe(p),
    cantidad: p.cantidad,
    subtotal: precioDe(p) * p.cantidad,
  }))
}

function siguienteNumero(pedidos) {
  const hoy = new Date()
  const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`
  const delDia = pedidos.filter((p) => p.numero.startsWith(fecha)).length + 1
  return `${fecha}${String(delDia).padStart(2, '0')}`
}

export function procesarPago({ carrito, precioDe, cliente, direccion, email }) {
  const pedidos = leerPedidos()
  const items = armarItems(carrito, precioDe)
  const stock = verificarStock(carrito)

  const pedido = {
    numero: siguienteNumero(pedidos),
    codigo: `ORDER${String(pedidos.length + 1).padStart(5, '0')}`,
    fecha: new Date().toISOString(),
    estado: stock.ok ? 'pagado' : 'fallido',
    motivo: stock.motivo,
    email,
    cliente,
    direccion,
    items,
    total: items.reduce((acc, i) => acc + i.subtotal, 0),
  }

  if (stock.ok) registrarVenta(carrito, precioDe)
  localStorage.setItem(CLAVE, JSON.stringify([...pedidos, pedido]))
  return pedido
}
