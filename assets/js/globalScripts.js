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
