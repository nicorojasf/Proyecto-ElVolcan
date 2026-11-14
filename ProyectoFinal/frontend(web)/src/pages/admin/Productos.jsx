import { useState } from 'react'
import CampoFormulario from '../../components/CampoFormulario'
import { TarjetaInventario } from './Tarjetas'

const VACIO = {
  codigo: '', nombre: '', categoria: '', descripcion: '', unidad: 'Unidad',
  precioResidencial: '', precioComercial: '', stock: '', img: '',
}

// soloLectura (VENDEDOR): ve el catálogo, pero no ve los botones de crear, editar ni desactivar.
export default function Productos({
  datos, productos, categorias = [], desactivados = [], soloLectura = false, onGuardar, onDesactivar, onActivar,
}) {
  const [form, setForm] = useState(null)   // null = formulario cerrado
  const [esNuevo, setEsNuevo] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const abrirNuevo = () => {
    setForm({ ...VACIO, categoria: categorias[0]?.nombre ?? '' })
    setEsNuevo(true)
  }
  const abrirEditar = (p) => {
    setForm({ ...VACIO, ...p, descripcion: p.descripcion ?? '', img: p.img ?? '' })
    setEsNuevo(false)
  }
  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    const ok = await onGuardar(
      {
        ...form,
        codigo: form.codigo.trim(),
        precioResidencial: Number(form.precioResidencial),
        precioComercial: Number(form.precioComercial),
        stock: Number(form.stock),
      },
      esNuevo
    )
    setGuardando(false)
    if (ok) setForm(null)
  }

  return (
    <section>
      <h5 className="fw-bold mb-3">Inventario de Cilindros (stock en product-service)</h5>
      <div className="row g-4 mb-4">
        <TarjetaInventario titulo="Cilindros Llenos (Stock Venta)" icono="bi-fire" color="success" stock={datos.stockLlenos} />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Catálogo de productos</h5>
        {!soloLectura && !form && (
          <button type="button" className="btn btn-naranja rounded-pill px-4" onClick={abrirNuevo}>
            <i className="bi bi-plus-lg me-1"></i> Nuevo producto
          </button>
        )}
      </div>

      {!soloLectura && form && (
        <form onSubmit={enviar} className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <h6 className="fw-bold mb-3">{esNuevo ? 'Nuevo producto' : `Editar ${form.codigo}`}</h6>
          <div className="row">
            <div className="col-md-4">
              <CampoFormulario id="codigo" etiqueta="Código" value={form.codigo} onChange={cambiar}
                disabled={!esNuevo} required maxLength={20} />
            </div>
            <div className="col-md-8">
              <CampoFormulario id="nombre" etiqueta="Nombre" value={form.nombre} onChange={cambiar}
                required maxLength={150} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="categoria" className="form-letra">Categoría</label>
              <select id="categoria" name="categoria" className="form-select" value={form.categoria}
                onChange={cambiar} required>
                {categorias.map((c) => <option key={c.slug} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <CampoFormulario id="unidad" etiqueta="Unidad" value={form.unidad} onChange={cambiar} required />
            </div>
            <div className="col-12">
              <CampoFormulario id="descripcion" etiqueta="Descripción" value={form.descripcion}
                onChange={cambiar} maxLength={500} />
            </div>
            <div className="col-md-4">
              <CampoFormulario id="precioResidencial" etiqueta="Precio residencial" type="number" min="0"
                value={form.precioResidencial} onChange={cambiar} required />
            </div>
            <div className="col-md-4">
              <CampoFormulario id="precioComercial" etiqueta="Precio comercial" type="number" min="0"
                value={form.precioComercial} onChange={cambiar} required />
            </div>
            <div className="col-md-4">
              <CampoFormulario id="stock" etiqueta="Stock" type="number" min="0"
                value={form.stock} onChange={cambiar} required />
            </div>
            <div className="col-12">
              <CampoFormulario id="img" etiqueta="Imagen (ruta, opcional)" value={form.img} onChange={cambiar} />
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-naranja rounded-pill px-4" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4"
              onClick={() => setForm(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

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
                {!soloLectura && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.codigo}>
                  <td>{p.codigo}</td>
                  <td>
                    {p.nombre}
                    {p.descripcion && <small className="d-block text-muted">{p.descripcion}</small>}
                  </td>
                  <td>{p.categoria}</td>
                  <td>${p.precioResidencial.toLocaleString('es-CL')}</td>
                  <td>${p.precioComercial.toLocaleString('es-CL')}</td>
                  <td>
                    <span className={`badge ${p.stock <= 10 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {p.stock}
                    </span>
                  </td>
                  {!soloLectura && (
                    <td className="text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-primary me-2"
                        aria-label={`Editar ${p.nombre}`} onClick={() => abrirEditar(p)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger"
                        aria-label={`Desactivar ${p.nombre}`} onClick={() => onDesactivar(p)}>
                        Desactivar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!soloLectura && desactivados.length > 0 && (
        <>
          <h5 className="fw-bold mt-4 mb-3">Productos desactivados</h5>
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {desactivados.map((p) => (
                    <tr key={p.codigo} className="text-muted">
                      <td>{p.codigo}</td>
                      <td>{p.nombre}</td>
                      <td>{p.categoria}</td>
                      <td>{p.stock}</td>
                      <td>
                        <button type="button" className="btn btn-sm btn-outline-success"
                          aria-label={`Reactivar ${p.nombre}`} onClick={() => onActivar(p)}>
                          Reactivar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
