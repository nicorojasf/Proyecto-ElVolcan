import { Link, useParams } from 'react-router-dom'

// Cada sección del footer: título y bloques de contenido (párrafos o listas)
const secciones = {
  'quienes-somos': {
    titulo: 'Quiénes somos',
    bloques: [
      { tipo: 'p', texto: 'Gas El Volcán es una empresa chilena dedicada a la distribución de gas licuado (GLP) para hogares, comercios e industrias. Nuestro objetivo es que el gas llegue seguro, a tiempo y a un precio justo.' },
      { tipo: 'p', texto: 'Vendemos cilindros de 5, 11, 15 y 45 kg, además de reguladores, mangueras y accesorios homologados para instalar y usar el gas con tranquilidad.' },
      { tipo: 'lista', items: ['Seguridad primero: todos nuestros productos cumplen la normativa vigente.', 'Precio residencial y comercial según el tipo de cliente.', 'Compra online y despacho a domicilio.'] },
    ],
  },
  'trabaja-con-nosotros': {
    titulo: 'Trabaja en El Volcán',
    bloques: [
      { tipo: 'p', texto: 'Buscamos personas responsables y con ganas de crecer. Estos son los cargos que solemos abrir:' },
      { tipo: 'lista', items: ['Conductor de reparto (licencia clase B o superior).', 'Ayudante de bodega y carga.', 'Ejecutivo de atención al cliente.', 'Vendedor de local y empresas.'] },
      { tipo: 'p', texto: 'Envía tu currículum a contacto@gaselvolcan.cl indicando el cargo en el asunto del correo.' },
    ],
  },
  encuentranos: {
    titulo: 'Encuéntranos',
    bloques: [
      { tipo: 'p', texto: 'Atendemos todos los días de lunes a domingo, de 8:00 a 20:00 horas.' },
      { tipo: 'lista', items: ['Casa matriz: Av. Los Volcanes 1234, Santiago.', 'Sucursal Maipú: Camino a Rinconada 567.', 'Sucursal Puente Alto: Av. Concha y Toro 890.'] },
      { tipo: 'p', texto: 'Para pedidos con despacho puedes comprar directamente en esta tienda o llamar al 600 600 0707.' },
    ],
  },
  'normativas-sec': {
    titulo: 'Normativas SEC',
    bloques: [
      { tipo: 'p', texto: 'La Superintendencia de Electricidad y Combustibles (SEC) fiscaliza la seguridad de los productos y las instalaciones de gas en Chile. En Gas El Volcán cumplimos con esa normativa.' },
      { tipo: 'lista', items: ['Los cilindros se revisan y se llenan en plantas autorizadas.', 'Los reguladores y mangueras que vendemos están certificados.', 'Las instalaciones de gas deben ser hechas por instaladores autorizados.', 'Ante olor a gas: cierra la llave, ventila, no uses fuego ni interruptores y llama al 600 600 5817.'] },
    ],
  },
  'terminos-y-condiciones': {
    titulo: 'Términos y condiciones',
    bloques: [
      { tipo: 'lista', items: ['Los precios incluyen IVA y pueden cambiar sin previo aviso.', 'El precio residencial es para hogares y el comercial para empresas, según el tipo de cuenta.', 'El pedido se confirma al completar el pago y está sujeto al stock disponible.', 'El despacho se realiza en el horario de atención, en la dirección indicada al comprar.', 'Los datos personales se usan solo para gestionar tu compra y tu cuenta.', 'Para cambios o reclamos escribe a contacto@gaselvolcan.cl.'] },
    ],
  },
}

export default function Informacion() {
  const { seccion } = useParams()
  const datos = secciones[seccion]

  if (!datos) {
    return (
      <div className="container py-5">
        <h2 className="fw-bold">Sección no encontrada</h2>
        <Link to="/">Volver al inicio</Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <h2 className="fw-bold mb-4">{datos.titulo}</h2>
      {datos.bloques.map((b, i) =>
        b.tipo === 'p' ? (
          <p key={i}>{b.texto}</p>
        ) : (
          <ul key={i}>
            {b.items.map((item) => (
              <li key={item} className="mb-1">{item}</li>
            ))}
          </ul>
        )
      )}
      <Link to="/" className="btn btn-outline-secondary mt-3">Volver al inicio</Link>
    </div>
  )
}
