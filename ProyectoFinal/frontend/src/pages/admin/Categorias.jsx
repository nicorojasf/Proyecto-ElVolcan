import { Link } from 'react-router-dom'
import { categorias, productos } from '../../data/productos'

export default function Categorias() {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Ruta en la tienda</th>
              <th>N° de productos</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.slug}>
                <td><i className={`bi ${c.icono} text-naranja me-2`}></i>{c.nombre}</td>
                <td><Link to={`/productos/${c.slug}`}>/productos/{c.slug}</Link></td>
                <td>{productos.filter((p) => p.categoria === c.nombre).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
