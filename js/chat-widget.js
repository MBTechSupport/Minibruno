// ==========================================================================
// CHAT-WIDGET.JS - ASISTENTE VIRTUAL BRUNOBOT IA (MINI BRUNO SUCESORES C.A.)
// FASE 4: ESCALADO INTELIGENTE (CHAT A TICKET CON 1 CLIC)
// ==========================================================================

class BrunoBotWidget {
  constructor() {
    this.isOpen = false;
    this.isStreaming = false;
    this.messages = [];
    this.abortController = null;
    this.currentProposal = null;

    this.init();
  }

  init() {
    this.injectStyles();
    this.createWidgetDOM();
    this.bindEvents();

    // Mensaje de bienvenida inicial enfocado en Sistemas y TI
    this.addBotMessage(
      "¡Hola! Soy **BrunoBot**, el asistente de **Soporte Técnico y Sistemas** de **Mini Bruno Sucesores C.A.**\n\nEstoy aquí para ayudarte a registrar, gestionar y resolver requerimientos tecnológicos e incidencias de oficina y planta.\n\n📌 **Preguntas y Solicitudes Frecuentes:**\n- 🌐 **Falla de conexión a Internet o lentitud de red**\n- 🖨️ **Cambio de tóner o fallas en impresoras**\n- 💻 **Problemas de equipo (computadora lenta, periféricos, monitor)**\n- 🔑 **Restablecimiento de contraseñas y accesos a cuentas**\n- ⚖️ **Incidencias en PLC/Sistema Scada**\n\nCuéntame qué problema presentas o haz clic en alguna de las opciones rápidas para generar tu ticket de soporte.",
      false
    );
  }

