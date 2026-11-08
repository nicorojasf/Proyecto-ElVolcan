// Categorías: el 'nombre' debe coincidir EXACTO con la columna Categoría de cada producto
export const categorias = [
  { slug: 'cilindros',   nombre: 'Cilindros de Gas',      icono: 'bi-fire' },
  { slug: 'reguladores', nombre: 'Reguladores',           icono: 'bi-speedometer2' },
  { slug: 'mangueras',   nombre: 'Mangueras y Conexiones', icono: 'bi-tools' },
  { slug: 'accesorios',  nombre: 'Accesorios',            icono: 'bi-grid-fill' },
]

export const productos = [
  // ---------- Cilindros de Gas ----------
  { codigo: 'CL001', categoria: 'Cilindros de Gas', nombre: 'Cilindro GLP 5 kg',
    descripcion: 'Cilindro de gas licuado de petróleo 5 kg. Para uso residencial (cocina, calefacción pequeña).',
    unidad: 'Unidad', precioResidencial: 6500, precioComercial: 6000, stock: 80, img: '/imagenes/c5k.png' },
  { codigo: 'CL002', categoria: 'Cilindros de Gas', nombre: 'Cilindro GLP 11 kg',
    descripcion: 'Cilindro estándar doméstico. El más utilizado en hogares chilenos. Compatible con reguladores estándar.',
    unidad: 'Unidad', precioResidencial: 12000, precioComercial: 11000, stock: 200, img: '/imagenes/c11k.png' },
  { codigo: 'CL003', categoria: 'Cilindros de Gas', nombre: 'Cilindro GLP 15 kg',
    descripcion: 'Cilindro de mayor capacidad para hogares de alto consumo o locales pequeños.',
    unidad: 'Unidad', precioResidencial: 16000, precioComercial: 14500, stock: 90, img: '/imagenes/c15k.png' },
  { codigo: 'CL004', categoria: 'Cilindros de Gas', nombre: 'Cilindro GLP 45 kg',
    descripcion: 'Cilindro industrial. Uso comercial: restaurantes, talleres, calefacción de locales.',
    unidad: 'Unidad', precioResidencial: 45000, precioComercial: 40000, stock: 30, img: '/imagenes/c45k.png' },

  // ---------- Reguladores ----------
  { codigo: 'RG001', categoria: 'Reguladores', nombre: 'Regulador doméstico estándar',
    descripcion: 'Regulador de 1 etapa para cilindros 5, 11 y 15 kg. Presión de salida 28 mbar.',
    unidad: 'Unidad', precioResidencial: 8990, precioComercial: 8200, stock: 45, img: '/imagenes/rg001.png' },
  { codigo: 'RG002', categoria: 'Reguladores', nombre: 'Regulador de alta presión',
    descripcion: 'Regulador para cocinas industriales o equipos de mayor consumo. Presión regulable.',
    unidad: 'Unidad', precioResidencial: 18990, precioComercial: 17000, stock: 12, img: '/imagenes/rg002.png' },
  { codigo: 'RG003', categoria: 'Reguladores', nombre: 'Regulador dual (2 salidas)',
    descripcion: 'Permite conectar dos artefactos simultáneamente al mismo cilindro.',
    unidad: 'Unidad', precioResidencial: 14990, precioComercial: 13500, stock: 18, img: '/imagenes/rg003.png' },

  // ---------- Mangueras y Conexiones ----------
  { codigo: 'MG001', categoria: 'Mangueras y Conexiones', nombre: 'Manguera gas 1.5 m',
    descripcion: 'Manguera flexible homologada. Diámetro interior 9mm. Compatible con reguladores estándar.',
    unidad: 'Unidad', precioResidencial: 3990, precioComercial: 3500, stock: 80, img: '/imagenes/mg001.png' },
  { codigo: 'MG002', categoria: 'Mangueras y Conexiones', nombre: 'Manguera gas 3 m',
    descripcion: 'Manguera larga para instalaciones donde el artefacto está alejado del cilindro.',
    unidad: 'Unidad', precioResidencial: 6990, precioComercial: 6200, stock: 50, img: '/imagenes/mg002.png' },
  { codigo: 'MG003', categoria: 'Mangueras y Conexiones', nombre: 'Abrazadera metálica',
    descripcion: 'Abrazadera de acero para asegurar la conexión manguera-regulador y manguera-artefacto.',
    unidad: 'Unidad', precioResidencial: 990, precioComercial: 800, stock: 200, img: '/imagenes/mg003.png' },
  { codigo: 'MG004', categoria: 'Mangueras y Conexiones', nombre: 'Kit conexión completo (regulador + manguera 1.5m + abrazaderas)',
    descripcion: 'Todo lo necesario para instalar un cilindro nuevo.',
    unidad: 'Kit', precioResidencial: 12990, precioComercial: 11500, stock: 25, img: '/imagenes/mg004.png' },

  // ---------- Accesorios ----------
  { codigo: 'AC001', categoria: 'Accesorios', nombre: 'Carro porta cilindro 11/15 kg',
    descripcion: 'Carro metálico con ruedas para transportar cilindros dentro del hogar con seguridad.',
    unidad: 'Unidad', precioResidencial: 12990, precioComercial: 11000, stock: 20, img: '/imagenes/ac001.png' },
  { codigo: 'AC002', categoria: 'Accesorios', nombre: 'Tapa protectora para válvula',
    descripcion: 'Tapa de plástico ABS para proteger la válvula del cilindro durante el transporte.',
    unidad: 'Unidad', precioResidencial: 1490, precioComercial: 1200, stock: 60, img: '/imagenes/ac002.png' },
  { codigo: 'AC003', categoria: 'Accesorios', nombre: 'Detector de gas a batería',
    descripcion: 'Sensor electroquímico. Alarma sonora y visual ante fuga de gas GLP o metano.',
    unidad: 'Unidad', precioResidencial: 19990, precioComercial: 17000, stock: 8, img: '/imagenes/ac003.png' },
]