const checkUser = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || !usuario.tipo_usuario) {
    window.location.href = "../../index.html";
  }
};

checkUser();

const tipoServicio = document.getElementById('tipoServicio');
const costoDomicilio = document.getElementById('costo_domicilio');

tipoServicio.addEventListener('change', function() {
    if (this.value === 'domicilio') {
        costoDomicilio.disabled = false;
        costoDomicilio.placeholder = "Ingrese el costo del domicilio..."; 
    } else {
        costoDomicilio.disabled = true;
        costoDomicilio.placeholder = "Solo se puede en domicilio";
    }
});

// Mostrar fecha actual
        const fechaActual = new Date();
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('fechaActual').textContent = fechaActual.toLocaleDateString('es-ES', opciones);
        
        // Almacenar carrito en memoria
        let carrito = [];
        
        // Agregar eventos a botones de agregar
        document.querySelectorAll('.btn_agregar').forEach(button => {
            button.addEventListener('click', function() {
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
                        <button class="btn_eliminar" data-index="${index}">✕</button>
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

            actualizarTotales();
        }
        
        function eliminarDelCarrito(index) {
            carrito.splice(index, 1);
            actualizarCarrito();
        }
        
        function actualizarTotales() {
            const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            const impuesto = subtotal * 0.08; // 8% de impuesto
            const total = subtotal + impuesto;
            
            document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
            document.getElementById('impuesto').textContent = '$' + impuesto.toFixed(2);
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
            } else if (document.getElementById('tipoServicio').value === 'Domicilio' && document.getElementById('costo_domicilio').value === '') {
                alert('Por favor, ingrese el costo de domicilio');
                return;
            }
            alert('Venta completada. Total: ' + document.getElementById('total').textContent);
        });
        
        // Búsqueda de productos
        document.getElementById('buscarProducto').addEventListener('input', function(e) {
            const busqueda = e.target.value.toLowerCase();
            document.querySelectorAll('.producto_item').forEach(item => {
                const nombre = item.querySelector('.producto_nombre').textContent.toLowerCase();
                const descripcion = item.querySelector('.producto_descripcion').textContent.toLowerCase();
                item.style.display = nombre.includes(busqueda) || descripcion.includes(busqueda) ? 'flex' : 'none';
            });
        });