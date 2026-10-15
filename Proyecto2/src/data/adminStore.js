const DATOS_INICIALES = {
  pedidosHoy: 38,
  cilindrosEntregados: 45,
  ingresosDia: 840000,
  stockLlenos: { '5kg': 24, '11kg': 85, '15kg': 62, '45kg': 12 },
  stockVacios: { '5kg': 10, '11kg': 34, '15kg': 18, '45kg': 5 },
}

const TAMANO_POR_CODIGO = {
  CL001: '5kg',
  CL002: '11kg',
  CL003: '15kg',
  CL004: '45kg',
}

export const TAMANOS = ['5kg', '11kg', '15kg', '45kg']

export function leerDatosAdmin() {
  try {
    return JSON.parse(localStorage.getItem('datosAdmin')) ?? structuredClone(DATOS_INICIALES)
  } catch {
    return structuredClone(DATOS_INICIALES)
  }
}

export function verificarStock(carrito) {
  const datos = leerDatosAdmin()

  for (const item of carrito) {
    const tamano = TAMANO_POR_CODIGO[item.codigo]
    if (tamano && item.cantidad > datos.stockLlenos[tamano]) {
      return {
        ok: false,
        motivo: `Stock insuficiente de ${item.nombre}: solo quedan ${datos.stockLlenos[tamano]} unidades disponibles para despacho.`,
      }
    }
  }
  return { ok: true, motivo: '' }
}

export function registrarVenta(carrito, precioDe) {
  const datos = leerDatosAdmin()
  let totalCompra = 0
  let cilindros = 0

  carrito.forEach((item) => {
    totalCompra += precioDe(item) * item.cantidad

    const tamano = TAMANO_POR_CODIGO[item.codigo]
    if (tamano) {
      cilindros += item.cantidad
      datos.stockLlenos[tamano] = Math.max(0, datos.stockLlenos[tamano] - item.cantidad)
      datos.stockVacios[tamano] += item.cantidad
    }
  })

  datos.pedidosHoy += 1
  datos.cilindrosEntregados += cilindros
  datos.ingresosDia += totalCompra

  localStorage.setItem('datosAdmin', JSON.stringify(datos))
}
