import { auth } from "./firebase-init.js";
import { sendPasswordResetEmail } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const form = document.getElementById("resetForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim().toLowerCase();

  try {
    await sendPasswordResetEmail(auth, email);
    alert("✅ Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      alert("❌ No existe un usuario con ese correo.");
    } else if (error.code === "auth/invalid-email") {
      alert("❌ El correo no es válido.");
    } else {
      alert("❌ Error: " + error.message);
    }
  }
});