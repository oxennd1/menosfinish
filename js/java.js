// --- 1. VARIABLES DE ESTADO Y BASE DE DATOS ---
let usuarioLogeado = false; // Interruptor de sesión
let carrito = []; // Arreglo del carrito

let productosDB = JSON.parse(localStorage.getItem('productosMenoss'));
if (!productosDB) {
    productosDB = [
        { id: 1, nombre: "Arroz Costeño 1kg", precio: 3.80, categoria: "abarrotes", imagen: "img/abarrotes.jpg" },
        { id: 2, nombre: "Aceite Primor 1L", precio: 8.50, categoria: "abarrotes", imagen: "img/abarrotes.jpg" },
        { id: 3, nombre: "Leche Gloria Evaporada", precio: 3.20, categoria: "lacteos", imagen: "img/leche.jpg" },
        { id: 4, nombre: "Galletas Soda Field", precio: 1.50, categoria: "bebidas", imagen: "img/snacks.jpg" }
    ];
    localStorage.setItem('productosMenoss', JSON.stringify(productosDB));
}


// --- 2. SISTEMA DE LOGIN Y CUENTAS ---
function verificarLoginParaCarrito() {
    if (usuarioLogeado) {
        abrirModal('modalCarrito');
    } else {
        alert("Debes iniciar sesión o registrarte para ver tu carrito y comprar.");
        abrirModal('modalLogin');
    }
}

function cambiarARegistro() {
    const titulo = document.getElementById('tituloLogin');
    const btnSubmit = document.getElementById('btnSubmitUsuario');
    
    if (titulo.innerText === "Iniciar Sesión") {
        titulo.innerText = "Crear Cuenta Nueva";
        btnSubmit.innerText = "Registrarse";
    } else {
        titulo.innerText = "Iniciar Sesión";
        btnSubmit.innerText = "Ingresar";
    }
}

function manejarFormulario(event) {
    event.preventDefault(); // Evita recargar la página

    const btnSubmit = document.getElementById('btnSubmitUsuario');
    const usuarioIngresado = document.getElementById('inputUsuario').value;
    const passwordIngresada = document.getElementById('inputPassword').value;
    
    if (btnSubmit.innerText === "Registrarse") {
        alert("¡Cuenta creada con éxito! Bienvenido a Menoss.");
        usuarioLogeado = true;
        cerrarModal('modalLogin');
    } else {
        // --- LÓGICA DE ADMIN LOCAL ---
        if (usuarioIngresado === "admin" && passwordIngresada === "1234") {
            alert("Bienvenido Administrador.");
            usuarioLogeado = true;
            cerrarModal('modalLogin');
            // Abre el dashboard en una pestaña/ventana nueva
            window.open('dashboard.html', '_blank'); 
        } 
        // --- LÓGICA DE CLIENTE NORMAL ---
        else {
            alert("¡Sesión iniciada correctamente como cliente!");
            usuarioLogeado = true;
            cerrarModal('modalLogin');
        }
    }
    
    document.getElementById('formUsuario').reset();
}

// --- 3. LÓGICA DE PRODUCTOS Y CARRITO ---
// Agregamos un parámetro que por defecto será 'todas'
function cargarProductos(categoriaFiltro = 'todas') {
    const contenedor = document.getElementById('contenedorLista');
    contenedor.className = 'grid-catalogo';
    contenedor.innerHTML = ""; 
    
    let bdActual = JSON.parse(localStorage.getItem('productosMenoss')) || [];

    // --- NUEVO: LÓGICA DE FILTRADO ---
    // Si el filtro no es 'todas', recortamos la lista para dejar solo los de esa categoría
    if (categoriaFiltro !== 'todas') {
        bdActual = bdActual.filter(producto => producto.categoria === categoriaFiltro);
    }
    // ---------------------------------

    if (bdActual.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; width: 100%; color: #999; padding: 2rem;">No hay productos en esta categoría en este momento.</p>';
        return;
    }

    bdActual.forEach(producto => {
        contenedor.innerHTML += `
            <article class="tarjeta-miniso">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="tarjeta-miniso-img" onerror="this.src='img/menos.png'">
                <div class="tarjeta-miniso-info">
                    <span style="font-size: 0.8rem; color: #999; text-transform: uppercase; margin-bottom: 5px;">${producto.categoria}</span>
                    <h4 class="tarjeta-miniso-titulo">${producto.nombre}</h4>
                    <div class="tarjeta-miniso-precio">S/ ${producto.precio.toFixed(2)}</div>
                    <button class="btn-agregar-miniso" onclick="agregarAlCarrito(${producto.id})">
                        🛒 ¡Llévatelo ahora!
                    </button>
                </div>
            </article>
        `;
    });
}








function agregarAlCarrito(idProducto) {
    // 1. Leemos el catálogo directamente del localStorage
    let bdActual = JSON.parse(localStorage.getItem('productosMenoss')) || [];
    
    // 2. Buscamos el producto exacto
    const producto = bdActual.find(p => p.id === idProducto);
    
    // 3. Verificamos si ya está en la bolsa
    const itemEnCarrito = carrito.find(item => item.id === idProducto);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    // 4. Actualizamos el HTML del carrito
    actualizarCarritoVisual();
    
    // 5. Abrimos la barra lateral automáticamente
    abrirModal('modalCarrito');
}

