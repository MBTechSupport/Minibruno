  import { auth } from "./firebase-init.js";
  import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

  // Espera al primer estado real de Auth y actúa
  const authReady = new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub(); // solo necesitamos el primer evento
      resolve(user);
    });
  });

  window.addEventListener("DOMContentLoaded", async () => {
    try {
      const user = await authReady;
      // Si no hay usuario, redirige (ruta relativa para Netlify)
      if (!user) {
        // Evita que el usuario regrese con “atrás”
        location.replace("not_log.html");
      }
    } catch (e) {
      // Si algo falla, como fallback, también bloquea
      location.replace("not_log.html");
    }
  });