// =====================================================
// CONTACTOS ANIMATIONS - JAVASCRIPT INTERACTIVO
// (Adaptado para directorio de contactos)
// =====================================================

document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
    initHeaderScrollEffect();
    initRippleEffect();
    initSmoothScroll();
    initScrollProgressBar();
    initContactCardAnimations();
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
    const buttons = document.querySelectorAll('button, .contact-card');
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

// 6. CONTACT CARD ANIMATIONS - EFECTOS ESPECIALES
const initContactCardAnimations = () => {
    const cards = document.querySelectorAll('.contact-card');

    cards.forEach((card, index) => {
        // Añadir delay progresivo
        card.style.setProperty('--card-index', index);

        // Efecto hover mejorado en avatares
        const avatar = card.querySelector('img');
        if (avatar) {
            card.addEventListener('mouseenter', () => {
                avatar.style.transform = 'scale(1.15) rotate(3deg)';
            });

            card.addEventListener('mouseleave', () => {
                avatar.style.transform = 'scale(1) rotate(0deg)';
            });
        }
    });
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

// MEJORAR ANIMACIÓN AL MOSTRAR DETALLES DE CONTACTO
const originalShowContactDetails = window.showContactDetails;
if (typeof originalShowContactDetails === 'function') {
    window.showContactDetails = function (contactId) {
        originalShowContactDetails(contactId);

        // Scroll suave hacia detalles
        setTimeout(() => {
            const detailsSection = document.getElementById('contact-details');
            if (detailsSection) {
                detailsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    };
}
