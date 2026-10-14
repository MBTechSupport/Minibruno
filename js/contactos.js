// ==========================================================================
// CONTACTOS.JS - DIRECTORIO CORPORATIVO Y GESTIÓN DE vCARDS (MINI BRUNO)
// ==========================================================================

import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy
} from "./firebase-init.js";
import { getUserRole, canAccessAdminTickets } from "./auth-roles.js";

// Lista canónica de los 8 contactos corporativos originales
const INITIAL_CONTACTS = [
  {
    id: 1,
    name: "Alves Neri",
    position: "Gerente del Área de Sistemas",
    phone: "+58 424 3221234",
    email: "alves.neri@minibruno.com",
    department: "Sistemas",
    location: "Sede Principal Planta Chuao",
    ext: "Ext.",
    hours: "L-V 7:00am - 4:00pm",
    notes: "Responsable de supervisar y coordinar todas las actividades relacionadas con los sistemas informáticos y tecnológicos de la empresa.",
    avatar: "img_ref/user1_alves_neri.webp"
  },
  {
    id: 2,
    name: "Luis Ruiz",
    position: "Analista de Soporte Técnico y Telecomunicaciones",
    phone: "+58 414 4677046",
    email: "lruiz@minibruno.com",
    department: "Departamento de Sistemas",
    location: "Sede Principal Planta PSC",
    ext: "Ext. 305",
    hours: "L-V 7:00am - 4:00pm",
    notes: "Se encarga de monitorear y mantener la infraestructura de telecomunicaciones y redes de la empresa.",
    avatar: "img_ref/avatar6_luis_ruiz.png"
  },
  {
    id: 3,
    name: "Rommer Coronado",
    position: "Jefe de Sistemas",
    phone: "-",
    email: "rcoronado@minibruno.com",
    department: "Departamento de Sistemas",
    location: "Sede Principal Planta PRC",
    ext: "Ext.",
    hours: "L-V 7:00am - 4:00pm",
    notes: "Es el representante del Departamento de Sistemas en ambas plantas, tanto en PSC y en PRC.",
    avatar: "img_ref/user2_rommer_coronado.webp"
  },
  {
    id: 4,
    name: "Marbeth Rodriguez",
    position: "Analista de Sistemas",
    phone: "+58 424 3268791",
    email: "mrodriguez@minibruno.com",
    department: "Departamento de Sistemas",
    location: "Sede Principal Planta PSC",
    ext: "Ext. 305",
    hours: "L-V 7:00am - 4:00pm",
    notes: "Responsable del análisis, diseño y mejora de los sistemas informáticos de la empresa.",
    avatar: "img_ref/user3_marbeth_rodriguez.webp"
  },
  {
    id: 5,
    name: "Darwin Navarro",
    position: "Analista de Sistemas",
    phone: "-",
    email: "dnavarro@minibruno.com",
    department: "Departamento de Sistemas",
    location: "Sede Principal Planta PSC",
    ext: "Ext. 128",
    hours: "L-V 7:00am - 4:00pm",
    notes: "Responsable del análisis, diseño y mejora de los sistemas informáticos de la empresa.",
    avatar: "img_ref/user4_darwin_navarro.webp"
  },
  {
    id: 6,
    name: "Jagger Ñanez",
    position: "Analista de Sistemas",
    phone: "-",
    email: "jnanez@minibruno.com",
    department: "Departamento de Sistemas",
    location: "Sede Principal Planta PRC",
    ext: "Ext. 305",
    hours: "L-V 7:00am - 4:00pm",
    notes: "Responsable del análisis, diseño y mejora de los sistemas informáticos de la empresa.",
    avatar: "img_ref/user5_jagger_nanes.webp"
  },
  {
    id: 7,
    name: "Betsimar Montilla",
    position: "Analista de Sistemas",
    phone: "-",
    email: "bmontilla@minibruno.com",
    department: "Departamento de Sistemas",
    location: "Sede Principal Planta PRC",
    ext: "Ext.",
    hours: "L-V 7:00am - 4:00pm",
    notes: "Responsable del análisis, diseño y mejora de los sistemas informáticos de la empresa.",
    avatar: "img_ref/user7_betsimar_montilla.webp"
  },
  {
    id: 8,
    name: "Luis Guevara",
    position: "Gerente de Sistemas",
    phone: "-",
    email: "lguevara@minibruno.com",
    department: "Departamento de Sistemas",
    location: "Sede Principal Planta PRC",
    ext: "Ext.",
    hours: "L-V 7:00am - 4:00pm",
    notes: "Gerente del Departamento de Sistemas en la planta de PRC.",
    avatar: "img_ref/user8_luis_guevara.webp"
  }
];

