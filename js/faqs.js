// Función para toggle de FAQs con animaciones premium
function toggleFAQ(element) {
    if (!element) return;
    const answer = element.nextElementSibling;
    const faqItem = element.closest('.faq-item');

    // Añadir clase de apertura para animación
    if (faqItem) {
        faqItem.classList.add('opening');
        setTimeout(() => faqItem.classList.remove('opening'), 600);
    }

    // Cerrar otras respuestas (comportamiento accordion)
    const allAnswers = document.querySelectorAll('.faq-answer');
    const allQuestions = document.querySelectorAll('.faq-question');

    allAnswers.forEach((ans, idx) => {
        if (ans !== answer && ans.classList.contains('open')) {
            ans.classList.remove('open');
            if (allQuestions[idx]) {
                allQuestions[idx].classList.remove('active');
                const otherIcon = allQuestions[idx].querySelector('[data-feather], svg.feather, i');
                if (otherIcon) {
                    if (window.feather && window.feather.icons && window.feather.icons['chevron-down']) {
                        otherIcon.outerHTML = window.feather.icons['chevron-down'].toSvg({ class: 'text-blue-500 w-5 h-5' });
                    } else if (otherIcon.setAttribute) {
                        otherIcon.setAttribute('data-feather', 'chevron-down');
                    }
                }
            }
        }
    });

    // Toggle actual
    if (answer) {
        answer.classList.toggle('open');
    }
    element.classList.toggle('active');

    const isOpen = answer && answer.classList.contains('open');
    const icon = element.querySelector('[data-feather], svg.feather, i');
    if (icon) {
        const iconName = isOpen ? 'chevron-up' : 'chevron-down';
        if (window.feather && window.feather.icons && window.feather.icons[iconName]) {
            icon.outerHTML = window.feather.icons[iconName].toSvg({ class: 'text-blue-500 w-5 h-5' });
        } else if (icon.setAttribute) {
            icon.setAttribute('data-feather', iconName);
            if (window.feather) window.feather.replace();
        }
    }
}

// Agregar animacion flotante a las tarjetas de tecnologia
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.tech-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});