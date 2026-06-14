// Configuración global de la fuente para que combine con tu CSS
Chart.defaults.font.family = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
Chart.defaults.color = '#666';



// ==========================================
// 2. GRÁFICO DE LÍNEAS (Visitas vs Clics)
// ==========================================
const ctxLineas = document.getElementById('graficaLineas').getContext('2d');
new Chart(ctxLineas, {
    type: 'line',
    data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Visitas a la tienda',
                data: [300, 450, 400, 550, 500, 700],
                borderColor: '#4bc0c0',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                fill: true,
                tension: 0.4 // Hace las líneas curvas
            },
            {
                label: 'Clics en "Comprar"',
                data: [150, 200, 180, 300, 250, 350],
                borderColor: '#e74c3c', // Color rojo contraste
                borderDash: [5, 5], // Línea punteada
                tension: 0.4
            }
        ]
    },
    options: { responsive: true }
});

// ==========================================
// 3. GRÁFICO DE DONA (Productos)
// ==========================================
const ctxDona = document.getElementById('graficaDona').getContext('2d');
new Chart(ctxDona, {
    type: 'doughnut',
    data: {
        labels: ['Abarrotes', 'Limpieza', 'Bebidas/Snacks'],
        datasets: [{
            data: [60, 25, 15],
            backgroundColor: [
                '#4bc0c0', // Verde
                '#f1c40f', // Amarillo
                '#e74c3c'  // Rojo
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        cutout: '70%', // Qué tan delgada es la dona
        plugins: { legend: { position: 'bottom' } }
    }

});
// ==========================================
// 4. LÓGICA PARA AGREGAR NUEVOS PRODUCTOS
// ==========================================
   document.getElementById('formNuevoProducto').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nuevoNombre').value;
    const precio = parseFloat(document.getElementById('nuevoPrecio').value);
    // Capturamos los nuevos campos
    const categoria = document.getElementById('nuevaCategoria').value;
    const imagen = document.getElementById('nuevaImagen').value;

    let bdActual = JSON.parse(localStorage.getItem('productosMenoss')) || [];

    const nuevoId = bdActual.length > 0 ? bdActual[bdActual.length - 1].id + 1 : 1;
    // Agregamos categoría e imagen al objeto
    const nuevoProducto = { id: nuevoId, nombre: nombre, precio: precio, categoria: categoria, imagen: imagen };

    bdActual.push(nuevoProducto);
    localStorage.setItem('productosMenoss', JSON.stringify(bdActual));

    alert(`¡Éxito! El producto "${nombre}" ha sido agregado.`);
    this.reset();
    cargarInventarioAdmin(); 
    actualizarMetricasNumericas();
});

// ==========================================
// 5. CARGAR HISTORIAL DE VENTAS
// ==========================================
function cargarHistorialVentas() {
    const tabla = document.getElementById('tablaVentas');
    let historialVentas = JSON.parse(localStorage.getItem('ventasMenoss')) || [];

    tabla.innerHTML = ''; 

    if (historialVentas.length === 0) {
        tabla.innerHTML = '<tr><td colspan="3" style="padding: 15px; text-align: center; color: #999;">Aún no hay ventas registradas.</td></tr>';
        return;
    }

    historialVentas.forEach(venta => {
        tabla.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; color: #666; font-size: 0.9rem;">${venta.fecha}</td>
                <td style="padding: 10px; font-size: 0.9rem;">${venta.articulos}</td>
                <td style="padding: 10px; font-weight: bold; color: var(--color-barra-top);">S/ ${venta.total.toFixed(2)}</td>
            </tr>
        `;
    });
}

// ¡Esta línea es crucial! Es la que da la orden de arrancar la función.
// Asegúrate de que esté suelta al final de todo el archivo.
cargarHistorialVentas();

// ==========================================
// 6. GESTIÓN DEL INVENTARIO (LEER Y ELIMINAR)
// ==========================================

function cargarInventarioAdmin() {
    const tabla = document.getElementById('tablaInventario');
    let bdActual = JSON.parse(localStorage.getItem('productosMenoss')) || [];
    
    tabla.innerHTML = '';

    if (bdActual.length === 0) {
        tabla.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px;">No hay productos en el catálogo.</td></tr>';
        return;
    }

    bdActual.forEach(producto => {
        tabla.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">#${producto.id}</td>
                <td style="padding: 10px; font-weight: bold;">${producto.nombre}</td>
                <td style="padding: 10px; color: var(--color-barra-top);">S/ ${producto.precio.toFixed(2)}</td>
               <td style="padding: 12px 5px; text-align: center;">
                    <div style="display: flex; gap: 5px; justify-content: center;">
                        <button onclick="editarProducto(${producto.id})" style="background: #f1c40f; color: #333; border: none; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; display: inline-flex; align-items: center; justify-content: center;" title="Editar">✏️</button>
                        <button onclick="eliminarProducto(${producto.id})" style="background: #e74c3c; color: white; border: none; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; display: inline-flex; align-items: center; justify-content: center;" title="Eliminar">X</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function eliminarProducto(idProducto) {
    // Alerta de confirmación de seguridad
    if(confirm("¿Estás seguro de que deseas eliminar este producto del catálogo?")) {
        let bdActual = JSON.parse(localStorage.getItem('productosMenoss')) || [];
        
        // Filtramos la base de datos: nos quedamos con todos EXCEPTO el que tiene el ID que queremos borrar
        bdActual = bdActual.filter(producto => producto.id !== idProducto);
        
        // Guardamos la nueva lista en la memoria
        localStorage.setItem('productosMenoss', JSON.stringify(bdActual));
        
        // Recargamos la tablita para que desaparezca visualmente
        cargarInventarioAdmin();
        alert("Producto eliminado exitosamente.");
    }
}

// Ejecutamos la función al cargar la página
cargarInventarioAdmin();


// ==========================================
// 7. ACTUALIZAR MÉTRICAS REALES EN TIEMPO REAL
// ==========================================
function actualizarMetricasNumericas() {
    // 1. Contar los productos del catálogo
    let bdProductos = JSON.parse(localStorage.getItem('productosMenoss')) || [];
    document.getElementById('widgetTotalProductos').innerText = bdProductos.length;

    // 2. Sumar todos los ingresos de las ventas
    let bdVentas = JSON.parse(localStorage.getItem('ventasMenoss')) || [];
    let sumaIngresos = 0;
    
    bdVentas.forEach(venta => {
        sumaIngresos += venta.total; // Suma el total de cada ticket
    });
    
    // Inyecta el resultado formateado con 2 decimales
    document.getElementById('widgetIngresos').innerText = `S/ ${sumaIngresos.toFixed(2)}`;
}

// Ejecutamos la función al cargar la página
actualizarMetricasNumericas();



// ==========================================
// 8. GRÁFICO DE BARRAS DINÁMICO (VENTAS)
// ==========================================
function cargarGraficoVentas() {
    let ventasPorMes = [2500, 3200, 2800, 4500, 5200, 0, 0, 0, 0, 0, 0, 0];
    let historialVentas = JSON.parse(localStorage.getItem('ventasMenoss')) || [];

    historialVentas.forEach(venta => {
        // Validación de seguridad por si alguna venta antigua no tiene fecha
        if (venta && venta.fecha) {
            let fechaParte = venta.fecha.split(',')[0]; 
            let partes = fechaParte.split('/'); 

            if (partes.length === 3) {
                let mesVenta = parseInt(partes[1]) - 1; 
                
                // EL BLINDAJE: Convertimos cualquier cosa a texto, limpiamos letras/símbolos y lo pasamos a decimal
                let totalLimpio = String(venta.total).replace(/[^0-9.-]+/g, "");
                let totalNumerico = parseFloat(totalLimpio);

                // Sumamos si es un mes válido y un número válido
                if (!isNaN(totalNumerico) && mesVenta >= 0 && mesVenta <= 11) {
                    ventasPorMes[mesVenta] += totalNumerico;
                }
            }
        }
    });

    const canvas = document.getElementById('ventasChart');
    if (!canvas) return; // Si no encuentra el canvas, detiene la función para no crashear

    const ctx = canvas.getContext('2d');

    if (window.miGraficoVentas) {
        window.miGraficoVentas.destroy();
    }

    window.miGraficoVentas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Ingresos Mensuales (S/)',
                data: ventasPorMes,
                backgroundColor: '#4ac1b6', 
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
        }
    });
}

// Ejecutamos la función
cargarGraficoVentas();


// ==========================================
// 9. FUNCIONES DEL MODAL DE INVENTARIO
// ==========================================
function abrirModalInventario() {
    const modal = document.getElementById('modalInventario');
    if (modal) {
        modal.style.display = 'block';
        // Si tienes tu función de cargar la tabla, la llamamos aquí:
        if (typeof cargarInventarioAdmin === 'function') {
            cargarInventarioAdmin(); 
        }
    }
}

function cerrarModalInventario() {
    const modal = document.getElementById('modalInventario');
    if (modal) {
        modal.style.display = 'none';
    }
}

function cerrarModalFueraInventario(event) {
    if (event.target.id === 'modalInventario') {
        cerrarModalInventario();
    }
}


// ==========================================
// 10. FUNCIÓN PARA EDITAR (UPDATE DEL CRUD)
// ==========================================
function editarProducto(id) {
    // 1. Traemos la base de datos actual
    let bdActual = JSON.parse(localStorage.getItem('productosMenoss')) || [];
    
    // 2. Buscamos el producto exacto que queremos editar
    let index = bdActual.findIndex(producto => producto.id === id);

    if (index !== -1) {
        // 3. Pedimos el nuevo nombre (mostrando el antiguo por defecto)
        let nuevoNombre = prompt("✏️ Editar nombre del producto:", bdActual[index].nombre);
        
        // Si presiona "Cancelar", detenemos la función
        if (nuevoNombre === null) return; 

        // 4. Pedimos el nuevo precio (mostrando el antiguo por defecto)
        let nuevoPrecioStr = prompt("💰 Editar precio (Usa punto para decimales):", bdActual[index].precio);
        
        if (nuevoPrecioStr === null) return; 

        let nuevoPrecio = parseFloat(nuevoPrecioStr);

        // 5. Validamos que no nos dejen campos vacíos o textos en el precio
        if (nuevoNombre.trim() === "" || isNaN(nuevoPrecio) || nuevoPrecio < 0) {
            alert("❌ Datos inválidos. El nombre no puede estar vacío y el precio debe ser un número válido.");
            return;
        }

        // 6. ¡Actualizamos los datos en la memoria!
        bdActual[index].nombre = nuevoNombre.trim();
        bdActual[index].precio = nuevoPrecio;

        // 7. Guardamos en el LocalStorage y recargamos la tabla visual
        localStorage.setItem('productosMenoss', JSON.stringify(bdActual));
        cargarInventarioAdmin(); 
        
        // Actualizamos el widget de "Total de Productos" por si acaso
        actualizarTotalProductosWidget();
    }
}

// ==========================================
// 11. LIMPIAR HISTORIAL DE VENTAS
// ==========================================
function limpiarHistorialVentas() {
    // 1. Preguntamos al usuario para evitar borrados por accidente
    let confirmacion = confirm("⚠️ ¿Estás seguro de que quieres borrar todo el historial de ventas? Esto no se puede deshacer.");
    
    if (confirmacion) {
        // 2. Borramos los datos del almacenamiento local
        localStorage.removeItem('ventasMenoss');
        
        // 3. Recargamos la página para que la tabla, la gráfica y los totales vuelvan a cero automáticamente
        window.location.reload();
    }
}