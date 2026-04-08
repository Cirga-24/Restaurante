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
try {
    const cargarUsuarios = async () => {
        const { data, error } = await supabase
            .from("usuario")
            .select("*");

        if (error) {
            console.error("Error al cargar usuarios:", error);
            return;
        }

        contenedor.innerHTML = ""; // limpiar antes de cargar

        data.forEach(usuario => {
            const card = document.createElement("div");
            card.classList.add("mesero_card");

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
} catch (error) {
    console.error("Error al cargar usuarios:", error);
};

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
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-button")) {

        const tarjeta = e.target.closest(".mesero_card");
        const nombre = tarjeta.querySelector(".name").textContent.replace("Nombre: ", "");

        const nuevoTelefono = prompt("Nuevo teléfono:");
        const nuevoCorreo = prompt("Nuevo correo:");

        if (!nuevoTelefono && !nuevoCorreo) return;

        const { error } = await supabase
            .from("usuario")
            .update({
                telefono: nuevoTelefono,
                correo: nuevoCorreo
            })
            .eq("username", nombre);

        if (!error) {
            alert("Usuario actualizado");
            location.reload();
        }
    }
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