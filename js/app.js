/**
 * Pediatric Chic Financial Sanctuary - Single Page Application Engine
 * Vanilla JavaScript (ES6+ modular)
 */

import {
  PediatricStore,
  formatCurrency,
  formatDateBR,
  formatMonthYear,
  addMonths,
  calculateExpectedPaymentDate,
  evaluateShiftStatus,
  getLocalDateString,
  calculateHourlyRate,
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  SHIFT_HOSPITAL_SUGGESTIONS,
  SHIFT_TYPES,
  TAX_REGIMES,
  CLINICAL_SECTORS
} from './store.js';

import {
  renderForecastChartSVG,
  renderDonutChartSVG
} from './charts.js';

import {
  ICON_PATHS,
  getSvgIcon,
  renderIcon,
  enhanceIcons,
  initIconSystem
} from './icons.js';

// Application State
class AppState {
  constructor() {
    this.store = new PediatricStore();
    // Reference date based on current context: September 2026
    this.referenceDate = new Date();
    // Default active month: current month YYYY-MM
    this.activeMonth = "2026-09";
    this.activeTab = "inicio"; // "inicio" | "plantoes" | "despesas" | "relatorios"
    this.currentRegime = "caixa"; // "caixa" | "competencia"
    this.shiftScope = "all"; // "all" | "month"
    this.shiftFilter = "all"; // "all" | "pending" | "received" | "delayed"
    this.shiftViewMode = "list"; // "list" | "calendar"
    this.shiftSectorFilter = "all";
    this.calendarSelectedDate = null;
    this.shiftSearchQuery = "";
    this.expenseFilter = "all"; // "all" | "fixa" | "variavel"
    this.activeModalTab = "plantao"; // "plantao" | "salario" | "despesa"
    this.editingItem = null; // { type: 'shift'|'expense', id: '...' }
    this.isExpandedView = false;
    this.billingTone = "gentil"; // "gentil" | "formal"
    this.privacyMode = false;
    try {
      if (typeof localStorage !== "undefined") {
        this.privacyMode = localStorage.getItem("pediatric_privacy_mode") === "true";
      }
    } catch (e) {}
  }
}

const state = new AppState();

// DOM Cache
const dom = {};

function initDOM() {
  dom.mainContent = document.getElementById("main-content");
  dom.monthDisplay = document.getElementById("current-month-display");
  dom.btnPrevMonth = document.getElementById("btn-prev-month");
  dom.btnNextMonth = document.getElementById("btn-next-month");
  dom.btnOpenMonthPicker = document.getElementById("btn-open-month-picker");
  dom.navTabs = document.querySelectorAll(".nav-tab");
  dom.fabBtn = document.getElementById("fab-add");
  dom.bottomSheet = document.getElementById("bottom-sheet");
  dom.modalOverlay = document.getElementById("modal-overlay");
  dom.dialogOverlay = document.getElementById("dialog-overlay");
  dom.dialogContainer = document.getElementById("dialog-container");
  dom.sheetCloseBtn = document.getElementById("btn-close-sheet");
  dom.toast = document.getElementById("toast");
  dom.toastMsg = document.getElementById("toast-message");
  dom.deviceFrame = document.querySelector(".device-frame");
  dom.btnToggleFrame = document.getElementById("btn-toggle-frame");
  dom.btnNotifications = document.getElementById("btn-notifications");
  dom.notifBadge = document.getElementById("notif-badge");
  dom.btnProfile = document.getElementById("btn-profile");
  dom.btnInstallApp = document.getElementById("btn-install-app");
  dom.btnTogglePrivacy = document.getElementById("btn-toggle-privacy");
  dom.headerActiveTab = document.getElementById("header-active-tab");
  dom.headerDoctorTitle = document.getElementById("header-doctor-title");
}

/**
 * Format currency with Privacy Mode (Modo Sigilo) support
 * @param {number} value
 * @param {boolean} forceShow
 * @returns {string}
 */
export function formatMoney(value, forceShow = false) {
  if (state.privacyMode && !forceShow) {
    return "R$ ••••••";
  }
  return formatCurrency(value);
}

/**
 * Tactile Haptic Vibration Feedback
 * @param {number} duration
 */
export function triggerHaptic(duration = 10) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(duration);
    }
  } catch (e) {}
}

/**
 * Toggles Privacy Mode (Modo Sigilo)
 */
export function togglePrivacyMode() {
  state.privacyMode = !state.privacyMode;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("pediatric_privacy_mode", String(state.privacyMode));
    }
  } catch (e) {}

  if (typeof document !== "undefined" && document.body) {
    if (state.privacyMode) {
      document.body.classList.add("privacy-active");
    } else {
      document.body.classList.remove("privacy-active");
    }
  }

  updatePrivacyButtonUI();
  triggerHaptic(14);
  showToast(
    state.privacyMode ? "Modo Sigilo ativado! Valores protegidos 🔒" : "Modo Sigilo desativado. Valores visíveis 👁️",
    state.privacyMode ? "visibility_off" : "visibility"
  );
  renderCurrentView();
}

export function updatePrivacyButtonUI() {
  if (!dom.btnTogglePrivacy) return;
  const iconSpan = dom.btnTogglePrivacy.querySelector(".material-symbols-outlined");
  const iconName = state.privacyMode ? "visibility_off" : "visibility";
  if (iconSpan) {
    iconSpan.setAttribute("data-icon", iconName);
    iconSpan.innerHTML = renderIcon(iconName);
  }
  dom.btnTogglePrivacy.title = state.privacyMode ? "Desativar Modo Sigilo (Exibir Valores)" : "Ativar Modo Sigilo (Ocultar Valores)";
}

/**
 * Toast notification manager
 */
export function showToast(message, icon = "favorite") {
  if (!dom.toast || !dom.toastMsg) return;
  dom.toastMsg.textContent = message;
  const iconSpan = dom.toast.querySelector(".material-symbols-outlined");
  if (iconSpan) {
    iconSpan.setAttribute("data-icon", icon);
    if (typeof enhanceIcons === "function") {
      enhanceIcons(dom.toast);
    }
  }

  dom.toast.classList.add("show");
  if (dom.toastTimeout) clearTimeout(dom.toastTimeout);
  dom.toastTimeout = setTimeout(() => {
    dom.toast.classList.remove("show");
  }, 3200);
}

/**
 * Dialog Modal Controllers (iOS Style)
 */
export function openDialog(html) {
  if (!dom.dialogContainer || !dom.dialogOverlay) return;
  dom.dialogContainer.innerHTML = html;
  if (typeof enhanceIcons === "function") {
    enhanceIcons(dom.dialogContainer);
  }
  dom.dialogOverlay.classList.add("active");
  dom.dialogContainer.classList.add("active");
  document.body.style.overflow = "hidden";
}

export function closeDialog() {
  if (!dom.dialogContainer || !dom.dialogOverlay) return;
  dom.dialogOverlay.classList.remove("active");
  dom.dialogContainer.classList.remove("active");
  document.body.style.overflow = "";
}

/**
 * iOS-styled confirmation dialog replacing native window.confirm()
 */
export function showConfirmDialog({ title, message, icon = "warning", confirmText = "Confirmar", cancelText = "Cancelar", isDanger = false, onConfirm }) {
  const html = `
    <div class="p-6 flex flex-col gap-4 text-center">
      <div class="w-14 h-14 rounded-full ${isDanger ? 'bg-error-container text-error' : 'bg-primary-fixed text-primary'} mx-auto flex items-center justify-center shadow-inner">
        <span class="material-symbols-outlined text-[28px]">${icon}</span>
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="font-headline text-[18px] font-bold text-on-surface">${title}</h3>
        <p class="text-[13px] text-on-surface-variant leading-relaxed">${message}</p>
      </div>
      <div class="grid grid-cols-2 gap-2.5 pt-2">
        <button
          type="button"
          id="btn-dialog-cancel"
          class="h-11 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-bold text-[13px] transition-all active:scale-95"
        >
          ${cancelText}
        </button>
        <button
          type="button"
          id="btn-dialog-confirm"
          class="h-11 rounded-full ${isDanger ? 'bg-error text-white shadow-[0_4px_14px_rgba(186,26,26,0.3)]' : 'bg-gradient-to-r from-secondary to-primary text-white shadow-sm'} font-bold text-[13px] transition-all active:scale-95"
        >
          ${confirmText}
        </button>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-dialog-cancel")?.addEventListener("click", closeDialog);
  document.getElementById("btn-dialog-confirm")?.addEventListener("click", () => {
    closeDialog();
    if (typeof onConfirm === "function") onConfirm();
  });
}

/**
 * Quick Month Picker Dialog
 */
export function openQuickMonthPickerDialog() {
  const months = [
    { num: "01", name: "Janeiro", short: "Jan" },
    { num: "02", name: "Fevereiro", short: "Fev" },
    { num: "03", name: "Março", short: "Mar" },
    { num: "04", name: "Abril", short: "Abr" },
    { num: "05", name: "Maio", short: "Mai" },
    { num: "06", name: "Junho", short: "Jun" },
    { num: "07", name: "Julho", short: "Jul" },
    { num: "08", name: "Agosto", short: "Ago" },
    { num: "09", name: "Setembro", short: "Set" },
    { num: "10", name: "Outubro", short: "Out" },
    { num: "11", name: "Novembro", short: "Nov" },
    { num: "12", name: "Dezembro", short: "Dez" }
  ];
  const [currentYear] = state.activeMonth.split("-");

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[80vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
          <h3 class="font-headline text-[17px] font-bold text-on-surface">Selecionar Mês</h3>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="flex items-center justify-center gap-4 py-1">
        <button type="button" class="p-1 rounded-full text-on-surface-variant hover:text-primary active:scale-90" id="btn-year-prev">
          <span class="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <span class="font-headline text-[18px] font-bold text-primary" id="picker-year-label">${currentYear}</span>
        <button type="button" class="p-1 rounded-full text-on-surface-variant hover:text-primary active:scale-90" id="btn-year-next">
          <span class="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2 pt-1">
        ${months.map(m => {
          const mStr = `${currentYear}-${m.num}`;
          const isSelected = mStr === state.activeMonth;
          return `
            <button
              type="button"
              class="month-cell p-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${isSelected ? 'bg-gradient-to-tr from-secondary to-primary text-white shadow-md font-bold' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
              data-month="${mStr}"
            >
              <span class="text-[14px] font-bold">${m.short}</span>
              <span class="text-[10px] ${isSelected ? 'text-white/90' : 'text-on-surface-variant'}">${m.name}</span>
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  let selectedYear = parseInt(currentYear, 10);
  const updateYearGrid = (newYear) => {
    selectedYear = newYear;
    document.getElementById("picker-year-label").textContent = selectedYear;
    document.querySelectorAll(".month-cell").forEach((cell, idx) => {
      const mNum = months[idx].num;
      const mStr = `${selectedYear}-${mNum}`;
      cell.setAttribute("data-month", mStr);
      const isSelected = mStr === state.activeMonth;
      if (isSelected) {
        cell.className = "month-cell p-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 bg-gradient-to-tr from-secondary to-primary text-white shadow-md font-bold";
      } else {
        cell.className = "month-cell p-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 bg-surface-container-low text-on-surface hover:bg-surface-container";
      }
    });
  };

  document.getElementById("btn-year-prev")?.addEventListener("click", () => updateYearGrid(selectedYear - 1));
  document.getElementById("btn-year-next")?.addEventListener("click", () => updateYearGrid(selectedYear + 1));

  document.querySelectorAll(".month-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      state.activeMonth = cell.getAttribute("data-month");
      state.calendarSelectedDate = null;
      closeDialog();
      renderCurrentView();
      showToast(`Visualizando ${formatMonthYear(state.activeMonth)} 🌸`);
    });
  });
}

/**
 * Hospital Delay Notification Dialog (WhatsApp & E-mail Ready with Tone Selector)
 */
