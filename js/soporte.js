 AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
        
        feather.replace();
        
        // Agregar animacion flotante a las tarjetas de tecnologia
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.tech-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.2}s`;
            });
        });

        // Freshchat Messenger // Este es el embed para el chat de soporte. Implementacion del API para incrustar
        function initFreshChat() {
            window.fcWidget.init({
                    token: "cb01ef65-f11d-4f78-971e-572e142c2952",
                    host: "https://minibruno.freshchat.com"
                });
            }

        function initialize(i, t) {
            var e;
                if (i.getElementById(t)) {
                    initFreshChat();
                } else {
            e = i.createElement("script");
            e.id = t;
            e.async = true;
            e.src = "https://minibruno.freshchat.com/js/widget.js";
            e.onload = initFreshChat;
            i.head.appendChild(e);
        }
    }

        function initiateCall() {
            initialize(document, "Freshchat-js-sdk");
        }

        if (window.addEventListener) {
            window.addEventListener("load", initiateCall, false);
        } else {
    window.attachEvent("load", initiateCall, false);
    }
    // Fin Freshchat Messenger

        // Función para ir al inicio de la página (header)
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }