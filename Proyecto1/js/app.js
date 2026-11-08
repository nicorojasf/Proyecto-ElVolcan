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

    // Sincronizar el Header con la sesión activa
    actualizarHeaderSesion();
    actualizarVistaAdmin();


    /* ==========================================================================
       2. DELEGACIÓN GLOBAL DE EVENTOS (CLICK LISTENERS)
       ========================================================================== */
    document.addEventListener('click', (e) => {
        
        // A) Evento: Botón "Añadir al Carrito" en tarjetas de producto
        const btnAgregar = e.target.closest('.tarjeta-custom .btn-naranja');
        if (btnAgregar) {
            e.preventDefault();
            
            const tarjeta = btnAgregar.closest('.tarjeta-custom');
            const nombre = tarjeta.querySelector('h5')?.textContent.trim() || 'Producto';
            const precioTexto = tarjeta.querySelector('h4')?.textContent.replace('$', '').replace(/\./g, '').trim() || '0';
            const precio = parseInt(precioTexto, 10);
            const img = tarjeta.querySelector('.img-cilindro')?.src || '';

            agregarAlCarrito(nombre, precio, img);

            const textoOriginal = btnAgregar.textContent;
            btnAgregar.textContent = '¡Agregado! ✓';
            btnAgregar.classList.add('bg-success', 'text-white');
            
            setTimeout(() => {
                btnAgregar.textContent = textoOriginal;
                btnAgregar.classList.remove('bg-success', 'text-white');
            }, 1000);            
            return;
        }

        // B) Evento: Incrementar unidades (+) dentro del Carrito
        const btnSumar = e.target.closest('.btn-sumar');
        if (btnSumar) {
            cambiarCantidad(btnSumar.dataset.nombre, 1);
            return;
        }

        // C) Evento: Disminuir unidades (-) dentro del Carrito
        const btnRestar = e.target.closest('.btn-restar');
        if (btnRestar) {
            cambiarCantidad(btnRestar.dataset.nombre, -1);
            return;
        }
    });

    // D) Evento: Click en "Ir a Pagar" (Checkout)
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            if (carrito.length === 0) return;

            // Procesar datos para sumar al Panel Administrador
            let datosAdmin = JSON.parse(localStorage.getItem('datosAdmin')) || {
                pedidosHoy: 38,
                cilindrosEntregados: 45,
                ingresosDia: 840000,
                stockLlenos: { '5kg': 24, '11kg': 85, '15kg': 62, '45kg': 12 },
                stockVacios: { '5kg': 10, '11kg': 34, '15kg': 18, '45kg': 5 }
            };

            let totalCompra = 0;
            let totalCilindrosComprados = 0;

            carrito.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                totalCompra += subtotal;
                totalCilindrosComprados += item.cantidad;

                // Descontar del inventario de llenos y pasar a vacíos si coincide el tipo
                if (item.nombre.includes('5')) {
                    datosAdmin.stockLlenos['5kg'] = Math.max(0, datosAdmin.stockLlenos['5kg'] - item.cantidad);
                    datosAdmin.stockVacios['5kg'] += item.cantidad;
                } else if (item.nombre.includes('11')) {
                    datosAdmin.stockLlenos['11kg'] = Math.max(0, datosAdmin.stockLlenos['11kg'] - item.cantidad);
                    datosAdmin.stockVacios['11kg'] += item.cantidad;
                } else if (item.nombre.includes('15')) {
                    datosAdmin.stockLlenos['15kg'] = Math.max(0, datosAdmin.stockLlenos['15kg'] - item.cantidad);
                    datosAdmin.stockVacios['15kg'] += item.cantidad;
                } else if (item.nombre.includes('45')) {
                    datosAdmin.stockLlenos['45kg'] = Math.max(0, datosAdmin.stockLlenos['45kg'] - item.cantidad);
                    datosAdmin.stockVacios['45kg'] += item.cantidad;
                }
            });

            // Actualizar Métricas (KPIs)
            datosAdmin.pedidosHoy += 1;
            datosAdmin.cilindrosEntregados += totalCilindrosComprados;
            datosAdmin.ingresosDia += totalCompra;

            // Guardar en localStorage
            localStorage.setItem('datosAdmin', JSON.stringify(datosAdmin));

            // Vaciar el carrito
            carrito = [];
            actualizarCarritoUI();

            alert("¡Pago realizado con éxito! Tu pedido ha sido procesado y el stock actualizado.");

            // Cerrar el Offcanvas si Bootstrap está cargado
            const offcanvasElement = document.getElementById('offcanvasCarrito');
            if (offcanvasElement && window.bootstrap) {
                const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (bsOffcanvas) bsOffcanvas.hide();
            }
        });
    }


    /* ==========================================================================
       3. LÓGICA DE NEGOCIO Y CONTROL DE ESTADO DEL CARRITO
       ========================================================================== */
    function agregarAlCarrito(nombre, precio, img) {
        const existe = carrito.find(item => item.nombre === nombre);
        if (existe) {
            existe.cantidad++;
        } else {
            carrito.push({ nombre, precio, img, cantidad: 1 });
        }
        actualizarCarritoUI();
    }

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
    function actualizarCarritoUI() {
        localStorage.setItem('carrito', JSON.stringify(carrito));

        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        badges.forEach(badge => {
            badge.textContent = totalItems;
        });

        if (!contenedorLista) return;

        if (carrito.length === 0) {
            contenedorLista.innerHTML = '<p class="text-center text-muted my-4">El carrito está vacío.</p>';
            if (totalElemento) totalElemento.textContent = '$0';
            if (btnCheckout) btnCheckout.disabled = true;
            return;
        }

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

        if (totalElemento) totalElemento.textContent = `$${totalAcumulado.toLocaleString('es-CL')}`;
    }

    actualizarCarritoUI();


    /* ==========================================================================
       5. VALIDACIONES PERSONALIZADAS DE FORMULARIOS Y SESIÓN
       ========================================================================== */
       
    // A) Validación e Inicio de Sesión
    const formLogin = document.querySelector("main.auth-wrapper form");
    if (formLogin && document.title.includes("Iniciar Sesión")) {

        renderizarSugerenciasLogin();

        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");
            let valido = true;

            [emailInput, passwordInput].forEach(i => i.classList.remove("is-invalid"));

            if (!emailInput.value || !emailInput.value.includes("@")) {
                mostrarErrorPersonalizado(emailInput, "Ingrese un correo válido.");
                valido = false;
            }
            if (!passwordInput.value) {
                mostrarErrorPersonalizado(passwordInput, "Ingrese su contraseña.");
                valido = false;
            }

            if (valido) {
                let listaUsuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
                const usuarioEncontrado = listaUsuarios.find(u => u.email === emailInput.value && u.password === passwordInput.value);

                // Verificación especial para cuentas de administrador
                const esAdmin = emailInput.value === "admin@admin.cl" || emailInput.value === "admin@admin.com";

                if (usuarioEncontrado || esAdmin) {
                    const datosSesion = {
                        nombre: esAdmin ? 'Administrador' : usuarioEncontrado.nombre,
                        email: emailInput.value,
                        esAdmin: esAdmin
                    };
                    
                    localStorage.setItem('sesionActiva', JSON.stringify(datosSesion));

                    alert(`¡Bienvenido de vuelta, ${datosSesion.nombre}!`);
                    
                    // Si es cuenta admin, redirigir a admin.html
                    if (esAdmin) {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "index.html";
                    }
                } else {
                    alert("Credenciales incorrectas o usuario no registrado.");
                }
            }
        });
    }

    // B) Validación Registro
    const formRegistro = document.querySelector("main.auth-wrapper form");
    if (formRegistro && document.title.includes("Registro")) {
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById("nombre");
            const email = document.getElementById("email");
            const telefono = document.getElementById("telefono");
            const password = document.getElementById("contrasena");
            const confirmPassword = document.getElementById("confirmar-contrasena");
            let valido = true;

            [nombre, email, telefono, password, confirmPassword].forEach(i => i.classList.remove("is-invalid"));

            if (!nombre.value.trim()) {
                mostrarErrorPersonalizado(nombre, "El nombre y apellido son obligatorios.");
                valido = false;
            }
            if (!email.value || !email.value.endsWith("@duocuc.cl")) {
                mostrarErrorPersonalizado(email, "Debe registrarse obligatoriamente con un correo institucional (@duocuc.cl).");
                valido = false;
            }
            if (!telefono.value || telefono.value.length < 8) {
                mostrarErrorPersonalizado(telefono, "Ingrese un número de teléfono de contacto válido.");
                valido = false;
            }
            if (!password.value || password.value.length < 6) {
                mostrarErrorPersonalizado(password, "La contraseña debe contener al menos 6 caracteres.");
                valido = false;
            }
            if (password.value !== confirmPassword.value) {
                mostrarErrorPersonalizado(confirmPassword, "Las contraseñas no coinciden. Verifíquelas.");
                valido = false;
            }

            if (valido) {
                let listaUsuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
                
                const existeUsuario = listaUsuarios.some(u => u.email === email.value);
                if (existeUsuario) {
                    mostrarErrorPersonalizado(email, "Este correo institucional ya se encuentra registrado.");
                    return;
                }

                listaUsuarios.push({
                    nombre: nombre.value.trim(),
                    email: email.value.trim(),
                    password: password.value
                });

                localStorage.setItem('usuariosRegistrados', JSON.stringify(listaUsuarios));

                alert(`¡Cuenta creada con éxito, ${nombre.value}! Ya puedes iniciar sesión.`);
                window.location.href = "login.html";
            }
        });
    }

    /* ==========================================================================
       6. GRÁFICOS PARA EL PANEL DE ADMINISTRADOR
       ========================================================================== */
    const canvasAdmin = document.getElementById('graficoAdmin');
    if (canvasAdmin) {
        const ctx = canvasAdmin.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
                datasets: [{
                    label: 'Pedidos Completados',
                    data: [210, 250, 290, 340],
                    borderColor: '#ff5722',
                    backgroundColor: 'rgba(255, 87, 34, 0.08)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
});


/* ==========================================================================
   7. FUNCIONES AUXILIARES GLOBALES
   ========================================================================== */

// Renderizar métricas e inventario actualizados en admin.html
function actualizarVistaAdmin() {
    const adminEmailElem = document.getElementById('admin-user-email');
    if (!adminEmailElem) return; // Si no estamos en la página del admin, salir

    const sesionActiva = JSON.parse(localStorage.getItem('sesionActiva'));
    if (sesionActiva) {
        adminEmailElem.textContent = sesionActiva.email;
    }

    // Cargar o inicializar datos del admin
    let datosAdmin = JSON.parse(localStorage.getItem('datosAdmin')) || {
        pedidosHoy: 38,
        cilindrosEntregados: 45,
        ingresosDia: 840000,
        stockLlenos: { '5kg': 24, '11kg': 85, '15kg': 62, '45kg': 12 },
        stockVacios: { '5kg': 10, '11kg': 34, '15kg': 18, '45kg': 5 }
    };

    // Actualizar tarjetas de métricas si existen en el DOM
    const kpiCards = document.querySelectorAll('#vista-dashboard h3');
    if (kpiCards.length >= 3) {
        kpiCards[0].textContent = datosAdmin.pedidosHoy;
        kpiCards[1].textContent = datosAdmin.cilindrosEntregados;
        kpiCards[2].textContent = `$${datosAdmin.ingresosDia.toLocaleString('es-CL')}`;
    }

    // Actualizar tarjetas de inventario si existen en el DOM
    const inventarioLlenos = document.querySelector('#vista-inventario .border-success p');
    if (inventarioLlenos) {
        inventarioLlenos.innerHTML = `
            <strong class="text-dark">5kg:</strong> ${datosAdmin.stockLlenos['5kg']} | 
            <strong class="text-dark">11kg:</strong> ${datosAdmin.stockLlenos['11kg']} | 
            <strong class="text-dark">15kg:</strong> ${datosAdmin.stockLlenos['15kg']} | 
            <strong class="text-dark">45kg:</strong> ${datosAdmin.stockLlenos['45kg']}
        `;
    }

    const inventarioVacios = document.querySelector('#vista-inventario .border-secondary p');
    if (inventarioVacios) {
        inventarioVacios.innerHTML = `
            <strong class="text-dark">5kg:</strong> ${datosAdmin.stockVacios['5kg']} | 
            <strong class="text-dark">11kg:</strong> ${datosAdmin.stockVacios['11kg']} | 
            <strong class="text-dark">15kg:</strong> ${datosAdmin.stockVacios['15kg']} | 
            <strong class="text-dark">45kg:</strong> ${datosAdmin.stockVacios['45kg']}
        `;
    }

    // Configurar botón salir de la vista admin
    const btnSalirAdmin = document.getElementById('btn-salir-admin');
    if (btnSalirAdmin) {
        btnSalirAdmin.addEventListener('click', () => {
            localStorage.removeItem('sesionActiva');
            window.location.href = 'login.html';
        });
    }
}

// Actualizar controles de sesión en el Header general
function actualizarHeaderSesion() {
    const authControls = document.getElementById('auth-controls');
    if (!authControls) return;

    const sesionActiva = JSON.parse(localStorage.getItem('sesionActiva'));

    if (sesionActiva) {
        const inicial = sesionActiva.nombre.charAt(0).toUpperCase();

        authControls.innerHTML = `
            <div class="d-flex align-items-center gap-2 text-white" title="Sesión activa: ${sesionActiva.nombre}">
                <div class="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px; font-size: 0.9rem;">
                    ${inicial}
                </div>
                <span class="small d-none d-md-inline fw-semibold text-white">${sesionActiva.nombre}</span>
            </div>
            <button id="btn-cerrar-sesion" class="btn btn-outline-light btn-sm rounded-pill px-3 ms-2 fw-semibold">
                Cerrar Sesión
            </button>
        `;

        document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
            localStorage.removeItem('sesionActiva');
            alert("Has cerrado sesión correctamente.");
            window.location.reload();
        });
    } else {
        authControls.innerHTML = `
            <a href="login.html" class="nav-link text-white d-flex align-items-center gap-1 p-0" title="Iniciar Sesión">
                <i class="bi bi-person-circle fs-5"></i>
            </a>
            <a href="registro.html" class="btn btn-naranja btn-sm px-3 rounded-pill fw-semibold">
                Registrarse
            </a>
        `;
    }
}

