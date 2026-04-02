// Botones de mostrar/ocultar formulario
document.getElementById('btn_login').addEventListener('click', function() {
    document.querySelector('.contenedor_login').classList.add('active');
});

document.getElementById('btn_cancelar').addEventListener('click', function() {
    document.querySelector('.contenedor_login').classList.remove('active');
});
