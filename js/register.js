import { auth, db, googleProvider } from "./firebase-init.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, getDoc } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Valida si un correo está autorizado en Firestore
 */
async function validarCorreo(email) {
  const docRef = doc(db, "config", "correos_autorizados");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    alert("Error: No se encontró la lista de correos autorizados en Firestore.");
    return false;
  }

  const correosAutorizados = docSnap.data().autorizados || [];
  return correosAutorizados.includes(email);
}

/**
 * Registro con email y contraseña
 */
export async function registrarUsuario(nombre, email, password) {
  try {
    email = email.toLowerCase().trim();

    // Validar lista de correos autorizados
    const autorizado = await validarCorreo(email);
    if (!autorizado) {
      alert("Error: El correo no está autorizado para registrarse.");
      return;
    }

    // Crear usuario en Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar perfil en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nombre,
      email: user.email,
      creadoEn: new Date(),
      rol: "usuario"
    });

    alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Error: Este correo ya está registrado.");
    } else if (error.code === "auth/weak-password") {
      alert("Error: La contraseña es demasiado débil.");
    } else {
      alert("Error: " + error.message);
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

    // Validar lista de correos autorizados
    const autorizado = await validarCorreo(user.email);
    if (!autorizado) {
      alert("Error: El correo no está autorizado para registrarse.");
      await signOut(auth);
      return;
    }

    // Verificar si ya existe perfil en Firestore
    const userDoc = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(userDoc);

    if (!docSnap.exists()) {
      // Crear perfil nuevo en Firestore
      await setDoc(userDoc, {
        nombre: user.displayName || "",
        email: user.email,
        foto: user.photoURL || "",
        creadoEn: new Date(),
        rol: "usuario"
      });
    }

    alert("✅ Inicio de sesión con Google exitoso.");
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user") {
      alert("El popup de Google se cerró antes de completar el inicio de sesión.");
    } else {
      alert("Error al iniciar sesión con Google: " + error.message);
    }
  }
}

// Archivo principal de registro
// Capturar formulario
const form = document.getElementById("registerForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await registrarUsuario(nombre, email, password);
});

// Botón Google
const googleBtn = document.getElementById("googleBtn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    await registrarConGoogle();
  });
}