// Estado en memoria
let contacts = [...INITIAL_CONTACTS];
let currentAdminUser = null;
let isUserAdmin = false;
let activeDetailContactId = null;
let activeEditingContact = null;
let selectedPhotoDataUriOrPath = null;
let toastTimeout = null;

// ==========================================================================
// 1. INICIALIZACIÓN
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  if (window.AOS) {
    window.AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  }
  if (window.feather) {
    window.feather.replace();
  }

  // Render inicial inmediato con los datos canónicos
  renderContactsGrid();

  // Iniciar observador de sesión y permisos RBAC
  initContactsAuthObserver();

  // Iniciar sincronización en tiempo real con Firestore
  initFirestoreContactsSync();

  // Inicializar eventos de la interfaz y modales
  initContactsUIEvents();
});

// ==========================================================================
// 2. OBSERVADOR DE SESIÓN Y CONTROL DE PRIVILEGIOS RBAC
// ==========================================================================
function initContactsAuthObserver() {
  const adminBar = document.getElementById("admin-contacts-bar");
  const detailEditBtn = document.getElementById("detail-edit-contact-btn");

  onAuthStateChanged(auth, async (user) => {
    currentAdminUser = user;

    if (!user) {
      isUserAdmin = false;
      if (adminBar) adminBar.classList.add("hidden");
      if (detailEditBtn) detailEditBtn.classList.add("hidden");
      renderContactsGrid();
      return;
    }

    const email = (user.email || "").toLowerCase().trim();
    const role = await getUserRole(email);
    isUserAdmin = canAccessAdminTickets(role);

    if (isUserAdmin) {
      if (adminBar) adminBar.classList.remove("hidden");
      if (detailEditBtn && activeDetailContactId) {
        detailEditBtn.classList.remove("hidden");
        detailEditBtn.classList.add("flex");
      }
    } else {
      if (adminBar) adminBar.classList.add("hidden");
      if (detailEditBtn) detailEditBtn.classList.add("hidden");
    }

    // Re-renderizar la cuadrícula para mostrar u ocultar botones de edición según el rol
    renderContactsGrid();
    if (window.feather) window.feather.replace();
  });
}

// ==========================================================================
// 3. SINCRONIZACIÓN EN TIEMPO REAL CON FIRESTORE (/contacts)
// ==========================================================================
function initFirestoreContactsSync() {
  const contactsCollectionRef = collection(db, "contacts");
  const q = query(contactsCollectionRef, orderBy("id", "asc"));

  onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty) {
        // Colección vacía: sembrar automáticamente los 8 contactos iniciales si el usuario es admin o inicializar
        if (isUserAdmin) {
          await seedInitialContactsToFirestore();
        }
      } else {
        const loadedContacts = [];
        snapshot.forEach((docSnap) => {
          loadedContacts.push({ docId: docSnap.id, ...docSnap.data() });
        });
        contacts = loadedContacts;
        renderContactsGrid();

        // Si la vista de detalle está abierta, refrescarla en vivo
        if (activeDetailContactId) {
          updateDetailViewData(activeDetailContactId);
        }
      }
    },
    (error) => {
      console.warn("[Firestore Contacts Sync] Modo Offline / Fallback local activo:", error.message);
      // Mantener la lista en memoria si Firestore falla
      renderContactsGrid();
    }
  );
}

/**
 * Siembra inicial controlada de los 8 contactos en Firestore
 */
