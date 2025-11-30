AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
        
        feather.replace();

        // Efecto de hover para las tarjetas de herramientas
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Efecto de hover para los botones
        document.querySelectorAll('.neon-button').forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Efecto de hover para los iconos de herramientas
        document.querySelectorAll('.tool-icon').forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
            });
            
            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });

        // Efecto de fade-in al cargar la página
        window.addEventListener('load', function() {
            document.body.classList.add('fade-in');
        });
        // Efecto de fade-out al salir de la página
        window.addEventListener('beforeunload', function() {
            document.body.classList.add('fade-out');
        });

        // Efecto de slide-in para las tarjetas de herramientas
        document.querySelectorAll('.tool-card').forEach(card => {
            card.classList.add('slide-in');
        });

        // Efecto de pulse-glow para las tarjetas de herramientas
        document.querySelectorAll('.tool-card').forEach(card => {
            card.classList.add('pulse-glow');
        });