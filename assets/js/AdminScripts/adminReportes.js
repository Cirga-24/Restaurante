import { supabase } from '../supabaseConexion.js';

const contenedor = document.getElementById('lista_pedidos');

const cargarPedidos = async (fechaInicio = null, fechaFin = null) => {

    let query = supabase
        .from("pedido")
        .select(`
            id_pedido,
            fecha,
            tipo,
            total,
            estado
        `)
        .eq("estado", false);

    if (fechaInicio) {
        query = query.gte("fecha", fechaInicio);
    }

    if (fechaFin) {
        query = query.lte("fecha", fechaFin + "T23:59:59");
    }

    const { data, error } = await query.order('fecha', { ascending: false });

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

                <button class="btn_ver_detalle" data-id="${p.id_pedido}">
                    Ver detalle
                </button>

                <div class="detalle_container" id="detalle-${p.id_pedido}" style="display:none;">
                </div>

            </div>
        `;
    });

    contenedor.innerHTML = html;
};

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn_ver_detalle")) {

        const id = e.target.dataset.id;
        const contenedorDetalle = document.getElementById(`detalle-${id}`);

        if (contenedorDetalle.style.display === "block") {
            contenedorDetalle.style.display = "none";
            return;
        }

        const { data, error } = await supabase
            .from("detalle_pedido")
            .select(`
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

        let html = '';

        data.forEach(item => {
            html += `
                <div class="detalle_item">
                    <span>${item.producto?.nombre}</span>
                    <span>x${item.cantidad}</span>
                    <span>$${item.subtotal}</span>
                </div>
            `;
        });

        contenedorDetalle.innerHTML = html;
        contenedorDetalle.style.display = "block";
    }
});

cargarPedidos();

document.getElementById("btn_filtrar").addEventListener("click", () => {
    const inicio = document.getElementById("fechaInicio").value;
    const fin = document.getElementById("fechaFin").value;

    cargarPedidos(inicio, fin);
});