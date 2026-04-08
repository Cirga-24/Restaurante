import { supabase } from '../supabaseConexion.js';

const checkUser = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        window.location.href = "../../index.html";
    }
};

checkUser();



const numMesa = document.getElementById("mesas");
function actualizarEstadoBotones() {
    const habilitar = numMesa.value !== '';
    document.querySelectorAll('.btn_agregar').forEach(btn => {
        btn.disabled = !habilitar;
    });
}
// Crear 10 mesas más
for (let i = 1; i <= 10; i++) {
    const option = document.createElement("option");
    option.value = "mesa" + i;
    option.textContent = "Mesa " + i;
    
    numMesa.appendChild(option);
}

const costoDomicilio = document.getElementById('costo_domicilio');
const botonesAgregar = document.querySelectorAll('.btn_agregar');
botonesAgregar.forEach(btn => btn.disabled = true);

numMesa.addEventListener('change', function() {
    if (this.value === '') {
    }

    actualizarEstadoBotones();
});

// Almacenar carrito en memoria
let carrito = [];

// Agregar eventos a botones de agregar
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn_agregar")) {

        const mesa = numMesa.value;

        if (!mesa) {
            alert('Primero seleccione una mesa');
            return;
        }

        const producto = e.target.dataset.producto;
        const precio = parseFloat(e.target.dataset.precio);

        agregarAlCarrito(producto, precio);
    }
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
}

function eliminarDelCarrito(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1);
    }

    actualizarCarrito();
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
    }
    
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (confirm('¿Quiere enviar el pedido?')) {
        alert("Pedido registrado con éxito");
        if (usuario.tipo_usuario) {
            window.location.replace('/assets/pages/homeAdmin.html');
        } else {
            window.location.replace('/assets/pages/homeWorker.html');
        }
    }
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
                data-producto="${prod.nombre}" 
                data-precio="${prod.precio}"
                disabled>
                +
            </button>
        `;

        productosList.appendChild(div);
    });
};

cargarCategorias();
cargarProductos();
actualizarEstadoBotones();