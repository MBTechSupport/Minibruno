        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
        
        feather.replace();
        
        // Función para toggle de FAQs
        function toggleFAQ(element) {
            const answer = element.nextElementSibling;
            const icon = element.querySelector('i');
            
            answer.classList.toggle('open');
            
            if (answer.classList.contains('open')) {
                icon.setAttribute('data-feather', 'chevron-up');
            } else {
                icon.setAttribute('data-feather', 'chevron-down');
            }
            
            feather.replace();
        }
        
        // Función para scroll a la pregunta más buscada
        function scrollToFAQ() {
            const targetFAQ = document.querySelector('.faq-item:nth-child(3)'); // Tercer FAQ (acceso a áreas restringidas)
            if (targetFAQ) {
                targetFAQ.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetFAQ.classList.add('pulse-animation');
                setTimeout(() => {
                    targetFAQ.classList.remove('pulse-animation');
                }, 2000);
            }
        }
        // Función para ir al inicio de la página (header)
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
       

        // Agregar animacion flotante a las tarjetas de tecnologia
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.tech-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        });