// ============================================================== //
// NEWS.JS - GESTIÓN Y PERSISTENCIA DE NOTICIAS EN FIRESTORE (FASE 1)
// ============================================================== //

import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "./firebase-init.js";

// Metadatos y estilos visuales por categoría
const CATEGORY_META = {
  todas: { label: "Todas las Categorías", icon: "grid", color: "blue", pillClass: "bg-blue-50 text-blue-700 border-blue-200" },
  innovacion: { label: "Innovación", icon: "zap", color: "amber", pillClass: "bg-amber-50 text-amber-700 border-amber-200" },
  seguridad: { label: "Seguridad y Salud", icon: "shield", color: "red", pillClass: "bg-red-50 text-red-700 border-red-200" },
  tecnologia: { label: "Tecnología", icon: "cpu", color: "cyan", pillClass: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  software: { label: "Software", icon: "code", color: "indigo", pillClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  hardware: { label: "Hardware y Redes", icon: "hard-drive", color: "emerald", pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  internet: { label: "Internet", icon: "wifi", color: "sky", pillClass: "bg-sky-50 text-sky-700 border-sky-200" },
  gaming: { label: "Juegos y Dinámicas", icon: "monitor", color: "purple", pillClass: "bg-purple-50 text-purple-700 border-purple-200" },
  moviles: { label: "Móviles", icon: "smartphone", color: "teal", pillClass: "bg-teal-50 text-teal-700 border-teal-200" },
  reviews: { label: "Reseñas", icon: "star", color: "yellow", pillClass: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  entrevistas: { label: "Entrevistas", icon: "mic", color: "pink", pillClass: "bg-pink-50 text-pink-700 border-pink-200" }
};

// Noticias base de Mini Bruno para auto-inicializar Firestore si la colección está vacía
const INITIAL_SEED_NEWS = [
  {
    title: "Bruno Mini y Luigia Crespi de Mini: Cimientos de Nuestra Historia",
    category: "entrevistas",
    authorName: "Gabriella Mini Arreaza",
    authorRole: "Nieta de los Fundadores / Junta Directiva",
    summary: "Homenaje a la tenacidad, justicia y espíritu emprendedor que guiaron a nuestra familia fundadora desde sus orígenes en Italia hasta consolidarse como líderes industriales en Venezuela.",
    content: `Capítulo 1: Recuerdos de Familia.
A medida que transcurre el tiempo los recuerdos que más fácilmente vienen a la mente son los de los buenos tiempos y los de mis abuelos: unos inmigrantes italianos que llegaron con muy poco a Venezuela, pero que dejaron mucho.

Capítulo 2: Orígenes en Italia.
Mis abuelos nacieron y crecieron en épocas de guerra. Mi abuelo nació en Rimini, cerca de la costa, y mi abuela en Busto Garolfo (Lombardía). Fue allí donde se conocieron y formaron su hogar antes de emprender viaje hacia nuevas oportunidades.

Capítulo 3: Trabajo y Futuro.
El tema común que une todas sus historias es el profundo sentido de justicia y valor del trabajo. En Mini Bruno continuamos honrando ese legado cada día con esfuerzo y dedicación.`,
    tags: ["Fundadores", "Historia", "Legado"],
    createdAt: "2025-10-02T10:00:00.000Z"
  },
  {
    title: "Día Mundial del Lavado de Manos: Salud e Inocuidad",
    category: "tecnologia",
    authorName: "Yosmary Nieves",
    authorRole: "Comunicaciones MBS",
    summary: "Celebramos el compromiso institucional con la salud, la prevención y la inocuidad alimentaria, pilares indispensables en todas las plantas y oficinas de Mini Bruno.",
    content: `Hoy 15 de Octubre reafirmamos nuestro compromiso con la salud, la inocuidad y la prevención, pilares fundamentales para garantizar la calidad de todo lo que hacemos.

El lavado frecuente y correcto de manos es una práctica sencilla pero poderosa que reduce drásticamente riesgos bacteriológicos en líneas operativas y oficinas.

Recordemos siempre nuestro lema: Manos limpias, trabajo seguro. Es parte viva de nuestra cultura preventiva en Mini Bruno Sucesores.`,
    tags: ["Salud", "Inocuidad", "Prevención"],
    createdAt: "2025-10-15T09:00:00.000Z"
  },
  {
    title: "El Cuidado Personal Comienza con la Prevención",
    category: "seguridad",
    authorName: "Yosmary Nieves",
    authorRole: "Comunicaciones MBS",
    summary: "Reflexión y pautas sobre la importancia de la prevención médica, chequeos oportunos y autocuidado integral para todo nuestro equipo humano.",
    content: `En este mes de la sensibilización nos detenemos para honrar la vida, el bien más preciado que poseemos.

Al priorizar nuestra salud y bienestar no solo nos protegemos a nosotros mismos, sino que cuidamos a nuestras familias y compañeros de labores.

Invitamos a todo el personal a participar en las jornadas médicas periódicas y a mantener hábitos saludables dentro y fuera de la empresa.`,
    tags: ["Salud", "Bienestar", "Prevención"],
    createdAt: "2025-10-17T09:00:00.000Z"
  },
  {
    title: "¡Un Puesto Limpio, un Trabajo Seguro!",
    category: "seguridad",
    authorName: "Comité de Seguridad y Calidad",
    authorRole: "Seguridad Industrial",
    summary: "Un entorno limpio y ordenado evita la contaminación cruzada, reduce incidentes de trabajo y optimiza los tiempos de respuesta operativa.",
    content: `Un puesto de trabajo limpio y despejado previene accidentes, minimiza riesgos de tropiezos y mantiene la excelencia en cada uno de los procesos de transformación.

Recomendaciones clave de inicio y fin de turno:
1. Retirar herramientas y materiales no utilizados.
2. Identificar y reportar cables sueltos o derrames inmediatamente.
3. Desinfectar superficies de uso común al finalizar la jornada.`,
    tags: ["Higiene", "Orden", "Seguridad"],
    createdAt: "2025-10-21T09:00:00.000Z"
  },
  {
    title: "Programa SOL: Seguridad, Orden y Limpieza",
    category: "seguridad",
    authorName: "Comité de Seguridad y Salud Laboral",
    authorRole: "Seguridad Industrial",
    summary: "Conoce los tres pilares estratégicos del Programa SOL y cómo aplicarlos en las estaciones de trabajo de planta y oficinas administrativas.",
    content: `¿EN QUÉ CONSISTE EL PROGRAMA SOL?
El programa se fundamenta en tres pilares esenciales:
- S (Seguridad): Evitar condiciones inseguras, utilizar adecuadamente los EPP y reportar incidentes con rapidez.
- O (Orden): Cada cosa en su lugar y un lugar para cada cosa, facilitando las labores y reduciendo pérdidas de tiempo.
- L (Limpieza): Inspección visual permanente y mantenimiento del aseo en áreas productivas y de descanso.

Beneficios directos:
- Disminución de incidentes laborales.
- Mayor eficiencia y confort en el trabajo.
- Cumplimiento de estándares internacionales de calidad e inocuidad.`,
    tags: ["Plan SOL", "Seguridad", "Normativa"],
    createdAt: "2025-10-23T09:00:00.000Z"
  }
];

// Estado global de la vista de noticias
let allNews = [];
let filteredNews = [];
let activeCategory = "todas";
let searchQuery = "";
let currentPage = 1;
const ITEMS_PER_PAGE = 6;

let currentUser = null;
let authorizedEmails = [];
let isAuthorizedAdmin = false;
let newsIdToDelete = null;
let toastTimeout = null;

// Exponer newsData globalmente para compatibilidad con scripts existentes
window.newsData = {};

// ============================================================== //
// 1. INICIALIZACIÓN
// ============================================================== //
document.addEventListener("DOMContentLoaded", async () => {
  await loadAuthorizedEmails();
  initAuthListener();
  initDOMEvents();
  initFirestoreNewsListener();
});

// Cargar correos autorizados
async function loadAuthorizedEmails() {
  try {
    const res = await fetch("js/correos_Autorizados.json");
    if (res.ok) {
      const data = await res.json();
      authorizedEmails = (data.autorizados || []).map((e) => e.toLowerCase().trim());
    }
  } catch (err) {
    console.warn("No se pudo cargar correos_Autorizados.json:", err);
  }
}

// Escuchar estado de sesión
function initAuthListener() {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const email = (user?.email || "").toLowerCase().trim();
    isAuthorizedAdmin = authorizedEmails.includes(email);

    updateHeaderSessionUI(user);
    updateAdminControlsUI();
    filterAndRenderNews();
  });
}

// Actualizar barra de sesión en el Header
function updateHeaderSessionUI(user) {
  const container = document.getElementById("header-user-status");
  if (!container) return;

  if (user) {
    const displayName = user.displayName || user.email.split("@")[0];
    const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&size=64`;

    container.innerHTML = `
      <div class="flex items-center space-x-2">
        ${
          isAuthorizedAdmin
            ? `
          <a href="admin_tickets.html" class="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white rounded-lg text-xs font-tech font-bold transition-all shadow-sm flex items-center space-x-1 border border-blue-400/40">
            <i data-feather="shield" class="w-3.5 h-3.5 text-cyan-300"></i>
            <span>Staff</span>
          </a>
        `
            : ""
        }
        <div class="flex items-center space-x-2 bg-white/80 border border-blue-200/80 px-2.5 py-1 rounded-full shadow-sm">
          <img src="${avatarUrl}" alt="Avatar" class="w-6 h-6 rounded-full border border-blue-400 object-cover" />
          <div class="text-left hidden lg:block leading-tight">
            <p class="text-xs font-bold text-gray-800 font-tech truncate max-w-[110px]">${displayName}</p>
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
        window.location.reload();
      } catch (e) {
        console.error("Error al salir:", e);
      }
    });
  } else {
    container.innerHTML = `
      <a href="login.html" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-tech font-bold shadow-sm transition-colors flex items-center space-x-1.5">
        <i data-feather="user" class="w-3.5 h-3.5"></i>
        <span>Acceder</span>
      </a>
    `;
  }

  if (window.feather) window.feather.replace();
}

