import {supabase} from "../supabaseConexion.js";

const botonesEliminar = document.querySelectorAll(".delete-button");

botonesEliminar.forEach(boton => {
    boton.addEventListener("click", () => {
        const tarjeta = boton.closest(".mesero_card");
        tarjeta.remove();
    });
});

//Cargar tarjetas de meseros desde el backend
const contenedor = document.querySelector(".mostrar_meseros");

const cargarUsuarios = async () => {
    const { data, error } = await supabase
        .from("usuario")
        .select("*");

    if (error) {
        console.error("Error al cargar usuarios:", error);
        return;
    }

    contenedor.innerHTML = "";

    data.forEach(usuario => {
        const card = document.createElement("div");
        card.classList.add("mesero_card");
        let password = usuario.password;
        let tipoUsuario = "";
        let numero = "";
        let correo = "";
        if (usuario.tipo_usuario === true) {
            tipoUsuario = "Administrador";
        } else if (usuario.tipo_usuario === false) {
            tipoUsuario = "Mesero";
        }

        if (usuario.telefono === "") {
            numero = "Número no proporcionado";
        } else {
            numero = usuario.telefono;
        }

        if (usuario.correo === null || usuario.correo === "") {
            correo = "Correo no proporcionado";
        } else {
            correo = usuario.correo;
        }

        card.innerHTML = `
            <div class="mesero_info">
                <h2 class="name">Nombre: ${usuario.username}</h2>
                <p class="phone">Teléfono: ${numero}</p>
                <p class="email">Correo: ${correo}</p>
                <p class="tipo">Tipo: ${tipoUsuario}</p>
                <p class="tipo">Contraseña: ${password}</p>
            </div>
            <div class="mesero_options">
                <button class="delete-button">Eliminar</button>
                <button class="edit-button">Editar</button>
            </div>
        `;

        contenedor.appendChild(card);
    });
};
cargarUsuarios();

//Eliminar usuario al hacer click en el botón eliminar, 
// verificando que no sea un administrador

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-button")) {
        const tarjeta = e.target.closest(".mesero_card");
        const nombre = tarjeta.querySelector(".name").textContent.replace("Nombre: ", "");
        const { data, error } = await supabase
            .from("usuario")
            .select("tipo_usuario")
            .eq("username", nombre)
            .single();
        
        if (data.tipo_usuario === true) {
            alert("No se puede eliminar a un administrador.");
            return;
        } else if (data.tipo_usuario === false && confirm(`¿Estás seguro de eliminar al usuario ${nombre}?`)) {
            await supabase
                .from("usuario")
                .delete()
                .eq("username", nombre);
            tarjeta.remove();
            alert(`Usuario ${nombre} eliminado exitosamente.`);
        };
    }
});

//Crear Usuario
document.getElementById("btn_crear").addEventListener("click", async () => {
    const username = document.getElementById("nuevoNombre").value;
    const telefono = document.getElementById("nuevoTelefono").value;
    const correo = document.getElementById("nuevoCorreo").value;
    const password = document.getElementById("nuevoPassword").value;

    if (!username || !password) {
        alert("Nombre y contraseña obligatorios");
        return;
    }

    const { error } = await supabase
        .from("usuario")
        .insert([{
            username,
            password,
            tipo_usuario: false,
            telefono,
            correo
        }]);

    if (error) {
        console.error(error);
        alert("Error al crear usuario");
        return;
    }

    alert("Usuario creado");
    location.reload(); // recargar lista
});


//Editar Usuario
document.getElementById("btn_guardar_edicion").addEventListener("click", async () => {

    const nombreOriginal = document.getElementById("editId").value;

    const username = document.getElementById("editNombre").value;
    const telefono = document.getElementById("editTelefono").value;
    const correo = document.getElementById("editCorreo").value;
    const password = document.getElementById("editPassword").value;

    const datosActualizados = {
        username,
        telefono,
        correo
    };

    // 👉 solo actualizar password si el usuario escribe algo
    if (password !== "") {
        datosActualizados.password = password;
    }

    const { error } = await supabase
        .from("usuario")
        .update(datosActualizados)
        .eq("username", nombreOriginal);

    if (error) {
        console.error(error);
        alert("Error al actualizar usuario");
        return;
    }

    alert("Usuario actualizado correctamente");

    modalEditar.style.display = "none";

    // recargar tarjetas
    cargarUsuarios();
});

//Crear usuario
const modal = document.getElementById("modalAgregar");
const abrir = document.getElementById("abrirModal");
const cerrar = document.querySelector(".cerrar");

// Abrir
abrir.addEventListener("click", () => {
    modal.style.display = "flex";
});

// Cerrar con X
cerrar.addEventListener("click", () => {
    modal.style.display = "none";
});

// Cerrar haciendo click afuera
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

function limpiarModal() {
    document.querySelectorAll("#modalAgregar input").forEach(input => input.value = "");
}

cerrar.addEventListener("click", () => {
    modal.style.display = "none";
    limpiarModal();
});

const modalEditar = document.getElementById("modalEditar");

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-button")) {

        const tarjeta = e.target.closest(".mesero_card");

        const nombre = tarjeta.querySelector(".name").textContent.replace("Nombre: ", "");
        const telefono = tarjeta.querySelector(".phone").textContent.replace("Teléfono: ", "");
        const correo = tarjeta.querySelector(".email").textContent.replace("Correo: ", "");

        // Llenar inputs
        document.getElementById("editNombre").value = nombre;
        document.getElementById("editTelefono").value = telefono;
        document.getElementById("editCorreo").value = correo;
        document.getElementById("editPassword").value = "";

        // Guardar referencia (por ahora username)
        document.getElementById("editId").value = nombre;

        modalEditar.style.display = "flex";
    }
});

const cerrarEditar = document.querySelector(".cerrarEditar");

cerrarEditar.addEventListener("click", () => {
    modalEditar.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modalEditar) {
        modalEditar.style.display = "none";
    }
});