// Función para toggle de FAQs con animaciones premium
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    const faqItem = element.closest('.faq-item');

    // Añadir clase de apertura para animación
    faqItem.classList.add('opening');
    setTimeout(() => faqItem.classList.remove('opening'), 600);

    // Cerrar otras respuestas (comportamiento accordion)
    const allAnswers = document.querySelectorAll('.faq-answer');
    const allQuestions = document.querySelectorAll('.faq-question');

    allAnswers.forEach((ans, idx) => {
        if (ans !== answer && ans.classList.contains('open')) {
            ans.classList.remove('open');
            allQuestions[idx].classList.remove('active');
            const otherIcon = allQuestions[idx].querySelector('i');
            otherIcon.setAttribute('data-feather', 'chevron-down');
        }
    });

    // Toggle actual
    answer.classList.toggle('open');
    element.classList.toggle('active');

    if (answer.classList.contains('open')) {
        icon.setAttribute('data-feather', 'chevron-up');
    } else {
        icon.setAttribute('data-feather', 'chevron-down');
    }

    feather.replace();
}

// Agregar animacion flotante a las tarjetas de tecnologia
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.tech-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});