// Cálculos del panel de administración a partir de los pedidos y productos que devuelven los microservicios.
// Estados de order-service: PENDIENTE, CONFIRMADO, EN_CAMINO, ENTREGADO, CANCELADO.

export const TAMANOS = ['5kg', '11kg', '15kg', '45kg']

const TAMANO_POR_CODIGO = { CL001: '5kg', CL002: '11kg', CL003: '15kg', CL004: '45kg' }

export const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente', clase: 'bg-secondary' },
  CONFIRMADO: { texto: 'Confirmado', clase: 'bg-primary' },
  EN_CAMINO: { texto: 'En camino', clase: 'bg-info text-dark' },
  ENTREGADO: { texto: 'Entregado', clase: 'bg-success' },
  CANCELADO: { texto: 'Cancelado', clase: 'bg-danger' },
}

// Mismas reglas que order-service: a qué estados se puede pasar desde cada uno
export const SIGUIENTES = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['EN_CAMINO', 'CANCELADO'],
  EN_CAMINO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

// Un pedido "válido" es el que no se canceló (su stock sigue descontado y su venta cuenta)
export const esVenta = (p) => p.estado !== 'CANCELADO'

export function calcularMetricas(pedidos, productos) {
  const hoy = new Date().toDateString()
  const deHoy = pedidos.filter((p) => esVenta(p) && new Date(p.fecha).toDateString() === hoy)

  const stockLlenos = {}
  TAMANOS.forEach((t) => { stockLlenos[t] = 0 })
  productos.forEach((p) => {
    const tamano = TAMANO_POR_CODIGO[p.codigo]
    if (tamano) stockLlenos[tamano] = p.stock
  })

  return {
    pedidosHoy: deHoy.length,
    cilindrosEntregados: pedidos
      .filter((p) => p.estado === 'ENTREGADO')
      .flatMap((p) => p.items)
      .filter((i) => TAMANO_POR_CODIGO[i.codigo])
      .reduce((acc, i) => acc + i.cantidad, 0),
    ingresosDia: deHoy.reduce((acc, p) => acc + p.total, 0),
    stockLlenos,
  }
}
