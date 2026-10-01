// ==========================================================================
// ADMIN_TICKETS.JS - PANEL DE ADMINISTRACIÓN GLOBAL MINI BRUNO (FASE 2)
// ==========================================================================

import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot
} from "./firebase-init.js";

// Variables globales del panel de administración
let globalTickets = [];
let authorizedEmails = [];
let currentAdminUser = null;
let unsubscribeGlobalTickets = null;
let activeTicketForModal = null;
let ticketToDelete = null;
let toastTimeout = null;

// Filtros
let filterStatus = "all";
let filterDept = "all";
let filterPrio = "all";
let searchKeyword = "";

document.addEventListener("DOMContentLoaded", async () => {
  if (window.AOS) window.AOS.init();
  if (window.feather) window.feather.replace();

  // 1. Cargar lista de correos autorizados
  await loadAuthorizedEmails();

  // 2. Escuchar sesión de usuario y validar permisos
  initAuthObserver();

  // 3. Inicializar eventos de UI
  initAdminEvents();
});

// ==========================================================================
// 1. CARGA DE CONFIGURACIÓN DE CORREOS AUTORIZADOS
// ==========================================================================
async function loadAuthorizedEmails() {
  try {
    const res = await fetch("/js/correos_Autorizados.json");
    if (res.ok) {
      const data = await res.json();
      authorizedEmails = (data.autorizados || []).map((e) => e.toLowerCase().trim());
      console.log(`[Admin Security] ${authorizedEmails.length} correos autorizados cargados.`);
    } else {
      console.warn("No se pudo cargar correos_Autorizados.json, usando lista fallback.");
      authorizedEmails = [
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
    }
  } catch (err) {
    console.error("Error al cargar correos autorizados:", err);
  }
}

// ==========================================================================
// 2. OBSERVADOR DE AUTENTICACIÓN Y VALIDACIÓN DE PERMISOS (GATEWAY)
// ==========================================================================
function initAuthObserver() {
  const loadingScreen = document.getElementById("auth-loading-screen");
  const deniedScreen = document.getElementById("access-denied-screen");
  const mainPanel = document.getElementById("admin-main-panel");
  const deniedEmailSpan = document.getElementById("denied-user-email");

  onAuthStateChanged(auth, (user) => {
    loadingScreen.classList.add("hidden");

    if (!user) {
      // No hay sesión activa: Redirigir a login o mostrar pantalla de acceso denegado
      currentAdminUser = null;
      deniedEmailSpan.textContent = "No autenticado (Sesión Anónima)";
      deniedScreen.classList.remove("hidden");
      mainPanel.classList.add("hidden");
      return;
    }

    const email = (user.email || "").toLowerCase().trim();
    const isAuthorized = authorizedEmails.includes(email);

    if (!isAuthorized) {
      // Usuario autenticado pero NO está en correos_Autorizados.json
      currentAdminUser = null;
      deniedEmailSpan.textContent = user.email;
      deniedScreen.classList.remove("hidden");
      mainPanel.classList.add("hidden");
      console.warn(`[Security Alert] Acceso bloqueado para usuario no autorizado: ${user.email}`);
    } else {
      // Usuario AUTORIZADO: Desbloquear Panel Global
      currentAdminUser = user;
      deniedScreen.classList.add("hidden");
      mainPanel.classList.remove("hidden");

      setTimeout(() => {
        if (window.AOS) {
          window.AOS.init({
            duration: 800,
            easing: "ease-out-cubic",
            once: false,
            offset: 80
          });
          window.AOS.refreshHard();
        }
      }, 120);

      // Poblar perfil del administrador en la barra superior
      const displayName = user.displayName || user.email.split("@")[0];
      const avatarUrl =
        user.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0284c7&color=fff&size=64`;

      document.getElementById("admin-avatar").src = avatarUrl;
      document.getElementById("admin-name").textContent = displayName;
      document.getElementById("admin-email").textContent = user.email;

      // Iniciar listener en tiempo real de todos los tickets
      subscribeToAllTickets();
    }

    if (window.feather) window.feather.replace();
  });
}

// ==========================================================================
// 3. TIEMPO REAL: ESCUCHAR TODOS LOS TICKETS (FIRESTORE ONSNAPSHOT)
// ==========================================================================
function subscribeToAllTickets() {
  if (unsubscribeGlobalTickets) {
    unsubscribeGlobalTickets();
  }

  const ticketsRef = collection(db, "tickets");

  unsubscribeGlobalTickets = onSnapshot(
    ticketsRef,
    (snapshot) => {
      globalTickets = [];
      snapshot.forEach((docSnap) => {
        globalTickets.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Ordenar por fecha descendente
      globalTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      updateAdminMetrics();
      renderAdminTicketsTable();
    },
    (error) => {
      console.error("[Firestore Error] Error al leer tickets globales:", error);
      const tbody = document.getElementById("admin-tickets-tbody");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center py-8 text-red-600 font-tech">
              Error al consultar Firestore: ${error.message}
            </td>
          </tr>
        `;
      }
    }
  );
}

// ==========================================================================
// 4. ACTUALIZACIÓN DE MÉTRICAS GLOBALES
// ==========================================================================
function updateAdminMetrics() {
  const total = globalTickets.length;
  const abiertos = globalTickets.filter((t) => t.status === "Abierto").length;
  const revision = globalTickets.filter((t) => t.status === "En revisión").length;
  const resueltos = globalTickets.filter((t) => t.status === "Resuelto").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-abiertos").textContent = abiertos;
  document.getElementById("stat-revision").textContent = revision;
  document.getElementById("stat-resueltos").textContent = resueltos;
}

// ==========================================================================
// 5. RENDERIZADO DE TABLA CON FILTROS Y CONTROLES DE ACCIÓN RÁPIDA
// ==========================================================================
function getFilteredTickets() {
  return globalTickets.filter((t) => {
    // Estatus
    const matchStatus = filterStatus === "all" || t.status === filterStatus;

    // Departamento
    const matchDept = filterDept === "all" || t.department === filterDept;

    // Prioridad
    const matchPrio = filterPrio === "all" || t.priority === filterPrio;

    // Búsqueda
    const q = searchKeyword.toLowerCase();
    const matchSearch =
      !q ||
      (t.ticketCode && t.ticketCode.toLowerCase().includes(q)) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(q)) ||
      (t.userName && t.userName.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q));

    return matchStatus && matchDept && matchPrio && matchSearch;
  });
}

