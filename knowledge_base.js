// ==========================================================================
// KNOWLEDGE_BASE.JS - BASE DE CONOCIMIENTOS DE MESA DE AYUDA Y SISTEMAS MINI BRUNO
// ==========================================================================

const MINI_BRUNO_KNOWLEDGE_BASE = `
# BASE DE CONOCIMIENTOS DE SOPORTE TÉCNICO Y SISTEMAS - MINI BRUNO SUCESORES C.A.

## 1. IDENTIDAD Y ALCANCE DE LA MESA DE AYUDA
- **Área:** Departamento de Sistemas y Tecnología de la Información (TI).
- **Propósito:** Brindar soporte oportuno, canalizar requerimientos técnicos, atender averías y resolver incidencias de hardware, software, telecomunicaciones y redes tanto para personal administrativo de oficinas como para el personal operativo de plantas industriales.
- **Canal Oficial:** Sistema de Tickets Corporativos (#TK-YYYY-XXXX) con seguimiento en tiempo real.

## 2. PREGUNTAS Y SOLICITUDES FRECUENTES DE SISTEMAS (TOP FREQUENT REQUESTS)

### A. Falla de Conexión a Internet / Red
- **Incidencias comunes:** Pérdida total de acceso a Internet, lentitud severa en la navegación, caída de red local (LAN), desconexión de carpetas compartidas o falla de señal WiFi corporativa.
- **Acciones preliminares para el usuario:**
  1. Verificar que el cable de red (RJ45) esté firmemente conectado tanto a la computadora como a la roseta/toma de pared (comprobar que la luz verde/ámbar de la tarjeta de red esté titilando).
  2. Si usa WiFi, confirmar que esté conectado a la red corporativa autorizada y no a una red de invitados.
  3. Reiniciar el navegador web o probar abrir otra página interna.
- **Escalamiento:** Si la falla persiste, generar de inmediato un Ticket de Soporte con prioridad **Alta** para que un técnico de Sistemas inspeccione el switch de red, cableado estructurado o enlace de telecomunicaciones.

### B. Solicitud y Cambio de Tóner / Soporte de Impresoras
- **Incidencias comunes:** Alerta de "Tóner bajo" o "Reemplazar consumible" en pantalla de la impresora, impresiones manchadas o tenues, atasco continuo de papel, o impresora no responde en red.
- **Procedimiento:**
  1. No forzar los mecanismos del cartucho ni agitar bruscamente los tóners usados.
  2. Reportar la solicitud indicando el **modelo de la impresora** (ej. HP LaserJet, Ricoh, Epson) y la **ubicación física/departamento**.
- **Escalamiento:** Generar un Ticket de Soporte con prioridad **Media** para que el departamento de Sistemas suministre, instale y configure el cartucho de reemplazo o calibre el rodillo de arrastre.

### C. Restablecimiento de Contraseñas y Acceso a Cuentas
- **Incidencias comunes:** Olvido de contraseña de correo corporativo (@minibruno.com), cuenta de Windows bloqueada por intentos fallidos, pérdida de acceso al sistema ERP o portal interno.
- **Procedimiento:** Por políticas de seguridad de la información, el restablecimiento requiere verificación de identidad del colaborador y confirmación con su correo registrado.
- **Escalamiento:** Generar Ticket en categoría 'Acceso a Sistemas / Cuentas' con prioridad **Media**.

### D. Falla de Equipos de Computación (Hardware y Software)
- **Incidencias comunes:** Computadora no enciende, se apaga súbitamente, lentitud extrema al abrir programas, pantalla en negro o sin señal de video, fallas en teclado o mouse.
- **Escalamiento:** Generar Ticket en categoría 'Falla de Equipos / Red' con prioridad **Media** o **Alta**.

### E. Básculas Electrónicas de Pesaje y Terminales de Planta
- **Incidencias comunes:** Error de comunicación entre el indicador de pesaje y el software de despacho, bloqueo en báscula de pesaje de camiones (Río Cristal o Santa Cruz), variación o pérdida de señal en celdas de carga.
- **Escalamiento prioritario:** Generar Ticket con prioridad **Alta** o **Crítica** para intervención inmediata del técnico de turno en planta.

## 3. SEDES DE ATENCIÓN DE SISTEMAS
- **Planta Río Cristal (Caracas):** Carretera Vieja Los Teques Km 7, Sector Río Cristal - Macarao. Teléfonos: +58-212-434-5074 / +58-212-434-4946.
- **Planta Santa Cruz (Aragua):** Final 2da. Av. Parcelas G-25 y G-26, Zona Industrial Santa Cruz. Teléfono: +58-243-200-2300.
`;

