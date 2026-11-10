// Datos del footer: arrays de objetos (antes estaban repetidos a mano en el HTML)
const enlacesEmpresa = [
  'Quienes somos',
  'Trabaja En El Volcan',
  'Encuentranos',
  'Normativas SEC',
  'Terminos Y Condiciones',
]

const telefonosAtencion = [
  { etiqueta: 'Emergencias', numero: '600 600 5817' },
  { etiqueta: 'Servicio al Cliente', numero: '600 600 2019' },
]

const telefonosPedidos = [
  { etiqueta: 'Pedidos Cilindros', numero: '600 600 0707' },
  { etiqueta: 'Pedidos Granel Nacional', numero: '600 600 2811' },
  { etiqueta: 'Seguimiento Pedido', numero: '600 600 1313' },
]

// Componente pequeño que RECIBE una lista por props y la dibuja
function ListaTelefonos({ telefonos }) {
  return (
    <div className="d-flex flex-column gap-1 text-secondary-custom">
      {telefonos.map((t) => (
        <p key={t.etiqueta} className="mb-0">
          {t.etiqueta} <strong className="text-white">{t.numero}</strong>
        </p>
      ))}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="footer-principal pt-5">
      <div className="container pb-4">
        <div className="row g-4">

          {/* Columna 1: enlaces de la empresa */}
          <div className="col-md-4">
            <h5 className="fw-bold text-white mb-3">Acerca De Gas El Volcán</h5>
            <ul className="list-unstyled text-secondary-custom mb-0">
              {enlacesEmpresa.map((texto) => (
                <li key={texto} className="mb-1">
                  <a href="#" className="footer-link">• {texto}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 2: teléfonos */}
          <div className="col-md-4">
            <h5 className="fw-bold text-white mb-3">Atención al cliente</h5>
            <ListaTelefonos telefonos={telefonosAtencion} />
            <hr className="border-secondary opacity-50 my-3" />
            <ListaTelefonos telefonos={telefonosPedidos} />
          </div>

          {/* Columna 3: contacto */}
          <div className="col-md-4">
            <h5 className="fw-bold text-white mb-3">Contacto</h5>
            <p className="text-secondary-custom mb-1">
              Email:{' '}
              <a href="mailto:contacto@gaselvolcan.cl" className="footer-link">
                contacto@gaselvolcan.cl
              </a>
            </p>
            <p className="text-secondary-custom mb-0">Atención: Lun a Dom 8:00 - 20:00</p>
          </div>

        </div>
      </div>

      {/* Sub-footer */}
      <div className="sub-footer py-3">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="small text-muted">
            <i className="bi bi-telephone-fill me-1"></i> Emergencia: <strong>600 600 5817</strong>
          </div>
          <div className="small text-muted">
            © 2026 Gas El Volcán. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}