async function seedInitialContactsToFirestore() {
  try {
    for (const contact of INITIAL_CONTACTS) {
      const contactDocRef = doc(db, "contacts", `contact_${contact.id}`);
      await setDoc(contactDocRef, {
        ...contact,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: "system_init"
      }, { merge: true });
    }
    console.log("[Firestore Contacts] Seeding inicial de 8 vCards completado.");
  } catch (err) {
    console.error("[Firestore Contacts Seeding Error]", err);
  }
}

// ==========================================================================
// 4. RENDERIZADO DE LA CUADRÍCULA DE CONTACTOS (vCards)
// ==========================================================================
function renderContactsGrid() {
  const grid = document.getElementById("contacts-grid");
  if (!grid) return;

  const cardsHtml = contacts.map((c) => {
    const initials = (c.name || "MB")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    // Determinar avatar
    const hasPhoto = c.avatar && c.avatar.trim().length > 0;
    const photoContent = hasPhoto
      ? `<img src="${c.avatar}" alt="${escapeHtml(c.name)}" class="w-full h-full object-cover rounded-full" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
         <span class="text-white font-bold text-lg font-tech ${hasPhoto ? 'hidden' : 'flex'}">${initials}</span>`
      : `<span class="text-white font-bold text-lg font-tech">${initials}</span>`;

    // Botón de edición visible exclusivamente para Staff IT Autorizado
    const editButtonHtml = isUserAdmin
      ? `
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button type="button" onclick="event.stopPropagation(); openEditContactModal(${c.id})" class="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-lg text-xs font-tech font-bold transition-all border border-blue-200 flex items-center justify-center space-x-1.5 shadow-sm">
            <i data-feather="edit-2" class="w-3.5 h-3.5"></i>
            <span>Editar vCard</span>
          </button>
        </div>
      `
      : "";

    return `
      <div class="contact-card rounded-xl p-6 cursor-pointer hover:border-blue-500/40 transition-all flex flex-col justify-between" onclick="showContactDetails(${c.id})" data-aos="fade-up">
        <div>
          <div class="flex items-center mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 neon-glow overflow-hidden flex-shrink-0">
              ${photoContent}
            </div>
            <div class="overflow-hidden">
              <h3 class="text-xl font-semibold text-dark font-tech truncate" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</h3>
              <p class="text-gray-600 text-sm truncate" title="${escapeHtml(c.position)}">${escapeHtml(c.position)}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20 overflow-hidden">
              <p class="text-xs text-gray-500">Teléfono</p>
              <p class="text-gray-700 text-sm truncate font-mono">${escapeHtml(c.phone || "-")}</p>
            </div>
            <div class="bg-purple-500/10 rounded-lg p-2 border border-purple-500/20 overflow-hidden">
              <p class="text-xs text-gray-500">Departamento</p>
              <p class="text-gray-700 text-sm truncate">${escapeHtml(c.department || "General")}</p>
            </div>
          </div>
        </div>
        ${editButtonHtml}
      </div>
    `;
  }).join("");

  grid.innerHTML = cardsHtml;
  if (window.feather) window.feather.replace();
}

// ==========================================================================
// 5. VISTA DE DETALLES DEL CONTACTO
// ==========================================================================
export function showContactDetails(id) {
  activeDetailContactId = id;
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  updateDetailViewData(id);

  // Limpiar clases previas de animación
  const grid = document.getElementById("contacts-grid");
  const details = document.getElementById("contact-details");
  if (!grid || !details) return;

  grid.classList.remove("fade-in", "fade-out");
  details.classList.remove("fade-in", "fade-out");

  grid.classList.add("fade-out");
  setTimeout(() => {
    grid.style.display = "none";
    details.style.display = "block";
    details.classList.add("fade-in");
    window.scrollTo({ top: details.offsetTop - 80, behavior: "smooth" });
    setTimeout(() => {
      details.classList.remove("fade-in");
    }, 500);
  }, 400);

  if (window.feather) window.feather.replace();
}

