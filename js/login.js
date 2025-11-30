import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut 
} from "./firebase-init.js";

import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Elementos del DOM
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const userInfo = document.getElementById("user-info");
const errorMessage = document.getElementById("error-message");
const successMessage = document.getElementById("success-message");

// Escuchar cambios en el estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuario autenticado
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("user-section").classList.remove("hidden");

    userInfo.innerHTML = `
      <div class="flex items-center space-x-4">
        <img src="${user.photoURL || 'https://placehold.co/50'}" 
             alt="Foto de perfil" 
             class="w-12 h-12 rounded-full border-2 border-blue-500">
        <div>
          <p class="text-white font-semibold">${user.displayName || user.email}</p>
          <p class="text-gray-400 text-sm">Sesión activa</p>
        </div>
      </div>
    `;
  } else {
    // No hay usuario autenticado
    document.getElementById("auth-section").classList.remove("hidden");
    document.getElementById("user-section").classList.add("hidden");
  }
});

// Inicio de sesión con Google
loginBtn.addEventListener("click", () => {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      showSuccess("Inicio de sesión con Google exitoso");
    })
    .catch((error) => {
      showError("Error al iniciar sesión con Google: " + error.message);
    });
});

// Cierre de sesión
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      showSuccess("Sesión cerrada correctamente");
    })
    .catch((error) => {
      showError("Error al cerrar sesión: " + error.message);
    });
});

// Inicio de sesión con correo y contraseña
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      showSuccess("Inicio de sesión exitoso");
      // Ejemplo: redirigir al dashboard
      // window.location.href = "dashboard.html";
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        showError("El usuario no existe");
      } else if (error.code === "auth/wrong-password") {
        showError("Contraseña incorrecta");
      } else {
        showError("Error: " + error.message);
      }
    });
});

// Funciones para mostrar mensajes
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  successMessage.classList.add("hidden");
  setTimeout(() => {
    errorMessage.classList.add("hidden");
  }, 5000);
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
  setTimeout(() => {
    successMessage.classList.add("hidden");
  }, 5000);
}