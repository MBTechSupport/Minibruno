/**
 * Sistema de Partículas Flotantes - Estilo Google Antigravity
 * Efecto de partículas blancas/grises flotando en el fondo
 * JavaScript Vanilla - Sin dependencias
 */

class FloatingParticles {
    constructor(containerId) {
        this.container = document.getElementById(containerId) || document.body;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.particleCount = 50; // Ajustable según rendimiento
        this.init();
    }

    init() {
        // Crear canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particlesCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';

        // Insertar al inicio del body
        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.ctx = this.canvas.getContext('2d');

        // Configurar tamaño
        this.resize();

        // Crear partículas
        this.createParticles();

        // Event listeners
        window.addEventListener('resize', () => this.resize());

        // Iniciar animación
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 4 + 1, // Tamaño entre 1 y 5
                speedX: (Math.random() - 0.5) * 0.5, // Velocidad horizontal
                speedY: (Math.random() - 0.5) * 0.5, // Velocidad vertical
                opacity: Math.random() * 0.5 + 0.2, // Opacidad entre 0.2 y 0.7
                color: this.getParticleColor()
            });
        }
    }

    getParticleColor() {
        // Colores en tonos blancos/grises/azules suaves coherentes con el tema
        const colors = [
            'rgba(255, 255, 255,', // Blanco
            'rgba(200, 220, 240,', // Azul muy claro
            'rgba(220, 220, 220,', // Gris claro
            'rgba(66, 140, 226,',  // Azul tema principal
            'rgba(33, 51, 121,'    // Azul oscuro tema
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateParticles() {
        for (let particle of this.particles) {
            // Actualizar posición
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Efecto de flotación suave (oscilación vertical)
            particle.y += Math.sin(Date.now() * 0.001 + particle.x) * 0.1;

            // Rebote en bordes
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }

            // Mantener dentro de los límites
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let particle of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + particle.opacity + ')';
            this.ctx.fill();

            // Añadir brillo sutil
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );
            gradient.addColorStop(0, particle.color + particle.opacity + ')');
            gradient.addColorStop(1, particle.color + '0)');

            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }

        // Opcional: Dibujar conexiones entre partículas cercanas
        this.drawConnections();
    }

    drawConnections() {
        const maxDistance = 150; // Distancia máxima para conexión

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(66, 140, 226, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }

    // Método para destruir (útil si se necesita cleanup)
    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', () => this.resize());
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear sistema de partículas
    const particleSystem = new FloatingParticles('home');

    // Hacer disponible globalmente si se necesita controlar
    window.particleSystem = particleSystem;
});
