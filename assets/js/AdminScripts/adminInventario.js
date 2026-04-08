import {supabase} from '../supabaseConexion.js';

const usuario = localStorage.getItem("usuario");
    if (!usuario) {
        window.location.href = "../../index.html";
    }

const tabs = document.querySelectorAll('.tab_btn');
const contents = document.querySelectorAll('.tab_content');
let productosData = [];
let inventarioData = [];

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

const cargarProductos = async () => {
    const { data, error } = await supabase
        .from('producto')
        .select(`
            id_producto,
            nombre,
            precio,
            activo,
            categoria (
                nombre
            )
        `);

    if (error) {
        console.error(error);
        return;
    }

    productosData = data;
    renderProductos(data);
};

const cargarInventario = async () => {
    const { data, error } = await supabase
        .from('ingrediente')
        .select('*');

    if (error) {
        console.error(error);
        return;
    }

    inventarioData = data; // 👈 guardar datos
    renderInventario(data);
};

cargarProductos();
cargarInventario();

const renderProductos = (data) => {
    const tabla = document.getElementById('tabla_productos');
    tabla.innerHTML = '';

    data.forEach(p => {
        tabla.innerHTML += `
        <tr>
            <td>${p.id_producto}</td>
            <td>${p.nombre}</td>
            <td>${p.precio}</td>
            <td>${p.categoria?.nombre || 'Sin categoría'}</td>
            <td>${p.activo ? 'Sí' : 'No'}</td>
            <td class="opciones">
                <button class="btn_editar" onclick="abrirEditarProducto(${p.id_producto}, '${p.nombre}', ${p.precio}, ${p.id_categoria}, ${p.activo})">Editar</button>
                <button class="btn_eliminar" onclick="eliminarProducto(${p.id_producto})">Eliminar</button>
            </td>
        </tr>`;
    });
};

const renderInventario = (data) => {
    const tabla = document.getElementById('tabla_inventario');
    tabla.innerHTML = '';

    data.forEach(i => {
        tabla.innerHTML += `
        <tr>
            <td>${i.id_ingrediente}</td>
            <td>${i.nombre}</td>
            <td>${i.unidad_medida}</td>
            <td>${i.stock_actual}</td>
            <td>${i.stock_minimo}</td>
            <td class="opciones">
                <button class="btn_editar" onclick="abrirEditarIngrediente(${i.id_ingrediente}, '${i.unidad_medida}', ${i.stock_actual}, ${i.stock_minimo})">Editar</button>
                <button class="btn_eliminar" onclick="eliminarIngrediente(${i.id_ingrediente})">Eliminar</button>
            </td>
        </tr>`;
    });
};

document.getElementById('buscador_general')
.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    const tabActiva = obtenerTabActiva();

    if (tabActiva === 'productos') {
        const filtrados = productosData.filter(p =>
            p.nombre.toLowerCase().includes(texto) ||
            p.id_categoria.toString().includes(texto)
        );
        renderProductos(filtrados);
    }

    if (tabActiva === 'inventario') {
        const filtrados = inventarioData.filter(i =>
            i.nombre.toLowerCase().includes(texto) ||
            i.unidad_medida.toLowerCase().includes(texto)
        );
        renderInventario(filtrados);
    }
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');

        // 🔥 limpiar buscador
        const buscador = document.getElementById('buscador_general');
        buscador.value = '';

        // 🔥 restaurar datos
        if (tab.dataset.tab === 'productos') {
            renderProductos(productosData);
        } else {
            renderInventario(inventarioData);
        }
    });
});


const obtenerTabActiva = () => {
    return document.querySelector('.tab_btn.active').dataset.tab;
};

let categoriasData = [];

const cargarCategorias = async () => {
    const { data, error } = await supabase
        .from('categoria')
        .select('*');

    if (error) return console.error(error);

    categoriasData = data;

    const select = document.getElementById('edit_categoria');
    select.innerHTML = '';

    data.forEach(c => {
        select.innerHTML += `
            <option value="${c.id_categoria}">${c.nombre}</option>
        `;
    });
};

window.abrirEditarProducto = async (id, nombre, precio, categoriaId, activo) => {
    
    await cargarCategorias();

    document.getElementById('edit_id_producto').value = id;
    document.getElementById('edit_nombre').value = nombre;
    document.getElementById('edit_precio').value = precio;
    document.getElementById('edit_categoria').value = categoriaId || '';
    document.getElementById('edit_activo').checked = activo;

    document.getElementById('modalEditarProducto').style.display = 'flex';
};

window.guardarProducto = async () => {
    const id = document.getElementById('edit_id_producto').value;

    const { error } = await supabase
        .from('producto')
        .update({
            nombre: document.getElementById('edit_nombre').value,
            precio: document.getElementById('edit_precio').value,
            id_categoria: document.getElementById('edit_categoria').value,
            activo: document.getElementById('edit_activo').checked
        })
        .eq('id_producto', id);

    if (error) {
        console.error(error);
        return;
    }

    cerrarModal('modalEditarProducto');
    cargarProductos();
};

window.cerrarModal = (id) => {
    document.getElementById(id).style.display = 'none';
};

window.eliminarProducto = async (id) => {
    const confirmar = confirm("¿Seguro que quieres eliminar este producto?");
    if (!confirmar) return;

    const { error } = await supabase
        .from('producto')
        .delete()
        .eq('id_producto', id);

    if (error) {
        console.error(error);
        alert("Error al eliminar");
        return;
    }

    cargarProductos();
};

window.abrirCrearProducto = async () => {
    await cargarCategorias(); // reutilizamos

    // llenar select del crear
    const select = document.getElementById('crear_categoria');
    select.innerHTML = '';

    categoriasData.forEach(c => {
        select.innerHTML += `
            <option value="${c.id_categoria}">${c.nombre}</option>
        `;
    });

    // limpiar inputs
    document.getElementById('crear_nombre').value = '';
    document.getElementById('crear_precio').value = '';
    document.getElementById('crear_activo').checked = true;

    document.getElementById('modalCrearProducto').style.display = 'flex';
};

window.crearProducto = async () => {
    const nombre = document.getElementById('crear_nombre').value;
    const precio = document.getElementById('crear_precio').value;
    const categoria = document.getElementById('crear_categoria').value;
    const activo = document.getElementById('crear_activo').checked;

    if (!nombre || !precio) {
        alert("Completa los campos");
        return;
    }

    const { error } = await supabase
        .from('producto')
        .insert([{
            nombre: nombre,
            precio: precio,
            id_categoria: categoria,
            activo: activo
        }]);

    if (error) {
        console.error(error);
        alert("Error al crear producto");
        return;
    }

    cerrarModal('modalCrearProducto');
    cargarProductos();
};