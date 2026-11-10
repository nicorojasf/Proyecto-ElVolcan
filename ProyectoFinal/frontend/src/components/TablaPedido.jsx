export default function TablaPedido({ items }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.codigo}>
              <td>
                <img
                  src={i.img}
                  alt={i.nombre}
                  style={{ width: 40, height: 40, objectFit: 'contain' }}
                />
              </td>
              <td>{i.nombre}</td>
              <td>${i.precio.toLocaleString('es-CL')}</td>
              <td>{i.cantidad}</td>
              <td>${i.subtotal.toLocaleString('es-CL')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
