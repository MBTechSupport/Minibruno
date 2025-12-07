/* =====================================================
   INDEX ANIMATIONS - JavaScript Interactivo
   Intersection Observer + Parallax + Microinteracciones
   ===================================================== */

// =======================================================
// 1. INTERSECTION OBSERVER - SCROLL-TRIGGERED ANIMATIONS
// =======================================================

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

    // Observe all elements with scroll-animate class
    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
};

// =======================================================
// 2. PARALLAX EFFECT
// =======================================================

const initParallax = () => {
    const parallaxElements = document.querySelectorAll('.parallax');

    const handleParallax = () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.speed) || 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    };

    // Throttle function for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
};

// =======================================================
// 3. HEADER SCROLL EFFECT
// =======================================================

const initHeaderScroll = () => {
    const header = document.querySelector('header');
    let lastScrollTop = 0;

    const handleHeaderScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide header on scroll down, show on scroll up
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleHeaderScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
};

// =======================================================
// 4. COUNTER ANIMATIONS (para stats)
// =======================================================

const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current >= target) {
            element.textContent = target + (element.dataset.suffix || '');
            return;
        }
        element.textContent = Math.floor(current) + (element.dataset.suffix || '');
        requestAnimationFrame(updateCounter);
    };

    requestAnimationFrame(updateCounter);
};

const initCounters = () => {
    const counterOptions = {
        threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.dataset.target) || 0;
                animateCounter(entry.target, target);
                entry.target.classList.add('counted');
            }
        });
    }, counterOptions);

    document.querySelectorAll('.counter').forEach(el => {
        counterObserver.observe(el);
    });
};

// =======================================================
// 5. RIPPLE EFFECT EN BOTONES
// =======================================================

const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();

    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - radius}px`;
    ripple.style.top = `${event.clientY - rect.top - radius}px`;
    ripple.classList.add('ripple');

    // Remove previous ripples
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
};

const initRippleEffect = () => {
    document.querySelectorAll('.neon-button, .cta-button, button').forEach(button => {
        button.addEventListener('click', createRipple);
    });
};

// =======================================================
// 6. SMOOTH SCROLL TO SECTION
// =======================================================

const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// =======================================================
// 7. CAROUSEL AUTO-SWITCH (Testimonios)
// =======================================================

const initTestimonialCarousel = () => {
    const testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length === 0) return;

    let currentIndex = 0;

    const showTestimonial = (index) => {
        testimonials.forEach((t, i) => {
            if (i === index) {
                t.style.opacity = '1';
                t.style.transform = 'translateX(0) scale(1)';
                t.style.position = 'relative';
            } else {
                t.style.opacity = '0';
                t.style.transform = 'translateX(50px) scale(0.95)';
                t.style.position = 'absolute';
            }
        });
    };

    const nextTestimonial = () => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    };

    // Auto-switch every 6 seconds
    showTestimonial(0);
    setInterval(nextTestimonial, 6000);
};

// =======================================================
// 8. MOUSE CURSOR EFFECT (opcional)
// =======================================================

const initCursorEffect = () => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        cursorX += dx * 0.2;
        cursorY += dy * 0.2;

        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(animateCursor);
    };

    animateCursor();

    // Hover effect
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
};

// =======================================================
// 9. ENTRADA DE ELEMENTOS CON DELAY
// =======================================================

const initStaggeredEntrance = () => {
    const staggerGroups = document.querySelectorAll('[data-stagger]');

    staggerGroups.forEach(group => {
        const children = group.children;
        const delay = parseInt(group.dataset.stagger) || 100;

        Array.from(children).forEach((child, index) => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(30px)';

            setTimeout(() => {
                child.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
            }, index * delay);
        });
    });
};

// =======================================================
// 10. PROGRESS BAR AL SCROLL
// =======================================================

const initScrollProgressBar = () => {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progressBar);

    const updateProgress = () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;

        document.querySelector('.scroll-progress-bar').style.width = `${scrolled}%`;
    };

    window.addEventListener('scroll', updateProgress);
};

// =======================================================
// 11. LAZY LOAD IMAGES
// =======================================================

const initLazyLoad = () => {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
};

// =======================================================
// 12. 3D TILT EFFECT EN CARDS
// =======================================================

const init3DTilt = () => {
    const cards = document.querySelectorAll('.service-card, .feature-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
};

// =======================================================
// INITIALIZATION - EJECUTAR TODO AL CARGAR
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Core animations
    initScrollAnimations();
    initHeaderScroll();
    initSmoothScroll();

    // Interactive elements
    initRippleEffect();
    init3DTilt();

    // Optional features (comentar si no se necesitan)
    initParallax();
    initCounters();
    initTestimonialCarousel();
    initStaggeredEntrance();
    initScrollProgressBar();
    initLazyLoad();
    // initCursorEffect(); // Descomentar si quieres cursor custom

    console.log('🚀 Index Premium Animations Loaded!');
});

// Feather icons refresh (asegurarse de que los iconos se carguen)
if (typeof feather !== 'undefined') {
    feather.replace();
}
