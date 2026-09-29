// ==========================================================================
// SOPORTE.JS - MINI BRUNO TECHSUPPORT (FASE 1: TICKETS Y GESTIÓN DE SESIÓN)
// ==========================================================================

import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  signInWithPopup,
  signInWithEmailAndPassword,
  googleProvider
} from "./firebase-init.js";

// Variables globales de estado
let currentUser = null;
let userTickets = [];
let unsubscribeTickets = null;
let currentFilter = "all";
let searchQuery = "";
let authorizedEmails = [];

// Cargar lista de correos autorizados
async function loadAuthorizedEmails() {
  try {
    const res = await fetch("/js/correos_Autorizados.json");
    if (res.ok) {
      const data = await res.json();
      authorizedEmails = (data.autorizados || []).map((e) => e.toLowerCase().trim());
    }
  } catch (e) {
    console.warn("No se pudo cargar correos_Autorizados.json en soporte.js:", e);
  }
}

// Inicialización de librerías visuales
document.addEventListener("DOMContentLoaded", async () => {
  await loadAuthorizedEmails();
  if (window.AOS) {
    window.AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  }
  if (window.feather) {
    window.feather.replace();
  }
  initUIEvents();
});

// ==========================================================================
// 1. GESTIÓN DE SESIÓN CON FIREBASE AUTH
// ==========================================================================

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateHeaderSession(user);
  updateFormSession(user);

  if (user) {
    // Escuchar tickets en tiempo real para el usuario autenticado
    listenToUserTickets(user.uid);
  } else {
    if (unsubscribeTickets) {
      unsubscribeTickets();
      unsubscribeTickets = null;
    }
    userTickets = [];
    renderTickets();
    updateMetrics();
  }
});

function updateHeaderSession(user) {
  const headerContainer = document.getElementById("header-user-status");
  if (!headerContainer) return;

  if (user) {
    const email = (user.email || "").toLowerCase().trim();
    const isAuthorized = authorizedEmails.includes(email);
    const displayName = user.displayName || user.email.split("@")[0];
    const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&size=64`;
    
    headerContainer.innerHTML = `
      <div class="flex items-center space-x-2">
        ${
          isAuthorized
            ? `
          <a href="admin_tickets.html" class="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-tech font-bold transition-all shadow-sm flex items-center space-x-1 border border-blue-400/40 animate-pulse">
            <i data-feather="shield" class="w-3.5 h-3.5 text-cyan-300"></i>
            <span>Panel Staff</span>
          </a>
        `
            : ""
        }
        <div class="flex items-center space-x-2 bg-white/80 border border-blue-200/80 px-2.5 py-1 rounded-full shadow-sm">
          <img src="${avatarUrl}" alt="Avatar" class="w-6 h-6 rounded-full border border-blue-400 object-cover" />
          <div class="text-left hidden lg:block leading-tight">
            <p class="text-xs font-bold text-gray-800 font-tech truncate max-w-[120px]">${displayName}</p>
            <p class="text-[10px] text-blue-600 font-mono truncate max-w-[120px]">${user.email}</p>
          </div>
          <button id="header-logout-btn" title="Cerrar Sesión" class="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors ml-0.5">
            <i data-feather="log-out" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;

    document.getElementById("header-logout-btn")?.addEventListener("click", async () => {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
      }
    });
  } else {
    headerContainer.innerHTML = `
      <button id="header-login-btn" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-tech font-bold shadow-sm transition-colors flex items-center space-x-1.5">
        <i data-feather="user" class="w-3.5 h-3.5"></i>
        <span>Iniciar Sesión</span>
      </button>
    `;
    document.getElementById("header-login-btn")?.addEventListener("click", () => {
      openAuthModal();
    });
  }

  if (window.feather) window.feather.replace();
}

