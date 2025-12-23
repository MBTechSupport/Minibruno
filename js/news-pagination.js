// ====================================================================== //
//  SISTEMA DE PAGINACIÓN DINÁMICA PARA NOTICIAS
// ====================================================================== //
// Este archivo implementa un sistema de paginación completamente dinámico
// que detecta automáticamente las noticias, las divide en páginas de 24
// y genera la navegación correspondiente.
// ====================================================================== //

const ITEMS_PER_PAGE = 24; // 24 noticias por página
let currentPage = 1;
let totalPages = 1;
let allNewsCards = [];
let filteredNewsCards = [];

// ====================================================================== //
// INICIALIZACIÓN DEL SISTEMA DE PAGINACIÓN
// ====================================================================== //

/**
 * Inicializa el sistema de paginación
 * Detecta automáticamente todas las news-card y configura la paginación
 */
function initPaginationSystem() {
    // Detectar todas las cards de noticias
    allNewsCards = Array.from(document.querySelectorAll('.news-card'));
    filteredNewsCards = [...allNewsCards]; // Copia inicial

    totalPages = Math.ceil(filteredNewsCards.length / ITEMS_PER_PAGE);
    currentPage = 1;

    // Generar navegación de páginas
    generatePagination();

    // Mostrar la primera página
    showPage(1);

    // Configurar event listeners
    setupPaginationEvents();

    // Actualizar contador
    updateResultsCount();

    // [MODIFICADO] Ocultar categorías vacías al iniciar
    // hideEmptyCategories(); // Comentado por solicitud del usuario: quiere poder seleccionar aunque esté vacía
}

// ====================================================================== //
// GENERACIÓN DINÁMICA DE PAGINACIÓN
// ====================================================================== //

/**
 * Genera dinámicamente los botones de paginación
 */
function generatePagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    if (totalPages <= 1) {
        pageNumbers.innerHTML = '<div class="page-item active" data-page="1">1</div>';
        document.getElementById('prevPage').classList.add('disabled');
        document.getElementById('nextPage').classList.add('disabled');
        return;
    }

    // Lógica para mostrar páginas: máximo 7 botones visibles
    const maxVisible = 7;
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Ajustar inicio si estamos cerca del final
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Primera página (siempre visible si no está en el rango)
    if (startPage > 1) {
        addPageButton(1);
        if (startPage > 2) {
            addEllipsis();
        }
    }

    // Páginas del rango
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i);
    }

    // Última página (siempre visible si no está en el rango)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            addEllipsis();
        }
        addPageButton(totalPages);
    }
}

/**
 * Añade un botón de página
 */
function addPageButton(pageNum) {
    const pageNumbers = document.getElementById('pageNumbers');
    const pageItem = document.createElement('div');
    pageItem.className = `page-item${pageNum === currentPage ? ' active' : ''}`;
    pageItem.setAttribute('data-page', pageNum);
    pageItem.textContent = pageNum;
    pageNumbers.appendChild(pageItem);
}

/**
 * Añade puntos suspensivos
 */
function addEllipsis() {
    const pageNumbers = document.getElementById('pageNumbers');
    const ellipsis = document.createElement('div');
    ellipsis.className = 'page-item disabled';
    ellipsis.textContent = '...';
    pageNumbers.appendChild(ellipsis);
}

// ====================================================================== //
// NAVEGACIÓN DE PÁGINAS
// ====================================================================== //

/**
 * Muestra una página específica
 */
function showPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages) return;

    currentPage = pageNumber;

    // Ocultar todas las cards
    allNewsCards.forEach(card => {
        card.style.display = 'none';
        card.classList.remove('fade-in');
    });

    // Calcular rango de cards a mostrar
    const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredNewsCards.length);

    // Mostrar cards de la página actual con animación escalonada
    for (let i = startIndex; i < endIndex; i++) {
        const card = filteredNewsCards[i];
        card.style.display = 'block';

        // Animación escalonada
        setTimeout(() => {
            card.classList.add('fade-in');
        }, (i - startIndex) * 50); // 50ms de delay entre cada card
    }

    // Actualizar botones de navegación
    updateNavigationButtons();

    // Actualizar números de página
    generatePagination();

    // Actualizar contador
    updateResultsCount();

    // Scroll suave al inicio de las noticias
    const newsGrid = document.getElementById('newsGrid');
    if (newsGrid) {
        newsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Actualiza el estado de los botones Anterior/Siguiente
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    // Botón Anterior
    if (currentPage <= 1) {
        prevBtn.classList.add('disabled');
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.classList.remove('disabled');
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }

    // Botón Siguiente
    if (currentPage >= totalPages) {
        nextBtn.classList.add('disabled');
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.classList.remove('disabled');
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

/**
 * Actualiza el contador de resultados
 */
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    const total = filteredNewsCards.length;

    // Si no hay noticias
    if (total === 0) {
        resultsCount.textContent = 'No se encontraron noticias para esta selección.';
        return;
    }
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, total);

    // Formato inteligente: Singular vs Plural
    if (total === 1) {
        resultsCount.innerHTML = `Viendo <strong>1</strong> noticia`;
    } else {
        resultsCount.innerHTML = `Mostrando <strong>${startItem}-${endItem}</strong> de <strong>${total}</strong> noticias`;
    }

    // Añadir contexto de página si hay más de una
    if (totalPages > 1) {
        resultsCount.innerHTML += ` (Página ${currentPage} de ${totalPages})`;
    }
}

