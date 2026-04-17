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

supabase
    .channel('realtime-pedidos')
    .on(
        'postgres_changes',
        {
        event: '*', // escucha INSERT, UPDATE y DELETE
        schema: 'public',
        table: 'pedido'
        },
        (payload) => {
        console.log('Cambio en pedidos:', payload);

        // Recargar pedidos automáticamente
        cargarPedidos();
        }
    )
    .subscribe();

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
                    Marcar como hecho
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

        await descontarInventario(id);

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

const descontarInventario = async (id_pedido) => {

    // Traer detalle del pedido
    const { data: detalles, error } = await supabase
        .from("detalle_pedido")
        .select("id_producto, cantidad")
        .eq("id_pedido", id_pedido);

    if (error) {
        console.error("Error obteniendo detalle:", error);
        return;
    }

    // Procesar cada producto
    for (const item of detalles) {

        let productosAProcesar = [];

        // PROMOS
        if (item.id_producto == 68) {
            // Promo familiar
            productosAProcesar.push(
                { id: 15, cantidad: 1 },
                { id: 16, cantidad: 1 },
                { id: 28, cantidad: 1 },
                { id: 109, cantidad: 1 }
            );
        } else if (item.id_producto == 69) {
            productosAProcesar.push(
                { id: 13, cantidad: 1 },
                { id: 14, cantidad: 1 },
                { id: 48, cantidad: 2 },
                { id: 109, cantidad: 1 }
            );
        } else {
            // Producto normal
            productosAProcesar.push({
                id: item.id_producto,
                cantidad: item.cantidad
            });
        }

        // Procesar cada producto
        for (const prod of productosAProcesar) {

            const { data: ingredientes } = await supabase
                .from("producto_ingrediente")
                .select("id_ingrediente, cantidad_usada")
                .eq("id_producto", prod.id);

            for (const ing of ingredientes) {

                const cantidadTotal = ing.cantidad_usada * prod.cantidad;

                // DESCONTAR INVENTARIO
                const { error } = await supabase.rpc("descontar_ingrediente", {
                    p_id_ingrediente: ing.id_ingrediente,
                    p_cantidad: cantidadTotal
                });

                if (error) {
                    console.error("ERROR RPC:", error);
                }
            }
        }
    }
};


cargarPedidos();