// Sugerencias de usuarios guardados en Login
function renderizarSugerenciasLogin() {
    const emailInput = document.getElementById("email");
    if (!emailInput) return;

    let listaUsuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
    if (listaUsuarios.length === 0) return;

    let contenedorSugerencias = document.getElementById("contenedor-sugerencias-usuarios");
    if (!contenedorSugerencias) {
        contenedorSugerencias = document.createElement("div");
        contenedorSugerencias.id = "contenedor-sugerencias-usuarios";
        contenedorSugerencias.className = "mb-3 text-start p-2 border rounded bg-light";
        
        let labelSugerencia = document.createElement("small");
        labelSugerencia.className = "d-block fw-bold text-muted mb-2";
        labelSugerencia.textContent = "Cuentas registradas:";
        contenedorSugerencias.appendChild(labelSugerencia);

        emailInput.closest(".form-grupo").before(contenedorSugerencias);
    } else {
        const listadoItems = contenedorSugerencias.querySelectorAll(".usuario-item");
        listadoItems.forEach(item => item.remove());
    }

    listaUsuarios.forEach((usuario, index) => {
        const filaUser = document.createElement("div");
        filaUser.className = "usuario-item d-flex justify-content-between align-items-center mb-1 bg-white p-1 px-2 border rounded small shadow-sm";
        
        const spanInfo = document.createElement("span");
        spanInfo.style.cursor = "pointer";
        spanInfo.className = "text-truncate text-dark fw-semibold";
        spanInfo.style.maxWidth = "240px";
        spanInfo.textContent = `${usuario.nombre} (${usuario.email})`;
        spanInfo.title = "Clic para rellenar";
        
        spanInfo.addEventListener("click", () => {
            emailInput.value = usuario.email;
            document.getElementById("password").focus();
        });

        const btnBorrar = document.createElement("button");
        btnBorrar.className = "btn btn-sm btn-outline-danger py-0 px-1 ms-2";
        btnBorrar.innerHTML = '<i class="bi bi-trash"></i>';
        btnBorrar.title = "Eliminar cuenta guardada";
        
        btnBorrar.addEventListener("click", () => {
            if (confirm(`¿Deseas eliminar la cuenta de ${usuario.email}?`)) {
                listaUsuarios.splice(index, 1);
                localStorage.setItem('usuariosRegistrados', JSON.stringify(listaUsuarios));
                renderizarSugerenciasLogin();
            }
        });

        filaUser.appendChild(spanInfo);
        filaUser.appendChild(btnBorrar);
        contenedorSugerencias.appendChild(filaUser);
    });
}