function updateFormSession(user) {
  const banner = document.getElementById("auth-state-banner");
  const nameInput = document.getElementById("ticket-user-name");
  const emailInput = document.getElementById("ticket-user-email");

  if (!banner || !nameInput || !emailInput) return;

  if (user) {
    const email = (user.email || "").toLowerCase().trim();
    const isAuthorized = authorizedEmails.includes(email);
    const displayName = user.displayName || user.email.split("@")[0];
    nameInput.value = displayName;
    emailInput.value = user.email;

    banner.className = "mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3";
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
          <i data-feather="shield-check" class="w-5 h-5"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <p class="text-xs font-bold text-gray-900 font-tech">Sesión Activa Verificada</p>
            ${
              isAuthorized
                ? `<span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full border border-blue-300">Staff Autorizado</span>`
                : ""
            }
          </div>
          <p class="text-xs text-gray-600">Usuario: <strong class="text-blue-700">${displayName}</strong> (${user.email})</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        ${
          isAuthorized
            ? `
          <a href="admin_tickets.html" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-tech font-bold transition-all shadow-sm flex items-center space-x-1.5">
            <i data-feather="sliders" class="w-3.5 h-3.5"></i>
            <span>Ir al Panel Global</span>
          </a>
        `
            : `
          <span class="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
            ● Identidad Protegida
          </span>
        `
        }
      </div>
    `;
  } else {
    nameInput.value = "";
    emailInput.value = "";

    banner.className = "mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3";
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
          <i data-feather="alert-circle" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-xs font-bold text-amber-900 font-tech">Atención: Sesión no iniciada</p>
          <p class="text-xs text-amber-700">Para registrar y dar seguimiento a tus tickets de soporte, inicia sesión con tu cuenta corporativa.</p>
        </div>
      </div>
      <button type="button" id="banner-login-btn" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-tech font-bold shadow-sm transition-colors flex items-center space-x-1.5 flex-shrink-0">
        <i data-feather="log-in" class="w-3.5 h-3.5"></i>
        <span>Ingresar Ahora</span>
      </button>
    `;
    document.getElementById("banner-login-btn")?.addEventListener("click", () => {
      openAuthModal();
    });
  }

  if (window.feather) window.feather.replace();
}

// ==========================================================================
// 2. GENERADOR DE CÓDIGO CORPORATIVO ÚNICO (#TK-YYYY-XXXX)
// ==========================================================================

function generateCorporateTicketCode() {
  const year = new Date().getFullYear();
  // 4 dígitos únicos aleatorios
  const randomSequence = Math.floor(1000 + Math.random() * 9000);
  return `#TK-${year}-${randomSequence}`;
}

// ==========================================================================
// 3. REGISTRO DE TICKET EN FIRESTORE
// ==========================================================================

async function handleTicketSubmit(e) {
  e.preventDefault();

  if (!currentUser) {
    openAuthModal();
    return;
  }

  const deptSelect = document.getElementById("ticket-department");
  const categorySelect = document.getElementById("ticket-category");
  const subjectInput = document.getElementById("ticket-subject");
  const descTextarea = document.getElementById("ticket-description");
  const priorityRadio = document.querySelector('input[name="ticket-priority"]:checked');
  const submitBtn = document.getElementById("submit-ticket-btn");
  const submitText = document.getElementById("submit-btn-text");

  const department = deptSelect.value;
  const category = categorySelect.value;
  const priority = priorityRadio ? priorityRadio.value : "Media";
  const subject = subjectInput.value.trim();
  const description = descTextarea.value.trim();

  if (!department || !category || !subject || !description) {
    alert("Por favor completa todos los campos obligatorios.");
    return;
  }

  // Generar código corporativo único
  const ticketCode = generateCorporateTicketCode();
  const now = new Date().toISOString();

  const ticketPayload = {
    ticketCode,
    userId: currentUser.uid,
    userEmail: currentUser.email,
    userName: currentUser.displayName || currentUser.email.split("@")[0],
    department,
    category,
    priority,
    subject,
    description,
    status: "Abierto",
    createdAt: now,
    updatedAt: now
  };

  try {
    // UI en estado de carga
    submitBtn.disabled = true;
    submitText.innerHTML = `
      <span class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Registrando en Firestore...
      </span>
    `;

    // Inserción en la colección 'tickets' de Firestore
    await addDoc(collection(db, "tickets"), ticketPayload);

    // Limpiar formulario
    subjectInput.value = "";
    descTextarea.value = "";
    deptSelect.selectedIndex = 0;
    categorySelect.selectedIndex = 0;
    document.getElementById("char-counter").textContent = "0 / 4000";

    // Mostrar modal de éxito con el código corporativo generado
    showTicketSuccessModal(ticketPayload);
  } catch (error) {
    console.error("Error al registrar el ticket en Firestore:", error);
    alert("❌ Ocurrió un error al registrar el ticket: " + error.message);
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = "Generar y Registrar Ticket Corporativo";
  }
}