// Mostrar/ocultar barra de administración de noticias
function updateAdminControlsUI() {
  const adminBar = document.getElementById("admin-news-bar");
  if (!adminBar) return;
  if (isAuthorizedAdmin) {
    adminBar.classList.remove("hidden");
  } else {
    adminBar.classList.add("hidden");
  }
}

// ============================================================== //
// 2. SINCRONIZACIÓN EN TIEMPO REAL CON FIRESTORE
// ============================================================== //
function initFirestoreNewsListener() {
  try {
    const newsCol = collection(db, "news");
    const newsQuery = query(newsCol, orderBy("createdAt", "desc"));

    onSnapshot(
      newsQuery,
      async (snapshot) => {
        // Si no existen documentos, inicializar con las noticias institucionales
        if (snapshot.empty) {
          console.log("[Firestore] Colección 'news' vacía. Inicializando noticias base...");
          await seedInitialNews();
          return;
        }

        allNews = [];
        window.newsData = {};

        snapshot.forEach((docSnap) => {
          const item = {
            id: docSnap.id,
            ...docSnap.data()
          };
          allNews.push(item);
          window.newsData[item.id] = item;
        });

        filterAndRenderNews();
      },
      (error) => {
        console.error("[Firestore Error] Error al escuchar 'news':", error);
        // Fallback en memoria si ocurre un error temporal
        if (allNews.length === 0) {
          allNews = INITIAL_SEED_NEWS.map((item, idx) => ({ id: "seed-" + idx, ...item }));
          filterAndRenderNews();
        }
      }
    );
  } catch (err) {
    console.error("Error inicializando escucha Firestore:", err);
  }
}