function updateDetailViewData(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  document.getElementById("detail-name").textContent = contact.name || "--";
  document.getElementById("detail-position").textContent = contact.position || "--";
  document.getElementById("detail-phone").textContent = contact.phone || "-";
  document.getElementById("detail-email").textContent = contact.email || "--";
  document.getElementById("detail-department").textContent = contact.department || "--";
  document.getElementById("detail-location").textContent = contact.location || "--";
  document.getElementById("detail-ext").textContent = contact.ext || "Ext.";
  document.getElementById("detail-hours").textContent = contact.hours || "L-V 7:00am - 4:00pm";
  document.getElementById("detail-notes").textContent = contact.notes || "Sin descripción adicional.";

  // Foto o iniciales
  const initials = (contact.name || "MB")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const imgEl = document.getElementById("detail-avatar-img");
  const initialsEl = document.getElementById("detail-initials");

  if (contact.avatar && contact.avatar.trim().length > 0) {
    if (imgEl) {
      imgEl.src = contact.avatar;
      imgEl.classList.remove("hidden");
      imgEl.onerror = () => {
        imgEl.classList.add("hidden");
        if (initialsEl) initialsEl.classList.remove("hidden");
      };
    }
    if (initialsEl) initialsEl.classList.add("hidden");
  } else {
    if (imgEl) imgEl.classList.add("hidden");
    if (initialsEl) {
      initialsEl.textContent = initials;
      initialsEl.classList.remove("hidden");
    }
  }

  // Botón de edición en detalle si el usuario es ADMIN
  const detailEditBtn = document.getElementById("detail-edit-contact-btn");
  if (detailEditBtn) {
    if (isUserAdmin) {
      detailEditBtn.classList.remove("hidden");
      detailEditBtn.classList.add("flex");
      detailEditBtn.onclick = () => openEditContactModal(contact.id);
    } else {
      detailEditBtn.classList.add("hidden");
      detailEditBtn.classList.remove("flex");
    }
  }
}

export function hideContactDetails() {
  activeDetailContactId = null;
  const grid = document.getElementById("contacts-grid");
  const details = document.getElementById("contact-details");
  if (!grid || !details) return;

  grid.classList.remove("fade-in", "fade-out");
  details.classList.remove("fade-in", "fade-out");

  details.classList.add("fade-out");
  setTimeout(() => {
    details.style.display = "none";
    grid.style.display = "grid";
    grid.classList.add("fade-in");
    setTimeout(() => {
      grid.classList.remove("fade-in");
    }, 500);
  }, 400);
}

// ==========================================================================
// 6. MODAL DE EDICIÓN DE CONTACTO (STAFF IT)
// ==========================================================================
export function openEditContactModal(contactId) {
  if (!isUserAdmin) {
    showContactsToast("Acceso Restringido", "Solo el personal Staff IT con correo autorizado puede editar contactos.", true);
    return;
  }

  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return;

  activeEditingContact = contact;
  selectedPhotoDataUriOrPath = contact.avatar || null;

  const modal = document.getElementById("edit-contact-modal");
  if (!modal) return;

  // Llenar campos con los valores vigentes del contacto
  document.getElementById("edit-contact-name").value = contact.name || "";
  document.getElementById("edit-contact-position").value = contact.position || "";
  document.getElementById("edit-contact-department").value = contact.department || "";
  document.getElementById("edit-contact-email").value = contact.email || "";
  document.getElementById("edit-contact-phone").value = contact.phone === "-" ? "" : (contact.phone || "");
  document.getElementById("edit-contact-ext").value = contact.ext || "";
  document.getElementById("edit-contact-location").value = contact.location || "";
  document.getElementById("edit-contact-hours").value = contact.hours || "";
  document.getElementById("edit-contact-notes").value = contact.notes || "";

  // Resetear selector de archivo
  const fileInput = document.getElementById("edit-contact-file-input");
  if (fileInput) fileInput.value = "";

  // Selector de preset
  const presetSelect = document.getElementById("edit-contact-preset-avatar");
  if (presetSelect) {
    let matched = false;
    for (let i = 0; i < presetSelect.options.length; i++) {
      if (presetSelect.options[i].value && contact.avatar && contact.avatar.includes(presetSelect.options[i].value)) {
        presetSelect.selectedIndex = i;
        matched = true;
        break;
      }
    }
    if (!matched) presetSelect.selectedIndex = 0;
  }

  // Vista previa de la foto actual
  updateModalPhotoPreview(contact.avatar, contact.name);

  modal.classList.remove("hidden");
  if (window.feather) window.feather.replace();
}

