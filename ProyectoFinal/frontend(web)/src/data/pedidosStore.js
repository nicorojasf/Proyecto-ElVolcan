// Arma las líneas del carrito para mostrarlas en el resumen (el precio final lo recalcula order-service).
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
