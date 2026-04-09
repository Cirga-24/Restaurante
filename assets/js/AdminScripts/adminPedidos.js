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

                <button class="btn_hecho" data-id="${p.id_pedido}">
                    ✅ Marcar como hecho
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

        const { error } = await supabase
            .from("pedido")
            .update({ estado: false })
            .eq("id_pedido", id);

        if (error) {
            console.error("Error actualizando estado:", error);
            alert("Error al actualizar pedido");
            return;
        }
        cargarPedidos();
    }
});

cargarPedidos();