function renderAdminTicketsTable() {
  const tbody = document.getElementById("admin-tickets-tbody");
  const filteredCountEl = document.getElementById("filtered-count");
  if (!tbody) return;

  const filtered = getFilteredTickets();
  filteredCountEl.textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-12 text-slate-400">
          <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
            <i data-feather="inbox" class="w-6 h-6"></i>
          </div>
          <p class="font-tech text-sm font-bold text-slate-700">No se encontraron tickets</p>
          <p class="text-xs text-slate-400 mt-1">Intenta ajustando los filtros de búsqueda o departamento.</p>
        </td>
      </tr>
    `;
    if (window.feather) window.feather.replace();
    return;
  }

  tbody.innerHTML = filtered
    .map((t) => {
      const priorityColors = {
        "Baja": "bg-emerald-50 text-emerald-700 border-emerald-200",
        "Media": "bg-blue-50 text-blue-700 border-blue-200",
        "Alta": "bg-amber-50 text-amber-700 border-amber-200",
        "Crítica": "bg-red-100 text-red-800 border-red-300 font-black animate-pulse"
      };

      const prioClass = priorityColors[t.priority] || priorityColors["Media"];
      let dateStr = "--";
      try {
        const d = t.createdAt?.toDate ? t.createdAt.toDate() : (t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000) : new Date(t.createdAt));
        if (d && !isNaN(d.getTime())) {
          dateStr = d.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          });
        }
      } catch (e) {
        dateStr = String(t.createdAt || "--");
      }

      return `
        <tr class="hover:bg-blue-50/40 transition-colors border-b border-slate-100">
          <!-- Código -->
          <td class="py-3 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
            <span class="bg-blue-50 border border-blue-200 px-2 py-1 rounded text-xs">
              ${t.ticketCode || "--"}
            </span>
          </td>

          <!-- Solicitante -->
          <td class="py-3 px-4">
            <div class="leading-tight">
              <span class="font-bold text-slate-800 block truncate max-w-[140px]">${escapeHtml(t.userName || "Colaborador")}</span>
              <span class="text-[11px] text-slate-500 font-mono block truncate max-w-[160px]">${escapeHtml(t.userEmail)}</span>
            </div>
          </td>

          <!-- Área / Categoría -->
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="font-medium text-slate-700 block">${t.department || "General"}</span>
            <span class="text-[10px] text-slate-400 block">${t.category || "--"}</span>
          </td>

          <!-- Asunto -->
          <td class="py-3 px-4 max-w-xs">
            <p class="font-semibold text-slate-800 truncate" title="${escapeHtml(t.subject)}">
              ${escapeHtml(t.subject)}
            </p>
            <p class="text-[11px] text-slate-500 truncate" title="${escapeHtml(t.description)}">
              ${escapeHtml(t.description)}
            </p>
          </td>

          <!-- Prioridad -->
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${prioClass}">
              ${t.priority}
            </span>
          </td>

          <!-- Fecha -->
          <td class="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
            ${dateStr}
          </td>

          <!-- Selector de Estatus Rápido -->
          <td class="py-3 px-4 whitespace-nowrap">
            <select data-ticket-id="${t.id}" class="quick-status-select px-2.5 py-1 text-xs font-tech font-bold rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${getStatusSelectStyle(t.status)}">
              <option value="Abierto" ${t.status === "Abierto" ? "selected" : ""}>● Abierto</option>
              <option value="En revisión" ${t.status === "En revisión" ? "selected" : ""}>⚙ En revisión</option>
              <option value="Resuelto" ${t.status === "Resuelto" ? "selected" : ""}>✓ Resuelto</option>
            </select>
          </td>

          <!-- Acciones -->
          <td class="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
            <button type="button" data-ticket-id="${t.id}" class="btn-manage-ticket px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg font-tech text-xs font-semibold transition-all shadow-sm">
              Gestionar
            </button>
            <button type="button" data-ticket-id="${t.id}" class="btn-quick-del p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-all shadow-sm border border-red-200" title="Eliminar ticket con auditoría">
              <i data-feather="trash-2" class="w-3.5 h-3.5 inline"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  // Eventos para selector de estatus rápido
  tbody.querySelectorAll(".quick-status-select").forEach((sel) => {
    sel.addEventListener("change", async (e) => {
      const ticketId = sel.dataset.ticketId;
      const newStatus = sel.value;
      await updateTicketStatusInFirestore(ticketId, newStatus);
    });
  });

  // Eventos para abrir modal de gestión
  tbody.querySelectorAll(".btn-manage-ticket").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ticketId = btn.dataset.ticketId;
      const ticket = globalTickets.find((x) => x.id === ticketId);
      if (ticket) openManageModal(ticket);
    });
  });

  // Eventos para abrir modal de confirmación de eliminación con auditoría
  tbody.querySelectorAll(".btn-quick-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ticketId = btn.dataset.ticketId;
      const ticket = globalTickets.find((x) => x.id === ticketId);
      if (ticket) openDeleteModal(ticket);
    });
  });

  if (window.feather) window.feather.replace();
}

