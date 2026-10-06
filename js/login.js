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
import { getUserRole, ROLES, getRoleBadgeInfo, clearRoleCache } from './auth-roles.js';

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

// Manejar estado de autenticación con RBAC
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Validar autorización del usuario
    const role = await getUserRole(user.email);

    if (role === ROLES.DENEGADO) {
      console.warn("Usuario denegado intentando sesión:", user.email);
      showError(`Acceso Denegado: La cuenta ${user.email} no está autorizada en el sistema.`);
      clearRoleCache(); // <-- Limpia la caché inmediatamente
      await signOut(auth);
      return;
    }

    sessionStorage.setItem('mb_user_role', role);
    const badge = getRoleBadgeInfo(role);

    if (authSection) authSection.classList.add('hidden');
    if (userSection) {
      userSection.classList.remove('hidden');
      // Mostrar info del usuario con su rol corporativo
      if (userInfoDiv) {
        userInfoDiv.innerHTML = `
          <div class="flex flex-col items-center">
            <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email)}" alt="Profile" class="w-16 h-16 rounded-full mb-3 border-2 border-blue-500 shadow-lg glow-active">
            <p class="text-white font-medium text-lg font-tech">${user.displayName || 'Usuario'}</p>
            <p class="text-gray-400 text-sm mb-3">${user.email}</p>
            <span class="px-3 py-1 text-xs font-tech font-bold uppercase rounded-full border ${badge.cssClass}">
              ${badge.label}
            </span>
          </div>
        `;
      }
    }
  } else {
    // Usuario no logueado
    sessionStorage.removeItem('mb_user_role');
    if (authSection) authSection.classList.remove('hidden');
    if (userSection) userSection.classList.add('hidden');
  }
});

// Login con Email/Password
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim().toLowerCase();
    const password = loginForm.password.value;

    setButtonLoading(submitBtn, true, 'Autenticando...');

    try {
      // Autenticar primero directamente en Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar el rol una vez que la sesión está activa
      const role = await getUserRole(user.email);
      if (role === ROLES.DENEGADO) {
        showError("Tu correo no figura en las listas autorizadas de Mini Bruno.");
        await signOut(auth);
        return;
      }

      const badge = getRoleBadgeInfo(role);
      showSuccess(`¡Inicio de sesión exitoso! (${badge.label})`);
    } catch (error) {
      console.error(error);
      let msg = "Error al iniciar sesión.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        msg = "Credenciales incorrectas.";
      } else if (error.code === 'auth/user-not-found') {
        msg = "Usuario no encontrado.";
      }
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
      const role = await getUserRole(user.email);

      if (role === ROLES.DENEGADO) {
        showError(`Acceso Denegado: La cuenta ${user.email} no está autorizada en el sistema corporativo.`);
        await signOut(auth);
        return;
      }

      const badge = getRoleBadgeInfo(role);
      showSuccess(`¡Bienvenido, ${user.displayName}! (${badge.label})`);
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
      clearRoleCache(); // <-- Limpia las variables globales en memoria y sessionStorage
      await signOut(auth);
      showSuccess('Sesión cerrada correctamente.');
    } catch (error) {
      console.error("Error logout:", error);
      showError("Error al cerrar sesión.");
    }
  });
}