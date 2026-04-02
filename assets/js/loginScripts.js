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

//Boton para enviar formulario de ingreso
document.getElementById('btn_ingresar').addEventListener('click', function(e) {
    e.preventDefault();
    var username = document.getElementById('usuario').value.trim();
    var password = document.getElementById('password').value.trim();

    if(username == "" || password == "") 
    {
        document.getElementById('alertText').textContent = 'Por favor, complete todos los campos.';
        setTimeout(() => {
            alertText.textContent = '';
        }, 3000);
        return;
    };

    if(username === 'adminFull' && password === 'FullAdmin') {
        window.location.href = 'assets/pages/homeAdmin.html';
    } else if(username === 'worker' && password === 'FullWorker') {
        window.location.href = 'assets/pages/homeWorker.html';
    } else {
        document.getElementById('alertText').textContent = 'Usuario o contraseña incorrectos.';
    }
});
