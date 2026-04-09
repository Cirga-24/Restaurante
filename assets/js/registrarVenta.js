import { supabase } from './supabaseConexion.js';

const checkUser = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    window.location.href = "../../index.html";
  }
};

checkUser();

document.getElementById('servicio_row').style.display = 'none';
document.getElementById('domicilio_row').style.display = 'none';
const tipoServicio = document.getElementById('tipoServicio');
const costoDomicilio = document.getElementById('costo_domicilio');
const servicio = document.getElementById('servicio');
const servicioRow = document.getElementById('servicio_row');
const domicilioRow = document.getElementById('domicilio_row');
const botonesAgregar = document.querySelectorAll('.btn_agregar')

function actualizarEstadoBotones() {
    const habilitar = tipoServicio.value !== '';
    document.querySelectorAll('.btn_agregar').forEach(btn => {
        btn.disabled = !habilitar;
    });
}

tipoServicio.addEventListener('change', function() {
    if (this.value === 'domicilio') {
        costoDomicilio.disabled = false;
        costoDomicilio.placeholder = "Ingrese el costo del domicilio..."; 
        servicioRow.style.display = 'none';
        domicilioRow.style.display = 'flex';
        actualizarTotales();
    } else if (this.value === 'compraLocal') {
        servicioRow.style.display = 'flex';
        domicilioRow.style.display = 'none';
        costoDomicilio.disabled = true;
        costoDomicilio.placeholder = "Solo se puede en domicilio";
        actualizarTotales();
    } else if (this.value === '') {
        costoDomicilio.disabled = true;
        costoDomicilio.placeholder = "Solo se puede en domicilio";
        botonesAgregar.forEach(btn => btn.disabled = true);
        actualizarTotales();
    }
    actualizarEstadoBotones();
});

costoDomicilio.addEventListener('change', function() {
    let valor = parseFloat(this.value);

    if (!valor || valor < 50) {
        this.value = 50;
    } else {
        this.value = Math.ceil(valor / 50) * 50;
    }

    actualizarTotales();
});

servicio.addEventListener('change', function() {
    let valor = parseFloat(this.value);

    if (!valor || valor < 50) {
        this.value = 50;
    } else {
        this.value = Math.ceil(valor / 50) * 50;
    }

    actualizarTotales();
});

// Almacenar carrito en memoria
let carrito = [];

// Agregar eventos a botones de agregar
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn_agregar")) {

        if (e.target.disabled) return;

        const tipo = tipoServicio.value;

        if (!tipo) {
            alert('Primero seleccione un tipo de servicio');
            return;
        }

        const id = e.target.dataset.id;
        const producto = e.target.dataset.producto;
        const precio = parseFloat(e.target.dataset.precio);

        agregarAlCarrito(id,producto, precio);
    }
});



function agregarAlCarrito(id, producto, precio) {
    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ id: id, nombre: producto, precio: precio, cantidad: 1 });
    }

    // limpiar búsqueda...
    document.getElementById('buscarProducto').value = '';
    document.getElementById('filtroCategoria').value = '';

    document.querySelectorAll('.producto_item').forEach(item => {
        item.style.display = 'flex';
    });

    actualizarCarrito();
}

function actualizarCarrito() {
    const carritoItems = document.getElementById('carritoItems');
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<div class="carrito_vacio"><p>Ningún producto agregado</p></div>';
        actualizarTotales();
        return;
    }
    
    let html = '';
    carrito.forEach((item, index) => {
        html += `
            <div class="carrito_item">
                <div class="item_info">
                    <span class="item_nombre">${item.nombre}</span>
                    <span class="item_cantidad">Cant: ${item.cantidad}</span>
                </div>
                <span class="item_subtotal">$${(item.precio * item.cantidad).toFixed(2)}</span>
                <button class="btn_eliminar" data-index="${index}">-</button>
                <button class="btn_add" data-index="${index}" 
                    data-id="${item.id}"
                    data-producto="${item.nombre}" 
                    data-precio="${item.precio}">+</button>
            </div>
        `;
    });
    
    carritoItems.innerHTML = html;
    
    document.querySelectorAll('.btn_eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            eliminarDelCarrito(index);
        });
    });

    document.querySelectorAll('.btn_add').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const producto = this.dataset.producto;
            const precio = parseFloat(this.dataset.precio);

            agregarAlCarrito(id, producto, precio);
        });
    });

    actualizarTotales();
}

function eliminarDelCarrito(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1);
    }

    actualizarCarrito();
}

function actualizarTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const costoDomicilio = parseFloat(document.getElementById('costo_domicilio').value) || 0;
    var total;
    if (tipoServicio.value === 'compraLocal') {
        total = subtotal + 3000; // Servicio a la mesa fijo
    } else if (tipoServicio.value === 'domicilio') {
        total = subtotal + costoDomicilio;
    } else {
        total = subtotal + 3000;
    };

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('total_domicilio').textContent = '$' + costoDomicilio.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
}

// Botones de acción
document.querySelector('.btn_limpiar').addEventListener('click', function() {
    carrito = [];
    actualizarCarrito();
});

