const checkUser = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || !usuario.tipo_usuario) {
    window.location.href = "../../index.html";
  }
};

checkUser();


document.getElementById('btn_registrar_venta').addEventListener('click', (e) => { 
    e.preventDefault();
    alert('Redirigiendo a registrar venta...');
    window.location.href = 'SubPages/registrarVenta.html';
});