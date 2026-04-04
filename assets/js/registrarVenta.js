const checkUser = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || !usuario.tipo_usuario) {
    window.location.href = "../../index.html";
  }
};

checkUser();


const tipoServicio = document.getElementById('tipoServicio');
const costoDomicilio = document.getElementById('costo_domicilio');
const servicio = document.getElementById('servicio');
const botonesAgregar = document.querySelectorAll('.btn_agregar');
botonesAgregar.forEach(btn => btn.disabled = true);

tipoServicio.addEventListener('change', function() {
    if (this.value === 'domicilio') {
        costoDomicilio.disabled = false;
        costoDomicilio.placeholder = "Ingrese el costo del domicilio..."; 
        document.getElementById('servicio_row').style.display = 'none';
        document.getElementById('domicilio_row').style.display = 'flex';
        actualizarTotales();
    } else if (this.value === 'compraLocal') {
        document.getElementById('servicio_row').style.display = 'flex';
        document.getElementById('domicilio_row').style.display = 'none';
        costoDomicilio.disabled = true;
        costoDomicilio.placeholder = "Solo se puede en domicilio";
        actualizarTotales();
    }

    const habilitar = this.value !== '';
        botonesAgregar.forEach(btn => {
        btn.disabled = !habilitar;
    });
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

// Mostrar fecha actual
const fechaActual = new Date();
const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('fechaActual').textContent = fechaActual.toLocaleDateString('es-ES', opciones);

// Almacenar carrito en memoria
let carrito = [];

// Agregar eventos a botones de agregar
botonesAgregar.forEach(button => {
    button.addEventListener('click', function() {
        const tipo = tipoServicio.value;

        if (!tipo) {
            alert('Primero seleccione un tipo de servicio');
            return;
        }

        const producto = this.dataset.producto;
        const precio = parseFloat(this.dataset.precio);
        agregarAlCarrito(producto, precio);
    });
});



function agregarAlCarrito(producto, precio) {
    const itemExistente = carrito.find(item => item.nombre === producto);
    
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ nombre: producto, precio: precio, cantidad: 1 });
    }

    //LIMPIAR BÚSQUEDA
    document.getElementById('buscarProducto').value = '';

    //LIMPIAR CATEGORÍA
    document.getElementById('filtroCategoria').value = '';

    //MOSTRAR TODOS LOS PRODUCTOS
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
                <button class="btn_eliminar" data-index="${index}">x</button>
                <button class="btn_add" data-index="${index}" 
                    data-producto="${item.nombre}" data-precio="${item.precio}">+</button>
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
            const producto = this.dataset.producto;
            const precio = parseFloat(this.dataset.precio);
            agregarAlCarrito(producto, precio);
        });
    });

    actualizarTotales();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
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

document.querySelector('.btn_completar').addEventListener('click', function() {
    if (carrito.length === 0) {
        alert('Por favor, agregue al menos un producto');
        return;
    } else if (document.getElementById('tipoServicio').value === '') {
        alert('Por favor, seleccione un tipo de servicio');
        return;
    } else if (document.getElementById('tipoServicio').value === 'domicilio' && document.getElementById('costo_domicilio').value === '') {
        alert('Por favor, ingrese el costo de domicilio');
        return;
    }
    alert('Venta completada. Total: ' + document.getElementById('total').textContent);
});

// Búsqueda de productos

const filtroCategoria = document.getElementById('filtroCategoria');

const categorias = ['hamburguesas', 'pizzas', 'ensaladas', 'pastas', 'bebidas', 'postres'];

categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    filtroCategoria.appendChild(option);
});

filtroCategoria.addEventListener('change', function() {
    const categoria = this.value;

    document.querySelectorAll('.producto_item').forEach(item => {
        const itemCategoria = item.getAttribute('data-categoria');

        if (!categoria || itemCategoria === categoria) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
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