document.querySelector('.btn_completar').addEventListener('click', async function() {

    if (carrito.length === 0) {
        alert('Por favor, agregue al menos un producto');
        return;
    }

    if (tipoServicio.value === '') {
        alert('Seleccione un tipo de servicio');
        return;
    }

    if (tipoServicio.value === 'domicilio' && !costoDomicilio.value) {
        alert('Ingrese costo de domicilio');
        return;
    }

    const pedido = await guardarPedido();

    if (!pedido) return;

    const detalleGuardado = await guardarDetallePedido(pedido.id_pedido);

    if (!detalleGuardado) return;

    alert('✅ Pedido completo guardado correctamente');

    carrito = [];
    actualizarCarrito();

    window.location.replace('dashboardAdmin.html');

});

// Búsqueda de productos
const filtroCategoria = document.getElementById('filtroCategoria');

filtroCategoria.addEventListener("change", () => {
    const categoriaSeleccionada = filtroCategoria.value;

    const productos = document.querySelectorAll(".producto_item");

    productos.forEach(prod => {
        if (!categoriaSeleccionada) {
            prod.style.display = "flex";
            return;
        }

        if (prod.dataset.categoria == categoriaSeleccionada) {
            prod.style.display = "flex";
        } else {
            prod.style.display = "none";
        }
    });
});

document.getElementById('buscarProducto').addEventListener('input', function(e) {
    const busqueda = e.target.value.toLowerCase();
    const categoria = filtroCategoria.value;

    document.querySelectorAll('.producto_item').forEach(item => {
        const nombre = item.querySelector('.producto_nombre').textContent.toLowerCase();
        const descripcion = item.querySelector('.producto_descripcion').textContent.toLowerCase();
        const itemCategoria = item.getAttribute('data-categoria');

        const coincideBusqueda = nombre.includes(busqueda) || descripcion.includes(busqueda);
        const coincideCategoria = !categoria || itemCategoria === categoria;

        item.style.display = (coincideBusqueda && coincideCategoria) ? 'flex' : 'none';
    });
});

//Boton Volver
try {
    const volver = document.getElementById('btn_volver');
    volver.addEventListener('click', function() {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (usuario.tipo_usuario) {
            window.location.replace('/assets/pages/homeAdmin.html');
        } else {
            window.location.replace('/assets/pages/homeWorker.html');
        }
    }); 
} catch (error) {
    console.error('No hay botón de volver disponible:');
}


//Cargar categorias
const cargarCategorias = async () => {
    const { data, error } = await supabase
        .from("categoria")
        .select("id_categoria, nombre");

    if (error) {
        console.error("Error cargando categorías:", error);
        return;
    }

    data.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id_categoria; // 👈 usamos el id
        option.textContent = cat.nombre;
        filtroCategoria.appendChild(option);
    });
};

// Cargar productos
const productosList = document.getElementById("productosList");

const cargarProductos = async () => {
    const { data, error } = await supabase
        .from("producto")
        .select(`
            id_producto,
            nombre,
            precio,
            id_categoria,
            activo,
            categoria (
                id_categoria,
                nombre
            )
        `)
        .eq("activo", true); // 👈 solo productos activos

    if (error) {
        console.error("Error cargando productos:", error);
        return;
    }

    productosList.innerHTML = "";

    data.forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("producto_item");

        // 👇 guardamos el ID de la categoría (MEJOR que nombre)
        div.dataset.categoria = prod.id_categoria;

        div.innerHTML = `
            <div class="producto_info">
                <span class="producto_nombre">${prod.nombre}</span>
                <span class="producto_descripcion">Categoría: ${prod.categoria?.nombre || "Sin categoría"}</span>
            </div>
            <span class="producto_precio">$${prod.precio}</span>
            <button class="btn_agregar" 
                data-id="${prod.id_producto}"
                data-producto="${prod.nombre}" 
                data-precio="${prod.precio}"
                disabled>
                +
            </button>
        `;

        productosList.appendChild(div);
    });
};

const guardarPedido = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const tipo = tipoServicio.value;
    let tipoEnviar = '';
    const costoDom = parseFloat(document.getElementById('costo_domicilio').value) || 0;

    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const fecha = localStorage.dateActual;
    let total = 0;
    let servicioMesa = 0;

    if (tipo === 'compraLocal') {
        tipoEnviar = 'local';
        servicioMesa = 3000;
        total = subtotal + servicioMesa;
    } else if (tipo === 'domicilio') {
        tipoEnviar = 'domicilio';
        total = subtotal + costoDom;
    }

    const { data, error } = await supabase
        .from("pedido")
        .insert([
            {
                fecha: fecha,
                tipo: tipoEnviar,
                costo_domicilio: tipo === 'domicilio' ? costoDom : null,
                total: total,
                servicio_mesa: tipo === 'compraLocal' ? servicioMesa : null,
                id_usuario: usuario.id_usuario,
                estado: true,
                id_mesa: null
            }
        ])
        .select();

    if (error) {
        console.error("Error guardando pedido:", error);
        alert("Error al guardar el pedido");
        return null;
    }

    return data[0];
};

const guardarDetallePedido = async (idPedido) => {

    const detalles = carrito.map(item => ({
        id_pedido: idPedido,
        id_producto: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.precio * item.cantidad
    }));

    const { error } = await supabase
        .from("detalle_pedido")
        .insert(detalles);

    if (error) {
        console.error("Error guardando detalle:", error);
        alert("Error guardando productos del pedido");
        return false;
    }

    return true;
};

cargarCategorias();
cargarProductos();
actualizarEstadoBotones();