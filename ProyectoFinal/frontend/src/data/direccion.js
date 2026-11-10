export const DIRECCION_VACIA = {
  calle: '',
  numero: '',
  tipo: 'casa',
  depto: '',
  region: '',
  comuna: '',
  indicaciones: '',
}

export function normalizarDireccion(d) {
  if (!d) return { ...DIRECCION_VACIA }
  if (typeof d === 'string') return { ...DIRECCION_VACIA, calle: d }
  return { ...DIRECCION_VACIA, ...d }
}

export function validarDireccion({ calle, numero, tipo, depto, region, comuna }) {
  const errores = {}

  if (calle.trim().length < 3) errores.calle = 'Ingresa el nombre de la calle.'
  if (!/^\d{1,6}$/.test(numero)) errores.numero = 'Ingresa el número (solo dígitos).'
  if (tipo === 'departamento' && !depto.trim()) {
    errores.depto = 'Ingresa el número de tu departamento.'
  }
  if (!region) errores.region = 'Selecciona una región.'
  if (!comuna) errores.comuna = 'Selecciona una comuna.'

  return errores
}

export function validarCliente({ nombre, apellidos, correo }) {
  const errores = {}

  if (!nombre.trim()) errores.nombre = 'Ingresa tu nombre.'
  if (!apellidos.trim()) errores.apellidos = 'Ingresa tus apellidos.'
  if (!/^\S+@\S+\.\S+$/.test(correo.trim())) errores.correo = 'Ingresa un correo válido.'

  return errores
}

export function formatearDireccion({ calle, numero, tipo, depto, comuna }) {
  const base =
    tipo === 'departamento' ? `${calle} ${numero}, Depto ${depto}` : `${calle} ${numero} (Casa)`
  return comuna ? `${base}, ${comuna}` : base
}
