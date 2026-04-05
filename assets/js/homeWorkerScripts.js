const checkUser = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    window.location.href = "../../index.html";
  }
};

checkUser();

const saludo = document.getElementById("saludo");
const usuario = JSON.parse(localStorage.getItem("usuario"));
const opciones = document.querySelectorAll('.option');

console.log('Usuario cargado desde localStorage:', usuario);
saludo.textContent = `Bienvenido, ${usuario.username}`;

opciones.forEach(opcion => {
    opcion.addEventListener('click', () => {
        const url = opcion.dataset.url;
        if (url) {
            window.location.href = url;
        } else {
            console.error('No se encontró data-url en este elemento. ' + 'URL: ' + url);
        }

        if (opcion.classList.contains('logout')) {
            localStorage.removeItem("usuario");
        }
    });
});