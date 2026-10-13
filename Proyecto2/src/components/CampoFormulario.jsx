// Campo de formulario reutilizable para Login y Registro.
// Props: id, etiqueta, error (texto o vacío) y el resto (type, placeholder, value, onChange...) va al <input>
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
