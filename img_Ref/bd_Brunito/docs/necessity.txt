                // Initialize AOS
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'start'
                    });
                }
            });
        });

        // Add hover effects to service cards
        document.addEventListener('DOMContentLoaded', function() {
            const serviceCards = document.querySelectorAll('.service-card, .product-card, .about-card, .contact-card');
            
            serviceCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });

            // Touch swipe functionality for horizontal scroll
            const scrollContainer = document.getElementById('horizontalScroll');
            let isDown = false;
            let startX;
            let scrollLeft;

            scrollContainer.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - scrollContainer.offsetLeft;
                scrollLeft = scrollContainer.scrollLeft;
            });

            scrollContainer.addEventListener('mouseleave', () => {
                isDown = false;
            });

            scrollContainer.addEventListener('mouseup', () => {
                isDown = false;
            });

            scrollContainer.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - scrollContainer.offsetLeft;
                const walk = (x - startX) * 2;
                scrollContainer.scrollLeft = scrollLeft - walk;
            });

            // Touch events for mobile
            scrollContainer.addEventListener('touchstart', (e) => {
                isDown = true;
                startX = e.touches[0].pageX - scrollContainer.offsetLeft;
                scrollLeft = scrollContainer.scrollLeft;
            });

            scrollContainer.addEventListener('touchend', () => {
                isDown = false;
            });

            scrollContainer.addEventListener('touchmove', (e) => {
                if (!isDown) return;
                const x = e.touches[0].pageX - scrollContainer.offsetLeft;
                const walk = (x - startX) * 2;
                scrollContainer.scrollLeft = scrollLeft - walk;
            });

            // Parallax effect on scroll
            window.addEventListener('scroll', () => {
                const parallaxElements = document.querySelectorAll('.parallax-element');
                parallaxElements.forEach(element => {
                    const speed = parseFloat(element.getAttribute('data-speed')) || 0.5;
                    const yPos = -(window.scrollY * speed);
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`;
                });
            });
        });

        // Product Modal functionality
        function openModal(productType) {
            const modal = document.getElementById('productModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');
            const modalImage = document.getElementById('modalImage');

            // Set modal content based on product type
            switch(productType) {
                case 'harinas':
                    modalTitle.textContent = 'Harinas';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_harina.webp" alt="Harinas">';
                    modalContent.innerHTML = `
                        <div class="product-item">
                            <h4 class="font-tech">Harina de Carne y Hueso</h4>
                            <p style="text-align: justify;">Es un producto con alto contenido de lisina (aminoácido esencial), fuente de vitaminas del grupo B, contiene minerales como el zinc, magnesio, sodio, cloro y en mayor cantidad el calcio y fosforo.</p>
                        </div>
                        <div class="product-item">
                            <h4 class="font-tech">Harina de Plumas Hidrolizadas</h4>
                            <p style="text-align: justify;">Es una proteína sobre pasante del RUMIANTE. Es fuente de energía, por lo que intervienen en la formación de los músculos.</p>
                        </div>
                        <div class="product-item">
                            <h4 class="font-tech">Harina de Carne Baja Ceniza</h4>
                            <p style="text-align: justify;">Es un producto que contiene lisina (aminoácido esencial), fuente de vitaminas del grupo B, contiene minerales como el zinc, magnesio, sodio, cloro, calcio y fosforo.</p>
                        </div>
                    `;
                    break;
                case 'sebos':
                    modalTitle.textContent = 'Sebos';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_sebo.webp" alt="Sebos">';
                    modalContent.innerHTML = `
                        <div class="product-item">
                            <h4 class="font-tech">Sebo Blanco Especial</h4>
                            <p style="text-align: justify;">Es un producto que mejora las características sensoriales del alimento, se usa como recubrimiento y vehículo para disolver, saborizantes en los alimentos para mascota.</p>
                        </div>
                        <div class="product-item">
                            <h4 class="font-tech">Sebo de Origen Animal</h4>
                            <p style="text-align: justify;">Es un producto que mejora las características sensoriales del concentrado; suministra Ácidos grasos esenciales (acido linoleico); canaliza las vitaminas del grupo A, D, E y K; aumenta el tamaño y número de huevos en ponedoras jóvenes y aumenta el peso corporal; reduce la abrasividad y el polvo en los procesos; ayuda a prevenir el estreñimiento en cerdos; aumenta la producción de leche, el contenido de calostro y las reservas de energía en los cerdos bebes.</p>
                        </div>
                    `;
                    break;
                case 'saborizantes':
                    modalTitle.textContent = 'Saborizantes';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_saborizante.webp" alt="Saborizantes">';
                    modalContent.innerHTML = `
                        <div class="product-item">
                            <h4 class="font-tech">Saborizante de Hígado de Pollo</h4>
                            <p style="text-align: justify;">Es un sistema de palatabilidad líquido para aplicación en alimentos para perros, formulado utilizando hígados de pollo y avanzadas tecnólogas de sabor.</p>
                        </div>
                        <div class="product-item">
                            <h4 class="font-tech">Saborizante de Vísceras de Pollo</h4>
                            <p style="text-align: justify;">Sistema de palatabilidad líquido para aplicación en alimentos para perros, formulado utilizando vísceras de pollo y avanzadas tecnológicas de sabor.</p>
                        </div>
                    `;
                    break;
                case 'petgourmet':
                    modalTitle.textContent = 'Mini Bruno Pet Gourmet';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_mbpg.webp" alt="Pet Gourmet">';
                    modalContent.innerHTML = `
                        <div class="product-item">
                            <h4 class="font-tech">Salsa Nutricional para Perros</h4>
                            <p style="text-align: justify;">Salsa nutricional para realzar el sabor del alimento seco a base de Carne de Cerdo e ingredientes frescos y naturales, que hará que tu mascota de 1 año de vida o más disfrute mejor el consumo del alimento. Vienen en sabores de Pollo, Carne y Tocineta.</p>
                        </div>
                        <div class="product-item">
                            <h4 class="font-tech">Bocaditos para Perros</h4>
                            <p style="text-align: justify;">Snack o premio deshidratado a base de Bofe de Res fresco, 100% natural, textura crocante, alto contenido de proteínas y listo para ser consumido. Pueden suministrarse para premiar acciones positivas y/o reforzar relaciones afectivas en perros adultos de todas las razas. Su Sabor es de Bofe de Res en su Version para Perros y Gatos.</p>
                        </div>
                        <div class="product-item">
                            <h4 class="font-tech">Alimento Completo para Gatos</h4>
                            <p style="text-align: justify;">Alimento completo balanceado, húmedo y blando a base de Pollo e ingredientes frescos y naturales. Listo para ser consumido por gatos adultos de un año o más. Su sabor es a pollo.</p>
                        </div>
                    `;
                    break;
            }

            // Show modal with animation
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // About Modal functionality
        function openAboutModal(aboutType) {
            const modal = document.getElementById('aboutModal');
            const modalTitle = document.getElementById('aboutModalTitle');
            const modalContent = document.getElementById('aboutModalContent');
            const modalImage = document.getElementById('aboutModalImage');

            switch(aboutType) {
                case 'historia':
                    modalTitle.textContent = 'Historia de la Empresa';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_historia.webp" alt="Historia">';
                    modalContent.innerHTML = `
                        <div class="policy-item">
                            <h4 class="font-tech">Bruno Mini y Luigia Crespi de Mini</h4>
                            <p><strong>Autora: Gabriela Mini Arreaza.</strong></p>
                            
                            <h4 class="font-tech">Capitulo 1: Recuerdos de Familia.</h4>
                            <p style="text-align: justify;">A medida que transcurre el tiempo mi memoria no es la misma, pero la vida es tan asombrosa que los recuerdos que más fácilmente me vienen a la mente son los de los buenos tiempos. Entre estos los que más aprecio, y los que a menudo les cuento y recuento a mis hijos son los de mis abuelos. Curiosamente, muchos de estos recuerdos no son ni siquiera míos, sino de mis papás y mis tíos abuelos quienes a lo largo de los años me contaron la vida de mis abuelos: unos inmigrantes italianos que llegaron con muy poco a Venezuela, pero que dejaron mucho.</p>
                            <p style="text-align: justify;">Creo que lo que más me gusta de estos recuerdos no son las historias en sí, sino el orgullo con el que mis familiares me las contaban. Siempre recuerdo la alegría con que brillaban los ojos de mi tía abuela cuando me hablaba de su hermano Bruno, o el profundo cariño que sentía en las palabras de mi papá cuando él me contaba algo de su madre.</p>
                            <p style="text-align: justify;">Al escribir esta breve historia de mis abuelos, Bruno Mini y Luigia Crespi de Mini, siento también ese mismo orgullo que tantas veces vi en la cara de mis familiares. Ahora entiendo que el tema común que une todas sus historias es el profundo sentido de la justicia y el trabajo que siempre tuvieron. Tanto mis abuelos como mis padres siempre ocuparon muchos roles, pero por, sobre todo, y en cualquiera de estos roles, siempre fueron eso: personas justas que creen en el trabajo.</p>
                            <p style="text-align: justify;">La historia de cómo llegaron a Venezuela me la contó hace ya más de treinta años, Fernanda Mini, hermana de mi abuelo y además la esposa de Andrea Pinciroli, el mejor amigo de mi abuelo.</p>
                            
                            <h4 class="font-tech">Capitulo 2: Orígenes de Italia.</h4>
                            <p style="text-align: justify;">Mis abuelos llegaron de Italia casi por accidente, y si no por accidente si por una cadena de coincidencias que cuando las pienso parecen más guiadas por el destino que por un simple encuentro fortuito.</p>
                            <p style="text-align: justify;">Mi abuelo nació en Rimini, una ciudad pequeña de la provincia de Emiglia Romagna, que hoy en día se conoce más que todo por su costa turística. Mi abuela, en cambio, era de Busto Garolfo, en Lombardia, que es una región industrial y es a donde fue a parar mi abuelo porque en su pueblo no había trabajo.</p>
                            <p style="text-align: justify;">Mis abuelos nacieron y crecieron en épocas de guerra. Italia había pasado de ser una potencia económica e industrial antes de la 1era Guerra Mundial para convertirse progresivamente en un país pobre, inestable y sin oportunidades. Es en Lombardia, a mediados de la década de 1930, donde poco después de conocerse se casan Bruno y Luigia, gracias al tío Andrea. A los pocos años, también en Lombardia, nacen sus dos hijos, Francesca Mini Crespi (1937) y mi papá, Augusto Mini Crespi (1940).</p>
                            <p style="text-align: justify;">Según mi tía abuela Fernanda, su niñez en Emilia Romana, junto a mi papá y los otros ocho hermanos fue tranquila. Vivian en un ambiente pacífico al lado del mar. No les faltaba nada y, a pesar de no vivir con excesos o lujos, eran muy felices. Los vecinos se ayudaban los unos a los otros y su mamá (mi bisabuela) era el personaje central de su familia. Según la tía abuela Fernanda, mi bisabuela Anna era una mujer muy generosa que amaba a todos sus hijos y que con poca cantidad de alimentos e ingredientes cocinaba exquisitos platos que siempre hacía rendir si aparecían más comensales.</p>
                            
                            <h4 class="font-tech">Capitulo 3: La Guerra y la Resistencia.</h4>
                            <p style="text-align: justify;">Con la Segunda Guerra Mundial esa niñez tranquila se vio repentinamente transformada. Lo que había sido un pueblo tranquilo se convirtió de repente en un lugar inhóspito de pocas industrias y poco desarrollo. Ante la creciente amenaza de más pobreza y más desempleo mi abuelo y varios de sus hermanos, así como millones de italianos, decidieron dejar Italia para comenzar vidas nuevas.</p>
                            <p style="text-align: justify;">La Italia de mis abuelos estaba bajo el mando autoritario de una sola persona, Benito Mussolini (durante el período de octubre 1922 hasta julio 1943). Y para mi abuelo que, según mis dos tíos: Andrea y Fernanda, siempre fue un hombre lleno de ganas de vivir, las cosas a su alrededor se tornaron cada vez más difíciles. Me contaba el tío abuelo Andrea que un día se le apareció su gran amigo, Bruno, vestido de soldado alemán. Además del uniforme que jamás sabré como consiguió, mi abuelo también traía a un perro pastor alemán. Mi abuelo no se había cambiado de bando. Sencillamente amaba a los perros y a estos los estaba entrenando para ponerlos al servicio de las tropas de la resistencia que en ese momento peleaban contra los soldados alemanes en su país.</p>
                            <p style="text-align: justify;">Lo del uniforme fue más difícil de entender. Al ver a mi abuelo disfrazado del enemigo su gran amigo le preguntó qué si se había enlistado. Mi abuelo, sin mayor preocupación, le respondió que no, y que sencillamente se iba al sur a buscar azúcar porque ya en el norte no quedaba. Mi abuelo no hablaba nada de alemán, pero eso no representó un obstáculo para él. Cruzó territorios enteros tomados por los alemanes y después de una semana regresó victorioso con varios sacos de azúcar. No había ganado ninguna batalla, pero si había ganado la guerra contra la escasez de azúcar, y contra una vida vivida sin sabor.</p>
                            <p style="text-align: justify;">Quizás ese fue el momento en que los dos supieron que mi abuelo no podría vivir jamás sin aventuras, y así fue por un tiempo. Bruno, disfrazado de soldado alemán, paso varios meses haciendo ese mismo viaje. A pesar de lo peligroso logró en muchas oportunidades encontrar lo que tanta falta hacía en el norte. Mientras mi tío abuelo Andrea me contaba esto, él se llenaba de orgullo ante el ingenio de su gran amigo. Yo, una niña, solo pensaba en los nervios de mi abuela esperando que su esposo regresara.</p>
                            <p style="text-align: justify;">Pero la aventura que más le sorprendería a Andrea fue cuando Bruno se le apareció vestido, no de soldado alemán, sino con su pinta dominical y le pidió que lo acompañara a Milán para pedir la bendición, "lo más antes posible”, del padre. La razón de su apuro era porque Bruno había decidido reunirse en "América” (así le dicen los italianos a cualquier parte del continente) con Magdalena y Gualfardo, dos de sus nueve hermanos, que ya estaban viviendo en Argentina. Andrea, vestido también de pinta dominical, acompañó a mi abuelo a la catedral de Milán donde además de la bendición el padre le dio los datos de la única persona que conocía en todo el continente: su hermana monja que vivía en Venezuela, como si Argentina quedara tan cerca de Venezuela como Italia de Francia. Sin saberlo en ese momento, y pesar de lo absurdo de la situación, esta oferta de ayuda terminó siendo una predicción.</p>
                            <p style="text-align: justify;">El tío Andrea me contó que Bruno temía mucho sobre el porvenir político de su país. Mi abuelo no simpatizaba con Mussolini, pero después de su caída también sentía que su país podía vivir muchos años de inestabilidad. El temía la entrada del comunismo y de hecho Italia estuvo muy cerca de tomar ese rumbo, como muchos otros países del este de Europa después de la guerra.</p>
                            <p style="text-align: justify;">Después de una triste despedida, mi abuelo se embarcó en un viaje largo a lo que efectivamente parecía, para esa época, otro mundo. En esa época, si los viajes eran muy largos, los aviones paraban en Tenerife, en las Islas Canarias, a poner gasolina. Pero el avión donde viajaba Bruno rumbo a Argentina, luego de Tenerife, también paró en Cumana, estado Sucre, Venezuela. Lo que debía haber sido una breve escala, para arreglar una falla mecánica tardo más de un mes. Mi abuelo, al ver que no había señales de un nuevo vuelo, decidió ir a conocer a aquella monja, hermana del sacerdote que un mes atrás le había dado la bendición y sin saberlo, la oportunidad de una nueva vida. La monja, cuyo nombre nadie recordaba, vivía cerca de Caracas. Y así, con la ayuda de una monja que no conocía, desistió de la idea de irse a Argentina y adoptó a Venezuela como el país de su futuro.</p>
                            <p style="text-align: justify;">Mis tíos me contaban que mi abuelo se enamoró de Venezuela inmediatamente y luego de transcurrir un año, y de sentirse seguro que ese era el país de oportunidades para su familia llamó a mi abuela para que viniera con los hijos a reunirse con él. Tuvo razón. Durante los años que mi abuelo pasó en Venezuela —los años 50 y 60— Venezuela era un país lleno de oportunidades para los venezolanos y para los tantos inmigrantes que llegaron de todas partes del mundo.</p>
                            <p style="text-align: justify;">La vida de los inmigrantes no es una vida fácil. Emigrar implica adaptarse, como decía mi abuela, a otro mundo. En Venezuela, mi abuelo encontró un chance de una nueva vida para él, sus hijos, y sin saberlo sus nietos. A la tía Fernanda le hizo mucha falta su hermano favorito. En las casi dos décadas que mi abuelo vivió en Venezuela, solo logro ir a Italia una vez. En este viaje, me contaba mi tía Fernanda, que mi abuelo les trajo de regalo una cosa maravillosa, con una gran corona, y ojos de espinas, y que lleno su casa de un olor que jamás olvidarían. Esta piña, la trajo mi abuelo aun verde para que madurara mientras él estaba en casa. Durante más de tres semanas la piña ocupó un lugar de honor en el centro de la mesa de comedor. Allí fue admirada por todos los que venían a ver a mi abuelo. Su color fue cambiando de verde al amarillo ocre de una piña madura. Su olor fue llenando de expectativas a toda la familia. La piña, con su corona, era en efecto, una especie de reina. Fueron unas semanas de admiración por este fruto exótico y desconocido, pero sobre todo fueron dos semanas de estar con su adorado y extrañado hermano y mejor amigo.</p>
                            
                            <h4 class="font-tech">Capitulo 5: Fundación de Mini Bruno Sucesores.</h4>
                            <p style="text-align: justify;">En Venezuela, el carácter aventurero de mi abuelo lo ayudó, ya esta vez no a conseguir azúcar, pero si a buscar oportunidades de negocios. Para los años 1950 no había en Venezuela ninguna industria procesadora de subproductos de origen animal. Mi abuelo se percató de que los mataderos no hallaban que hacer con el material animal restante. Después de recorrer múltiples mataderos alrededor de Caracas entendió que lo que para muchos eran desechos para él podía convertirse en la materia prima que después transformaría en alimentos para mascotas. Y así, con la ayuda de mi abuela y algunos asistentes comenzaron a procesar manualmente, en una especie de cocina rudimentaria, estos "desechos".</p>
                            <p style="text-align: justify;">Para los años 1955 adquieren equipos para procesar subproductos cárnicos y trasformar grasa y hueso de origen animal en productos útiles. A los pocos años, habiéndose expandido lo suficiente, mis abuelos compran terrenos en Los Teques donde construyen una planta, su vivienda y un pequeño edificio con apartamentos para algunos de sus trabajadores. Es lo que hoy conocemos como la planta de Rio Cristal. Ya para 1967 se constituye formalmente Mini Bruno Sucesores, C.A. en la carretera vieja de Los Teques.</p>
                            
                            <h4 class="font-tech">Capitulo 6: Legado y Continuidad.</h4>
                            <p style="text-align: justify;">Lamentablemente, este mismo carácter aventurero de mi abuelo, fue la razón de su trágica muerte a sus 50 años en su planta de Rio Cristal. Fue un hecho inesperado, que llenó a la familia de mucha tristeza. Se había ido un hombre increíble, generoso y lleno de grandes ideas para la familia y para el país. Tengo entendido que mi abuelo dejó a mitad de camino varias ideas de negocios, desde montar una planta procesadora de café hasta otros emprendimientos en el sector de la agricultura. En sus dos décadas de vida en Venezuela construyó la primera planta procesadora de subproductos cárnicos. ¿Quién sabe que otro gran proyecto se le hubiese ocurrido?</p>
                            <p style="text-align: justify;">A pesar del gran vacío que mi abuelo dejó mi abuela y mi papa supieron seguir trabajando incansablemente para que Mini Bruno Sucesores continuara y se consolidara como la compañía más exitosa en lo que hace de toda Venezuela. Aún hoy en día, 70 años más tarde, Mini Bruno Sucesores es la empresa líder del sector de subproductos cárnicos. Quizás a algunos les sorprenda que la compañía de mi abuelo haya podido sobrevivir después de que él muriera. A mi no. Si bien mi abuelo era un hombre de corazón aventurero y de gran creatividad, mi abuela Luigia siempre estuvo construyendo Mini Bruno a su lado. Fue ella, quien, con sus propias manos, en su cocina rudimentaria volvió la idea de Bruno en un producto concreto.</p>
                            <p style="text-align: justify;">Mi abuela Luigia era una mujer increíble, y su hijo, mi papá, es la perfecta combinación de su padre genial y su madre invencible. Mi abuela no se volvió a casar. Ella y su hijo, mi papá, se dedicaron a consolidar el sueño de mi abuelo. Juntos transformaron una compañía de más de 300 empleados en la empresa líder del sector.</p>
                            <p style="text-align: justify;">Hoy, a los 55 años de fundada, Mini Bruno Sucesores produce harinas, sebos, saborizantes y una nueva línea de alimentos nutritivos para mascotas; vende en casi todos los estados del país y espera expandirse a otros países de la región con la apertura de la frontera. Hoy, más 70 años después de ese viaje fortuito a América, yo siento el mismo orgullo que sintieron mis tíos abuelos contándome la vida de mi abuelo, y la misma alegría que vi en los ojos de mi padre recordando a los suyos. Solo puedo esperar que además de estas historias también queden los valores de emprendimiento, tenacidad y justicia que guiaron a mis abuelos y a mis padres por muchos años más.</p>
                        </div>
                    `;
                    break;
                case 'politicas':
                    modalTitle.textContent = 'Políticas de la Empresa';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_politicas.webp" alt="Políticas">';
                    modalContent.innerHTML = `
                        <div class="policy-item">
                            <h4 class="font-tech">Política de Seguridad Laboral</h4>
                            <p style="text-align: justify;">Mini Bruno Sucesores, C.A. empresa que diseña y manufactura productos a partir de materias primas cárnicas, asume el responsabilidad de gestionar la Seguridad y Salud Laboral para todo el personal que labora directa e indirectamente en esta organización. Para ello nuestras acciones estarán orientadas a:</p>
                            <p style="text-align: justify;">Cumplir las leyes, reglamentos y normas vigentes que rigen en materia de Seguridad y Salud Laboral.</p>
                            <p style="text-align: justify;">Contribuir activamente a la prevención de accidentes, lesiones y enfermedades derivadas del trabajo.</p>
                            <p style="text-align: justify;">Capacita a nuestros trabajadores y tomar acciones permanentes que permitan el mejoramiento continuo de la Seguridad y Salud Laboral de cada uno de nuestros colaboradores</p>
                        </div>
                        <div class="policy-item">
                            <h4 class="font-tech">Política de la Calidad</h4>
                            <p style="text-align: justify;">Mini Bruno Sucesores, C.A., empresa dedicada al diseño y elaboración de productos a partir de materia prima cárnica, se compromete a desarrollar, mantener y mejorar un Sistema de Gestión de la Calidad e Inocuidad que permita:</p>
                            <p style="text-align: justify;">Satisfacer las necesidades, requerimientos y expectativas de los clientes y de todas las partes interesadas en la organización.</p>
                            <p style="text-align: justify;">Garantizar la calidad e inocuidad de nuestros productos y servicios.</p>
                            <p style="text-align: justify;">Fortalecer las competencias de los trabajadores a través de capacitaciones que fomenten el cumplimiento de las normas y procedimientos asociados a calidad e inocuidad.</p>
                            <p style="text-align: justify;">Mejorar continuamente los procesos y productos.</p>
                        </div>
                        <div class="policy-item">
                            <h4 class="font-tech">Política Ambiental</h4>
                            <p style="text-align: justify;">Mini Bruno Sucesores, C.A. consciente de la repercusión ambiental que origina nuestra actividad productiva, se compromete a:</p>
                            <p style="text-align: justify;">Cumplir con la legislación y reglamento en materia ambiental, aplicables a nuestras operaciones e instalaciones.</p>
                            <p style="text-align: justify;">Prevenir la contaminación, mediante la gestión de los desechos.</p>
                            <p style="text-align: justify;">Capacitar a nuestro personal en materia ambiental, fomentando el ahorro de energía y agua.</p>
                            <p style="text-align: justify;">Mejorar continuamente los procesos a favor del ambiente.</p>
                        </div>
                    `;
                    break;
                case 'mision':
                    modalTitle.textContent = 'Misión, Visión y Valores';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_valores.webp" alt="Misión Visión">';
                    modalContent.innerHTML = `
                        <div class="policy-item">
                            <h4 class="font-tech">Misión</h4>
                            <p style="text-align: justify;">En Mini Bruno Sucesores, C.A. trabajamos para satisfacer las expectativas de nuestros clientes y partes interesadas, asegurando el abastecimiento oportuno, con la mejor relación costo beneficio para nuestros clientes; contribuyendo al optimo desarrollo del sector de fabricación para la línea de Alimentos Balanceados de Animales.</p>
                        </div>
                        <div class="policy-item">
                            <h4 class="font-tech">Visión</h4>
                            <p style="text-align: justify;">Innovar y garantizar productos de calidad, contribuyendo con el desarrollo sostenible y la protección al medio ambiente a través de relaciones salidas con nuestros clientes y trabajadores.</p>
                        </div>
                        <div class="policy-item">
                            <h4 class="font-tech">Valores</h4>
                            <p style="text-align: justify;">Respeto, responsabilidad, trabajo en equipo, resiliencia, honestidad y compromiso.</p>
                        </div>
                    `;
                    break;
                case 'departamentos':
                    modalTitle.textContent = 'Departamentos';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_departamentos.webp" alt="Departamentos">';
                    modalContent.innerHTML = `
                        <div class="department-item">
                            <h4 class="font-tech">Control de Calidad</h4>
                            <p style="text-align: justify;">En Mini Bruno Sucesores garantizamos el cumplimiento de estrictos controles de calidad, y verificamos la conformidad de cada uno de los productos en nuestro Laboratorio de Control de Calidad.</p>
                            <p style="text-align: justify;">El laboratorio de control de calidad cuenta con personal calificado y con equipos que nos permiten realizar las siguientes actividades:</p>
                            <ul>
                                <li>Verificacion de cumplimiento de especificaciones.</li>
                                <li>Calibracion de equipos de medicion para la realizacion de analisis.</li>
                                <li>Control microbiologico.</li>
                                <li>Control estadistico de procesos.</li>
                                <li>Diseño y desarrollo de nuevos productos.</li>
                            </ul>
                            <p>Realizamos los siguientes analisis a nuestros productos terminados:</p>
                            <ul>
                                <li>Proteinas (COVENIN 1195-80 Metodo Kjeldahl).</li>
                                <li>Humedad (COVENIN 705:1996).</li>
                                <li>Acidez Oleica (COVENIN 325:2001).</li>
                                <li>Calcio (COVENIN 1158:1982).</li>
                                <li>Impurezas Insolubles (COVENIN 509:2001).</li>
                                <li>Digestibilidad (COVENIN 1316:1981).</li>
                                <li>Apendice de Peroxidos (COVENIN 508:2001).</li>
                                <li>Apendice de Saponificacion (COVENIN 323:1998).</li>
                                <li>Cenizas totales (COVENIN 1155:1979).</li>
                                <li>Grasa Cruda (COVENIN 1162:1979).</li>
                                <li>Presencia de Salmonella (COVENIN 1291:2004).</li>
                            </ul>
                        </div>
                        <div class="department-item">
                            <h4 class="font-tech">Sistema, Diseño y Desarrollo</h4>
                            <p style="text-align: justify;">Contamos con un departamento dedicado exclusivamente al mejoramiento de nuestros productos, al desarrollo de nuevas aplicaciones para nuestra materia prima y al empleo de las Últimas tecnologías en la industria del procesamiento de sub-productos cárnicos.</p>
                            <p style="text-align: justify;">Nuestro objetivo es satisfacer las necesidades crecientes de nuestros clientes con respecto a nuevas alternativas y usos de proteínas, grasas y sabores de origen animal. Inspirados por esta meta, diseñamos nuevos procesos siguiendo las más exigentes normas de manufactura y buscando que nuestros productos y procesos sean eficientes e innovadores.</p>
                        </div>
                        <div class="department-item">
                            <h4 class="font-tech">Producción</h4>
                            <p style="text-align: justify;"><strong>Mision Productiva:</strong></p>
                            <ul>
                                <li>Uso de tecnologia de punta para todos los procesos de produccion.</li>
                                <li>Mejora continua a traves de la actualizacion de la tecnologi­a utilizada de acuerdo a los estandares internacionales.</li>
                                <li>Entrenamiento constante del personal en el uso de las instalaciones y el control de calidad de los parametros de produccion.</li>
                            </ul>
                            <p style="text-align: justify;"><strong>Tecnologi­a, Concepto y Maquinas:</strong></p>
                            <p style="text-align: justify;">La tecnologia aplicada es "dry rendering" (recuperacion en seco) de tipo continuo o por lote. El "dry rendering" consiste en la coccion controlada de las materias primas por intercambio indirecto de calor o inyeccion de vapor para los hidrolizados.</p>
                            <p style="text-align: justify;">Los procesos continuos garantizan la maxima eficiencia de producción y permite que las materias primas se procesen frescas. El corazón de este proceso es un cocinador continuo. Los procesos por lote se usan para cantidades mas pequeñas de materia prima con controles especi­ficos sobre el lote. El corazon de este proceso es un reactor o cocinador.</p>
                            <p style="text-align: justify;">Las maquinas principales de proceso son fabricadas por las empresas mas reconocidas a nivel mundial y actualizadas constantemente.</p>
                            <p style="text-align: justify;"><strong>Control de Procesos:</strong></p>
                            <p style="text-align: justify;">El control de los procesos se realiza por medio de dispositivos automaticos programables o PLC y tableros remotos de operación. Este sistema garantiza la minima variabilidad de los parametros de calidad de los productos terminados. Aparte, los parametros de calidad se registran en cartas de control que son revisadas constantemente.</p>
                        </div>
                    `;
                    break;
                case 'seguridad':
                    modalTitle.textContent = 'Seguridad y Salud Laboral';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_seguridad.webp" alt="Seguridad">';
                    modalContent.innerHTML = `
                        <div class="department-item">
                            <h4 class="font-tech">Seguridad y Salud Laboral</h4>
                            <p style="text-align: justify;">La seguridad y salud laboral de todas las personas que laboran de manera directa o indirectamente en las instalaciones de Mini Bruno Sucesores, constituye uno nuestros principios fundamentales. Para ello contamos con un Departamento de Seguridad y Salud Laboral, cuya misión es contribuir a elevar la seguridad y calidad del ambiente de trabajo a través de la definición, asesoramiento y la coordinación de políticas y procedimientos adaptables a la normativa legal vigente.</p>
                            <p style="text-align: justify;">El Departamento de Seguridad y Salud Laboral cumple sus funciones con el asesoramiento y la asistencia de:</p>
                            <ul>
                                <li>El Comité de Seguridad y Salud Laboral, un órgano paritario y colegiado de participación destinado a la consulta regular y periódica de las políticas, programas y actuaciones en materia de seguridad y salud en el trabajo.</li>
                                <li>La Brigada de Emergencia, un ente voluntario auxiliar del personal de seguridad industrial capacitado para participar en el control y prevención de emergencias en su fase inicial.</li>
                            </ul>
                            <p style="text-align: justify;">El Departamento de Seguridad y Salud Laboral se rige por las siguientes normativas legales:</p>
                            <ul>
                                <li>Constitución de la República Bolivariana de Venezuela.</li>
                                <li>Ley Orgánica del Trabajo (LOT).</li>
                                <li>Ley Orgánica de Prevención, Condición y Medio Ambiente de Trabajo (LOPCYMAT).</li>
                                <li>Reglamento de las Condiciones de Higiene y Seguridad en el Trabajo.</li>
                            </ul>
                            <p style="text-align: justify;">Tomando en cuenta la normativa legal vigente y centrándonos en el bienestar de nuestros trabajadores y patrimonio, el Departamento de Seguridad y Salud Laboral vela por el cabal cumplimento de sus programas y políticas, las cuales buscan los siguientes objetivos:</p>
                            <ul>
                                <li>Cumplir con las leyes, reglamentos y normas industriales aplicables a nuestra actividad.</li>
                                <li>Garantizar la salud de nuestros trabajadores y la integridad del medio ambiente y patrimonio mediante el suministro de equipos y procesos seguros, mediante el control de los riesgos presentes en cada caso.</li>
                                <li>Adiestrar a nuestros trabajadores como supervisores y promotores de seguridad y salud.</li>
                                <li>Crear conciencia entre nuestros trabajadores de que todos formamos parte del proceso seguro.</li>
                                <li>Dedicar recursos necesarios para asegurar la implementación exitosa de nuestros planes de acción.</li>
                            </ul>
                        </div>
                    `;
                    break;
                case 'transporte':
                    modalTitle.textContent = 'Transporte';
                    modalImage.innerHTML = '<img src="img_ref/webp/modal_transporte.webp" alt="Transporte">';
                    modalContent.innerHTML = `
                        <div class="department-item">
                            <h4 class="font-tech">Recolección de Subproductos</h4>
                            <p style="text-align: justify;">Para la recolección de subproductos, contamos con una flota propia de camiones (pequeños, medianos y gandolas) en excelente estado y equipados con cajones de recolección idóneos fabricados en aluminio. Prestan el servicio de recolección conductores y ayudantes entrenados, uniformados y con buena presencia.</p>
                        </div>
                        <div class="department-item">
                            <h4 class="font-tech">Centros de Recolección</h4>
                            <ul>
                                <li>Beneficiadoras de reses, aves y cerdos.</li>
                                <li>Carnicerías.</li>
                                <li>Plantas de embutidos.</li>
                                <li>Cadenas de supermercados.</li>
                                <li>Centros de despostes.</li>
                            </ul>
                        </div>
                        <div class="department-item">
                            <h4 class="font-tech">Zonas Atendidas</h4>
                            <ul>
                                <li>Gran Caracas: Zona Metropolitana, Valles del Tuy, Guatire, Litoral, Carayaca.</li>
                                <li>Zona Central: Tejerías, Maracay, Valencia, resto de los estados Aragua y Carabobo.</li>
                                <li>Zona Oriente: Estados Anzoátegui, Monagas, Sucre y Bolívar.</li>
                                <li>Zona Occidente: Tinaquillo, Barquisimeto, resto de los Estados Lara y Yaracuy</li>
                            </ul>
                        </div>
                        <div class="department-item">
                            <h4 class="font-tech">Distribución de Producto Terminado</h4>
                            <p style="text-align: justify;">Despachamos nuestros productos a cualquier destino a nivel nacional.</p>
                            <ul>
                                <li>Gandolas equipadas con bateas para el traslado de harina en sacos, tanques graneleros para el traslado de harina a granel, o tanques cisternas para traslado de sebos.</li>
                                <li>Camiones medianos tipo plataforma para el traslado de harina en sacos.</li>
                            </ul>
                        </div>
                    `;
                    break;
            }

            // Show modal with animation
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Contact Modal functionality
        function openContactModal(contactType) {
            const modal = document.getElementById('contactModal');
            const modalTitle = document.getElementById('contactModalTitle');
            const modalContent = document.getElementById('contactModalContent');

            switch(contactType) {
                case 'direccion':
                    modalTitle.textContent = 'Direcciones de Nuestras Plantas';
                    modalContent.innerHTML = `
                        <div class="contact-item">
                            <h4 class="font-tech">Planta Río Cristal - Caracas</h4>
                            <p style="text-align: justify;">Carretera Vieja Los Teques Km 7, Sector Rio Cristal-Macarao, Planta Mini Bruno Sucesores Caracas-Venezuela</p>
                            <div class="map-container">
                                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.57457484774!2d-66.9174716852045!3d10.4195549925439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDI1JzEwLjQiTiA2NsKwNTUnMDAuOSJX!5e0!3m2!1ses!2sve!4v1600000000000!5m2!1ses!2sve" allowfullscreen="" loading="lazy"></iframe>
                            </div>
                        </div>
                        <div class="contact-item">
                            <h4 class="font-tech">Planta Santa Cruz</h4>
                            <p style="text-align: justify;">Final 2da. Av. Parcela G-25 y G-26. Zona Industrial de Santa Cruz. Edo. Aragua, Venezuela</p>
                            <div class="map-container">
                                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3924.123456789012!2d-67.41234567890123!3d10.123456789012345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDA3JzI0LjQiTiA2N8KwMjQnNDUuMCJX!5e0!3m2!1ses!2sve!4v1600000000000!5m2!1ses!2sve" allowfullscreen="" loading="lazy"></iframe>
                            </div>
                        </div>
                    `;
                    break;
                case 'telefono':
                    modalTitle.textContent = 'Teléfonos de Contacto';
                    modalContent.innerHTML = `
                        <div class="contact-item">
                            <h4 class="font-tech">Planta Río Cristal</h4>
                            <p><i class="fas fa-phone"></i> +58-212-434-5074</p>
                            <p><i class="fas fa-phone"></i> +58-212-434-4946</p>
                            <p><i class="fas fa-mobile-alt"></i> +58-412-265-2445</p>
                        </div>
                        <div class="contact-item">
                            <h4 class="font-tech">Planta Santa Cruz</h4>
                            <p><i class="fas fa-phone"></i> +58-243-200-2300</p>
                        </div>
                    `;
                    break;
            }

            // Show modal with animation
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Close modals when clicking outside
        document.getElementById('productModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal('productModal');
            }
        });

        document.getElementById('aboutModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal('aboutModal');
            }
        });

        document.getElementById('contactModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal('contactModal');
            }
        });

        // Close modals with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal('productModal');
                closeModal('aboutModal');
                closeModal('contactModal');
            }
        });

//---------------- Implementación de efectos de fondo con IntersectionObserver-----------------
        document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section");

  // Usamos IntersectionObserver para detectar cuando una sección entra/sale de la vista
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const bgImage = entry.target.querySelector(".background-image1, .background-image2, .background-image3, .background-image4, .background-image5");
      if (!bgImage) return;

      if (entry.isIntersecting) {
        // Cuando la sección está visible → fade-in + glitch
        bgImage.classList.add("visible");
        bgImage.classList.remove("fade-out");
      } else {
        // Cuando la sección deja de estar visible → fade-out
        bgImage.classList.add("fade-out");
        bgImage.classList.remove("visible");
      }
    });
  }, { threshold: 0.6 }); // 60% visible para activar

  // Observamos cada sección
  sections.forEach(section => observer.observe(section));
});
// --------------Fin de la implementación de efectos de fondo con IntersectionObserver--------------

//---------------- Implementación de scroll horizontal con inercia, Control con Mouse y Touch -----------------
// Selecciona el contenedor principal del scroll horizontal
const scrollContainer = document.querySelector(".horizontal-scroll");

// Variables de control para el arrastre con mouse
let isDown = false;
let startX;
let scrollLeft;

// --- CONTROL CON MOUSE ---
scrollContainer.addEventListener("mousedown", (e) => {
  isDown = true;
  scrollContainer.classList.add("active");
  startX = e.pageX - scrollContainer.offsetLeft;
  scrollLeft = scrollContainer.scrollLeft;
});

scrollContainer.addEventListener("mouseleave", () => {
  isDown = false;
  scrollContainer.classList.remove("active");
});

scrollContainer.addEventListener("mouseup", () => {
  isDown = false;
  scrollContainer.classList.remove("active");
});

scrollContainer.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault(); // evita selección de texto
  const x = e.pageX - scrollContainer.offsetLeft;
  const walk = (x - startX) * 1.5; // velocidad de arrastre
  scrollContainer.scrollLeft = scrollLeft - walk;
});

// --- CONTROL CON TOUCH (pantallas táctiles) ---
let touchStartX = 0;
let touchScrollLeft = 0;

scrollContainer.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].pageX - scrollContainer.offsetLeft;
  touchScrollLeft = scrollContainer.scrollLeft;
}, { passive: true });

scrollContainer.addEventListener("touchmove", (e) => {
  const x = e.touches[0].pageX - scrollContainer.offsetLeft;
  const walk = (x - touchStartX) * 1.5; // velocidad de arrastre
  scrollContainer.scrollLeft = touchScrollLeft - walk;
}, { passive: true });


//---------------- Fin de la implementación de scroll horizontal con inercia, Control con Mouse y Touch -----------------