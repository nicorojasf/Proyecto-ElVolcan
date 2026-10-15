import CampoFormulario from './CampoFormulario'
import { REGIONES, comunasDe } from '../data/regiones'

function CampoSelect({ id, etiqueta, error, children, ...selectProps }) {
  return (
    <div className="form-grupo mb-3">
      <label htmlFor={id} className="form-letra">{etiqueta}</label>
      <select
        id={id}
        name={id}
        className={`form-select ${error ? 'is-invalid' : ''}`}
        {...selectProps}
      >
        {children}
      </select>
      {error && <div className="invalid-feedback-personalizado d-block">{error}</div>}
    </div>
  )
}

export default function FormularioEntrega({
  valores,
  errores = {},
  onChange,
  onTipo,
  soloLectura = false,
}) {
  return (
    <>
      <div className="row">
        <div className="col-md-4">
          <CampoFormulario id="nombre" etiqueta="Nombre" type="text" value={valores.nombre}
            onChange={onChange} error={errores.nombre} disabled={soloLectura} />
        </div>
        <div className="col-md-4">
          <CampoFormulario id="apellidos" etiqueta="Apellidos" type="text" value={valores.apellidos}
            onChange={onChange} error={errores.apellidos} disabled={soloLectura} />
        </div>
        <div className="col-md-4">
          <CampoFormulario id="correo" etiqueta="Correo electrónico" type="email" value={valores.correo}
            onChange={onChange} error={errores.correo} disabled={soloLectura} />
        </div>
      </div>

      <h5 className="fw-bold mt-2 mb-3">Dirección de entrega de los productos</h5>

      <div className="row">
        <div className="col-md-8">
          <CampoFormulario id="calle" etiqueta="Calle" type="text" placeholder="Ej: Av. Libertad"
            value={valores.calle} onChange={onChange} error={errores.calle} disabled={soloLectura} />
        </div>
        <div className="col-md-4">
          <CampoFormulario id="numero" etiqueta="Número" type="text" inputMode="numeric"
            placeholder="Ej: 123" value={valores.numero} onChange={onChange}
            error={errores.numero} disabled={soloLectura} />
        </div>
      </div>

      <p className="form-letra mb-1">Tipo de vivienda</p>
      <div className="row g-2 mb-3">
        {[
          { tipo: 'casa', texto: 'Casa', icono: 'bi-house-door' },
          { tipo: 'departamento', texto: 'Departamento', icono: 'bi-building' },
        ].map((t) => (
          <div className="col-6 col-md-3" key={t.tipo}>
            <button
              type="button"
              className={`btn btn-selector w-100 ${valores.tipo === t.tipo ? 'active fw-bold' : ''}`}
              onClick={() => onTipo(t.tipo)}
              disabled={soloLectura}
            >
              <i className={`bi ${t.icono} me-1`}></i>{t.texto}
            </button>
          </div>
        ))}
      </div>

      {valores.tipo === 'departamento' && (
        <div className="row">
          <div className="col-md-4">
            <CampoFormulario id="depto" etiqueta="N° de departamento" type="text" placeholder="Ej: 603"
              maxLength={6} value={valores.depto} onChange={onChange} error={errores.depto}
              disabled={soloLectura} />
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <CampoSelect id="region" etiqueta="Región" value={valores.region} onChange={onChange}
            error={errores.region} disabled={soloLectura}>
            <option value="">Selecciona una región</option>
            {REGIONES.map((r) => (
              <option key={r.nombre} value={r.nombre}>{r.nombre}</option>
            ))}
          </CampoSelect>
        </div>
        <div className="col-md-6">
          <CampoSelect id="comuna" etiqueta="Comuna" value={valores.comuna} onChange={onChange}
            error={errores.comuna} disabled={soloLectura || !valores.region}>
            <option value="">Selecciona una comuna</option>
            {comunasDe(valores.region).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </CampoSelect>
        </div>
      </div>

      <div className="form-grupo mb-4">
        <label htmlFor="indicaciones" className="form-letra">
          Indicaciones para la entrega (opcional)
        </label>
        <textarea
          id="indicaciones"
          name="indicaciones"
          className="form-control"
          rows={3}
          maxLength={200}
          placeholder="Ej: Dejar con el conserje"
          value={valores.indicaciones}
          onChange={onChange}
          disabled={soloLectura}
        />
      </div>
    </>
  )
}
