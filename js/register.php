<?php
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $email = strtolower(trim($_POST['email']));
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    // Validar dominio permitido
    $dominio_permitido = '@minibruno.com';
    if (!str_ends_with($email, $dominio_permitido)) {
        $mensaje = "Error: Solo se permiten correos del dominio $dominio_permitido.";
    } else {
        // Validar contra lista de correos autorizados
        $correos_json = file_get_contents('correos_autorizados.json');
        $correos_data = json_decode($correos_json, true);
        $correos_autorizados = $correos_data['autorizados'];

        if (!in_array($email, $correos_autorizados)) {
            $mensaje = "Error: El correo no está autorizado para registrarse.";
        } else {
            // Registrar usuario
            $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sss", $nombre, $email, $password);

            if ($stmt->execute()) {
                $mensaje = "Registro exitoso. Ahora puedes iniciar sesión.";
            } else {
                $mensaje = "Error: " . $stmt->error;
            }
            $stmt->close();
        }
    }

    $conn->close();
} else {
    $mensaje = "";
}

/*
    El Codigo PHP de register.php se encarga de registrar un nuevo usuario en la base de datos.
    Utiliza sentencias preparadas para evitar inyecciones SQL y almacena las contraseñas de forma segura usando hashing.
    Su cpdigo en PDO seria algo así:
    <?php
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if ($stmt->execute([$nombre, $email, $password])) {
        $mensaje = "Registro exitoso. Ahora puedes iniciar sesión.";
    } else {
        $mensaje = "Error en el registro.";
    }
} else {
    $mensaje = "";
}
?>

*/

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Usuario | MiniBruno TechSupport</title>
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
        
        .neon-glow {
            box-shadow: var(--neon-blue);
            transition: all 0.3s ease;
        }
        
        .neon-glow:hover {
            box-shadow: var(--neon-blue), 0 0 30px rgba(102, 126, 234, 0.8);
            transform: translateY(-2px);
        }
        
        .gradient-text {
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .matrix-bg {
            position: relative;
            overflow: hidden;
        }
        
        .matrix-bg::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(240, 147, 251, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }
        
        .floating-animation {
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
        
        .scan-line {
            position: relative;
            overflow: hidden;
        }
        
        .scan-line::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
            animation: scan 3s linear infinite;
        }
        
        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
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
        
        .register-card {
            background: rgba(15, 12, 41, 0.9);
            border: 1px solid rgba(102, 126, 234, 0.3);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }
        
        .input-field {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            transition: all 0.3s ease;
        }
        
        .input-field:focus {
            outline: none;
            border-color: #28a745;
            box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.3);
        }
        
        .input-field::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        
        .neon-button {
            background: linear-gradient(135deg, #28a745, #20c997);
            border: none;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .neon-button::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: 0.5s;
        }
        
        .neon-button:hover::before {
            left: 100%;
        }
        
        .neon-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(40, 167, 69, 0.4);
        }
        
        .hologram-text {
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }
        
        .message {
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            text-align: center;
        }
        
        .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fecaca;
        }
        
        .success-message {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #a7f3d0;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
        }
        
        .pulse-animation {
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body class="cyber-grid">
    <div class="container mx-auto px-4">
        <div class="max-w-md mx-auto">
            <!-- Logo Header -->
            <div class="text-center mb-8" data-aos="fade-down" data-aos-delay="100">
                <div class="flex items-center justify-center space-x-3 mb-4" >
                    <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center neon-glow pulse-animation">
                        <img src="img_Ref\bd_Brunito\logo_Glow.svg" alt="Logo MiniBruno" class="w-full h-full object-contain" />
                    </div>
                    <h1 class="text-2xl font-bold text-black font-tech">MiniBruno TechSupport</h1>
                </div>
                <div class="rgb-divider rounded-full mx-auto w-32"></div>
            </div>

            <!-- Register Card -->
            <div class="register-card rounded-2xl p-8 scan-line" data-aos="fade-up" data-aos-delay="200">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-white mb-2 font-tech gradient-text">Registro de Usuario</h2>
                    <p class="text-gray-400">Crea tu cuenta para acceder al sistema</p>
                </div>

                <form action="register.php" method="POST" class="space-y-6">
                    <div>
                        <label for="nombre" class="block text-gray-300 mb-2 font-tech text-sm">Nombre Completo</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i data-feather="user" class="h-5 w-5 text-gray-400"></i>
                            </div>
                            <input 
                                type="text" 
                                name="nombre" 
                                id="nombre"
                                placeholder="Tu nombre completo"
                                required
                                class="input-field w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                            >
                        </div>
                    </div>

                    <div>
                        <label for="email" class="block text-gray-300 mb-2 font-tech text-sm">Correo Electrónico</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i data-feather="mail" class="h-5 w-5 text-gray-400"></i>
                            </div>
                            <input 
                                type="email" 
                                name="email" 
                                id="email"
                                placeholder="tu@empresa.com"
                                required
                                class="input-field w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                            >
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-gray-300 mb-2 font-tech text-sm">Contraseña</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i data-feather="lock" class="h-5 w-5 text-gray-400"></i>
                            </div>
                            <input 
                                type="password" 
                                name="password" 
                                id="password"
                                placeholder="••••••••"
                                required
                                class="input-field w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                            >
                        </div>
                    </div>

                    <div class="flex items-center">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            required
                            class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        >
                        <label for="terms" class="ml-2 text-sm text-gray-400">
                            Acepto los <a href="#" class="text-green-400 hover:text-green-300">términos y condiciones</a>
                        </label>
                    </div>

                    <button type="submit" class="neon-button text-white py-3 px-6 rounded-lg font-medium font-tech w-full transition-all">
                        <i data-feather="user-plus" class="inline mr-2"></i> Registrarse
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-gray-400">
                        ¿Ya tienes una cuenta? 
                        <a href="login.php" class="text-green-400 hover:text-green-300 font-medium transition-colors">
                            Inicia sesión aquí
                        </a>
                    </p>
                </div>

                <?php if (!empty($mensaje)): ?>
                    <div class="message <?php echo strpos($mensaje, 'Error') !== false ? 'error-message' : 'success-message'; ?>">
                        <?php echo htmlspecialchars($mensaje); ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Footer Info -->
            <div class="text-center mt-8" data-aos="fade-up" data-aos-delay="400">
                <div class="flex justify-center space-x-6 text-gray-500 text-sm">
                    <a href="#" class="hover:text-gray-300 transition-colors">Términos</a>
                    <a href="#" class="hover:text-gray-300 transition-colors">Privacidad</a>
                    <a href="#" class="hover:text-gray-300 transition-colors">Ayuda</a>
                </div>
                <p class="text-gray-600 text-xs mt-4">© 2025 MiniBruno TechSupport. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>

    <script>
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
        
        feather.replace();
        
        // Add floating animation to register card
        document.addEventListener('DOMContentLoaded', function() {
            const registerCard = document.querySelector('.register-card');
            registerCard.classList.add('floating-animation');
        });
        
        // Form validation
        document.querySelector('form').addEventListener('submit', function(e) {
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const terms = document.getElementById('terms').checked;
            
            if (!nombre || !email || !password) {
                e.preventDefault();
                alert('Por favor completa todos los campos');
                return;
            }
            
            if (!terms) {
                e.preventDefault();
                alert('Debes aceptar los términos y condiciones');
                return;
            }
            
            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                e.preventDefault();
                alert('Por favor ingresa un correo electrónico válido');
                return;
            }
            
            // Password strength validation
            if (password.length < 6) {
                e.preventDefault();
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            // Show loading state
            const button = document.querySelector('button[type="submit"]');
            button.innerHTML = '<i data-feather="loader" class="inline mr-2 animate-spin"></i> Registrando...';
            feather.replace();
        });
    </script>
</body>
</html>