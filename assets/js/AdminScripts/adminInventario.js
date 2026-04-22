import {supabase} from '../supabaseConexion.js';

const usuario = localStorage.getItem("usuario");
    if (!usuario) {
        window.location.href = "../../index.html";
    }

const tabs = document.querySelectorAll('.tab_btn');
const contents = document.querySelectorAll('.tab_content');
let productosData = [];
let inventarioData = [];
let productoOriginal = {};
let ingredienteOriginal = {};

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
                id_categoria,
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

    inventarioData = data;
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
                <button class="btn_editar" onclick="abrirEditarProducto(${p.id_producto}, \`${p.nombre}\`, ${p.precio}, ${p.categoria?.id_categoria}, ${p.activo})">Editar</button>
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
                <button class="btn_editar" 
                onclick="abrirEditarIngrediente(
                    ${i.id_ingrediente}, 
                    \`${i.nombre}\`, 
                    '${i.unidad_medida}', 
                    ${i.stock_actual}, 
                    ${i.stock_minimo}
                )">
                Editar
                </button>
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
            p.categoria?.nombre.toLowerCase().includes(texto)
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

        const buscador = document.getElementById('buscador_general');
        buscador.value = '';

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

    productoOriginal = {
        nombre,
        precio,
        categoriaId,
        activo
    };

    document.getElementById('edit_id_producto').value = id;
    document.getElementById('edit_nombre').value = nombre;
    document.getElementById('edit_precio').value = precio;
    document.getElementById('edit_categoria').value = categoriaId || '';
    document.getElementById('edit_activo').checked = !!activo;

    document.getElementById('modalEditarProducto').style.display = 'flex';
};

window.guardarProducto = async () => {
    const id = document.getElementById('edit_id_producto').value;

    const nombre = document.getElementById('edit_nombre').value;
    const precio = document.getElementById('edit_precio').value;
    const categoria = document.getElementById('edit_categoria').value;
    const activo = document.getElementById('edit_activo').checked;

    let datos = {};

    if (nombre && nombre !== productoOriginal.nombre) {
        datos.nombre = nombre;
    }

    if (precio && parseFloat(precio) > 100) {
        if (parseFloat(precio) !== productoOriginal.precio) {
            datos.precio = parseFloat(precio);
        }
    } else {
        alert("Precio debe ser un número mayor a 100");
        return;
    }

    if (categoria && parseInt(categoria) !== productoOriginal.categoriaId) {
        datos.id_categoria = parseInt(categoria);
    }

    if (activo !== productoOriginal.activo) {
        datos.activo = activo;
    }

    if (Object.keys(datos).length === 0) {
        alert("No hiciste cambios");
        return;
    }

    const { error } = await supabase
        .from('producto')
        .update(datos)
        .eq('id_producto', id);

    if (error) {
        console.error(error);
        alert("Error al actualizar");
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
    } else {
        alert("Producto eliminado correctamente");
    }

    cargarProductos();
};

window.eliminarIngrediente = async (id) => {
    const confirmar = confirm("¿Seguro que quieres eliminar este ingrediente?");
    if (!confirmar) return;

    const { error } = await supabase
        .from('ingrediente')
        .delete()
        .eq('id_ingrediente', id);

    if (error) {
        console.error(error);
        alert("Error al eliminar");
        return;
    } else {
        alert("Ingrediente eliminado correctamente");
    }

    cargarInventario();
};

window.abrirCrearProducto = async () => {
    await cargarCategorias();

    const select = document.getElementById('crear_categoria');
    select.innerHTML = '';

    categoriasData.forEach(c => {
        select.innerHTML += `
            <option value="${c.id_categoria}">${c.nombre}</option>
        `;
    });

    // 🔥 AGREGA ESTO
    cargarIngredientesSelect();
    ingredientesSeleccionados = [];
    renderIngredientes();

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

    if (parseFloat(precio) <= 100) {
        alert("Precio debe ser un número mayor a 100");
        return;
    }

    const { data: nuevoProducto, error } = await supabase
    .from('producto')
    .insert([{
        nombre: nombre,
        precio: precio,
        id_categoria: categoria,
        activo: activo
    }])
    .select()
    .single();

    if (error) {
        console.error(error);
        alert("Error al crear producto");
        return;
    }

    cerrarModal('modalCrearProducto');
    cargarProductos();
};

document.querySelector('.btn_agregar').addEventListener('click', () => {
    cerrarTodosLosModales();

    const tabActiva = obtenerTabActiva();

    if (tabActiva === 'productos') {
        abrirCrearProducto();
    } else {
        abrirCrearIngrediente();
    }
});

window.abrirCrearIngrediente = () => {
    document.getElementById('crear_nombre_ing').value = '';
    document.getElementById('crear_unidad').value = '';
    document.getElementById('crear_stock_actual').value = '';
    document.getElementById('crear_stock_minimo').value = '';

    document.getElementById('modalCrearIngrediente').style.display = 'flex';
};

window.crearIngrediente = async () => {
    const nombre = document.getElementById('crear_nombre_ing').value;
    const unidad = document.getElementById('crear_unidad').value;
    const stockActual = document.getElementById('crear_stock_actual').value;
    const stockMinimo = document.getElementById('crear_stock_minimo').value;

    if (!nombre || !unidad) {
        alert("Completa los campos básicos");
        return;
    }    

    const { error } = await supabase
        .from('ingrediente')
        .insert([{
            nombre: nombre,
            unidad_medida: unidad,
            stock_actual: stockActual ? Number(stockActual) : 0,
            stock_minimo: stockMinimo ? Number(stockMinimo) : 0
        }]);

    if (error) {
        console.error(error);
        alert("Error al crear ingrediente");
        return;
    }

    
    cerrarModal('modalCrearIngrediente');
    cargarInventario();
};


const cerrarTodosLosModales = () => {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
};

window.abrirEditarIngrediente = (id, nombre, unidad, stockActual, stockMinimo) => {

    ingredienteOriginal = {
        nombre,
        unidad,
        stockActual,
        stockMinimo
    };

    document.getElementById('edit_id_ing').value = id;
    document.getElementById('edit_nombre_ing').value = nombre;
    document.getElementById('edit_unidad').value = unidad;
    document.getElementById('edit_stock_actual').value = stockActual;
    document.getElementById('edit_stock_minimo').value = stockMinimo;

    document.getElementById('modalEditarIngrediente').style.display = 'flex';
};

window.guardarIngrediente = async () => {
    const id = document.getElementById('edit_id_ing').value;

    const nombre = document.getElementById('edit_nombre_ing').value;
    const unidad = document.getElementById('edit_unidad').value;
    const stockActual = document.getElementById('edit_stock_actual').value;
    const stockMinimo = document.getElementById('edit_stock_minimo').value;

    let datos = {};

    if (nombre && nombre !== ingredienteOriginal.nombre) {
        datos.nombre = nombre;
    }

    if (unidad !== ingredienteOriginal.unidad) {
        datos.unidad_medida = unidad;
    }

    if (stockActual && Number(stockActual) > 0) {
        if (Number(stockActual) !== ingredienteOriginal.stockActual) {
            datos.stock_actual = Number(stockActual);
        }
    } else {
        alert("Stock actual debe ser un número mayor a 0");
        return;
    }

    if (stockMinimo && Number(stockMinimo) > 0) {
        if (Number(stockMinimo) !== ingredienteOriginal.stockMinimo){
            datos.stock_minimo = Number(stockMinimo);
        }
    } else {
        alert("Stock mínimo debe ser un número mayor a 0");
        return;
    }

    if (Object.keys(datos).length === 0) {
        alert("No hiciste cambios");
        return;
    }

    const { error } = await supabase
        .from('ingrediente')
        .update(datos)
        .eq('id_ingrediente', id);

    if (error) {
        console.error(error);
        alert("Error al actualizar ingrediente");
        return;
    }

    cerrarModal('modalEditarIngrediente');
    cargarInventario();
};

let ingredientesSeleccionados = [];

const cargarIngredientesSelect = () => {
    const select = document.getElementById('select_ingrediente');

    select.innerHTML = '<option value="">Seleccionar ingrediente</option>';

    inventarioData.forEach(i => {
        select.innerHTML += `
            <option value="${i.id_ingrediente}">
                ${i.nombre} (${i.unidad_medida})
            </option>
        `;
    });
};

const renderIngredientes = () => {

    const contenedor = document.getElementById('lista_ingredientes');
    contenedor.innerHTML = '';

    ingredientesSeleccionados.forEach((ing, index) => {

        contenedor.innerHTML += `
            <div class="item_ingrediente">
                <span>${ing.nombre} (${ing.unidad})</span>

                <input 
                    type="number" 
                    placeholder="Cantidad"
                    value="${ing.cantidad}"
                    onchange="actualizarCantidad(${index}, this.value)"
                >

                <button onclick="eliminarIngredienteSeleccionado(${index})">
                    x
                </button>
            </div>
        `;
    });
};

document.getElementById('select_ingrediente')
.addEventListener('change', (e) => {

    const id = e.target.value;

    if (!id) return;

    const ingrediente = inventarioData.find(i => i.id_ingrediente == id);

    // evitar duplicados
    if (ingredientesSeleccionados.some(i => i.id == id)) {
        alert("Ya agregaste este ingrediente");
        e.target.value = "";
        return;
    }

    if (ingredientesSeleccionados.some(i => i.cantidad <= 0)) {
        alert("Primero ingresa una cantidad válida para el ingrediente seleccionado");
        return;
    }

    ingredientesSeleccionados.push({
        id: id,
        nombre: ingrediente.nombre,
        unidad: ingrediente.unidad_medida,
        cantidad: 0
    });

    renderIngredientes();

    e.target.value = "";
});

window.actualizarCantidad = (index, valor) => {
    ingredientesSeleccionados[index].cantidad = Number(valor);
};

window.eliminarIngredienteSeleccionado = (index) => {
    ingredientesSeleccionados.splice(index, 1);
    renderIngredientes();
};