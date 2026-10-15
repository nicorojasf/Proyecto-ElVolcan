export default function CampoFormulario({ id, etiqueta, error, ...inputProps }) {
  return (
    <div className="form-grupo mb-3">
      <label htmlFor={id} className="form-letra">{etiqueta}</label>
      <input
        id={id}
        name={id}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        {...inputProps}
      />
      {error && (
        <div className="invalid-feedback-personalizado d-block">{error}</div>
      )}
    </div>
  )
}
