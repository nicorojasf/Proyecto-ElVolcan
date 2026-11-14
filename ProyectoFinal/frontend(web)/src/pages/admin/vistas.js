// roles: quién ve cada vista en el panel. El VENDEDOR solo ve Órdenes y Productos (lectura).
export const vistas = [
  { id: 'dashboard', roles: ['ADMIN'], texto: 'Dashboard', icono: 'bi-speedometer2',
    subtitulo: 'Resumen de las actividades diarias',
    descripcion: 'Visión general de todas las métricas y estadísticas del sistema.' },
  { id: 'ordenes', roles: ['ADMIN', 'VENDEDOR'], texto: 'Órdenes', icono: 'bi-cart3',
    subtitulo: 'Compras realizadas en la tienda',
    descripcion: 'Gestión y seguimiento de todas las órdenes de compra realizadas.' },
  { id: 'productos', roles: ['ADMIN', 'VENDEDOR'], texto: 'Productos', icono: 'bi-box-seam',
    subtitulo: 'Catálogo e inventario de cilindros',
    descripcion: 'Administra inventario y detalles de los productos disponibles.' },
  { id: 'categorias', roles: ['ADMIN'], texto: 'Categorías', icono: 'bi-tags',
    subtitulo: 'Organización del catálogo',
    descripcion: 'Organiza productos en categorías para facilitar su navegación.' },
  { id: 'usuarios', roles: ['ADMIN'], texto: 'Usuarios', icono: 'bi-people',
    subtitulo: 'Cuentas registradas en la tienda',
    descripcion: 'Gestión de cuentas de usuarios y sus datos de entrega.' },
  { id: 'reportes', roles: ['ADMIN'], texto: 'Reportes', icono: 'bi-bar-chart',
    subtitulo: 'Ventas y productos más vendidos',
    descripcion: 'Generación de informes detallados sobre las operaciones del sistema.' },
  { id: 'perfil', roles: ['ADMIN'], texto: 'Perfil', icono: 'bi-person', aparte: true,
    subtitulo: 'Información de la cuenta administradora',
    descripcion: 'Administración de la información personal y configuraciones de cuenta.' },
]

export const tienda = {
  texto: 'Tienda',
  icono: 'bi-shop',
  ruta: '/',
  descripcion: 'Visualiza tu tienda en tiempo real, tal como la ven los clientes.',
}
