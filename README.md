# 🔥 Gas El Volcán — Frontend

Aplicación web (SPA) para **Distribuidora de Gas El Volcán**, empresa familiar de Chillán, Región de Ñuble, que distribuye cilindros de gas licuado a domicilio a clientes residenciales y comerciales.

Proyecto desarrollado para el curso **DSY1104 – Desarrollo FullStack II** (Evaluación Parcial N° 2: *Implementando frontend y pruebas unitarias a mi tienda online*).

---

## 📋 Tabla de contenidos

1. [Contexto del negocio](#-contexto-del-negocio)
2. [Estado actual del proyecto](#-estado-actual-del-proyecto)
3. [Tecnologías](#-tecnologías)
4. [Funcionalidades](#-funcionalidades)
5. [Rutas de la aplicación](#-rutas-de-la-aplicación)
6. [Estructura del proyecto](#-estructura-del-proyecto)
7. [Instalación y ejecución](#-instalación-y-ejecución)
8. [Cuentas de prueba](#-cuentas-de-prueba)
9. [Diseño responsivo](#-diseño-responsivo)
10. [Pruebas unitarias (Vitest)](#-pruebas-unitarias-vitest)
11. [Próximos pasos](#-próximos-pasos)
12. [Equipo](#-equipo)

---

## 🏢 Contexto del negocio

La empresa cuenta con 2 camiones de reparto, 3 repartidores, 1 operadora de llamadas y 1 administradora, y recibe entre **80 y 120 pedidos por día**. Distribuye cilindros de 5, 11 y 15 kg.

Hoy el proceso es manual (cuaderno y teléfono fijo), lo que genera estos problemas:

- Los clientes no saben cuándo llegará su pedido y llaman varias veces para preguntar.
- Los pedidos se anotan en hojas sueltas que se pierden o duplican en días de alta demanda.
- No existe historial de pedidos por cliente.
- No hay visibilidad del stock en tiempo real.
- Los pagos en efectivo no siempre quedan registrados.

### Objetivo del sistema

| Actor | Lo que debería poder hacer |
| --- | --- |
| **Cliente** | Hacer pedidos sin llamar por teléfono y ver el estado de su entrega. |
| **Operadora** | Ver de forma centralizada todos los pedidos del día y asignarlos. |
| **Repartidor** | Ver y actualizar el estado de sus entregas desde el celular. |
| **Administradora** | Ver el stock actual de cilindros sin contarlos físicamente y revisar las ventas. |

---

## 🚧 Estado actual del proyecto

Este repositorio contiene **la parte frontend** de la solución. Hoy funciona de forma autónoma en el navegador: los datos (cuentas, sesión, carrito y métricas del administrador) se guardan en `localStorage`.

| Requisito del curso | Estado |
| --- | --- |
| Frontend con React (SPA) | ✅ Implementado |
| Diseño responsivo con Bootstrap | ✅ Implementado |
| Navegación entre vistas (React Router) | ✅ Implementado |
| Formularios con validación (Login y Registro) | ✅ Implementado |
| Panel de administración (acceso solo para administrador) | ✅ Implementado (dashboard e inventario) |
| Pruebas unitarias con Vitest | ✅ Implementado |
| Backend con microservicios Spring Boot + API REST | ⏳ Pendiente (siguiente etapa) |
| Base de datos MySQL | ⏳ Pendiente |
| Mapa con Leaflet / Google Maps | ⏳ Pendiente |
| Roles Operadora y Repartidor, seguimiento de pedidos | ⏳ Pendiente |
| Despliegue en AWS con Docker | ⏳ Pendiente |

---

## 🛠️ Tecnologías

| Capa | Tecnología |
| --- | --- |
| Framework frontend | [React 19](https://react.dev/) |
| Empaquetador / servidor de desarrollo | [Vite](https://vite.dev/) |
| Enrutamiento | [React Router](https://reactrouter.com/) |
| Diseño responsivo | [Bootstrap 5](https://getbootstrap.com/) + [React-Bootstrap](https://react-bootstrap.github.io/) |
| Iconos | [Bootstrap Icons](https://icons.getbootstrap.com/) |
| Gráficos | [Chart.js](https://www.chartjs.org/) |
| Pruebas unitarias | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + jsdom |
| Linter | [Oxlint](https://oxc.rs/docs/guide/usage/linter) |

---

## ✨ Funcionalidades

### 🏠 Inicio — pedido rápido
- Selector de tipo de pedido: **Cilindro** o **Tanque**.
- Campo de celular **controlado**: solo acepta números y máximo 9 dígitos.
- Validación de celular chileno (9 dígitos que comienzan con 9).
- *Pedir gas Online*: para cilindro navega al catálogo; para tanque indica llamar a Pedidos Granel.
- *Pedir por WhatsApp*: abre una conversación con el mensaje del pedido ya escrito.
- Accesos directos a las categorías y sección de beneficios.

### 🛒 Catálogo de productos
- 4 categorías: **Cilindros de Gas, Reguladores, Mangueras y Conexiones, Accesorios** (15 productos).
- Filtro por categoría mediante la URL (`/productos/:slug`) y página de "Categoría no encontrada".
- Selector de **tipo de cliente** (residencial / comercial) que cambia los precios en todo el sitio.
- Tarjetas con precio en pesos chilenos, aviso de "¡Quedan solo N!" y estados del botón: *Añadir al Carrito*, *¡Agregado!*, *Máximo en carrito* y *Agotado*.

### 🧺 Carrito de compras
- Panel lateral (Offcanvas) accesible desde la barra superior, con contador de productos.
- Aumentar / disminuir cantidades; **nunca se supera el stock** y al llegar a 0 el producto se elimina.
- Total calculado según el tipo de cliente.
- El carrito **se conserva** al recargar la página.
- *Ir a Pagar*: registra la venta en las métricas del administrador y vacía el carrito.

### 👤 Autenticación
- **Registro** con validaciones: nombre obligatorio, correo institucional `@duocuc.cl`, teléfono de al menos 8 dígitos, contraseña de al menos 6 caracteres y confirmación de contraseña. Rechaza correos ya registrados.
- **Inicio de sesión** con validación de campos y mensajes de error; muestra las cuentas guardadas y permite rellenar el correo con un clic o eliminar una cuenta.
- La barra superior muestra la inicial y el nombre del usuario con sesión activa y el botón para cerrar sesión.

### 🛡️ Panel de administrador
- Ruta `/admin` **protegida**: quien no sea administrador es redirigido al login.
- **Dashboard General**: KPIs (pedidos de hoy, cilindros entregados, ingresos del día) y gráfico de pedidos completados con Chart.js.
- **Inventario de Cilindros**: stock de cilindros llenos y vacíos por tamaño (5, 11, 15 y 45 kg), que se actualiza con cada venta.
- El enlace al panel aparece en el menú lateral solo para el administrador.

---

## 🧭 Rutas de la aplicación

| Ruta | Vista | Acceso |
| --- | --- | --- |
| `/` | Inicio (pedido rápido) | Público |
| `/productos` | Catálogo completo | Público |
| `/productos/:slug` | Catálogo filtrado (`cilindros`, `reguladores`, `mangueras`, `accesorios`) | Público |
| `/login` | Inicio de sesión | Público |
| `/registro` | Crear cuenta | Público |
| `/admin` | Panel de administrador | Solo administrador |

---

## 📁 Estructura del proyecto

```
Proyecto2/
├── public/
│   └── imagenes/                 # Fotos de productos, logo y fondo
├── src/
│   ├── __tests__/                # Pruebas unitarias (Vitest)
│   ├── test/
│   │   └── setup.js              # Configuración global de las pruebas
│   ├── components/               # Componentes reutilizables
│   │   ├── Layout.jsx            # Estructura común: Navbar + Menú + Carrito + Footer
│   │   ├── Navbar.jsx            # Barra superior (sesión, contador del carrito)
│   │   ├── MenuLateral.jsx       # Menú lateral (Offcanvas)
│   │   ├── Carrito.jsx           # Panel lateral del carrito
│   │   ├── TarjetaProducto.jsx   # Tarjeta de producto del catálogo
│   │   ├── TarjetaCategoria.jsx  # Tarjeta de categoría de la página de inicio
│   │   ├── CampoFormulario.jsx   # Campo reutilizable con etiqueta y error
│   │   ├── GraficoPedidos.jsx    # Gráfico de Chart.js del panel admin
│   │   └── Footer.jsx
│   ├── context/                  # Estado global (Context API)
│   │   ├── AuthContext.jsx       # Usuarios, sesión, registro y login
│   │   └── CarritoContext.jsx    # Carrito, tipo de cliente y totales
│   ├── data/
│   │   ├── productos.js          # Categorías y catálogo de productos
│   │   └── adminStore.js         # Métricas e inventario del panel admin
│   ├── pages/                    # Una página por ruta
│   │   ├── Inicio.jsx
│   │   ├── Catalogo.jsx
│   │   ├── Login.jsx
│   │   ├── Registro.jsx
│   │   └── Admin.jsx
│   ├── App.jsx                   # Definición de rutas
│   ├── main.jsx                  # Punto de entrada y Providers
│   └── estilos.css               # Estilos propios
├── index.html
├── vite.config.js                # Configuración de Vite y de Vitest
└── package.json
```

### Gestión de propiedades (props) y estados

- **Props**: los componentes reciben datos y funciones desde su padre, por ejemplo `TarjetaProducto` recibe `producto`, `Navbar` recibe `cantidad`, `onMenu` y `onCarrito`, y `CampoFormulario` recibe `id`, `etiqueta`, `error` y el resto de atributos del `<input>`.
- **Estado local** (`useState`): formularios controlados en `Inicio`, `Login` y `Registro`, y apertura de los paneles laterales en `Layout`.
- **Estado global** (Context API): `AuthContext` y `CarritoContext` evitan pasar datos por muchos niveles de componentes. El carrito y la sesión se persisten en `localStorage`.
- **Datos derivados**: totales, cantidades y avisos de stock se calculan en cada render en lugar de guardarse en estado.

---

## 🚀 Instalación y ejecución

### Requisitos
- [Node.js](https://nodejs.org/) 18 o superior
- npm

### Pasos

```bash
# 1. Clonar el repositorio
git clone <URL-DEL-REPOSITORIO>
cd Proyecto2

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Previsualiza la versión de producción |
| `npm run lint` | Revisa el código con Oxlint |
| `npm test` | Ejecuta las pruebas en modo observador (watch) |
| `npm run test:run` | Ejecuta todas las pruebas una sola vez |
| `npm run test:ui` | Abre la interfaz gráfica de Vitest |

---

## 🔑 Cuentas de prueba

> ⚠️ Solo para desarrollo. Al integrar el backend, la autenticación se reemplazará por una solución segura con tokens y roles.

| Tipo | Cómo acceder |
| --- | --- |
| **Administrador** | Correo `admin@admin.cl` o `admin@admin.com`, con cualquier contraseña. Redirige a `/admin`. |
| **Cliente** | Crear una cuenta en `/registro` con un correo `@duocuc.cl`. |

---

## 📱 Diseño responsivo

La interfaz se adapta a los tamaños que exige el proyecto usando el sistema de grillas y las utilidades de Bootstrap:

| Dispositivo | Ancho mínimo | Comportamiento |
| --- | --- | --- |
| Teléfono móvil | 360 px | Una columna de productos, menú lateral tipo hamburguesa y textos secundarios ocultos (`d-none d-sm-inline`). |
| Tableta | 768 px | Dos y tres columnas de productos, hero en dos columnas. |
| Escritorio | 1280 px | Hasta cuatro columnas de productos y KPIs en una sola fila en el panel admin. |

Ejemplos usados en el código:
- Tarjetas de producto: `col-12 col-sm-6 col-md-4 col-lg-3`.
- KPIs del administrador: `col-12 col-sm-6 col-xl-3`.
- Menú y carrito: componentes `Offcanvas` de React-Bootstrap, que ocupan poco espacio en pantallas pequeñas.

---

## 🧪 Pruebas unitarias (Vitest)

Las pruebas usan **Vitest** como ejecutor, **React Testing Library** para renderizar componentes y consultar el DOM, **user-event** para simular la interacción del usuario y **jsdom** como entorno de navegador.

### Configuración del entorno

- `vite.config.js`: define `environment: 'jsdom'`, `globals: true` y el archivo de preparación `src/test/setup.js`.
- `src/test/setup.js`: carga los matchers de `@testing-library/jest-dom`, limpia el DOM después de cada prueba y vacía `localStorage` antes de cada una para que las pruebas sean independientes.

### Ejecutar las pruebas

```bash
npm run test:run
```

### Qué se prueba

| Archivo | Qué verifica |
| --- | --- |
| `CarritoContext.test.jsx` | Agregar productos y calcular el total, límite de stock, precio comercial y eliminación al llegar a 0. |
| `Inicio.test.jsx` | El campo de celular solo acepta números (máximo 9), error por celular inválido y aviso para pedidos de tanque. |
| `TarjetaProducto.test.jsx` | Precio formateado en pesos chilenos, botón "Agotado" y botón "Máximo en carrito". |
| `Registro.test.jsx` | Errores con el formulario vacío, contraseñas distintas y registro exitoso con redirección a `/login`. |
| `Login.test.jsx` | Validación de campos, credenciales incorrectas y redirección de cliente (`/`) y administrador (`/admin`). |

### Mocks utilizados

- `vi.mock('react-router-dom')` para reemplazar `useNavigate` por una función espía y comprobar a qué ruta se redirige.
- `vi.spyOn(window, 'alert')` para evitar ventanas emergentes reales y verificar el mensaje mostrado.
- `vi.fn()` para simular funciones recibidas como props.

### Cobertura de código (opcional)

```bash
npm install -D @vitest/coverage-v8
npx vitest run --coverage
```

---

## 🗺️ Próximos pasos

Según los requisitos técnicos del proyecto semestral:

- [ ] Backend con al menos dos microservicios **Spring Boot** (por ejemplo `/api/usuarios` y `/api/pedidos`), con respuestas JSON.
- [ ] Reemplazar `localStorage` por consumo de la API REST.
- [ ] Autenticación segura con token y **roles**: Administrador, Operadora y Repartidor.
- [ ] Flujo completo de pedidos: el cliente crea el pedido con su dirección, la operadora lo asigna y el repartidor actualiza su estado.
- [ ] Mapa interactivo (**Leaflet** o Google Maps) con la ubicación del repartidor y el punto de entrega.
- [ ] Gestión de usuarios en el panel de administración (crear, editar, desactivar y asignar roles).
- [ ] Base de datos relacional normalizada (MySQL).
- [ ] Contenerización con Docker y despliegue en AWS.
- [ ] Optimización para conexiones lentas e inestables y para teléfonos Android de gama media-baja, que es el escenario real de los repartidores.

---

## 👥 Equipo

| Integrante 
| --- | --- |
| Nicolas Rojas |
| Benjamin Perez |

**Asignatura:** DSY1104 – Desarrollo FullStack II
**Institución:** Duoc UC
