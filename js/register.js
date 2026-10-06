import { auth, db, googleProvider } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  initPasswordToggle,
  initPasswordStrength,
  showFloatingToast,
  setButtonLoading
} from "./auth-ui.js";
import { getUserRole, ROLES, getRoleBadgeInfo } from "./auth-roles.js";

// Inicializar mejoras UX/UI Fase 3
initPasswordToggle("password", "togglePasswordBtn");
initPasswordStrength("password", "passwordStrengthContainer");

const submitBtn = document.getElementById("submit-btn");
const googleBtn = document.getElementById("googleBtn");

// Funciones auxiliares UI
function showError(msg) {
  showFloatingToast(msg, "error", 4000);
  const errDiv = document.getElementById("error-message");
  if (errDiv) {
    errDiv.textContent = msg;
    errDiv.style.display = "block";
    errDiv.classList.remove("hidden");
    setTimeout(() => {
      errDiv.classList.add("hidden");
      errDiv.style.display = "none";
    }, 4000);
  }
}

function showSuccess(msg) {
  showFloatingToast(msg, "success", 3500);
  const succDiv = document.getElementById("success-message");
  if (succDiv) {
    succDiv.textContent = msg;
    succDiv.style.display = "block";
    succDiv.classList.remove("hidden");
    setTimeout(() => {
      succDiv.classList.add("hidden");
      succDiv.style.display = "none";
    }, 3500);
  }
}

/**
 * Valida si un correo está autorizado (como ADMIN o EMPLEADO)
 */
async function validarCorreo(email) {
  const role = await getUserRole(email);
  return role !== ROLES.DENEGADO;
}

/**
 * Registro con email y contraseña
 */
export async function registrarUsuario(nombre, email, password) {
  let userCredential = null;
  try {
    email = email.toLowerCase().trim();

    // 1. Validar autorización en listas corporativas ANTES de crear nada en Auth
    const role = await getUserRole(email);
    if (role === ROLES.DENEGADO) {
      showError("El correo no está autorizado en las listas corporativas de Mini Bruno.");
      return;
    }

    // 2. Crear usuario en Firebase Authentication
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 3. Determinar rol y guardar en Firestore
    const rolString = role === ROLES.ADMIN ? "admin" : "empleado";
    await setDoc(doc(db, "usuarios", user.uid), {
      nombre,
      email: user.email,
      creadoEn: new Date(),
      rol: rolString
    });

    const badge = getRoleBadgeInfo(role);
    showSuccess(`¡Registro exitoso como ${badge.label}! Redirigiendo...`);

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);

  } catch (error) {
    console.error("Error durante el registro:", error);

    // ROLLBACK: Si la cuenta de Auth se creó pero falló la creación en Firestore, limpiamos la cuenta
    if (userCredential && userCredential.user) {
      try {
        await userCredential.user.delete();
        console.warn("Se revirtió la creación de usuario en Auth debido a un fallo en Firestore.");
      } catch (deleteError) {
        console.error("No se pudo limpiar la cuenta de Auth tras fallo:", deleteError);
      }
    }

    // Mensajes amigables de error
    if (error.code === "auth/email-already-in-use") {
      showError("Ese correo ya está registrado en nuestra base de datos.");
    } else if (error.code === "auth/weak-password") {
      showError("Error: La contraseña es demasiado débil (mínimo 6 caracteres).");
    } else {
      showError("Error al completar el registro: " + error.message);
    }
  }
}

/**
 * Registro/Login con Google
 */
export async function registrarConGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Validar rol corporativo
    const role = await getUserRole(user.email);
    if (role === ROLES.DENEGADO) {
      showError("Tu cuenta de Google no está autorizada en el sistema corporativo Mini Bruno.");
      await signOut(auth);
      return;
    }

    // Verificar si ya existe perfil en Firestore
    const userDoc = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(userDoc);

    const rolString = role === ROLES.ADMIN ? "admin" : "empleado";
    if (!docSnap.exists()) {
      await setDoc(userDoc, {
        nombre: user.displayName || "",
        email: user.email.toLowerCase().trim(),
        foto: user.photoURL || "",
        creadoEn: new Date(),
        rol: rolString
      });
    }

    const badge = getRoleBadgeInfo(role);
    showSuccess(`¡Bienvenido ${user.displayName || ""} (${badge.label})!`);
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);

  } catch (error) {
    if (error.code === "auth/popup-closed-by-user") {
      console.warn("Inicio de sesión con Google cancelado por el usuario.");
    } else {
      showError("Error Google: " + error.message);
    }
  }
}

// Archivo principal de registro
// Capturar formulario
const form = document.getElementById("registerForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    setButtonLoading(submitBtn, true, "Registrando usuario...");
    try {
      await registrarUsuario(nombre, email, password);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// Botón Google
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    setButtonLoading(googleBtn, true, "Conectando...");
    try {
      await registrarConGoogle();
    } finally {
      setButtonLoading(googleBtn, false);
    }
  });
}