function getStatusSelectStyle(status) {
  if (status === "Abierto") {
    return "bg-sky-50 text-sky-800 border-sky-300";
  } else if (status === "En revisión") {
    return "bg-amber-50 text-amber-800 border-amber-300";
  } else if (status === "Resuelto") {
    return "bg-emerald-50 text-emerald-800 border-emerald-300";
  }
  return "bg-slate-50 text-slate-700 border-slate-300";
}

// ==========================================================================
// 6. ACTUALIZACIÓN DIRECTA EN FIRESTORE
// ==========================================================================
async function updateTicketStatusInFirestore(ticketId, newStatus) {
  try {
    const ticketDocRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketDocRef, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    console.log(`[Firestore Success] Ticket ${ticketId} actualizado a ${newStatus}`);
  } catch (error) {
    console.error("[Firestore Error] Error al actualizar estatus:", error);
    alert("❌ Error al actualizar en Firestore: " + error.message);
  }
}

// ==========================================================================
// 7. MODAL DE GESTIÓN Y RESOLUCIÓN
// ==========================================================================
function openManageModal(ticket) {
  activeTicketForModal = ticket;
  const modal = document.getElementById("admin-manage-modal");

  document.getElementById("modal-manage-code").textContent = ticket.ticketCode;
  document.getElementById("modal-manage-author").textContent = ticket.userName || "Colaborador";
  document.getElementById("modal-manage-email").textContent = ticket.userEmail;
  document.getElementById("modal-manage-subject").textContent = ticket.subject;
  document.getElementById("modal-manage-desc").textContent = ticket.description;
  document.getElementById("modal-manage-dept").textContent = ticket.department;
  document.getElementById("modal-manage-category").textContent = ticket.category;
  document.getElementById("modal-manage-created").textContent = new Date(ticket.createdAt).toLocaleString("es-ES");
  document.getElementById("modal-manage-updated").textContent = ticket.updatedAt
    ? new Date(ticket.updatedAt).toLocaleString("es-ES")
    : "Sin modificaciones";

  // Prioridad badge
  const prioBadge = document.getElementById("modal-manage-prio-badge");
  prioBadge.textContent = ticket.priority;
  if (ticket.priority === "Crítica") {
    prioBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold font-tech bg-red-100 text-red-800 border-red-300";
  } else if (ticket.priority === "Alta") {
    prioBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold font-tech bg-amber-100 text-amber-800 border-amber-300";
  } else {
    prioBadge.className = "px-2.5 py-0.5 rounded-full text-xs font-bold font-tech bg-blue-100 text-blue-800 border-blue-300";
  }

  // Marcar estatus actual en los botones
  updateModalStatusButtons(ticket.status);

  // Ocultar feedback previo
  document.getElementById("status-update-feedback").classList.add("hidden");

  modal.classList.remove("hidden");
  if (window.feather) window.feather.replace();
}

