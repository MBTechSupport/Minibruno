<?php
session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cerrando sesión | MiniBruno TechSupport</title>
    <link rel="icon" type="image/x-icon" href="/static/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Exo+2:wght@300;400;500;600;700&display=swap');
        
        :root {
            --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --gradient-tertiary: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --neon-blue: 0 0 20px rgba(102, 126, 234, 0.6);
            --neon-purple: 0 0 20px rgba(240, 147, 251, 0.6);
        }
        
        body {
            font-family: 'Exo 2', sans-serif;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            overflow-x: hidden;
        }
        
        .font-tech {
            font-family: 'Orbitron', sans-serif;
        }
        
        .glass-morphism {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .gradient-text {
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .cyber-grid {
            background-image: 
                linear-gradient(rgba(102, 126, 234, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(102, 126, 234, 0.1) 1px, transparent 1px);
            background-size: 30px 30px;
        }
        
        .rgb-divider {
            height: 4px;
            width: 100%;
            background: linear-gradient(
                to right,
                #ff0000,
                #ff7f00,
                #ffff00,
                #00ff00,
                #0000ff,
                #4b0082,
                #8b00ff,
                #ff0000
            );
            background-size: 600% 100%;
            border-radius: 2px;
            animation: rainbow 6s linear infinite;
        }
        
        @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .logout-card {
            background: rgba(15, 12, 41, 0.9);
            border: 1px solid rgba(102, 126, 234, 0.3);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(102, 126, 234, 0.3);
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .progress-bar {
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 2px;
            animation: progress 1.5s ease-in-out infinite;
        }
        
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
        
        .floating-animation {
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
    </style>
</head>
<body class="cyber-grid">
    <div class="container mx-auto px-4">
        <div class="max-w-md mx-auto">
            <!-- Logo Header -->
            <div class="text-center mb-8" data-aos="fade-down">
                <div class="flex items-center justify-center space-x-3 mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center floating-animation">
                        <i data-feather="cpu" class="text-white w-6 h-6"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-black font-tech">MiniBruno TechSupport</h1>
                </div>
                <div class="rgb-divider rounded-full mx-auto w-32"></div>
            </div>

            <!-- Tarta de Cierre de Sesión -->
            <div class="logout-card rounded-2xl p-8" data-aos="fade-up" data-aos-delay="200">
                <div class="text-center">
                    <div class="flex justify-center mb-6">
                        <div class="spinner"></div>
                    </div>
                    
                    <h2 class="text-2xl font-bold text-white mb-4 font-tech gradient-text">Cerrando sesión</h2>
                    
                    <p class="text-gray-300 text-lg mb-6">
                        Estamos cerrando tu sesión de forma segura...
                    </p>
                    
                    <div class="bg-gray-700 rounded-full h-2 mb-6">
                        <div class="progress-bar"></div>
                    </div>
                    
                    <div class="text-gray-400 text-sm">
                        <p>Destruyendo sesión activa</p>
                        <p>Limpiando datos temporales</p>
                        <p>Redirigiendo al inicio</p>
                    </div>
                </div>
            </div>

            <!-- Footer Info -->
            <div class="text-center mt-8" data-aos="fade-up" data-aos-delay="400">
                <p class="text-gray-500 text-sm">© 2025 MiniBruno TechSupport. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>

    <!-- Freshchat Widget -->
    <script src="https://minibruno.freshchat.com/js"></script>
    
    <script>
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
        
        feather.replace();
        
        function cerrarSesionFreshchat() {
            if (window.fcWidget && typeof window.fcWidget.destroy === "function") {
                console.log("Destruyendo sesión de Freshchat...");
                window.fcWidget.destroy();
            } else {
                console.log("Freshchat no está disponible.");
            }

            setTimeout(function () {
                console.log("Redirigiendo a logout_server.php...");
                window.location.href = "logout_server.php";
            }, 1500);
        }

        window.addEventListener("load", cerrarSesionFreshchat);
    </script>
</body>
</html>