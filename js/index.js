       AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
        
        // Innicializacion Swiper
        var swiper = new Swiper(".mySwiper", {
            slidesPerView: 1,
            spaceBetween: 30,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                },
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            loop: true,
        });
        // Fin Swiper

        // Inicio Slider (nuevo)--------------------------------------------------------------------
        document.addEventListener('DOMContentLoaded', () => {
            feather.replace();
            
            const track = document.querySelector('.slider-track');
            const slides = document.querySelectorAll('.slider-slide');
            const dots = document.querySelectorAll('.slider-dot');
            const prevBtn = document.querySelector('.slider-prev');
            const nextBtn = document.querySelector('.slider-next');
            
            let currentIndex = 0;
            const slideCount = slides.length;
            
            function updateSlider() {
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
                
                dots.forEach((dot, index) => {
                    dot.classList.toggle('bg-blue-500', index === currentIndex);
                    dot.classList.toggle('bg-blue-500/50', index !== currentIndex);
                });
            }
            
            function nextSlide() {
                currentIndex = (currentIndex + 1) % slideCount;
                updateSlider();
            }
            
            function prevSlide() {
                currentIndex = (currentIndex - 1 + slideCount) % slideCount;
                updateSlider();
            }
            
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    currentIndex = parseInt(dot.dataset.index);
                    updateSlider();
                });
            });
            
            prevBtn.addEventListener('click', prevSlide);
            nextBtn.addEventListener('click', nextSlide);
            
            // Automatiza el slide cada 4 segundos (4000 ms)
            let slideInterval = setInterval(nextSlide, 4000);
            
            // Pausa el auto slide al pasar el mouse sobre el slider
            const sliderContainer = document.querySelector('.slider-container');
            sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
            sliderContainer.addEventListener('mouseleave', () => {
                clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, 4000);
            });
        });
        // FIN Slider (nuevo)--------------------------------------------------------------------
        
        // Función para ir al inicio de la página (header)
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function openChatModal() {
            document.getElementById("chatModal").classList.remove("hidden");
        }

        function closeChatModal() {
            document.getElementById("chatModal").classList.add("hidden");
        }