export function openHospitalDelayDialog(shiftId) {
  const shift = state.store.data.shifts.find(s => s.id === shiftId);
  if (!shift) return;

  const ev = evaluateShiftStatus(shift, state.referenceDate);
  const doctorName = state.store.data.doctorName || "Dra. Pediatra";
  const doctorCrm = state.store.data.doctorCrm || "CRM-SP";

  const getMessage = (tone) => {
    if (tone === "formal") {
      return `À Equipe de Faturamento / Financeiro - ${shift.hospital}\n\nPrezados(as),\n\nVenho por meio desta solicitar a regularização do repasse de honorários médicos referentes ao plantão realizado em ${formatDateBR(shift.shiftDate)} (${shift.shiftType} - ${shift.sector || 'Pediatria'}), prestado pela ${doctorName} (${doctorCrm}).\n\n- Valor Líquido devido: ${formatCurrency(shift.netValue)}\n- Vencimento programado: ${formatDateBR(shift.expectedPaymentDate)} (D+${(shift.paymentLagMonths || 3) * 30})\n- Atraso acumulado: ${ev.delayDays} dia(s)\n\nSolicito a gentileza de envio do comprovante de liquidação ou confirmação do lote bancário.\n\nAtenciosamente,\n${doctorName}`;
    }
    return `Olá, prezada equipe de faturamento do ${shift.hospital}! 🩺✨\n\nSou a ${doctorName}. Gostaria de verificar a previsão de liberação do repasse referente ao plantão que realizei em ${formatDateBR(shift.shiftDate)} (${shift.shiftType} - ${shift.sector || 'Pediatria'}), no valor líquido de ${formatCurrency(shift.netValue)}.\n\nA previsão contratual de depósito era para ${formatDateBR(shift.expectedPaymentDate)} (D+${(shift.paymentLagMonths || 3) * 30}), constando atualmente com ${ev.delayDays} dia(s) além da data estimada.\n\nPoderiam, por gentileza, me passar uma previsão de liberação bancária?\n\nMuito obrigada pela atenção e carinho!\nAtenciosamente,\n${doctorName}`;
  };

  let currentTone = state.billingTone || "gentil";
  let messageText = getMessage(currentTone);

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-coral-expense/20 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center">
            ${renderIcon("forward_to_inbox", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Cobrança de Repasse</h3>
            <span class="text-[11px] text-coral-expense font-semibold">${shift.hospital} • ${ev.label}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <div class="p-3 rounded-2xl bg-coral-expense-bg/60 border border-coral-expense/20 text-[12px] flex flex-col gap-1 text-on-surface">
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Valor Pendente:</span>
          <strong class="text-coral-expense font-bold">${formatCurrency(shift.netValue)}</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Data do Plantão:</span>
          <span>${formatDateBR(shift.shiftDate)} (${shift.sector || 'Pediatria'})</span>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Vencimento D+${(shift.paymentLagMonths || 3) * 30}:</span>
          <span class="text-error font-semibold">${formatDateBR(shift.expectedPaymentDate)} (${ev.delayDays}d atraso)</span>
        </div>
      </div>

      <!-- Tone selector -->
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-on-surface-variant">Tom da Mensagem:</span>
        <div class="bg-surface-container-low p-1 rounded-full flex items-center text-[11px] font-bold">
          <button
            type="button"
            id="btn-tone-gentil"
            class="px-3 py-1 rounded-full transition-all ${currentTone === 'gentil' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
          >
            Gentil 🌸
          </button>
          <button
            type="button"
            id="btn-tone-formal"
            class="px-3 py-1 rounded-full transition-all ${currentTone === 'formal' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
          >
            Formal 📋
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <textarea
          id="textarea-billing-msg"
          rows="6"
          class="w-full p-3 rounded-2xl bg-surface-container-low text-on-surface text-[12px] leading-relaxed focus:outline-none border border-purple-100 font-body"
          readonly
        >${messageText}</textarea>
      </div>

      <div class="flex flex-col gap-2 pt-1">
        <button
          type="button"
          id="btn-copy-billing-msg"
          class="h-11 w-full rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          ${renderIcon("content_copy", "text-[18px]")}
          <span>Copiar Mensagem 📋</span>
        </button>

        <a
          href="https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}"
          target="_blank"
          rel="noopener"
          id="btn-whatsapp-billing"
          class="h-11 w-full rounded-full bg-[#25D366] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_14px_rgba(37,211,102,0.35)]"
        >
          ${renderIcon("chat", "text-[18px]")}
          <span>Enviar via WhatsApp 💬</span>
        </a>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  const updateToneUI = (tone) => {
    currentTone = tone;
    state.billingTone = tone;
    messageText = getMessage(tone);
    const textarea = document.getElementById("textarea-billing-msg");
    if (textarea) textarea.value = messageText;
    const waLink = document.getElementById("btn-whatsapp-billing");
    if (waLink) waLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

    const btnGentil = document.getElementById("btn-tone-gentil");
    const btnFormal = document.getElementById("btn-tone-formal");
    if (btnGentil && btnFormal) {
      btnGentil.className = `px-3 py-1 rounded-full transition-all ${tone === 'gentil' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}`;
      btnFormal.className = `px-3 py-1 rounded-full transition-all ${tone === 'formal' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}`;
    }
  };

  document.getElementById("btn-tone-gentil")?.addEventListener("click", () => updateToneUI("gentil"));
  document.getElementById("btn-tone-formal")?.addEventListener("click", () => updateToneUI("formal"));

  document.getElementById("btn-copy-billing-msg")?.addEventListener("click", () => {
    copyToClipboard(messageText, "Mensagem de cobrança copiada! 📋");
  });
}

/**
 * Universal Clipboard Copy Helper with ExecCommand Fallback
 */
export function copyToClipboard(text, successMessage = "Copiado com sucesso! 📋") {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  if (typeof document === "undefined") return;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showToast(successMessage);
  } catch (e) {
    showToast("Texto pronto para cópia.");
  }
  document.body.removeChild(ta);
}

/**
 * Shift Swap & Handover Dialog (WhatsApp pre-formatted message for medical groups)
 */
export function openShiftSwapDialog(shiftId) {
  const shift = state.store.data.shifts.find(s => s.id === shiftId);
  if (!shift) return;

  const doc = state.store.data;
  const doctorName = doc.doctorName || "Dra. Pediatra";
  const doctorCrm = doc.doctorCrm || "CRM-SP";

  const getSwapMessage = (mode) => {
    if (mode === "passagem") {
      return `🩺 *Passagem de Plantão Clínico - Pediatria & Neo*\n` +
        `🏥 *Hospital:* ${shift.hospital} (${shift.sector || 'Pediatria'})\n` +
        `📅 *Data da Escala:* ${formatDateBR(shift.shiftDate)} • ${shift.shiftType}\n` +
        `👩‍⚕️ *Médica Responsável:* ${doctorName} (${doctorCrm})\n\n` +
        `📋 *Notas & Intercorrências:* ${shift.notes || 'Plantão sem intercorrências graves no setor.'}\n\n` +
        `✨ Passagem realizada com sucesso. Boa escala a todos!`;
    }
    return `🩺 *Troca de Plantão / Repasse de Escala Pediátrica*\n\n` +
      `Olá, colegas! Preciso passar/permutar o plantão abaixo:\n` +
      `🏥 *Hospital:* ${shift.hospital}\n` +
      `📍 *Setor:* ${shift.sector || 'UTI Neonatal / Pediatria'}\n` +
      `📅 *Data:* ${formatDateBR(shift.shiftDate)}\n` +
      `⏰ *Horário:* ${shift.shiftType}\n` +
      `💰 *Valor Líquido:* ${formatCurrency(shift.netValue)}\n` +
      (shift.notes ? `📝 *Obs:* ${shift.notes}\n` : '') +
      `\nAlguém com disponibilidade para assumir ou trocar data?\n` +
      `Agradeço muito! 🙏\n${doctorName} (${doctorCrm})`;
  };

  let currentMode = "troca"; // "troca" | "passagem"
  let messageText = getSwapMessage(currentMode);

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("swap_horiz", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Troca & Passagem de Plantão</h3>
            <span class="text-[11px] text-primary font-semibold">${shift.hospital} • ${formatDateBR(shift.shiftDate)}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <!-- Mode Selector (Troca de Plantão vs Passagem Clínica) -->
      <div class="bg-surface-container-low p-1 rounded-full flex items-center text-[11px] font-bold">
        <button
          type="button"
          id="btn-mode-swap"
          class="flex-1 py-1.5 px-3 rounded-full text-center transition-all ${currentMode === 'troca' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
        >
          Troca no WhatsApp 💬
        </button>
        <button
          type="button"
          id="btn-mode-handover"
          class="flex-1 py-1.5 px-3 rounded-full text-center transition-all ${currentMode === 'passagem' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
        >
          Passagem Clínica 📋
        </button>
      </div>

      <div class="p-3 rounded-2xl bg-surface-container-low/70 border border-purple-100 text-[12px] flex flex-col gap-1 text-on-surface">
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Instituição & Setor:</span>
          <strong class="font-bold">${shift.hospital} (${shift.sector || 'Pediatria'})</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Data & Horário:</span>
          <span>${formatDateBR(shift.shiftDate)} • ${shift.shiftType}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Remuneração Líquida:</span>
          <strong class="text-primary font-bold">${formatCurrency(shift.netValue)}</strong>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <textarea
          id="textarea-swap-msg"
          rows="6"
          class="w-full p-3 rounded-2xl bg-surface-container-low text-on-surface text-[12px] leading-relaxed focus:outline-none border border-purple-100 font-body"
          readonly
        >${messageText}</textarea>
      </div>

      <div class="flex flex-col gap-2 pt-1">
        <button
          type="button"
          id="btn-copy-swap-msg"
          class="h-11 w-full rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          ${renderIcon("content_copy", "text-[18px]")}
          <span>Copiar Mensagem 📋</span>
        </button>

        <a
          href="https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}"
          target="_blank"
          rel="noopener"
          id="btn-whatsapp-swap"
          class="h-11 w-full rounded-full bg-[#25D366] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_14px_rgba(37,211,102,0.35)]"
        >
          ${renderIcon("chat", "text-[18px]")}
          <span>Compartilhar no WhatsApp 💬</span>
        </a>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  const updateModeUI = (mode) => {
    currentMode = mode;
    messageText = getSwapMessage(mode);
    const textarea = document.getElementById("textarea-swap-msg");
    if (textarea) textarea.value = messageText;
    const waLink = document.getElementById("btn-whatsapp-swap");
    if (waLink) waLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

    const btnSwap = document.getElementById("btn-mode-swap");
    const btnHandover = document.getElementById("btn-mode-handover");
    if (btnSwap && btnHandover) {
      btnSwap.className = `flex-1 py-1.5 px-3 rounded-full text-center transition-all ${mode === 'troca' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}`;
      btnHandover.className = `flex-1 py-1.5 px-3 rounded-full text-center transition-all ${mode === 'passagem' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}`;
    }
  };

  document.getElementById("btn-mode-swap")?.addEventListener("click", () => updateModeUI("troca"));
  document.getElementById("btn-mode-handover")?.addEventListener("click", () => updateModeUI("passagem"));

  document.getElementById("btn-copy-swap-msg")?.addEventListener("click", () => {
    copyToClipboard(messageText, "Mensagem copiada para o WhatsApp! 📋");
  });
}

/**
 * Shift Voucher / Receipt Dialog with Hourly Rate & Clinical Sector
 */
export function openShiftVoucherDialog(shiftId) {
  const shift = state.store.data.shifts.find(s => s.id === shiftId);
  if (!shift) return;

  const gross = Number(shift.grossValue) || 0;
  const net = Number(shift.netValue) || (gross * 0.85);
  const tax = gross - net;
  const isPaid = shift.status === "received";
  const hourlyRate = calculateHourlyRate(net, shift.shiftType);

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            ${renderIcon("receipt_long", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Comprovante de Plantão</h3>
            <span class="text-[11px] text-primary font-semibold">Conciliação Médica Pediátrica</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <!-- Receipt Paper Style -->
      <div class="relative bg-surface-container-low/90 p-4 rounded-3xl border border-purple-100 flex flex-col gap-3 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-primary">Pediatria Chic • Recibo</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-on-primary-fixed'}">
            ${isPaid ? 'COMPENSADO EM CONTA' : 'AGUARDANDO DEPÓSITO'}
          </span>
        </div>

        <div class="flex flex-col border-b border-dashed border-purple-200 pb-3">
          <div class="flex items-center justify-between">
            <span class="font-headline text-[18px] font-bold text-on-surface">${shift.hospital}</span>
            <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
              ${shift.sector || 'UTI Neonatal'}
            </span>
          </div>
          <span class="text-[12px] text-on-surface-variant mt-0.5">${shift.shiftType} • Realizado em ${formatDateBR(shift.shiftDate)}</span>
        </div>

        <div class="flex flex-col gap-2 text-[12px]">
          <div class="flex justify-between text-on-surface-variant">
            <span>Honorários Brutos:</span>
            <span class="font-semibold text-on-surface">${formatCurrency(gross)}</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span>Retenção Tributária:</span>
            <span class="font-semibold text-coral-expense">- ${formatCurrency(tax)}</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span>Rentabilidade por Hora:</span>
            <span class="font-bold text-primary">${formatCurrency(hourlyRate)}/h</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-purple-200 text-[14px] font-bold">
            <span class="text-on-surface">Líquido Creditado:</span>
            <span class="text-tertiary font-bold">${formatCurrency(net)}</span>
          </div>
        </div>

        ${shift.notes ? `
          <div class="p-2.5 rounded-xl bg-white/70 border border-purple-100 text-[11px] text-on-surface-variant">
            <strong class="text-on-surface">Observações:</strong> ${shift.notes}
          </div>
        ` : ''}

        <div class="mt-1 pt-2 border-t border-dashed border-purple-200 flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>Data de Pagamento:</span>
          <span class="font-bold text-on-surface">
            ${shift.paidDate ? formatDateBR(shift.paidDate) : `Previsão: ${formatDateBR(shift.expectedPaymentDate)} (D+${(shift.paymentLagMonths || 3) * 30})`}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          id="btn-dialog-print"
          class="h-11 rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white font-bold text-[12px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
        >
          ${renderIcon("print", "text-[16px]")}
          <span>Imprimir Recibo</span>
        </button>
        <button
          type="button"
          id="btn-dialog-done"
          class="h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          ${renderIcon("check", "text-[18px]")}
          <span>Concluir</span>
        </button>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);
  document.getElementById("btn-dialog-done")?.addEventListener("click", closeDialog);
  document.getElementById("btn-dialog-print")?.addEventListener("click", () => window.print());
}

/**
 * Printable Medical Statement (Extrato Médico Timbrado)
 */
export function openPrintableStatementDialog() {
  const report = state.store.getMonthlyReport(state.activeMonth, state.referenceDate);
  const doc = state.store.data;

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3 no-print">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            ${renderIcon("print", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Extrato Financeiro Médico</h3>
            <span class="text-[11px] text-primary font-semibold">${formatMonthYear(state.activeMonth)}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <!-- Printable Document Paper -->
      <div class="bg-white p-5 rounded-2xl border border-purple-100 flex flex-col gap-3.5 shadow-sm text-on-surface text-[12px]">
        <div class="border-b-2 border-primary/20 pb-3 flex justify-between items-start">
          <div class="flex flex-col">
            <h2 class="font-headline text-[18px] font-bold text-primary">${doc.doctorName}</h2>
            <span class="text-[12px] text-on-surface-variant font-medium">${doc.doctorTitle}</span>
            <span class="text-[11px] text-primary font-semibold">${doc.doctorCrm || 'CRM-SP • Pediatria'}</span>
          </div>
          <div class="text-right flex flex-col">
            <span class="text-[11px] font-bold uppercase tracking-wider text-secondary">Demonstrativo Mensal</span>
            <span class="text-[13px] font-bold text-on-surface">${formatMonthYear(state.activeMonth)}</span>
            <span class="text-[10px] text-on-surface-variant">Emitido em ${formatDateBR(getLocalDateString(new Date()))}</span>
          </div>
        </div>

        <!-- Summary KPI Grid -->
        <div class="grid grid-cols-3 gap-2 p-3 bg-surface-container-low rounded-xl text-center">
          <div>
            <span class="text-[10px] text-on-surface-variant block uppercase font-bold">Caixa (D+90)</span>
            <span class="text-[14px] font-bold text-secondary font-display">${formatCurrency(report.caixa.totalInflow)}</span>
          </div>
          <div>
            <span class="text-[10px] text-on-surface-variant block uppercase font-bold">Despesas</span>
            <span class="text-[14px] font-bold text-error font-display">${formatCurrency(report.expenses.total)}</span>
          </div>
          <div>
            <span class="text-[10px] text-on-surface-variant block uppercase font-bold">Saldo Líquido</span>
            <span class="text-[14px] font-bold text-tertiary font-display">${formatCurrency(report.caixa.netBalance)}</span>
          </div>
        </div>

        <!-- Shifts Table -->
        <div class="flex flex-col gap-1">
          <span class="text-[12px] font-bold text-primary">Plantões do Período (${report.caixa.shiftsList.length} repasses previstos)</span>
          <div class="border border-purple-100 rounded-xl overflow-hidden">
            <table class="w-full text-left text-[11px]">
              <thead class="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th class="p-2">Data</th>
                  <th class="p-2">Hospital</th>
                  <th class="p-2">Setor</th>
                  <th class="p-2 text-right">Líquido</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-purple-50">
                ${report.caixa.shiftsList.length > 0 ? report.caixa.shiftsList.map(s => `
                  <tr>
                    <td class="p-2">${formatDateBR(s.shiftDate)}</td>
                    <td class="p-2 font-medium">${s.hospital}</td>
                    <td class="p-2 text-on-surface-variant">${s.sector || 'UTI'}</td>
                    <td class="p-2 text-right font-bold text-on-surface">${formatCurrency(s.netValue)}</td>
                  </tr>
                `).join("") : `
                  <tr><td colspan="4" class="p-3 text-center text-on-surface-variant">Sem plantões no período</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Expenses Table -->
        <div class="flex flex-col gap-1">
          <span class="text-[12px] font-bold text-primary">Despesas Operacionais (${report.expenses.list.length} itens)</span>
          <div class="border border-purple-100 rounded-xl overflow-hidden">
            <table class="w-full text-left text-[11px]">
              <thead class="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th class="p-2">Descrição</th>
                  <th class="p-2">Categoria</th>
                  <th class="p-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-purple-50">
                ${report.expenses.list.length > 0 ? report.expenses.list.map(e => `
                  <tr>
                    <td class="p-2 font-medium">${e.description}</td>
                    <td class="p-2 text-on-surface-variant">${e.category}</td>
                    <td class="p-2 text-right font-bold text-error">${formatCurrency(e.value)}</td>
                  </tr>
                `).join("") : `
                  <tr><td colspan="3" class="p-3 text-center text-on-surface-variant">Sem despesas no período</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-2.5 pt-1 no-print">
        <button
          type="button"
          id="btn-print-statement"
          class="h-11 rounded-full bg-secondary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          ${renderIcon("print", "text-[18px]")}
          <span>Imprimir Extrato 🖨️</span>
        </button>
        <button
          type="button"
          id="btn-export-statement-csv"
          class="h-11 rounded-full bg-primary-fixed text-primary hover:bg-primary hover:text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          ${renderIcon("table_chart", "text-[18px]")}
          <span>Exportar CSV 📊</span>
        </button>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);
  document.getElementById("btn-print-statement")?.addEventListener("click", () => window.print());
  document.getElementById("btn-export-statement-csv")?.addEventListener("click", () => {
    exportDataCSV(state.activeMonth, true);
  });
}

/**
 * Doctor Profile & Goals Dialog
 */
export function openDoctorProfileDialog() {
  const storeData = state.store.data;
  const initials = (storeData.doctorName || 'Dra').replace(/^(dra?\.\s*)/i, '').trim().slice(0, 2).toUpperCase() || 'DR';

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-[12px]">
            ${initials}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Perfil da Médica & Metas</h3>
            <span class="text-[11px] text-primary font-semibold">Configurações Personalizadas</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon('close', 'text-[18px]')}
        </button>
      </div>

      <form id="form-profile" class="flex flex-col gap-3.5">
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface-variant">Seu Nome / Como prefere ser chamada</label>
          <input
            type="text"
            id="input-doc-name"
            class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[13px] font-medium focus:outline-none border border-transparent focus:border-primary"
            placeholder="Ex: Dra. Ana Silva"
            value="${storeData.doctorName}"
            required
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface-variant">Especialidade / Título Profissional</label>
          <input
            type="text"
            id="input-doc-title"
            class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[13px] font-medium focus:outline-none border border-transparent focus:border-primary"
            placeholder="Ex: Pediatria & Neonatologia 🩺✨"
            value="${storeData.doctorTitle}"
            required
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface-variant">CRM / Registro Profissional</label>
          <input
            type="text"
            id="input-doc-crm"
            class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[13px] font-medium focus:outline-none border border-transparent focus:border-primary"
            placeholder="Ex: CRM-SP 214.890 • RQE 98.412"
            value="${storeData.doctorCrm || 'CRM-SP • Pediatria'}"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-[12px] font-bold text-on-surface-variant">Meta Mensal (R$)</label>
            <input
              type="number"
              step="500"
              id="input-doc-goal"
              class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[14px] font-bold focus:outline-none border border-transparent focus:border-primary font-display"
              value="${storeData.monthlyIncomeGoal || 25000}"
              required
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-[12px] font-bold text-on-surface-variant">Teto de Gastos (R$)</label>
            <input
              type="number"
              step="100"
              id="input-doc-budget"
              class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[14px] font-bold focus:outline-none border border-transparent focus:border-primary font-display"
              value="${storeData.monthlyBudgetLimit || 10000}"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          class="h-11 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all mt-1"
        >
          ${renderIcon('save', 'text-[18px]')}
          <span>Salvar Meu Perfil</span>
        </button>
      </form>

      <!-- App Installation & Data Management -->
      <div class="pt-2 border-t border-purple-100 flex flex-col gap-2">
        <button
          type="button"
          id="btn-dialog-install-pwa"
          class="h-10 w-full rounded-full bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed/80 font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          ${renderIcon('smartphone', 'text-[16px]')}
          <span>Como Instalar no iPhone / Android 📲</span>
        </button>

        <button
          type="button"
          id="btn-dialog-load-demo"
          class="h-10 w-full rounded-full bg-primary-fixed/60 hover:bg-primary-fixed text-primary font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors"
        >
          ${renderIcon('play_circle', 'text-[16px]')}
          <span>Carregar Dados de Exemplo (Demonstração)</span>
        </button>

        <button
          type="button"
          id="btn-dialog-reset"
          class="h-10 w-full rounded-full bg-error-container/40 hover:bg-error-container text-error font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors"
        >
          ${renderIcon('delete_sweep', 'text-[16px]')}
          <span>Limpar Todos os Meus Dados</span>
        </button>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  document.getElementById("btn-dialog-install-pwa")?.addEventListener("click", () => {
    closeDialog();
    openPwaInstallDialog();
  });

  document.getElementById("btn-dialog-load-demo")?.addEventListener("click", () => {
    state.store.loadDemoData();
    closeDialog();
    renderCurrentView();
    showToast("Exemplo demonstrativo carregado com sucesso! 🌸");
  });

  document.getElementById("form-profile")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const doctorName = document.getElementById("input-doc-name").value.trim();
    const doctorTitle = document.getElementById("input-doc-title").value.trim();
    const doctorCrm = document.getElementById("input-doc-crm").value.trim();
    const monthlyIncomeGoal = parseFloat(document.getElementById("input-doc-goal").value) || 25000;
    const monthlyBudgetLimit = parseFloat(document.getElementById("input-doc-budget").value) || 10000;

    state.store.updateDoctorProfile({ doctorName, doctorTitle, doctorCrm, monthlyIncomeGoal, monthlyBudgetLimit });
    closeDialog();
    renderCurrentView();
    showToast("Perfil e metas atualizados com carinho! 🌸");
  });

  document.getElementById("btn-dialog-reset")?.addEventListener("click", () => {
    showConfirmDialog({
      title: "Limpar Todos os Dados?",
      message: "Isso removerá todas as suas escalas e despesas cadastradas para começar do zero.",
      isDanger: true,
      confirmText: "Sim, Limpar Tudo",
      onConfirm: () => {
        state.store.resetToDefault();
        showToast("Dados limpos com sucesso! 🌸");
        renderCurrentView();
      }
    });
  });
}

/**
 * PWA Installation Guide Dialog (iOS & Android)
 */
export function openPwaInstallDialog() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${typeof renderIcon === 'function' ? renderIcon('smartphone', 'text-[20px]') : '<span class="material-symbols-outlined text-[20px]">smartphone</span>'}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Instalar no Dispositivo</h3>
            <span class="text-[11px] text-primary font-semibold">Acesso Rápido & Tela Cheia</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${typeof renderIcon === 'function' ? renderIcon('close', 'text-[18px]') : '<span class="material-symbols-outlined text-[18px]">close</span>'}
        </button>
      </div>

      <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-secondary-fixed/40 to-primary-fixed/40 rounded-2xl border border-purple-100">
        <img src="./assets/icons/icon-192.png" alt="Pediatria Chic" class="w-12 h-12 rounded-2xl shadow-sm border border-white" />
        <div class="flex flex-col">
          <span class="font-headline text-[14px] font-bold text-on-surface">Pediatria Chic</span>
          <span class="text-[11px] text-on-surface-variant">Funciona como App Nativo • 100% Seguro</span>
        </div>
      </div>

      <!-- iOS Instructions -->
      <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100 flex flex-col gap-2.5">
        <div class="flex items-center gap-1.5 text-secondary font-bold text-[13px]">
          <span>${typeof renderIcon === 'function' ? renderIcon('apple', 'text-[16px]') : '🍎'}</span>
          <span>No iPhone ou iPad (Safari):</span>
        </div>
        <ol class="text-[12px] text-on-surface-variant flex flex-col gap-2 pl-1 leading-relaxed">
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-secondary/10 text-secondary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima <code>⎋</code>) na barra inferior do Safari.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-secondary/10 text-secondary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> <code>➕</code>.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-secondary/10 text-secondary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Toque em <strong>"Adicionar"</strong> no canto superior direito. Pronto!</span>
          </li>
        </ol>
      </div>

      <!-- Android Instructions -->
      <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100 flex flex-col gap-2.5">
        <div class="flex items-center gap-1.5 text-tertiary font-bold text-[13px]">
          <span>🤖</span>
          <span>No Android (Google Chrome):</span>
        </div>
        <ol class="text-[12px] text-on-surface-variant flex flex-col gap-2 pl-1 leading-relaxed">
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-tertiary/10 text-tertiary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Toque no menu de <strong>três pontinhos</strong> <code>⋮</code> no canto superior do navegador.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-tertiary/10 text-tertiary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
          </li>
        </ol>
      </div>

      <button
        type="button"
        id="btn-close-install-modal"
        class="h-11 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
      >
        ${typeof renderIcon === 'function' ? renderIcon('check', 'text-[18px]') : '<span class="material-symbols-outlined text-[18px]">check</span>'}
        <span>Entendi</span>
      </button>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);
  document.getElementById("btn-close-install-modal")?.addEventListener("click", closeDialog);
}

/**
 * Notifications & Alerts Dialog
 */
export function openNotificationsDialog() {
  const notifs = state.store.getNotifications(state.referenceDate, state.activeMonth);

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            <span class="material-symbols-outlined text-[18px]">notifications_active</span>
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Avisos & Lembretes</h3>
            <span class="text-[11px] text-on-surface-variant">${notifs.length} alerta(s) ativo(s)</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="flex flex-col gap-2.5">
        ${notifs.length > 0 ? notifs.map(n => `
          <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100 flex flex-col gap-2">
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[20px] shrink-0" style="color: ${n.color};">${n.icon}</span>
              <div class="flex flex-col min-w-0">
                <span class="text-[13px] font-bold text-on-surface">${n.title}</span>
                <p class="text-[12px] text-on-surface-variant leading-snug mt-0.5">${n.message}</p>
              </div>
            </div>
            <button
              type="button"
              class="btn-notif-action self-end px-3 py-1 rounded-full text-[11px] font-bold bg-white text-secondary shadow-sm hover:bg-secondary hover:text-white transition-all active:scale-95"
              data-type="${n.type}"
              data-id="${n.data?.id || ''}"
            >
              ${n.actionLabel} →
            </button>
          </div>
        `).join("") : `
          <div class="p-8 text-center text-on-surface-variant flex flex-col items-center">
            <span class="material-symbols-outlined text-[36px] text-tertiary mb-2">check_circle</span>
            <p class="text-[14px] font-bold text-on-surface">Tudo em dia!</p>
            <p class="text-[12px] text-on-surface-variant mt-1">Nenhum repasse atrasado ou alerta para este período.</p>
          </div>
        `}
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  document.querySelectorAll(".btn-notif-action").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      const id = btn.getAttribute("data-id");
      closeDialog();

      if (type === "delayed_shift") {
        openHospitalDelayDialog(id);
      } else if (type === "upcoming_shift") {
        switchTab("plantoes");
      } else if (type === "budget_alert") {
        switchTab("despesas");
      }
    });
  });
}

/**
 * Navigation and Routing
 */
function switchTab(tabId) {
  state.activeTab = tabId;

  // Update nav icons and active states
  dom.navTabs.forEach(tab => {
    const target = tab.getAttribute("data-tab");
    if (target === tabId) {
      tab.classList.add("text-secondary", "font-bold");
      tab.classList.remove("text-on-surface-variant");
      const icon = tab.querySelector(".material-symbols-outlined");
      if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    } else {
      tab.classList.remove("text-secondary", "font-bold");
      tab.classList.add("text-on-surface-variant");
      const icon = tab.querySelector(".material-symbols-outlined");
      if (icon) icon.style.fontVariationSettings = "'FILL' 0";
    }
  });

  renderCurrentView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Month Navigation
 */
function changeMonth(delta) {
  state.activeMonth = addMonths(state.activeMonth + "-01", delta).slice(0, 7);
  state.calendarSelectedDate = null;
  updateMonthHeader();
  renderCurrentView();
}

function updateMonthHeader() {
  if (dom.monthDisplay) {
    dom.monthDisplay.textContent = formatMonthYear(state.activeMonth);
  }
  if (dom.headerActiveTab) {
    const tabLabels = {
      inicio: "Início",
      plantoes: "Plantões",
      despesas: "Despesas",
      relatorios: "Relatórios"
    };
    dom.headerActiveTab.textContent = tabLabels[state.activeTab] || "Início";
  }
  if (dom.headerDoctorTitle) {
    dom.headerDoctorTitle.textContent = state.store.data.doctorTitle;
  }
  updateNotificationBadge();
}

function updateNotificationBadge() {
  if (!dom.notifBadge) return;
  const notifs = state.store.getNotifications(state.referenceDate, state.activeMonth);
  if (notifs.length > 0) {
    dom.notifBadge.textContent = notifs.length;
    dom.notifBadge.classList.remove("hidden");
  } else {
    dom.notifBadge.classList.add("hidden");
  }
}

// ----------------------------------------------------
// VIEW RENDERERS
// ----------------------------------------------------

function renderCurrentView() {
  updateMonthHeader();
  switch (state.activeTab) {
    case "inicio":
      renderDashboardView();
      break;
    case "plantoes":
      renderShiftsView();
      break;
    case "despesas":
      renderExpensesView();
      break;
    case "relatorios":
      renderReportsView();
      break;
    default:
      renderDashboardView();
  }
  if (typeof enhanceIcons === "function" && dom.mainContent) {
    enhanceIcons(dom.mainContent);
  }
}

/**
 * View 1: Início (Dashboard Geral)
 */
function renderDashboardView() {
  const report = state.store.getMonthlyReport(state.activeMonth, state.referenceDate);
  const forecast = state.store.getShiftInflowForecast(state.activeMonth, 4);
  const wellbeing = state.store.getDoctorWellbeingMetrics(state.activeMonth);
  const isCaixa = state.currentRegime === "caixa";

  // Balance values depending on active regime
  const mainBalance = isCaixa ? report.caixa.netBalance : report.competencia.netBalance;
  const balanceTitle = isCaixa ? "Saldo Líquido Previsto (Caixa)" : "Produção Líquida (Competência)";
  const balanceExplanation = isCaixa
    ? "Salário do mês + plantões com depósito previsto para este mês - despesas."
    : "Produção de plantões realizados neste mês trabalhado + salário - despesas.";

  const donutData = renderDonutChartSVG(report.expenses.categoryBreakdown, report.expenses.total);

  // Filter 3 radar items for dashboard
  const radarShifts = report.caixa.shiftsList.slice(0, 3);

  const html = `
    <div class="flex flex-col w-full gap-4 pb-28 pt-2">
      <!-- 1. Saudação & Status Médico -->
      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <h1 class="font-headline text-[22px] font-bold text-on-surface truncate">Olá, ${state.store.data.doctorName}</h1>
              <span class="text-base select-none">🩺✨</span>
            </div>
            <p class="font-body-sm text-[13px] text-on-surface-variant truncate">${state.store.data.doctorTitle}</p>
          </div>
          <div class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed shadow-sm">
            ${renderIcon("spa", "text-[15px]")}
            <span class="text-[11px] font-bold">Plantão: Ativa</span>
          </div>
        </div>
      </section>

      <!-- 2. Hero Card: Saldo Líquido com Toggle Animado -->
      <section class="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-secondary via-secondary-container to-primary text-white p-5 shadow-[0_12px_28px_rgba(184,15,85,0.22)]">
        <!-- SVG Watermark -->
        <svg class="absolute -right-8 -top-8 w-44 h-44 text-white/10 pointer-events-none" fill="currentColor" viewBox="0 0 100 100">
          <path d="M50 15 C35 0, 10 15, 25 45 C35 65, 50 85, 50 85 C50 85, 65 65, 75 45 C90 15, 65 0, 50 15 Z" opacity="0.4"></path>
        </svg>

        <div class="relative z-10 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-[12px] font-bold uppercase tracking-wider text-white/85 flex items-center gap-1.5">
              ${renderIcon("account_balance_wallet", "text-[16px]")}
              ${isCaixa ? 'Saldo em Caixa (D+90)' : 'Produção do Mês (Competência)'}
            </span>
            ${renderIcon("auto_awesome", "text-[20px] text-white/70")}
          </div>

          <div class="flex flex-col">
            ${isCaixa ? `
              <div class="flex flex-col">
                <span class="text-[11px] font-semibold text-white/80 uppercase tracking-wide">Saldo Realizado em Conta</span>
                <span class="text-[34px] font-bold tracking-tight font-display text-white transition-transform ${state.privacyMode ? 'privacy-masked-text' : ''}" id="hero-realized-balance">
                  ${formatMoney(report.caixa.realizedNetBalance)}
                </span>
                <div class="flex items-center gap-2 mt-1">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                    ${renderIcon("verified", "text-[14px]")}
                    ${formatMoney(report.caixa.realizedInflow)} recebidos
                  </span>
                  <span class="text-[12px] text-white/85">Previsto final: <strong class="text-white">${formatMoney(report.caixa.netBalance)}</strong></span>
                </div>
              </div>
            ` : `
              <div class="flex flex-col">
                <span class="text-[11px] font-semibold text-white/80 uppercase tracking-wide">Produção Líquida Efetiva</span>
                <span class="text-[34px] font-bold tracking-tight font-display text-white ${state.privacyMode ? 'privacy-masked-text' : ''}">
                  ${formatMoney(report.competencia.netBalance)}
                </span>
                <div class="flex items-center gap-2 mt-1">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                    ${renderIcon("local_hospital", "text-[14px]")}
                    ${report.competencia.shiftsCount} plantões trabalhados
                  </span>
                  <span class="text-[12px] text-white/85">Bruto: <strong class="text-white">${formatMoney(report.competencia.totalProductionGross)}</strong></span>
                </div>
              </div>
            `}
            <p class="text-[11px] text-white/75 mt-2 leading-snug">${balanceExplanation}</p>
          </div>

          <!-- Toggle: Regime de Caixa vs Regime de Competência -->
          <div class="mt-2 pt-3 border-t border-white/20 flex items-center justify-between">
            <span class="text-[11px] font-medium text-white/90">Modo de Visualização:</span>
            <div class="bg-black/25 p-1 rounded-full flex items-center" role="group">
              <button
                type="button"
                id="btn-regime-caixa"
                class="px-3 py-1 rounded-full text-[12px] font-bold transition-all ${isCaixa ? 'bg-white text-secondary shadow-sm' : 'text-white/80 hover:text-white'}"
              >
                Regime Caixa
              </button>
              <button
                type="button"
                id="btn-regime-competencia"
                class="px-3 py-1 rounded-full text-[12px] font-bold transition-all ${!isCaixa ? 'bg-white text-secondary shadow-sm' : 'text-white/80 hover:text-white'}"
              >
                Competência
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 2.5. Meta de Faturamento Mensal (Termômetro Pediátrico) -->
      <section class="card-floating p-4 flex flex-col gap-2.5 bg-white border border-purple-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
              ${renderIcon("flag", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Meta de Faturamento do Mês</h2>
              <span class="text-[11px] text-on-surface-variant">${formatMonthYear(state.activeMonth)}</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full ${report.goals.percent >= 100 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'} text-[11px] font-bold">
            ${report.goals.percent}% atingida
          </span>
        </div>

        <div class="flex items-baseline justify-between pt-0.5">
          <div class="flex items-baseline gap-1">
            <span class="text-[24px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(report.goals.achieved)}</span>
            <span class="text-[12px] text-on-surface-variant">/ ${formatMoney(report.goals.target)}</span>
          </div>
          <button type="button" id="btn-edit-monthly-goal" class="text-[11px] font-bold text-secondary hover:underline flex items-center gap-0.5">
            ${renderIcon("edit", "text-[12px]")}
            <span>Ajustar Meta</span>
          </button>
        </div>

        <!-- Progress bar with gradient -->
        <div class="relative w-full h-3 rounded-full bg-surface-container overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-secondary via-secondary-container to-primary transition-all duration-700"
            style="width: ${Math.min(report.goals.percent, 100)}%;"
          ></div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
          ${report.goals.remaining > 0 ? `
            <span>Faltam <strong class="text-secondary font-bold">${formatMoney(report.goals.remaining)}</strong> (~${report.goals.approxShiftsNeeded} plantão(ões) de 12h)</span>
          ` : `
            <span class="text-tertiary font-bold flex items-center gap-1">
              ${renderIcon("check_circle", "text-[14px]")}
              Parabéns, Doutora! Meta do mês superada! 💖🎉
            </span>
          `}
          <span class="font-semibold text-primary">🩺 Cuidado & Equilíbrio</span>
        </div>
      </section>

      <!-- 2.7. Termômetro de Bem-Estar & Saúde Médica (Flo Health / CFM) -->
      <section class="card-floating p-4 flex flex-col gap-2.5 bg-white border border-purple-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full ${wellbeing.fatigueLevel === 'high' ? 'bg-error-container text-error' : wellbeing.fatigueLevel === 'moderate' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'} flex items-center justify-center">
              ${renderIcon(wellbeing.fatigueLevel === 'high' ? 'health_and_safety' : 'favorite_border', 'text-[18px]')}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Ritmo de Plantões & Descanso</h2>
              <span class="text-[11px] text-on-surface-variant">Diretrizes CFM & Cuidado Pessoal</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full ${wellbeing.fatigueLevel === 'high' ? 'bg-error-container text-error' : wellbeing.fatigueLevel === 'moderate' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'} text-[11px] font-bold">
            ${wellbeing.statusBadge}
          </span>
        </div>
        <p class="text-[12px] text-on-surface-variant leading-relaxed">
          ${wellbeing.message}
        </p>
        <div class="flex items-center gap-3 pt-1 border-t border-purple-50 text-[11px] text-on-surface-variant font-medium">
          <span class="flex items-center gap-1">
            ${renderIcon("schedule", "text-[13px] text-primary")}
            <strong>${wellbeing.totalHours}h</strong> trabalhadas
          </span>
          <span>•</span>
          <span class="flex items-center gap-1">
            ${renderIcon("bedtime", "text-[13px] text-secondary")}
            <strong>${wellbeing.nightShiftsCount}</strong> noturno(s)
          </span>
          <span>•</span>
          <span class="flex items-center gap-1">
            ${renderIcon("speed", "text-[13px] text-tertiary")}
            <strong>~${wellbeing.averageWeeklyHours}h</strong>/sem
          </span>
        </div>
      </section>

      <!-- 3. Carrossel Horizontal de Métricas Operacionais -->
      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h2 class="text-[17px] font-bold text-on-surface">Resumo Operacional</h2>
          <span class="text-[11px] font-semibold text-on-surface-variant">Deslize para ver</span>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar snap-x snap-mandatory">
          <!-- Card 1: Consultório Fixo (Click to Edit) -->
          <div
            id="card-fixed-salary"
            class="min-w-[195px] snap-start bg-white p-4 rounded-[20px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col justify-between cursor-pointer hover:shadow-md active:scale-95 transition-all group"
            title="Clique para editar salário fixo"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                ${renderIcon("meeting_room", "text-[18px]")}
              </div>
              <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold flex items-center gap-0.5">
                <span>${report.fixedSalariesTotal > 0 ? 'Configurado' : '+ Adicionar'}</span>
                ${renderIcon("edit", "text-[11px]")}
              </span>
            </div>
            <div>
              <span class="text-[12px] text-on-surface-variant block">Salário Consultório</span>
              <span class="text-[18px] font-bold text-on-surface mt-0.5 block ${state.privacyMode ? 'privacy-masked-text' : ''}">${report.fixedSalariesTotal > 0 ? formatMoney(report.fixedSalariesTotal) : 'R$ 0,00'}</span>
              <span class="text-[10px] text-primary font-semibold mt-0.5 block">${report.fixedSalariesTotal > 0 ? 'Toque para ajustar' : 'Toque para cadastrar'}</span>
            </div>
          </div>

          <!-- Card 2: Plantões no Mês (Caixa vs Competência) -->
          <div class="min-w-[195px] snap-start bg-white p-4 rounded-[20px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                ${renderIcon("medical_services", "text-[18px]")}
              </div>
              <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                ${isCaixa ? `${report.caixa.shiftsList.length} repasses` : `${report.competencia.shiftsCount} escalas`}
              </span>
            </div>
            <div>
              <span class="text-[12px] text-on-surface-variant block">
                ${isCaixa ? 'Plantões Previstos no Caixa' : 'Plantões Produzidos'}
              </span>
              <span class="text-[18px] font-bold text-on-surface mt-0.5 block ${state.privacyMode ? 'privacy-masked-text' : ''}">
                ${formatMoney(isCaixa ? report.caixa.shiftsTotalNet : report.competencia.shiftsNetProduction)}
              </span>
              ${isCaixa ? `
                <span class="text-[11px] text-tertiary font-bold mt-0.5 block">
                  ${formatMoney(report.caixa.shiftsReceivedNet)} em conta
                </span>
              ` : `
                <span class="text-[11px] text-on-surface-variant font-medium mt-0.5 block">
                  Bruto: ${formatMoney(report.competencia.shiftsGrossProduction)}
                </span>
              `}
            </div>
          </div>

          <!-- Card 3: Despesas Totais -->
          <div class="min-w-[195px] snap-start bg-white p-4 rounded-[20px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-full bg-error-container flex items-center justify-center text-error">
                ${renderIcon("receipt_long", "text-[18px]")}
              </div>
              <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold">
                ${report.expenses.list.length} despesas
              </span>
            </div>
            <div>
              <span class="text-[12px] text-on-surface-variant block">Despesas no Mês</span>
              <span class="text-[18px] font-bold text-error mt-0.5 block ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(report.expenses.total)}</span>
              <span class="text-[11px] text-on-surface-variant font-medium mt-0.5 block">
                ${formatMoney(report.expenses.paid)} já pagas
              </span>
            </div>
          </div>

          <!-- Card 4: Rentabilidade por Hora & Carga Horária -->
          <div class="min-w-[195px] snap-start bg-white p-4 rounded-[20px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                ${renderIcon("speed", "text-[18px]")}
              </div>
              <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                ${report.workload.totalHours}h no mês
              </span>
            </div>
            <div>
              <span class="text-[12px] text-on-surface-variant block">Rentabilidade Média</span>
              <span class="text-[18px] font-bold text-primary mt-0.5 block">
                ${report.workload.averageHourlyRate > 0 ? `R$ ${report.workload.averageHourlyRate}/h` : 'R$ 0/h'}
              </span>
              <span class="text-[10px] text-tertiary font-bold mt-0.5 block">
                ${report.workload.totalHours > 0 ? 'Ritmo equilibrado 🌿' : 'Sem plantões no mês'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Delayed Shifts Alert Banner (if any delayed shifts exist) -->
      ${state.store.getLiquidityRadarSummary(state.referenceDate).countDelayed > 0 ? `
        <div class="bg-coral-expense-bg border border-coral-expense/30 rounded-[20px] p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-coral-expense text-white flex items-center justify-center shrink-0">
              ${renderIcon("warning", "text-[18px]")}
            </div>
            <div class="min-w-0">
              <span class="text-[12px] font-bold text-coral-expense block">Atenção aos Repasses em Atraso</span>
              <span class="text-[11px] text-on-surface-variant truncate block">
                ${state.store.getLiquidityRadarSummary(state.referenceDate).countDelayed} plantão(ões) com repasse vencido além do prazo D+90.
              </span>
            </div>
          </div>
          <button type="button" class="btn-filter-delayed shrink-0 px-3 py-1.5 rounded-full bg-coral-expense text-white text-[11px] font-bold active:scale-95 transition-all shadow-sm">
            Cobrar
          </button>
        </div>
      ` : ''}

      <!-- 4. Gráfico SVG: Previsão de Entradas dos Próximos 4 Meses -->
      <section class="bg-white p-4 rounded-[24px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[17px] font-bold text-on-surface">Previsão dos Próximos 4 Meses</h2>
            <p class="text-[12px] text-on-surface-variant">Entrada prevista de plantões e consultório (D+90)</p>
          </div>
          <div class="w-8 h-8 rounded-full bg-primary-fixed/50 flex items-center justify-center text-primary">
            ${renderIcon("stacked_line_chart", "text-[18px]")}
          </div>
        </div>
        ${renderForecastChartSVG(forecast)}
      </section>

      <!-- 5. Radar de Plantões com Botão 1-Touch -->
      <section class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-[17px] font-bold text-on-surface">Radar de Recebimentos</h2>
            <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">D+90</span>
          </div>
          <button type="button" class="text-[13px] font-bold text-secondary hover:underline" id="btn-see-all-shifts">
            Ver todos (${state.store.data.shifts.length})
          </button>
        </div>

        <div class="flex flex-col gap-2.5">
          ${radarShifts.length > 0 ? radarShifts.map(s => renderShiftCard(s, true)).join("") : `
            <div class="bg-white p-6 rounded-[24px] text-center text-on-surface-variant shadow-sm flex flex-col items-center">
              ${typeof renderIcon === 'function' ? renderIcon('event_available', 'text-[32px] text-primary/40') : '<span class="material-symbols-outlined text-[32px] text-primary/40">event_available</span>'}
              <p class="text-[13px] font-semibold mt-1">Nenhum repasse previsto para ${formatMonthYear(state.activeMonth)}.</p>
              <button type="button" class="btn-dashboard-add-shift mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-secondary to-primary text-white text-[12px] font-bold shadow-sm hover:opacity-95 transition-all active:scale-95 flex items-center gap-1.5">
                ${typeof renderIcon === 'function' ? renderIcon('add', 'text-[16px]') : '+'}
                <span>Cadastrar Meu Primeiro Plantão</span>
              </button>
            </div>
          `}
        </div>
      </section>

      <!-- 6. Donut SVG: Divisão de Despesas por Categoria -->
      <section class="bg-white p-4 rounded-[24px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[17px] font-bold text-on-surface">Divisão de Despesas</h2>
            <p class="text-[12px] text-on-surface-variant">Custos da carreira pediátrica em ${formatMonthYear(state.activeMonth)}</p>
          </div>
          <button type="button" class="text-[12px] font-bold text-primary hover:underline" id="btn-see-all-expenses">
            Ver detalhes
          </button>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-4 pt-1">
          ${donutData.svg}
          ${donutData.legend}
        </div>
      </section>

      <!-- 7. Banner Motivacional Pediátrico -->
      <div class="bg-surface-container-low rounded-[20px] p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
          ${renderIcon("verified", "text-[22px]")}
        </div>
        <div class="flex flex-col">
          <span class="text-[14px] text-on-surface font-bold">Planejamento Pediátrico em Dia!</span>
          <span class="text-[12px] text-on-surface-variant">Seus repasses D+90 estão organizados com precisão.</span>
        </div>
      </div>
    </div>
  `;

  dom.mainContent.innerHTML = html;
  attachDashboardEvents();
}

/**
 * View 2: Gestão de Plantões
 */
function renderShiftsView() {
  const radar = state.store.getLiquidityRadarSummary(state.referenceDate);
  const shifts = state.store.data.shifts;

  // Evaluate each shift
  const evaluatedShifts = shifts.map(s => {
    const ev = evaluateShiftStatus(s, state.referenceDate);
    return { ...s, ...ev };
  });

  // Scope: "month" (activeMonth) vs "all"
  const isScopeMonth = state.shiftScope === "month";
  const isCaixa = state.currentRegime === "caixa";

  let scopedShifts = evaluatedShifts;
  if (isScopeMonth) {
    if (isCaixa && state.shiftViewMode !== "calendar") {
      scopedShifts = scopedShifts.filter(s => {
        const cashMonth = (s.status === "received" && s.paidDate)
          ? s.paidDate.slice(0, 7)
          : s.expectedPaymentDate.slice(0, 7);
        return cashMonth === state.activeMonth;
      });
    } else {
      scopedShifts = scopedShifts.filter(s => s.shiftDate.startsWith(state.activeMonth));
    }
  }

  // Apply sector filter if specified
  if (state.shiftSectorFilter && state.shiftSectorFilter !== "all") {
    scopedShifts = scopedShifts.filter(s => (s.sector || "UTI Neonatal") === state.shiftSectorFilter);
  }

  // Apply status filter
  let filtered = scopedShifts;
  if (state.shiftFilter !== "all") {
    filtered = filtered.filter(s => s.status === state.shiftFilter);
  }

  // Apply search
  if (state.shiftSearchQuery.trim()) {
    const q = state.shiftSearchQuery.toLowerCase();
    filtered = filtered.filter(s =>
      s.hospital.toLowerCase().includes(q) ||
      s.shiftType.toLowerCase().includes(q) ||
      (s.sector && s.sector.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      s.shiftDate.includes(q)
    );
  }

  const countAll = scopedShifts.length;
  const countPending = scopedShifts.filter(s => s.status === "pending").length;
  const countReceived = scopedShifts.filter(s => s.status === "received").length;
  const countDelayed = scopedShifts.filter(s => s.status === "delayed").length;

  const totalScopedNet = scopedShifts.reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);
  const totalScopedReceived = scopedShifts.filter(s => s.status === "received").reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);
  const totalScopedPending = totalScopedNet - totalScopedReceived;

  const html = `
    <div class="flex flex-col w-full gap-4 pb-28 pt-2">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-headline text-[22px] font-bold text-on-surface tracking-tight">Radar de Plantões</h1>
            <span class="text-secondary text-lg">🩺</span>
          </div>
          <p class="text-[12px] text-on-surface-variant mt-0.5">
            Acompanhe seus repasses e previsões D+30, D+60 e D+90
          </p>
        </div>
        <button
          type="button"
          class="pill-btn px-3 py-1.5 bg-gradient-to-r from-secondary to-primary text-white text-[12px] font-bold shadow-sm flex items-center gap-1 active:scale-95"
          id="btn-new-shift-top"
        >
          ${renderIcon("add", "text-[16px]")}
          Novo Plantão
        </button>
      </div>

      <!-- Scope Selector (All vs Active Month) -->
      <div class="flex items-center justify-between bg-surface-container-low p-1 rounded-full text-[12px] font-bold">
        <button
          type="button"
          class="scope-pill flex-1 py-1.5 px-3 rounded-full text-center transition-all ${!isScopeMonth ? 'bg-white text-secondary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-scope="all"
        >
          Todos os Plantões (${evaluatedShifts.length})
        </button>
        <button
          type="button"
          class="scope-pill flex-1 py-1.5 px-3 rounded-full text-center transition-all ${isScopeMonth ? 'bg-white text-secondary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-scope="month"
        >
          ${formatMonthYear(state.activeMonth)}
        </button>
      </div>

      <!-- View Controls Bar: View Mode Switcher (List vs Calendar) & Sector Filter -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-full text-[11px] font-bold">
          <button
            type="button"
            id="btn-view-mode-list"
            class="flex items-center gap-1 px-3 py-1 rounded-full transition-all ${state.shiftViewMode === 'list' ? 'bg-white text-secondary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            ${renderIcon("format_list_bulleted", "text-[14px]")}
            <span>Lista</span>
          </button>
          <button
            type="button"
            id="btn-view-mode-calendar"
            class="flex items-center gap-1 px-3 py-1 rounded-full transition-all ${state.shiftViewMode === 'calendar' ? 'bg-white text-secondary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            ${renderIcon("calendar_view_month", "text-[14px]")}
            <span>Calendário</span>
          </button>
        </div>

        <div class="flex items-center gap-1">
          <select
            id="select-shift-sector"
            class="text-[11px] font-semibold bg-surface-container-low text-on-surface-variant px-2.5 py-1.5 rounded-full border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all"
          >
            <option value="all" ${state.shiftSectorFilter === 'all' ? 'selected' : ''}>Todos os Setores</option>
            ${CLINICAL_SECTORS.map(sec => `
              <option value="${sec}" ${state.shiftSectorFilter === sec ? 'selected' : ''}>${sec}</option>
            `).join("")}
          </select>
        </div>
      </div>

      ${state.shiftViewMode === "calendar" ? `
        <!-- Modo Calendário Interativo -->
        ${renderShiftCalendarView(filtered, scopedShifts)}
      ` : `
        <!-- Modo Lista Convencional -->
        ${isScopeMonth ? `
          <!-- Month Regime Toggle -->
          <div class="flex items-center justify-between px-1">
            <span class="text-[11px] font-semibold text-on-surface-variant">Modo do Mês:</span>
            <div class="bg-surface-container p-0.5 rounded-full flex items-center text-[11px] font-bold">
              <button
                type="button"
                id="btn-shifts-caixa"
                class="px-2.5 py-1 rounded-full transition-all ${isCaixa ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
              >
                Caixa (Depósito D+90)
              </button>
              <button
                type="button"
                id="btn-shifts-competencia"
                class="px-2.5 py-1 rounded-full transition-all ${!isCaixa ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
              >
                Competência (Trabalhados)
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Search Input -->
        <div class="relative w-full">
          ${renderIcon("search", "absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 text-[20px] pointer-events-none")}
          <input
            type="text"
            id="shift-search-input"
            class="w-full h-11 pl-11 pr-4 bg-white text-on-surface placeholder:text-outline text-[13px] rounded-full shadow-[0_4px_16px_rgba(126,74,138,0.06)] border border-transparent focus:border-primary focus:outline-none transition-all"
            placeholder="Buscar por hospital, setor, nota ou data..."
            value="${state.shiftSearchQuery}"
          />
          ${state.shiftSearchQuery ? `
            <button id="btn-clear-search" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-[18px]">
              ${renderIcon("close", "text-[18px]")}
            </button>
          ` : ''}
        </div>

        <!-- Liquidity Radar Card -->
        <div class="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-white via-[#fbf8fd] to-primary-fixed/30 p-4 shadow-[0_10px_28px_rgba(126,74,138,0.09)] border border-purple-50">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <span class="inline-flex w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <span class="text-[11px] font-bold text-primary uppercase tracking-wider">
                ${isScopeMonth ? `Plantões de ${formatMonthYear(state.activeMonth)}` : 'Radar de Liquidez D+90'}
              </span>
            </div>
            <span class="text-[11px] font-semibold text-on-surface-variant bg-surface-container-highest/60 px-2.5 py-0.5 rounded-full">
              ${countAll} repasse(s)
            </span>
          </div>

          <div class="flex flex-col">
            <span class="text-[12px] text-on-surface-variant">
              ${isScopeMonth ? (isCaixa ? 'Total Previsto em Conta no Mês' : 'Produção Líquida do Mês') : 'Total Geral a Receber'}
            </span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-[28px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">
                ${formatMoney(isScopeMonth ? totalScopedNet : radar.totalToReceive)}
              </span>
            </div>
            ${isScopeMonth && isCaixa ? `
              <div class="flex items-center gap-2 mt-1 text-[11px]">
                <span class="font-bold text-tertiary">${formatMoney(totalScopedReceived)} recebidos</span>
                <span class="text-on-surface-variant">•</span>
                <span class="font-bold text-secondary">${formatMoney(totalScopedPending)} a receber</span>
              </div>
            ` : `
              <p class="text-[11px] text-on-surface-variant/80 mt-0.5 flex items-center gap-1">
                ${renderIcon("calendar_today", "text-[14px] text-tertiary")}
                Valores calculados com base no ciclo hospitalar de D+90
              </p>
            `}
          </div>

          ${!isScopeMonth ? `
            <!-- Micro-Timeline Bar -->
            <div class="mt-3 pt-2 border-t border-purple-100 flex flex-col gap-1.5">
              <div class="flex justify-between items-center text-[10px] text-on-surface-variant font-bold">
                <span>D+30: ${formatMoney(radar.d30Sum)}</span>
                <span>D+60: ${formatMoney(radar.d60Sum)}</span>
                <span>D+90+: ${formatMoney(radar.d90Sum)}</span>
              </div>
              <div class="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">
                <div class="bg-tertiary" style="width: ${radar.totalToReceive > 0 ? (radar.d30Sum / radar.totalToReceive * 100) : 33}%;"></div>
                <div class="bg-primary" style="width: ${radar.totalToReceive > 0 ? (radar.d60Sum / radar.totalToReceive * 100) : 33}%;"></div>
                <div class="bg-secondary" style="width: ${radar.totalToReceive > 0 ? (radar.d90Sum / radar.totalToReceive * 100) : 34}%;"></div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Quick Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto py-1 -mx-4 px-4 no-scrollbar">
          <button
            type="button"
            class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.shiftFilter === 'all' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant'}"
            data-filter="all"
          >
            Todos (${countAll})
          </button>
          <button
            type="button"
            class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.shiftFilter === 'pending' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant'}"
            data-filter="pending"
          >
            A Receber (${countPending})
          </button>
          <button
            type="button"
            class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.shiftFilter === 'delayed' ? 'bg-error text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant'}"
            data-filter="delayed"
          >
            Em Atraso (${countDelayed})
          </button>
          <button
            type="button"
            class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.shiftFilter === 'received' ? 'bg-tertiary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant'}"
            data-filter="received"
          >
            Recebidos (${countReceived})
          </button>
        </div>

        <!-- Shift Cards Feed -->
        <div class="flex flex-col gap-3 pt-1">
          ${filtered.length > 0 ? filtered.map(s => renderShiftCard(s, false)).join("") : `
            <div class="bg-white p-8 rounded-[24px] text-center text-on-surface-variant shadow-sm flex flex-col items-center">
              ${renderIcon("search_off", "text-[36px] text-primary/40 mb-2")}
              <p class="text-[14px] font-bold text-on-surface">Nenhum plantão encontrado</p>
              <p class="text-[12px] text-on-surface-variant mt-1">Tente alternar os filtros ou cadastrar uma nova escala.</p>
            </div>
          `}
        </div>
      `}
    </div>
  `;

  dom.mainContent.innerHTML = html;
  attachShiftsEvents();
}

/**
 * Renders the Interactive Monthly Calendar Grid for Medical Shifts
 */
function renderShiftCalendarView(filteredShifts, scopedShifts) {
  const [yearStr, monthStr] = state.activeMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayStr = getLocalDateString(state.referenceDate || new Date());

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  let gridHtml = `
    <div class="bg-white p-4 rounded-[24px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] border border-purple-50 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
            ${renderIcon("calendar_month", "text-[18px]")}
          </div>
          <div>
            <h2 class="text-[15px] font-bold text-on-surface capitalize">${formatMonthYear(state.activeMonth)}</h2>
            <p class="text-[11px] text-on-surface-variant">Toque no dia para ver plantões ou agendar</p>
          </div>
        </div>
        <button type="button" class="btn-quick-month-picker text-[11px] font-bold text-primary bg-primary-fixed/50 hover:bg-primary-fixed px-3 py-1 rounded-full transition-colors">
          Mudar Mês
        </button>
      </div>

      <!-- Weekday Headers -->
      <div class="calendar-grid text-center text-[11px] font-bold text-on-surface-variant/80 border-b border-purple-100 pb-1">
        ${daysOfWeek.map(d => `<span class="py-1">${d}</span>`).join("")}
      </div>

      <!-- Days Grid -->
      <div class="calendar-grid">
  `;

  // Leading empty cells
  for (let i = 0; i < firstDayIndex; i++) {
    gridHtml += `<div class="min-h-[52px] p-1 rounded-xl bg-surface-container-low/20 opacity-30"></div>`;
  }

  // Month days
  for (let day = 1; day <= totalDays; day++) {
    const dayPad = String(day).padStart(2, "0");
    const dateStr = `${yearStr}-${monthStr}-${dayPad}`;
    const isToday = dateStr === todayStr;
    const isSelected = state.calendarSelectedDate === dateStr;
    const dayShifts = filteredShifts.filter(s => s.shiftDate === dateStr);
    const hasShifts = dayShifts.length > 0;

    let cellClass = "calendar-day-cell";
    if (isToday) cellClass += " today";
    if (isSelected) cellClass += " selected";
    if (hasShifts) cellClass += " has-shift";

    gridHtml += `
      <div class="${cellClass}" data-date="${dateStr}" role="button" tabindex="0">
        <span class="day-num text-[11px] font-bold leading-none ${isToday ? 'text-primary' : isSelected ? 'text-secondary' : 'text-on-surface'}">
          ${day}
        </span>
        <div class="flex flex-col gap-0.5 w-full mt-1">
          ${dayShifts.slice(0, 2).map(s => {
            const ev = evaluateShiftStatus(s, state.referenceDate);
            const isDel = ev.status === "delayed";
            const isRec = ev.status === "received";
            const dotColor = isDel ? 'bg-error' : (isRec ? 'bg-tertiary' : 'bg-primary');
            const icon = s.shiftType.includes("Noturno") ? "🌙" : s.shiftType.includes("24h") ? "⏱️" : s.shiftType.includes("Sobreaviso") ? "📞" : "☀️";
            return `
              <div class="calendar-shift-badge truncate flex items-center gap-0.5" title="${s.hospital} (${s.shiftType})">
                <span class="w-1.5 h-1.5 rounded-full ${dotColor} shrink-0"></span>
                <span class="text-[9px] truncate">${icon} ${s.hospital.split(" ")[0]}</span>
              </div>
            `;
          }).join("")}
          ${dayShifts.length > 2 ? `
            <span class="text-[8px] font-bold text-secondary text-center">+${dayShifts.length - 2} mais</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  gridHtml += `
      </div>
    </div>
  `;

  // Selected date detail or all shifts
  const selectedDate = state.calendarSelectedDate;
  const activeDateShifts = selectedDate
    ? filteredShifts.filter(s => s.shiftDate === selectedDate)
    : [];

  gridHtml += `
    <div class="flex flex-col gap-3 mt-1">
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-1.5">
          <span class="font-headline text-[15px] font-bold text-on-surface">
            ${selectedDate ? `Plantões em ${formatDateBR(selectedDate)}` : `Plantões de ${formatMonthYear(state.activeMonth)}`}
          </span>
          ${selectedDate ? `
            <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
              ${activeDateShifts.length}
            </span>
          ` : ''}
        </div>

        ${selectedDate ? `
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-clear-calendar-selection"
              class="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface text-[11px] font-bold transition-colors"
            >
              Ver Mês Todo
            </button>
            <button
              type="button"
              id="btn-add-shift-on-day"
              data-date="${selectedDate}"
              class="px-3 py-1 rounded-full bg-secondary text-white text-[11px] font-bold shadow-sm active:scale-95 flex items-center gap-1"
            >
              ${renderIcon("add", "text-[14px]")}
              <span>Novo Neste Dia</span>
            </button>
          </div>
        ` : `
          <span class="text-[11px] text-on-surface-variant">Toque em um dia para filtrar</span>
        `}
      </div>

      <div class="flex flex-col gap-2.5">
        ${selectedDate ? (
          activeDateShifts.length > 0
            ? activeDateShifts.map(s => renderShiftCard(s, false)).join("")
            : `
              <div class="bg-white p-6 rounded-[20px] text-center text-on-surface-variant shadow-sm flex flex-col items-center gap-2">
                <span class="text-2xl">🩺</span>
                <p class="text-[13px] font-bold text-on-surface">Sem escala em ${formatDateBR(selectedDate)}</p>
                <p class="text-[11px] text-on-surface-variant">Deseja cadastrar um plantão ou sobreaviso para este dia?</p>
                <button
                  type="button"
                  id="btn-calendar-empty-add"
                  data-date="${selectedDate}"
                  class="mt-1 px-4 py-1.5 rounded-full bg-primary-fixed text-primary font-bold text-[12px] active:scale-95"
                >
                  + Cadastrar Plantão
                </button>
              </div>
            `
        ) : (
          filteredShifts.length > 0
            ? filteredShifts.map(s => renderShiftCard(s, false)).join("")
            : `
              <div class="bg-white p-6 rounded-[20px] text-center text-on-surface-variant shadow-sm">
                <p class="text-[13px] font-bold text-on-surface">Nenhum plantão neste filtro</p>
              </div>
            `
        )}
      </div>
    </div>
  `;

  return gridHtml;
}

/**
 * Renders an individual Shift card with 1-touch confirmation and actions
 */
function renderShiftCard(shift, isCompact = false) {
  const ev = evaluateShiftStatus(shift, state.referenceDate);
  const isDelayed = ev.status === "delayed";
  const isReceived = ev.status === "received";

  let statusBadgeClass = "badge-pending";
  let statusIcon = "schedule";
  if (isDelayed) {
    statusBadgeClass = "badge-delayed";
    statusIcon = "warning";
  } else if (isReceived) {
    statusBadgeClass = "badge-received";
    statusIcon = "check_circle";
  }

  const hourlyRate = calculateHourlyRate(shift.netValue, shift.shiftType);

  return `
    <article class="card-floating p-4 flex flex-col justify-between transition-all" data-shift-id="${shift.id}">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full ${isDelayed ? 'bg-error-container text-error' : isReceived ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-primary'} flex items-center justify-center shrink-0">
            ${renderIcon(
              shift.shiftType.includes("Noturno") ? "bedtime" : shift.shiftType.includes("24h") ? "timelapse" : "child_care",
              "text-[20px]"
            )}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h2 class="text-[15px] font-bold text-on-surface truncate">${shift.hospital}</h2>
              ${shift.sector ? `<span class="px-2 py-0.5 rounded-full bg-primary-fixed/60 text-primary text-[10px] font-bold">${shift.sector}</span>` : ''}
            </div>
            <p class="text-[12px] text-on-surface-variant truncate">
              ${formatDateBR(shift.shiftDate)} • ${shift.shiftType}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button type="button" class="btn-shift-swap w-7 h-7 rounded-full text-secondary hover:bg-secondary-fixed/50 flex items-center justify-center active:scale-90" data-id="${shift.id}" title="Troca de Plantão & Passagem no WhatsApp">
            ${renderIcon("swap_horiz", "text-[16px]")}
          </button>
          <button type="button" class="btn-duplicate-shift w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${shift.id}" title="Duplicar para a próxima semana">
            ${renderIcon("content_copy", "text-[15px]")}
          </button>
          <button type="button" class="btn-edit-shift w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${shift.id}" title="Editar">
            ${renderIcon("edit", "text-[15px]")}
          </button>
          <button type="button" class="btn-delete-shift w-7 h-7 rounded-full text-error/70 hover:bg-error-container/40 flex items-center justify-center active:scale-90" data-id="${shift.id}" title="Excluir">
            ${renderIcon("delete", "text-[15px]")}
          </button>
        </div>
      </div>

      <!-- Financial Information Row -->
      <div class="my-3 p-3 rounded-[16px] ${isDelayed ? 'bg-error-container/20' : 'bg-surface-container-low/60'} flex items-center justify-between">
        <div>
          <span class="text-[11px] text-on-surface-variant block">Valor Líquido</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-[16px] font-bold ${isDelayed ? 'text-error' : 'text-on-surface'} ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(shift.netValue)}</span>
            ${hourlyRate > 0 ? `
              <span class="${hourlyRate >= 150 ? 'badge-rate-gold' : 'badge-rate-mint'}">
                R$ ${hourlyRate}/h
              </span>
            ` : ''}
          </div>
        </div>
        <div class="text-right">
          <span class="text-[11px] text-outline block">Valor Bruto</span>
          <span class="text-[13px] text-on-surface-variant font-medium ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(shift.grossValue)}</span>
        </div>
      </div>

      ${shift.notes ? `
        <div class="mb-2.5 px-2.5 py-1.5 rounded-xl bg-surface-container-low/50 text-[11px] text-on-surface-variant flex items-center gap-1.5">
          ${renderIcon("sticky_note_2", "text-[14px] text-secondary shrink-0")}
          <span class="truncate italic">${shift.notes}</span>
        </div>
      ` : ''}

      <!-- Status Badge & 1-Touch Action Button -->
      <div class="flex items-center justify-between gap-2 pt-0.5">
        <span class="badge-status ${statusBadgeClass}">
          ${renderIcon(statusIcon, "text-[14px]")}
          ${ev.label}
        </span>

        <div class="flex items-center gap-1.5">
          ${isReceived ? `
            <button
              type="button"
              class="btn-view-voucher inline-flex items-center gap-1 bg-surface-container-low text-primary hover:bg-primary hover:text-white px-2.5 py-1.5 rounded-full text-[11px] font-bold active:scale-95 transition-all"
              data-id="${shift.id}"
              title="Ver recibo e comprovante de conciliação"
            >
              ${renderIcon("receipt_long", "text-[14px]")}
              Comprovante
            </button>
            <button
              type="button"
              class="btn-toggle-shift inline-flex items-center gap-1 bg-surface-container-highest text-on-surface-variant hover:text-error px-2.5 py-1.5 rounded-full text-[11px] font-bold active:scale-95 transition-all"
              data-id="${shift.id}"
              data-action="unmark"
              title="Marcar novamente como pendente"
            >
              ${renderIcon("undo", "text-[14px]")}
              Desfazer
            </button>
          ` : `
            <button
              type="button"
              class="btn-toggle-shift inline-flex items-center gap-1 bg-tertiary hover:bg-tertiary/90 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-[0_4px_12px_rgba(0,106,98,0.25)] active:scale-95 transition-all shrink-0"
              data-id="${shift.id}"
              data-action="receive"
            >
              ${renderIcon("check", "text-[15px]")}
              Marcar como Recebido
            </button>
          `}
        </div>
      </div>

      ${isDelayed ? `
        <div class="mt-2.5 pt-2 border-t border-error/15 flex items-center justify-between gap-2">
          <button
            type="button"
            class="btn-notify-delay w-full py-2 rounded-full bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors active:scale-98"
            data-id="${shift.id}"
            data-hospital="${shift.hospital}"
          >
            ${renderIcon("forward_to_inbox", "text-[15px]")}
            <span>Cobrar Repasse / Notificar Setor</span>
          </button>
        </div>
      ` : ''}
    </article>
  `;
}

/**
 * View 3: Controle de Despesas
 */
function renderExpensesView() {
  const report = state.store.getMonthlyReport(state.activeMonth, state.referenceDate);
  const expenses = report.expenses.list;
  const budget = report.expenses.budgetLimit;
  const spent = report.expenses.total;
  const usagePercent = report.expenses.budgetUsagePercent;
  const remaining = Math.max(0, budget - spent);

  // Apply filter
  let filtered = expenses;
  if (state.expenseFilter === "fixa") {
    filtered = filtered.filter(e => e.type === "fixed");
  } else if (state.expenseFilter === "variavel") {
    filtered = filtered.filter(e => e.type === "variable");
  }

  const countAll = expenses.length;
  const countFixas = expenses.filter(e => e.type === "fixed").length;
  const countVars = expenses.filter(e => e.type === "variable").length;

  const html = `
    <div class="flex flex-col w-full gap-4 pb-28 pt-2">
      <!-- Subheader & Quick Action -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <h1 class="font-headline text-[22px] font-bold text-on-surface">Despesas & Rotina</h1>
            <span class="text-[20px]">🧾</span>
          </div>
          <p class="text-[12px] text-on-surface-variant">Gestão dos custos pediátricos em ${formatMonthYear(state.activeMonth)}</p>
        </div>
        <button
          type="button"
          class="pill-btn px-3.5 py-2 rounded-full bg-gradient-to-r from-secondary to-primary text-white text-[12px] font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
          id="btn-new-expense-top"
        >
          ${renderIcon("add", "text-[16px]")}
          Nova Despesa
        </button>
      </div>

      <!-- Budget Tracker Card (Teto de Gastos com Linha de 80%) -->
      <div class="relative overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(171,71,188,0.08)]">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-fixed/60 flex items-center justify-center text-primary">
              ${renderIcon("pie_chart", "text-[18px]")}
            </div>
            <span class="text-[15px] font-bold text-on-surface">Teto de Gastos de ${formatMonthYear(state.activeMonth)}</span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
            ${usagePercent}% utilizado
          </span>
        </div>

        <div class="flex items-baseline gap-1.5 pt-1">
          <span class="text-[26px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(spent)}</span>
          <span class="text-[12px] text-on-surface-variant">/ ${formatMoney(budget)} estipulado</span>
        </div>

        <!-- Custom Progress Bar with 80% Threshold Mark -->
        <div class="relative w-full h-3 rounded-full bg-surface-container overflow-visible my-3">
          <div
            class="h-full rounded-full bg-gradient-to-r from-secondary-container via-primary-container to-primary transition-all duration-500"
            style="width: ${Math.min(usagePercent, 100)}%;"
          ></div>
          <div class="absolute top-0 bottom-0 left-[80%] w-0.5 bg-outline/60 z-10 flex flex-col items-center">
            <span class="absolute -top-3.5 text-[9px] font-bold text-on-surface-variant tracking-tighter">80%</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full ${usagePercent > 80 ? 'bg-error' : 'bg-tertiary'}"></div>
          <p class="text-[12px] text-on-surface-variant">
            ${usagePercent > 80
              ? `Atenção: Você atingiu <span class="font-bold text-error">${usagePercent}%</span> do teto mensal.`
              : `Você ainda pode utilizar <span class="font-bold text-tertiary">${formatMoney(remaining)}</span> com tranquilidade.`
            }
          </p>
        </div>
      </div>

      <!-- Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        <button
          type="button"
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="all"
        >
          Todas (${countAll})
        </button>
        <button
          type="button"
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'fixa' ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="fixa"
        >
          Fixas (${countFixas})
        </button>
        <button
          type="button"
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'variavel' ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="variavel"
        >
          Variáveis (${countVars})
        </button>
      </div>

      <!-- Expense List -->
      <div class="flex flex-col gap-2.5">
        ${filtered.length > 0 ? filtered.map(e => renderExpenseCard(e)).join("") : `
          <div class="bg-white p-8 rounded-[24px] text-center text-on-surface-variant shadow-sm flex flex-col items-center">
            ${renderIcon("receipt", "text-[36px] text-primary/40 mb-2")}
            <p class="text-[14px] font-bold text-on-surface">Nenhuma despesa para este filtro</p>
            <p class="text-[12px] text-on-surface-variant mt-1">Cadastre uma nova despesa usando o botão acima.</p>
          </div>
        `}
      </div>

      <!-- Export & Statement Action Card -->
      <div class="rounded-[20px] bg-surface-container-low p-4 flex items-center justify-between shadow-sm mt-2">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
            ${renderIcon("assignment", "text-[20px]")}
          </div>
          <div class="flex flex-col">
            <span class="text-[13px] font-bold text-on-surface">Fechamento Pediátrico</span>
            <span class="text-[11px] text-on-surface-variant">Exportar ou Imprimir ${formatMonthYear(state.activeMonth)}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="btn-open-printable-statement px-3 py-1.5 rounded-full bg-white text-primary hover:text-secondary text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1" title="Extrato para Impressão">
            ${renderIcon("print", "text-[15px]")}
            <span>Imprimir</span>
          </button>
          <button type="button" class="btn-export-csv px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1" title="Exportar CSV">
            ${renderIcon("table_chart", "text-[15px]")}
            <span>Excel</span>
          </button>
        </div>
      </div>
    </div>
  `;

  dom.mainContent.innerHTML = html;
  attachExpensesEvents();
}

/**
 * Renders an individual Expense card with 1-touch toggle and action menu
 */
function renderExpenseCard(expense) {
  const color = CATEGORY_COLORS[expense.category] || "#CE93D8";
  const icon = CATEGORY_ICONS[expense.category] || "receipt_long";

  // Calculate due status
  const refDate = state.referenceDate ? getLocalDateString(state.referenceDate) : getLocalDateString(new Date());
  const isOverdue = !expense.isPaid && expense.dueDate && expense.dueDate < refDate;
  const isDueToday = !expense.isPaid && expense.dueDate && expense.dueDate === refDate;

  let dueBadgeText = `Vence ${formatDateBR(expense.dueDate)}`;
  let dueBadgeClass = "text-on-surface-variant";
  if (expense.isPaid) {
    dueBadgeText = `Vencimento ${formatDateBR(expense.dueDate)}`;
  } else if (isDueToday) {
    dueBadgeText = `Vence hoje! ⚠️`;
    dueBadgeClass = "text-secondary font-bold";
  } else if (isOverdue) {
    const diffDays = Math.max(1, Math.round((new Date(refDate + 'T12:00:00') - new Date(expense.dueDate + 'T12:00:00')) / (1000 * 60 * 60 * 24)));
    dueBadgeText = `Vencida há ${diffDays}d 🚨`;
    dueBadgeClass = "text-error font-bold";
  }

  return `
    <div class="card-floating p-3.5 flex items-center justify-between" data-expense-id="${expense.id}">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background-color: ${color}20; color: ${color};">
          ${renderIcon(icon, "text-[20px]")}
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-[14px] font-semibold text-on-surface truncate">${expense.description}</span>
          <div class="flex items-center gap-2 mt-0.5 text-[11px] ${dueBadgeClass}">
            <span class="capitalize text-on-surface-variant">${expense.type === 'fixed' ? 'Fixa' : 'Variável'}</span>
            <span class="text-on-surface-variant">•</span>
            <span>${dueBadgeText}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end shrink-0 ml-3">
        <span class="text-[14px] font-bold ${isOverdue ? 'text-error' : 'text-on-surface'} ${state.privacyMode ? 'privacy-masked-text' : ''}">- ${formatMoney(expense.value)}</span>
        <button
          type="button"
          class="btn-toggle-expense-paid mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${expense.isPaid ? 'bg-tertiary-fixed text-on-tertiary-fixed' : (isOverdue ? 'bg-error-container text-error' : 'bg-primary-fixed text-on-primary-fixed')}"
          data-id="${expense.id}"
        >
          ${expense.isPaid ? 'Pago ✓' : (isOverdue ? 'Em Atraso' : 'A pagar')}
        </button>
      </div>

      <div class="flex items-center gap-0.5 ml-2">
        <button type="button" class="btn-duplicate-expense w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${expense.id}" title="Duplicar para o próximo mês">
          ${renderIcon("content_copy", "text-[15px]")}
        </button>
        <button type="button" class="btn-edit-expense w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${expense.id}" title="Editar">
          ${renderIcon("edit", "text-[15px]")}
        </button>
        <button type="button" class="btn-delete-expense w-7 h-7 rounded-full text-error/60 hover:bg-error-container/40 flex items-center justify-center active:scale-90" data-id="${expense.id}" title="Excluir">
          ${renderIcon("delete", "text-[15px]")}
        </button>
      </div>
    </div>
  `;
}

/**
 * View 4: Relatórios & Comparativo Contábil
 */
function renderReportsView() {
  const report = state.store.getMonthlyReport(state.activeMonth, state.referenceDate);
  const hospitalAnalytics = state.store.getHospitalAnalytics();
  const taxSim = state.store.getTaxSavingsSummary(state.activeMonth);
  const wellbeing = state.store.getDoctorWellbeingMetrics(state.activeMonth);

  const html = `
    <div class="flex flex-col w-full gap-4 pb-28 pt-2">
      <!-- Header with Printable Statement Action -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-headline text-[22px] font-bold text-on-surface">Inteligência Financeira</h1>
          <p class="text-[12px] text-on-surface-variant">Análise contábil, tributária e ritmo de vida</p>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="btn-open-printable-statement px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1"
            title="Abrir Extrato Completo para Impressão ou PDF"
          >
            ${renderIcon("print", "text-[15px]")}
            <span>Extrato</span>
          </button>
        </div>
      </div>

      <!-- Simulador Tributário Médico (PJ Simples Nacional vs RPA) -->
      <div class="card-floating p-4 flex flex-col gap-3 bg-gradient-to-br from-white via-surface-container-lowest to-secondary-fixed/20 border border-purple-50">
        <div class="flex items-center justify-between border-b border-purple-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
              ${renderIcon("account_balance", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Simulador Tributário Médico</h2>
              <span class="text-[11px] text-secondary font-semibold">PJ Simples Nacional vs RPA (Pessoa Física)</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
            Economia de ${taxSim.savingsPercent}%
          </span>
        </div>

        <div class="flex flex-col gap-2 pt-1">
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col">
              <span class="text-[10px] text-on-surface-variant font-bold uppercase">PJ Simples (~6%)</span>
              <span class="text-[16px] font-bold text-tertiary font-display mt-0.5 ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(taxSim.pjTaxSimples)}</span>
              <span class="text-[9px] text-on-surface-variant">Anexo III (Fator R)</span>
            </div>
            <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col">
              <span class="text-[10px] text-on-surface-variant font-bold uppercase">RPA / PF (~27.5%)</span>
              <span class="text-[16px] font-bold text-error font-display mt-0.5 ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(taxSim.pfTaxRPA)}</span>
              <span class="text-[9px] text-on-surface-variant">Carnê-Leão + IRRF</span>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-secondary-fixed/30 border border-secondary/20 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[11px] font-bold text-secondary uppercase">Economia Mensal Estimada</span>
              <span class="text-[20px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(taxSim.monthlySavings)}</span>
            </div>
            <div class="text-right flex flex-col">
              <span class="text-[10px] text-on-surface-variant">Projeção 12 Meses</span>
              <span class="text-[15px] font-bold text-secondary font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(taxSim.annualProjectedSavings)}</span>
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-purple-50/80 text-[11px] text-on-surface-variant flex items-start gap-2">
            ${renderIcon("lightbulb", "text-[16px] text-primary shrink-0 mt-0.5")}
            <div>
              <strong class="text-primary">Estratégia Fator R (28%):</strong> Mantenha seu pró-labore em aprox. <strong>${formatMoney(taxSim.recommendedProLabore)}</strong>/mês para garantir a tributação médica reduzida de 6% no Simples.
            </div>
          </div>
        </div>
      </div>

      <!-- Comparativo Caixa vs Competência Card -->
      <div class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-purple-100 pb-2">
          <h2 class="text-[15px] font-bold text-on-surface">Comparativo Contábil</h2>
          <span class="text-[11px] font-semibold text-primary">${formatMonthYear(state.activeMonth)}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-1">
          <!-- Regime de Caixa Column -->
          <div class="p-3 rounded-2xl bg-surface-container-low flex flex-col gap-1">
            <span class="text-[11px] font-bold text-secondary uppercase">Regime de Caixa</span>
            <span class="text-[18px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(report.caixa.netBalance)}</span>
            <span class="text-[10px] text-on-surface-variant leading-tight mt-1">
              Entradas em conta menos despesas pagas/vencidas neste mês.
            </span>
          </div>

          <!-- Regime de Competência Column -->
          <div class="p-3 rounded-2xl bg-primary-fixed/30 flex flex-col gap-1">
            <span class="text-[11px] font-bold text-primary uppercase">Competência</span>
            <span class="text-[18px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(report.competencia.netBalance)}</span>
            <span class="text-[10px] text-on-surface-variant leading-tight mt-1">
              Produção real de plantões trabalhados neste mês menos despesas.
            </span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-purple-50 text-[11px] text-on-surface-variant flex items-start gap-2 mt-1">
          ${renderIcon("info", "text-[16px] text-primary shrink-0")}
          <span>
            A regra de <strong>D+90</strong> faz com que o trabalho de 3 meses atrás compense no caixa deste mês. Use a Competência para avaliar seu ritmo de trabalho e o Caixa para honrar seus compromissos.
          </span>
        </div>
      </div>

      <!-- Termômetro de Bem-Estar e Descanso (CFM & Flo Health) -->
      <div class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-purple-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full ${wellbeing.fatigueLevel === 'high' ? 'bg-error-container text-error' : wellbeing.fatigueLevel === 'moderate' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'} flex items-center justify-center">
              ${renderIcon(wellbeing.fatigueLevel === 'high' ? 'health_and_safety' : 'self_improvement', 'text-[18px]')}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Termômetro de Bem-Estar</h2>
              <span class="text-[11px] text-on-surface-variant">Monitoramento de Fadiga & Recuperação</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full ${wellbeing.fatigueLevel === 'high' ? 'bg-error-container text-error' : wellbeing.fatigueLevel === 'moderate' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'} text-[11px] font-bold">
            ${wellbeing.statusBadge}
          </span>
        </div>

        <p class="text-[12px] text-on-surface-variant leading-relaxed">
          ${wellbeing.message}
        </p>

        <div class="grid grid-cols-3 gap-2 pt-1 text-center">
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col items-center">
            <span class="text-[10px] text-on-surface-variant">Noites Trabalhadas</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${wellbeing.nightShiftsCount}</span>
            <span class="text-[9px] text-secondary">plantões noturnos</span>
          </div>
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col items-center">
            <span class="text-[10px] text-on-surface-variant">Plantões 24h</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${wellbeing.shifts24hCount}</span>
            <span class="text-[9px] text-tertiary">escalas duplas</span>
          </div>
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col items-center">
            <span class="text-[10px] text-on-surface-variant">Consecutivos Máx</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${wellbeing.maxConsecutiveDays}d</span>
            <span class="text-[9px] text-primary">dias seguidos</span>
          </div>
        </div>
      </div>

      <!-- Carga Horária & Rentabilidade Média -->
      <div class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
              ${renderIcon("speed", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Carga Horária & Produtividade</h2>
              <span class="text-[11px] text-on-surface-variant">${formatMonthYear(state.activeMonth)}</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
            ${report.workload.totalHours}h dedicadas
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2 pt-1 text-center">
          <div class="p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center">
            <span class="text-[10px] text-on-surface-variant font-medium">Escalas</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${report.competencia.shiftsCount}</span>
            <span class="text-[9px] text-secondary font-semibold">plantões</span>
          </div>
          <div class="p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center">
            <span class="text-[10px] text-on-surface-variant font-medium">Rentabilidade</span>
            <span class="text-[16px] font-bold text-primary mt-0.5">R$ ${report.workload.averageHourlyRate}</span>
            <span class="text-[9px] text-primary font-semibold">por hora</span>
          </div>
          <div class="p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center">
            <span class="text-[10px] text-on-surface-variant font-medium">Média Semanal</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${Math.round(report.workload.totalHours / 4.3)}h</span>
            <span class="text-[9px] text-tertiary font-semibold">por semana</span>
          </div>
        </div>
      </div>

      <!-- Ranking e Indicadores por Hospital -->
      <div class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <h2 class="text-[15px] font-bold text-on-surface">Analytics por Instituição</h2>
            <span class="text-secondary text-sm">🏥</span>
          </div>
          <span class="text-[11px] text-on-surface-variant">${hospitalAnalytics.length} hospitais</span>
        </div>

        <div class="flex flex-col gap-3 pt-1">
          ${hospitalAnalytics.length > 0 ? hospitalAnalytics.map(h => `
            <div class="p-3 rounded-2xl bg-surface-container-low/60 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                  <span class="font-bold text-[13px] text-on-surface truncate">${h.hospital}</span>
                </div>
                <span class="font-bold text-[13px] text-primary ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(h.totalNet)}</span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5 border-t border-purple-100/60">
                <span class="flex items-center gap-1">
                  ${renderIcon("schedule", "text-[13px] text-tertiary")}
                  ${h.shiftsCount} plantões (${h.totalHours}h)
                </span>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${h.averageHourlyRate >= 150 ? 'badge-rate-gold' : 'badge-rate-mint'}">
                    R$ ${h.averageHourlyRate}/h
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold text-on-surface">
                    ${h.punctualityRate}% pontual
                  </span>
                </div>
              </div>
            </div>
          `).join("") : `
            <p class="text-[12px] text-on-surface-variant text-center py-2">Nenhum plantão cadastrado para gerar estatísticas.</p>
          `}
        </div>
      </div>

      <!-- Gerenciamento e Exportação de Dados -->
      <div class="rounded-[24px] bg-white p-4 shadow-sm flex flex-col gap-3">
        <div>
          <h3 class="text-[14px] font-bold text-on-surface">Central de Relatórios & Backup</h3>
          <p class="text-[11px] text-on-surface-variant mt-0.5">Exporte seus extratos ou gerencie o armazenamento local seguro.</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn-open-printable-statement p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
            ${renderIcon("print", "text-[16px] text-primary")}
            <span>Extrato Impresso</span>
          </button>
          <button type="button" class="btn-export-csv p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
            ${renderIcon("table_chart", "text-[16px] text-tertiary")}
            <span>Planilha Excel (.CSV)</span>
          </button>
          <button type="button" class="btn-export-json p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
            ${renderIcon("file_download", "text-[16px] text-secondary")}
            <span>Download JSON</span>
          </button>
          <button type="button" class="btn-load-demo p-2.5 rounded-2xl bg-primary-fixed hover:bg-primary-fixed/80 text-primary text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
            ${renderIcon("play_circle", "text-[16px]")}
            <span>Carregar Exemplo</span>
          </button>
        </div>
        <div class="pt-1">
          <button type="button" class="btn-reset-data w-full py-2 rounded-full bg-error-container/40 text-error hover:bg-error-container/60 text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1">
            ${renderIcon("delete_sweep", "text-[15px]")}
            <span>Limpar Todos os Dados</span>
          </button>
        </div>
      </div>
    </div>
  `;

  dom.mainContent.innerHTML = html;
  attachReportsEvents();
}

// ----------------------------------------------------
// EVENT HANDLERS & INTERACTIONS
// ----------------------------------------------------

function attachDashboardEvents() {
  const btnCaixa = document.getElementById("btn-regime-caixa");
  const btnComp = document.getElementById("btn-regime-competencia");
  if (btnCaixa && btnComp) {
    btnCaixa.addEventListener("click", () => {
      state.currentRegime = "caixa";
      renderDashboardView();
    });
    btnComp.addEventListener("click", () => {
      state.currentRegime = "competencia";
      renderDashboardView();
    });
  }

  const btnEditGoal = document.getElementById("btn-edit-monthly-goal");
  if (btnEditGoal) {
    btnEditGoal.addEventListener("click", () => {
      openDoctorProfileDialog();
    });
  }

  const btnSeeShifts = document.getElementById("btn-see-all-shifts");
  if (btnSeeShifts) {
    btnSeeShifts.addEventListener("click", () => switchTab("plantoes"));
  }

  const btnSeeExpenses = document.getElementById("btn-see-all-expenses");
  if (btnSeeExpenses) {
    btnSeeExpenses.addEventListener("click", () => switchTab("despesas"));
  }

  const cardSalary = document.getElementById("card-fixed-salary");
  if (cardSalary) {
    cardSalary.addEventListener("click", () => {
      openBottomSheet("salario", state.store.data.fixedSalaries[0] || null);
    });
  }

  const btnFilterDelayed = document.querySelector(".btn-filter-delayed");
  if (btnFilterDelayed) {
    btnFilterDelayed.addEventListener("click", () => {
      state.shiftFilter = "delayed";
      state.shiftScope = "all";
      switchTab("plantoes");
    });
  }

  const btnDashAdd = document.querySelector(".btn-dashboard-add-shift");
  if (btnDashAdd) {
    btnDashAdd.addEventListener("click", () => openBottomSheet("plantao"));
  }

  attachCardActionEvents();
}

function attachShiftsEvents() {
  const searchInput = document.getElementById("shift-search-input");
  const clearBtn = document.getElementById("btn-clear-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.shiftSearchQuery = e.target.value;
      renderShiftsView();
      // Keep focus
      const input = document.getElementById("shift-search-input");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.shiftSearchQuery = "";
      renderShiftsView();
    });
  }

  // Scope switcher (all vs month)
  document.querySelectorAll(".scope-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      state.shiftScope = btn.getAttribute("data-scope");
      renderShiftsView();
    });
  });

  // View mode switcher (List vs Calendar)
  const btnViewList = document.getElementById("btn-view-mode-list");
  const btnViewCal = document.getElementById("btn-view-mode-calendar");
  if (btnViewList) {
    btnViewList.addEventListener("click", () => {
      state.shiftViewMode = "list";
      renderShiftsView();
    });
  }
  if (btnViewCal) {
    btnViewCal.addEventListener("click", () => {
      state.shiftViewMode = "calendar";
      renderShiftsView();
    });
  }

  // Sector filter select
  const sectorSelect = document.getElementById("select-shift-sector");
  if (sectorSelect) {
    sectorSelect.addEventListener("change", (e) => {
      state.shiftSectorFilter = e.target.value;
      renderShiftsView();
    });
  }

  // Shifts regime buttons
  const btnShiftsCaixa = document.getElementById("btn-shifts-caixa");
  const btnShiftsComp = document.getElementById("btn-shifts-competencia");
  if (btnShiftsCaixa) {
    btnShiftsCaixa.addEventListener("click", () => {
      state.currentRegime = "caixa";
      renderShiftsView();
    });
  }
  if (btnShiftsComp) {
    btnShiftsComp.addEventListener("click", () => {
      state.currentRegime = "competencia";
      renderShiftsView();
    });
  }

  const filterBtns = document.querySelectorAll(".filter-pill");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.shiftFilter = btn.getAttribute("data-filter");
      renderShiftsView();
    });
  });

  // Calendar day cells click
  // Calendar day cells click & keyboard support
  document.querySelectorAll(".calendar-day-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      const dateStr = cell.getAttribute("data-date");
      if (dateStr) {
        state.calendarSelectedDate = (state.calendarSelectedDate === dateStr) ? null : dateStr;
        renderShiftsView();
      }
    });

    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cell.click();
      }
    });
  });

  // Calendar "Ver Mês Todo"
  const btnClearCal = document.getElementById("btn-clear-calendar-selection");
  if (btnClearCal) {
    btnClearCal.addEventListener("click", () => {
      state.calendarSelectedDate = null;
      renderShiftsView();
    });
  }

  // Calendar "Mudar Mês" button
  document.querySelectorAll(".btn-quick-month-picker").forEach(btn => {
    btn.addEventListener("click", openQuickMonthPickerDialog);
  });

  // Calendar "Novo Neste Dia"
  const btnAddOnDay = document.getElementById("btn-add-shift-on-day");
  if (btnAddOnDay) {
    btnAddOnDay.addEventListener("click", () => {
      const targetDate = btnAddOnDay.getAttribute("data-date") || state.calendarSelectedDate;
      openBottomSheet("plantao", targetDate ? { shiftDate: targetDate } : null);
    });
  }

  const btnCalEmptyAdd = document.getElementById("btn-calendar-empty-add");
  if (btnCalEmptyAdd) {
    btnCalEmptyAdd.addEventListener("click", () => {
      const targetDate = btnCalEmptyAdd.getAttribute("data-date") || state.calendarSelectedDate;
      openBottomSheet("plantao", targetDate ? { shiftDate: targetDate } : null);
    });
  }

  const btnNewTop = document.getElementById("btn-new-shift-top");
  if (btnNewTop) {
    btnNewTop.addEventListener("click", () => openBottomSheet("plantao"));
  }

  attachCardActionEvents();
}

