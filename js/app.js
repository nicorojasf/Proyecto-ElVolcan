document.addEventListener('DOMContentLoaded', () => {
    // Estado del carrito
    let carrito = [];

    // Elementos del DOM
    const badges = document.querySelectorAll('.id-cart-badge');
    const contenedorLista = document.getElementById('lista-carrito');
    const totalElemento = document.getElementById('total-carrito');
    const btnCheckout = document.getElementById('btn-checkout');
    const botonesAgregar = document.querySelectorAll('.tarjeta-custom .btn-naranja');

    // Escuchar el clic en los botones "Añadir al Carrito"
    botonesAgregar.forEach((boton) => {
        boton.addEventListener('click', (e) => {
            const tarjeta = e.target.closest('.tarjeta-custom');
            const nombre = tarjeta.querySelector('h5').textContent.trim();
            const precioTexto = tarjeta.querySelector('h4').textContent.replace('$', '').replace('.', '').trim();
            const precio = parseInt(precioTexto, 10);
            const img = tarjeta.querySelector('.img-cilindro')?.src || '';

            agregarAlCarrito(nombre, precio, img);

            // Animación de confirmación en el botón
            const textoOriginal = boton.textContent;
            boton.textContent = '¡Agregado! ✓';
            boton.classList.add('bg-success', 'text-white');
            
            setTimeout(() => {
                boton.textContent = textoOriginal;
                boton.classList.remove('bg-success', 'text-white');
            }, 1000);
        });
    });

    // Agregar producto al arreglo
    function agregarAlCarrito(nombre, precio, img) {
        const existe = carrito.find(item => item.nombre === nombre);
        if (existe) {
            existe.cantidad++;
        } else {
            carrito.push({ nombre, precio, img, cantidad: 1 });
        }
        actualizarCarritoUI();
    }

    // Modificar cantidad (+ / -)
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

    // Actualizar la interfaz gráfica y los totales
    function actualizarCarritoUI() {
        // 1. Actualizar el contador en la barra superior
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        badges.forEach(badge => {
            badge.textContent = totalItems;
            badge.classList.add('bounce-anim');
            setTimeout(() => badge.classList.remove('bounce-anim'), 300);
        });

        // 2. Si está vacío, mostrar mensaje
        if (carrito.length === 0) {
            contenedorLista.innerHTML = '<p class="text-center text-muted my-4">El carrito está vacío.</p>';
            totalElemento.textContent = '$0';
            btnCheckout.disabled = true;
            return;
        }

        // 3. Renderizar items si hay productos
        btnCheckout.disabled = false;
        contenedorLista.innerHTML = '';
        let totalAcumulado = 0;

        carrito.forEach(prod => {
            const subtotal = prod.precio * prod.cantidad;
            totalAcumulado += subtotal;

            const itemHTML = `
                <div class="d-flex align-items-center justify-content-between p-2 border rounded bg-white shadow-sm">
                    <div class="d-flex align-items-center gap-2">
                        ${prod.img ? `<img src="${prod.img}" alt="${prod.nombre}" style="width: 40px; height: 40px; object-fit: contain;">` : ''}
                        <div>
                            <h6 class="mb-0 fw-bold fs-6">${prod.nombre}</h6>
                            <small class="text-muted">$${prod.precio.toLocaleString('es-CL')}</small>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-restar" data-nombre="${prod.nombre}">-</button>
                        <span class="fw-bold">${prod.cantidad}</span>
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-sumar" data-nombre="${prod.nombre}">+</button>
                    </div>
                </div>
            `;
            contenedorLista.innerHTML += itemHTML;
        });

        // 4. Formatear y mostrar total
        totalElemento.textContent = `$${totalAcumulado.toLocaleString('es-CL')}`;

        // 5. Reasignar eventos a los nuevos botones + y -
        document.querySelectorAll('.btn-sumar').forEach(btn => {
            btn.addEventListener('click', () => cambiarCantidad(btn.dataset.nombre, 1));
        });
        document.querySelectorAll('.btn-restar').forEach(btn => {
            btn.addEventListener('click', () => cambiarCantidad(btn.dataset.nombre, -1));
        });
    }
});