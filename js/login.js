// Importar las funciones necesarias de Firebase desde los SDKs
import { auth } from './firebase-init.js';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Elementos del DOM
const loginForm = document.getElementById('login-form');
const googleLoginBtn = document.getElementById('login-btn');
const authSection = document.getElementById('auth-section');
const userSection = document.getElementById('user-section');
const userInfoDiv = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');
const errorMessageDiv = document.getElementById('error-message');
const successMessageDiv = document.getElementById('success-message');

// Función para mostrar errores con Timeout de 2 segundos
function showError(message) {
  if (errorMessageDiv) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
    errorMessageDiv.style.display = 'block';
    setTimeout(() => {
      errorMessageDiv.classList.add('hidden');
      errorMessageDiv.style.display = 'none';
    }, 2000);
  } else {
    console.error(message);
  }
}

// Función para mostrar éxito con Timeout de 2 segundos
function showSuccess(message) {
  if (successMessageDiv) {
    successMessageDiv.textContent = message;
    successMessageDiv.classList.remove('hidden');
    successMessageDiv.style.display = 'block';
    setTimeout(() => {
      successMessageDiv.classList.add('hidden');
      successMessageDiv.style.display = 'none';
    }, 2000);
  } else {
    console.log(message);
  }
}

// Manejar estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuario logueado
    console.log("Usuario autenticado:", user.email);

    if (authSection) authSection.classList.add('hidden');
    if (userSection) {
      userSection.classList.remove('hidden');
      // Mostrar info del usuario
      if (userInfoDiv) {
        userInfoDiv.innerHTML = `
                    <div class="flex flex-col items-center">
                        <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + user.email}" alt="Profile" class="w-16 h-16 rounded-full mb-4 border-2 border-blue-500 shadow-lg glow-active">
                        <p class="text-white font-medium text-lg">${user.displayName || 'Usuario'}</p>
                        <p class="text-gray-400 text-sm">${user.email}</p>
                    </div>
                `;
      }
    }
  } else {
    // Usuario no logueado
    console.log("No hay usuario autenticado");
    if (authSection) authSection.classList.remove('hidden');
    if (userSection) userSection.classList.add('hidden');
  }
});

// Login con Email/Password
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess('¡Inicio de sesión exitoso!');
      // La redirección o cambio de UI lo maneja onAuthStateChanged
    } catch (error) {
      console.error(error);
      let msg = "Error al iniciar sesión.";
      if (error.code === 'auth/invalid-credential') msg = "Credenciales incorrectas.";
      else if (error.code === 'auth/user-not-found') msg = "Usuario no encontrado.";
      else if (error.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
      showError(msg);
    }
  });
}

// Login con Google
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', async () => {
    console.log("Iniciando login con Google...");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      showSuccess(`¡Bienvenido, ${user.displayName}!`);
    } catch (error) {
      console.error("Error Google Login:", error);
      showError("No se pudo iniciar sesión con Google. Intenta nuevamente.");
    }
  });
}

// Cerrar Sesión
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showSuccess('Sesión cerrada correctamente.');
    } catch (error) {
      console.error("Error logout:", error);
      showError("Error al cerrar sesión.");
    }
  });
}