// ====================================================================== //
//  FUNCIONALIDADES PREMIUM FINALES PARA NEWS
// ====================================================================== //

(function () {
    'use strict';

    // ====================================================================== //
    // HERO CAROUSEL CON FADE SCROLL AUTOMÁTICO
    // ====================================================================== //

    let currentSlide = 0;
    let totalSlides = 0;
    let carouselInterval = null;

    function initHeroCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        totalSlides = slides.length;

        if (totalSlides === 0) return;

        // Mostrar la primera slide
        slides[0].classList.add('active');

        // Iniciar transición automática cada 4 segundos
        carouselInterval = setInterval(nextSlide, 4000);
    }

    function nextSlide() {
        const slides = document.querySelectorAll('.carousel-slide');

        // Remover active de la slide actual
        slides[currentSlide].classList.remove('active');

        // Incrementar índice
        currentSlide = (currentSlide + 1) % totalSlides;

        // Añadir active a la nueva slide
        slides[currentSlide].classList.add('active');
    }

    // ====================================================================== //
    // BOTONES DE ORDENAMIENTO PREMIUM
    // ====================================================================== //

    // ====================================================================== //
    // BOTONES DE ORDENAMIENTO (ELIMINADO)
    // ====================================================================== //
    // La función initSortSelect ha sido removida por solicitud.

    // ====================================================================== //
    // CATEGORÍAS PREMIUM REDISEÑADAS
    // ====================================================================== //

    function initCategoryButtons() {
        // [MODIFICADO] Selector para los nuevos pills del nav
        const categoryButtons = document.querySelectorAll('.category-pill');

        categoryButtons.forEach(button => {
            button.addEventListener('click', function () {
                // Remover active de todos los botones
                categoryButtons.forEach(btn => btn.classList.remove('active'));

                // Añadir active al botón clickeado
                this.classList.add('active');

                // Obtener categoría
                const category = this.getAttribute('data-category');

                // Usar el sistema de paginación para filtrar
                if (window.newsPagination && window.newsPagination.filterByCategory) {
                    window.newsPagination.filterByCategory(category);
                } else {
                    console.warn('Sistema de paginación no disponible');
                }
            });
        });
    }

    // ====================================================================== //
    // INICIALIZACIÓN
    // ====================================================================== //

    document.addEventListener('DOMContentLoaded', function () {
        // Esperar un momento para que feather icons se carguen
        setTimeout(() => {
            // Reemplazar iconos de feather
            if (typeof feather !== 'undefined') {
                feather.replace();
            }

            // Inicializar carousel
            initHeroCarousel();

            // [REMOVIDO] Inicializar select de ordenamiento
            // initSortSelect();

            // Inicializar botones de categorías
            initCategoryButtons();
        }, 500);
    });

    // Limpiar intervalo al salir de la página
    window.addEventListener('beforeunload', function () {
        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
    });

})();
