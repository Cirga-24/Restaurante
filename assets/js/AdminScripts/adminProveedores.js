import {supabase} from "../supabaseConexion.js";

const usuario = localStorage.getItem("usuario");
    if (!usuario) {
        window.location.href = "../../index.html";
    }

    const tabla = document.getElementById("tablaProveedores");

const cargarProveedores = async () => {
    const { data, error } = await supabase
        .from("proveedor")
        .select("*");

    if (error) {
        console.error(error);
        return;
    }

    tabla.innerHTML = "";

    data.forEach(prov => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${prov.id_proveedor}</td>
            <td>${prov.nombre}</td>
            <td>${prov.telefono || "N/A"}</td>
            <td>${prov.direccion || "N/A"}</td>
            <td>
                <button class="btn_editar" data-id="${prov.id_proveedor}">Editar</button>
                <button class="btn_eliminar" data-id="${prov.id_proveedor}">Eliminar</button>
            </td>
        `;

        tabla.appendChild(tr);
    });
};

cargarProveedores();

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn_eliminar")) {

        const id = e.target.dataset.id;

        if (!confirm("¿Eliminar proveedor?")) return;

        const { error } = await supabase
            .from("proveedor")
            .delete()
            .eq("id_proveedor", id);

        if (error) {
            console.error(error);
            alert("Error al eliminar");
            return;
        }

        alert("Proveedor eliminado");
        cargarProveedores();
    }
});

const modalProv = document.getElementById("modalProveedor");

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn_editar")) {

        const id = e.target.dataset.id;

        const { data, error } = await supabase
            .from("proveedor")
            .select("*")
            .eq("id_proveedor", id)
            .single();

        if (error) {
            console.error(error);
            return;
        }

        document.getElementById("editIdProveedor").value = data.id_proveedor;
        document.getElementById("editNombreProv").value = data.nombre;
        document.getElementById("editTelefonoProv").value = data.telefono;
        document.getElementById("editDireccionProv").value = data.direccion;

        modalProv.style.display = "flex";
    }
});

document.getElementById("guardarProveedor").addEventListener("click", async () => {

    const id = document.getElementById("editIdProveedor").value;

    const nombre = document.getElementById("editNombreProv").value;
    const telefono = document.getElementById("editTelefonoProv").value;
    const direccion = document.getElementById("editDireccionProv").value;

    const { error } = await supabase
        .from("proveedor")
        .update({
            nombre,
            telefono,
            direccion
        })
        .eq("id_proveedor", id);

    if (error) {
        console.error(error);
        alert("Error al actualizar");
        return;
    }

    alert("Proveedor actualizado");

    modalProv.style.display = "none";
    cargarProveedores();
});

document.querySelector(".cerrarProveedor").addEventListener("click", () => {
    modalProv.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modalProv) {
        modalProv.style.display = "none";
    }
});

// REFERENCIAS
const modalAgregar = document.getElementById("modalAgregarProveedor");
const btnAbrir = document.getElementById("abrirModalProveedor"); // botón que tú pongas
const btnCerrar = document.querySelector(".cerrarAgregarProveedor");

// ABRIR
btnAbrir.addEventListener("click", () => {
    modalAgregar.style.display = "flex";
});

// CERRAR (X)
btnCerrar.addEventListener("click", () => {
    cerrarModal();
});

// CERRAR CLICK AFUERA
window.addEventListener("click", (e) => {
    if (e.target === modalAgregar) {
        cerrarModal();
    }
});

// LIMPIAR + CERRAR
function cerrarModal() {
    modalAgregar.style.display = "none";

    document.getElementById("provNombre").value = "";
    document.getElementById("provTelefono").value = "";
    document.getElementById("provDireccion").value = "";
}

document.getElementById("btnGuardarProveedor").addEventListener("click", async () => {

    const nombre = document.getElementById("provNombre").value.trim();
    const telefono = document.getElementById("provTelefono").value.trim();
    const direccion = document.getElementById("provDireccion").value.trim();

    if (!nombre) {
        alert("El nombre es obligatorio");
        return;
    }

    const { error } = await supabase
        .from("proveedor")
        .insert([{
            nombre,
            telefono,
            direccion
        }]);

    if (error) {
        console.error(error);
        alert("Error al guardar proveedor");
        return;
    }

    alert("Proveedor agregado correctamente");

    cerrarModal();

    // 🔥 Recargar tabla sin recargar página
    cargarProveedores();
});