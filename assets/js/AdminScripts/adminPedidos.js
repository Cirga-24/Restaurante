import { supabase } from '../supabaseConexion.js';

const contenedor = document.getElementById('card_principal');

const cargarPedidos = async () => {

    const { data, error } = await supabase
    .from("pedido")
    .select(`
        id_pedido,
        fecha,
        tipo,
        total,
        estado
    `)
    .eq("estado", true)
    .order('fecha', { ascending: false });

    if (error) {
        console.error("Error cargando pedidos:", error);
        return;
    }

    mostrarPedidos(data);
};

const mostrarPedidos = (pedidos) => {

    if (!pedidos || pedidos.length === 0) {
        contenedor.innerHTML = "<p>No hay pedidos</p>";
        return;
    }

    let html = '';

    pedidos.forEach(p => {
        html += `
            <div class="pedido_card">
                <div class="pedido_header">
                    <span><strong>Pedido #${p.id_pedido}</strong></span>
                    <span>${new Date(p.fecha).toLocaleString()}</span>
                </div>

                <div class="pedido_body">
                    <p><strong>Tipo:</strong> ${p.tipo}</p>
                    <p><strong>Total:</strong> $${p.total}</p>
                </div>

                <select class="pago_select">
                    <option value="">Tipo de pago</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                </select>

                <button class="btn_hecho" data-id="${p.id_pedido}">
                    ✅ Marcar como hecho
                </button>
                <button class="btn_cancelar" data-id="${p.id_pedido}">
                    Cancelar Pedido
                </button>
            </div>
        `;
    });

    contenedor.innerHTML = html;
};

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn_ver_detalle")) {

        const id = e.target.dataset.id;

        const { data, error } = await supabase
            .from("detalle_pedido")
            .select(`
                id_pedido,
                cantidad,
                precio_unitario,
                subtotal,
                producto (
                    nombre
                )
            `)
            .eq("id_pedido", id);

        if (error) {
            console.error("Error cargando detalle:", error);
            return;
        }

        let detalle = "🧾 Detalle:\n";

        data.forEach(item => {
            detalle += `- ${item.producto?.nombre} x${item.cantidad} = $${item.subtotal}\n`;
        });

        alert(detalle);
    }
});

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn_hecho")) {

        const id = e.target.dataset.id;

        const card = e.target.closest('.pedido_card');
        const selectPago = card.querySelector('.pago_select');
        const metodoPago = selectPago.value;

        if (!metodoPago) {
            alert("Seleccione un método de pago");
            return;
        }

        const { data: pedido, error: errorPedido } = await supabase
            .from("pedido")
            .select("*")
            .eq("id_pedido", id)
            .single();

        if (errorPedido) {
            console.error(errorPedido);
            return;
        }

        const { error: errorVenta } = await supabase
            .from("ventas")
            .insert([{
                id_pedido: id,
                metodo_pago: metodoPago,
                total: pedido.total,
                fecha: new Date().toISOString()
            }]);

        if (errorVenta) {
            console.error("Error guardando venta:", errorVenta);
            alert("Error al registrar venta");
            return;
        }

        const { error: errorUpdate } = await supabase
            .from("pedido")
            .update({ estado: false })
            .eq("id_pedido", id);

        if (errorUpdate) {
            console.error(errorUpdate);
            return;
        }

        alert("✅ Venta registrada correctamente");
        cargarPedidos();
    }
});

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn_cancelar")) {

        const id = e.target.dataset.id;

        const confirmar = confirm("Seguro que quieres cancelar este pedido?");
        if (!confirmar) return;

        const { error: errorDetalle } = await supabase
            .from("detalle_pedido")
            .delete()
            .eq("id_pedido", id);

        if (errorDetalle) {
            console.error("Error eliminando detalle:", errorDetalle);
            alert("Error al eliminar detalle");
            return;
        }

        const { error: errorPedido } = await supabase
            .from("pedido")
            .delete()
            .eq("id_pedido", id);

        if (errorPedido) {
            console.error("Error eliminando pedido:", errorPedido);
            alert("Error al eliminar pedido");
            return;
        }

        alert("Pedido cancelado");
        cargarPedidos();
    }
});

cargarPedidos();
