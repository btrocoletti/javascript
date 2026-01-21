"use strict";

// Array de usuarios
const allowedUsers = ["bruno", "juan", "maria"];

// Función con parámetro y return
function usuarioPermitido(name, users) {
  for (let i = 0; i < users.length; i++) {
    if (users[i] === name) {
      return true;
    }
  }
  return false;
}

// Input
const userName = prompt("Ingresá tu nombre");

if (userName !== null) {
  const nameLower = userName.toLowerCase();

  // Condicional
  if (usuarioPermitido(nameLower, allowedUsers)) {
    alert("✅ Acceso permitido");
  } else {
    alert("❌ Acceso denegado");
  }

  console.log("Usuario ingresado:", nameLower);
} else {
  alert("Simulación cancelada");
}
