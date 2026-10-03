// Importar las funciones necesarias de Firebase desde los SDKs
import { auth } from './firebase-init.js';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initPasswordToggle, showFloatingToast, setButtonLoading } from './auth-ui.js';

// Inicializar 3.1 Toggle de contraseña
initPasswordToggle('password', 'togglePasswordBtn');

// Elementos del DOM
const loginForm = document.getElementById('login-form');
const submitBtn = document.getElementById('submit-btn');
const googleLoginBtn = document.getElementById('login-btn');
const authSection = document.getElementById('auth-section');
const userSection = document.getElementById('user-section');
const userInfoDiv = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');
const errorMessageDiv = document.getElementById('error-message');
const successMessageDiv = document.getElementById('success-message');

// Función para mostrar errores de forma armoniosa
function showError(message) {
  showFloatingToast(message, 'error', 4000);
  if (errorMessageDiv) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
    errorMessageDiv.style.display = 'block';
    setTimeout(() => {
      errorMessageDiv.classList.add('hidden');
      errorMessageDiv.style.display = 'none';
    }, 4000);
  }
}

// Función para mostrar éxito
function showSuccess(message) {
  showFloatingToast(message, 'success', 3500);
  if (successMessageDiv) {
    successMessageDiv.textContent = message;
    successMessageDiv.classList.remove('hidden');
    successMessageDiv.style.display = 'block';
    setTimeout(() => {
      successMessageDiv.classList.add('hidden');
      successMessageDiv.style.display = 'none';
    }, 3500);
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

    setButtonLoading(submitBtn, true, 'Autenticando...');

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
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// Login con Google
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', async () => {
    console.log("Iniciando login con Google...");
    const provider = new GoogleAuthProvider();
    setButtonLoading(googleLoginBtn, true, 'Conectando con Google...');

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      showSuccess(`¡Bienvenido, ${user.displayName}!`);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn("Inicio de sesión con Google cancelado por el usuario.");
        return;
      }
      console.error("Error Google Login:", error);
      showError("No se pudo iniciar sesión con Google. Intenta nuevamente.");
    } finally {
      setButtonLoading(googleLoginBtn, false);
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