function mostrarErrorPersonalizado(input, mensaje) {
    input.classList.add("is-invalid");
    let contenedorGrupo = input.closest(".form-grupo") || input.parentElement;
    
    let feedback = contenedorGrupo.querySelector(".invalid-feedback-personalizado");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback-personalizado text-danger small mt-1 fw-semibold";
        contenedorGrupo.appendChild(feedback);
    }
    feedback.textContent = mensaje;
    feedback.style.display = "block";

    input.addEventListener("input", () => {
        input.classList.remove("is-invalid");
        feedback.style.display = "none";
    }, { once: true });
}

function cambiarVista(vistaId) {
    const vistaDashboard = document.getElementById('vista-dashboard');
    const vistaInventario = document.getElementById('vista-inventario');
    
    if (!vistaDashboard || !vistaInventario) return;

    vistaDashboard.classList.add('d-none');
    vistaInventario.classList.add('d-none');
    
    document.getElementById('vista-' + vistaId).classList.remove('d-none');

    const titulo = vistaId === 'dashboard' ? 'Dashboard General' : 'Inventario de Cilindros (Llenos vs Vacíos)';
    document.getElementById('titulo-seccion').textContent = titulo;

    document.querySelectorAll('aside .list-group-item').forEach(btn => {
        btn.classList.remove('active', 'text-naranja', 'bg-light', 'fw-semibold');
        btn.classList.add('text-dark');
    });
    
    const btnActivo = document.getElementById('btn-vista-' + vistaId);
    if (btnActivo) {
        btnActivo.classList.add('active', 'text-naranja', 'bg-light', 'fw-semibold');
        btnActivo.classList.remove('text-dark');
    }
}