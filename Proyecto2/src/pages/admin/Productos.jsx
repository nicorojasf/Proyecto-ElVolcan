import { productos } from '../../data/productos'
import { TarjetaInventario } from './Tarjetas'

export default function Productos({ datos }) {
  return (
    <section>
      <h5 className="fw-bold mb-3">Inventario de Cilindros (Llenos vs Vacíos)</h5>
      <div className="row g-4 mb-4">
        <TarjetaInventario titulo="Cilindros Llenos (Stock Venta)" icono="bi-fire" color="success" stock={datos.stockLlenos} />
        <TarjetaInventario titulo="Cilindros Vacíos (En Bodega)" icono="bi-box" color="secondary" stock={datos.stockVacios} />
      </div>

      <h5 className="fw-bold mb-3">Catálogo de productos</h5>
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio residencial</th>
                <th>Precio comercial</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.codigo}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>${p.precioResidencial.toLocaleString('es-CL')}</td>
                  <td>${p.precioComercial.toLocaleString('es-CL')}</td>
                  <td>
                    <span className={`badge ${p.stock <= 10 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {p.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
