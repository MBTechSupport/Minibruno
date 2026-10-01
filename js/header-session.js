/**
 * ==========================================================================
 * HEADER SESSION MANAGER - Mini Bruno TechSupport
 * Sincronización transversal del estado de autenticación en la barra superior
 * ==========================================================================
 */

import { auth, signOut } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Lista de correos autorizados por defecto como fallback seguro
const DEFAULT_AUTHORIZED_EMAILS = [
  "lruiz@minibruno.com",
  "lguevara@minibruno.com",
  "mrodriguez@minibruno.com",
  "jnanez@minibruno.com",
  "dnavarro@minibruno.com",
  "darwin.navarro@minibruno.com",
  "bmontilla@minibruno.com",
  "alves.neri@minibruno.com",
  "jruiz@minibruno.com",
  "rcoronado@minibruno.com",
  "ruca.luijo@gmail.com"
];

let authorizedEmails = [...DEFAULT_AUTHORIZED_EMAILS];

// Cargar correos autorizados desde el archivo JSON corporativo
async function loadAuthorizedEmails() {
  try {
    const res = await fetch("js/correos_Autorizados.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.autorizados)) {
        authorizedEmails = data.autorizados.map((e) => e.toLowerCase().trim());
      }
    }
  } catch (err) {
    console.warn("HeaderSession: Usando lista autorizada de contingencia:", err);
  }
}

// Renderizar el estado de sesión del usuario en el Header
function renderHeaderUserStatus(user) {
  const desktopContainer = document.getElementById("header-user-status");
  const mobileContainer = document.getElementById("mobile-user-status");
  const legacyUserInfo = document.getElementById("userInfo");

  // Si existe el legacy #userInfo (en index_log antiguo), lo ocultamos o vaciamos
  if (legacyUserInfo) {
    legacyUserInfo.style.display = "none";
  }

  if (user) {
    const email = (user.email || "").toLowerCase().trim();
    const isAuthorized = authorizedEmails.includes(email);
    const displayName = user.displayName || user.email.split("@")[0];
    const avatarUrl =
      user.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&size=64`;

    const desktopHtml = `
      <div class="flex items-center space-x-2">
        ${
          isAuthorized
            ? `
          <a href="admin_tickets.html" class="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-tech font-bold transition-all shadow-sm flex items-center space-x-1 border border-blue-400/40 animate-pulse" title="Panel de Administración Global Staff">
            <i data-feather="shield" class="w-3.5 h-3.5 text-cyan-300"></i>
            <span>Panel Staff</span>
          </a>
        `
            : ""
        }
        <div class="flex items-center space-x-2 bg-white/90 border border-blue-200/80 px-2.5 py-1 rounded-full shadow-sm">
          <img src="${avatarUrl}" alt="Avatar" class="w-6 h-6 rounded-full border border-blue-400 object-cover" />
          <div class="text-left hidden lg:block leading-tight">
            <p class="text-xs font-bold text-gray-800 font-tech truncate max-w-[120px]">${displayName}</p>
            <p class="text-[10px] text-blue-600 font-mono truncate max-w-[120px]">${user.email}</p>
          </div>
          <button id="header-logout-btn" title="Cerrar Sesión" class="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors ml-0.5" aria-label="Cerrar Sesión">
            <i data-feather="log-out" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;

    const mobileHtml = `
      <div class="p-3 bg-blue-50/80 rounded-xl border border-blue-200/60 mt-2">
        <div class="flex items-center space-x-3 mb-2">
          <img src="${avatarUrl}" alt="Avatar" class="w-9 h-9 rounded-full border-2 border-blue-500 object-cover" />
          <div class="overflow-hidden">
            <p class="text-xs font-bold text-gray-800 font-tech truncate">${displayName}</p>
            <p class="text-[11px] text-blue-600 font-mono truncate">${user.email}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-blue-100">
          ${
            isAuthorized
              ? `
            <a href="admin_tickets.html" class="flex-1 py-1.5 px-2 bg-blue-600 text-white rounded-lg text-xs font-tech font-bold text-center flex items-center justify-center space-x-1">
              <i data-feather="shield" class="w-3 h-3 text-cyan-200"></i>
              <span>Panel Staff</span>
            </a>
          `
              : ""
          }
          <button id="mobile-logout-btn" class="flex-1 py-1.5 px-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-tech font-bold text-center flex items-center justify-center space-x-1 transition-colors">
            <i data-feather="log-out" class="w-3 h-3"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    `;

    if (desktopContainer) desktopContainer.innerHTML = desktopHtml;
    if (mobileContainer) mobileContainer.innerHTML = mobileHtml;

    // Vincular botones de desconexión
    const handleLogout = async () => {
      try {
        await signOut(auth);
        window.location.href = "login.html";
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
      }
    };

    document.getElementById("header-logout-btn")?.addEventListener("click", handleLogout);
    document.getElementById("mobile-logout-btn")?.addEventListener("click", handleLogout);

  } else {
    // Usuario no conectado
    const notLoggedDesktopHtml = `
      <a href="login.html" id="header-login-btn" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-tech font-bold shadow-sm transition-colors flex items-center space-x-1.5" title="Iniciar Sesión">
        <i data-feather="user" class="w-3.5 h-3.5"></i>
        <span>Iniciar Sesión</span>
      </a>
    `;

    const notLoggedMobileHtml = `
      <div class="mt-3 pt-3 border-t border-gray-200">
        <a href="login.html" class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-tech font-bold shadow-md transition-colors flex items-center justify-center space-x-2">
          <i data-feather="user" class="w-4 h-4"></i>
          <span>Iniciar Sesión</span>
        </a>
      </div>
    `;

    if (desktopContainer) desktopContainer.innerHTML = notLoggedDesktopHtml;
    if (mobileContainer) mobileContainer.innerHTML = notLoggedMobileHtml;
  }

  // Refrescar iconos Feather
  if (window.feather) {
    window.feather.replace();
  }
}

// Inicializar el escuchador de estado de sesión
async function initHeaderSession() {
  await loadAuthorizedEmails();

  onAuthStateChanged(auth, (user) => {
    renderHeaderUserStatus(user);
  });

  // Configurar toggle del menú móvil si existe
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

// Auto-inicialización al cargar el DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeaderSession);
} else {
  initHeaderSession();
}