function attachExpensesEvents() {
  const filterBtns = document.querySelectorAll(".filter-pill");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.expenseFilter = btn.getAttribute("data-filter");
      renderExpensesView();
    });
  });

  const btnNewTop = document.getElementById("btn-new-expense-top");
  if (btnNewTop) {
    btnNewTop.addEventListener("click", () => openBottomSheet("despesa"));
  }

  const exportBtns = document.querySelectorAll(".btn-export-json");
  exportBtns.forEach(btn => btn.addEventListener("click", exportDataJSON));

  const exportCsvBtns = document.querySelectorAll(".btn-export-csv");
  exportCsvBtns.forEach(btn => btn.addEventListener("click", () => exportDataCSV()));

  const statementBtns = document.querySelectorAll(".btn-open-printable-statement");
  statementBtns.forEach(btn => btn.addEventListener("click", openPrintableStatementDialog));

  attachCardActionEvents();
}

function attachReportsEvents() {
  const btnReset = document.querySelector(".btn-reset-data");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      showConfirmDialog({
        title: "Limpar Todos os Dados?",
        message: "Deseja limpar todos os plantões e despesas cadastrados para começar do zero?",
        confirmText: "Sim, Limpar Tudo",
        isDanger: true,
        onConfirm: () => {
          state.store.resetToDefault();
          showToast("Dados limpos com sucesso! 🌸");
          renderCurrentView();
        }
      });
    });
  }

  const btnLoadDemo = document.querySelector(".btn-load-demo");
  if (btnLoadDemo) {
    btnLoadDemo.addEventListener("click", () => {
      state.store.loadDemoData();
      showToast("Exemplo demonstrativo carregado com sucesso! 🌸");
      renderCurrentView();
    });
  }

  const exportBtns = document.querySelectorAll(".btn-export-json");
  exportBtns.forEach(btn => btn.addEventListener("click", exportDataJSON));

  const exportCsvBtns = document.querySelectorAll(".btn-export-csv");
  exportCsvBtns.forEach(btn => btn.addEventListener("click", () => exportDataCSV()));

  const statementBtns = document.querySelectorAll(".btn-open-printable-statement");
  statementBtns.forEach(btn => btn.addEventListener("click", openPrintableStatementDialog));
}

