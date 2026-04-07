document.getElementById("saludo").textContent = "Bienvenido, " + 
JSON.parse(localStorage.getItem("usuario")).username;

