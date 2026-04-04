const checkUser = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || !usuario.tipo_usuario) {
    window.location.href = "../../index.html";
  }
};

checkUser();

const productoEl = document.getElementById('producto');
const cantidadEl = document.getElementById('cantidad');
const precioEl = document.getElementById('precio');
const itemsLista = document.getElementById('itemsLista');
const ventaTotal = document.getElementById('ventaTotal');
const btnAgregar = document.getElementById('btnAgregar');
const btnGuardar = document.getElementById('btnGuardar');

const items = [];

function formatoDinero(valor) {
    return '$' + Number(valor).toFixed(2);
}

function actualizarLista() {
    itemsLista.innerHTML = '';
    let totalVenta = 0;
    items.forEach((item, index) => {
        const fila = document.createElement('tr');
        const subtotal = item.cantidad * item.precio;
        totalVenta += subtotal;

        fila.innerHTML = `
            <td>${item.producto}</td>
            <td>${item.cantidad}</td>
            <td>${formatoDinero(item.precio)}</td>
            <td>${formatoDinero(subtotal)}</td>
            <td><button type="button" data-index="${index}">Eliminar</button></td>
        `;

        fila.querySelector('button').addEventListener('click', () => {
            items.splice(index, 1);
            actualizarLista();
        });

        itemsLista.appendChild(fila);
    });
    ventaTotal.textContent = formatoDinero(totalVenta);
}

btnAgregar.addEventListener('click', () => {
    const producto = productoEl.value;
    const cantidad = Number(cantidadEl.value);
    const precio = Number(precioEl.value);

    if (!producto) {
        alert('Selecciona un producto.');
        return;
    }
    if (cantidad < 1 || precio <= 0) {
        alert('Ingresa cantidad y precio válidos.');
        return;
    }

    items.push({ producto, cantidad, precio });
    actualizarLista();
    cantidadEl.value = '1';
    precioEl.value = '0.00';
    productoEl.value = '';
});

btnGuardar.addEventListener('click', () => {
    if (items.length === 0) {
        alert('Agrega al menos un producto.');
        return;
    }
    const cliente = document.getElementById('cliente').value.trim();
    const vendedor = document.getElementById('vendedor').value.trim();
    const fecha = document.getElementById('fecha').value;
    if (!cliente || !vendedor || !fecha) {
        alert('Completa los datos del cliente, vendedor y fecha.');
        return;
    }

    const venta = {
        cliente,
        vendedor,
        fecha,
        items,
        total: items.reduce((sum, item) => sum + item.cantidad * item.precio, 0)
    };

    console.log('Venta registrada:', venta);
    alert('Venta registrada correctamente. Revisa la consola para verificar.');
    items.length = 0;
    actualizarLista();
    document.getElementById('cliente').value = '';
    document.getElementById('vendedor').value = '';
});

document.getElementById("fecha").textContent = new Date().toISOString().split('T')[0];