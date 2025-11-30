
        // Configuración por defecto
        const defaultConfig = {
            form_title: "Contactar Soporte",
            submit_button_text: "Enviar Solicitud",
            success_message: "¡Gracias por contactarnos! Se ha enviado tu información a nuestro equipo."
        };

        // Variables globales
        let currentData = [];

        // Manejador de datos para el SDK
        const dataHandler = {
            onDataChanged(data) {
                currentData = data;
                console.log(`Total de contactos recibidos: ${data.length}`);
            }
        };

        // Función para actualizar la UI basada en la configuración
        async function onConfigChange(config) {
            const formTitle = document.getElementById('formTitle');
            const submitButton = document.getElementById('submitButton');
            const submitButtonText = submitButton.querySelector('.button-text');

            if (formTitle) {
                formTitle.textContent = config.form_title || defaultConfig.form_title;
            }
            
            if (submitButtonText) {
                const icon = submitButtonText.querySelector('i');
                const iconHTML = icon ? icon.outerHTML : '';
                submitButtonText.innerHTML = iconHTML + (config.submit_button_text || defaultConfig.submit_button_text);
            }
        }

        // FUNCIONES DE MENSAJES MEJORADAS
        function showMessage(type, message, duration = 5000) {
            hideAllMessages();
            
            const messageDiv = document.getElementById(`${type}Message`);
            if (messageDiv) {
                messageDiv.textContent = message;
                messageDiv.style.display = 'block';
                
                if (duration > 0) {
                    setTimeout(() => {
                        messageDiv.style.display = 'none';
                    }, duration);
                }
            }
        }

        function hideAllMessages() {
            ['success', 'error', 'warning'].forEach(type => {
                const messageDiv = document.getElementById(`${type}Message`);
                if (messageDiv) {
                    messageDiv.style.display = 'none';
                }
            });
        }

        function showSuccessMessage(message) {
            showMessage('success', message);
        }

        function showErrorMessage(message) {
            showMessage('error', message);
        }

        function showWarningMessage(message) {
            showMessage('warning', message);
        }

        // FUNCIONES DE VALIDACIÓN
        function validateInput(input) {
            const formGroup = input.closest('.form-group');
            const validIcon = formGroup.querySelector('.validation-icon.valid');
            const invalidIcon = formGroup.querySelector('.validation-icon.invalid');
            
            if (input.validity.valid && input.value.trim() !== '') {
                validIcon.style.opacity = '1';
                invalidIcon.style.opacity = '0';
                return true;
            } else if (input.value.trim() !== '') {
                validIcon.style.opacity = '0';
                invalidIcon.style.opacity = '1';
                return false;
            } else {
                validIcon.style.opacity = '0';
                invalidIcon.style.opacity = '0';
                return false;
            }
        }

        function updateCharCounter(input, counterId, maxLength) {
            const counter = document.getElementById(counterId);
            const currentLength = input.value.length;
            
            counter.textContent = currentLength;
            
            // Cambiar color según proximidad al límite
            counter.className = 'char-counter';
            if (currentLength > maxLength * 0.9) {
                counter.classList.add('error');
            } else if (currentLength > maxLength * 0.7) {
                counter.classList.add('warning');
            }
        }

        function validateForm() {
            const inputs = ['name', 'email', 'phone'];
            let isValid = true;
            
            inputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (!validateInput(input)) {
                    isValid = false;
                }
            });
            
            return isValid;
        }

        // FUNCIÓN DE ENVÍO MEJORADA
        async function handleFormSubmit(e) {
            e.preventDefault();
            
            // Validar formulario antes de enviar
            if (!validateForm()) {
                showErrorMessage("Por favor, completa todos los campos correctamente.");
                return;
            }
            
            // Verificar límite de datos
            if (currentData.length >= 999) {
                showWarningMessage("Se ha alcanzado el límite máximo de contactos. Por favor, contacta al administrador.");
                return;
            }

            const submitButton = document.getElementById('submitButton');
            const form = document.getElementById('contactForm');
            
            // Mostrar estado de carga
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            hideAllMessages();

            try {
                // Obtener y limpiar datos del formulario
                const formData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim().toLowerCase(),
                    phone: document.getElementById('phone').value.trim(),
                    timestamp: new Date().toISOString()
                };

                // Validaciones adicionales
                if (formData.name.length < 2) {
                    throw new Error("El nombre debe tener al menos 2 caracteres.");
                }

                if (!formData.email.includes('@') || !formData.email.includes('.')) {
                    throw new Error("Por favor, ingresa un correo electrónico válido.");
                }

                if (formData.phone.length < 10) {
                    throw new Error("El número de teléfono debe tener al menos 10 dígitos.");
                }

                // Guardar en la hoja de Canva
                const result = await window.dataSdk.create(formData);

                if (result.isOk) {
                    // Limpiar formulario
                    form.reset();
                    
                    // Limpiar contadores y validaciones
                    ['nameCounter', 'emailCounter', 'phoneCounter'].forEach(counterId => {
                        const counter = document.getElementById(counterId);
                        if (counter) counter.textContent = '0';
                    });
                    
                    // Ocultar iconos de validación
                    document.querySelectorAll('.validation-icon').forEach(icon => {
                        icon.style.opacity = '0';
                    });
                    
                    // Mostrar mensaje de éxito
                    const config = window.elementSdk ? window.elementSdk.config : defaultConfig;
                    const successMessage = config.success_message || defaultConfig.success_message;
                    showSuccessMessage(successMessage);
                    
                    // Auto-ocultar mensaje después de 3 segundos
                    setTimeout(() => {
                        hideAllMessages();
                    }, 3000);
                    
                } else {
                    showErrorMessage("Hubo un error al enviar tu información. Por favor, inténtalo de nuevo.");
                }
            } catch (error) {
                showErrorMessage(error.message || "Hubo un error al enviar tu información. Por favor, inténtalo de nuevo.");
            } finally {
                // Quitar estado de carga
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        }

        // Inicialización
        async function init() {
            try {
                // Inicializar Data SDK
                if (window.dataSdk) {
                    const initResult = await window.dataSdk.init(dataHandler);
                    if (!initResult.isOk) {
                        console.error("Error al inicializar Data SDK");
                    }
                }

                // Inicializar Element SDK
                if (window.elementSdk) {
                    await window.elementSdk.init({
                        defaultConfig,
                        onConfigChange,
                        mapToCapabilities: () => ({
                            recolorables: [],
                            borderables: [],
                            fontEditable: undefined,
                            fontSizeable: undefined
                        }),
                        mapToEditPanelValues: (config) => new Map([
                            ["form_title", config.form_title || defaultConfig.form_title],
                            ["submit_button_text", config.submit_button_text || defaultConfig.submit_button_text],
                            ["success_message", config.success_message || defaultConfig.success_message]
                        ])
                    });
                }

                // Configurar eventos del formulario
                const form = document.getElementById('contactForm');
                if (form) {
                    form.addEventListener('submit', handleFormSubmit);
                }

                // Configurar validación en tiempo real y contadores
                const inputs = [
                    { id: 'name', counter: 'nameCounter', maxLength: 50 },
                    { id: 'email', counter: 'emailCounter', maxLength: 100 },
                    { id: 'phone', counter: 'phoneCounter', maxLength: 20 }
                ];

                inputs.forEach(({ id, counter, maxLength }) => {
                    const input = document.getElementById(id);
                    if (input) {
                        // Validación en tiempo real
                        input.addEventListener('input', () => {
                            validateInput(input);
                            updateCharCounter(input, counter, maxLength);
                        });
                        
                        input.addEventListener('blur', () => {
                            validateInput(input);
                        });
                    }
                });

                // Enfocar el primer input al cargar
                setTimeout(() => {
                    document.getElementById('name').focus();
                }, 100);

                // Aplicar configuración inicial
                await onConfigChange(defaultConfig);

                // Inicializar iconos de Feather
                feather.replace();

            } catch (error) {
                console.error("Error durante la inicialización:", error);
            }
        }

        // Inicializar cuando la página esté lista
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'99737293873c492b',t:'MTc2MTkxNjgwMy4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();