function attachCardActionEvents() {
  // Shift Swap & Handover via WhatsApp
  document.querySelectorAll(".btn-shift-swap").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      openShiftSwapDialog(id);
    });
  });

  // 1-Touch Shift Toggle (Receive / Unmark)
  document.querySelectorAll(".btn-toggle-shift").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");

      if (action === "receive") {
        const updated = state.store.markShiftAsReceived(id);
        if (updated) {
          showToast(`Repasse de ${formatMoney(updated.netValue)} confirmado em conta! 💖`, "check_circle");
        }
      } else {
        state.store.unmarkShiftAsReceived(id);
        showToast("Plantão marcado como pendente.", "schedule");
      }
      renderCurrentView();
    });
  });

  // Duplicate Shift (1-Touch)
  document.querySelectorAll(".btn-duplicate-shift").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const duplicated = state.store.duplicateShift(id);
      if (duplicated) {
        showToast(`Escala duplicada para ${formatDateBR(duplicated.shiftDate)}! 🌸`);
        renderCurrentView();
      }
    });
  });

  // View Shift Voucher / Receipt
  document.querySelectorAll(".btn-view-voucher").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      openShiftVoucherDialog(id);
    });
  });

  // Edit Shift
  document.querySelectorAll(".btn-edit-shift").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const shift = state.store.data.shifts.find(s => s.id === id);
      if (shift) {
        state.editingItem = { type: "shift", data: shift };
        openBottomSheet("plantao", shift);
      }
    });
  });

  // Delete Shift with iOS styled dialog
  document.querySelectorAll(".btn-delete-shift").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const shift = state.store.data.shifts.find(s => s.id === id);
      showConfirmDialog({
        title: "Excluir Plantão?",
        message: `Deseja remover o plantão de ${shift ? shift.hospital : 'hospital'} (${shift ? formatDateBR(shift.shiftDate) : ''}) do radar financeiro?`,
        confirmText: "Sim, Excluir",
        isDanger: true,
        onConfirm: () => {
          state.store.deleteShift(id);
          showToast("Plantão removido com sucesso.", "delete");
          renderCurrentView();
        }
      });
    });
  });

  // Notify Delay (WhatsApp & Direct Hospital Modal)
  document.querySelectorAll(".btn-notify-delay").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      if (id) {
        openHospitalDelayDialog(id);
      } else {
        const hospital = btn.getAttribute("data-hospital");
        const found = state.store.data.shifts.find(s => s.hospital === hospital && s.status === "delayed");
        if (found) {
          openHospitalDelayDialog(found.id);
        } else {
          showToast(`Cobrança encaminhada ao faturamento do ${hospital}! 📩`);
        }
      }
    });
  });

  // 1-Touch Expense Toggle (Paid / Pending)
  document.querySelectorAll(".btn-toggle-expense-paid").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const expense = state.store.toggleExpensePaid(id);
      if (expense) {
        showToast(expense.isPaid ? "Despesa marcada como paga! ✓" : "Despesa marcada como a pagar.", "receipt");
      }
      renderCurrentView();
    });
  });

  // Duplicate Expense to Next Month
  document.querySelectorAll(".btn-duplicate-expense").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const duplicated = state.store.duplicateExpense(id);
      if (duplicated) {
        showToast(`Despesa duplicada para ${formatDateBR(duplicated.dueDate)}! 🧾`);
        renderCurrentView();
      }
    });
  });

  // Edit Expense
  document.querySelectorAll(".btn-edit-expense").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const expense = state.store.data.expenses.find(x => x.id === id);
      if (expense) {
        state.editingItem = { type: "despesa", data: expense };
        openBottomSheet("despesa", expense);
      }
    });
  });

  // Delete Expense with iOS styled dialog
  document.querySelectorAll(".btn-delete-expense").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const exp = state.store.data.expenses.find(x => x.id === id);
      showConfirmDialog({
        title: "Excluir Despesa?",
        message: `Deseja remover a despesa '${exp ? exp.description : ''}' (${exp ? formatMoney(exp.value) : ''})?`,
        confirmText: "Sim, Excluir",
        isDanger: true,
        onConfirm: () => {
          state.store.deleteExpense(id);
          showToast("Despesa removida com sucesso.", "delete");
          renderCurrentView();
        }
      });
    });
  });
}

function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.store.data, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `pediatria_financeiro_${state.activeMonth}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Relatório exportado em JSON! 📁");
}

export function exportDataCSV(monthStr = null, onlyCurrentMonth = false) {
  const targetMonth = monthStr || state.activeMonth;
  const csvContent = state.store.generateCSV(targetMonth, { onlyMonth: onlyCurrentMonth });
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", `extrato_pediatrico_${targetMonth}${onlyCurrentMonth ? '_mensal' : ''}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
  showToast("Planilha CSV exportada com sucesso! 📊");
}

// ----------------------------------------------------
// BOTTOM SHEET MODAL (NOVO LANÇAMENTO)
// ----------------------------------------------------

export function openBottomSheet(tab = "plantao", editData = null) {
  state.activeModalTab = tab;
  state.editingItem = editData ? { type: tab, data: editData } : null;

  renderBottomSheetContent();
  dom.bottomSheet.classList.add("active");
  dom.modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

export function closeBottomSheet() {
  dom.bottomSheet.classList.remove("active");
  dom.modalOverlay.classList.remove("active");
  dom.bottomSheet.style.transform = "";
  dom.bottomSheet.style.transition = "";
  document.body.style.overflow = "";
  state.editingItem = null;
}

function renderBottomSheetContent() {
  const isEditing = Boolean(state.editingItem && state.editingItem.data && state.editingItem.data.id);
  const editData = state.editingItem ? state.editingItem.data : null;

  const html = `
    <div class="px-5 pt-1 pb-8 flex flex-col">
      <!-- Drag Handle -->
      <div class="sheet-handle"></div>

      <!-- Header Section -->
      <div class="flex items-center justify-between pb-3">
        <div class="flex items-center gap-2">
          <h2 class="font-headline text-[20px] font-bold text-on-surface">
            ${isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <span class="text-secondary">✨</span>
        </div>
        <button
          type="button"
          id="btn-close-sheet"
          class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container active:scale-95 transition-transform"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Category Segmented Control Switcher -->
      <div class="bg-surface-container-low p-1 rounded-full flex items-center gap-1 mb-4">
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-2 rounded-full text-[12px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'plantao' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="plantao"
        >
          <span class="material-symbols-outlined text-[16px]">stethoscope</span>
          <span>Plantão</span>
        </button>
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-2 rounded-full text-[12px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'salario' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="salario"
        >
          <span class="material-symbols-outlined text-[16px]">work</span>
          <span>Salário</span>
        </button>
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-2 rounded-full text-[12px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'despesa' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="despesa"
        >
          <span class="material-symbols-outlined text-[16px]">receipt_long</span>
          <span>Despesa</span>
        </button>
      </div>

      <!-- Form Container -->
      <div id="modal-form-container">
        ${state.activeModalTab === "plantao" ? renderShiftForm(editData) : state.activeModalTab === "salario" ? renderSalaryForm(editData) : renderExpenseForm(editData)}
      </div>
    </div>
  `;

  dom.bottomSheet.innerHTML = html;
  if (typeof enhanceIcons === "function" && dom.bottomSheet) {
    enhanceIcons(dom.bottomSheet);
  }
  attachBottomSheetFormEvents();
}

/**
 * Form: Cadastrar / Editar Plantão
 */
function renderShiftForm(data = null) {
  const isEdit = Boolean(data && data.id);
  const hospital = data ? (data.hospital || "") : "";
  const shiftDate = data ? (data.shiftDate || getLocalDateString(state.referenceDate || new Date())) : getLocalDateString(state.referenceDate || new Date());
  const shiftType = data ? (data.shiftType || "12h Diurno") : "12h Diurno";
  const sector = data ? (data.sector || "UTI Neonatal") : "UTI Neonatal";
  const taxRegime = data ? (data.taxRegime || "Simples Nacional (6%)") : "Simples Nacional (6%)";
  const taxRate = (data && data.taxRate !== undefined) ? data.taxRate : 6;
  const notes = data ? (data.notes || "") : "";
  const grossVal = data ? (data.grossValue || "") : "";
  const netVal = data ? (data.netValue || "") : "";
  const lagMonths = data ? (data.paymentLagMonths || 3) : 3;
  const customDate = data ? (data.customPaymentDate || "") : "";
  const hasCustomDate = Boolean(customDate);
  const expectedDate = calculateExpectedPaymentDate(shiftDate, lagMonths, customDate);

  return `
    <form id="form-shift" class="flex flex-col gap-4">
      <!-- Hospital -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant flex items-center justify-between">
          <span>Hospital ou Instituição</span>
          <span class="text-secondary text-[11px] flex items-center gap-0.5">
            ${renderIcon('auto_awesome', 'text-[13px]')} Sugestão
          </span>
        </label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white">
          ${renderIcon('local_hospital', 'text-[20px] text-secondary')}
          <input
            type="text"
            id="input-shift-hospital"
            class="w-full bg-transparent text-[14px] text-on-surface focus:outline-none placeholder:text-outline"
            placeholder="Ex: Hospital Infantil Sabará"
            value="${hospital}"
            required
          />
        </div>
        <!-- Quick pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 -mx-1 px-1 no-scrollbar">
          ${SHIFT_HOSPITAL_SUGGESTIONS.map(h => `
            <button
              type="button"
              class="quick-hospital-pill py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${hospital === h ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-hospital="${h}"
            >
              ${h.split(" ")[h.split(" ").length - 1]}
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Setor Pediátrico & Tipo de Escala -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Setor Clínico</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm">
            ${renderIcon('stethoscope', 'text-[18px] text-secondary')}
            <select
              id="input-shift-sector"
              class="w-full bg-transparent text-[13px] text-on-surface font-medium focus:outline-none"
            >
              ${CLINICAL_SECTORS.map(s => `
                <option value="${s}" ${sector === s ? 'selected' : ''}>${s}</option>
              `).join("")}
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Tipo de Escala</label>
          <select
            id="input-shift-type"
            class="h-11 bg-surface-container-low rounded-2xl px-3 text-[13px] text-on-surface font-medium focus:outline-none shadow-sm"
          >
            ${SHIFT_TYPES.map(t => `
              <option value="${t.id}" ${shiftType === t.id ? 'selected' : ''}>${t.label}</option>
            `).join("")}
          </select>
        </div>
      </div>

      <!-- Data Trabalhada -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant">Data Trabalhada</label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm">
          ${renderIcon('calendar_today', 'text-[18px] text-primary')}
          <input
            type="date"
            id="input-shift-date"
            class="w-full bg-transparent text-[13px] text-on-surface focus:outline-none font-medium"
            value="${shiftDate}"
            required
          />
        </div>
      </div>

      <!-- Regime Tributário PJ / PF -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[12px] font-bold text-on-surface-variant">Regime Tributário do Plantão</label>
          <span id="label-tax-rate-display" class="text-[11px] font-bold text-primary">${taxRate}% de imposto</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          ${TAX_REGIMES.map(reg => {
            const name = reg.name || reg.label || "Personalizado";
            const ratePct = (reg.percentage !== null && reg.percentage !== undefined)
              ? reg.percentage
              : (reg.rate ? reg.rate * 100 : 0);
            const isSelected = taxRegime === name || taxRegime === reg.id || taxRegime === reg.label;
            return `
              <button
                type="button"
                class="tax-regime-btn p-2 rounded-2xl text-[11px] font-bold text-left transition-all ${isSelected ? 'bg-secondary-fixed text-on-secondary-fixed-variant ring-2 ring-secondary shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
                data-name="${name}"
                data-rate="${ratePct}"
              >
                <div class="truncate">${name.split(" ")[0]}</div>
                <div class="text-[10px] opacity-80">${reg.percentage !== null && reg.percentage !== undefined ? `${reg.percentage}% imposto` : 'Personalizado'}</div>
              </button>
            `;
          }).join("")}
        </div>
        <input type="hidden" id="input-shift-tax-regime" value="${taxRegime}" />
        <input type="hidden" id="input-shift-tax-rate" value="${taxRate}" />
      </div>

      <!-- Gross vs Net Values + Live Hourly Rate -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1 bg-surface-container-low p-3 rounded-2xl shadow-sm">
          <span class="text-[11px] font-semibold text-on-surface-variant">Valor Bruto (R$)</span>
          <input
            type="number"
            step="0.01"
            id="input-shift-gross"
            class="w-full bg-transparent text-[18px] font-bold text-on-surface focus:outline-none font-display"
            placeholder="0.00"
            value="${grossVal}"
            required
          />
          <span class="text-[10px] text-outline">Entrada faturada</span>
        </div>

        <div class="flex flex-col gap-1 bg-surface-container p-3 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-tertiary">Valor Líquido (R$)</span>
            <span id="badge-live-hourly-rate" class="badge-rate-mint text-[9px] px-1.5 py-0.2">R$/h</span>
          </div>
          <input
            type="number"
            step="0.01"
            id="input-shift-net"
            class="w-full bg-transparent text-[18px] font-bold text-tertiary focus:outline-none font-display"
            placeholder="0.00"
            value="${netVal}"
            required
          />
          <span id="label-tax-deduction-amount" class="text-[10px] text-on-surface-variant">Líquido em conta</span>
        </div>
      </div>

      <!-- Medical Reimbursement Rule (D+30, D+60, D+90 padrão, D+120) with Custom Date Override -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[12px] font-bold text-on-surface-variant">Prazo de Recebimento</label>
          <button
            type="button"
            id="btn-toggle-custom-date"
            class="text-[11px] font-bold text-secondary hover:underline flex items-center gap-0.5"
          >
            ${renderIcon("tune", "text-[14px]")}
            <span>${hasCustomDate ? 'Usar Regra D+X' : 'Data Manual Específica'}</span>
          </button>
        </div>

        <div id="lag-options-group" class="grid grid-cols-4 gap-2 ${hasCustomDate ? 'opacity-40 pointer-events-none' : ''}">
          ${[1, 2, 3, 4].map(months => `
            <button
              type="button"
              class="lag-option-btn p-2.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all ${Number(lagMonths) === months ? 'bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm ring-2 ring-secondary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
              data-lag="${months}"
            >
              <span class="text-[12px] font-bold">D+${months * 30}</span>
              <span class="text-[10px] text-on-surface-variant">${months} ${months === 1 ? 'mês' : 'meses'}</span>
            </button>
          `).join("")}
        </div>
        <input type="hidden" id="input-shift-lag" value="${lagMonths}" />

        <!-- Optional Custom Override Date -->
        <div id="custom-date-container" class="${hasCustomDate ? '' : 'hidden'} mt-1 flex flex-col gap-1">
          <label class="text-[11px] font-semibold text-secondary flex items-center gap-1">
            ${renderIcon("calendar_month", "text-[14px]")}
            Data Fixa Manual de Repasse (Substitui D+X):
          </label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm border border-secondary/30">
            ${renderIcon("edit_calendar", "text-[18px] text-secondary")}
            <input
              type="date"
              id="input-shift-custom-date"
              class="w-full bg-transparent text-[13px] text-on-surface focus:outline-none font-medium"
              value="${customDate}"
            />
          </div>
        </div>
      </div>

      <!-- Clinical Notes & Handover -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant flex items-center justify-between">
          <span>Observações Clínicas & Passagem de Plantão</span>
          <span class="text-[10px] text-outline">Opcional</span>
        </label>
        <textarea
          id="input-shift-notes"
          rows="2"
          class="w-full bg-surface-container-low rounded-2xl p-3 text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:bg-white border border-transparent focus:border-primary transition-all resize-none shadow-sm"
          placeholder="Ex: Leito 4 intubado, passagem tranquila. Faturamento confirmou repasse para dia 15."
        >${notes}</textarea>
      </div>

      <!-- Real-time Projection Card -->
      <div class="bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-secondary-fixed/40 p-3.5 rounded-2xl shadow-[0_4px_16px_rgba(126,74,138,0.06)] flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-white text-primary flex items-center justify-center shrink-0 shadow-sm">
          ${renderIcon("event_upcoming", "text-[20px]")}
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-[11px] font-bold text-primary">Previsão Calculada de Depósito:</span>
          <span class="text-[14px] font-bold text-on-surface truncate" id="label-expected-date">
            ${formatDateBR(expectedDate)} ${hasCustomDate ? '(Data Manual)' : `(D+${lagMonths * 30})`}
          </span>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="h-12 w-full rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(253,78,135,0.35)] active:scale-[0.98] transition-all"
      >
        <span>${isEdit ? 'Salvar Alterações' : 'Salvar Plantão no Radar'}</span>
        ${renderIcon("check", "text-[18px]")}
      </button>
    </form>
  `;
}

/**
 * Form: Cadastrar / Editar Salário Fixo
 */
function renderSalaryForm(data = null) {
  const existingSalary = data || (state.store.data.fixedSalaries && state.store.data.fixedSalaries[0]) || null;
  const isEdit = Boolean(existingSalary);
  const salaryId = existingSalary ? existingSalary.id : "";
  const desc = existingSalary ? existingSalary.description : "";
  const val = existingSalary ? existingSalary.value : "";
  const day = existingSalary ? existingSalary.dayOfMonth : 5;

  return `
    <form id="form-salary" class="flex flex-col gap-4">
      <input type="hidden" id="input-salary-id" value="${salaryId}" />
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant">Descrição do Cargo / Vínculo</label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm">
          ${typeof renderIcon === 'function' ? renderIcon('work', 'text-[20px] text-primary') : '<span class="material-symbols-outlined text-primary text-[20px]">work</span>'}
          <input
            type="text"
            id="input-salary-desc"
            class="w-full bg-transparent text-[14px] text-on-surface focus:outline-none"
            placeholder="Ex: Consultório Particular / Vínculo Fixo"
            value="${desc}"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Valor Mensal (R$)</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-1 shadow-sm">
            <span class="text-[13px] font-bold text-on-surface">R$</span>
            <input
              type="number"
              step="0.01"
              id="input-salary-value"
              class="w-full bg-transparent text-[16px] font-bold text-on-surface focus:outline-none"
              placeholder="0.00"
              value="${val}"
              required
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Dia do Pagamento</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm">
            ${typeof renderIcon === 'function' ? renderIcon('calendar_month', 'text-[18px] text-tertiary') : '<span class="material-symbols-outlined text-tertiary text-[18px]">calendar_month</span>'}
            <input
              type="number"
              min="1"
              max="31"
              id="input-salary-day"
              class="w-full bg-transparent text-[15px] font-bold text-on-surface focus:outline-none"
              value="${day}"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        class="h-12 w-full rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(253,78,135,0.35)] active:scale-[0.98] transition-all mt-2"
      >
        <span>${isEdit ? 'Atualizar Salário Fixo' : 'Salvar Salário Fixo'}</span>
        ${typeof renderIcon === 'function' ? renderIcon('check', 'text-[18px]') : '<span class="material-symbols-outlined text-[18px]">check</span>'}
      </button>
    </form>
  `;
}

/**
 * Form: Cadastrar Despesa Pediátrica
 */
function renderExpenseForm(data = null) {
  const isEdit = Boolean(data);
  const desc = data ? data.description : "";
  const category = data ? data.category : EXPENSE_CATEGORIES[0];
  const type = data ? data.type : "fixed";
  const val = data ? data.value : "";
  const dueDate = data ? data.dueDate : `${state.activeMonth}-10`;
  const isPaid = data ? data.isPaid : false;

  return `
    <form id="form-expense" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant">Descrição da Despesa</label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm">
          ${typeof renderIcon === 'function' ? renderIcon('receipt', 'text-[20px] text-secondary') : '<span class="material-symbols-outlined text-secondary text-[20px]">receipt</span>'}
          <input
            type="text"
            id="input-expense-desc"
            class="w-full bg-transparent text-[14px] text-on-surface focus:outline-none"
            placeholder="Ex: Sublocação de Consultório / CRM / Combustível"
            value="${desc}"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Categoria Pediátrica Pré-definida -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Categoria</label>
          <select
            id="input-expense-category"
            class="h-11 bg-surface-container-low rounded-2xl px-3 text-[12px] text-on-surface font-medium focus:outline-none shadow-sm"
          >
            ${EXPENSE_CATEGORIES.map(c => `
              <option value="${c}" ${category === c ? 'selected' : ''}>${c}</option>
            `).join("")}
          </select>
        </div>

        <!-- Tipo: Fixa vs Variável -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Tipo de Custo</label>
          <select
            id="input-expense-type"
            class="h-11 bg-surface-container-low rounded-2xl px-3 text-[12px] text-on-surface font-medium focus:outline-none shadow-sm"
          >
            <option value="fixed" ${type === 'fixed' ? 'selected' : ''}>Fixa (Recorrente)</option>
            <option value="variable" ${type === 'variable' ? 'selected' : ''}>Variável (Avulsa)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Valor -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Valor (R$)</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-1 shadow-sm">
            <span class="text-[13px] font-bold text-on-surface">R$</span>
            <input
              type="number"
              step="0.01"
              id="input-expense-value"
              class="w-full bg-transparent text-[16px] font-bold text-on-surface focus:outline-none"
              placeholder="0.00"
              value="${val}"
              required
            />
          </div>
        </div>

        <!-- Data de Vencimento -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Data de Vencimento</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm">
            <span class="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
            <input
              type="date"
              id="input-expense-duedate"
              class="w-full bg-transparent text-[13px] text-on-surface focus:outline-none font-medium"
              value="${dueDate}"
              required
            />
          </div>
        </div>
      </div>

      <!-- Status inicial -->
      <div class="flex items-center gap-2 pt-1">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="input-expense-paid"
            class="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
            ${isPaid ? 'checked' : ''}
          />
          <span class="text-[13px] text-on-surface font-medium">Esta despesa já foi paga</span>
        </label>
      </div>

      <button
        type="submit"
        class="h-12 w-full rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(253,78,135,0.35)] active:scale-[0.98] transition-all mt-2"
      >
        <span>${isEdit ? 'Atualizar Despesa' : 'Registrar Despesa'}</span>
        <span class="material-symbols-outlined text-[18px]">check</span>
      </button>
    </form>
  `;
}

function attachBottomSheetFormEvents() {
  const btnClose = document.getElementById("btn-close-sheet");
  if (btnClose) {
    btnClose.addEventListener("click", closeBottomSheet);
  }

  // Modal switcher buttons
  const modalTabBtns = document.querySelectorAll(".modal-tab-btn");
  modalTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      state.activeModalTab = tab;
      state.editingItem = null;
      renderBottomSheetContent();
    });
  });

  // Shift form live recalculations, quick pills, tax regimes, and custom date toggle
  const formShift = document.getElementById("form-shift");
  if (formShift) {
    const inputGross = document.getElementById("input-shift-gross");
    const inputNet = document.getElementById("input-shift-net");
    const inputDate = document.getElementById("input-shift-date");
    const inputType = document.getElementById("input-shift-type");
    const inputLag = document.getElementById("input-shift-lag");
    const inputCustomDate = document.getElementById("input-shift-custom-date");
    const btnToggleCustom = document.getElementById("btn-toggle-custom-date");
    const customDateContainer = document.getElementById("custom-date-container");
    const lagGroup = document.getElementById("lag-options-group");
    const labelExpected = document.getElementById("label-expected-date");
    const inputTaxRegime = document.getElementById("input-shift-tax-regime");
    const inputTaxRate = document.getElementById("input-shift-tax-rate");
    const labelTaxDisplay = document.getElementById("label-tax-rate-display");
    const labelDeduction = document.getElementById("label-tax-deduction-amount");
    const badgeHourly = document.getElementById("badge-live-hourly-rate");

    const updateCalculations = () => {
      const dateVal = inputDate.value || getLocalDateString(state.referenceDate || new Date());
      const lagVal = Number(inputLag.value) || 3;
      const isCustomActive = customDateContainer && !customDateContainer.classList.contains("hidden");
      const customDateVal = (isCustomActive && inputCustomDate && inputCustomDate.value) ? inputCustomDate.value : null;

      const expected = calculateExpectedPaymentDate(dateVal, lagVal, customDateVal);
      if (labelExpected) {
        labelExpected.textContent = customDateVal
          ? `${formatDateBR(expected)} (Data Manual)`
          : `${formatDateBR(expected)} (D+${lagVal * 30})`;
      }
      updateHourlyRateBadge();
    };

    const updateHourlyRateBadge = () => {
      if (!badgeHourly || !inputNet || !inputType) return;
      const net = parseFloat(inputNet.value) || 0;
      const rate = calculateHourlyRate(net, inputType.value);
      badgeHourly.textContent = rate > 0 ? `R$ ${rate}/h` : 'R$/h';
      badgeHourly.className = rate >= 150 ? 'badge-rate-gold text-[9px] px-1.5 py-0.2' : 'badge-rate-mint text-[9px] px-1.5 py-0.2';
    };

    const recalcFromGross = () => {
      if (!inputGross || !inputNet) return;
      const gross = parseFloat(inputGross.value) || 0;
      const taxRate = parseFloat(inputTaxRate ? inputTaxRate.value : 6) || 0;
      const net = gross * (1 - taxRate / 100);
      inputNet.value = net > 0 ? net.toFixed(2) : "";
      const deduction = gross - net;
      if (labelDeduction) {
        labelDeduction.textContent = deduction > 0
          ? `Dedução: ${formatCurrency(deduction)} (${taxRate}%)`
          : 'Líquido em conta';
      }
      updateHourlyRateBadge();
    };

    const recalcFromNet = () => {
      if (!inputGross || !inputNet) return;
      const net = parseFloat(inputNet.value) || 0;
      const taxRate = parseFloat(inputTaxRate ? inputTaxRate.value : 6) || 0;
      if (taxRate < 100) {
        const gross = net / (1 - taxRate / 100);
        inputGross.value = gross > 0 ? gross.toFixed(2) : "";
        const deduction = gross - net;
        if (labelDeduction) {
          labelDeduction.textContent = deduction > 0
            ? `Dedução: ${formatCurrency(deduction)} (${taxRate}%)`
            : 'Líquido em conta';
        }
      }
      updateHourlyRateBadge();
    };

    // Initial badge update
    updateHourlyRateBadge();

    if (btnToggleCustom && customDateContainer && lagGroup) {
      btnToggleCustom.addEventListener("click", () => {
        const isHidden = customDateContainer.classList.contains("hidden");
        if (isHidden) {
          customDateContainer.classList.remove("hidden");
          lagGroup.classList.add("opacity-40", "pointer-events-none");
          btnToggleCustom.innerHTML = `${renderIcon("rule", "text-[14px]")} <span>Usar Regra D+X</span>`;
          if (inputCustomDate && !inputCustomDate.value) {
            inputCustomDate.value = calculateExpectedPaymentDate(inputDate.value || getLocalDateString(new Date()), Number(inputLag.value) || 3);
          }
        } else {
          customDateContainer.classList.add("hidden");
          lagGroup.classList.remove("opacity-40", "pointer-events-none");
          btnToggleCustom.innerHTML = `${renderIcon("tune", "text-[14px]")} <span>Data Manual Específica</span>`;
          if (inputCustomDate) inputCustomDate.value = "";
        }
        updateCalculations();
      });
    }

    if (inputCustomDate) {
      inputCustomDate.addEventListener("change", updateCalculations);
    }

    if (inputGross) {
      inputGross.addEventListener("input", recalcFromGross);
    }

    if (inputNet) {
      inputNet.addEventListener("input", recalcFromNet);
    }

    if (inputType) {
      inputType.addEventListener("change", updateHourlyRateBadge);
    }

    if (inputDate) inputDate.addEventListener("change", updateCalculations);

    // Tax regime buttons
    document.querySelectorAll(".tax-regime-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-name");
        const rate = btn.getAttribute("data-rate");
        if (inputTaxRegime) inputTaxRegime.value = name;
        if (inputTaxRate) inputTaxRate.value = rate;
        if (labelTaxDisplay) labelTaxDisplay.textContent = `${rate}% de imposto`;

        document.querySelectorAll(".tax-regime-btn").forEach(b => {
          b.classList.remove("bg-secondary-fixed", "text-on-secondary-fixed-variant", "ring-2", "ring-secondary", "shadow-sm");
          b.classList.add("bg-surface-container-low", "text-on-surface");
        });
        btn.classList.add("bg-secondary-fixed", "text-on-secondary-fixed-variant", "ring-2", "ring-secondary", "shadow-sm");
        btn.classList.remove("bg-surface-container-low", "text-on-surface");

        recalcFromGross();
      });
    });

    // Lag buttons
    document.querySelectorAll(".lag-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const lag = btn.getAttribute("data-lag");
        inputLag.value = lag;
        document.querySelectorAll(".lag-option-btn").forEach(b => {
          b.classList.remove("bg-secondary-fixed", "text-on-secondary-fixed-variant", "shadow-sm", "ring-2", "ring-secondary");
          b.classList.add("bg-surface-container-low", "text-on-surface");
        });
        btn.classList.add("bg-secondary-fixed", "text-on-secondary-fixed-variant", "shadow-sm", "ring-2", "ring-secondary");
        btn.classList.remove("bg-surface-container-low", "text-on-surface");
        updateCalculations();
      });
    });

    // Quick hospital pills
    document.querySelectorAll(".quick-hospital-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const hosp = pill.getAttribute("data-hospital");
        const inputHosp = document.getElementById("input-shift-hospital");
        if (inputHosp) inputHosp.value = hosp;
        document.querySelectorAll(".quick-hospital-pill").forEach(p => {
          p.classList.remove("bg-secondary-fixed", "text-on-secondary-fixed-variant");
          p.classList.add("bg-surface-container-low", "text-on-surface-variant");
        });
        pill.classList.add("bg-secondary-fixed", "text-on-secondary-fixed-variant");
        pill.classList.remove("bg-surface-container-low", "text-on-surface-variant");
      });
    });

    formShift.addEventListener("submit", (e) => {
      e.preventDefault();
      const hospital = document.getElementById("input-shift-hospital").value.trim();
      const shiftDate = document.getElementById("input-shift-date").value;
      const shiftType = document.getElementById("input-shift-type").value;
      const sector = document.getElementById("input-shift-sector")?.value || "UTI Neonatal";
      const taxRegime = document.getElementById("input-shift-tax-regime")?.value || "Simples Nacional (6%)";
      const taxRate = parseFloat(document.getElementById("input-shift-tax-rate")?.value) || 6;
      const notes = document.getElementById("input-shift-notes")?.value.trim() || "";
      const grossValue = parseFloat(document.getElementById("input-shift-gross").value) || 0;
      const netValue = parseFloat(document.getElementById("input-shift-net").value) || (grossValue * (1 - taxRate / 100));
      const paymentLagMonths = Number(document.getElementById("input-shift-lag").value) || 3;
      const isCustomActive = customDateContainer && !customDateContainer.classList.contains("hidden");
      const customPaymentDate = (isCustomActive && inputCustomDate && inputCustomDate.value) ? inputCustomDate.value : null;

      if (!hospital || !shiftDate) {
        showToast("Por favor, preencha o hospital e a data do plantão.", "warning");
        return;
      }

      const shiftPayload = {
        hospital,
        shiftDate,
        shiftType,
        sector,
        taxRegime,
        taxRate,
        notes,
        grossValue,
        netValue,
        paymentLagMonths,
        customPaymentDate
      };

      if (state.editingItem && (state.editingItem.type === "shift" || state.editingItem.type === "plantao") && state.editingItem.data && state.editingItem.data.id) {
        state.store.updateShift(state.editingItem.data.id, shiftPayload);
        showToast(`Plantão do ${hospital} atualizado com sucesso! 🌸`);
      } else {
        state.store.addShift(shiftPayload);
        showToast(`Plantão do ${hospital} salvo no radar! 🌸`);
      }

      closeBottomSheet();
      renderCurrentView();
    });
  }

  // Salary form submit (upserts existing salary avoiding duplicates)
  const formSalary = document.getElementById("form-salary");
  if (formSalary) {
    formSalary.addEventListener("submit", (e) => {
      e.preventDefault();
      const salaryId = document.getElementById("input-salary-id")?.value;
      const description = document.getElementById("input-salary-desc").value.trim();
      const value = parseFloat(document.getElementById("input-salary-value").value) || 0;
      const dayOfMonth = parseInt(document.getElementById("input-salary-day").value, 10) || 5;

      if (!description || value <= 0) {
        showToast("Preencha a descrição e um valor válido.", "warning");
        return;
      }

      state.store.upsertFixedSalary({ id: salaryId || undefined, description, value, dayOfMonth });
      showToast(`Salário fixo '${description}' salvo com sucesso! 💼`);
      closeBottomSheet();
      renderCurrentView();
    });
  }

  // Expense form submit
  const formExpense = document.getElementById("form-expense");
  if (formExpense) {
    formExpense.addEventListener("submit", (e) => {
      e.preventDefault();
      const description = document.getElementById("input-expense-desc").value.trim();
      const category = document.getElementById("input-expense-category").value;
      const type = document.getElementById("input-expense-type").value;
      const value = parseFloat(document.getElementById("input-expense-value").value) || 0;
      const dueDate = document.getElementById("input-expense-duedate").value;
      const isPaid = document.getElementById("input-expense-paid").checked;

      if (!description || value <= 0 || !dueDate) {
        showToast("Preencha todos os campos obrigatórios da despesa.", "warning");
        return;
      }

      if (state.editingItem && (state.editingItem.type === "despesa" || state.editingItem.type === "expense") && state.editingItem.data && state.editingItem.data.id) {
        state.store.updateExpense(state.editingItem.data.id, {
          description,
          category,
          type,
          value,
          dueDate,
          isPaid
        });
        showToast(`Despesa '${description}' atualizada! 🧾`);
      } else {
        state.store.addExpense({
          description,
          category,
          type,
          value,
          dueDate,
          isPaid
        });
        showToast(`Despesa '${description}' registrada com sucesso! 🧾`);
      }

      closeBottomSheet();
      renderCurrentView();
    });
  }
}

function initTouchGestures() {
  const sheet = dom.bottomSheet;
  if (!sheet) return;

  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  sheet.addEventListener("touchstart", (e) => {
    const handle = e.target.closest(".sheet-handle");
    if (handle || sheet.scrollTop <= 0) {
      startY = e.touches[0].clientY;
      isDragging = true;
    }
  }, { passive: true });

  sheet.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0) {
      sheet.style.transform = `translate(-50%, ${deltaY}px)`;
      sheet.style.transition = "none";
    }
  }, { passive: true });

  sheet.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;
    const deltaY = currentY - startY;
    sheet.style.transition = "";
    if (deltaY > 120) {
      sheet.style.transform = "";
      closeBottomSheet();
    } else {
      sheet.style.transform = "";
    }
    startY = 0;
    currentY = 0;
  });
}

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------

export function initApp() {
  try {
    initDOM();
    if (typeof initIconSystem === "function") {
      initIconSystem();
    }
    initTouchGestures();

    // Privacy Mode (Modo Sigilo) setup & event
    if (state.privacyMode && typeof document !== "undefined" && document.body) {
      document.body.classList.add("privacy-active");
    }
    updatePrivacyButtonUI();

    if (dom.btnTogglePrivacy) {
      dom.btnTogglePrivacy.addEventListener("click", togglePrivacyMode);
    }

    // Navigation tab clicks
    dom.navTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabId = tab.getAttribute("data-tab");
        switchTab(tabId);
      });
    });

    // Month navigation
    if (dom.btnPrevMonth) dom.btnPrevMonth.addEventListener("click", () => changeMonth(-1));
    if (dom.btnNextMonth) dom.btnNextMonth.addEventListener("click", () => changeMonth(1));

    // Quick Month Picker Modal
    if (dom.btnOpenMonthPicker) {
      dom.btnOpenMonthPicker.addEventListener("click", openQuickMonthPickerDialog);
    }

    // Notifications Bell Dialog
    if (dom.btnNotifications) {
      dom.btnNotifications.addEventListener("click", openNotificationsDialog);
    }

    // Doctor Profile & Goals Dialog
    if (dom.btnProfile) {
      dom.btnProfile.addEventListener("click", openDoctorProfileDialog);
    }

    // Install App Dialog (PWA)
    if (dom.btnInstallApp) {
      dom.btnInstallApp.addEventListener("click", openPwaInstallDialog);
    }

    // Dialog overlay dismiss
    if (dom.dialogOverlay) {
      dom.dialogOverlay.addEventListener("click", closeDialog);
    }

    // FAB Modal
    if (dom.fabBtn) {
      dom.fabBtn.addEventListener("click", () => openBottomSheet("plantao"));
    }

    // Light dismiss on bottom sheet overlay click
    if (dom.modalOverlay) {
      dom.modalOverlay.addEventListener("click", closeBottomSheet);
    }

    // Keyboard Escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (dom.dialogContainer && dom.dialogContainer.classList.contains("active")) {
          closeDialog();
        } else if (dom.bottomSheet && dom.bottomSheet.classList.contains("active")) {
          closeBottomSheet();
        }
      }
    });

    // Frame width toggle (Mobile preview vs Expanded)
    if (dom.btnToggleFrame) {
      dom.btnToggleFrame.addEventListener("click", () => {
        state.isExpandedView = !state.isExpandedView;
        if (state.isExpandedView) {
          dom.deviceFrame.classList.add("expanded");
          dom.btnToggleFrame.innerHTML = renderIcon("smartphone", "text-[18px]");
          dom.btnToggleFrame.title = "Visualizar no formato iPhone 16 Plus (430px)";
        } else {
          dom.deviceFrame.classList.remove("expanded");
          dom.btnToggleFrame.innerHTML = renderIcon("desktop_windows", "text-[18px]");
          dom.btnToggleFrame.title = "Expandir tela para desktop";
        }
        if (typeof enhanceIcons === "function") {
          enhanceIcons(dom.btnToggleFrame);
        }
      });
    }

    // Initial render
    renderCurrentView();
  } catch (err) {
    console.error("Critical error starting Pediatric Chic:", err);
    if (dom.mainContent) {
      dom.mainContent.innerHTML = `
        <div class="p-6 bg-red-50 text-red-700 rounded-2xl m-4 border border-red-200">
          <h2 class="font-bold text-lg mb-2">Erro ao carregar o aplicativo</h2>
          <p class="text-sm mb-4">${err.message || err}</p>
          <button onclick="location.reload()" class="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Recarregar</button>
        </div>
      `;
    }
  }
}

// Robust Application Bootstrapping
export function bootApp() {
  if (typeof window === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initApp();
      if (typeof enhanceIcons === "function") enhanceIcons(document.body);
    });
  } else {
    initApp();
    if (typeof enhanceIcons === "function") enhanceIcons(document.body);
  }
}

if (typeof window !== "undefined") {
  bootApp();
  window.pediatricApp = {
    state,
    openBottomSheet,
    closeBottomSheet,
    openDialog,
    closeDialog,
    showToast,
    switchTab,
    initApp,
    renderCurrentView,
    bootApp
  };
}
