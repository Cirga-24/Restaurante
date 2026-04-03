import { supabase } from './supabaseConexion.js';

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
document.getElementById('btn_ingresar').addEventListener('click', async function(e) {
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

    const alertText = document.getElementById('alertText');

try {
    const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('username', username)
    .single();

console.log("Usuario encontrado:", data);

    if (!data) {
    alertText.textContent = 'Usuario no existe';
    return;
    }

    // Comparación manual
    if (data.password !== password) {
    alertText.textContent = 'Contraseña incorrecta';
    return;
    }

    // Guardar usuario en sesión
    localStorage.setItem("usuario", JSON.stringify(data));

    // Redirección según tipo
    if (data.tipo_usuario) {
        window.location.href = 'assets/pages/homeAdmin.html';
    } else {
        window.location.href = 'assets/pages/homeWorker.html';
    }

} catch (err) {
    console.error(err);
    alertText.textContent = 'Error al conectar con el servidor.';
}
});

