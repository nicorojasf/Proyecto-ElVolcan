import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TarjetaCategoria from '../components/TarjetaCategoria'
import { categorias } from '../data/productos'

const NUMERO_WHATSAPP = '56948760703'

{categorias.map((c) => (
  <TarjetaCategoria key={c.slug} titulo={c.nombre} ruta={`/productos/${c.slug}`} />
))}

const beneficios = [
  { titulo: 'Despacho Rápido',  texto: 'Entregas programadas y urgentes a domicilio.' },
  { titulo: 'Máxima Seguridad', texto: 'Cilindros e instalaciones certificadas SEC.' },
  { titulo: 'Atención 24/7',    texto: 'Soporte continuo para emergencias y pedidos.' },
]

export default function Inicio() {
  const navigate = useNavigate()

  const [tipo, setTipo] = useState('cilindro')
  const [telefono, setTelefono] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleTelefono = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 9)
    setTelefono(soloNumeros)
    setMensaje('')
  }

  const validar = () => {
    if (!/^9\d{8}$/.test(telefono)) {
      setMensaje('Ingresa un celular válido de 9 dígitos que comience con 9.')
      return false
    }
    return true
  }

  const pedirOnline = () => {
    if (!validar()) return
    if (tipo === 'cilindro') {
     navigate('/productos/cilindros')
    } else {
      setMensaje('Para pedidos de tanque llama a Pedidos Granel: 600 600 2811.')
    }
  }

  const pedirWhatsApp = () => {
    if (!validar()) return
    const texto = `Hola, quiero pedir gas (${tipo}). Mi número es +56${telefono}.`
    window.open(
      `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(texto)}`,
      '_blank'
    )
  }

  return (
    <main className="container my-4">

      <div className="row g-4 mb-4">
        <div className="col-lg-7 col-md-6">
          <div className="banner-principal p-4">
            <h1 className="banner-titulo">
              El calor y energía para<br />su hogar y negocio
            </h1>
            <p className="banner-texto">
              Un servicio rápido, seguro y al mejor precio de la región.
            </p>
          </div>
        </div>

        <div className="col-lg-5 col-md-6">
          <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between">
            <h5 className="fw-bold text-center mb-3 text-naranja">
              Realiza tu pedido de gas aquí
            </h5>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <button
                  className={`btn btn-selector w-100 ${tipo === 'cilindro' ? 'active fw-bold' : ''}`}
                  onClick={() => { setTipo('cilindro'); setMensaje('') }}
                >
                  Cilindro
                </button>
              </div>
              <div className="col-6">
                <button
                  className={`btn btn-selector w-100 ${tipo === 'tanque' ? 'active fw-bold' : ''}`}
                  onClick={() => { setTipo('tanque'); setMensaje('') }}
                >
                  Tanque
                </button>
              </div>
            </div>

            <div className="input-group mb-2">
              <span className="input-group-text bg-light text-secondary">+56</span>
              <input
                type="text"
                inputMode="numeric"
                className="form-control"
                placeholder="Ingresa tu número"
                value={telefono}
                onChange={handleTelefono}
              />
            </div>

            {mensaje && <p className="text-danger small mb-2">{mensaje}</p>}

            <div className="d-grid gap-2 mt-2">
              <button className="btn text-white fw-bold py-2 bg-danger" onClick={pedirOnline}>
                Pedir gas Online
              </button>
              <button className="btn btn-outline-success fw-bold py-2" onClick={pedirWhatsApp}>
                Pedir por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {categorias.map((c) => (
          <TarjetaCategoria
            key={c.slug}
            titulo={c.nombre}
            ruta={`/productos/${c.slug}`}
          />
        ))}
      </div>

      <div className="bg-white p-4 rounded-4 shadow-sm">
        <h4 className="fw-bold mb-4 text-dark">¿Por qué elegir Gas El Volcán?</h4>
        <div className="row g-3">
          {beneficios.map((b) => (
            <div key={b.titulo} className="col-md-4">
              <div className="p-3 bg-light rounded-3 border-start border-4 border-danger">
                <h6 className="fw-bold text-dark mb-1">{b.titulo}</h6>
                <p className="text-secondary small mb-0">{b.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}