// ==========================================================================
// 4. TIEMPO REAL: ESCUCHAR TICKETS DEL USUARIO (FIRESTORE ONSNAPSHOT)
// ==========================================================================

function listenToUserTickets(userId) {
  if (unsubscribeTickets) {
    unsubscribeTickets();
  }

  const ticketsRef = collection(db, "tickets");
  // Consultamos los tickets creados por el usuario activo
  const q = query(ticketsRef, where("userId", "==", userId));

  unsubscribeTickets = onSnapshot(
    q,
    (snapshot) => {
      userTickets = [];
      snapshot.forEach((docSnap) => {
        userTickets.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Ordenar localmente por fecha de creación descendente
      userTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      updateMetrics();
      renderTickets();
      renderDrawerTickets();
    },
    (error) => {
      console.error("Error en onSnapshot de tickets:", error);
      const container = document.getElementById("tickets-container");
      if (container) {
        container.innerHTML = `
          <div class="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center text-sm font-tech">
            Error al sincronizar con Firestore: ${error.message}
          </div>
        `;
      }
    }
  );
}

function updateMetrics() {
  const total = userTickets.length;
  const abiertos = userTickets.filter((t) => t.status === "Abierto").length;
  const revision = userTickets.filter((t) => t.status === "En revisión").length;
  const resueltos = userTickets.filter((t) => t.status === "Resuelto").length;

  // Actualizar contadores del DOM
  document.getElementById("tabTicketsCount").textContent = total;
  document.getElementById("floating-badge").textContent = total;
  document.getElementById("metric-total").textContent = total;
  document.getElementById("metric-abiertos").textContent = abiertos;
  document.getElementById("metric-revision").textContent = revision;
  document.getElementById("metric-resueltos").textContent = resueltos;

  document.getElementById("count-chip-all").textContent = total;
  document.getElementById("count-chip-abierto").textContent = abiertos;
  document.getElementById("count-chip-revision").textContent = revision;
  document.getElementById("count-chip-resuelto").textContent = resueltos;
}

// ==========================================================================
// 5. RENDERIZADO DE TICKETS CON FILTROS Y ESTILOS
// ==========================================================================

function getFilteredTickets() {
  return userTickets.filter((t) => {
    // Filtro por estatus
    const matchFilter = currentFilter === "all" || t.status === currentFilter;

    // Filtro por búsqueda
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (t.ticketCode && t.ticketCode.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q));

    return matchFilter && matchSearch;
  });
}

function renderTickets() {
  const container = document.getElementById("tickets-container");
  if (!container) return;

  if (!currentUser) {
    container.innerHTML = `
      <div class="text-center py-12 px-4 bg-gray-50/80 rounded-2xl border-2 border-dashed border-gray-300">
        <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
          <i data-feather="lock" class="w-7 h-7"></i>
        </div>
        <h4 class="text-lg font-bold font-tech text-gray-800 mb-1">Inicia Sesión para Ver tus Tickets</h4>
        <p class="text-xs text-gray-500 max-w-md mx-auto mb-4">
          Conéctate con tu cuenta para supervisar el estatus de tus requerimientos técnicos en tiempo real.
        </p>
        <button type="button" class="btn-open-login px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-tech font-bold transition-all shadow-md">
          Iniciar Sesión
        </button>
      </div>
    `;
    container.querySelector(".btn-open-login")?.addEventListener("click", openAuthModal);
    if (window.feather) window.feather.replace();
    return;
  }

  const filtered = getFilteredTickets();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-gray-200">
        <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
          <i data-feather="inbox" class="w-7 h-7"></i>
        </div>
        <h4 class="text-base font-bold font-tech text-gray-700 mb-1">No se encontraron tickets</h4>
        <p class="text-xs text-gray-400 max-w-sm mx-auto mb-4">
          ${userTickets.length === 0 ? "Aún no has generado tickets de soporte. Utiliza la pestaña 'Crear Nuevo Ticket' para registrar tu primer caso." : "No hay tickets que coincidan con los filtros aplicados."}
        </p>
        ${userTickets.length === 0 ? `
          <button type="button" id="btn-create-first-ticket" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-tech font-bold rounded-lg transition-colors">
            Crear Mi Primer Ticket
          </button>
        ` : ""}
      </div>
    `;
    document.getElementById("btn-create-first-ticket")?.addEventListener("click", () => {
      switchTab("create");
    });
    if (window.feather) window.feather.replace();
    return;
  }

  container.innerHTML = filtered
    .map((ticket) => createTicketCardHTML(ticket))
    .join("");

  // Añadir eventos a los botones de detalles y copiado
  container.querySelectorAll(".btn-view-detail").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ticketId = btn.dataset.ticketId;
      const ticket = userTickets.find((t) => t.id === ticketId);
      if (ticket) showTicketDetailModal(ticket);
    });
  });

  container.querySelectorAll(".btn-copy-code").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const code = btn.dataset.code;
      navigator.clipboard.writeText(code);
      btn.innerHTML = `<i data-feather="check" class="w-3.5 h-3.5 text-emerald-600"></i>`;
      if (window.feather) window.feather.replace();
      setTimeout(() => {
        btn.innerHTML = `<i data-feather="copy" class="w-3.5 h-3.5"></i>`;
        if (window.feather) window.feather.replace();
      }, 1500);
    });
  });

  if (window.feather) window.feather.replace();
}

function createTicketCardHTML(ticket) {
  const statusConfig = {
    "Abierto": {
      badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
      dotClass: "bg-sky-500 animate-pulse",
      icon: "activity"
    },
    "En revisión": {
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
      dotClass: "bg-amber-500 animate-ping",
      icon: "clock"
    },
    "Resuelto": {
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      dotClass: "bg-emerald-500",
      icon: "check-circle"
    }
  };

  const priorityColors = {
    "Baja": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Media": "bg-blue-50 text-blue-700 border-blue-200",
    "Alta": "bg-amber-50 text-amber-700 border-amber-200",
    "Crítica": "bg-red-50 text-red-700 border-red-200"
  };

  const cfg = statusConfig[ticket.status] || statusConfig["Abierto"];
  const prioColor = priorityColors[ticket.priority] || priorityColors["Media"];
  const dateFormatted = new Date(ticket.createdAt).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return `
    <div class="ticket-card bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div class="flex items-center space-x-2">
          <span class="font-mono font-bold text-sm text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            ${ticket.ticketCode}
          </span>
          <button type="button" data-code="${ticket.ticketCode}" class="btn-copy-code p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Copiar Código">
            <i data-feather="copy" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Badge de Prioridad -->
          <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${prioColor}">
            ${ticket.priority}
          </span>
          <!-- Badge de Estatus -->
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-tech border ${cfg.badgeClass}">
            <span class="w-1.5 h-1.5 rounded-full ${cfg.dotClass} mr-1.5"></span>
            ${ticket.status}
          </span>
        </div>
      </div>

      <h4 class="font-bold text-gray-900 text-sm mb-1">${escapeHtml(ticket.subject)}</h4>
      <p class="text-xs text-gray-600 mb-3 line-clamp-2">${escapeHtml(ticket.description)}</p>

      <div class="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 text-[11px] text-gray-500 gap-2">
        <div class="flex items-center space-x-3">
          <span class="flex items-center">
            <i data-feather="layers" class="w-3 h-3 mr-1 text-gray-400"></i>
            ${ticket.department}
          </span>
          <span class="hidden sm:inline-block text-gray-300">•</span>
          <span class="flex items-center">
            <i data-feather="calendar" class="w-3 h-3 mr-1 text-gray-400"></i>
            ${dateFormatted}
          </span>
        </div>

        <button type="button" data-ticket-id="${ticket.id}" class="btn-view-detail text-blue-600 hover:text-blue-800 font-tech font-bold text-xs flex items-center space-x-1">
          <span>Ver Detalles</span>
          <i data-feather="chevron-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}

function renderDrawerTickets() {
  const container = document.getElementById("drawer-tickets-list");
  if (!container) return;

  if (!currentUser || userTickets.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 px-4">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
          <i data-feather="inbox" class="w-6 h-6"></i>
        </div>
        <p class="text-xs font-tech text-gray-600 font-bold">Sin tickets activos</p>
        <p class="text-[11px] text-gray-400 mt-1">Tus tickets aparecerán aquí en tiempo real.</p>
      </div>
    `;
    if (window.feather) window.feather.replace();
    return;
  }

  container.innerHTML = userTickets
    .slice(0, 15)
    .map((ticket) => {
      const statusColors = {
        "Abierto": "bg-sky-100 text-sky-800",
        "En revisión": "bg-amber-100 text-amber-800",
        "Resuelto": "bg-emerald-100 text-emerald-800"
      };
      const badge = statusColors[ticket.status] || "bg-gray-100 text-gray-800";
      return `
        <div class="p-3 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-200 transition-colors cursor-pointer drawer-ticket-item" data-ticket-id="${ticket.id}">
          <div class="flex justify-between items-center mb-1">
            <span class="font-mono text-xs font-bold text-blue-900">${ticket.ticketCode}</span>
            <span class="text-[10px] font-bold font-tech px-2 py-0.5 rounded-full ${badge}">${ticket.status}</span>
          </div>
          <p class="text-xs font-semibold text-gray-800 truncate">${escapeHtml(ticket.subject)}</p>
          <div class="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
            <span>${ticket.department}</span>
            <span>${new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".drawer-ticket-item").forEach((item) => {
    item.addEventListener("click", () => {
      const ticketId = item.dataset.ticketId;
      const ticket = userTickets.find((t) => t.id === ticketId);
      if (ticket) {
        closeDrawer();
        showTicketDetailModal(ticket);
      }
    });
  });

  if (window.feather) window.feather.replace();
}

// ==========================================================================
// 6. MODALES Y EVENTOS INTERACTIVOS
// ==========================================================================

function showTicketSuccessModal(ticket) {
  const modal = document.getElementById("ticket-success-modal");
  if (!modal) return;

  document.getElementById("modal-ticket-code").textContent = ticket.ticketCode;
  document.getElementById("modal-ticket-dept").textContent = ticket.department;
  document.getElementById("modal-ticket-priority").textContent = ticket.priority;
  document.getElementById("modal-ticket-subject").textContent = ticket.subject;

  const copyBtn = document.getElementById("copy-code-btn");
  const copyStatus = document.getElementById("copy-status-text");

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(ticket.ticketCode);
    copyStatus.classList.remove("hidden");
    setTimeout(() => {
      copyStatus.classList.add("hidden");
    }, 2000);
  };

  modal.classList.remove("hidden");

  document.getElementById("modal-close-btn").onclick = () => {
    modal.classList.add("hidden");
  };

  document.getElementById("modal-view-tickets-btn").onclick = () => {
    modal.classList.add("hidden");
    switchTab("status");
  };

  if (window.feather) window.feather.replace();
}

function showTicketDetailModal(ticket) {
  const modal = document.getElementById("ticket-detail-modal");
  if (!modal) return;

  document.getElementById("detail-code").textContent = ticket.ticketCode;
  document.getElementById("detail-subject").textContent = ticket.subject;
  document.getElementById("detail-desc").textContent = ticket.description;
  document.getElementById("detail-dept").textContent = ticket.department;
  document.getElementById("detail-category").textContent = ticket.category;
  document.getElementById("detail-priority").textContent = `Prioridad: ${ticket.priority}`;
  document.getElementById("detail-date").textContent = new Date(ticket.createdAt).toLocaleString("es-ES");
  document.getElementById("detail-user").textContent = `${ticket.userName || "Usuario"} (${ticket.userEmail})`;

  // Status Badge
  const statusBadge = document.getElementById("detail-status-badge");
  statusBadge.textContent = ticket.status;
  if (ticket.status === "Abierto") {
    statusBadge.className = "ml-2 inline-block px-3 py-0.5 rounded-full text-xs font-bold font-tech bg-sky-100 text-sky-800 border border-sky-300";
  } else if (ticket.status === "En revisión") {
    statusBadge.className = "ml-2 inline-block px-3 py-0.5 rounded-full text-xs font-bold font-tech bg-amber-100 text-amber-800 border border-amber-300";
  } else {
    statusBadge.className = "ml-2 inline-block px-3 py-0.5 rounded-full text-xs font-bold font-tech bg-emerald-100 text-emerald-800 border border-emerald-300";
  }

  // Actualizar Línea de Tiempo
  const stepAbierto = document.getElementById("step-abierto");
  const stepRevision = document.getElementById("step-revision");
  const stepResuelto = document.getElementById("step-resuelto");
  const line12 = document.getElementById("line-1-2");
  const line23 = document.getElementById("line-2-3");

  // Reset steps
  stepAbierto.className = "w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-1 shadow-md";
  stepRevision.className = "w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold mb-1";
  stepResuelto.className = "w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold mb-1";
  line12.className = "flex-1 h-1 bg-gray-200 mx-2";
  line23.className = "flex-1 h-1 bg-gray-200 mx-2";

  if (ticket.status === "En revisión") {
    stepRevision.className = "w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold mb-1 shadow-md";
    line12.className = "flex-1 h-1 bg-amber-500 mx-2";
  } else if (ticket.status === "Resuelto") {
    stepRevision.className = "w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-1 shadow-md";
    stepResuelto.className = "w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-1 shadow-md";
    line12.className = "flex-1 h-1 bg-emerald-600 mx-2";
    line23.className = "flex-1 h-1 bg-emerald-600 mx-2";
  }

  modal.classList.remove("hidden");

  document.getElementById("close-detail-modal-btn").onclick = () => modal.classList.add("hidden");
  document.getElementById("detail-close-btn-bottom").onclick = () => modal.classList.add("hidden");

  if (window.feather) window.feather.replace();
}

function openAuthModal() {
  const modal = document.getElementById("quick-auth-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeAuthModal() {
  const modal = document.getElementById("quick-auth-modal");
  if (modal) modal.classList.add("hidden");
}

// Drawer lateral
function openDrawer() {
  const drawer = document.getElementById("tickets-drawer");
  const backdrop = document.getElementById("tickets-drawer-backdrop");
  if (drawer && backdrop) {
    backdrop.classList.remove("hidden");
    setTimeout(() => backdrop.classList.remove("opacity-0"), 10);
    drawer.classList.remove("translate-x-full");
  }
}

function closeDrawer() {
  const drawer = document.getElementById("tickets-drawer");
  const backdrop = document.getElementById("tickets-drawer-backdrop");
  if (drawer && backdrop) {
    backdrop.classList.add("opacity-0");
    drawer.classList.add("translate-x-full");
    setTimeout(() => backdrop.classList.add("hidden"), 300);
  }
}

function switchTab(tab) {
  const createBtn = document.getElementById("tab-create-btn");
  const statusBtn = document.getElementById("tab-status-btn");
  const createContent = document.getElementById("tab-create-content");
  const statusContent = document.getElementById("tab-status-content");

  if (tab === "create") {
    createBtn.className = "tab-btn active px-6 py-3 font-tech text-sm font-semibold rounded-t-xl transition-all duration-300 flex items-center space-x-2 border-b-2 border-blue-600 text-blue-600 bg-blue-50/70";
    statusBtn.className = "tab-btn px-6 py-3 font-tech text-sm font-semibold rounded-t-xl transition-all duration-300 flex items-center space-x-2 text-gray-500 hover:text-dark hover:bg-gray-100";
    createContent.classList.remove("hidden");
    statusContent.classList.add("hidden");
  } else {
    statusBtn.className = "tab-btn active px-6 py-3 font-tech text-sm font-semibold rounded-t-xl transition-all duration-300 flex items-center space-x-2 border-b-2 border-blue-600 text-blue-600 bg-blue-50/70";
    createBtn.className = "tab-btn px-6 py-3 font-tech text-sm font-semibold rounded-t-xl transition-all duration-300 flex items-center space-x-2 text-gray-500 hover:text-dark hover:bg-gray-100";
    statusContent.classList.remove("hidden");
    createContent.classList.add("hidden");
  }

  if (window.feather) window.feather.replace();
}

// ==========================================================================
// 7. INICIALIZACIÓN DE EVENTOS DEL DOM
// ==========================================================================

function initUIEvents() {
  // Pestañas
  document.getElementById("tab-create-btn")?.addEventListener("click", () => switchTab("create"));
  document.getElementById("tab-status-btn")?.addEventListener("click", () => switchTab("status"));

  // Formulario
  const form = document.getElementById("native-ticket-form");
  form?.addEventListener("submit", handleTicketSubmit);

  // Contador de caracteres en descripción
  const descTextarea = document.getElementById("ticket-description");
  const charCounter = document.getElementById("char-counter");
  descTextarea?.addEventListener("input", () => {
    const len = descTextarea.value.length;
    charCounter.textContent = `${len} / 4000`;
    if (len > 3800) {
      charCounter.classList.add("text-amber-500");
    } else {
      charCounter.classList.remove("text-amber-500");
    }
  });

  // Selector visual de prioridad
  const priorityCards = document.querySelectorAll(".priority-card");
  priorityCards.forEach((card) => {
    card.addEventListener("click", () => {
      priorityCards.forEach((c) => {
        c.classList.remove("border-blue-500", "bg-blue-50/50");
        c.classList.add("border-gray-200");
      });
      card.classList.remove("border-gray-200");
      card.classList.add("border-blue-500", "bg-blue-50/50");
    });
  });

  // Filtros de estatus en Mis Tickets
  const filterChips = document.querySelectorAll(".filter-chip");
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => {
        c.className = "filter-chip px-3 py-1.5 rounded-lg text-xs font-tech font-semibold bg-gray-100 text-gray-700 hover:bg-blue-50 transition-colors";
      });
      chip.className = "filter-chip active px-3 py-1.5 rounded-lg text-xs font-tech font-bold bg-blue-600 text-white transition-colors";
      currentFilter = chip.dataset.filter;
      renderTickets();
    });
  });

  // Buscador en Mis Tickets
  const searchInput = document.getElementById("tickets-search-input");
  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderTickets();
  });

  // Botón flotante y drawer
  document.getElementById("floating-tickets-btn")?.addEventListener("click", openDrawer);
  document.getElementById("close-drawer-btn")?.addEventListener("click", closeDrawer);
  document.getElementById("tickets-drawer-backdrop")?.addEventListener("click", closeDrawer);
  document.getElementById("drawer-new-ticket-btn")?.addEventListener("click", () => {
    closeDrawer();
    switchTab("create");
    window.scrollTo({ top: 500, behavior: "smooth" });
  });

  // Modal Auth
  document.getElementById("close-auth-modal-btn")?.addEventListener("click", closeAuthModal);
  
  // Login con Google en modal
  document.getElementById("modal-google-login-btn")?.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      closeAuthModal();
    } catch (err) {
      console.error("Error login con Google:", err);
      const errBox = document.getElementById("modal-auth-error");
      if (errBox) {
        errBox.textContent = "Error al autenticar con Google: " + err.message;
        errBox.classList.remove("hidden");
      }
    }
  });

  // Login con Email/Password en modal
  document.getElementById("modal-email-login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("modal-email-input").value;
    const password = document.getElementById("modal-password-input").value;
    const errBox = document.getElementById("modal-auth-error");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      closeAuthModal();
    } catch (err) {
      console.error("Error login con Email:", err);
      if (errBox) {
        errBox.textContent = "Credenciales incorrectas: " + err.message;
        errBox.classList.remove("hidden");
      }
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================================================
// 8. ESCALADO INTELIGENTE: CHAT A TICKET CON 1 CLIC (FASE 4)
// ==========================================================================

function updatePriorityCardsVisual(selectedPrio) {
  document.querySelectorAll(".priority-card").forEach((card) => {
    const input = card.querySelector('input[type="radio"]');
    if (input && input.value === selectedPrio) {
      card.className = "priority-card cursor-pointer border-2 border-blue-500 bg-blue-50/50 rounded-xl p-3 flex flex-col items-center justify-center transition-all";
      input.checked = true;
    } else {
      card.className = "priority-card cursor-pointer border-2 border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center hover:border-blue-300 transition-all";
      if (input) input.checked = false;
    }
  });
}

window.prefillTicketForm = function (ticketData) {
  if (!ticketData) return;

  // 1. Activar pestaña de creación
  switchTab("create");

  // 2. Pre-llenar campos
  const subjectInput = document.getElementById("ticket-subject");
  const deptSelect = document.getElementById("ticket-department");
  const catSelect = document.getElementById("ticket-category");
  const descTextarea = document.getElementById("ticket-description");

  if (subjectInput && ticketData.subject) subjectInput.value = ticketData.subject;
  if (deptSelect && ticketData.department) deptSelect.value = ticketData.department;
  if (catSelect && ticketData.category) catSelect.value = ticketData.category;
  if (descTextarea && ticketData.description) {
    descTextarea.value = ticketData.description;
    const charCounter = document.getElementById("char-counter");
    if (charCounter) charCounter.textContent = `${descTextarea.value.length} / 4000`;
  }

  // 3. Seleccionar prioridad
  if (ticketData.priority) {
    updatePriorityCardsVisual(ticketData.priority);
  }

  // 4. Mostrar banner de notificación de importación
  const banner = document.getElementById("ticket-prefill-notification");
  if (banner) {
    banner.classList.remove("hidden");
    document.getElementById("dismiss-prefill-btn")?.addEventListener("click", () => {
      banner.classList.add("hidden");
    });
  }

  // 5. Scroll suave al formulario con efecto de resplandor
  const targetCard = document.getElementById("tab-create-content");
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: "smooth", block: "start" });
    targetCard.classList.add("ring-4", "ring-cyan-400", "ring-offset-4");
    setTimeout(() => {
      targetCard.classList.remove("ring-4", "ring-cyan-400", "ring-offset-4");
    }, 3000);
  }
};

