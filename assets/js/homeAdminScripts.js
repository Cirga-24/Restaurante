const checkUser = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || !usuario.tipo_usuario) {
    window.location.href = "../../index.html";
  }
};

checkUser();