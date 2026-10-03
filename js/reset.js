import { auth } from "./firebase-init.js";
import { sendPasswordResetEmail } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const form = document.getElementById("resetForm");
const errorDiv = document.getElementById("errorMessage");
const successDiv = document.getElementById("successMessage");

function showError(msg) {
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove("hidden");
    if (successDiv) successDiv.classList.add("hidden");
  }
}

function showSuccess(msg) {
  if (successDiv) {
    successDiv.textContent = msg;
    successDiv.classList.remove("hidden");
    if (errorDiv) errorDiv.classList.add("hidden");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim().toLowerCase();

  try {
    await sendPasswordResetEmail(auth, email);
    showSuccess("✅ Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      showError("❌ No existe un usuario con ese correo.");
    } else if (error.code === "auth/invalid-email") {
      showError("❌ El correo no es válido.");
    } else {
      showError("❌ Error: " + error.message);
    }
  }
});