function closeEditContactModal() {
  const modal = document.getElementById("edit-contact-modal");
  if (modal) modal.classList.add("hidden");
  activeEditingContact = null;
  selectedPhotoDataUriOrPath = null;
}

function updateModalPhotoPreview(photoUrlOrData, name = "") {
  const previewImg = document.getElementById("edit-contact-preview-img");
  const previewInitials = document.getElementById("edit-contact-preview-initials");

  const initials = (name || "MB")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  if (photoUrlOrData && photoUrlOrData.trim().length > 0) {
    if (previewImg) {
      previewImg.src = photoUrlOrData;
      previewImg.classList.remove("hidden");
      previewImg.onerror = () => {
        previewImg.classList.add("hidden");
        if (previewInitials) previewInitials.classList.remove("hidden");
      };
    }
    if (previewInitials) previewInitials.classList.add("hidden");
  } else {
    if (previewImg) previewImg.classList.add("hidden");
    if (previewInitials) {
      previewInitials.textContent = initials;
      previewInitials.classList.remove("hidden");
    }
  }
}

// ==========================================================================
// 7. PROCESAMIENTO Y COMPRESIÓN DE FOTOGRAFÍAS (CLIENT-SIDE CANVAS)
// ==========================================================================
function handlePhotoFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validación de tipo de archivo
  if (!file.type.startsWith("image/")) {
    alert("❌ Formato no válido. Por favor selecciona una imagen PNG, JPEG o WebP.");
    e.target.value = "";
    return;
  }

  // Validación de tamaño (máx 5MB antes de compresión)
  if (file.size > 5 * 1024 * 1024) {
    alert("❌ La imagen seleccionada es demasiado grande. El límite es de 5MB.");
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const rawDataUrl = event.target.result;
    const img = new Image();
    img.onload = () => {
      // Optimización client-side mediante Canvas HTML5 (256x256 max square cover, ~20KB)
      const canvas = document.createElement("canvas");
      const TARGET_SIZE = 256;
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext("2d");

      // Recorte centrado manteniendo relación de aspecto cuadrada
      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;

      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);

      // Generar Data URI ligero y optimizado
      const optimizedDataUri = canvas.toDataURL("image/webp", 0.85);

      selectedPhotoDataUriOrPath = optimizedDataUri;
      updateModalPhotoPreview(optimizedDataUri, activeEditingContact?.name);

      // Resetear el select de preset a blanco
      const presetSelect = document.getElementById("edit-contact-preset-avatar");
      if (presetSelect) presetSelect.selectedIndex = 0;
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

// ==========================================================================
// 8. GUARDADO PERSISTENTE EN FIRESTORE
// ==========================================================================
async function handleSaveContactForm(e) {
  e.preventDefault();
  if (!activeEditingContact || !isUserAdmin) return;

  const saveBtn = document.getElementById("save-edit-contact-btn");
  const saveText = document.getElementById("save-contact-btn-text");

  const name = document.getElementById("edit-contact-name")?.value.trim();
  const position = document.getElementById("edit-contact-position")?.value.trim();
  const department = document.getElementById("edit-contact-department")?.value.trim();
  const email = document.getElementById("edit-contact-email")?.value.trim().toLowerCase();
  const phone = document.getElementById("edit-contact-phone")?.value.trim() || "-";
  const ext = document.getElementById("edit-contact-ext")?.value.trim() || "Ext.";
  const location = document.getElementById("edit-contact-location")?.value.trim() || "Sede Principal";
  const hours = document.getElementById("edit-contact-hours")?.value.trim() || "L-V 7:00am - 4:00pm";
  const notes = document.getElementById("edit-contact-notes")?.value.trim() || "";

  if (!name || !position || !department || !email) {
    alert("Por favor completa los campos obligatorios (*).");
    return;
  }

  try {
    if (saveBtn) saveBtn.disabled = true;
    if (saveText) saveText.textContent = "Guardando en Firestore...";

    const updatedPayload = {
      id: activeEditingContact.id,
      name,
      position,
      department,
      email,
      phone,
      ext,
      location,
      hours,
      notes,
      avatar: selectedPhotoDataUriOrPath || activeEditingContact.avatar || "",
      updatedAt: new Date().toISOString(),
      updatedBy: currentAdminUser?.email || "admin@minibruno.com"
    };

    // Guardar en Firestore con ID determinista 'contact_{id}'
    const docId = activeEditingContact.docId || `contact_${activeEditingContact.id}`;
    const contactRef = doc(db, "contacts", docId);
    await setDoc(contactRef, updatedPayload, { merge: true });

    // Actualizar copia en memoria
    const index = contacts.findIndex((c) => c.id === activeEditingContact.id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updatedPayload, docId };
    }

    closeEditContactModal();
    renderContactsGrid();
    if (activeDetailContactId === activeEditingContact.id) {
      updateDetailViewData(activeEditingContact.id);
    }

    showContactsToast(
      "vCard Actualizada con Éxito",
      `Los datos y fotografía de ${name} fueron guardados y sincronizados en Firestore.`
    );
  } catch (error) {
    console.error("[Firestore Contact Save Error]", error);
    alert("❌ Error al guardar en Firestore: " + error.message);
  } finally {
    if (saveBtn) saveBtn.disabled = false;
    if (saveText) saveText.textContent = "Guardar Cambios";
  }
}

// ==========================================================================
// 9. EVENTOS DEL DOM Y NOTIFICACIONES
// ==========================================================================
function initContactsUIEvents() {
  // Modal de edición
  document.getElementById("close-edit-contact-modal-btn")?.addEventListener("click", closeEditContactModal);
  document.getElementById("cancel-edit-contact-btn")?.addEventListener("click", closeEditContactModal);
  document.getElementById("edit-contact-form")?.addEventListener("submit", handleSaveContactForm);

  // File upload de foto
  document.getElementById("edit-contact-file-input")?.addEventListener("change", handlePhotoFileUpload);

  // Preset avatar selector
  document.getElementById("edit-contact-preset-avatar")?.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val) {
      selectedPhotoDataUriOrPath = val;
      updateModalPhotoPreview(val, activeEditingContact?.name);
      const fileInput = document.getElementById("edit-contact-file-input");
      if (fileInput) fileInput.value = "";
    }
  });

  // Dismiss toast
  document.getElementById("contacts-toast-dismiss")?.addEventListener("click", () => {
    document.getElementById("contacts-toast")?.classList.add("hidden");
  });
}

function showContactsToast(title, message, isError = false) {
  const toast = document.getElementById("contacts-toast");
  if (!toast) return;

  const iconBox = document.getElementById("contacts-toast-icon-box");
  const icon = document.getElementById("contacts-toast-icon");
  const titleEl = document.getElementById("contacts-toast-title");
  const msgEl = document.getElementById("contacts-toast-message");

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  if (isError) {
    toast.className = "mb-6 p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all animate__animated animate__fadeInDown bg-red-50 border border-red-200";
    if (iconBox) iconBox.className = "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600";
    if (icon && icon.setAttribute) icon.setAttribute("data-feather", "alert-circle");
    if (titleEl) titleEl.className = "font-tech text-xs font-bold uppercase tracking-wider text-red-900";
    if (msgEl) msgEl.className = "text-xs mt-0.5 text-red-700";
  } else {
    toast.className = "mb-6 p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all animate__animated animate__fadeInDown bg-emerald-50 border border-emerald-200";
    if (iconBox) iconBox.className = "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-600";
    if (icon && icon.setAttribute) icon.setAttribute("data-feather", "check-circle");
    if (titleEl) titleEl.className = "font-tech text-xs font-bold uppercase tracking-wider text-emerald-900";
    if (msgEl) msgEl.className = "text-xs mt-0.5 text-emerald-700";
  }

  if (window.feather) window.feather.replace();
  toast.classList.remove("hidden");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 6000);
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Exportar globalmente a window para compatibilidad con llamadas HTML inline
window.showContactDetails = showContactDetails;
window.hideContactDetails = hideContactDetails;
window.openEditContactModal = openEditContactModal;
window.scrollToTop = scrollToTop;