// Boton para mostrar formulario de ingreso
document.getElementById('btn_login').addEventListener('click', function() {
    document.querySelector('.contenedor_todo').classList.add('active');
    document.querySelector('.contenedor_login').style.display = 'grid';
});

//Boton para cancelar ingreso
document.getElementById('btn_cancelar').addEventListener('click', function() {
    document.querySelector('.contenedor_todo').classList.remove('active');
    document.querySelector('.contenedor_login').style.display = 'none';
});

//Boton de "Olvidó su contraseña"
document.getElementById('btn_forgotpassword').addEventListener('click', function() {
    document.querySelector('.contenedor_forgotpassword').classList.add('active');
    document.querySelector('.contenedor_forgotpassword').style.display = 'grid';
    document.querySelector('.contenedor_login').style.display = 'none';
});

//Boton para cancelar "Olvidó su contraseña"
document.getElementById('btn_cancelarforgot').addEventListener('click', function() {
    document.querySelector('.contenedor_forgotpassword').classList.remove('active');
    document.querySelector('.contenedor_forgotpassword').style.display = 'none';
    document.querySelector('.contenedor_login').style.display = 'grid';
});