  injectStyles() {
    if (document.getElementById("brunobot-styles")) return;

    const style = document.createElement("style");
    style.id = "brunobot-styles";
    style.textContent = `
      .brunobot-glow {
        box-shadow: 0 0 25px rgba(6, 182, 212, 0.4), 0 0 50px rgba(59, 130, 246, 0.2);
      }
      .brunobot-glass {
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(56, 189, 248, 0.25);
      }
      .brunobot-stream-cursor::after {
        content: '▋';
        display: inline-block;
        color: #38bdf8;
        animation: cursorBlink 0.8s infinite;
        margin-left: 2px;
      }
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      .brunobot-chat-scroll::-webkit-scrollbar {
        width: 5px;
      }
      .brunobot-chat-scroll::-webkit-scrollbar-thumb {
        background: rgba(56, 189, 248, 0.25);
        border-radius: 4px;
      }
      .escalation-card-glow {
        box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  createWidgetDOM() {
    if (document.getElementById("brunobot-container")) return;

    const wrapper = document.createElement("div");
    wrapper.id = "brunobot-container";
    wrapper.className = "fixed bottom-6 left-6 z-50 font-sans select-none";

    wrapper.innerHTML = `
      <!-- BOTÓN FLOTANTE LANZADOR -->
      <div id="brunobot-launcher" class="relative group cursor-pointer flex items-center">
        <!-- Tooltip animado -->
        <div id="brunobot-tooltip" class="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-900 text-cyan-300 text-xs font-tech font-bold rounded-xl border border-cyan-500/30 whitespace-nowrap shadow-xl transition-all duration-300 pointer-events-none group-hover:scale-105">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
          BrunoBot IA
        </div>

        <button type="button" aria-label="Abrir Asistente IA"
          class="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white flex items-center justify-center brunobot-glow hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20">
          <svg class="w-7 h-7 text-cyan-200 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="absolute -top-1 -right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-[9px] font-black text-slate-900 items-center justify-center">IA</span>
          </span>
        </button>
      </div>

      <!-- VENTANA DE CHAT FUTURISTA -->
      <div id="brunobot-window"
        class="hidden fixed bottom-24 left-4 sm:left-6 w-[92vw] sm:w-[420px] h-[590px] max-h-[82vh] brunobot-glass rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform scale-95 opacity-0 origin-bottom-left">
        
        <!-- Header del Chat -->
        <div class="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-cyan-500/20 flex items-center justify-between text-white">
          <div class="flex items-center space-x-3">
            <div class="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center p-0.5 border border-cyan-400/40">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-tech font-bold text-sm text-white tracking-wide">BrunoBot • Soporte TI</h3>
                <span class="text-[9px] font-mono px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 uppercase">Mesa de Ayuda</span>
              </div>
              <p class="text-[11px] text-cyan-400/80 font-mono">Sistemas & Telecomunicaciones • En línea</p>
            </div>
          </div>

          <div class="flex items-center space-x-1">
            <button id="brunobot-clear-btn" title="Limpiar conversación" class="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button id="brunobot-close-btn" title="Minimizar" class="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Sugerencias Rápidas de Soporte TI (Chips) -->
        <div class="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto flex items-center space-x-2 no-scrollbar">
          <button type="button" class="suggestion-chip px-2.5 py-1 bg-slate-800/80 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/20 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors" data-prompt="Tengo una falla de conexión a Internet en mi puesto de trabajo">
            🌐 Falla de Internet / Red
          </button>
          <button type="button" class="suggestion-chip px-2.5 py-1 bg-slate-800/80 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/20 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors" data-prompt="Necesito un cambio de tóner para la impresora de mi departamento">
            🖨️ Cambio de Tóner
          </button>
          <button type="button" class="suggestion-chip px-2.5 py-1 bg-slate-800/80 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/20 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors" data-prompt="Requiero restablecer mi contraseña o recuperar acceso al sistema">
            🔑 Restablecer Contraseña
          </button>
          <button type="button" class="suggestion-chip px-2.5 py-1 bg-slate-800/80 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/20 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors" data-prompt="Mi computadora presenta fallas de hardware y lentitud">
            💻 Falla en Computadora
          </button>
          <button type="button" class="suggestion-chip px-2.5 py-1 bg-slate-800/80 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/20 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors" data-prompt="Se presentó una falla en la báscula de pesaje de planta">
            ⚖️ Falla en Báscula
          </button>
        </div>

        <!-- Contenedor de Mensajes -->
        <div id="brunobot-messages" class="flex-1 p-4 overflow-y-auto space-y-3.5 brunobot-chat-scroll select-text text-sm">
          <!-- Inyectado dinámicamente -->
        </div>

        <!-- Input Bar Futurista -->
        <div class="p-3 bg-slate-900/90 border-t border-slate-800">
          <form id="brunobot-form" class="flex items-center space-x-2">
            <div class="relative flex-1">
              <input type="text" id="brunobot-input" required autocomplete="off"
                placeholder="Escribe tu solicitud (ej: sin internet, cambio de tóner)..."
                class="w-full pl-3.5 pr-9 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all" />
              <button type="button" id="brunobot-voice-hint" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400/60 hover:text-cyan-400" title="Mesa de Ayuda - Sistemas">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </div>
            
            <button type="submit" id="brunobot-send-btn"
              class="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <svg id="send-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <svg id="stop-icon" class="w-4 h-4 hidden animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            </button>
          </form>
          <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1.5 px-1">
            <span>Soporte TI • Mini Bruno Sucesores</span>
            <span class="text-cyan-400/80">Atención Activa</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);
  }

  bindEvents() {
    const launcher = document.getElementById("brunobot-launcher");
    const closeBtn = document.getElementById("brunobot-close-btn");
    const clearBtn = document.getElementById("brunobot-clear-btn");
    const form = document.getElementById("brunobot-form");
    const input = document.getElementById("brunobot-input");

    launcher.addEventListener("click", () => this.toggleWindow());
    closeBtn.addEventListener("click", () => this.closeWindow());

    clearBtn.addEventListener("click", () => {
      this.messages = [];
      const container = document.getElementById("brunobot-messages");
      container.innerHTML = "";
      this.addBotMessage(
        "Conversación reiniciada. ¿En qué puedo colaborarte el día de hoy sobre **Mini Bruno**?",
        false
      );
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || this.isStreaming) return;
      input.value = "";
      this.handleUserMessage(text);
    });

    // Chips de sugerencia rápida
    document.querySelectorAll(".suggestion-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const prompt = chip.dataset.prompt;
        if (!this.isOpen) this.openWindow();
        this.handleUserMessage(prompt);
      });
    });
  }

  toggleWindow() {
    if (this.isOpen) {
      this.closeWindow();
    } else {
      this.openWindow();
    }
  }

  openWindow() {
    const win = document.getElementById("brunobot-window");
    const tooltip = document.getElementById("brunobot-tooltip");
    win.classList.remove("hidden");
    setTimeout(() => {
      win.classList.remove("scale-95", "opacity-0");
      win.classList.add("scale-100", "opacity-100");
    }, 10);
    tooltip.classList.add("hidden");
    this.isOpen = true;
    document.getElementById("brunobot-input").focus();
  }

  closeWindow() {
    const win = document.getElementById("brunobot-window");
    const tooltip = document.getElementById("brunobot-tooltip");
    win.classList.remove("scale-100", "opacity-100");
    win.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      win.classList.add("hidden");
    }, 300);
    tooltip.classList.remove("hidden");
    this.isOpen = false;
  }

  addUserMessage(text) {
    this.messages.push({ role: "user", text });
    const container = document.getElementById("brunobot-messages");

    const msgEl = document.createElement("div");
    msgEl.className = "flex justify-end";
    msgEl.innerHTML = `
      <div class="max-w-[85%] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs shadow-md leading-relaxed break-words">
        ${this.escapeHtml(text)}
      </div>
    `;
    container.appendChild(msgEl);
    this.scrollToBottom();
  }

  addBotMessage(text, animate = false) {
    this.messages.push({ role: "model", text });
    const container = document.getElementById("brunobot-messages");
    const msgId = "msg-" + Date.now();

    const msgEl = document.createElement("div");
    msgEl.className = "flex items-start space-x-2.5";
    msgEl.innerHTML = `
      <div class="w-7 h-7 rounded-xl bg-slate-800 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400 mt-0.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </div>
      <div id="${msgId}" class="max-w-[85%] bg-slate-800/80 border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs shadow-md leading-relaxed break-words ${animate ? "brunobot-stream-cursor" : ""}">
        ${this.renderMarkdown(text)}
      </div>
    `;
    container.appendChild(msgEl);
    this.scrollToBottom();
    return msgId;
  }

  updateBotMessage(msgId, text) {
    const el = document.getElementById(msgId);
    if (!el) return;

    // Detectar propuesta estructurada de ticket
    const match = text.match(/<<<TICKET_PROPOSAL:(.*?)>>>/s);
    let proposalData = null;

    if (match) {
      try {
        proposalData = JSON.parse(match[1]);
      } catch (e) {
        console.warn("Error parseando propuesta de ticket:", e);
      }
    }

    // Texto limpio sin la etiqueta del sistema
    const cleanText = text.replace(/<<<TICKET_PROPOSAL:.*?>>>/gs, "").trim();
    el.innerHTML = this.renderMarkdown(cleanText);

    // Si hay propuesta de ticket y aún no se ha renderizado la tarjeta en este mensaje
    if (proposalData && !el.querySelector(`.escalation-card-${msgId}`)) {
      this.renderEscalationCard(el, msgId, proposalData);
    }

    this.scrollToBottom();
  }

  renderEscalationCard(container, msgId, data) {
    const cardEl = document.createElement("div");
    cardEl.className = `escalation-card-${msgId} mt-3 p-3.5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-cyan-500/40 shadow-xl escalation-card-glow text-left`;

    const priorityColors = {
      "Baja": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      "Media": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Alta": "bg-amber-500/20 text-amber-400 border-amber-500/30",
      "Crítica": "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
    };
    const prioClass = priorityColors[data.priority] || priorityColors["Alta"];

    cardEl.innerHTML = `
      <div class="flex items-center space-x-2 text-cyan-300 text-xs font-tech font-bold mb-2">
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Asistencia Técnica • Escalado a Ticket</span>
      </div>

      <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px] mb-3 space-y-1.5 font-sans">
        <div>
          <span class="text-slate-400 font-tech">Asunto:</span>
          <p class="font-bold text-white text-xs mt-0.5">${this.escapeHtml(data.subject)}</p>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
          <div>
            <span class="text-slate-400 font-tech">Área:</span>
            <span class="text-cyan-300 font-semibold ml-1">${this.escapeHtml(data.department)}</span>
          </div>
          <div>
            <span class="text-slate-400 font-tech">Prioridad:</span>
            <span class="px-2 py-0.5 rounded-md font-bold border ml-1 ${prioClass}">${data.priority}</span>
          </div>
        </div>
      </div>

      <div id="card-actions-${msgId}" class="flex flex-col sm:flex-row gap-2">
        <button type="button" id="btn-prefill-${msgId}"
          class="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-tech font-bold transition-all shadow-md flex items-center justify-center space-x-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          <span>Pre-llenar Formulario</span>
        </button>

        <button type="button" id="btn-direct-${msgId}"
          class="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-tech font-bold transition-all shadow-md flex items-center justify-center space-x-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span>Radicar con 1 Clic</span>
        </button>
      </div>

      <div id="card-status-${msgId}" class="hidden mt-2 p-2 rounded-xl text-center text-xs font-tech font-bold"></div>
    `;

    container.appendChild(cardEl);

    // Evento Pre-llenar Formulario
    const prefillBtn = cardEl.querySelector(`#btn-prefill-${msgId}`);
    prefillBtn.addEventListener("click", () => {
      if (typeof window.prefillTicketForm === "function") {
        window.prefillTicketForm(data);
        this.closeWindow();
      } else {
        // Guardar en sesión y redirigir a soporte.html
        sessionStorage.setItem("mini_bruno_pending_ticket", JSON.stringify(data));
        window.location.href = "soporte.html";
      }
    });

    // Evento Radicar Directamente con 1 Clic
    const directBtn = cardEl.querySelector(`#btn-direct-${msgId}`);
    const statusBox = cardEl.querySelector(`#card-status-${msgId}`);
    const actionsBox = cardEl.querySelector(`#card-actions-${msgId}`);

    directBtn.addEventListener("click", async () => {
      directBtn.disabled = true;
      directBtn.innerHTML = `
        <svg class="w-3.5 h-3.5 animate-spin mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      `;

      if (typeof window.submitTicketDirectly === "function") {
        const result = await window.submitTicketDirectly(data);
        if (result.success) {
          actionsBox.classList.add("hidden");
          statusBox.className = "mt-2 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-center text-xs font-tech font-bold";
          statusBox.innerHTML = `
            <div class="flex items-center justify-center space-x-1 mb-1">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>¡Ticket Radicado con Éxito!</span>
            </div>
            <p class="font-mono text-cyan-200 text-sm tracking-wider font-extrabold my-1">${result.ticketCode}</p>
            <p class="text-[10px] text-slate-300 font-sans font-normal">Asignado al departamento para atención prioritaria.</p>
          `;
          statusBox.classList.remove("hidden");
        } else if (result.requireAuth) {
          directBtn.disabled = false;
          directBtn.innerHTML = `<span>Ingresar para Radicar</span>`;
        } else {
          directBtn.disabled = false;
          directBtn.innerHTML = `<span>Reintentar</span>`;
          alert("Error al radicar ticket: " + (result.error || "Intente nuevamente"));
        }
      } else {
        // Redirigir a soporte.html con el ticket pendiente
        sessionStorage.setItem("mini_bruno_pending_ticket", JSON.stringify(data));
        window.location.href = "soporte.html";
      }
    });

    this.scrollToBottom();
  }

  removeStreamCursor(msgId) {
    const el = document.getElementById(msgId);
    if (el) {
      el.classList.remove("brunobot-stream-cursor");
    }
  }

  getClientRAGResponse(query) {
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
    return `¡Hola! Soy **BrunoBot**, el asistente oficial de **Soporte Técnico y Sistemas** de **Mini Bruno Sucesores C.A.**\n\nEstoy aquí para orientarte y canalizar tus requerimientos informáticos y operativos.\n\n📌 **Solicitudes y Servicios Frecuentes:**\n- 🌐 **Falla de conexión a Internet / Red:** Caídas de enlace, lentitud o problemas con cable RJ45/WiFi.\n- 🖨️ **Cambio de tóner o impresoras:** Solicitud de consumibles, atascos o fallas de impresión.\n- 🔑 **Restablecimiento de contraseñas:** Recuperación de cuentas y accesos corporativos.\n- 💻 **Fallas de equipo (PC / Laptop):** Problemas de arranque, periféricos, monitores o lentitud.\n- ⚖️ **Básculas y sistemas de planta:** Incidencias en balanzas o terminales de pesaje de camiones.\n\n¿En qué podemos ayudarte hoy? Escribe los detalles de tu problema para asistirte o preparar tu ticket de inmediato.`;
  }

  async streamClientRAG(botMsgId, prompt) {
    const fullText = this.getClientRAGResponse(prompt);
    let streamedText = "";
    const words = fullText.split(" ");

    for (let i = 0; i < words.length; i += 2) {
      if (this.abortController?.signal?.aborted) break;
      const piece = words.slice(i, i + 2).join(" ") + " ";
      streamedText += piece;
      this.updateBotMessage(botMsgId, streamedText);
      await new Promise((r) => setTimeout(r, 18));
    }

    this.removeStreamCursor(botMsgId);
    if (this.messages.length > 0) {
      this.messages[this.messages.length - 1].text = streamedText.replace(/<<<TICKET_PROPOSAL:.*?>>>/gs, "").trim();
    }
  }

  async handleUserMessage(prompt) {
    this.addUserMessage(prompt);

    // Preparar mensaje de respuesta vacío en streaming
    const botMsgId = this.addBotMessage("", true);
    let streamedText = "";

    this.setStreamingState(true);

    try {
      this.abortController = new AbortController();
      let streamSucceeded = false;

      // Intentar streaming con el backend (activo en dev / server con Node)
      try {
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: this.abortController.signal,
          body: JSON.stringify({
            message: prompt,
            history: this.messages.slice(0, -2) // omitir el último mensaje user y el bot vacío
          })
        });

        if (response.ok) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split("\n\n");
            buffer = events.pop();

            for (const event of events) {
              const trimmed = event.trim();
              if (trimmed.startsWith("data: ")) {
                const dataStr = trimmed.slice(6);
                try {
                  const data = JSON.parse(dataStr);
                  if (data.text) {
                    streamedText += data.text;
                    this.updateBotMessage(botMsgId, streamedText);
                  }
                  if (data.error) {
                    streamedText = data.error;
                    this.updateBotMessage(botMsgId, streamedText);
                  }
                  if (data.done) {
                    streamSucceeded = true;
                    break;
                  }
                } catch (err) {
                  console.warn("Parse SSE JSON warning:", err);
                }
              }
            }
          }
          if (streamedText.length > 0) {
            streamSucceeded = true;
          }
        }
      } catch (fetchErr) {
        // En entornos de hosting estático como Netlify o sin conexión al endpoint Express,
        // se activa sin interrupciones el motor local
        console.warn("Endpoint /api/chat/stream no disponible en este host. Activando motor RAG local...", fetchErr);
      }

      // Si el streaming remoto no emitió texto (Netlify estático, error 404, etc.),
      // responder de inmediato mediante el motor RAG local
      if (!streamSucceeded || streamedText.trim().length === 0) {
        await this.streamClientRAG(botMsgId, prompt);
      } else {
        this.removeStreamCursor(botMsgId);
        if (this.messages.length > 0) {
          this.messages[this.messages.length - 1].text = streamedText.replace(/<<<TICKET_PROPOSAL:.*?>>>/gs, "").trim();
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        streamedText += " *(Generación detenida)*";
        this.updateBotMessage(botMsgId, streamedText);
        this.removeStreamCursor(botMsgId);
      } else {
        console.error("Chat Fallback Error:", err);
        await this.streamClientRAG(botMsgId, prompt);
      }
    } finally {
      this.setStreamingState(false);
      this.abortController = null;
    }
  }

  setStreamingState(isStreaming) {
    this.isStreaming = isStreaming;
    const sendIcon = document.getElementById("send-icon");
    const stopIcon = document.getElementById("stop-icon");
    const input = document.getElementById("brunobot-input");

    if (isStreaming) {
      sendIcon.classList.add("hidden");
      stopIcon.classList.remove("hidden");
      input.disabled = true;
    } else {
      sendIcon.classList.remove("hidden");
      stopIcon.classList.add("hidden");
      input.disabled = false;
      input.focus();
    }
  }

  scrollToBottom() {
    const container = document.getElementById("brunobot-messages");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  renderMarkdown(text) {
    if (!text) return "";
    let html = this.escapeHtml(text);

    // Negrita: **texto**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300 font-bold">$1</strong>');
    
    // Cursiva: *texto*
    html = html.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');

    // Código en línea: `codigo`
    html = html.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-slate-900 text-cyan-400 font-mono text-[11px] rounded border border-cyan-500/20">$1</code>');

    // Listas con viñetas: - item o * item
    html = html.replace(/(?:^|\n)[-*]\s+(.*)/g, '<li class="ml-4 list-disc text-slate-300">$1</li>');

    // Saltos de línea
    html = html.replace(/\n/g, "<br />");

    return html;
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Inicializar automáticamente cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new BrunoBotWidget());
} else {
  new BrunoBotWidget();
}