function updateModalStatusButtons(currentStatus) {
  document.querySelectorAll(".btn-change-status").forEach((btn) => {
    const targetStatus = btn.dataset.targetStatus;
    if (targetStatus === currentStatus) {
      btn.classList.add("bg-blue-600", "text-white", "border-blue-700", "shadow-sm");
      btn.classList.remove("bg-white", "text-slate-700", "border-slate-200");
    } else {
      btn.classList.remove("bg-blue-600", "text-white", "border-blue-700", "shadow-sm");
      btn.classList.add("bg-white", "text-slate-700", "border-slate-200");
    }
  });
}

function closeManageModal() {
  document.getElementById("admin-manage-modal")?.classList.add("hidden");
  activeTicketForModal = null;
}

// ==========================================================================
// 7.1 GESTIÓN DE AUDITORÍA Y ELIMINACIÓN DE TICKETS
// ==========================================================================
function openDeleteModal(ticket) {
  if (!ticket) return;
  ticketToDelete = ticket;

  const modal = document.getElementById("admin-delete-modal");
  if (!modal) return;

  document.getElementById("del-modal-code").textContent = ticket.ticketCode || "--";
  document.getElementById("del-modal-subject").textContent = ticket.subject || "--";
  document.getElementById("del-modal-author").textContent = `${ticket.userName || "Colaborador"} (${ticket.userEmail || "--"})`;

  const presetSelect = document.getElementById("del-modal-reason-preset");
  if (presetSelect) presetSelect.selectedIndex = 0;

  const notesTextarea = document.getElementById("del-modal-notes");
  if (notesTextarea) notesTextarea.value = "";

  const confirmBtn = document.getElementById("del-modal-confirm-btn");
  if (confirmBtn) {
    confirmBtn.disabled = false;
    document.getElementById("del-btn-text").textContent = "Confirmar y Eliminar";
  }

  modal.classList.remove("hidden");
  if (window.feather) window.feather.replace();
}

function closeDeleteModal() {
  const modal = document.getElementById("admin-delete-modal");
  if (modal) modal.classList.add("hidden");
  ticketToDelete = null;
}