window.submitTicketDirectly = async function (ticketData) {
  if (!currentUser) {
    // Si no está autenticado, almacenar en sesión y abrir modal
    sessionStorage.setItem("mini_bruno_pending_ticket", JSON.stringify(ticketData));
    openAuthModal();
    return { success: false, requireAuth: true };
  }

  try {
    const ticketCode = generateCorporateTicketCode();
    const newDoc = {
      ticketCode,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.displayName || currentUser.email.split("@")[0],
      department: ticketData.department || "Sistemas / TI",
      category: ticketData.category || "Incidencia Técnica",
      priority: ticketData.priority || "Alta",
      subject: ticketData.subject || "Incidencia técnica reportada en chat",
      description: ticketData.description || "Reporte generado directamente desde el Asistente Virtual BrunoBot.",
      status: "Abierto",
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "tickets"), newDoc);
    console.log("[Direct Ticket] Creado con ID:", docRef.id, "Código:", ticketCode);
    return { success: true, ticketCode };
  } catch (err) {
    console.error("[Direct Ticket Error]:", err);
    return { success: false, error: err.message };
  }
};

// Escucha de tickets pendientes importados entre páginas
window.addEventListener("DOMContentLoaded", () => {
  const pending = sessionStorage.getItem("mini_bruno_pending_ticket");
  if (pending) {
    try {
      const data = JSON.parse(pending);
      sessionStorage.removeItem("mini_bruno_pending_ticket");
      setTimeout(() => {
        window.prefillTicketForm(data);
      }, 600);
    } catch (e) {
      console.warn("Error leyendo ticket pendiente:", e);
    }
  }
});

