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
                console.log("Redirigiendo al login, espere un momento...");
                window.location.href = "login.html";
            }, 1500);
        }

        window.addEventListener("load", cerrarSesionFreshchat);