// Carga inicial de noticias en Firestore
async function seedInitialNews() {
  try {
    const newsCol = collection(db, "news");
    for (const item of INITIAL_SEED_NEWS) {
      await addDoc(newsCol, {
        ...item,
        createdByEmail: "admin@minibruno.com",
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn("No se pudo sembrar noticias iniciales en Firestore:", err);
    allNews = INITIAL_SEED_NEWS.map((item, idx) => ({ id: "seed-" + idx, ...item }));
    filterAndRenderNews();
  }
}

// ============================================================== //
// 3. FILTRADO, CONTEO EXACTO Y PAGINACIÓN
// ============================================================== //
function filterAndRenderNews() {
  const queryClean = searchQuery.toLowerCase().trim();

  // Filtrado por categoría y por buscador
  filteredNews = allNews.filter((item) => {
    const matchesCategory =
      activeCategory === "todas" ||
      (item.category || "").toLowerCase() === activeCategory.toLowerCase();

    if (!matchesCategory) return false;

    if (!queryClean) return true;

    const inTitle = (item.title || "").toLowerCase().includes(queryClean);
    const inSummary = (item.summary || "").toLowerCase().includes(queryClean);
    const inAuthor = (item.authorName || "").toLowerCase().includes(queryClean);
    const inContent = (item.content || "").toLowerCase().includes(queryClean);
    const inTags = Array.isArray(item.tags)
      ? item.tags.some((t) => t.toLowerCase().includes(queryClean))
      : false;

    return inTitle || inSummary || inAuthor || inContent || inTags;
  });

  // Ajustar página si queda fuera de rango
  const totalItems = filteredNews.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  // 1. Actualizar contador exacto en pantalla (Solución al requerimiento del usuario)
  updateResultsCounter(totalItems, totalPages);

  // 2. Renderizar tarjetas de la página activa
  renderNewsGrid();

  // 3. Renderizar botones de paginación
  renderPaginationControls(totalPages);
}

// Actualizar textos informativos de resultados y filtros
function updateResultsCounter(total, totalPages) {
  const resultsCount = document.getElementById("resultsCount");
  const currentFilters = document.getElementById("currentFilters");
  const catMeta = CATEGORY_META[activeCategory] || { label: activeCategory };

  if (resultsCount) {
    if (total === 0) {
      resultsCount.innerHTML = `<span class="text-amber-600 font-bold">No se encontraron noticias</span> para esta selección.`;
    } else if (total === 1) {
      resultsCount.innerHTML = `Viendo <strong>1</strong> noticia en <strong>${catMeta.label}</strong>`;
    } else {
      const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
      const endItem = Math.min(currentPage * ITEMS_PER_PAGE, total);
      resultsCount.innerHTML = `Mostrando <strong>${startItem}-${endItem}</strong> de <strong>${total}</strong> noticias en <strong>${catMeta.label}</strong>`;
    }
  }

  if (currentFilters) {
    let filterText = `Categoría: <strong>${catMeta.label}</strong>`;
    if (searchQuery.trim()) {
      filterText += ` | Búsqueda: <strong>"${escapeHtml(searchQuery)}"</strong>`;
    }
    currentFilters.innerHTML = `Filtros activos: ${filterText}`;
  }

  const pageIndicator = document.getElementById("pageIndicator");
  if (pageIndicator) {
    pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
  }
}

// Renderizar tarjetas del grid
function renderNewsGrid() {
  const grid = document.getElementById("newsGrid");
  if (!grid) return;

  if (filteredNews.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white/60 border border-slate-200 rounded-2xl p-8 backdrop-blur-sm shadow-sm">
        <div class="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <i data-feather="inbox" class="w-7 h-7"></i>
        </div>
        <h4 class="font-tech text-base font-bold text-slate-800 mb-1">Sin Noticias para esta Selección</h4>
        <p class="text-xs text-slate-500 max-w-md mx-auto mb-5">No hay comunicados registrados bajo la categoría o término buscado.</p>
        ${
          isAuthorizedAdmin
            ? `
          <button type="button" class="btn-create-here px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-tech font-bold transition-all shadow-sm">
            + Publicar la primera noticia en esta sección
          </button>
        `
            : `
          <button type="button" id="btn-reset-filters" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-tech font-bold transition-colors">
            Ver todas las categorías
          </button>
        `
        }
      </div>
    `;

    grid.querySelector(".btn-create-here")?.addEventListener("click", () => openNewsEditorModal());
    grid.querySelector("#btn-reset-filters")?.addEventListener("click", () => {
      document.querySelectorAll(".category-pill").forEach((btn) => btn.classList.remove("active"));
      document.querySelector('.category-pill[data-category="todas"]')?.classList.add("active");
      activeCategory = "todas";
      searchQuery = "";
      const searchInput = document.getElementById("newsSearch");
      if (searchInput) searchInput.value = "";
      currentPage = 1;
      filterAndRenderNews();
    });

    if (window.feather) window.feather.replace();
    return;
  }

  // Segmentar para la página actual
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredNews.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  grid.innerHTML = pageItems
    .map((item) => {
      const catKey = (item.category || "innovacion").toLowerCase();
      const meta = CATEGORY_META[catKey] || { label: item.category || "General", icon: "bookmark", pillClass: "bg-blue-50 text-blue-700 border-blue-200" };
      const dateFormatted = formatDisplayDate(item.createdAt);
      const tags = Array.isArray(item.tags) ? item.tags : [];

      return `
        <div class="news-card rounded-2xl p-6 cursor-pointer bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between" data-news-id="${item.id}">
          <div>
            <!-- Header de tarjeta: Categoría y Fecha -->
            <div class="flex items-center justify-between mb-3 gap-2">
              <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-tech font-bold uppercase tracking-wider border ${meta.pillClass}">
                <i data-feather="${meta.icon}" class="w-3 h-3"></i>
                <span>${meta.label}</span>
              </span>
              <span class="text-[11px] text-slate-400 font-mono">${dateFormatted}</span>
            </div>

            <!-- Título -->
            <h3 class="news-title font-tech text-lg font-bold text-slate-900 mb-2 leading-snug hover:text-blue-600 transition-colors">
              ${escapeHtml(item.title)}
            </h3>

            <!-- Resumen -->
            <p class="news-summary text-slate-600 text-xs leading-relaxed line-clamp-3 mb-4 text-justify">
              ${escapeHtml(item.summary || "")}
            </p>
          </div>

          <div>
            <!-- Autor y Rol -->
            <div class="flex items-center space-x-2 pt-3 border-t border-slate-100 text-xs text-slate-600 mb-3">
              <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-tech font-bold text-[10px] flex-shrink-0">
                ${(item.authorName || "MB").substring(0, 2).toUpperCase()}
              </div>
              <div class="truncate">
                <span class="font-bold text-slate-800">${escapeHtml(item.authorName || "Mini Bruno")}</span>
                ${item.authorRole ? `<span class="text-slate-400 text-[10px]"> • ${escapeHtml(item.authorRole)}</span>` : ""}
              </div>
            </div>

            <!-- Etiquetas -->
            ${
              tags.length > 0
                ? `
              <div class="flex flex-wrap gap-1.5 mb-4">
                ${tags
                  .map(
                    (tag) => `
                  <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-tech font-semibold">
                    #${escapeHtml(tag.trim())}
                  </span>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            <!-- Botones de Acción -->
            <div class="flex items-center justify-between pt-2">
              <button type="button" class="btn-read-news px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl font-tech text-xs font-bold transition-all flex items-center space-x-1.5 border border-blue-200 hover:border-blue-600 shadow-sm" data-news-id="${item.id}">
                <span>Leer Noticia</span>
                <i data-feather="arrow-right" class="w-3.5 h-3.5"></i>
              </button>

              ${
                isAuthorizedAdmin
                  ? `
                <div class="flex items-center space-x-1">
                  <button type="button" class="btn-edit-news p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-colors shadow-sm" title="Editar Noticia" data-news-id="${item.id}">
                    <i data-feather="edit-2" class="w-3.5 h-3.5"></i>
                  </button>
                  <button type="button" class="btn-delete-news p-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg transition-colors border border-red-200 hover:border-red-600 shadow-sm" title="Eliminar de Firestore" data-news-id="${item.id}">
                    <i data-feather="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  // Eventos de botones en tarjetas
  grid.querySelectorAll(".btn-read-news").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.newsId;
      openNewsReaderModal(id);
    });
  });

  grid.querySelectorAll(".btn-edit-news").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.newsId;
      openNewsEditorModal(id);
    });
  });

  grid.querySelectorAll(".btn-delete-news").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.newsId;
      openNewsDeleteModal(id);
    });
  });

  // Abrir al hacer clic en toda la tarjeta si no fue en un botón
  grid.querySelectorAll(".news-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.newsId;
      openNewsReaderModal(id);
    });
  });

  if (window.feather) window.feather.replace();
}

// Renderizar controles de paginación
function renderPaginationControls(totalPages) {
  const container = document.getElementById("pageNumbers");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  if (!container) return;
  container.innerHTML = "";

  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    prevBtn.style.opacity = currentPage <= 1 ? "0.4" : "1";
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.style.opacity = currentPage >= totalPages ? "0.4" : "1";
  }

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `page-item px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all ${
      i === currentPage ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
    }`;
    btn.textContent = i;
    btn.addEventListener("click", () => {
      currentPage = i;
      filterAndRenderNews();
      document.getElementById("newsGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    container.appendChild(btn);
  }
}

// ============================================================== //
// 4. MODAL DE LECTURA DE NOTICIAS
// ============================================================== //
function openNewsReaderModal(newsId) {
  const item = allNews.find((x) => x.id === newsId);
  if (!item) return;

  const modal = document.getElementById("newsModal");
  if (!modal) return;

  const catKey = (item.category || "innovacion").toLowerCase();
  const meta = CATEGORY_META[catKey] || { label: item.category || "General", icon: "bookmark" };

  document.getElementById("modalTitle").textContent = item.title;
  document.getElementById("modalPublishDate").textContent = formatDisplayDate(item.createdAt);
  document.getElementById("modalCategoryLabel").textContent = meta.label;
  document.getElementById("modalCategoryIcon")?.setAttribute("data-feather", meta.icon);

  document.getElementById("authorName").textContent = item.authorName || "Mini Bruno";
  document.getElementById("authorRole").textContent = item.authorRole || "Comunicación Corporativa";
  document.getElementById("modalAuthorInitials").textContent = (item.authorName || "MB").substring(0, 2).toUpperCase();

  // Formatear contenido en párrafos
  const bodyEl = document.getElementById("modalBody");
  if (bodyEl) {
    const rawContent = item.content || item.summary || "";
    // Separar por saltos de línea para generar párrafos
    const paragraphs = rawContent
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    bodyEl.innerHTML = paragraphs
      .map((p) => `<p class="mb-3 leading-relaxed text-slate-700 text-justify">${escapeHtml(p)}</p>`)
      .join("");
  }

  // Tags
  const tagsContainer = document.getElementById("modalTags");
  if (tagsContainer) {
    tagsContainer.innerHTML = "";
    const tags = Array.isArray(item.tags) ? item.tags : [];
    tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-tech font-semibold border border-blue-200";
      chip.textContent = `#${tag.trim()}`;
      tagsContainer.appendChild(chip);
    });
  }

  // Botones de administración dentro del modal de lectura
  const adminActions = document.getElementById("modalAdminActionsInModal");
  if (adminActions) {
    if (isAuthorizedAdmin) {
      adminActions.className = "flex items-center space-x-2";
      adminActions.innerHTML = `
        <button type="button" id="modal-reader-edit-btn" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-tech font-bold transition-all shadow-sm flex items-center space-x-1">
          <i data-feather="edit" class="w-3.5 h-3.5"></i>
          <span>Editar</span>
        </button>
      `;
      document.getElementById("modal-reader-edit-btn")?.addEventListener("click", () => {
        closeNewsReaderModal();
        openNewsEditorModal(item.id);
      });
    } else {
      adminActions.className = "hidden";
      adminActions.innerHTML = "";
    }
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  if (window.feather) window.feather.replace();
}

function closeNewsReaderModal() {
  const modal = document.getElementById("newsModal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

// ============================================================== //
// 5. GESTIÓN: CREACIÓN Y EDICIÓN DE NOTICIAS (FIRESTORE)
// ============================================================== //
function openNewsEditorModal(newsId = null) {
  const modal = document.getElementById("news-editor-modal");
  if (!modal) return;

  const titleModalEl = document.getElementById("editor-modal-title");
  const submitBtnText = document.getElementById("save-news-btn-text");
  const idInput = document.getElementById("editor-news-id");

  const titleInput = document.getElementById("editor-title");
  const categorySelect = document.getElementById("editor-category");
  const tagsInput = document.getElementById("editor-tags");
  const authorNameInput = document.getElementById("editor-author-name");
  const authorRoleInput = document.getElementById("editor-author-role");
  const summaryInput = document.getElementById("editor-summary");
  const contentInput = document.getElementById("editor-content");

  if (newsId) {
    // Modo Edición
    const item = allNews.find((x) => x.id === newsId);
    if (!item) return;

    idInput.value = item.id;
    titleModalEl.textContent = "Editar Noticia";
    submitBtnText.textContent = "Guardar Cambios";

    titleInput.value = item.title || "";
    categorySelect.value = item.category || "innovacion";
    tagsInput.value = Array.isArray(item.tags) ? item.tags.join(", ") : "";
    authorNameInput.value = item.authorName || "";
    authorRoleInput.value = item.authorRole || "";
    summaryInput.value = item.summary || "";
    contentInput.value = item.content || "";
  } else {
    // Modo Creación
    idInput.value = "";
    titleModalEl.textContent = "Redactar Nueva Noticia";
    submitBtnText.textContent = "Guardar en Base de Datos";

    titleInput.value = "";
    categorySelect.value = activeCategory !== "todas" ? activeCategory : "innovacion";
    tagsInput.value = "";
    authorNameInput.value = currentUser?.displayName || (currentUser?.email ? currentUser.email.split("@")[0] : "Depto. de Sistemas / TI");
    authorRoleInput.value = "Gerencia de Sistemas / TI";
    summaryInput.value = "";
    contentInput.value = "";
  }

  modal.classList.remove("hidden");
  if (window.feather) window.feather.replace();
}

function closeNewsEditorModal() {
  const modal = document.getElementById("news-editor-modal");
  if (modal) modal.classList.add("hidden");
}

// Guardar noticia (Crear o Actualizar en Firestore)
async function handleNewsFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("editor-news-id").value;
  const title = document.getElementById("editor-title").value.trim();
  const category = document.getElementById("editor-category").value;
  const authorName = document.getElementById("editor-author-name").value.trim();
  const authorRole = document.getElementById("editor-author-role").value.trim();
  const summary = document.getElementById("editor-summary").value.trim();
  const content = document.getElementById("editor-content").value.trim();
  const rawTags = document.getElementById("editor-tags").value;

  const tags = rawTags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const saveBtn = document.getElementById("save-news-btn");
  const saveBtnText = document.getElementById("save-news-btn-text");

  try {
    saveBtn.disabled = true;
    saveBtnText.textContent = "Guardando en Firestore...";

    const payload = {
      title,
      category,
      authorName,
      authorRole,
      summary,
      content,
      tags,
      updatedAt: new Date().toISOString()
    };

    if (id) {
      // Actualización
      await updateDoc(doc(db, "news", id), payload);
      showNewsToast("Noticia Actualizada", `Los cambios en "${title}" se guardaron en la base de datos.`);
    } else {
      // Creación
      payload.createdAt = new Date().toISOString();
      payload.createdByEmail = currentUser?.email || "admin@minibruno.com";
      await addDoc(collection(db, "news"), payload);
      showNewsToast("Noticia Publicada", `"${title}" ha sido publicada en la base de datos.`);
    }

    closeNewsEditorModal();
  } catch (err) {
    console.error("Error guardando noticia en Firestore:", err);
    showNewsToast("Error al Guardar", "No se pudo guardar la noticia: " + err.message, true);
  } finally {
    saveBtn.disabled = false;
    saveBtnText.textContent = id ? "Guardar Cambios" : "Guardar en Base de Datos";
  }
}

// ============================================================== //
// 6. GESTIÓN: ELIMINACIÓN DE NOTICIAS DE FIRESTORE
// ============================================================== //
function openNewsDeleteModal(newsId) {
  newsIdToDelete = newsId;
  const item = allNews.find((x) => x.id === newsId);
  if (!item) return;

  const modal = document.getElementById("news-delete-modal");
  if (!modal) return;

  document.getElementById("delete-news-title").textContent = item.title;
  modal.classList.remove("hidden");
  if (window.feather) window.feather.replace();
}

function closeNewsDeleteModal() {
  const modal = document.getElementById("news-delete-modal");
  if (modal) modal.classList.add("hidden");
  newsIdToDelete = null;
}

async function confirmDeleteNews() {
  if (!newsIdToDelete) return;

  const confirmBtn = document.getElementById("confirm-delete-news-btn");
  const confirmBtnText = document.getElementById("confirm-del-btn-text");

  try {
    confirmBtn.disabled = true;
    confirmBtnText.textContent = "Borrando...";

    await deleteDoc(doc(db, "news", newsIdToDelete));
    closeNewsDeleteModal();
    showNewsToast("Noticia Eliminada", "El registro fue eliminado permanentemente de Firestore.");
  } catch (err) {
    console.error("Error eliminando noticia:", err);
    showNewsToast("Error al Eliminar", "No se pudo eliminar la noticia: " + err.message, true);
  } finally {
    confirmBtn.disabled = false;
    confirmBtnText.textContent = "Confirmar y Eliminar";
  }
}

// ============================================================== //
// 7. TOAST NOTIFICACIÓN CORPORATIVA
// ============================================================== //
function showNewsToast(title, message, isError = false) {
  const toast = document.getElementById("news-toast");
  if (!toast) return;

  const titleEl = document.getElementById("news-toast-title");
  const descEl = document.getElementById("news-toast-desc");
  const iconBox = document.getElementById("news-toast-icon-box");
  const icon = document.getElementById("news-toast-icon");

  titleEl.textContent = title;
  descEl.textContent = message;

  if (isError) {
    if (iconBox) iconBox.className = "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600";
    if (icon && icon.setAttribute) icon.setAttribute("data-feather", "alert-circle");
    toast.className = "fixed bottom-6 right-6 z-50 p-4 rounded-2xl flex items-center space-x-3 shadow-2xl border border-red-200 max-w-md transition-all animate__animated animate__fadeInUp bg-red-50";
  } else {
    if (iconBox) iconBox.className = "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-600";
    if (icon && icon.setAttribute) icon.setAttribute("data-feather", "check");
    toast.className = "fixed bottom-6 right-6 z-50 p-4 rounded-2xl flex items-center space-x-3 shadow-2xl border border-emerald-200 max-w-md transition-all animate__animated animate__fadeInUp bg-emerald-50";
  }

  if (window.feather) window.feather.replace();
  toast.classList.remove("hidden");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 5000);
}

// ============================================================== //
// 8. EVENT LISTENERS GENERALES
// ============================================================== //
function initDOMEvents() {
  // Buscador
  document.getElementById("newsSearch")?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    filterAndRenderNews();
  });

  // Categorías pills
  document.querySelectorAll(".category-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".category-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.dataset.category || "todas";
      currentPage = 1;
      filterAndRenderNews();
    });
  });

  // Botón abrir redacción desde la barra admin
  document.getElementById("btn-open-create-news")?.addEventListener("click", () => {
    openNewsEditorModal();
  });

  // Cerrar editor
  document.getElementById("close-editor-modal-btn")?.addEventListener("click", closeNewsEditorModal);
  document.getElementById("cancel-editor-btn")?.addEventListener("click", closeNewsEditorModal);

  // Submit formulario editor
  document.getElementById("news-editor-form")?.addEventListener("submit", handleNewsFormSubmit);

  // Cerrar modal borrado
  document.getElementById("cancel-delete-news-btn")?.addEventListener("click", closeNewsDeleteModal);
  document.getElementById("confirm-delete-news-btn")?.addEventListener("click", confirmDeleteNews);

  // Cerrar modal lectura
  document.getElementById("closeModal")?.addEventListener("click", closeNewsReaderModal);
  document.getElementById("newsModal")?.addEventListener("click", (e) => {
    if (e.target.id === "newsModal") closeNewsReaderModal();
  });

  // Botones de paginación
  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      filterAndRenderNews();
      document.getElementById("newsGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
      currentPage++;
      filterAndRenderNews();
      document.getElementById("newsGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

// Helpers
function formatDisplayDate(dateStr) {
  if (!dateStr) return "--";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch (e) {
    return dateStr;
  }
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

// Exponer funciones necesarias para compatibilidad
window.openNewsModal = openNewsReaderModal;
window.newsPagination = {
  filterByCategory: (cat) => {
    activeCategory = cat;
    currentPage = 1;
    filterAndRenderNews();
  },
  filterBySearch: (q) => {
    searchQuery = q;
    currentPage = 1;
    filterAndRenderNews();
  }
};
