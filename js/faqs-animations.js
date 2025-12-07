// =====================================================
// FAQ ANIMATIONS - JAVASCRIPT INTERACTIVO
// =====================================================

document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
    initHeaderScrollEffect();
    initRippleEffect();
    initSmoothScroll();
    initScrollProgressBar();
    initHomeButtonEnhancement();
    initAOSEnhancement();
});

// 1. INTERSECTION OBSERVER - SCROLL-TRIGGERED ANIMATIONS
const initScrollAnimations = () => {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
};

// 2. HEADER SCROLL EFFECT - OCULTAR/MOSTRAR
const initHeaderScrollEffect = () => {
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Ocultar header al bajar, mostrar al subir
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scroll hacia abajo - ocultar
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scroll hacia arriba - mostrar
            header.style.transform = 'translateY(0)';
        }

        // Añadir clase scrolled para efectos adicionales
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
};

// 3. RIPPLE EFFECT EN BOTONES
const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');

    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    ripple.style.top = `${event.clientY - button.offsetTop - radius}px`;
    ripple.classList.add('ripple-effect');

    const rippleEffect = button.getElementsByClassName('ripple-effect')[0];
    if (rippleEffect) {
        rippleEffect.remove();
    }

    button.appendChild(ripple);
};

const initRippleEffect = () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.add('ripple');
        button.addEventListener('click', createRipple);
    });
};

// 4. SMOOTH SCROLL
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

// 5. SCROLL PROGRESS BAR
const initScrollProgressBar = () => {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
};

// 6. HOME BUTTON ENHANCEMENT - MAKE IT SUPER INTERACTIVE
const initHomeButtonEnhancement = () => {
    // Encontrar el logo/contenedor del botón de inicio
    const logoContainer = document.querySelector('header .flex.items-center.space-x-3');

    if (logoContainer) {
        // Crear wrapper para el botón
        const wrapper = document.createElement('div');
        wrapper.className = 'home-button-wrapper';

        // Mover el contenido actual al wrapper
        const currentContent = logoContainer.innerHTML;
        wrapper.innerHTML = currentContent;

        // Añadir texto descriptivo
        const homeText = document.createElement('span');
        homeText.className = 'home-button-text font-tech text-lg hidden md:inline';
        homeText.textContent = 'Volver al Inicio';
        wrapper.appendChild(homeText);

        // Añadir icono de flecha
        const arrowIcon = document.createElement('i');
        arrowIcon.setAttribute('data-feather', 'arrow-left');
        arrowIcon.className = 'home-arrow-icon w-5 h-5';
        wrapper.insertBefore(arrowIcon, wrapper.firstChild);

        // Reemplazar contenido
        logoContainer.innerHTML = '';
        logoContainer.appendChild(wrapper);

        // Hacer todo el wrapper clickeable
        wrapper.style.cursor = 'pointer';
        wrapper.addEventListener('click', () => {
            window.location.href = 'index_log.html';
        });

        // Reemplazar feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
};

// 7. AOS ENHANCEMENT
const initAOSEnhancement = () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
        });
    }
};

// FUNCIÓN DE SCROLL TO TOP (si no existe)
if (typeof scrollToTop === 'undefined') {
    window.scrollToTop = function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
}

// Replace feather icons después de cargar
if (typeof feather !== 'undefined') {
    feather.replace();
}


// FUNCIÓN scrollToFAQ (si no existe)
if (typeof scrollToFAQ === 'undefined') {
    window.scrollToFAQ = function () {
        // Buscar la tercera FAQ (acceso a áreas restringidas)
        const targetFAQ = document.querySelector('.faq-item:nth-child(3)');
        if (targetFAQ) {
            targetFAQ.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetFAQ.classList.add('opening');
            setTimeout(() => {
                targetFAQ.classList.remove('opening');
                // Abrir automáticamente la FAQ
                const question = targetFAQ.querySelector('.faq-question');
                if (question && typeof toggleFAQ !== 'undefined') {
                    toggleFAQ(question);
                }
            }, 600);
        }
    };
}
