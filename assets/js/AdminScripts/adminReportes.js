import { supabase } from '../supabaseConexion.js';

const contenedor = document.getElementById('lista_pedidos');
const hoy = new Date().toISOString().split("T")[0];
document.getElementById("fechaInicio").max = hoy;
document.getElementById("fechaFin").max = hoy;

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

                <button class="btn_factura" data-id="${p.id_pedido}">
                    Generar factura
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

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn_factura")) {
        const id = e.target.dataset.id;
        generarFacturaPDF(id);
    }
});

const generarFacturaPDF = async (idPedido) => {
    const { jsPDF } = window.jspdf;

    const { data: pedido, error } = await supabase
        .from("pedido")
        .select(`
            id_pedido,
            fecha,
            tipo,
            costo_domicilio,
            servicio_mesa,
            total,
            usuario (
                username
            ),
            ventas (
                metodo_pago,
                fecha
            ),
            detalle_pedido (
                cantidad,
                precio_unitario,
                subtotal,
                producto (
                    nombre
                )
            )
        `)
        .eq("id_pedido", idPedido)
        .single();

    if (error) {
        console.error("Error generando factura:", error);
        alert("No se pudo generar la factura");
        return;
    }

    const doc = new jsPDF();
    const formatoMoneda = (valor) => `$${Number(valor || 0).toLocaleString("es-CO")}`;
    const fechaPedido = new Date(pedido.fecha).toLocaleString("es-CO");
    const metodoPago = pedido.ventas?.[0]?.metodo_pago || "N/A";

    doc.setDrawColor(142, 125, 56);
    doc.setLineWidth(0.6);
    doc.line(20, 16, 190, 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Comprobante de Venta", 20, 28);

    doc.setFontSize(10);
    doc.text(`Pedido #${pedido.id_pedido}`, 150, 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Restaurante", 20, 36);
    doc.text("Documento no equivalente a factura electronica", 20, 42);

    doc.setDrawColor(220, 220, 220);
    doc.line(20, 48, 190, 48);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Datos de la venta", 20, 58);

    doc.setFontSize(10);
    doc.text("Fecha:", 20, 68);
    doc.text("Tipo:", 20, 75);
    doc.text("Mesero:", 105, 68);
    doc.text("Metodo de pago:", 105, 75);

    doc.setFont("helvetica", "normal");
    doc.text(fechaPedido, 42, 68);
    doc.text(pedido.tipo || "N/A", 42, 75);
    doc.text(pedido.usuario?.username || "N/A", 135, 68);
    doc.text(metodoPago, 135, 75);

    let y = 92;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Detalle de productos", 20, y);

    y += 10;
    doc.setFillColor(142, 125, 56);
    doc.rect(20, y - 6, 170, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Producto", 23, y);
    doc.text("Cant.", 102, y);
    doc.text("Precio", 125, y);
    doc.text("Subtotal", 158, y);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 8;

    pedido.detalle_pedido.forEach(item => {
        if (y > 260) {
            doc.addPage();
            y = 25;
        }

        const nombreProducto = item.producto?.nombre || "Producto";
        const nombreCorto = nombreProducto.length > 38
            ? `${nombreProducto.slice(0, 35)}...`
            : nombreProducto;

        doc.text(nombreCorto, 23, y);
        doc.text(String(item.cantidad), 105, y);
        doc.text(formatoMoneda(item.precio_unitario), 125, y);
        doc.text(formatoMoneda(item.subtotal), 158, y);

        doc.setDrawColor(235, 235, 235);
        doc.line(20, y + 3, 190, y + 3);
        y += 8;
    });

    y += 8;
    doc.setDrawColor(220, 220, 220);
    doc.line(115, y - 5, 190, y - 5);

    doc.setFont("helvetica", "bold");
    doc.text("Resumen", 125, y);
    y += 8;

    doc.setFontSize(10);
    doc.text("Servicio mesa:", 125, y);
    doc.text(formatoMoneda(pedido.servicio_mesa), 165, y);
    y += 7;

    doc.text("Domicilio:", 125, y);
    doc.text(formatoMoneda(pedido.costo_domicilio), 165, y);
    y += 9;

    doc.setFontSize(13);
    doc.text("TOTAL:", 125, y);
    doc.text(formatoMoneda(pedido.total), 165, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Gracias por su compra.", 20, 285);

    doc.save(`factura-pedido-${pedido.id_pedido}.pdf`);
};

cargarPedidos();

document.getElementById("btn_filtrar").addEventListener("click", () => {

    const inicio = document.getElementById("fechaInicio").value;
    const fin = document.getElementById("fechaFin").value;

    if (!inicio || !fin) {
        alert("Seleccione ambas fechas");
        return;
    }

    if (inicio > fin) {
        alert("La fecha inicial no puede ser mayor a la final");
        return;
    }

    cargarPedidos(inicio, fin);
    document.getElementById("fechaInicio").value = "";
    document.getElementById("fechaFin").value = "";
});

document.getElementById("fechaInicio").addEventListener("change", function() {
    document.getElementById("fechaFin").min = this.value;
});

document.getElementById("fechaFin").addEventListener("change", function() {
    document.getElementById("fechaInicio").max = this.value;
});
