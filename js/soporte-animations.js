// =====================================================
// SOPORTE ANIMATIONS - JAVASCRIPT INTERACTIVO
// (Adaptado para página de soporte técnico)
// =====================================================

document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
    initParallaxEffect();
    initHeaderScrollEffect();
    initRippleEffect();
    initSmoothScroll();
    initScrollProgressBar();
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

                // Stagger children elements
                const children = entry.target.querySelectorAll(':scope > *');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
};

// 2. PARALLAX EFFECT - HERO BANNER
const initParallaxEffect = () => {
    let ticking = false;

    const updateParallax = () => {
        const scrolled = window.pageYOffset;
        const heroBanner = document.querySelector('.contenedor');

        if (heroBanner) {
            const image = heroBanner.querySelector('.imagen');
            if (image) {
                const yPos = -(scrolled * 0.5);
                image.style.transform = `translateY(${yPos}px)`;
            }
        }

        // Parallax para otros elementos
        const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });

        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
};

// 3. HEADER SCROLL EFFECT - OCULTAR/MOSTRAR
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

// 4. RIPPLE EFFECT EN BOTONES
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

// 5. SMOOTH SCROLL
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

// 6. SCROLL PROGRESS BAR
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

// 7. AOS ENHANCEMENT - Inicializar después de cargar
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