// --- NUEVA FUNCIÓN PARA ACTIVAR EL FILTRO ---
function filtrarCategoria(categoria) {
    cargarProductos(categoria); // Recargamos las tarjetas pero con el filtro aplicado
    
    // Hacemos que la pantalla baje suavemente hasta la sección de los productos
    document.getElementById('lista-compras').scrollIntoView({ behavior: 'smooth' });
}

// Función para restablecer el filtro y mostrar todos los productos
function restablecerCatalogo() {
    cargarProductos(); 
    
    const seccionProductos = document.getElementById('lista-compras');
    if (seccionProductos) {
        seccionProductos.scrollIntoView({ behavior: 'smooth' });
    }
}

function actualizarCarritoVisual() {
    const contenedor = document.getElementById('itemsCarrito');
    const totalPrecio = document.getElementById('totalPrecio');
    
    if (carrito.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #999; margin-top: 2rem;">Tu bolsa está vacía.</p>';
        totalPrecio.innerText = "0.00";
        return;
    }

    contenedor.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        // Inyectamos el diseño tipo Miniso (Con Foto y Basurero)
        contenedor.innerHTML += `
            <div style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #f5f5f5; padding-bottom: 15px;">
                <img src="${item.imagen}" alt="${item.nombre}" style="width: 70px; height: 70px; object-fit: contain; border-radius: 5px;" onerror="this.src='img/menos.png'">
                
                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h5 style="font-size: 0.9rem; color: #333; margin: 0; line-height: 1.3; max-width: 80%;">${item.nombre}</h5>
                        <button onclick="modificarCantidad(${item.id}, -${item.cantidad})" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #bbb;" title="Eliminar">🗑️</button>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px;">
                        <span style="font-weight: bold; color: var(--color-texto);">S/ ${item.precio.toFixed(2)}</span>
                        
                        <div style="display: flex; align-items: center; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden;">
                            <button onclick="modificarCantidad(${item.id}, -1)" style="background: #f9f9f9; border: none; padding: 4px 10px; cursor: pointer; color: #333;">-</button>
                            <span style="padding: 0 10px; font-size: 0.9rem;">${item.cantidad}</span>
                            <button onclick="modificarCantidad(${item.id}, 1)" style="background: #f9f9f9; border: none; padding: 4px 10px; cursor: pointer; color: #333;">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    totalPrecio.innerText = total.toFixed(2);
}

function modificarCantidad(idProducto, cambio) {
    const index = carrito.findIndex(item => item.id === idProducto);
    if (index !== -1) {
        carrito[index].cantidad += cambio;
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1); 
        }
        actualizarCarritoVisual();
    }
}



function procesarCompra() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. ¡Agrega algunos productos primero!");
        return;
    }

    // Obtenemos el total a pagar
    const totalPagado = parseFloat(document.getElementById('totalPrecio').innerText);

    // --- NUEVA LÓGICA DE REGISTRO DE VENTAS ---
    // Creamos un "ticket" con la fecha, lo que compró y el total
    const nuevaVenta = {
        fecha: new Date().toLocaleString('es-PE'), // Toma la fecha y hora de la PC
        total: totalPagado,
        articulos: carrito.map(item => `${item.cantidad}x ${item.nombre}`).join(' | ')
    };

    // Traemos el historial de ventas del localStorage (o creamos uno vacío)
    let historialVentas = JSON.parse(localStorage.getItem('ventasMenoss')) || [];
    
    // Usamos unshift() en lugar de push() para que la venta más nueva salga arriba
    historialVentas.unshift(nuevaVenta); 
    
    // Guardamos el historial actualizado
    localStorage.setItem('ventasMenoss', JSON.stringify(historialVentas));
    // ------------------------------------------

    alert(`¡Compra realizada con éxito!\nTotal pagado: S/ ${totalPagado.toFixed(2)}\nGracias por comprar en Menoss.`);
    
    carrito = []; // Vaciar carrito
    actualizarCarritoVisual();
    cerrarModal('modalCarrito');
}

// --- 4. FUNCIONES AUXILIARES DE INTERFAZ ---
function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }

// --- 5. INICIALIZACIÓN ---
cargarProductos();

// --- NUEVO: FUNCIÓN PARA CERRAR AL HACER CLIC EN EL FONDO OSCURO ---
function cerrarModalFuera(event, idModal) {
    // Si el elemento exacto que clickeaste tiene el ID del fondo oscuro, lo cierra
    if (event.target.id === idModal) {
        cerrarModal(idModal);
    }
}


// ==========================================
// PANEL DE HISTORIA (Lado Derecho)
// ==========================================
function abrirModalHistoria() {
    document.getElementById('modalHistoria').style.display = 'block';
}

function cerrarModalHistoria() {
    document.getElementById('modalHistoria').style.display = 'none';
}

function cerrarModalFueraHistoria(event) {
    if (event.target.id === 'modalHistoria') {
        cerrarModalHistoria();
    }
}