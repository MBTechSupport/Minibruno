import { auth, signOut } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("userInfo");
  if (!userInfo) return;

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
    document.getElementById("homeBtn")?.addEventListener("click", () => {
      window.location.href = "index_log.html";
    });
    
    // Listener para botón Logout
    document.getElementById("logoutBtn")?.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "login.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    });

  } else {
    userInfo.innerHTML = `
      <a href="login.html" class="neon-button text-white px-4 py-2 rounded-lg font-medium font-tech text-sm transition-colors">
        Iniciar Sesión
      </a>
    `;
  }
});