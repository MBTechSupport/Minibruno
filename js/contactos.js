        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
        
        feather.replace();

        // Relleno de Data para contactos (8 existentes en contactos total)
        const contacts = [
            {
                id: 1,
                name: "Alves Neri",
                position: "Gerente del Area de Sistemas",
                phone: "+58 424 3221234",
                email: "alves.neri@minibruno.com",
                department: "Sistemas",
                location: "Sede Principal Planta Chuao",
                ext: "Ext.",
                hours: "L-V 7:00am - 4:00pm",
                notes: "Responsable de supervisar y coordinar todas las actividades relacionadas con los sistemas informáticos y tecnológicos de la empresa.",
                avatar: "img_Ref/user1_alves_neri.webp"
            },
            {
                id: 2,
                name: "Luis Ruiz",
                position: "Analista de Soporte Técnico y Telecomunicaciones",
                phone: "+58 414 4677046",
                email: "lruiz@minibruno.com",
                department: "Departamento de Sistemas",
                location: "Sede Principal Planta PSC",
                ext: "Ext. 305",
                hours: "L-V 7:00am - 4:00pm",
                notes: "Se encarga de monitorear y mantener la infraestructura de telecomunicaciones y redes de la empresa.",
                avatar: "img_Ref/user6_luis_Ruiz.jpg"
            },
            {
                id: 3,
                name: "Rommer Coronado",
                position: "Jefe de Sistemas",
                phone: "-",
                email: "rcoronado@minibruno.com",
                department: "Departamento de Sistemas",
                location: "Sede Principal Planta PRC",
                ext: "Ext. ",
                hours: "L-V 7:00am - 4:00pm",
                notes: "Es el representante del Departamento de Sistemas en ambas plantas, tanto en PSC y en PRC",
                avatar: "img_Ref/user2_rommer_Coronado.webp"
            },
            {
                id: 4,
                name: "Marbeth Rodriguez",
                position: "Analista de Sistemas",
                phone: "+58 424 3268791",
                email: "mrodriguez@minibruno.com",
                department: "Departamento de Sistemas",
                location: "Sede Principal Planta PSC",
                ext: "Ext. 305 ",
                hours: "L-V 7:00am - 4:00pm",
                notes: "Responsable del análisis, diseño y mejora de los sistemas informáticos de la empresa.",
                avatar: "img_Ref/user3_marbeth_Rodriguez.webp"
            },
            {
                id: 5,
                name: "Darwin Navarro",
                position: "Analista de Sistemas",
                phone: "-",
                email: "dnavarro@minibruno.com",
                department: "Departamento de Sistemas",
                location: "Sede Principal Planta PSC",
                ext: "Ext. 128 ",
                hours: "L-V 7:00am - 4:00pm",
                notes: "Responsable del análisis, diseño y mejora de los sistemas informáticos de la empresa.",
                avatar: "img_Ref/user4_darwin_Navarro.webp"
            },
            {
                id: 6,
                name: "Jagger Ñanez",
                position: "Analista de Sistemas",
                phone: "-",
                email: "jnanez@minibruno.com",
                department: "Departamento de Sistemas",
                location: "Sede Principal Planta PRC",
                ext: "Ext. 305 ",
                hours: "L-V 7:00am - 4:00pm",
                notes: "Responsable del análisis, diseño y mejora de los sistemas informáticos de la empresa.",
                avatar: "img_Ref/user5_jagger_Nanes.webp"
            },
            {
                id: 7,
                name: "Betsimar Montilla",
                position: "Analista de Sistemas",
                phone: "-",
                email: "bmontilla@minibruno.com",
                department: "Departamento de Sistemas",
                location: "Sede Principal Planta PRC",
                ext: "Ext. ",
                hours: "L-V 7:00am - 4:00pm",
                notes: "Responsable del análisis, diseño y mejora de los sistemas informáticos de la empresa.",
                avatar: "img_Ref/user7_betsimar_Montilla.webp"
            },
            {
                id: 8,
                name: "Luis Guevara",
                position: "Gerente de Sistemas",
                phone: "-",
                email: "lguevara@minibruno.com",
                department: "Departamento de Sistemas",
                location: "Sede Principal Planta PRC",
                ext: "Ext. ",
                hours: "L-V 7:00am - 4:00pm",
                notes: "Gerente del Departamento de Sistemas en la planta de PRC.",
                avatar: "img_Ref/user8_luis_Guevara.webp"
            }
        ];

        function showContactDetails(id) {
            const contact = contacts.find(c => c.id === id);
            if (!contact) return;

            // Establecer detalles de contacto
            document.getElementById('detail-name').textContent = contact.name;
            document.getElementById('detail-position').textContent = contact.position;
            document.getElementById('detail-phone').textContent = contact.phone;
            document.getElementById('detail-email').textContent = contact.email;
            document.getElementById('detail-department').textContent = contact.department;
            document.getElementById('detail-location').textContent = contact.location;
            document.getElementById('detail-ext').textContent = contact.ext;
            document.getElementById('detail-hours').textContent = contact.hours;
            document.getElementById('detail-notes').textContent = contact.notes;
            
            // Establecer iniciales
            const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase();
            document.getElementById('detail-initials').textContent = initials;

            // Limpia clases de animación previas
            const grid = document.getElementById('contacts-grid');
            const details = document.getElementById('contact-details');
            grid.classList.remove('fade-in', 'fade-out');
            details.classList.remove('fade-in', 'fade-out');

            // Fade out grid y fade en detalles (details)
            grid.classList.add('fade-out');
            setTimeout(() => {
                grid.style.display = 'none';
                details.style.display = 'block';
                details.classList.add('fade-in');
                // Limpia la clase después de la animación
                setTimeout(() => {
                    details.classList.remove('fade-in');
                }, 500);
            }, 500);
        }

        function hideContactDetails() {
            const grid = document.getElementById('contacts-grid');
            const details = document.getElementById('contact-details');
            grid.classList.remove('fade-in', 'fade-out');
            details.classList.remove('fade-in', 'fade-out');

            // Fade out details y fade in grid
            details.classList.add('fade-out');
            setTimeout(() => {
                details.style.display = 'none';
                grid.style.display = 'grid';
                grid.classList.add('fade-in');
                // Limpia la clase después de la animación
                setTimeout(() => {
                    grid.classList.remove('fade-in');
                }, 500);
            }, 500);
        }

        // Función para ir al inicio de la página (header)
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }