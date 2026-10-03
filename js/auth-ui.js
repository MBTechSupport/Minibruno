/**
 * ==========================================================================
 * AUTH UI ENHANCEMENTS - Mini Bruno TechSupport (Fase 3)
 * Usabilidad, Feedback Visual, Toggle de Contraseñas y Estados de Carga
 * ==========================================================================
 */

/**
 * 3.1 Interacción de Contraseñas: Mostrar / Ocultar Contraseña
 */
export function initPasswordToggle(inputId, toggleBtnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(toggleBtnId);

  if (!input || !btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = input.getAttribute('type') === 'password';
    input.setAttribute('type', isPassword ? 'text' : 'password');

    // Cambiar icono feather
    btn.innerHTML = isPassword
      ? '<i data-feather="eye-off" class="w-5 h-5 text-blue-500"></i>'
      : '<i data-feather="eye" class="w-5 h-5 text-gray-400"></i>';

    if (window.feather) {
      window.feather.replace();
    }
  });
}

/**
 * 3.3 Indicador de Fortaleza de Clave Corporativa
 */
export function initPasswordStrength(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);

  if (!input || !container) return;

  container.innerHTML = `
    <div class="strength-bar-track">
      <div id="strengthBarFill" class="strength-bar-fill"></div>
    </div>
    <div class="strength-label">
      <span>Seguridad de contraseña:</span>
      <span id="strengthText" class="font-bold">Muy débil</span>
    </div>
    <div class="strength-criteria-list">
      <div id="crit-length" class="strength-criterion">
        <i data-feather="circle" class="w-3 h-3"></i> <span>Mínimo 8 caracteres</span>
      </div>
      <div id="crit-upper" class="strength-criterion">
        <i data-feather="circle" class="w-3 h-3"></i> <span>Una mayúscula (A-Z)</span>
      </div>
      <div id="crit-number" class="strength-criterion">
        <i data-feather="circle" class="w-3 h-3"></i> <span>Un número (0-9)</span>
      </div>
      <div id="crit-special" class="strength-criterion">
        <i data-feather="circle" class="w-3 h-3"></i> <span>Un símbolo (@$!%*#?&)</span>
      </div>
    </div>
  `;

  if (window.feather) {
    window.feather.replace();
  }

  const barFill = document.getElementById('strengthBarFill');
  const text = document.getElementById('strengthText');
  const critLength = document.getElementById('crit-length');
  const critUpper = document.getElementById('crit-upper');
  const critNumber = document.getElementById('crit-number');
  const critSpecial = document.getElementById('crit-special');

  input.addEventListener('input', () => {
    const val = input.value;

    const hasLength = val.length >= 8;
    const hasUpper = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[^A-Za-z0-9]/.test(val);

    updateCriterion(critLength, hasLength);
    updateCriterion(critUpper, hasUpper);
    updateCriterion(critNumber, hasNumber);
    updateCriterion(critSpecial, hasSpecial);

    let score = 0;
    if (hasLength) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    if (val.length === 0) {
      barFill.style.width = '0%';
      barFill.style.backgroundColor = 'transparent';
      text.textContent = 'Ingresa una contraseña';
      text.className = 'font-bold text-gray-400';
    } else if (score === 1) {
      barFill.style.width = '25%';
      barFill.style.backgroundColor = '#ef4444';
      text.textContent = 'Débil';
      text.className = 'font-bold text-red-500';
    } else if (score === 2) {
      barFill.style.width = '50%';
      barFill.style.backgroundColor = '#f59e0b';
      text.textContent = 'Media';
      text.className = 'font-bold text-amber-500';
    } else if (score === 3) {
      barFill.style.width = '75%';
      barFill.style.backgroundColor = '#3b82f6';
      text.textContent = 'Fuerte';
      text.className = 'font-bold text-blue-500';
    } else if (score === 4) {
      barFill.style.width = '100%';
      barFill.style.backgroundColor = '#10b981';
      text.textContent = 'Excelente (Cumple política)';
      text.className = 'font-bold text-emerald-500';
    }
  });

  function updateCriterion(elem, isMet) {
    if (!elem) return;
    if (isMet) {
      elem.classList.add('met');
      const icon = elem.querySelector('i, svg');
      if (icon) {
        elem.innerHTML = `<i data-feather="check-circle" class="w-3 h-3 text-green-600"></i> ${elem.querySelector('span').outerHTML}`;
        if (window.feather) window.feather.replace();
      }
    } else {
      elem.classList.remove('met');
      const icon = elem.querySelector('i, svg');
      if (icon) {
        elem.innerHTML = `<i data-feather="circle" class="w-3 h-3 text-gray-400"></i> ${elem.querySelector('span').outerHTML}`;
        if (window.feather) window.feather.replace();
      }
    }
  }
}

/**
 * 3.4 Notificación Toast Flotante Armoniosa
 */
export function showFloatingToast(message, type = 'error', duration = 3500) {
  let container = document.getElementById('corporateToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'corporateToastContainer';
    container.className = 'corporate-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const typeClass = type === 'success' ? 'toast-success' : (type === 'warning' ? 'toast-warning' : 'toast-error');
  toast.className = `corporate-toast ${typeClass}`;

  const iconName = type === 'success' ? 'check-circle' : (type === 'warning' ? 'alert-triangle' : 'alert-circle');
  toast.innerHTML = `
    <i data-feather="${iconName}" class="w-5 h-5 flex-shrink-0"></i>
    <span class="flex-grow">${message}</span>
    <button type="button" class="ml-2 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Cerrar">&times;</button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);
  if (window.feather) {
    window.feather.replace();
  }

  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

/**
 * 3.4 Estados de Carga en Botones durante el envío
 */
export function setButtonLoading(button, isLoading, loadingText = 'Procesando...') {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalHtml = button.innerHTML;
    button.classList.add('btn-submitting');
    button.disabled = true;
    button.innerHTML = `
      <span class="btn-spinner"></span>
      <span>${loadingText}</span>
    `;
  } else {
    button.classList.remove('btn-submitting');
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
    }
    if (window.feather) {
      window.feather.replace();
    }
  }
}
