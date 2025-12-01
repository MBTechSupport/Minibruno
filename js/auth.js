import { auth, signOut } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const userInfo = document.getElementById("userInfo");

onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.innerHTML = `
      <p class="text-dark font-tech text-sm">Bienvenido(a): ${user.email}</p>
      <button id="homeBtn"
        class="neon-button text-white px-4 py-2 rounded-lg font-medium font-tech text-sm transition-colors">
        Inicio
      </button>
      <button id="logoutBtn"
        class="neon-button text-white px-4 py-2 rounded-lg font-medium font-tech text-sm transition-colors">
        Cerrar Sesión
      </button>
    `;

    // Listener para botón Inicio
    document.getElementById("homeBtn").addEventListener("click", () => {
      window.location.href = "/index.html";
    });
    
    // Listener para botón Logout
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "/logout.html"; // o "login.html"
      } catch (error) {
        alert("❌ Error al cerrar sesión: " + error.message);
      }
    });

  } else {
    userInfo.innerHTML = `
      <p class="text-dark font-tech text-sm">No hay usuario conectado</p>
    `;
    window.location.href = "/main_index.html";
  }
});