// ====================================================================== //
// EVENT LISTENERS
// ====================================================================== //

/**
 * Configura los event listeners para la paginación
 */
function setupPaginationEvents() {
    // Botón Anterior
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });

    // Botón Siguiente
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            showPage(currentPage + 1);
        }
    });

    // Delegación de eventos para botones de página
    document.getElementById('pageNumbers').addEventListener('click', (e) => {
        if (e.target.classList.contains('page-item') && !e.target.classList.contains('disabled')) {
            const pageNum = parseInt(e.target.getAttribute('data-page'));
            if (pageNum && !isNaN(pageNum)) {
                showPage(pageNum);
            }
        }
    });
}

// ====================================================================== //
// FILTRADO Y BÚSQUEDA (INTEGRACIÓN CON PAGINACIÓN)
// ====================================================================== //

/**
 * Actualiza la paginación después de filtrar
 */
function updateAfterFilter() {
    // Recalcular páginas basadas en las noticias filtradas
    totalPages = Math.ceil(filteredNewsCards.length / ITEMS_PER_PAGE);
    currentPage = 1; // Volver a la primera página después de filtrar

    // Caso especial: No hay resultados
    if (filteredNewsCards.length === 0) {
        // Ocultar todas las cards
        allNewsCards.forEach(card => card.style.display = 'none');

        // Actualizar paginación (vacía o deshabilitada)
        generatePagination();

        // Actualizar contador
        updateResultsCount();

        // Actualizar botones de navegación
        updateNavigationButtons();
        return;
    }

    // Regenerar paginación
    generatePagination();

    // Mostrar primera página
    showPage(1);
}

/**
 * Filtra noticias por categoría (INTEGRADO CON PAGINACIÓN)
 */
function filterNewsByCategory(category) {
    if (category === 'todas') {
        filteredNewsCards = [...allNewsCards];
    } else {
        filteredNewsCards = allNewsCards.filter(card => {
            const newsId = card.getAttribute('data-news-id');
            // [CORREGIDO] Usar window.newsData explícitamente y con seguridad
            const news = window.newsData && window.newsData[newsId];
            return news && news.category === category;
        });
    }

    updateAfterFilter();
}

/**
 * Filtra noticias por búsqueda (INTEGRADO CON PAGINACIÓN)
 */
function filterNewsBySearch(searchTerm) {
    searchTerm = searchTerm.toLowerCase().trim();

    if (!searchTerm) {
        // Si no hay búsqueda, mostrar todas las noticias filtradas por categoría actual
        const activeCategory = document.querySelector('.category-item.active');
        const category = activeCategory ? activeCategory.getAttribute('data-category') : 'todas';
        filterNewsByCategory(category);
        return;
    }

    filteredNewsCards = allNewsCards.filter(card => {
        const title = card.querySelector('.news-title')?.textContent.toLowerCase() || '';
        const summary = card.querySelector('.news-summary')?.textContent.toLowerCase() || '';
        return title.includes(searchTerm) || summary.includes(searchTerm);
    });

    updateAfterFilter();
}

/**
 * Filtra noticias por ordenamiento
 */