function showAdminToast(title, message, isError = false) {
  const toast = document.getElementById("admin-global-toast");
  if (!toast) return;

  const iconBox = document.getElementById("toast-icon-box");
  const icon = document.getElementById("toast-icon");
  const titleEl = document.getElementById("toast-title");
  const msgEl = document.getElementById("toast-message");

  titleEl.textContent = title;
  msgEl.textContent = message;

  if (isError) {
    toast.className = "mb-6 p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all animate__animated animate__fadeInDown bg-red-50 border border-red-200";
    iconBox.className = "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600";
    icon.setAttribute("data-feather", "alert-circle");
    titleEl.className = "font-tech text-xs font-bold uppercase tracking-wider text-red-900";
    msgEl.className = "text-xs mt-0.5 text-red-700";
  } else {
    toast.className = "mb-6 p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all animate__animated animate__fadeInDown bg-emerald-50 border border-emerald-200";
    iconBox.className = "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-600";
    icon.setAttribute("data-feather", "check-circle");
    titleEl.className = "font-tech text-xs font-bold uppercase tracking-wider text-emerald-900";
    msgEl.className = "text-xs mt-0.5 text-emerald-700";
  }

  if (window.feather) window.feather.replace();
  toast.classList.remove("hidden");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 6000);
}

// ==========================================================================
// 8. EXPORTACIÓN A CSV PARA REPORTES CORPORATIVOS
// ==========================================================================
function exportTicketsToCSV() {
  if (!globalTickets || globalTickets.length === 0) {
    alert("No hay tickets registrados en la base de datos para exportar.");
    return;
  }

  // Encabezados corporativos
  const headers = [
    "Codigo de Ticket",
    "Estatus",
    "Prioridad",
    "Departamento",
    "Categoria",
    "Asunto",
    "Solicitante",
    "Correo Corporativo",
    "Fecha Creacion",
    "Ultima Actualizacion",
    "Descripcion del Incidente"
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, " ");
    return `"${str}"`;
  };

  const formatDate = (val) => {
    if (!val) return "";
    try {
      const d = val?.toDate ? val.toDate() : (val?.seconds ? new Date(val.seconds * 1000) : new Date(val));
      if (!d || isNaN(d.getTime())) return String(val);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return String(val);
    }
  };

  const rows = globalTickets.map((t) => [
    escapeCSV(t.ticketCode || ""),
    escapeCSV(t.status || "Abierto"),
    escapeCSV(t.priority || "Media"),
    escapeCSV(t.department || ""),
    escapeCSV(t.category || ""),
    escapeCSV(t.subject || ""),
    escapeCSV(t.userName || "Colaborador"),
    escapeCSV(t.userEmail || ""),
    escapeCSV(formatDate(t.createdAt)),
    escapeCSV(formatDate(t.updatedAt)),
    escapeCSV(t.description || "")
  ]);

  // Usamos separador de coma estándar con BOM UTF-8 (\uFEFF) para compatibilidad universal con Excel y Google Sheets
  const csvContent = "\uFEFF" + [headers.map(escapeCSV).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  // Descarga robusta con Blob para evitar truncamientos
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Reporte_Tickets_MiniBruno_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ==========================================================================
// 9. INICIALIZACIÓN DE EVENTOS DEL DOM
// ==========================================================================
function initAdminEvents() {
  // Filtros de estado (Chips)
  document.querySelectorAll(".admin-status-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".admin-status-chip").forEach((c) => {
        c.className = "admin-status-chip px-3 py-1.5 rounded-lg text-xs font-tech font-semibold text-slate-600 hover:text-slate-900 transition-colors";
      });
      chip.className = "admin-status-chip active px-3 py-1.5 rounded-lg text-xs font-tech font-bold bg-blue-600 text-white transition-colors";
      filterStatus = chip.dataset.filterStatus;
      renderAdminTicketsTable();
    });
  });

  // Filtro por departamento
  document.getElementById("admin-dept-filter")?.addEventListener("change", (e) => {
    filterDept = e.target.value;
    renderAdminTicketsTable();
  });

  // Filtro por prioridad
  document.getElementById("admin-prio-filter")?.addEventListener("change", (e) => {
    filterPrio = e.target.value;
    renderAdminTicketsTable();
  });

  // Buscador
  document.getElementById("admin-search-input")?.addEventListener("input", (e) => {
    searchKeyword = e.target.value;
    renderAdminTicketsTable();
  });

  // Exportar CSV
  document.getElementById("export-csv-btn")?.addEventListener("click", exportTicketsToCSV);

  // Cerrar modal de gestión
  document.getElementById("close-manage-modal-btn")?.addEventListener("click", closeManageModal);
  document.getElementById("modal-close-action-btn")?.addEventListener("click", closeManageModal);

  // Abrir modal de confirmación de eliminación desde el modal de gestión
  document.getElementById("modal-delete-ticket-btn")?.addEventListener("click", () => {
    if (!activeTicketForModal) return;
    openDeleteModal(activeTicketForModal);
  });

  // Cancelar eliminación
  document.getElementById("del-modal-cancel-btn")?.addEventListener("click", closeDeleteModal);

  // Cerrar toast manualmente
  document.getElementById("toast-dismiss-btn")?.addEventListener("click", () => {
    document.getElementById("admin-global-toast")?.classList.add("hidden");
  });

  // Confirmar eliminación y registrar auditoría en Firestore
  document.getElementById("admin-delete-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!ticketToDelete) return;

    const confirmBtn = document.getElementById("del-modal-confirm-btn");
    const btnText = document.getElementById("del-btn-text");
    const reasonPreset = document.getElementById("del-modal-reason-preset")?.value || "No especificado";
    const notes = document.getElementById("del-modal-notes")?.value || "";

    try {
      if (confirmBtn) confirmBtn.disabled = true;
      if (btnText) btnText.textContent = "Registrando auditoría y borrando...";

      const targetId = ticketToDelete.id;
      const targetCode = ticketToDelete.ticketCode || "--";
      const targetSubject = ticketToDelete.subject || "--";

      // 1. Guardar registro histórico de auditoría en Firestore
      const auditPayload = {
        originalTicketId: targetId,
        ticketCode: targetCode,
        subject: targetSubject,
        description: ticketToDelete.description || "",
        department: ticketToDelete.department || "",
        category: ticketToDelete.category || "",
        priority: ticketToDelete.priority || "Media",
        status: ticketToDelete.status || "Abierto",
        userEmail: ticketToDelete.userEmail || "",
        userName: ticketToDelete.userName || "",
        createdAt: ticketToDelete.createdAt || null,
        deletedAt: new Date().toISOString(),
        deletedByEmail: currentAdminUser?.email || "admin@minibruno.com",
        deletedByName: currentAdminUser?.displayName || currentAdminUser?.email || "Administrador",
        reason: reasonPreset,
        notes: notes.trim()
      };

      await addDoc(collection(db, "deleted_tickets"), auditPayload);

      // 2. Eliminar el ticket de la colección activa 'tickets'
      await deleteDoc(doc(db, "tickets", targetId));

      // 3. Cerrar modales
      closeDeleteModal();
      closeManageModal();

      // 4. Notificar con toast visual
      showAdminToast(
        "Ticket Eliminado con Éxito",
        `El ticket ${targetCode} fue eliminado permanentemente de Firestore y se guardó el registro de auditoría.`
      );
    } catch (err) {
      console.error("[Firestore Delete Error]", err);
      if (confirmBtn) confirmBtn.disabled = false;
      if (btnText) btnText.textContent = "Confirmar y Eliminar";
      showAdminToast("Error al Eliminar", "No se pudo eliminar el ticket en Firestore: " + err.message, true);
    }
  });

  // Botones de cambio de estatus dentro del modal
  document.querySelectorAll(".btn-change-status").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!activeTicketForModal) return;
      const targetStatus = btn.dataset.targetStatus;
      await updateTicketStatusInFirestore(activeTicketForModal.id, targetStatus);
      activeTicketForModal.status = targetStatus;
      updateModalStatusButtons(targetStatus);

      const feedback = document.getElementById("status-update-feedback");
      feedback.textContent = `✓ Estatus actualizado a "${targetStatus}"`;
      feedback.classList.remove("hidden");
      setTimeout(() => feedback.classList.add("hidden"), 3000);
    });
  });

  // Cierre de sesión en header y pantalla de denegado
  const logoutAction = async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };
  document.getElementById("admin-logout-btn")?.addEventListener("click", logoutAction);
  document.getElementById("denied-logout-btn")?.addEventListener("click", logoutAction);
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
