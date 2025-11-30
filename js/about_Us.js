// about_Us.js
// Inicialización de AOS y Feather Icons
if (window.AOS) {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
}

if (window.feather) {
    feather.replace();
}

// Funcionalidad del slider de historia
document.addEventListener('DOMContentLoaded', function() {
    const sliderContainer = document.querySelector('.slider-container');
    const slides = document.querySelectorAll('.slider-item');
    const totalSlides = slides.length;
    const dots = Array.from(document.querySelectorAll('.dot'));
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;

    // Si no hay contenedor o no hay slides, salir temprano
    if (!sliderContainer || totalSlides === 0) return;

    // Actualizar el slider y los puntos activos
    function updateSlider() {
        sliderContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Actualizar los puntos activos (sólo si existen puntos)
        if (dots.length > 0) {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
    }

    // Inicializar estado
    updateSlider();

    // Siguiente slide
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        });
    }

    // Slide Anterior
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
        });
    }

    // Navegación por puntos
    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentIndex = index;
                updateSlider();
            });
        });
    }

    // Auto slide cada cierto intervalo (sólo si hay más de 1 slide)
    if (totalSlides > 1) {
        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        }, 50000); // Cambiado a un intervalo muy largo para evitar el auto deslizamiento frecuente
    }
});

// Función para ir al inicio de la página (header)
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}