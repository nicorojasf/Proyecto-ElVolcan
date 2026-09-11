/* ==========================================================================
   1. INICIALIZACIÓN Y PERSISTENCIA (LOCALSTORAGE)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // Carga de estado inicial guardado en la sesión del navegador
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Referencias principales a nodos del DOM
    const badges = document.querySelectorAll('.id-cart-badge');
    const contenedorLista = document.getElementById('lista-carrito');
    const totalElemento = document.getElementById('total-carrito');
    const btnCheckout = document.getElementById('btn-checkout');


    /* ==========================================================================
       2. DELEGACIÓN GLOBAL DE EVENTOS (CLICK LISTENERS)
       ========================================================================== */
    document.addEventListener('click', (e) => {
        
        // A) Evento: Botón "Añadir al Carrito" en tarjetas de producto
        const btnAgregar = e.target.closest('.tarjeta-custom .btn-naranja');
        if (btnAgregar) {
            e.preventDefault();
            
            // Extracción de metadatos desde la tarjeta contenedora
            const tarjeta = btnAgregar.closest('.tarjeta-custom');
            const nombre = tarjeta.querySelector('h5')?.textContent.trim() || 'Producto';
            const precioTexto = tarjeta.querySelector('h4')?.textContent.replace('$', '').replace(/\./g, '').trim() || '0';
            const precio = parseInt(precioTexto, 10);
            const img = tarjeta.querySelector('.img-cilindro')?.src || '';

            agregarAlCarrito(nombre, precio, img);

            // Retroalimentación visual interactiva en el botón
            const textoOriginal = btnAgregar.textContent;
            btnAgregar.textContent = '¡Agregado! ✓';
            btnAgregar.classList.add('bg-success', 'text-white');
            
            setTimeout(() => {
                btnAgregar.textContent = textoOriginal;
                btnAgregar.classList.remove('bg-success', 'text-white');
            }, 1000);
            
            return;
        }

        // B) Evento: Incrementar unidades (+) dentro del Carrito Desplegable
        const btnSumar = e.target.closest('.btn-sumar');
        if (btnSumar) {
            const nombre = btnSumar.dataset.nombre;
            cambiarCantidad(nombre, 1);
            return;
        }

        // C) Evento: Disminuir unidades (-) dentro del Carrito Desplegable
        const btnRestar = e.target.closest('.btn-restar');
        if (btnRestar) {
            const nombre = btnRestar.dataset.nombre;
            cambiarCantidad(nombre, -1);
            return;
        }
    });


    /* ==========================================================================
       3. LÓGICA DE NEGOCIO Y CONTROL DE ESTADO
       ========================================================================== */
    
    /**
     * Agrega un nuevo ítem o incrementa la cantidad si ya se encuentra registrado
     */
    function agregarAlCarrito(nombre, precio, img) {
        const existe = carrito.find(item => item.nombre === nombre);
        if (existe) {
            existe.cantidad++;
        } else {
            carrito.push({ nombre, precio, img, cantidad: 1 });
        }
        actualizarCarritoUI();
    }

    /**
     * Modifica la cantidad de un ítem (+1 / -1) y elimina el registro si llega a 0
     */
    function cambiarCantidad(nombre, cambio) {
        const producto = carrito.find(item => item.nombre === nombre);
        if (producto) {
            producto.cantidad += cambio;
            if (producto.cantidad <= 0) {
                carrito = carrito.filter(item => item.nombre !== nombre);
            }
        }
        actualizarCarritoUI();
    }


    /* ==========================================================================
       4. RENDERIZADO INTERFAZ DE USUARIO (UI)
       ========================================================================== */
    
    /**
     * Sincroniza el array 'carrito' con el almacenamiento local y refresca la interfaz
     */
    function actualizarCarritoUI() {
        // Guarda en LocalStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));

        // Actualización masiva de badges/contadores del Navbar
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        badges.forEach(badge => {
            badge.textContent = totalItems;
        });

        // Prevención de errores si la página actual carece del Offcanvas del Carrito
        if (!contenedorLista) return;

        // Renderizado para estado sin productos
        if (carrito.length === 0) {
            contenedorLista.innerHTML = '<p class="text-center text-muted my-4">El carrito está vacío.</p>';
            if (totalElemento) totalElemento.textContent = '$0';
            if (btnCheckout) btnCheckout.disabled = true;
            return;
        }

        // Renderizado dinámico de productos en el listado desplegable
        if (btnCheckout) btnCheckout.disabled = false;
        contenedorLista.innerHTML = '';
        let totalAcumulado = 0;

        carrito.forEach(prod => {
            const subtotal = prod.precio * prod.cantidad;
            totalAcumulado += subtotal;

            const itemHTML = `
                <div class="d-flex align-items-center justify-content-between p-2 border rounded bg-white shadow-sm mb-2">
                    <div class="d-flex align-items-center gap-2">
                        ${prod.img ? `<img src="${prod.img}" alt="${prod.nombre}" style="width: 40px; height: 40px; object-fit: contain;">` : ''}
                        <div>
                            <h6 class="mb-0 fw-bold fs-6 text-dark">${prod.nombre}</h6>
                            <small class="text-muted">$${prod.precio.toLocaleString('es-CL')}</small>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-restar" data-nombre="${prod.nombre}">-</button>
                        <span class="fw-bold text-dark">${prod.cantidad}</span>
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-sumar" data-nombre="${prod.nombre}">+</button>
                    </div>
                </div>
            `;
            contenedorLista.innerHTML += itemHTML;
        });

        // Formato final de moneda chilena (CLP)
        if (totalElemento) totalElemento.textContent = `$${totalAcumulado.toLocaleString('es-CL')}`;
    }


    /* ==========================================================================
       5. CARGA INICIAL
       ========================================================================== */
    // Ejecución inmediata para sincronizar estado al abrir cualquier página
    actualizarCarritoUI();
});