function sortNews(sortType) {
    if (sortType === 'date-desc' || sortType === 'fecha') {
        // Ordenar por fecha (más reciente primero - usando timestamp)
        filteredNewsCards.sort((a, b) => {
            const timeA = parseInt(a.getAttribute('data-timestamp')) || 0;
            const timeB = parseInt(b.getAttribute('data-timestamp')) || 0;
            return timeB - timeA; // Descendente
        });
    } else if (sortType === 'date-asc') {
        // Ordenar por fecha (más antigua primero - usando timestamp)
        filteredNewsCards.sort((a, b) => {
            const timeA = parseInt(a.getAttribute('data-timestamp')) || 0;
            const timeB = parseInt(b.getAttribute('data-timestamp')) || 0;
            return timeA - timeB; // Ascendente
        });
    } else if (sortType === 'title-asc' || sortType === 'titulo') {
        // Ordenar alfabéticamente A-Z
        filteredNewsCards.sort((a, b) => {
            const titleA = a.querySelector('.news-title')?.textContent.trim().toLowerCase() || '';
            const titleB = b.querySelector('.news-title')?.textContent.trim().toLowerCase() || '';
            return titleA.localeCompare(titleB);
        });
    } else if (sortType === 'title-desc') {
        // Ordenar alfabéticamente Z-A
        filteredNewsCards.sort((a, b) => {
            const titleA = a.querySelector('.news-title')?.textContent.trim().toLowerCase() || '';
            const titleB = b.querySelector('.news-title')?.textContent.trim().toLowerCase() || '';
            return titleB.localeCompare(titleA);
        });
    }

    updateAfterFilter();
}

// ====================================================================== //
// INTEGRACIÓN CON CÓDIGO EXISTENTE
// ====================================================================== //

/**
 * Añade una nueva noticia al sistema (UPDATE AUTOMÁTICO)
 * Esta función se llama cuando se crea una nueva noticia
 */
function addNewsToSystem(newsCard) {
    // Añadir la nueva card a los arrays
    allNewsCards.push(newsCard);

    // Si está dentro de los filtros actuales, añadirla a filteredNewsCards
    const activeCategory = document.querySelector('.category-item.active');
    const category = activeCategory ? activeCategory.getAttribute('data-category') : 'todas';

    if (category === 'todas') {
        filteredNewsCards.push(newsCard);
    } else {
        const newsId = newsCard.getAttribute('data-news-id');
        const news = window.newsData && window.newsData[newsId];
        if (news && news.category === category) {
            filteredNewsCards.push(newsCard);
        }
    }

    // Actualizar paginación
    updateAfterFilter();
}

// ====================================================================== //
// INICIALIZACIÓN
// ====================================================================== //

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Esperar un momento para que todas las cards estén renderizadas
    setTimeout(() => {
        initPaginationSystem();
    }, 500);
});

/**
 * [NUEVO] Oculta categorías que no tienen noticias
 */
function hideEmptyCategories() {
    const categories = document.querySelectorAll('.category-item');
    categories.forEach(cat => {
        const categoryName = cat.getAttribute('data-category');
        if (categoryName === 'todas') return;

        // Contar noticias de esta categoría
        const count = allNewsCards.filter(card => {
            const newsId = card.getAttribute('data-news-id');
            const news = window.newsData && window.newsData[newsId];
            return news && news.category === categoryName;
        }).length;

        if (count === 0) {
            cat.style.display = 'none';
        } else {
            cat.style.display = 'flex';
        }
    });
}

/**
 * [NUEVO] Parsea fechas en formato español (ej: "02 Oct 2025")
 */
function parseSpanishDate(dateStr) {
    if (!dateStr) return 0;

    // Limpiar string: eliminar espacios extra y convertir a minúsculas
    dateStr = dateStr.trim().toLowerCase();

    const months = {
        'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
    };

    // Separar por espacios o guiones si es necesario
    const parts = dateStr.split(' ');
    if (parts.length < 3) return 0;

    const day = parseInt(parts[0]);
    const monthStr = parts[1].substring(0, 3);
    const month = months[monthStr];
    const year = parseInt(parts[2]);

    if (isNaN(day) || month === undefined || isNaN(year)) {
        console.warn('Fecha inválida:', dateStr);
        return 0;
    }

    return new Date(year, month, day).getTime();
}

// ====================================================================== //
// EXPORT (para uso en news.js)
// ====================================================================== //
// Estas funciones están disponibles globalmente para ser usadas en news.js
window.newsPagination = {
    init: initPaginationSystem,
    filterByCategory: filterNewsByCategory,
    filterBySearch: filterNewsBySearch,
    sortNews: sortNews,
    addNews: addNewsToSystem,
    refresh: updateAfterFilter,
    recheckCategories: hideEmptyCategories // [NUEVO] Exponer para llamar al crear nuevas noticias
};