function getRAGFallbackResponse(query) {
  const q = (query || "").toLowerCase();

  // 1. Falla de conexión a Internet / Red
  if (
    q.includes("internet") ||
    q.includes("conexion") ||
    q.includes("conexión") ||
    q.includes("red") ||
    q.includes("wifi") ||
    q.includes("enlace") ||
    q.includes("cable") ||
    q.includes("desconectado") ||
    q.includes("sin senal") ||
    q.includes("sin señal") ||
    q.includes("no navega") ||
    q.includes("sin red") ||
    q.includes("lentitud")
  ) {
    const proposal = JSON.stringify({
      subject: "Falla de conexión a Internet / Red en puesto de trabajo",
      department: "Sistemas / TI",
      category: "Falla de Equipos / Red",
      priority: "Alta",
      description: `Reporte de conectividad a Internet/Red:\n- Detalle del usuario: "${query.trim()}"\n- Diagnóstico preliminar: Sin acceso o lentitud en el enlace de red.\n- Se solicita revisión de cableado estructurado / punto de red / switch por técnico de Sistemas.`
    });

    return `Entiendo el inconveniente con la conexión a Internet / Red. Para ayudarte a resolverlo lo más rápido posible, te sugiero estas comprobaciones iniciales:\n\n1. **Verificar cable de red (RJ45):** Comprueba que el cable de red esté bien encajado en la parte posterior de la computadora y en la toma de pared (debe encender o parpadear una luz verde/ámbar).\n2. **Si usas red inalámbrica:** Asegúrate de estar conectado a la red WiFi corporativa interna y no a la de invitados.\n3. **Probar reinicio de red:** Desconectar y volver a conectar el cable durante 5 segundos.\n\nSi la conexión sigue sin restablecerse, he preparado la propuesta de ticket para que el equipo de **Sistemas / TI** acuda a inspeccionar tu punto de red:\n\n<<<TICKET_PROPOSAL:${proposal}>>>`;
  }

  // 2. Solicitud y Cambio de Tóner / Impresora
  if (
    q.includes("toner") ||
    q.includes("tóner") ||
    q.includes("tinta") ||
    q.includes("impresora") ||
    q.includes("imprimir") ||
    q.includes("impresion") ||
    q.includes("impresión") ||
    q.includes("atasco") ||
    q.includes("cartucho") ||
    q.includes("copiadora")
  ) {
    const proposal = JSON.stringify({
      subject: "Solicitud de cambio de tóner / Soporte de impresora",
      department: "Sistemas / TI",
      category: "Incidencia Técnica",
      priority: "Media",
      description: `Solicitud de consumibles / impresora:\n- Detalle reportado: "${query.trim()}"\n- Requerimiento: Reemplazo de cartucho de tóner o calibración de equipo de impresión.\n- Asignar consumible compatible y coordinar instalación.`
    });

    return `He registrado tu solicitud referente a **impresora / cambio de tóner**.\n\nPara agilizar la entrega e instalación:\n- El personal de Sistemas acudirá con el cartucho consumible compatible con tu modelo de impresora.\n- Te recomendamos no forzar el cartucho agotado para cuidar los engranajes del tambor.\n\nPuedes generar de inmediato el requerimiento con los datos que he preparado a continuación:\n\n<<<TICKET_PROPOSAL:${proposal}>>>`;
  }

  // 3. Restablecimiento de Contraseñas y Accesos
  if (
    q.includes("clave") ||
    q.includes("contraseña") ||
    q.includes("password") ||
    q.includes("correo") ||
    q.includes("acceso") ||
    q.includes("usuario") ||
    q.includes("desbloquear") ||
    q.includes("bloqueada") ||
    q.includes("login")
  ) {
    const proposal = JSON.stringify({
      subject: "Restablecimiento de credenciales / Acceso a sistemas",
      department: "Sistemas / TI",
      category: "Acceso a Sistemas / Cuentas",
      priority: "Media",
      description: `Solicitud de acceso:\n- Detalle del usuario: "${query.trim()}"\n- Requerimiento: Restablecimiento de contraseña corporativa o desbloqueo de cuenta.\n- Verificar identidad del colaborador según política de seguridad.`
    });

    return `Para gestionar el **restablecimiento de tu contraseña o desbloqueo de cuenta** corporativa de forma segura:\n\n- El equipo de **Sistemas / TI** validará tu identidad corporativa.\n- Se te asignará una contraseña temporal para que ingreses y configures tu nueva clave personalizada.\n\nAquí tienes la propuesta lista para generar tu ticket:\n\n<<<TICKET_PROPOSAL:${proposal}>>>`;
  }

  // 4. Fallas en Computadoras, Monitores o Hardware
  if (
    q.includes("computadora") ||
    q.includes("pc") ||
    q.includes("laptop") ||
    q.includes("monitor") ||
    q.includes("pantalla") ||
    q.includes("teclado") ||
    q.includes("mouse") ||
    q.includes("disco") ||
    q.includes("formatear") ||
    q.includes("windows") ||
    q.includes("no enciende") ||
    q.includes("pantalla azul") ||
    q.includes("lento") ||
    q.includes("lenta")
  ) {
    const proposal = JSON.stringify({
      subject: "Falla de hardware o rendimiento en computadora",
      department: "Sistemas / TI",
      category: "Falla de Equipos / Red",
      priority: "Media",
      description: `Reporte técnico de equipo:\n- Detalle: "${query.trim()}"\n- Se solicita diagnóstico presencial o remoto por el área de Sistemas.`
    });

    return `Lamento el inconveniente con tu equipo de cómputo. Si la máquina no enciende o presenta lentitud extrema, el personal de soporte técnico puede realizar un diagnóstico presencial o vía remota.\n\nHe organizado tu solicitud para emitir el ticket de asistencia técnica:\n\n<<<TICKET_PROPOSAL:${proposal}>>>`;
  }

  // 5. Básculas y Balanzas de Planta
  if (
    q.includes("bascula") ||
    q.includes("báscula") ||
    q.includes("pesaje") ||
    q.includes("balanza") ||
    q.includes("celda") ||
    q.includes("camiones")
  ) {
    const proposal = JSON.stringify({
      subject: "Incidencia técnica en báscula electrónica de planta",
      department: "Sistemas / TI",
      category: "Falla de Equipos / Red",
      priority: "Alta",
      description: `Avería en báscula de pesaje:\n- Incidencia: "${query.trim()}"\n- Atención prioritaria requerida para evitar retrasos en el despacho y pesaje de camiones.`
    });

    return `Las básculas de pesaje son críticas para la continuidad de despacho en planta. He catalogado esta incidencia con **Prioridad Alta** para inmediata atención de los técnicos de Sistemas y Mantenimiento:\n\n<<<TICKET_PROPOSAL:${proposal}>>>`;
  }

  // 6. Solicitudes generales de tickets o soporte
  if (
    q.includes("ticket") ||
    q.includes("soporte") ||
    q.includes("ayuda") ||
    q.includes("falla") ||
    q.includes("problema") ||
    q.includes("averia") ||
    q.includes("avería") ||
    q.includes("urgente") ||
    q.includes("reparar") ||
    q.includes("incidente")
  ) {
    const proposal = JSON.stringify({
      subject: "Requerimiento de soporte técnico a Sistemas",
      department: "Sistemas / TI",
      category: "Incidencia Técnica",
      priority: "Media",
      description: `Requerimiento registrado vía BrunoBot:\n- Descripción: "${query.trim()}"\n- Radicación para revisión del equipo de Sistemas.`
    });

    return `He tomado nota de tu solicitud de soporte técnico. Para que el equipo de **Sistemas / TI** asigne un especialista y le dé seguimiento formal, puedes confirmar este ticket:\n\n<<<TICKET_PROPOSAL:${proposal}>>>`;
  }

  // 7. Saludo por defecto con listado claro de Preguntas y Solicitudes Frecuentes
  return `¡Hola! Soy **BrunoBot**, el asistente de **Soporte Técnico y Sistemas** de **Mini Bruno Sucesores C.A.**\n\nEstoy aquí para ayudarte a canalizar incidencias y requerimientos tecnológicos en tu área de trabajo.\n\n📌 **Preguntas y Solicitudes Frecuentes:**\n- 🌐 **Falla de conexión a Internet / Red:** Caídas de enlace, lentitud o problemas con el cable de red.\n- 🖨️ **Cambio de tóner o impresoras:** Solicitud de consumibles, atascos o fallas de impresión.\n- 🔑 **Restablecimiento de contraseñas:** Recuperación de accesos a correos y sistemas corporativos.\n- 💻 **Fallas de equipo (PC / Laptop):** Problemas de arranque, periféricos, monitores o lentitud.\n- ⚖️ **Básculas y sistemas de planta:** Incidencias en balanzas o terminales de pesaje.\n\n¿Qué inconveniente presentas? Puedes detallarlo aquí o seleccionar una de las opciones rápidas para generar tu ticket inmediato.`;
}

module.exports = { MINI_BRUNO_KNOWLEDGE_BASE, getRAGFallbackResponse };
