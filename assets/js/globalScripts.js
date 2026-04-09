
// Mostrar fecha actual
try {
    const fechaActual = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('fechaActual').textContent = fechaActual.toLocaleDateString('es-ES', opciones);
} catch (error) {
    console.error('No hay objeto de "fecha" disponible:');
}

//Botón cerrar sesión
try {
    const cerrarSesion = document.getElementById('cerrarSesion');
    cerrarSesion.addEventListener('click', () => {
        if (cerrarSesion.classList.contains('logout')) {
            localStorage.removeItem("usuario");
            window.location.replace('/index.html');
        }
    });
} catch (error) {
    console.error('No hay botón de cerrar sesión disponible:');
}


//Cargar el menú lateral
try {
// Cargar menú lateral en todas las páginas
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("menu-container");
    if (container) {
        fetch("../../menuLateral.html") // ajusta la ruta si es necesario
        .then(response => response.text())
        .then(data => {
            container.innerHTML = data;
            activarMenuActual();
            configurarCerrarSesion();
        })
        .catch(error => console.error("Error cargando menú:", error));
    }
    });

    // Activar link actual
    function activarMenuActual() {
    const links = document.querySelectorAll(".menu_link");
    const rutaActual = window.location.pathname;

    links.forEach(link => {
        if (rutaActual.includes(link.getAttribute("href"))) {
        link.classList.add("active");
        } else {
        link.classList.remove("active");
        }
    });
    }

    // Cerrar sesión
    function configurarCerrarSesion() {
    const btnCerrar = document.getElementById("cerrarSesion");

    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "/index.html"; // ajusta si cambia la ruta
        });
    }
} } catch (error) {
    console.error('No se pudo cargar el menú lateral:');
};


const fecha = new Date().toISOString();
localStorage.setItem("dateActual", fecha);
