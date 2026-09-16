/**
 * Finanças Pediatria - Single Page Application Engine
 * Mobile-First Clinical & Financial Control Architecture for Pediatricians
 */

import {
  PediatricStore,
  formatCurrency,
  formatDateBR,
  formatMonthYear,
  addMonths,
  calculateExpectedPaymentDate,
  calculateShiftInstallments,
  evaluateShiftStatus,
  getLocalDateString,
  calculateHourlyRate,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORIES_PF,
  EXPENSE_CATEGORIES_PJ,
  getCategoryScope,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DEFAULT_WORK_LOCATIONS,
  SHIFT_HOSPITAL_SUGGESTIONS,
  DEFAULT_WORK_TYPES,
  SHIFT_TYPES,
  TAX_REGIMES,
  CLINICAL_SECTORS,
  APP_CREATOR,
  parseMedicalVoiceInput,
  generateSBARHandoff,
  parseOFX,
  parseBankCSV,
  reconcileBankTransactions,
  generateAccountantKit,
  PediatricSanctuaryDB
} from './store.js';

import {
  renderForecastChartSVG,
  renderDonutChartSVG,
  renderMonthOverMonthChartSVG,
  renderForecast12MSVG
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
    this.expenseScopeFilter = "all"; // "all" | "pf" | "pj"
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
  dom.babyOverlay = document.getElementById("baby-reaction-overlay");
  dom.babyContent = document.getElementById("baby-reaction-content");
  dom.btnThemeToggle = document.getElementById("btn-theme-toggle");
  dom.btnSpotlight = document.getElementById("btn-spotlight");
  dom.spotlightOverlay = document.getElementById("spotlight-overlay");
  dom.spotlightInput = document.getElementById("spotlight-input");
  dom.btnCloseSpotlight = document.getElementById("btn-close-spotlight");
  dom.spotlightResults = document.getElementById("spotlight-results");
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

export function triggerHaptic(duration = 12) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(duration);
      return;
    }
  } catch (e) {}

  // Hybrid tactile fallback for iOS Safari via Web Audio API micro-pulse
  try {
    if (typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!window.__pediatricHapticCtx) {
          window.__pediatricHapticCtx = new AudioCtx();
        }
        if (window.__pediatricHapticCtx.state === "suspended") {
          window.__pediatricHapticCtx.resume().catch(() => {});
        }
        const ctx = window.__pediatricHapticCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.035);
      }
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
 * Dark Mode Engine: "Plantão Noturno / UTI Neonatal"
 */
export function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement || document.body;
  if (!root) return;
  if (theme === "dark") {
    if (root.setAttribute) root.setAttribute("data-theme", "dark");
    if (root.classList && root.classList.add) root.classList.add("dark");
    if (document.body && document.body.classList && document.body.classList.add) document.body.classList.add("dark");
  } else {
    if (root.removeAttribute) root.removeAttribute("data-theme");
    if (root.classList && root.classList.remove) root.classList.remove("dark");
    if (document.body && document.body.classList && document.body.classList.remove) document.body.classList.remove("dark");
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("pediatric_theme_v3", theme);
    }
  } catch (e) {}

  if (dom.btnThemeToggle) {
    const isDark = theme === "dark";
    dom.btnThemeToggle.title = isDark ? "Alternar para Modo Diurno (Claro)" : "Plantão Noturno (Modo Escuro)";
    const iconSpan = dom.btnThemeToggle.querySelector ? dom.btnThemeToggle.querySelector(".material-symbols-outlined") : null;
    if (iconSpan) {
      const iconName = isDark ? "light_mode" : "dark_mode";
      if (iconSpan.setAttribute) iconSpan.setAttribute("data-icon", iconName);
      iconSpan.innerHTML = renderIcon(iconName);
    }
  }
}

export function initThemeSystem() {
  let savedTheme = "light";
  try {
    if (typeof localStorage !== "undefined") {
      savedTheme = localStorage.getItem("pediatric_theme_v3");
      if (!savedTheme && typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        savedTheme = "dark";
      }
    }
  } catch (e) {}

  applyTheme(savedTheme || "light");

  if (dom.btnThemeToggle && dom.btnThemeToggle.addEventListener) {
    dom.btnThemeToggle.addEventListener("click", () => {
      const isCurrentlyDark = (document.documentElement && document.documentElement.getAttribute && document.documentElement.getAttribute("data-theme") === "dark") || (document.body && document.body.classList && document.body.classList.contains && document.body.classList.contains("dark"));
      const nextTheme = isCurrentlyDark ? "light" : "dark";
      applyTheme(nextTheme);
      triggerHaptic(14);
      showToast(
        nextTheme === "dark" ? "Plantão Noturno ativado! Conforto na UTI Neonatal 🌙" : "Modo Diurno ativado! ☀️",
        nextTheme === "dark" ? "dark_mode" : "light_mode"
      );
    });
  }
}

/**
 * Spotlight Universal Search (Cmd+K / Ctrl+K)
 */
export function openSpotlightSearch() {
  if (!dom.spotlightOverlay) dom.spotlightOverlay = document.getElementById("spotlight-overlay");
  if (!dom.spotlightInput) dom.spotlightInput = document.getElementById("spotlight-input");
  if (!dom.spotlightResults) dom.spotlightResults = document.getElementById("spotlight-results");

  if (!dom.spotlightOverlay) return;
  dom.spotlightOverlay.classList.add("open", "active");
  if (dom.spotlightInput) {
    dom.spotlightInput.value = "";
    setTimeout(() => dom.spotlightInput.focus(), 50);
  }
  renderSpotlightResults("");
}

export function closeSpotlightSearch() {
  if (!dom.spotlightOverlay) dom.spotlightOverlay = document.getElementById("spotlight-overlay");
  if (dom.spotlightOverlay) {
    dom.spotlightOverlay.classList.remove("open", "active");
  }
}

export function renderSpotlightResults(query = "") {
  if (!dom.spotlightResults) dom.spotlightResults = document.getElementById("spotlight-results");
  if (!dom.spotlightResults) return;

  const q = (query || "").trim().toLowerCase();
  const shifts = state.store.data.shifts || [];
  const consultations = state.store.getConsultations ? state.store.getConsultations() : (state.store.data.consultations || []);
  const expenses = state.store.data.expenses || [];

  const actions = [
    { title: "Novo Plantão", desc: "Cadastrar escala hospitalar", icon: "add_circle", action: () => { closeSpotlightSearch(); openBottomSheet("plantao"); } },
    { title: "Nova Consulta / Puericultura", desc: "Cadastrar atendimento de consultório", icon: "child_friendly", action: () => { closeSpotlightSearch(); openBottomSheet("consultorio"); } },
    { title: "Nova Despesa", desc: "Registrar custo fixo ou variável", icon: "receipt_long", action: () => { closeSpotlightSearch(); openBottomSheet("despesa"); } },
    { title: "Passagem de Plantão SBAR", desc: "Relatório clínico LGPD para WhatsApp", icon: "swap_horiz", action: () => { closeSpotlightSearch(); openSBARDialog(); } },
    { title: "DRE & Otimizador Fator R", desc: "Demonstrativo contábil e simulação 28%", icon: "calculate", action: () => { closeSpotlightSearch(); openDREDialog(); } },
    { title: "Conciliação Bancária", desc: "Importar extrato OFX ou CSV do banco", icon: "upload_file", action: () => { closeSpotlightSearch(); openReconciliationDialog(); } },
    { title: "Kit do Contador", desc: "Relatório mensal e CSV para contabilidade", icon: "contact_phone", action: () => { closeSpotlightSearch(); openAccountantKitDialog(); } },
    { title: "Simulador FIRE Pediatra", desc: "Termômetro de independência de plantões", icon: "local_fire_department", action: () => { closeSpotlightSearch(); openFIREDialog(); } },
    { title: "Alternar Modo Noturno (UTI)", desc: "Trocar entre modo claro e escuro", icon: "dark_mode", action: () => { closeSpotlightSearch(); dom.btnThemeToggle?.click(); } },
    { title: "Modo Sigilo (Privacidade)", desc: "Ocultar ou exibir valores monetários", icon: "visibility", action: () => { closeSpotlightSearch(); togglePrivacyMode(); } }
  ];

  let filteredActions = actions;
  let filteredShifts = [];
  let filteredConsultations = [];
  let filteredExpenses = [];

  if (q) {
    filteredActions = actions.filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
    filteredShifts = shifts.filter(s =>
      (s.hospital && s.hospital.toLowerCase().includes(q)) ||
      (s.sector && s.sector.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      (s.shiftDate && s.shiftDate.includes(q))
    ).slice(0, 5);

    filteredConsultations = consultations.filter(c =>
      (c.patientName && c.patientName.toLowerCase().includes(q)) ||
      (c.consultationType && c.consultationType.toLowerCase().includes(q)) ||
      (c.type && c.type.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q)) ||
      (c.date && c.date.includes(q))
    ).slice(0, 5);

    filteredExpenses = expenses.filter(e =>
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      (e.dueDate && e.dueDate.includes(q)) ||
      (e.date && e.date.includes(q))
    ).slice(0, 5);
  } else {
    filteredShifts = shifts.slice(-3).reverse();
    filteredConsultations = consultations.slice(-3).reverse();
  }

  let html = "";

  if (filteredActions.length > 0) {
    html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-2 py-1 tracking-wider">Ações e Módulos</div>`;
    filteredActions.forEach((act, idx) => {
      html += `
        <div class="spotlight-item p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container active:scale-98 transition-all" data-action-idx="${idx}">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
            ${renderIcon(act.icon, "text-[18px]")}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-[13px] font-bold text-on-surface truncate">${act.title}</h4>
            <p class="text-[11px] text-on-surface-variant truncate">${act.desc}</p>
          </div>
          <span class="text-[11px] text-primary font-bold">Abrir ➔</span>
        </div>
      `;
    });
  }

  if (filteredShifts.length > 0) {
    html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-2 py-1 mt-2 tracking-wider">Plantões</div>`;
    filteredShifts.forEach(s => {
      html += `
        <div class="spotlight-item p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container active:scale-98 transition-all" data-type="shift" data-id="${s.id}">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            ${renderIcon("stethoscope", "text-[18px]")}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-[13px] font-bold text-on-surface truncate">${s.hospital} (${s.sector || 'Neo'})</h4>
            <p class="text-[11px] text-on-surface-variant truncate">${formatDateBR(s.shiftDate)} • ${formatCurrency(s.netValue)}</p>
          </div>
          <span class="text-[11px] text-secondary font-bold">Ver</span>
        </div>
      `;
    });
  }

  if (filteredConsultations.length > 0) {
    html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-2 py-1 mt-2 tracking-wider">Consultório & Puericultura</div>`;
    filteredConsultations.forEach(c => {
      html += `
        <div class="spotlight-item p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container active:scale-98 transition-all" data-type="consultation" data-id="${c.id}">
          <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
            ${renderIcon("child_friendly", "text-[18px]")}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-[13px] font-bold text-on-surface truncate">${c.patientName}</h4>
            <p class="text-[11px] text-on-surface-variant truncate">${c.consultationType || c.type || "Consulta"} • ${formatDateBR(c.date)} • ${formatCurrency(c.value !== undefined ? c.value : (c.grossValue || 0))}</p>
          </div>
          <span class="text-[11px] text-tertiary font-bold">Editar</span>
        </div>
      `;
    });
  }

  if (filteredExpenses.length > 0) {
    html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-2 py-1 mt-2 tracking-wider">Despesas</div>`;
    filteredExpenses.forEach(e => {
      html += `
        <div class="spotlight-item p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container active:scale-98 transition-all" data-type="expense" data-id="${e.id}">
          <div class="w-8 h-8 rounded-full bg-coral-expense-bg text-coral-expense flex items-center justify-center shrink-0">
            ${renderIcon("receipt_long", "text-[18px]")}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-[13px] font-bold text-on-surface truncate">${e.description}</h4>
            <p class="text-[11px] text-on-surface-variant truncate">${e.category} • ${formatDateBR(e.dueDate || e.date)} • ${formatCurrency(e.value)}</p>
          </div>
          <span class="text-[11px] text-error font-bold">Ver</span>
        </div>
      `;
    });
  }

  if (!html) {
    html = `<div class="p-6 text-center text-on-surface-variant text-[13px]">Nenhum resultado encontrado para "${query}".</div>`;
  }

  dom.spotlightResults.innerHTML = html;
  if (typeof enhanceIcons === "function") enhanceIcons(dom.spotlightResults);

  dom.spotlightResults.querySelectorAll(".spotlight-item").forEach(item => {
    item.addEventListener("click", () => {
      const actIdx = item.getAttribute("data-action-idx");
      if (actIdx !== null && filteredActions[actIdx]) {
        filteredActions[actIdx].action();
        return;
      }
      const type = item.getAttribute("data-type");
      const id = item.getAttribute("data-id");
      closeSpotlightSearch();
      if (type === "shift") {
        const targetShift = shifts.find(s => s.id === id);
        if (targetShift) openBottomSheet("plantao", targetShift);
      } else if (type === "consultation") {
        const targetCons = consultations.find(c => c.id === id);
        if (targetCons) openBottomSheet("consultorio", targetCons);
      } else if (type === "expense") {
        const targetExp = expenses.find(e => e.id === id);
        if (targetExp) openBottomSheet("despesa", targetExp);
      }
    });
  });
}

export function initSpotlightSearch() {
  if (dom.btnSpotlight) {
    dom.btnSpotlight.addEventListener("click", openSpotlightSearch);
  }
  if (dom.btnCloseSpotlight) {
    dom.btnCloseSpotlight.addEventListener("click", closeSpotlightSearch);
  }
  if (dom.spotlightOverlay) {
    dom.spotlightOverlay.addEventListener("click", (e) => {
      if (e.target === dom.spotlightOverlay) closeSpotlightSearch();
    });
  }
  if (dom.spotlightInput) {
    dom.spotlightInput.addEventListener("input", (e) => {
      renderSpotlightResults(e.target.value);
    });
    dom.spotlightInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const firstItem = dom.spotlightResults?.querySelector(".spotlight-item");
        if (firstItem) firstItem.click();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (dom.spotlightOverlay && (dom.spotlightOverlay.classList.contains("active") || dom.spotlightOverlay.classList.contains("open"))) {
        closeSpotlightSearch();
      } else {
        openSpotlightSearch();
      }
    } else if (e.key === "Escape" && dom.spotlightOverlay && (dom.spotlightOverlay.classList.contains("active") || dom.spotlightOverlay.classList.contains("open"))) {
      closeSpotlightSearch();
    }
  });
}

/**
 * Voice Recognition & NLP Assistant
 */
export function startVoiceLogging() {
  const SpeechRecognition = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  if (SpeechRecognition) {
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      showToast("Ouvindo... Fale o plantão, consulta ou despesa 🎙️", "mic");
      triggerHaptic(20);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processVoiceTranscript(transcript);
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        promptVoiceManualFallback();
      };

      recognition.start();
      return;
    } catch (e) {
      console.warn("Error starting speech recognition:", e);
    }
  }

  promptVoiceManualFallback();
}

function promptVoiceManualFallback() {
  const html = `
    <div class="p-5 flex flex-col gap-3">
      <div class="flex items-center gap-2 pb-1 border-b border-outline-variant/20">
        <span class="material-symbols-outlined text-secondary text-[22px]" data-icon="mic"></span>
        <h3 class="font-headline text-[17px] font-bold text-on-surface">Lançamento por Voz ou Texto</h3>
      </div>
      <p class="text-[12px] text-on-surface-variant">
        O assistente de NLP Médico reconhece termos como: <em>"Plantão 12h sábado no Mater Dei 1800"</em>, <em>"Consulta puericultura Maria 350"</em> ou <em>"Despesa jaleco 250"</em>.
      </p>
      <textarea
        id="input-voice-text-fallback"
        rows="3"
        class="w-full p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all resize-none"
        placeholder="Digite ou cole aqui a frase..."
      ></textarea>
      <div class="flex items-center justify-end gap-2 pt-1">
        <button type="button" class="px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant font-bold text-[12px]" id="btn-cancel-voice">Cancelar</button>
        <button type="button" id="btn-submit-voice-text" class="px-5 py-2 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[12px] shadow-sm active:scale-95">Processar Frase</button>
      </div>
    </div>
  `;
  openDialog(html);

  const btnCancel = document.getElementById("btn-cancel-voice");
  if (btnCancel) btnCancel.addEventListener("click", closeDialog);

  const btnSubmit = document.getElementById("btn-submit-voice-text");
  const inputEl = document.getElementById("input-voice-text-fallback");
  if (btnSubmit && inputEl) {
    btnSubmit.addEventListener("click", () => {
      const text = inputEl.value.trim();
      if (text) {
        closeDialog();
        processVoiceTranscript(text);
      }
    });
  }
}

function processVoiceTranscript(transcript) {
  const parsed = parseMedicalVoiceInput(transcript);
  if (!parsed || !parsed.type) {
    showToast("Não foi possível identificar o lançamento. Tente novamente.", "warning");
    return;
  }

  triggerHaptic(25);
  if (parsed.type === "shift") {
    openBottomSheet("plantao", {
      hospital: parsed.hospital || "Hospital Mater Dei",
      shiftType: parsed.shiftType || "12h Diurno",
      sector: parsed.sector || "UTI Neonatal",
      shiftDate: parsed.shiftDate || getLocalDateString(state.referenceDate || new Date()),
      grossValue: parsed.grossValue || 1500,
      taxRegime: parsed.taxRegime || "Simples Nacional (6%)",
      taxRate: parsed.taxRate !== undefined ? parsed.taxRate : 6,
      netValue: parsed.netValue !== undefined ? parsed.netValue : (parsed.grossValue ? parsed.grossValue * 0.94 : 1410),
      notes: parsed.notes || ""
    });
    showToast(`Plantão identificado: ${parsed.hospital || 'Plantão'}! 🎙️✨`);
  } else if (parsed.type === "consultation") {
    openBottomSheet("consultorio", {
      patientName: parsed.patientName || "Paciente Puericultura",
      consultationType: parsed.consultationType || "Puericultura (Avulsa)",
      value: parsed.value || 350,
      grossValue: parsed.grossValue || parsed.value || 350,
      date: parsed.date || getLocalDateString(state.referenceDate || new Date()),
      paid: true,
      notes: parsed.notes || ""
    });
    showToast(`Consulta identificada: ${parsed.patientName || 'Puericultura'}! 🎙️✨`);
  } else if (parsed.type === "expense") {
    openBottomSheet("despesa", {
      description: parsed.description || "Despesa Médica",
      category: parsed.category || "Consultório",
      value: parsed.value || 100,
      dueDate: parsed.date || parsed.shiftDate || getLocalDateString(state.referenceDate || new Date()),
      date: parsed.date || getLocalDateString(state.referenceDate || new Date()),
      scope: parsed.scope || "PJ",
      notes: parsed.notes || ""
    });
    showToast(`Despesa identificada: ${parsed.description}! 🎙️✨`);
  }
}

/**
 * Passagem de Plantão SBAR (LGPD-Safe)
 */
export function openSBARDialog(shiftId = null) {
  const shifts = state.store.data.shifts || [];
  let currentShift = shiftId ? shifts.find(s => s.id === shiftId) : (shifts[0] || null);

  const doc = state.store.data;
  const doctorName = doc.doctorName || "Dra. Pediatra";
  const doctorCrm = doc.doctorCrm || "CRM-SP";

  const renderSbarContent = (shift) => {
    const defaultData = {
      hospital: shift ? shift.hospital : "UTI Neonatal",
      date: shift ? formatDateBR(shift.shiftDate) : formatDateBR(getLocalDateString(new Date())),
      sector: shift ? (shift.sector || "UTI Neonatal") : "UTI Neonatal",
      shiftType: shift ? shift.shiftType : "12h Noturno"
    };

    return `
      <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
              ${renderIcon("swap_horiz", "text-[18px]")}
            </div>
            <div>
              <h3 class="font-headline text-[16px] font-bold text-on-surface">Passagem de Plantão SBAR</h3>
              <span class="text-[11px] text-primary font-semibold">${defaultData.hospital} • ${defaultData.sector}</span>
            </div>
          </div>
          <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-sbar">
            ${renderIcon("close", "text-[18px]")}
          </button>
        </div>

        <div class="flex flex-col gap-2.5">
          <div>
            <label class="text-[11px] font-bold text-on-surface block mb-0.5">S - Situação (Leito / Idade / Motivo)</label>
            <textarea id="sbar-s" rows="2" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[12px] text-on-surface focus:outline-none focus:border-secondary resize-none" placeholder="Ex: Leito 03: RN de Maria, IG 32s, PN 1450g. Em CPAP nasal."></textarea>
          </div>

          <div>
            <label class="text-[11px] font-bold text-on-surface block mb-0.5">B - Background (Histórico Relevante)</label>
            <textarea id="sbar-b" rows="2" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[12px] text-on-surface focus:outline-none focus:border-secondary resize-none" placeholder="Ex: Parto cesárea por DHEG materna. Fez surfactante na sala de parto."></textarea>
          </div>

          <div>
            <label class="text-[11px] font-bold text-on-surface block mb-0.5">A - Avaliação (Quadro Clínico Atual)</label>
            <textarea id="sbar-a" rows="2" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[12px] text-on-surface focus:outline-none focus:border-secondary resize-none" placeholder="Ex: Estável, afebril, boa perfusão periférica. Gasometria com acidose respiratória leve compensada."></textarea>
          </div>

          <div>
            <label class="text-[11px] font-bold text-on-surface block mb-0.5">R - Recomendação (Condutas & Pendências)</label>
            <textarea id="sbar-r" rows="2" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[12px] text-on-surface focus:outline-none focus:border-secondary resize-none" placeholder="Ex: Repetir gaso às 22h. Se mantiver desconforto, aumentar PEEP. Manter NPT em bomba."></textarea>
          </div>

          <label class="flex items-center gap-2 cursor-pointer select-none text-[11px] text-on-surface-variant pt-1">
            <input type="checkbox" id="sbar-lgpd" checked class="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary" />
            <span>Blindagem LGPD Ativa (Garantir anonimização de dados sensíveis)</span>
          </label>
        </div>

        <div class="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="btn-copy-sbar" class="h-10 rounded-full bg-surface-container text-on-surface font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              ${renderIcon("content_copy", "text-[16px]")}
              <span>Copiar Texto</span>
            </button>
            <button type="button" id="btn-send-whatsapp-sbar" class="h-10 rounded-full bg-[#25D366] text-white font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
              ${renderIcon("send", "text-[16px]")}
              <span>Enviar WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    `;
  };

  openDialog(renderSbarContent(currentShift));

  const btnClose = document.getElementById("btn-close-sbar");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const getFullSbarText = () => {
    const s = document.getElementById("sbar-s")?.value.trim() || "Estável";
    const b = document.getElementById("sbar-b")?.value.trim() || "Sem intercorrências prévias";
    const a = document.getElementById("sbar-a")?.value.trim() || "Boa evolução clínica";
    const r = document.getElementById("sbar-r")?.value.trim() || "Seguir rotina da unidade";
    const isLgpd = document.getElementById("sbar-lgpd")?.checked;

    return generateSBARHandoff(currentShift, {
      situation: s,
      background: b,
      assessment: a,
      recommendation: r,
      anonymizePatient: isLgpd,
      doctorName,
      doctorCrm
    });
  };

  const btnCopy = document.getElementById("btn-copy-sbar");
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const text = getFullSbarText();
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
      triggerHaptic(15);
      showToast("Passagem SBAR copiada para o WhatsApp! 📋✨");
    });
  }

  const btnSend = document.getElementById("btn-send-whatsapp-sbar");
  if (btnSend) {
    btnSend.addEventListener("click", () => {
      const text = getFullSbarText();
      triggerHaptic(15);
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    });
  }
}

/**
 * DRE & Otimizador Fator R Dialog
 */
export function openDREDialog(targetMonth = state.activeMonth) {
  const dre = state.store.getDRE(targetMonth);
  const opt = state.store.getFatorROptimizer(targetMonth);

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("calculate", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">DRE & Otimizador Fator R</h3>
            <span class="text-[11px] text-primary font-semibold">${formatMonthYear(targetMonth)}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dre">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <div class="p-3.5 rounded-2xl bg-surface-container-low flex flex-col gap-2">
        <span class="text-[11px] font-bold text-on-surface uppercase tracking-wider">Demonstrativo do Resultado (DRE)</span>
        <div class="flex justify-between text-[12px] font-semibold py-1 border-b border-outline-variant/10">
          <span>(+) Faturamento Bruto (PJ + Consultório)</span>
          <span class="font-display font-bold text-primary ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.grossRevenueTotal || dre.grossRevenue)}</span>
        </div>
        <div class="flex justify-between text-[12px] text-error font-medium py-1 border-b border-outline-variant/10">
          <span>(-) Impostos Médicos (Simples / Carnê-Leão)</span>
          <span class="font-display font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.taxesTotal !== undefined ? dre.taxesTotal : dre.taxes)}</span>
        </div>
        <div class="flex justify-between text-[12px] font-bold text-on-surface py-1 border-b border-outline-variant/10">
          <span>(=) Receita Operacional Líquida</span>
          <span class="font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.netOperationalRevenue !== undefined ? dre.netOperationalRevenue : dre.netRevenue)}</span>
        </div>
        <div class="flex justify-between text-[12px] text-on-surface-variant py-1 border-b border-outline-variant/10">
          <span>(-) Custos Operacionais PJ (CRM, Deslocamento)</span>
          <span class="font-display font-medium text-error ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.pjExpensesTotal !== undefined ? dre.pjExpensesTotal : dre.pjOperatingExpenses)}</span>
        </div>
        <div class="flex justify-between text-[12px] text-primary font-semibold py-1 border-b border-outline-variant/10">
          <span>(-) Pró-Labore da Médica (Fator R 28%)</span>
          <span class="font-display font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.proLabore)}</span>
        </div>
        <div class="flex justify-between text-[12px] text-on-surface-variant py-1 border-b border-outline-variant/10">
          <span>(-) Despesas Pessoais PF (Vida, Família)</span>
          <span class="font-display font-medium text-error ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.pfExpensesTotal !== undefined ? dre.pfExpensesTotal : dre.pfExpenses)}</span>
        </div>
        <div class="flex justify-between text-[13px] font-extrabold text-tertiary pt-1.5">
          <span>(=) Superávit Mensal (Poupança Real)</span>
          <span class="font-display text-[15px] ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.realSuperavit !== undefined ? dre.realSuperavit : dre.netSurplus)}</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-secondary-fixed/20 border border-secondary/20 flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-bold text-secondary flex items-center gap-1">
            ${renderIcon("account_balance", "text-[16px]")}
            Fator R Dinâmico (Alíquota 6% no Simples)
          </span>
          <span id="dre-fator-r-badge" class="px-2 py-0.5 rounded-full ${opt.meetsThreshold || opt.isAnexoIII ? 'bg-tertiary-fixed text-tertiary' : 'bg-secondary-fixed text-secondary'} text-[11px] font-bold">
            ${opt.currentFatorR}% atual
          </span>
        </div>
        <p id="dre-fator-r-rec" class="text-[11px] text-on-surface-variant leading-snug">
          ${opt.recommendation}
        </p>

        <div class="p-2.5 rounded-xl bg-white flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-[10px] text-on-surface-variant uppercase">Pró-Labore Recomendado</span>
            <span class="text-[16px] font-bold text-secondary font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(opt.suggestedProLabore)}/mês</span>
          </div>
          <div class="flex flex-col text-right">
            <span class="text-[10px] text-on-surface-variant uppercase">Economia Anual Estimada</span>
            <span class="text-[16px] font-bold text-tertiary font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(opt.annualTaxSavings)}</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-secondary/10 text-[11px]">
          <span class="text-on-surface-variant">Simular Pró-Labore (R$/mês):</span>
          <input
            type="number"
            id="input-sim-prolabore"
            class="w-24 px-2 py-1 rounded-lg bg-white border border-outline-variant/30 text-right font-bold text-secondary focus:outline-none"
            value="${opt.suggestedProLabore}"
            step="100"
          />
        </div>
      </div>
    </div>
  `;

  openDialog(html);
  const btnClose = document.getElementById("btn-close-dre");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const inputSim = document.getElementById("input-sim-prolabore");
  const badgeEl = document.getElementById("dre-fator-r-badge");
  const recEl = document.getElementById("dre-fator-r-rec");
  if (inputSim && badgeEl && recEl) {
    inputSim.addEventListener("input", () => {
      const simVal = parseFloat(inputSim.value) || 0;
      const simOpt = state.store.getFatorROptimizer(targetMonth, { proLabore: simVal });
      badgeEl.textContent = `${simOpt.currentFatorR}% simulado`;
      badgeEl.className = `px-2 py-0.5 rounded-full ${simOpt.meetsThreshold || simOpt.isAnexoIII ? 'bg-tertiary-fixed text-tertiary' : 'bg-secondary-fixed text-secondary'} text-[11px] font-bold`;
      recEl.textContent = simOpt.recommendation;
    });
  }
}

/**
 * Conciliação Bancária Dialog (OFX / CSV)
 */
export function openReconciliationDialog() {
  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("upload_file", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Conciliação Bancária</h3>
            <span class="text-[11px] text-primary font-semibold">Extrato OFX ou CSV (Nubank, Santander, etc.)</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-reconcile">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <div class="border-2 border-dashed border-outline-variant/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center bg-surface-container-low/40 cursor-pointer hover:bg-surface-container-low transition-all" id="reconcile-dropzone">
        <span class="material-symbols-outlined text-[32px] text-secondary" data-icon="cloud_upload"></span>
        <div class="flex flex-col">
          <span class="text-[13px] font-bold text-on-surface">Selecione ou Arraste o Extrato Bancário</span>
          <span class="text-[11px] text-on-surface-variant">Formatos suportados: .ofx e .csv</span>
        </div>
        <input type="file" id="input-reconcile-file" accept=".ofx,.csv" class="hidden" />
      </div>

      <div id="reconciliation-results" class="flex flex-col gap-2">
        <!-- Reconciled items rendered here -->
      </div>
    </div>
  `;

  openDialog(html);
  const btnClose = document.getElementById("btn-close-reconcile");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const dropzone = document.getElementById("reconcile-dropzone");
  const fileInput = document.getElementById("input-reconcile-file");
  const resultsContainer = document.getElementById("reconciliation-results");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("border-secondary"); });
    dropzone.addEventListener("dragleave", () => { dropzone.classList.remove("border-secondary"); });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("border-secondary");
      if (e.dataTransfer?.files?.[0]) processExtractFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", (e) => {
      if (e.target.files?.[0]) processExtractFile(e.target.files[0]);
    });
  }

  function processExtractFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      let txs = [];
      if (file.name.toLowerCase().endsWith(".ofx")) {
        txs = parseOFX(content);
      } else {
        txs = parseBankCSV(content);
      }

      if (!txs || txs.length === 0) {
        showToast("Nenhuma transação encontrada no arquivo.", "warning");
        return;
      }

      const rec = state.store.reconcileBankTransactions(txs, state.activeMonth);
      renderReconciliationMatches(rec);
    };
    reader.readAsText(file);
  }

  function renderReconciliationMatches(rec) {
    if (!resultsContainer) return;
    const { matchedInflows, matchedOutflows } = rec;

    let html = `
      <div class="p-3 rounded-xl bg-tertiary-fixed/30 flex items-center justify-between">
        <span class="text-[12px] font-bold text-tertiary">
          ${matchedInflows.length} repasse(s) e ${matchedOutflows.length} despesa(s) identificados!
        </span>
        <button type="button" id="btn-confirm-all-reconciled" class="px-3 py-1 rounded-full bg-tertiary text-white text-[11px] font-bold active:scale-95 cursor-pointer">
          Conciliar Todos
        </button>
      </div>
    `;

    if (matchedInflows.length > 0) {
      html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-1 mt-2 tracking-wider">Entradas & Repasses Hospitalares</div>`;
      matchedInflows.forEach((m, idx) => {
        const txDate = m.bankTx?.date || m.transaction?.date || "";
        const txMemo = m.bankTx?.memo || m.transaction?.memo || "Depósito";
        let title = "";
        let amount = m.expectedAmount || (m.transaction ? m.transaction.amount : 0);

        if (m.type === "shift_installment" && m.shift) {
          title = `${m.shift.hospital} — ${m.installment?.number}ª parcela (${m.installment?.percent}%)`;
        } else if (m.type === "shift_full" && m.shift) {
          title = `${m.shift.hospital} — Quitação Integral`;
        } else if (m.type === "consultation" && m.consultation) {
          title = `Consulta: ${m.consultation.patientName}`;
        } else {
          title = m.suggestedAction || "Entrada Conciliada";
        }

        html += `
          <div class="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-2">
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-[12px] font-bold text-on-surface truncate">${title}</span>
              <span class="text-[11px] text-on-surface-variant truncate">${formatDateBR(txDate)} • ${txMemo}</span>
            </div>
            <div class="text-right flex items-center gap-2 shrink-0">
              <span class="text-[13px] font-bold text-tertiary">${formatCurrency(amount)}</span>
              <button type="button" class="btn-confirm-single-rec px-2.5 py-1 rounded-full bg-secondary-fixed text-secondary text-[11px] font-bold active:scale-95 cursor-pointer" data-inflow-idx="${idx}">
                Confirmar
              </button>
            </div>
          </div>
        `;
      });
    }

    if (matchedOutflows.length > 0) {
      html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-1 mt-2 tracking-wider">Saídas & Despesas Operacionais</div>`;
      matchedOutflows.forEach((m, idx) => {
        const txDate = m.bankTx?.date || m.transaction?.date || "";
        const txMemo = m.bankTx?.memo || m.transaction?.memo || "Pagamento";
        const title = m.expense ? `${m.expense.description} (${m.expense.category})` : (m.suggestedAction || "Despesa");
        const amount = m.expectedAmount || (m.expense ? m.expense.value : (m.transaction ? Math.abs(m.transaction.amount) : 0));

        html += `
          <div class="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-2">
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-[12px] font-bold text-on-surface truncate">${title}</span>
              <span class="text-[11px] text-on-surface-variant truncate">${formatDateBR(txDate)} • ${txMemo}</span>
            </div>
            <div class="text-right flex items-center gap-2 shrink-0">
              <span class="text-[13px] font-bold text-error">${formatCurrency(amount)}</span>
              <button type="button" class="btn-confirm-outflow-rec px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-[11px] font-bold active:scale-95 cursor-pointer" data-outflow-idx="${idx}">
                Confirmar
              </button>
            </div>
          </div>
        `;
      });
    }

    resultsContainer.innerHTML = html;
    if (typeof enhanceIcons === "function") enhanceIcons(resultsContainer);

    document.querySelectorAll(".btn-confirm-single-rec").forEach(b => {
      b.addEventListener("click", () => {
        const idx = parseInt(b.getAttribute("data-inflow-idx"), 10);
        const m = matchedInflows[idx];
        if (!m) return;
        const txDate = m.bankTx?.date || m.transaction?.date || null;

        if (m.type === "shift_installment" && m.shift && m.installment) {
          state.store.toggleShiftInstallment(m.shift.id, m.installment.number, txDate);
        } else if (m.type === "shift_full" && m.shift) {
          state.store.markShiftAsReceived(m.shift.id, txDate);
        } else if (m.type === "consultation" && m.consultation) {
          state.store.toggleConsultationPaid(m.consultation.id, txDate);
        } else if (m.shift) {
          state.store.markShiftAsReceived(m.shift.id, txDate);
        }

        b.textContent = "Confirmado ✓";
        b.disabled = true;
        b.classList.remove("bg-secondary-fixed", "text-secondary");
        b.classList.add("bg-tertiary-fixed", "text-tertiary");
        showToast("Repasse conciliado com sucesso! 🌸");
        renderCurrentView();
      });
    });

    document.querySelectorAll(".btn-confirm-outflow-rec").forEach(b => {
      b.addEventListener("click", () => {
        const idx = parseInt(b.getAttribute("data-outflow-idx"), 10);
        const m = matchedOutflows[idx];
        if (!m) return;

        if (m.expense) {
          state.store.updateExpense(m.expense.id, { isPaid: true });
        }

        b.textContent = "Baixado ✓";
        b.disabled = true;
        b.classList.remove("bg-primary-fixed", "text-primary");
        b.classList.add("bg-tertiary-fixed", "text-tertiary");
        showToast("Despesa conciliada e baixada! 🌸");
        renderCurrentView();
      });
    });

    const btnAll = document.getElementById("btn-confirm-all-reconciled");
    if (btnAll) {
      btnAll.addEventListener("click", () => {
        matchedInflows.forEach(m => {
          const txDate = m.bankTx?.date || m.transaction?.date || null;
          if (m.type === "shift_installment" && m.shift && m.installment) {
            state.store.toggleShiftInstallment(m.shift.id, m.installment.number, txDate);
          } else if (m.type === "shift_full" && m.shift) {
            state.store.markShiftAsReceived(m.shift.id, txDate);
          } else if (m.type === "consultation" && m.consultation) {
            state.store.toggleConsultationPaid(m.consultation.id, txDate);
          } else if (m.shift) {
            state.store.markShiftAsReceived(m.shift.id, txDate);
          }
        });

        matchedOutflows.forEach(m => {
          if (m.expense) {
            state.store.updateExpense(m.expense.id, { isPaid: true });
          }
        });

        showToast("Todos os repasses e despesas foram conciliados! 🌸");
        closeDialog();
        renderCurrentView();
      });
    }
  }
}

/**
 * Kit do Contador Dialog
 */
export function openAccountantKitDialog(targetMonth = state.activeMonth) {
  const kit = generateAccountantKit(targetMonth);

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("contact_phone", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Kit do Contador em 1 Toque</h3>
            <span class="text-[11px] text-primary font-semibold">${formatMonthYear(targetMonth)}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-accountant">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <p class="text-[12px] text-on-surface-variant leading-relaxed">
        Envie os dados contábeis consolidados com relatório executivo, resumo do Fator R e arquivo CSV compatível com Excel:
      </p>

      <pre class="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-[11px] text-on-surface whitespace-pre-wrap font-mono max-h-[220px] overflow-y-auto">${kit.summaryText}</pre>

      <div class="grid grid-cols-2 gap-2 pt-1">
        <button type="button" id="btn-download-accountant-csv" class="h-10 rounded-full bg-surface-container text-on-surface font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all">
          ${renderIcon("download", "text-[16px]")}
          <span>Baixar CSV</span>
        </button>
        <button type="button" id="btn-whatsapp-accountant" class="h-10 rounded-full bg-[#25D366] text-white font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
          ${renderIcon("send", "text-[16px]")}
          <span>WhatsApp Contador</span>
        </button>
      </div>
    </div>
  `;

  openDialog(html);
  const btnClose = document.getElementById("btn-close-accountant");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const btnDl = document.getElementById("btn-download-accountant-csv");
  if (btnDl) {
    btnDl.addEventListener("click", () => {
      const csvData = kit.csvContent || kit.csv || "";
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_contabil_${targetMonth}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("CSV para contabilidade baixado! 📄");
    });
  }


  const btnWa = document.getElementById("btn-whatsapp-accountant");
  if (btnWa) {
    btnWa.addEventListener("click", () => {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(kit.summaryText)}`;
      window.open(url, "_blank");
    });
  }
}

/**
 * Simulador FIRE Pediatra Dialog
 */
export function openFIREDialog() {
  const fire = state.store.getDoctorFIREMetrics();

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("local_fire_department", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Simulador FIRE Pediatra</h3>
            <span class="text-[11px] text-primary font-semibold">Liberdade & Independência de Plantões</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-fire">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-gradient-to-br from-secondary-fixed/30 to-primary-fixed/30 flex flex-col gap-2">
        <span class="text-[11px] font-bold text-secondary uppercase tracking-wider">Patrimônio FIRE Necessário (Regra dos 4%)</span>
        <span class="text-[28px] font-display font-bold text-on-surface ${state.privacyMode ? 'privacy-masked-text' : ''}">
          ${formatMoney(fire.targetNestEgg)}
        </span>
        <span class="text-[11px] text-on-surface-variant">Gera <strong>${formatMoney(fire.monthlyPassiveIncomeTarget)}/mês</strong> perpétuos sem necessidade de dar plantões.</span>
      </div>

      <div class="p-3.5 rounded-2xl bg-surface-container-low flex flex-col gap-2">
        <label class="text-[11px] font-bold text-on-surface flex items-center justify-between">
          <span>Seu Patrimônio Investido Atual (R$):</span>
          <span class="text-[10px] text-secondary font-semibold">Simulação Interativa</span>
        </label>
        <div class="relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-on-surface-variant">R$</span>
          <input
            type="number"
            id="input-fire-equity"
            value="${state.store.data.currentEquity || (fire.currentSavings > 0 ? fire.currentSavings : '')}"
            placeholder="Ex: 150000"
            class="w-full h-11 pl-10 pr-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-[14px] font-bold text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-center">
        <div class="p-3 rounded-xl bg-surface-container-low flex flex-col">
          <span class="text-[10px] text-on-surface-variant uppercase font-bold">Custo de Vida Médio</span>
          <span class="text-[16px] font-bold text-on-surface mt-0.5 ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(fire.averageMonthlyExpense)}/mês</span>
        </div>
        <div class="p-3 rounded-xl bg-surface-container-low flex flex-col">
          <span class="text-[10px] text-on-surface-variant uppercase font-bold">Patrimônio Atual</span>
          <span id="fire-accumulated-display" class="text-[16px] font-bold text-tertiary mt-0.5 ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(fire.currentSavings)}</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-surface-container-low flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-bold text-on-surface">Termômetro de Independência:</span>
          <span id="fire-shifts-count" class="text-[11px] font-bold text-secondary">${fire.shiftsReplacedCount} plantões eliminados!</span>
        </div>
        <div class="w-full h-3 rounded-full bg-surface-container overflow-hidden">
          <div id="fire-thermo-bar" class="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-300" style="width: ${Math.min(100, (fire.currentSavings / (fire.targetNestEgg || 1)) * 100)}%;"></div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
          <span>Renda passiva gerada: <strong id="fire-passive-income" class="text-tertiary">${formatMoney(fire.passiveMonthlyIncome)}/mês</strong></span>
          <span id="fire-badge" class="px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-bold text-[10px]">${fire.freedomBadge}</span>
        </div>
        <p class="text-[11px] text-on-surface-variant leading-snug">
          Cada R$ 1.800 de renda passiva mensal gerada pela sua carteira elimina <strong>1 plantão noturno de 12h</strong> para sempre da sua escala!
        </p>
      </div>
    </div>
  `;

  openDialog(html);
  const btnClose = document.getElementById("btn-close-fire");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const inputEq = document.getElementById("input-fire-equity");
  if (inputEq) {
    inputEq.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value) || 0;
      state.store.data.currentEquity = val;
      state.store.save();
      const updated = state.store.getDoctorFIREMetrics(val);

      const elAccum = document.getElementById("fire-accumulated-display");
      const elShifts = document.getElementById("fire-shifts-count");
      const elBar = document.getElementById("fire-thermo-bar");
      const elPassive = document.getElementById("fire-passive-income");
      const elBadge = document.getElementById("fire-badge");

      if (elAccum) elAccum.textContent = formatMoney(updated.currentSavings);
      if (elShifts) elShifts.textContent = `${updated.shiftsReplacedCount} plantões eliminados!`;
      if (elBar) elBar.style.width = `${Math.min(100, (updated.currentSavings / (updated.targetNestEgg || 1)) * 100)}%`;
      if (elPassive) elPassive.textContent = `${formatMoney(updated.passiveMonthlyIncome)}/mês`;
      if (elBadge) elBadge.textContent = updated.freedomBadge;

      triggerHaptic(8);
    });
  }
}

/**
 * Clinical Onboarding Wizard (3 Passos)
 */
export function checkOnboarding() {
  if (typeof window === "undefined" || typeof document === "undefined" || !document.body) return;
  if (typeof process !== "undefined" && process.env && (process.env.NODE_TEST_CONTEXT || process.env.NODE_ENV === "test")) return;
  const profile = state.store.data.drProfile || {};
  const shifts = state.store.data.shifts || [];
  if (!profile.completedOnboarding && shifts.length === 0) {
    setTimeout(() => {
      if (typeof document !== "undefined" && document.body && dom.dialogContainer) {
        openOnboardingDialog();
      }
    }, 400);
  }
}

export function openOnboardingDialog() {
  let step = 1;
  const renderStep = () => {
    if (step === 1) {
      return `
        <div class="p-5 flex flex-col gap-3.5">
          <div class="w-12 h-12 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center mx-auto">
            ${renderIcon("child_care", "text-[24px]")}
          </div>
          <div class="text-center">
            <h3 class="font-headline text-[18px] font-bold text-on-surface">Bem-vinda, Dra. Pediatra! 🩺✨</h3>
            <p class="text-[12px] text-on-surface-variant mt-1">Personalize seu Finanças Pediatria v3.0 em 3 passos rápidos.</p>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <label class="text-[11px] font-bold text-on-surface">Seu Nome / Como prefere ser chamada:</label>
            <input type="text" id="onboarding-name" value="${state.store.data.doctorName || 'Dra. Fernanda'}" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary" />
            <label class="text-[11px] font-bold text-on-surface mt-1">CRM e Especialidade:</label>
            <input type="text" id="onboarding-crm" value="${state.store.data.doctorCrm || 'CRM 123456-SP'}" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary" />
          </div>
          <button type="button" id="btn-next-step" class="w-full h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] mt-2 active:scale-95 transition-all">Próximo Passo ➔</button>
        </div>
      `;
    } else if (step === 2) {
      return `
        <div class="p-5 flex flex-col gap-3.5">
          <div class="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto">
            ${renderIcon("local_hospital", "text-[24px]")}
          </div>
          <div class="text-center">
            <h3 class="font-headline text-[18px] font-bold text-on-surface">Seus Hospitais & Regras 🏥</h3>
            <p class="text-[12px] text-on-surface-variant mt-1">Onde você realiza seus plantões habituais?</p>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <label class="text-[11px] font-bold text-on-surface">Hospital Principal:</label>
            <input type="text" id="onboarding-hospital" value="Hospital Mater Dei" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary" />
            <label class="text-[11px] font-bold text-on-surface mt-1">Regime Tributário Predominante:</label>
            <select id="onboarding-tax" class="w-full h-11 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface">
              <option value="6">PJ Simples Nacional (6% com Fator R)</option>
              <option value="11">PJ Lucro Presumido (~11.33%)</option>
              <option value="15.5">PJ Simples Anexo V (15.5%)</option>
              <option value="27.5">Pessoa Física / RPA (27.5%)</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <button type="button" id="btn-prev-step" class="h-11 rounded-full bg-surface-container text-on-surface font-bold text-[13px]">Voltar</button>
            <button type="button" id="btn-next-step" class="h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] active:scale-95">Próximo ➔</button>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="p-5 flex flex-col gap-3.5">
          <div class="w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center mx-auto">
            ${renderIcon("flag", "text-[24px]")}
          </div>
          <div class="text-center">
            <h3 class="font-headline text-[18px] font-bold text-on-surface">Sua Meta & Bem-Estar 🎯</h3>
            <p class="text-[12px] text-on-surface-variant mt-1">Defina sua meta de renda e limite de fadiga CFM.</p>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <label class="text-[11px] font-bold text-on-surface">Meta Mensal de Faturamento (R$):</label>
            <input type="number" id="onboarding-goal" value="20000" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary font-bold" />
            <label class="text-[11px] font-bold text-on-surface mt-1">Limite Máximo de Horas/Semana (CFM):</label>
            <input type="number" id="onboarding-fatigue" value="48" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary font-bold" />
          </div>
          <button type="button" id="btn-finish-onboarding" class="w-full h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] mt-2 active:scale-95 transition-all">Começar a Usar o App 🚀</button>
        </div>
      `;
    }
  };

  const updateDialog = () => {
    openDialog(renderStep());
    const btnNext = document.getElementById("btn-next-step");
    const btnPrev = document.getElementById("btn-prev-step");
    const btnFinish = document.getElementById("btn-finish-onboarding");

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        if (step === 1) {
          const name = document.getElementById("onboarding-name")?.value;
          const crm = document.getElementById("onboarding-crm")?.value;
          if (name) state.store.data.doctorName = name;
          if (crm) state.store.data.doctorCrm = crm;
        } else if (step === 2) {
          const hosp = document.getElementById("onboarding-hospital")?.value;
          const tax = parseFloat(document.getElementById("onboarding-tax")?.value);
          if (hosp && hosp.trim()) state.store.addWorkLocation(hosp.trim());
          if (!isNaN(tax)) state.store.data.defaultTaxRate = tax;
        }
        step++;
        updateDialog();
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        step--;
        updateDialog();
      });
    }

    if (btnFinish) {
      btnFinish.addEventListener("click", () => {
        const goal = parseFloat(document.getElementById("onboarding-goal")?.value) || 20000;
        const fatigue = parseInt(document.getElementById("onboarding-fatigue")?.value, 10) || 48;
        state.store.data.monthlyIncomeGoal = goal;
        if (!state.store.data.drProfile) state.store.data.drProfile = {};
        state.store.data.drProfile.completedOnboarding = true;
        state.store.data.drProfile.maxWeeklyHours = fatigue;
        state.store.save();
        closeDialog();
        showToast("Configurações iniciais salvas! Bem-vinda! 🌸", "verified");
        renderCurrentView();
      });
    }
  };

  updateDialog();
}

/**
 * Render Consultation Card
 */
export function renderConsultationCard(c) {
  const hourly = Math.round(c.value / ((c.durationMinutes || 60) / 60));

  return `
    <article class="card-floating p-4 flex flex-col justify-between transition-all" data-consultation-id="${c.id}">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full ${c.paid ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-primary'} flex items-center justify-center shrink-0">
            ${renderIcon(c.isPackage || c.consultationType?.includes("Puericultura") ? "child_friendly" : "stethoscope", "text-[20px]")}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h2 class="text-[15px] font-bold text-on-surface truncate">${c.patientName}</h2>
              <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[10px] font-bold">${c.consultationType}</span>
              ${c.puericulturaMonth ? `<span class="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">${c.puericulturaMonth}</span>` : ''}
            </div>
            <p class="text-[12px] text-on-surface-variant truncate">
              ${formatDateBR(c.date)} • ${c.durationMinutes || 60}min • ${c.paymentMethod || 'PIX'}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button type="button" class="btn-toggle-consultation-paid w-7 h-7 rounded-full ${c.paid ? 'text-tertiary' : 'text-on-surface-variant'} hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${c.id}" title="${c.paid ? 'Marcar como Pendente' : 'Marcar como Recebido'}">
            ${renderIcon(c.paid ? "check_circle" : "radio_button_unchecked", "text-[16px]")}
          </button>
          <button type="button" class="btn-edit-consultation w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${c.id}" title="Editar">
            ${renderIcon("edit", "text-[15px]")}
          </button>
          <button type="button" class="btn-delete-consultation w-7 h-7 rounded-full text-error/70 hover:bg-error-container/40 flex items-center justify-center active:scale-90" data-id="${c.id}" title="Excluir">
            ${renderIcon("delete", "text-[15px]")}
          </button>
        </div>
      </div>
      <div class="my-2 p-2.5 rounded-[16px] bg-surface-container-low/60 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-on-surface-variant block">Honorários</span>
          <span class="text-[16px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(c.value)}</span>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-on-surface-variant block">Rendimento/Hora</span>
          <span class="badge-rate-mint text-[11px] font-bold">
            R$ ${hourly}/h
          </span>
        </div>
      </div>
      ${c.notes ? `<p class="text-[11px] text-on-surface-variant italic truncate">${c.notes}</p>` : ''}
    </article>
  `;
}


/**
 * Toast notification manager with optional 1-tap Undo callback
 */
export function showToast(message, icon = "favorite", undoCallback = null) {
  if (!dom.toast || !dom.toastMsg) return;
  dom.toastMsg.textContent = message;

  const oldUndo = dom.toast.querySelector(".toast-undo-btn");
  if (oldUndo) oldUndo.remove();

  if (undoCallback && typeof undoCallback === "function") {
    const undoBtn = document.createElement("button");
    undoBtn.type = "button";
    undoBtn.className = "toast-undo-btn ml-2.5 px-2.5 py-0.5 rounded-full bg-white/25 hover:bg-white/40 text-white font-bold text-[11px] underline cursor-pointer transition-all active:scale-95";
    undoBtn.textContent = "Desfazer";
    undoBtn.onclick = (e) => {
      e.stopPropagation();
      undoCallback();
      dom.toast.classList.remove("show");
    };
    dom.toast.appendChild(undoBtn);
  }

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
    const u = dom.toast.querySelector(".toast-undo-btn");
    if (u) u.remove();
  }, undoCallback ? 5500 : 3200);
}

/**
 * Delightful pediatric visual reaction for entries (baby smiling + floating hearts)
 * or expenses (baby crying gently + caring encouragement).
 * @param {object} params { type: 'income'|'expense', title: string, message: string, amount: number }
 */
export function showBabyReaction({ type = 'income', title = '', message = '', amount = null } = {}) {
  if (!dom.babyOverlay || !dom.babyContent) return;

  const isIncome = type === 'income';
  const imgSrc = isIncome ? './assets/images/baby_happy.jpg' : './assets/images/baby_crying.jpg';
  const animClass = isIncome ? 'baby-joy-bounce' : 'baby-crying-shake';
  const defaultTitle = isIncome ? 'Uhull! Entrada Registrada! 👶💖' : 'Despesa Registrada! 🍼🥺';
  const defaultMsg = isIncome
    ? 'Bebê sorridente com corações! Seu faturamento pediátrico crescendo com saúde e amor.'
    : 'O bebê chora com a saída, mas tudo fica organizado e sob controle no seu orçamento!';

  const formattedAmount = amount !== null ? formatCurrency(amount) : '';

  dom.babyContent.innerHTML = `
    <!-- Floating Hearts or Droplets -->
    ${isIncome ? `
      <span class="floating-heart text-[24px]" style="left: 10%; top: 15%; animation-delay: 0s;">💖</span>
      <span class="floating-heart text-[28px]" style="left: 75%; top: 12%; animation-delay: 0.4s;">💕</span>
      <span class="floating-heart text-[20px]" style="left: 45%; top: 8%; animation-delay: 0.8s;">✨</span>
      <span class="floating-heart text-[22px]" style="left: 85%; top: 35%; animation-delay: 1.2s;">👶</span>
    ` : `
      <span class="floating-heart text-[22px]" style="left: 12%; top: 25%; animation-delay: 0s;">💧</span>
      <span class="floating-heart text-[26px]" style="left: 78%; top: 20%; animation-delay: 0.5s;">🍼</span>
      <span class="floating-heart text-[20px]" style="left: 50%; top: 10%; animation-delay: 1s;">🥺</span>
    `}

    <div class="w-28 h-28 mx-auto rounded-full overflow-hidden shadow-lg border-4 ${isIncome ? 'border-primary-pink' : 'border-lilac-medium'} ${animClass} relative mb-3 bg-primary-fixed flex items-center justify-center">
      <img
        src="${imgSrc}"
        alt="${isIncome ? 'Bebê feliz sorrindo' : 'Bebê chorando dengoso'}"
        class="w-full h-full object-cover"
        onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.classList.remove('hidden');"
      />
      <div class="w-full h-full hidden flex items-center justify-center text-[44px]">
        ${isIncome ? '👶💖' : '🥺🍼'}
      </div>
    </div>

    <h3 class="font-headline text-[17px] font-bold ${isIncome ? 'text-secondary' : 'text-primary'} mb-1">
      ${title || defaultTitle}
    </h3>

    ${formattedAmount ? `
      <div class="text-[17px] font-extrabold text-on-surface font-display mb-1.5">
        ${formattedAmount}
      </div>
    ` : ''}

    <p class="text-[12px] text-on-surface-variant leading-relaxed mb-4 px-2">
      ${message || defaultMsg}
    </p>

    <button
      type="button"
      id="btn-close-baby-reaction"
      class="h-10 px-6 rounded-full bg-gradient-to-r ${isIncome ? 'from-secondary to-primary' : 'from-primary to-secondary'} text-white font-bold text-[13px] shadow-sm transition-all active:scale-95 mx-auto"
    >
      Continuar ✨
    </button>
  `;

  dom.babyOverlay.classList.add("active");
  triggerHaptic(20);

  const closeReaction = () => {
    if (dom.babyOverlay) dom.babyOverlay.classList.remove("active");
  };

  const closeBtn = document.getElementById("btn-close-baby-reaction");
  if (closeBtn) closeBtn.onclick = closeReaction;
  dom.babyOverlay.onclick = (e) => {
    if (e.target === dom.babyOverlay) closeReaction();
  };

  if (dom.babyTimeout) clearTimeout(dom.babyTimeout);
  dom.babyTimeout = setTimeout(closeReaction, 2800);
}

/**
 * Dialog Modal Controllers (iOS Style)
 */
export function openDialog(html) {
  if (!dom.dialogContainer || !dom.dialogOverlay || typeof document === "undefined" || !document.body) return;
  dom.dialogContainer.innerHTML = html;
  if (typeof enhanceIcons === "function") {
    enhanceIcons(dom.dialogContainer);
  }
  dom.dialogOverlay.classList.add("active");
  dom.dialogContainer.classList.add("active");
  if (document.body && document.body.style) document.body.style.overflow = "hidden";
}

export function closeDialog() {
  if (!dom.dialogContainer || !dom.dialogOverlay) return;
  dom.dialogOverlay.classList.remove("active");
  dom.dialogContainer.classList.remove("active");
  if (typeof document !== "undefined" && document.body && document.body.style) document.body.style.overflow = "";
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
 * Interactive Modal to Create or Edit Expense Category (PF / PJ)
 */
export function openCategoryModal({ mode = "add", initialData = null, onSave, onCancel } = {}) {
  const isEdit = mode === "edit";
  const initName = initialData && initialData.name ? initialData.name : "";
  const initScope = initialData && initialData.scope ? initialData.scope : "pf";

  const html = `
    <div class="p-5 flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center font-bold">
            ${renderIcon('category', 'text-[22px]')}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">
              ${isEdit ? 'Editar Categoria' : 'Nova Categoria de Despesa'}
            </h3>
            <span class="text-[11px] text-on-surface-variant font-medium">
              ${isEdit ? 'Atualize o nome ou escopo da categoria' : 'Ex: Contador, Mercantil/Mercado, Lanches...'}
            </span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container cursor-pointer" id="btn-close-cat-modal">
          ${renderIcon('close', 'text-[18px]')}
        </button>
      </div>

      <form id="form-category-modal" class="flex flex-col gap-3.5">
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface-variant">Nome da Categoria</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
            ${renderIcon('label', 'text-[18px] text-secondary')}
            <input
              type="text"
              id="input-modal-cat-name"
              class="w-full bg-transparent text-[13px] font-semibold text-on-surface focus:outline-none placeholder:text-outline"
              placeholder="Ex: Contador, Mercantil/Mercado, Lanches..."
              value="${initName}"
              required
              autofocus
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Escopo da Despesa</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="modal-cat-scope-btn py-2 px-3 rounded-2xl text-[12px] font-bold text-center transition-all cursor-pointer ${initScope === 'pf' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-scope="pf"
            >
              ${renderIcon('person', 'text-[15px] inline mr-1')} Pessoa Física (PF)
            </button>
            <button
              type="button"
              class="modal-cat-scope-btn py-2 px-3 rounded-2xl text-[12px] font-bold text-center transition-all cursor-pointer ${initScope === 'pj' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-scope="pj"
            >
              ${renderIcon('business', 'text-[15px] inline mr-1')} Pessoa Jurídica (PJ)
            </button>
          </div>
          <input type="hidden" id="input-modal-cat-scope" value="${initScope}" />
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-2 border-t border-purple-100">
          <button
            type="button"
            id="btn-cancel-cat-modal"
            class="h-11 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-bold text-[13px] transition-all active:scale-95 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            ${renderIcon('check', 'text-[18px]')}
            <span>${isEdit ? 'Salvar Alteração' : 'Criar Categoria'}</span>
          </button>
        </div>
      </form>
    </div>
  `;

  openDialog(html);

  setTimeout(() => {
    document.getElementById("input-modal-cat-name")?.focus();
  }, 80);

  const scopeBtns = document.querySelectorAll(".modal-cat-scope-btn");
  scopeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const scope = btn.getAttribute("data-scope");
      const hiddenInput = document.getElementById("input-modal-cat-scope");
      if (hiddenInput) hiddenInput.value = scope;
      scopeBtns.forEach(b => {
        b.classList.remove("bg-secondary", "text-white", "shadow-sm");
        b.classList.add("bg-surface-container-low", "text-on-surface-variant");
      });
      btn.classList.add("bg-secondary", "text-white", "shadow-sm");
      btn.classList.remove("bg-surface-container-low", "text-on-surface-variant");
    });
  });

  const handleClose = () => {
    closeDialog();
    if (typeof onCancel === "function") onCancel();
  };

  document.getElementById("btn-close-cat-modal")?.addEventListener("click", handleClose);
  document.getElementById("btn-cancel-cat-modal")?.addEventListener("click", handleClose);

  document.getElementById("form-category-modal")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("input-modal-cat-name")?.value.trim();
    const scope = document.getElementById("input-modal-cat-scope")?.value || "pf";
    if (!name) {
      showToast("Informe o nome da categoria.", "warning");
      return;
    }
    closeDialog();
    if (typeof onSave === "function") {
      onSave({ id: initialData?.id, name, scope });
    }
  });
}

/**
 * Quick Category Switcher Dialog for Expenses (1-tap modification from Expense Card)
 */
export function openQuickCategoryChangeDialog(expense) {
  const currentCategory = expense.category;
  const categoriesPF = state.store.getExpenseCategories ? state.store.getExpenseCategories("pf") : EXPENSE_CATEGORIES_PF;
  const categoriesPJ = state.store.getExpenseCategories ? state.store.getExpenseCategories("pj") : EXPENSE_CATEGORIES_PJ;

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto font-body">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center font-bold">
            ${renderIcon('category', 'text-[22px]')}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Modificar Categoria</h3>
            <p class="text-[11px] text-on-surface-variant font-medium truncate max-w-[220px]">
              ${expense.description} • Atual: <span class="font-bold text-secondary">${currentCategory}</span>
            </p>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container cursor-pointer" id="btn-close-quick-cat">
          ${renderIcon('close', 'text-[18px]')}
        </button>
      </div>

      <!-- Direct Entry / Free Text Input -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] font-bold text-on-surface-variant">Digite qualquer categoria que desejar:</label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 border border-transparent focus-within:border-secondary focus-within:bg-white transition-all shadow-xs">
          ${renderIcon('edit_note', 'text-[20px] text-secondary')}
          <input
            type="text"
            id="input-quick-custom-cat"
            class="w-full bg-transparent text-[13px] font-semibold text-on-surface focus:outline-none placeholder:text-outline"
            placeholder="Ex: Contador, Mercantil/Mercado, Lanches..."
            value=""
            autofocus
          />
          <button
            type="button"
            id="btn-apply-quick-custom-cat"
            class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-[11px] font-bold shrink-0 shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      </div>

      <!-- Quick Category Selectors PF & PJ -->
      <div class="flex flex-col gap-2.5 pt-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-secondary uppercase tracking-wider">🌸 Pessoa Física (Pessoal)</span>
        </div>
        <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
          ${categoriesPF.map(cat => `
            <button
              type="button"
              class="quick-select-cat-btn px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${currentCategory === cat ? 'bg-secondary text-white shadow-xs font-black' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-category="${cat}"
              data-scope="pf"
            >
              ${cat}
            </button>
          `).join("")}
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-[11px] font-bold text-tertiary uppercase tracking-wider">🩺 Pessoa Jurídica (Trabalho)</span>
        </div>
        <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
          ${categoriesPJ.map(cat => `
            <button
              type="button"
              class="quick-select-cat-btn px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${currentCategory === cat ? 'bg-tertiary text-white shadow-xs font-black' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-category="${cat}"
              data-scope="pj"
            >
              ${cat}
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  openDialog(html);

  setTimeout(() => {
    document.getElementById("input-quick-custom-cat")?.focus();
  }, 80);

  const applyCategoryChange = (newCat, scope = null) => {
    const trimmed = newCat.trim();
    if (!trimmed) {
      showToast("Informe o nome da categoria.", "warning");
      return;
    }
    const resolvedScope = scope || (state.store.getCategoryScope ? state.store.getCategoryScope(trimmed) : "pf");
    state.store.updateExpense(expense.id, {
      category: trimmed,
      scope: resolvedScope
    });
    closeDialog();
    renderCurrentView();
    showToast(`Categoria alterada para '${trimmed}'! ✨`);
  };

  document.getElementById("btn-close-quick-cat")?.addEventListener("click", closeDialog);

  document.querySelectorAll(".quick-select-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-category");
      const scope = btn.getAttribute("data-scope");
      applyCategoryChange(cat, scope);
    });
  });

  const handleApplyInput = () => {
    const customVal = document.getElementById("input-quick-custom-cat")?.value;
    if (customVal && customVal.trim()) {
      applyCategoryChange(customVal.trim());
    } else {
      showToast("Digite o nome da categoria.", "warning");
    }
  };

  document.getElementById("btn-apply-quick-custom-cat")?.addEventListener("click", handleApplyInput);

  document.getElementById("input-quick-custom-cat")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyInput();
    }
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
          <span class="text-[11px] font-bold uppercase tracking-wider text-primary">Finanças Pediatria • Recibo</span>
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
  const allWorkTypes = state.store.getWorkTypes();
  const activeWorkTypes = state.store.getActiveWorkTypes();
  const workLocations = state.store.getWorkLocations();
  const customCategories = state.store.getCustomExpenseCategories ? state.store.getCustomExpenseCategories() : [];

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-[12px]">
            ${initials}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Perfil da Médica & Configurações</h3>
            <span class="text-[11px] text-primary font-semibold">Atuação, Metas & Segurança</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container cursor-pointer" id="btn-close-dialog">
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

        <!-- Tipos de Atuação da Médica (Personalização - ex: ainda não atua em clínica) -->
        <div class="flex flex-col gap-1.5 p-3 rounded-2xl bg-surface-container-low border border-purple-100">
          <div class="flex items-center justify-between">
            <label class="text-[12px] font-bold text-on-surface flex items-center gap-1">
              ${renderIcon('work', 'text-[15px] text-secondary')}
              <span>Tipos de Atuação Pediátrica</span>
            </label>
            <span class="text-[10px] text-on-surface-variant">Selecione suas áreas ativas</span>
          </div>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Se você ainda não atua em clínica ou consultório, mantenha apenas as áreas em que atende hoje:
          </p>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${allWorkTypes.map(type => {
              const isActive = activeWorkTypes.includes(type);
              return `
                <button
                  type="button"
                  class="btn-toggle-work-type px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${isActive ? 'bg-secondary text-white shadow-sm' : 'bg-white text-on-surface-variant border border-outline-variant/40'}"
                  data-work-type="${type}"
                >
                  ${type} ${isActive ? '✓' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Locais de Trabalho Pré-determinados -->
        <div class="flex flex-col gap-1.5 p-3 rounded-2xl bg-surface-container-low border border-purple-100">
          <div class="flex items-center justify-between">
            <label class="text-[12px] font-bold text-on-surface flex items-center gap-1">
              ${renderIcon('local_hospital', 'text-[15px] text-primary')}
              <span>Locais de Trabalho & Maternidades</span>
            </label>
            <button type="button" id="btn-add-profile-location" class="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
              ${renderIcon('add', 'text-[13px]')} + Novo Local
            </button>
          </div>
          <div class="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto" id="profile-locations-container">
            ${workLocations.map(loc => `
              <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-on-surface border border-outline-variant/40 flex items-center gap-1">
                ${loc}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Categorias de Despesas Personalizadas (PF & PJ) -->
        <div class="flex flex-col gap-2 p-3 rounded-2xl bg-surface-container-low border border-purple-100">
          <div class="flex items-center justify-between">
            <label class="text-[12px] font-bold text-on-surface flex items-center gap-1">
              ${renderIcon('category', 'text-[15px] text-secondary')}
              <span>Categorias de Despesas Personalizadas</span>
            </label>
            <button type="button" id="btn-add-profile-category" class="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
              ${renderIcon('add', 'text-[13px]')} + Nova Categoria
            </button>
          </div>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Adicione ou edite suas próprias categorias (ex: Contador, Mercantil/Mercado, Lanches):
          </p>
          <div class="flex flex-col gap-1.5 pt-0.5 max-h-36 overflow-y-auto no-scrollbar" id="profile-custom-categories-container">
            ${customCategories.length === 0 ? `
              <div class="text-[11px] text-on-surface-variant/70 italic py-2 px-3 rounded-xl bg-white/70 border border-purple-100/60 text-center">
                Nenhuma categoria personalizada criada ainda.<br />
                <span class="text-primary font-semibold">Toque em "+ Nova Categoria" acima para acrescentar.</span>
              </div>
            ` : customCategories.map(cat => `
              <div class="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-outline-variant/30 text-[12px] shadow-2xs">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${cat.scope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}">
                    ${cat.scope === 'pj' ? 'PJ' : 'PF'}
                  </span>
                  <span class="font-bold text-on-surface text-[12px]">${cat.name}</span>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="btn-edit-profile-category p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                    data-cat-id="${cat.id}"
                    data-cat-name="${cat.name}"
                    data-cat-scope="${cat.scope}"
                    title="Editar categoria"
                  >
                    ${renderIcon('edit', 'text-[14px]')}
                  </button>
                  <button
                    type="button"
                    class="btn-delete-profile-category p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors cursor-pointer"
                    data-cat-id="${cat.id}"
                    data-cat-name="${cat.name}"
                    title="Excluir categoria"
                  >
                    ${renderIcon('delete', 'text-[14px]')}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
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

      <!-- Safety, Trash & Recovery Hub -->
      <div class="pt-2 border-t border-purple-100 flex flex-col gap-2">
        <button
          type="button"
          id="btn-dialog-open-trash"
          class="h-10 w-full rounded-full bg-purple-50 hover:bg-purple-100 text-secondary font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-sm border border-secondary/20"
        >
          ${renderIcon('restore_from_trash', 'text-[16px]')}
          <span>Lixeira & Restauração de Dados em 1 Toque</span>
        </button>

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

      <!-- Immutable Creator Signature Badge -->
      <div class="p-3 rounded-2xl bg-gradient-to-r from-secondary-fixed/40 to-primary-fixed/40 border border-purple-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-[20px]">🩺💖</span>
          <div class="flex flex-col">
            <span class="text-[12px] font-bold text-on-surface">${APP_CREATOR.signature}</span>
            <span class="text-[10px] text-on-surface-variant font-medium">Finanças Pediatria • Tecnologia & Cuidado</span>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-full bg-secondary text-white text-[10px] font-bold">Oficial</span>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  document.getElementById("btn-dialog-open-trash")?.addEventListener("click", () => {
    closeDialog();
    openTrashDialog();
  });

  document.querySelectorAll(".btn-toggle-work-type").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-work-type");
      const activeList = state.store.toggleActiveWorkType(type);
      const isActive = activeList.includes(type);
      if (isActive) {
        btn.className = "btn-toggle-work-type px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 bg-secondary text-white shadow-sm";
        btn.innerHTML = `${type} ✓`;
        showToast(`Atuação em '${type}' ativada!`);
      } else {
        btn.className = "btn-toggle-work-type px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 bg-white text-on-surface-variant border border-outline-variant/40";
        btn.innerHTML = type;
        showToast(`Atuação em '${type}' desativada.`);
      }
    });
  });

  document.getElementById("btn-add-profile-location")?.addEventListener("click", () => {
    const locName = prompt("Digite o nome da maternidade ou local de trabalho:");
    if (locName && locName.trim()) {
      state.store.addWorkLocation(locName.trim());
      showToast(`Local '${locName.trim()}' adicionado! 🏥`);
      openDoctorProfileDialog();
    }
  });

  document.getElementById("btn-add-profile-category")?.addEventListener("click", () => {
    openCategoryModal({
      mode: "add",
      onSave: ({ name, scope }) => {
        state.store.addExpenseCategory({ name, scope });
        showToast(`Categoria '${name}' adicionada com sucesso! ✨`);
        openDoctorProfileDialog();
      },
      onCancel: () => {
        openDoctorProfileDialog();
      }
    });
  });

  document.querySelectorAll(".btn-edit-profile-category").forEach(btn => {
    btn.addEventListener("click", () => {
      const catId = btn.getAttribute("data-cat-id");
      const catName = btn.getAttribute("data-cat-name");
      const catScope = btn.getAttribute("data-cat-scope");
      openCategoryModal({
        mode: "edit",
        initialData: { id: catId, name: catName, scope: catScope },
        onSave: ({ id, name, scope }) => {
          state.store.updateExpenseCategory(id, { name, scope });
          showToast(`Categoria atualizada para '${name}'! ✨`);
          openDoctorProfileDialog();
        },
        onCancel: () => {
          openDoctorProfileDialog();
        }
      });
    });
  });

  document.querySelectorAll(".btn-delete-profile-category").forEach(btn => {
    btn.addEventListener("click", () => {
      const catId = btn.getAttribute("data-cat-id");
      const catName = btn.getAttribute("data-cat-name");
      showConfirmDialog({
        title: "Excluir Categoria?",
        message: `Deseja remover a categoria '${catName}'? Suas despesas existentes continuarão registradas.`,
        isDanger: true,
        confirmText: "Excluir",
        onConfirm: () => {
          state.store.deleteExpenseCategory(catId);
          showToast(`Categoria '${catName}' removida.`);
          openDoctorProfileDialog();
        }
      });
    });
  });

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
 * Trash & Safety Data Recovery Dialog (Lixeira & Histórico)
 */
export function openTrashDialog() {
  const trashItems = state.store.getTrash();

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon('restore_from_trash', 'text-[20px]')}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Lixeira & Restauração</h3>
            <span class="text-[11px] text-primary font-semibold">Recupere plantões e despesas com 1 toque</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon('close', 'text-[18px]')}
        </button>
      </div>

      <!-- Quick Backup & Safety Controls -->
      <div class="p-3 bg-surface-container-low rounded-2xl flex items-center justify-between gap-2 border border-purple-100">
        <div class="flex flex-col">
          <span class="text-[12px] font-bold text-on-surface">Backup de Segurança</span>
          <span class="text-[10px] text-on-surface-variant">Proteja seus dados localmente no aparelho</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" id="btn-save-backup-now" class="px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all">
            Salvar Cópia
          </button>
          <button type="button" id="btn-restore-backup-now" class="px-2.5 py-1 rounded-full bg-white text-secondary border border-secondary/30 text-[11px] font-bold active:scale-95 transition-all">
            Restaurar
          </button>
        </div>
      </div>

      <!-- Trash Items List -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-bold text-on-surface-variant">Itens Excluídos Recentemente (${trashItems.length})</span>
          ${trashItems.length > 0 ? `
            <button type="button" id="btn-empty-trash" class="text-[11px] font-bold text-error hover:underline">
              Esvaziar Lixeira
            </button>
          ` : ''}
        </div>

        ${trashItems.length === 0 ? `
          <div class="py-8 px-4 text-center rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/50 flex flex-col items-center gap-2">
            ${renderIcon('delete_sweep', 'text-[32px] text-outline')}
            <span class="text-[13px] font-semibold text-on-surface">Sua lixeira está vazia!</span>
            <span class="text-[11px] text-on-surface-variant">Quando você excluir algum plantão ou despesa, ele ficará guardado aqui para restauração imediata.</span>
          </div>
        ` : `
          <div class="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
            ${trashItems.map(item => `
              <div class="p-3 rounded-2xl bg-surface-container-low border border-purple-100 flex items-center justify-between gap-2 shadow-sm">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-full ${item.itemType === 'shift' ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'} flex items-center justify-center shrink-0">
                    ${renderIcon(item.itemType === 'shift' ? 'stethoscope' : 'receipt', 'text-[16px]')}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[12px] font-bold text-on-surface truncate">${item.label || (item.itemType === 'shift' ? item.item.hospital : item.item.description)}</span>
                    <span class="text-[10px] text-on-surface-variant">Excluído em ${new Date(item.deletedAt).toLocaleDateString('pt-BR')} às ${new Date(item.deletedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-restore-item shrink-0 px-3 py-1.5 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all flex items-center gap-1"
                  data-trash-id="${item.id}"
                >
                  ${renderIcon('restore_from_trash', 'text-[14px]')}
                  <span>Restaurar</span>
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  document.querySelectorAll(".btn-restore-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const trashId = btn.getAttribute("data-trash-id");
      const restored = state.store.restoreFromTrash(trashId);
      if (restored) {
        showToast("Item restaurado com sucesso! 🌸", "restore_from_trash");
        closeDialog();
        renderCurrentView();
      }
    });
  });

  document.getElementById("btn-empty-trash")?.addEventListener("click", () => {
    showConfirmDialog({
      title: "Esvaziar Lixeira?",
      message: "Tem certeza de que deseja esvaziar permanentemente todos os itens da lixeira?",
      isDanger: true,
      confirmText: "Sim, Esvaziar",
      onConfirm: () => {
        state.store.emptyTrash();
        showToast("Lixeira esvaziada! 🗑️");
        closeDialog();
      }
    });
  });

  document.getElementById("btn-save-backup-now")?.addEventListener("click", () => {
    state.store.saveBackup();
    showToast("Backup local salvo no aparelho com sucesso! 🛡️");
  });

  document.getElementById("btn-restore-backup-now")?.addEventListener("click", () => {
    showConfirmDialog({
      title: "Restaurar Cópia de Segurança?",
      message: "Deseja restaurar a última cópia salva do seu banco de dados local?",
      confirmText: "Sim, Restaurar",
      onConfirm: () => {
        const ok = state.store.restoreBackup();
        if (ok) {
          showToast("Cópia de segurança restaurada! 🌸");
          closeDialog();
          renderCurrentView();
        } else {
          showToast("Nenhum backup encontrado.", "warning");
        }
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
        <img src="./assets/icons/icon-192.png" alt="Finanças Pediatria" class="w-12 h-12 rounded-2xl shadow-sm border border-white" />
        <div class="flex flex-col">
          <span class="font-headline text-[14px] font-bold text-on-surface">Finanças Pediatria</span>
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
  const consMetrics = state.store.getConsultationMetrics(state.activeMonth);

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

      <!-- 2.3. Quick Actions Hub (Atalhos Clínicos & Contábeis) -->
      <section class="grid grid-cols-4 gap-2">
        <button type="button" class="btn-quick-consultation p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center">
            ${renderIcon("child_friendly", "text-[18px]")}
          </div>
          <span class="text-[10px] font-bold text-on-surface leading-tight">Consultório</span>
        </button>
        <button type="button" class="btn-quick-sbar p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("swap_horiz", "text-[18px]")}
          </div>
          <span class="text-[10px] font-bold text-on-surface leading-tight">SBAR</span>
        </button>
        <button type="button" class="btn-quick-dre p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            ${renderIcon("calculate", "text-[18px]")}
          </div>
          <span class="text-[10px] font-bold text-on-surface leading-tight">DRE / Fator R</span>
        </button>
        <button type="button" class="btn-quick-reconcile p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center">
            ${renderIcon("upload_file", "text-[18px]")}
          </div>
          <span class="text-[10px] font-bold text-on-surface leading-tight">Conciliação</span>
        </button>
      </section>

      <!-- 2.4. Consultório vs Plantão (Rendimento Horário) -->
      <section class="card-floating p-4 flex flex-col gap-2.5 bg-gradient-to-br from-white to-tertiary-fixed/20 border border-teal-50">
        <div class="flex items-center justify-between border-b border-teal-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center">
              ${renderIcon("child_friendly", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Consultório vs Plantão</h2>
              <span class="text-[11px] text-tertiary font-semibold">Comparativo de Rendimento por Hora</span>
            </div>
          </div>
          <button type="button" class="btn-quick-consultation text-[11px] font-bold text-tertiary hover:underline flex items-center gap-1">
            ${renderIcon("add", "text-[14px]")}
            <span>+ Consulta</span>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 text-center pt-1">
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col">
            <span class="text-[10px] text-on-surface-variant font-bold uppercase">Consultório (Particular)</span>
            <span class="text-[18px] font-bold text-tertiary font-display mt-0.5">R$ ${consMetrics.consultationHourlyRate}/h</span>
            <span class="text-[9px] text-on-surface-variant">${consMetrics.totalConsultations} atendimentos</span>
          </div>
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col">
            <span class="text-[10px] text-on-surface-variant font-bold uppercase">Plantões Hospitalares</span>
            <span class="text-[18px] font-bold text-primary font-display mt-0.5">R$ ${consMetrics.shiftHourlyRate}/h</span>
            <span class="text-[9px] text-on-surface-variant">Média em hospitais</span>
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-tertiary-fixed/30 text-[11px] text-on-surface-variant flex items-center justify-between">
          <span>Vantagem do Consultório:</span>
          <strong class="text-tertiary text-[12px] font-bold">${consMetrics.consultationAdvantagePercent >= 0 ? '+' : ''}${consMetrics.consultationAdvantagePercent}% por hora</strong>
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

      <!-- Creator Signature Footer -->
      <div class="text-center py-2 text-[11px] text-on-surface-variant font-medium">
        Finanças Pediatria • ${APP_CREATOR.signature} 🩺💖
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

      <!-- Consultations & Puericultura Section -->
      <section class="flex flex-col gap-2.5 mt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center">
              ${renderIcon("child_friendly", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[16px] font-bold text-on-surface">Consultório & Puericultura</h2>
              <span class="text-[11px] text-on-surface-variant">${state.store.getConsultations(state.activeMonth).length} atendimentos em ${formatMonthYear(state.activeMonth)}</span>
            </div>
          </div>
          <button type="button" class="btn-new-consultation-top px-3 py-1.5 rounded-full bg-tertiary text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1">
            ${renderIcon("add", "text-[14px]")}
            <span>Nova Consulta</span>
          </button>
        </div>

        <div class="flex flex-col gap-2.5">
          ${state.store.getConsultations(state.activeMonth).length > 0 ? state.store.getConsultations(state.activeMonth).map(c => renderConsultationCard(c)).join("") : `
            <div class="p-5 rounded-2xl bg-surface-container-low text-center text-on-surface-variant text-[12px]">
              Nenhum atendimento de consultório registrado neste mês.
              <button type="button" class="btn-new-consultation-top block mx-auto mt-2 text-tertiary font-bold hover:underline">
                + Cadastrar Consulta ou Puericultura
              </button>
            </div>
          `}
        </div>
      </section>

      <!-- Creator Signature Footer -->
      <div class="text-center py-2 text-[11px] text-on-surface-variant font-medium">
        Finanças Pediatria • ${APP_CREATOR.signature} 🩺💖
      </div>
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
  const isInstallment = Boolean(shift.isInstallment);
  const ev = evaluateShiftStatus(shift, state.referenceDate);
  const isDelayed = ev.status === "delayed";
  const isReceived = ev.status === "received" || (isInstallment && shift.installmentStatus === "received");

  let statusBadgeClass = "badge-pending";
  let statusIcon = "schedule";
  if (isDelayed) {
    statusBadgeClass = "badge-delayed";
    statusIcon = "warning";
  } else if (isReceived) {
    statusBadgeClass = "badge-received";
    statusIcon = "check_circle";
  } else if (ev.status === "partial") {
    statusBadgeClass = "badge-pending";
    statusIcon = "payments";
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
              ${isInstallment ? `
                <span class="px-2 py-0.5 rounded-full ${shift.installmentNumber === 1 ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-primary-fixed text-on-primary-fixed'} text-[10px] font-extrabold shadow-xs">
                  ${shift.installmentNumber}ª Parcela (${shift.installmentPercent}%)
                </span>
              ` : ''}
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
          <span class="text-[11px] text-on-surface-variant block">${isInstallment ? `Valor da ${shift.installmentNumber}ª Parcela (${shift.installmentPercent}%)` : 'Valor Líquido'}</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-[16px] font-bold ${isDelayed ? 'text-error' : 'text-on-surface'} ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(shift.netValue)}</span>
            ${hourlyRate > 0 && !isInstallment ? `
              <span class="${hourlyRate >= 150 ? 'badge-rate-gold' : 'badge-rate-mint'}">
                R$ ${hourlyRate}/h
              </span>
            ` : ''}
          </div>
        </div>
        <div class="text-right">
          <span class="text-[11px] text-outline block">${isInstallment ? 'Vencimento Previsto' : 'Valor Bruto'}</span>
          <span class="text-[13px] text-on-surface-variant font-medium ${state.privacyMode ? 'privacy-masked-text' : ''}">
            ${isInstallment ? formatDateBR(shift.installmentDueDate) : formatMoney(shift.grossValue)}
          </span>
        </div>
      </div>

      ${shift.notes ? `
        <div class="mb-2.5 px-2.5 py-1.5 rounded-xl bg-surface-container-low/50 text-[11px] text-on-surface-variant flex items-center gap-1.5">
          ${renderIcon("sticky_note_2", "text-[14px] text-secondary shrink-0")}
          <span class="truncate italic">${shift.notes}</span>
        </div>
      ` : ''}

      <!-- Detailed 80% D+60 and 20% D+90 Installment Pills (for full shift cards) -->
      ${!isInstallment && shift.splitPayment && Array.isArray(shift.installments) && shift.installments.length === 2 ? `
        <div class="mb-3 p-2.5 rounded-2xl bg-surface-container-low border border-purple-100 flex flex-col gap-1.5 text-[11px]">
          <div class="flex items-center justify-between text-[10px] text-on-surface-variant font-bold pb-0.5">
            <span class="flex items-center gap-1 text-primary">
              ${renderIcon("payments", "text-[14px]")} Repasses do Plantão (80% D+60 / 20% D+90)
            </span>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            ${shift.installments.map(inst => `
              <div class="bg-white p-2 rounded-xl border border-purple-50 shadow-2xs flex flex-col justify-between gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-on-surface text-[10px]">${inst.number}ª Parc. (${inst.percent}%)</span>
                  <span class="w-2 h-2 rounded-full ${inst.status === 'received' ? 'bg-tertiary' : 'bg-secondary'}"></span>
                </div>
                <span class="font-extrabold text-on-surface text-[12px] font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(inst.value)}</span>
                <span class="text-[9px] text-on-surface-variant">${formatDateBR(inst.dueDate)}</span>
                <button
                  type="button"
                  class="btn-toggle-shift w-full py-1 mt-0.5 rounded-full text-[10px] font-bold transition-all active:scale-95 ${inst.status === 'received' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary text-white shadow-2xs'}"
                  data-id="${shift.id}"
                  data-action="toggle-installment"
                  data-installment-number="${inst.number}"
                >
                  ${inst.status === 'received' ? '✓ Recebido' : 'Receber'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Status Badge & 1-Touch Action Button -->
      <div class="flex items-center justify-between gap-2 pt-0.5">
        <span class="badge-status ${statusBadgeClass}">
          ${renderIcon(statusIcon, "text-[14px]")}
          ${ev.label}
        </span>

        <div class="flex items-center gap-1.5">
          ${isInstallment ? `
            <button
              type="button"
              class="btn-toggle-shift inline-flex items-center gap-1 ${isReceived ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-tertiary text-white'} px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm active:scale-95 transition-all shrink-0"
              data-id="${shift.id}"
              data-action="toggle-installment"
              data-installment-number="${shift.installmentNumber}"
            >
              ${renderIcon(isReceived ? "undo" : "check", "text-[15px]")}
              ${isReceived ? 'Desfazer' : `Receber ${shift.installmentNumber}ª Parc.`}
            </button>
          ` : isReceived ? `
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
  const momData = state.store.getMonthOverMonthExpenseVariation(state.activeMonth, state.expenseFilter);

  // Apply scope and cost type filter
  let filtered = expenses;
  if (state.expenseFilter === "fixa") {
    filtered = filtered.filter(e => e.type === "fixed");
  } else if (state.expenseFilter === "variavel") {
    filtered = filtered.filter(e => e.type === "variable");
  } else if (state.expenseFilter === "pf") {
    filtered = filtered.filter(e => (e.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(e.category) : getCategoryScope(e.category))) === "pf");
  } else if (state.expenseFilter === "pj") {
    filtered = filtered.filter(e => (e.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(e.category) : getCategoryScope(e.category))) === "pj");
  }

  // Monthly category distribution for active filter
  const filteredSpent = filtered.reduce((acc, e) => acc + (Number(e.value) || 0), 0);
  const catMap = {};
  filtered.forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + (Number(e.value) || 0);
  });
  const filteredCategoryData = Object.entries(catMap).map(([category, amount]) => {
    const pct = filteredSpent > 0 ? Math.round((amount / filteredSpent) * 100) : 0;
    return {
      category,
      amount,
      percentage: pct,
      color: state.store.getCategoryColor ? state.store.getCategoryColor(category) : (CATEGORY_COLORS[category] || "#7A7E91"),
      icon: state.store.getCategoryIcon ? state.store.getCategoryIcon(category) : (CATEGORY_ICONS[category] || "receipt_long")
    };
  }).sort((a, b) => b.amount - a.amount);
  const donutMonthly = renderDonutChartSVG(filteredCategoryData, filteredSpent);

  const countAll = expenses.length;
  const countPF = expenses.filter(e => (e.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(e.category) : getCategoryScope(e.category))) === "pf").length;
  const countPJ = expenses.filter(e => (e.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(e.category) : getCategoryScope(e.category))) === "pj").length;
  const countFixas = expenses.filter(e => e.type === "fixed").length;
  const countVars = expenses.filter(e => e.type === "variable").length;

  const html = `
    <div class="flex flex-col w-full gap-4 pb-28 pt-2">
      <!-- Subheader & Quick Action -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <h1 class="font-headline text-[22px] font-bold text-on-surface">Despesas & Vida Financeira</h1>
            <span class="text-[20px]">🧾</span>
          </div>
          <p class="text-[12px] text-on-surface-variant">Gestão integrada: Pessoa Física (PF) e Pessoa Jurídica (PJ)</p>
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

      <!-- Scope & Cost Type Filter Pills -->
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
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'pf' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="pf"
        >
          Pessoal (PF) (${countPF})
        </button>
        <button
          type="button"
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'pj' ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="pj"
        >
          Trabalho (PJ) (${countPJ})
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

      <!-- Gráfico Mensal de Despesas (Donut SVG com Legenda) -->
      <section class="bg-white p-4 rounded-[24px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
              ${renderIcon("donut_large", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Gráfico Mensal de Despesas</h2>
              <p class="text-[11px] text-on-surface-variant">Distribuição por categoria em ${formatMonthYear(state.activeMonth)}</p>
            </div>
          </div>
          <span class="text-[13px] font-extrabold text-secondary font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">
            ${formatMoney(filteredSpent)}
          </span>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-4 pt-1">
          ${donutMonthly.svg}
          ${donutMonthly.legend}
        </div>
      </section>

      <!-- Month-over-Month Evolution Chart (Evolução Mês a Mês & PF vs PJ) -->
      ${renderMonthOverMonthChartSVG(momData)}

      <!-- Category Breakdown Grid (Quantidade Gasta em Cada Categoria & Alteração Mês a Mês) -->
      ${momData && momData.categoryComparison && momData.categoryComparison.length > 0 ? `
        <div class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between px-1">
            <span class="font-headline text-[15px] font-bold text-on-surface">Gastos por Categoria (${momData.categoryComparison.length})</span>
            <span class="text-[11px] text-on-surface-variant">Variação vs Mês Anterior</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${momData.categoryComparison.map(c => `
              <div class="p-3 bg-white rounded-2xl border border-purple-50 shadow-sm flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background-color: ${c.color}20; color: ${c.color};">
                    ${renderIcon(c.icon, "text-[18px]")}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[13px] font-bold text-on-surface truncate">${c.category}</span>
                    <div class="flex items-center gap-1.5 text-[10px]">
                      <span class="px-1.5 py-0.2 rounded-full font-bold ${c.scope === 'pf' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}">${c.scope.toUpperCase()}</span>
                      <span class="text-on-surface-variant">Anterior: ${formatMoney(c.previousAmount)}</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end shrink-0">
                  <span class="text-[14px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(c.currentAmount)}</span>
                  <span class="text-[10px] font-bold ${c.diffValue > 0 ? 'text-error' : c.diffValue < 0 ? 'text-tertiary' : 'text-outline'}">
                    ${c.diffValue > 0 ? `▲ +${c.diffPercent}%` : c.diffValue < 0 ? `▼ ${c.diffPercent}%` : '0%'}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

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

      <!-- Creator Signature Footer -->
      <div class="text-center py-2 text-[11px] text-on-surface-variant font-medium">
        Finanças Pediatria • ${APP_CREATOR.signature} 🩺💖
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
  const color = state.store.getCategoryColor ? state.store.getCategoryColor(expense.category) : (CATEGORY_COLORS[expense.category] || "#CE93D8");
  const icon = state.store.getCategoryIcon ? state.store.getCategoryIcon(expense.category) : (CATEGORY_ICONS[expense.category] || "receipt_long");
  const scope = expense.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(expense.category) : getCategoryScope(expense.category));

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
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[14px] font-semibold text-on-surface truncate">${expense.description}</span>
            <span class="px-1.5 py-0.2 rounded-full font-bold text-[9px] ${scope === 'pf' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}">${scope.toUpperCase()}</span>
            <button
              type="button"
              class="btn-card-category-quick inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style="background-color: ${color}15; color: ${color}; border: 1px solid ${color}35;"
              data-id="${expense.id}"
              data-category="${expense.category}"
              title="Toque para mudar a categoria (Ex: Contador, Mercado, Lanches...)"
            >
              ${renderIcon(icon, 'text-[11px]')}
              <span>${expense.category}</span>
              ${renderIcon('arrow_drop_down', 'text-[12px] -ml-1 opacity-70')}
            </button>
          </div>
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

      <!-- Projeção Financeira de 12 Meses com Scrubber Interativo -->
      <section class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-purple-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
              ${renderIcon("timeline", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Projeção de Caixa 12 Meses (Rolling)</h2>
              <span class="text-[11px] text-on-surface-variant">Fluxo acumulado & Reserva de Emergência</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[10px] font-bold">
            Interativo
          </span>
        </div>

        <div id="forecast-12m-chart-container" class="w-full overflow-x-auto">
          ${renderForecast12MSVG(state.store.get12MonthsRollingProjection(state.activeMonth), { privacyMode: state.privacyMode })}
        </div>

        <!-- Interactive Scrubber Control -->
        <div class="flex flex-col gap-1.5 pt-2 border-t border-purple-50">
          <div class="flex items-center justify-between text-[11px] font-bold text-on-surface">
            <span>Navegar pelos 12 meses:</span>
            <span id="scrubber-month-label" class="text-secondary font-display">${formatMonthYear(state.store.get12MonthsRollingProjection(state.activeMonth).months[0]?.month || state.activeMonth)}</span>
          </div>
          <input
            type="range"
            id="forecast-scrubber-slider"
            min="0"
            max="11"
            value="0"
            class="w-full h-2 rounded-lg bg-surface-container accent-secondary cursor-pointer"
          />
          <div id="scrubber-detail-card" class="p-3 rounded-2xl bg-surface-container-low flex flex-col gap-1 mt-1 text-[11px]">
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant">Entradas Projetadas:</span>
              <strong id="scrubber-inflows" class="text-tertiary font-display font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(state.store.get12MonthsRollingProjection(state.activeMonth).months[0]?.inflow || 0)}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant">Despesas Projetadas:</span>
              <strong id="scrubber-expenses" class="text-error font-display font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(state.store.get12MonthsRollingProjection(state.activeMonth).months[0]?.expense || 0)}</strong>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-outline-variant/10">
              <span class="font-bold text-on-surface">Saldo Acumulado em Caixa:</span>
              <strong id="scrubber-balance" class="text-secondary font-display text-[13px] font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(state.store.get12MonthsRollingProjection(state.activeMonth).months[0]?.cumulativeBalance || 0)}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Botões de Ação Executiva: DRE, Kit Contador e FIRE -->
      <section class="grid grid-cols-3 gap-2">
        <button type="button" class="btn-open-dre-reports p-3 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            ${renderIcon("calculate", "text-[18px]")}
          </div>
          <span class="text-[11px] font-bold text-on-surface leading-tight">DRE & Fator R</span>
        </button>
        <button type="button" class="btn-open-accountant-reports p-3 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("contact_phone", "text-[18px]")}
          </div>
          <span class="text-[11px] font-bold text-on-surface leading-tight">Kit Contador</span>
        </button>
        <button type="button" class="btn-open-fire-reports p-3 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center">
            ${renderIcon("local_fire_department", "text-[18px]")}
          </div>
          <span class="text-[11px] font-bold text-on-surface leading-tight">Simulador FIRE</span>
        </button>
      </section>

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

      <!-- Creator Signature Footer -->
      <div class="text-center py-2 text-[11px] text-on-surface-variant font-medium">
        Finanças Pediatria • ${APP_CREATOR.signature} 🩺💖
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

  // Quick Action Buttons
  document.querySelectorAll(".btn-quick-consultation").forEach(b => {
    b.addEventListener("click", () => openBottomSheet("consultorio"));
  });
  document.querySelectorAll(".btn-quick-sbar").forEach(b => {
    b.addEventListener("click", () => openSBARDialog());
  });
  document.querySelectorAll(".btn-quick-dre").forEach(b => {
    b.addEventListener("click", () => openDREDialog());
  });
  document.querySelectorAll(".btn-quick-reconcile").forEach(b => {
    b.addEventListener("click", () => openReconciliationDialog());
  });

  attachCardActionEvents();
}

function attachShiftsEvents() {
  document.querySelectorAll(".btn-new-consultation-top").forEach(b => {
    b.addEventListener("click", () => openBottomSheet("consultorio"));
  });
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

  // Executive Action Buttons in Reports
  document.querySelectorAll(".btn-open-dre-reports").forEach(b => b.addEventListener("click", () => openDREDialog()));
  document.querySelectorAll(".btn-open-accountant-reports").forEach(b => b.addEventListener("click", () => openAccountantKitDialog()));
  document.querySelectorAll(".btn-open-fire-reports").forEach(b => b.addEventListener("click", () => openFIREDialog()));

  // 12M Rolling Forecast Scrubber & Interactive Chart
  const scrubberSlider = document.getElementById("forecast-scrubber-slider");
  const proj12M = state.store.get12MonthsRollingProjection(state.activeMonth);
  const labelMonth = document.getElementById("scrubber-month-label");
  const labelInflows = document.getElementById("scrubber-inflows");
  const labelExpenses = document.getElementById("scrubber-expenses");
  const labelBalance = document.getElementById("scrubber-balance");
  const scrubberGuide = document.getElementById("scrubber-guide");
  const scrubberTooltip = document.getElementById("scrubber-tooltip");
  const tooltipMonth = document.getElementById("scrubber-tooltip-month");
  const tooltipInflow = document.getElementById("scrubber-tooltip-inflow");
  const tooltipBalance = document.getElementById("scrubber-tooltip-balance");

  const updateScrubber = (idx, triggerHapticFeedback = true) => {
    const mData = proj12M.months[idx];
    if (!mData) return;

    if (labelMonth) labelMonth.textContent = formatMonthYear(mData.month);
    if (labelInflows) labelInflows.textContent = formatMoney(mData.inflow);
    if (labelExpenses) labelExpenses.textContent = formatMoney(mData.expense);
    if (labelBalance) labelBalance.textContent = formatMoney(mData.cumulativeBalance);

    if (scrubberSlider && String(scrubberSlider.value) !== String(idx)) {
      scrubberSlider.value = idx;
    }

    const col = document.querySelector(`.scrubber-column[data-index="${idx}"]`);
    if (col) {
      const colX = parseFloat(col.getAttribute("data-x")) || 0;
      if (scrubberGuide) {
        scrubberGuide.setAttribute("x1", colX);
        scrubberGuide.setAttribute("x2", colX);
        scrubberGuide.classList.remove("hidden");
      }
    }

    if (scrubberTooltip) {
      if (tooltipMonth) tooltipMonth.textContent = mData.fullLabel || formatMonthYear(mData.month);
      if (tooltipInflow) tooltipInflow.textContent = formatMoney(mData.inflow);
      if (tooltipBalance) tooltipBalance.textContent = formatMoney(mData.cumulativeBalance);
      scrubberTooltip.classList.remove("hidden");
    }

    if (triggerHapticFeedback) triggerHaptic(8);
  };

  if (scrubberSlider) {
    scrubberSlider.addEventListener("input", (e) => {
      const idx = parseInt(e.target.value, 10) || 0;
      updateScrubber(idx);
    });
  }

  document.querySelectorAll(".scrubber-column").forEach(col => {
    const handleColSelect = () => {
      const idx = parseInt(col.getAttribute("data-index"), 10) || 0;
      updateScrubber(idx);
    };
    col.addEventListener("pointerdown", handleColSelect);
    col.addEventListener("pointerenter", handleColSelect);
  });
}

function attachCardActionEvents() {
  // Consultations actions: toggle paid, edit, delete
  document.querySelectorAll(".btn-toggle-consultation-paid").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const updated = state.store.toggleConsultationPaid(id);
      if (updated) {
        showToast(updated.paid ? "Consulta marcada como recebida! 🩺✨" : "Consulta marcada como pendente.", "check_circle");
        renderCurrentView();
      }
    });
  });

  document.querySelectorAll(".btn-edit-consultation").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const c = state.store.getConsultations().find(item => item.id === id);
      if (c) openBottomSheet("consultorio", c);
    });
  });

  document.querySelectorAll(".btn-delete-consultation").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      showConfirmDialog({
        title: "Excluir Consulta?",
        message: "Deseja mover este atendimento para a lixeira?",
        confirmText: "Sim, Excluir",
        isDanger: true,
        onConfirm: () => {
          state.store.deleteConsultation(id);
          showToast("Consulta movida para a lixeira. 🗑️");
          renderCurrentView();
        }
      });
    });
  });

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

      if (action === "toggle-installment") {
        const instNum = parseInt(btn.getAttribute("data-installment-number"), 10) || 1;
        const updated = state.store.toggleShiftInstallment(id, instNum);
        if (updated) {
          const inst = Array.isArray(updated.installments) ? updated.installments.find(i => i.number === instNum) : null;
          if (inst && inst.status === "received") {
            showToast(`${instNum}ª parcela de ${formatMoney(inst.value)} confirmada em conta! 💖`, "check_circle");
            showBabyReaction({
              type: 'income',
              title: `${instNum}ª Parcela Confirmada! 👶💖`,
              message: `Recebimento de ${formatCurrency(inst.value)} (${inst.percent}%) do plantão no ${updated.hospital} creditado em conta!`,
              amount: inst.value
            });
          } else {
            showToast("Parcela marcada como pendente.", "schedule");
          }
        }
      } else if (action === "receive") {
        const updated = state.store.markShiftAsReceived(id);
        if (updated) {
          showToast(`Repasse de ${formatMoney(updated.netValue)} confirmado em conta! 💖`, "check_circle");
          showBabyReaction({
            type: 'income',
            title: 'Repasse Confirmado! 👶💖',
            message: `Repasse integral do plantão no ${updated.hospital} registrado em conta!`,
            amount: updated.netValue
          });
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
        message: `Deseja mover o plantão de ${shift ? shift.hospital : 'hospital'} (${shift ? formatDateBR(shift.shiftDate) : ''}) para a lixeira?`,
        confirmText: "Sim, Excluir",
        isDanger: true,
        onConfirm: () => {
          state.store.deleteShift(id);
          showToast("Plantão movido para a lixeira.", "delete", () => {
            state.store.undoLastDelete();
            renderCurrentView();
            showToast("Plantão restaurado! 🌸", "restore_from_trash");
          });
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

  // Quick Modify Expense Category (1-Tap from Card)
  document.querySelectorAll(".btn-card-category-quick").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const expense = state.store.data.expenses.find(x => x.id === id);
      if (expense) {
        openQuickCategoryChangeDialog(expense);
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
        message: `Deseja mover a despesa '${exp ? exp.description : ''}' (${exp ? formatMoney(exp.value) : ''}) para a lixeira?`,
        confirmText: "Sim, Excluir",
        isDanger: true,
        onConfirm: () => {
          state.store.deleteExpense(id);
          showToast("Despesa movida para a lixeira.", "delete", () => {
            state.store.undoLastDelete();
            renderCurrentView();
            showToast("Despesa restaurada! 🌸", "restore_from_trash");
          });
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
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-voice-log-sheet"
            class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center hover:bg-secondary-fixed/80 active:scale-95 transition-all shadow-xs"
            title="Lançamento Rápido por Voz (NLP Médico)"
          >
            <span class="material-symbols-outlined text-[18px]">mic</span>
          </button>
          <button
            type="button"
            id="btn-close-sheet"
            class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container active:scale-95 transition-transform"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      <!-- Category Segmented Control Switcher -->
      <div class="bg-surface-container-low p-1 rounded-full flex items-center gap-1 mb-4 overflow-x-auto">
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'plantao' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="plantao"
        >
          <span class="material-symbols-outlined text-[15px]">stethoscope</span>
          <span>Plantão</span>
        </button>
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'consultorio' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="consultorio"
        >
          <span class="material-symbols-outlined text-[15px]">child_friendly</span>
          <span>Consultório</span>
        </button>
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'salario' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="salario"
        >
          <span class="material-symbols-outlined text-[15px]">work</span>
          <span>Salário</span>
        </button>
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'despesa' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="despesa"
        >
          <span class="material-symbols-outlined text-[15px]">receipt_long</span>
          <span>Despesa</span>
        </button>
      </div>

      <!-- Form Container -->
      <div id="modal-form-container">
        ${state.activeModalTab === "plantao" ? renderShiftForm(editData) : state.activeModalTab === "consultorio" ? renderConsultationForm(editData) : state.activeModalTab === "salario" ? renderSalaryForm(editData) : renderExpenseForm(editData)}
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
  const workLocations = state.store.getWorkLocations();
  const allWorkTypes = state.store.getWorkTypes();
  const activeWorkTypes = state.store.getActiveWorkTypes();
  const workType = data ? (data.workType || "Plantão em Maternidade") : (activeWorkTypes[0] || "Plantão em Maternidade");
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
      <!-- Hospital / Maternidade -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant flex items-center justify-between">
          <span>Hospital ou Maternidade</span>
          <span class="text-secondary text-[11px] flex items-center gap-0.5">
            ${renderIcon('auto_awesome', 'text-[13px]')} Locais Cadastrados
          </span>
        </label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white">
          ${renderIcon('local_hospital', 'text-[20px] text-secondary')}
          <input
            type="text"
            id="input-shift-hospital"
            class="w-full bg-transparent text-[14px] text-on-surface focus:outline-none placeholder:text-outline"
            placeholder="Ex: Maternidade Araken"
            value="${hospital}"
            required
          />
        </div>
        <!-- Quick pills with default & custom locations -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 -mx-1 px-1 no-scrollbar">
          ${workLocations.map(h => `
            <button
              type="button"
              class="quick-hospital-pill py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${hospital === h ? 'bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-hospital="${h}"
            >
              ${h.length > 20 ? h.slice(0, 18) + '...' : h}
            </button>
          `).join("")}
          <button
            type="button"
            class="quick-add-hospital-pill py-1 px-2.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-primary-fixed/50 text-primary hover:bg-primary-fixed flex items-center gap-0.5 transition-all active:scale-95"
          >
            ${renderIcon('add', 'text-[13px]')} Outro Local
          </button>
        </div>
      </div>

      <!-- Tipo de Atuação & Setor Clínico -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Atuação Pediátrica</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm">
            ${renderIcon('work', 'text-[18px] text-secondary')}
            <select
              id="input-shift-work-type"
              class="w-full bg-transparent text-[12px] text-on-surface font-medium focus:outline-none"
            >
              ${allWorkTypes.map(wt => `
                <option value="${wt}" ${workType === wt ? 'selected' : ''}>${wt}</option>
              `).join("")}
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Setor Clínico</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm">
            ${renderIcon('stethoscope', 'text-[18px] text-secondary')}
            <select
              id="input-shift-sector"
              class="w-full bg-transparent text-[12px] text-on-surface font-medium focus:outline-none"
            >
              ${CLINICAL_SECTORS.map(s => `
                <option value="${s}" ${sector === s ? 'selected' : ''}>${s}</option>
              `).join("")}
            </select>
          </div>
        </div>
      </div>

      <!-- Tipo de Escala & Data Trabalhada -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Tipo de Escala</label>
          <select
            id="input-shift-type"
            class="h-11 bg-surface-container-low rounded-2xl px-3 text-[12px] text-on-surface font-medium focus:outline-none shadow-sm"
          >
            ${SHIFT_TYPES.map(t => `
              <option value="${t.id}" ${shiftType === t.id ? 'selected' : ''}>${t.label}</option>
            `).join("")}
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Data Trabalhada</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm">
            ${renderIcon('calendar_today', 'text-[18px] text-primary')}
            <input
              type="date"
              id="input-shift-date"
              class="w-full bg-transparent text-[12px] text-on-surface focus:outline-none font-medium"
              value="${shiftDate}"
              required
            />
          </div>
        </div>
      </div>

      <!-- Alíquota de Imposto: Slider Estilo Volume (6% a 20%) -->
      <div class="flex flex-col gap-2 p-3 bg-surface-container-low rounded-2xl border border-purple-100 shadow-sm">
        <div class="flex items-center justify-between">
          <label class="text-[12px] font-bold text-on-surface flex items-center gap-1">
            ${renderIcon("tune", "text-[16px] text-secondary")}
            <span>Alíquota de Imposto (6% a 20%)</span>
          </label>
          <span id="label-tax-slider-display" class="text-[14px] font-extrabold text-secondary font-display">${Number(taxRate).toFixed(1)}%</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold text-outline">6%</span>
          <input
            type="range"
            min="6"
            max="20"
            step="0.5"
            id="input-shift-tax-slider"
            class="tax-slider w-full cursor-pointer"
            value="${taxRate}"
          />
          <span class="text-[10px] font-bold text-outline">20%</span>
        </div>
        <div class="flex items-center justify-between text-[10px] text-on-surface-variant">
          <span>Simples Nacional (6%)</span>
          <span>Intermediário (13%)</span>
          <span>Presumido (20%)</span>
        </div>
      </div>
      <input type="hidden" id="input-shift-tax-regime" value="${taxRegime}" />
      <input type="hidden" id="input-shift-tax-rate" value="${taxRate}" />

      <!-- Gross vs Net Values (Valor informado livremente pela médica) -->
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
          <span class="text-[10px] text-outline">Valor do plantão informado</span>
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

      <!-- Previsão das Parcelas (80% D+60 e 20% D+90) -->
      <div class="bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-secondary-fixed/40 p-3.5 rounded-2xl shadow-[0_4px_16px_rgba(126,74,138,0.06)] flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-primary flex items-center gap-1">
            ${renderIcon("payments", "text-[16px]")} Previsão das Parcelas (Regra Pediátrica):
          </span>
          <span class="text-[10px] text-on-surface-variant font-semibold">80% D+60 • 20% D+90</span>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-0.5">
          <div class="bg-white/90 p-2.5 rounded-xl flex flex-col border border-purple-100 shadow-sm">
            <span class="text-[10px] font-bold text-on-surface-variant">1ª Parcela (80% em 60 dias)</span>
            <span class="text-[14px] font-extrabold text-secondary font-display" id="label-install-1-val">R$ 0,00</span>
            <span class="text-[10px] text-on-surface-variant truncate" id="label-install-1-date">Previsão: --/--/----</span>
          </div>
          <div class="bg-white/90 p-2.5 rounded-xl flex flex-col border border-purple-100 shadow-sm">
            <span class="text-[10px] font-bold text-on-surface-variant">2ª Parcela (20% em 90 dias)</span>
            <span class="text-[14px] font-extrabold text-primary font-display" id="label-install-2-val">R$ 0,00</span>
            <span class="text-[10px] text-on-surface-variant truncate" id="label-install-2-date">Previsão: --/--/----</span>
          </div>
        </div>
        <div class="text-[10px] text-on-surface-variant flex items-center justify-between pt-0.5 px-0.5">
          <span>100% recebido em 90 dias no Regime de Caixa</span>
          <span class="font-bold text-secondary" id="label-expected-date">${formatDateBR(expectedDate)}</span>
        </div>
      </div>

      <!-- Prazo Manual ou D+X Alternativo -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[12px] font-bold text-on-surface-variant">Regra Especial de Prazo</label>
          <button
            type="button"
            id="btn-toggle-custom-date"
            class="text-[11px] font-bold text-secondary hover:underline flex items-center gap-0.5"
          >
            ${renderIcon("tune", "text-[14px]")}
            <span>${hasCustomDate ? 'Usar Regra 80/20 Padrão' : 'Data Manual Específica'}</span>
          </button>
        </div>

        <div id="custom-date-container" class="${hasCustomDate ? '' : 'hidden'} mt-1 flex flex-col gap-1">
          <label class="text-[11px] font-semibold text-secondary flex items-center gap-1">
            ${renderIcon("calendar_month", "text-[14px]")}
            Data Fixa Manual de Repasse (Substitui D+60/D+90):
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
        <input type="hidden" id="input-shift-lag" value="${lagMonths}" />
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
 * Form: Cadastrar / Editar Atendimento de Consultório & Puericultura
 */
function renderConsultationForm(data = null) {
  const isEdit = Boolean(data && data.id);
  const patientName = data ? (data.patientName || "") : "";
  const consultationType = data ? (data.consultationType || "Puericultura (Avulsa)") : "Puericultura (Avulsa)";
  const puericulturaMonth = data ? (data.puericulturaMonth || "1º mês (RN)") : "1º mês (RN)";
  const dateVal = data ? (data.date || getLocalDateString(state.referenceDate || new Date())) : getLocalDateString(state.referenceDate || new Date());
  const valueVal = data ? (data.value || 350) : 350;
  const durationVal = data ? (data.durationMinutes || 60) : 60;
  const paymentMethodVal = data ? (data.paymentMethod || "PIX") : "PIX";
  const paidVal = data ? Boolean(data.paid) : true;
  const notesVal = data ? (data.notes || "") : "";
  const hourlyYield = Math.round(valueVal / (durationVal / 60));

  return `
    <form id="form-consultation" class="flex flex-col gap-3.5">
      <input type="hidden" id="input-consultation-id" value="${isEdit ? data.id : ''}" />

      <!-- Patient Name -->
      <div class="flex flex-col gap-1">
        <label for="input-consultation-patient" class="text-[12px] font-bold text-on-surface flex items-center justify-between">
          <span>Nome da Criança / Mãe</span>
          <span class="text-[10px] text-secondary font-semibold">Obrigatório</span>
        </label>
        <div class="relative">
          <input
            type="text"
            id="input-consultation-patient"
            required
            placeholder="Ex: Bernardo (Mãe: Juliana)"
            value="${patientName}"
            class="w-full h-11 px-3.5 pl-10 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[14px] text-on-surface focus:outline-none focus:border-secondary transition-all"
          />
          <span class="absolute left-3 top-3 material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
        </div>
      </div>

      <!-- Consultation Type & Puericultura Month -->
      <div class="grid grid-cols-2 gap-2.5">
        <div class="flex flex-col gap-1">
          <label for="input-consultation-type" class="text-[12px] font-bold text-on-surface">Tipo de Atendimento</label>
          <select
            id="input-consultation-type"
            class="w-full h-11 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all"
          >
            <option value="Puericultura (Avulsa)" ${consultationType === "Puericultura (Avulsa)" ? "selected" : ""}>Puericultura (Avulsa)</option>
            <option value="Pacote Puericultura Anual" ${consultationType === "Pacote Puericultura Anual" ? "selected" : ""}>Pacote Puericultura Anual</option>
            <option value="Primeira Consulta" ${consultationType === "Primeira Consulta" ? "selected" : ""}>Primeira Consulta</option>
            <option value="Retorno" ${consultationType === "Retorno" ? "selected" : ""}>Retorno</option>
            <option value="Telemedicina" ${consultationType === "Telemedicina" ? "selected" : ""}>Telemedicina</option>
            <option value="Emergência Domiciliar" ${consultationType === "Emergência Domiciliar" ? "selected" : ""}>Emergência Domiciliar</option>
          </select>
        </div>

        <div class="flex flex-col gap-1" id="container-puericultura-month">
          <label for="input-consultation-puericultura-month" class="text-[12px] font-bold text-on-surface">Mês Puericultura</label>
          <select
            id="input-consultation-puericultura-month"
            class="w-full h-11 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all"
          >
            <option value="1º mês (RN)" ${puericulturaMonth === "1º mês (RN)" ? "selected" : ""}>1º mês (RN)</option>
            <option value="2º mês" ${puericulturaMonth === "2º mês" ? "selected" : ""}>2º mês</option>
            <option value="3º mês" ${puericulturaMonth === "3º mês" ? "selected" : ""}>3º mês</option>
            <option value="4º mês" ${puericulturaMonth === "4º mês" ? "selected" : ""}>4º mês</option>
            <option value="5º mês" ${puericulturaMonth === "5º mês" ? "selected" : ""}>5º mês</option>
            <option value="6º mês" ${puericulturaMonth === "6º mês" ? "selected" : ""}>6º mês</option>
            <option value="9º mês" ${puericulturaMonth === "9º mês" ? "selected" : ""}>9º mês</option>
            <option value="12º mês" ${puericulturaMonth === "12º mês" ? "selected" : ""}>12º mês (1 ano)</option>
            <option value="Acompanhamento Trimestral" ${puericulturaMonth === "Acompanhamento Trimestral" ? "selected" : ""}>Acompanhamento</option>
          </select>
        </div>
      </div>

      <!-- Date & Duration -->
      <div class="grid grid-cols-2 gap-2.5">
        <div class="flex flex-col gap-1">
          <label for="input-consultation-date" class="text-[12px] font-bold text-on-surface">Data da Consulta</label>
          <input
            type="date"
            id="input-consultation-date"
            required
            value="${dateVal}"
            class="w-full h-11 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="input-consultation-duration" class="text-[12px] font-bold text-on-surface">Duração</label>
          <select
            id="input-consultation-duration"
            class="w-full h-11 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all"
          >
            <option value="30" ${durationVal === 30 ? "selected" : ""}>30 minutos</option>
            <option value="45" ${durationVal === 45 ? "selected" : ""}>45 minutos</option>
            <option value="60" ${durationVal === 60 ? "selected" : ""}>60 minutos (1h)</option>
            <option value="90" ${durationVal === 90 ? "selected" : ""}>90 minutos (1h30)</option>
            <option value="120" ${durationVal === 120 ? "selected" : ""}>120 minutos (2h)</option>
          </select>
        </div>
      </div>

      <!-- Value & Payment Method -->
      <div class="grid grid-cols-2 gap-2.5">
        <div class="flex flex-col gap-1">
          <label for="input-consultation-value" class="text-[12px] font-bold text-on-surface">Honorário (R$)</label>
          <input
            type="number"
            step="0.01"
            id="input-consultation-value"
            required
            value="${valueVal}"
            class="w-full h-11 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[14px] font-bold text-on-surface focus:outline-none focus:border-secondary transition-all"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="input-consultation-payment-method" class="text-[12px] font-bold text-on-surface">Forma de Pagamento</label>
          <select
            id="input-consultation-payment-method"
            class="w-full h-11 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all"
          >
            <option value="PIX" ${paymentMethodVal === "PIX" ? "selected" : ""}>PIX Instantâneo</option>
            <option value="Cartão Débito" ${paymentMethodVal === "Cartão Débito" ? "selected" : ""}>Cartão Débito</option>
            <option value="Cartão Crédito" ${paymentMethodVal === "Cartão Crédito" ? "selected" : ""}>Cartão Crédito</option>
            <option value="Dinheiro" ${paymentMethodVal === "Dinheiro" ? "selected" : ""}>Dinheiro</option>
            <option value="Convênio/Reembolso" ${paymentMethodVal === "Convênio/Reembolso" ? "selected" : ""}>Convênio / Reembolso</option>
          </select>
        </div>
      </div>

      <!-- Live Hourly Rate Badge & Paid Status Toggle -->
      <div class="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-[11px] text-on-surface-variant font-medium">Rendimento Horário Estimado:</span>
          <span class="text-[16px] font-bold text-secondary font-display" id="label-live-consultation-hourly">
            R$ ${hourlyYield}/h
          </span>
        </div>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="input-consultation-paid"
            class="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary"
            ${paidVal ? "checked" : ""}
          />
          <span class="text-[12px] font-bold text-on-surface">Recebido</span>
        </label>
      </div>

      <!-- Notes -->
      <div class="flex flex-col gap-1">
        <label for="input-consultation-notes" class="text-[12px] font-bold text-on-surface">Evolução / Observações Clínicas</label>
        <textarea
          id="input-consultation-notes"
          rows="2"
          placeholder="Ex: Ganho ponderal adequado (+30g/dia), vacinas em dia, amamentação exclusiva."
          class="w-full p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all resize-none"
        >${notesVal}</textarea>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full h-12 rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary text-white font-bold text-[14px] shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 mt-1"
      >
        <span class="material-symbols-outlined text-[18px]">check</span>
        <span>${isEdit ? 'Salvar Alterações' : 'Salvar Atendimento Pediátrico'}</span>
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
          ${renderIcon('work', 'text-[20px] text-primary')}
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
            ${renderIcon('calendar_month', 'text-[18px] text-tertiary')}
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
        ${renderIcon('check', 'text-[18px]')}
      </button>
    </form>
  `;
}

/**
 * Form: Cadastrar Despesa Pediátrica (PF vs PJ)
 */
function renderExpenseForm(data = null) {
  const isEdit = Boolean(data);
  const desc = data ? data.description : "";
  const categoriesPF = state.store.getExpenseCategories ? state.store.getExpenseCategories("pf") : EXPENSE_CATEGORIES_PF;
  const categoriesPJ = state.store.getExpenseCategories ? state.store.getExpenseCategories("pj") : EXPENSE_CATEGORIES_PJ;
  const category = data ? data.category : (categoriesPF[0] || "Alimentação");
  const type = data ? data.type : "fixed";
  const val = data ? data.value : "";
  const dueDate = data ? data.dueDate : `${state.activeMonth}-10`;
  const isPaid = data ? data.isPaid : false;
  const scope = data ? (data.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(category) : getCategoryScope(category))) : (state.store.getCategoryScope ? state.store.getCategoryScope(category) : getCategoryScope(category));
  const scopeCategories = scope === "pj" ? categoriesPJ : categoriesPF;
  const categoryColor = state.store.getCategoryColor ? state.store.getCategoryColor(category) : "#B80F55";
  const categoryIcon = state.store.getCategoryIcon ? state.store.getCategoryIcon(category) : "receipt_long";

  return `
    <form id="form-expense" class="flex flex-col gap-4 font-body">
      <!-- Âmbito da Despesa: PF (Vida Pessoal) vs PJ (Trabalho/Clínica) -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant">Âmbito da Vida Financeira</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="expense-scope-btn py-2 px-3 rounded-2xl text-[12px] font-bold text-center transition-all cursor-pointer ${scope === 'pf' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
            data-scope="pf"
          >
            ${renderIcon('person', 'text-[15px] inline mr-1')} Pessoa Física (PF)
          </button>
          <button
            type="button"
            class="expense-scope-btn py-2 px-3 rounded-2xl text-[12px] font-bold text-center transition-all cursor-pointer ${scope === 'pj' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
            data-scope="pj"
          >
            ${renderIcon('business', 'text-[15px] inline mr-1')} Pessoa Jurídica (PJ)
          </button>
        </div>
        <input type="hidden" id="input-expense-scope" value="${scope}" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant">Descrição da Despesa</label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
          ${renderIcon('receipt', 'text-[20px] text-secondary')}
          <input
            type="text"
            id="input-expense-desc"
            class="w-full bg-transparent text-[14px] font-medium text-on-surface focus:outline-none"
            placeholder="Ex: Alimentação, Lazer, CRM, Sublocação..."
            value="${desc}"
            required
          />
        </div>
      </div>

      <!-- Categoria da Despesa com Custom Dropdown, Direct Typing & Quick Pills -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[12px] font-bold text-on-surface-variant flex items-center gap-1.5">
            ${renderIcon('category', 'text-[15px] text-secondary')}
            <span>Categoria da Despesa</span>
          </label>
          <button
            type="button"
            id="btn-quick-add-category"
            class="text-[11px] font-bold text-primary hover:text-secondary flex items-center gap-0.5 transition-all py-0.5 px-2 rounded-full hover:bg-primary-fixed/30 active:scale-95 cursor-pointer"
          >
            ${renderIcon('add', 'text-[13px]')} + Nova Categoria
          </button>
        </div>

        <!-- Quick Category Pills per scope (1-tap selection) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 -mx-1 px-1 no-scrollbar" id="quick-category-pills-container">
          ${scopeCategories.map(c => `
            <button
              type="button"
              class="quick-category-pill py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${category === c ? 'bg-secondary text-white shadow-sm font-bold' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-category="${c}"
            >
              ${c}
            </button>
          `).join("")}
          <button
            type="button"
            id="btn-pill-add-category"
            class="py-1 px-2.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-primary-fixed/50 text-primary hover:bg-primary-fixed flex items-center gap-0.5 transition-all active:scale-95 cursor-pointer"
          >
            ${renderIcon('add', 'text-[13px]')} Outra Categoria
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Chic Custom Category Selector & Direct Input -->
          <div class="flex flex-col gap-1 relative" id="category-selector-container">
            <label class="text-[11px] font-bold text-on-surface-variant flex items-center justify-between">
              <span>Selecionar ou Digitar</span>
              <span class="text-[10px] text-secondary font-medium" id="category-scope-label">${scope === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}</span>
            </label>

            <!-- Interactive Trigger Box -->
            <button
              type="button"
              id="btn-category-picker-trigger"
              class="category-picker-trigger h-11 px-3 flex items-center justify-between gap-2 shadow-xs cursor-pointer text-left w-full"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" id="category-display-icon-bg" style="background-color: ${categoryColor}25; color: ${categoryColor};">
                  <span id="category-display-icon">${renderIcon(categoryIcon, 'text-[14px]')}</span>
                </div>
                <span id="category-display-text" class="text-[13px] font-bold text-on-surface truncate">${category}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0 text-on-surface-variant">
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${scope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}" id="category-display-badge">${scope.toUpperCase()}</span>
                <span id="category-chevron-icon" class="transition-transform duration-200">${renderIcon('expand_more', 'text-[18px] text-secondary')}</span>
              </div>
            </button>

            <!-- Native select (kept in DOM for accessibility, form serialization & backward compatibility) -->
            <select id="input-expense-category" class="hidden">
              <optgroup label="🌸 Pessoa Física (Vida Pessoal)">
                ${categoriesPF.map(c => `<option value="${c}" ${category === c ? 'selected' : ''}>${c}</option>`).join("")}
              </optgroup>
              <optgroup label="🩺 Pessoa Jurídica (Trabalho & Clínica)">
                ${categoriesPJ.map(c => `<option value="${c}" ${category === c ? 'selected' : ''}>${c}</option>`).join("")}
              </optgroup>
              ${!categoriesPF.includes(category) && !categoriesPJ.includes(category) ? `<option value="${category}" selected>${category}</option>` : ''}
              <option value="__new__" class="font-bold text-primary">+ Nova Categoria...</option>
            </select>

            <!-- Custom Category Dropdown Popover Menu (100% styled with Manrope & Stitch tokens) -->
            <div id="category-picker-menu" class="category-menu-popover hidden">
              <!-- Live Search & Direct Category Creator Input -->
              <div class="p-2 border-b border-purple-100 bg-surface-container-low/50">
                <div class="h-9 bg-white rounded-xl px-2.5 flex items-center gap-1.5 border border-purple-100 focus-within:border-secondary transition-all">
                  ${renderIcon('search', 'text-[16px] text-secondary')}
                  <input
                    type="text"
                    id="input-category-search"
                    placeholder="Digite qualquer categoria (ex: Contador, Lanches...)"
                    class="w-full bg-transparent text-[12px] font-semibold text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
                  />
                  <button type="button" id="btn-clear-cat-search" class="text-on-surface-variant/50 hover:text-on-surface hidden cursor-pointer">
                    ${renderIcon('close', 'text-[14px]')}
                  </button>
                </div>
                <!-- Dynamic "Use/Create Typed Category" button -->
                <button
                  type="button"
                  id="btn-use-typed-category"
                  class="hidden mt-1.5 w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  ${renderIcon('add_circle', 'text-[14px]')}
                  <span id="text-use-typed-category">Usar nova categoria</span>
                </button>
              </div>

              <!-- Scope filter toggle within menu -->
              <div class="flex items-center gap-1 p-1.5 border-b border-purple-50 bg-white text-[10.5px]">
                <button type="button" class="cat-menu-scope-tab flex-1 py-1 rounded-lg font-bold text-center transition-all bg-secondary text-white cursor-pointer" data-scope="all">Todas</button>
                <button type="button" class="cat-menu-scope-tab flex-1 py-1 rounded-lg font-bold text-center transition-all bg-surface-container-low text-on-surface-variant cursor-pointer" data-scope="pf">🌸 Pessoal</button>
                <button type="button" class="cat-menu-scope-tab flex-1 py-1 rounded-lg font-bold text-center transition-all bg-surface-container-low text-on-surface-variant cursor-pointer" data-scope="pj">🩺 Trabalho</button>
              </div>

              <!-- Category Items Scrollable List -->
              <div class="category-menu-list no-scrollbar" id="category-menu-items-list"></div>

              <!-- Footer Add Action -->
              <div class="p-2 border-t border-purple-100 bg-surface-container-low/40 flex items-center justify-between">
                <button
                  type="button"
                  id="btn-menu-add-category"
                  class="w-full py-1.5 px-2 rounded-xl text-primary hover:bg-primary-fixed/30 text-[11.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  ${renderIcon('add', 'text-[14px]')}
                  <span>+ Criar Categoria Personalizada</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Tipo: Fixa vs Variável -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-bold text-on-surface-variant">Tipo de Despesa</label>
            <select
              id="input-expense-type"
              class="h-11 bg-surface-container-low rounded-2xl px-3 text-[12px] text-on-surface font-semibold focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="fixed" ${type === 'fixed' ? 'selected' : ''}>Fixa (Recorrente)</option>
              <option value="variable" ${type === 'variable' ? 'selected' : ''}>Variável (Avulsa)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Valor -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Valor (R$)</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-1 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
            <span class="text-[13px] font-bold text-on-surface">R$</span>
            <input
              type="number"
              step="0.01"
              id="input-expense-value"
              class="w-full bg-transparent text-[16px] font-bold text-on-surface focus:outline-none font-display"
              placeholder="0.00"
              value="${val}"
              required
            />
          </div>
        </div>

        <!-- Data de Vencimento -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Data de Vencimento</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
            ${renderIcon('calendar_today', 'text-[18px] text-primary')}
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
        class="h-12 w-full rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(253,78,135,0.35)] active:scale-[0.98] transition-all mt-2 cursor-pointer"
      >
        <span>${isEdit ? 'Atualizar Despesa' : 'Registrar Despesa'}</span>
        ${renderIcon('check', 'text-[18px]')}
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

  // Shift form live recalculations, quick pills, tax slider, and custom date toggle
  const formShift = document.getElementById("form-shift");
  if (formShift) {
    const inputGross = document.getElementById("input-shift-gross");
    const inputNet = document.getElementById("input-shift-net");
    const inputDate = document.getElementById("input-shift-date");
    const inputType = document.getElementById("input-shift-type");
    const inputWorkType = document.getElementById("input-shift-work-type");
    const inputLag = document.getElementById("input-shift-lag");
    const inputCustomDate = document.getElementById("input-shift-custom-date");
    const btnToggleCustom = document.getElementById("btn-toggle-custom-date");
    const customDateContainer = document.getElementById("custom-date-container");
    const labelExpected = document.getElementById("label-expected-date");
    const inputTaxSlider = document.getElementById("input-shift-tax-slider");
    const inputTaxRate = document.getElementById("input-shift-tax-rate");
    const labelTaxSliderDisplay = document.getElementById("label-tax-slider-display");
    const labelDeduction = document.getElementById("label-tax-deduction-amount");
    const badgeHourly = document.getElementById("badge-live-hourly-rate");

    const updateInstallmentsPreview = () => {
      const net = parseFloat(inputNet ? inputNet.value : 0) || 0;
      const dateVal = (inputDate && inputDate.value) ? inputDate.value : getLocalDateString(state.referenceDate || new Date());
      const isCustomActive = customDateContainer && !customDateContainer.classList.contains("hidden");
      const customDateVal = (isCustomActive && inputCustomDate && inputCustomDate.value) ? inputCustomDate.value : null;

      const installments = calculateShiftInstallments(dateVal, net, customDateVal);
      const labelInst1Val = document.getElementById("label-install-1-val");
      const labelInst1Date = document.getElementById("label-install-1-date");
      const labelInst2Val = document.getElementById("label-install-2-val");
      const labelInst2Date = document.getElementById("label-install-2-date");

      if (installments && installments.length >= 2) {
        if (labelInst1Val) labelInst1Val.textContent = formatCurrency(installments[0].value);
        if (labelInst1Date) labelInst1Date.textContent = `Previsão: ${formatDateBR(installments[0].dueDate)}`;
        if (labelInst2Val) labelInst2Val.textContent = formatCurrency(installments[1].value);
        if (labelInst2Date) labelInst2Date.textContent = `Previsão: ${formatDateBR(installments[1].dueDate)}`;
      } else if (installments && installments.length === 1) {
        if (labelInst1Val) labelInst1Val.textContent = formatCurrency(installments[0].value);
        if (labelInst1Date) labelInst1Date.textContent = `Previsão: ${formatDateBR(installments[0].dueDate)}`;
        if (labelInst2Val) labelInst2Val.textContent = "R$ 0,00";
        if (labelInst2Date) labelInst2Date.textContent = "Data única manual";
      }

      const lagVal = Number(inputLag ? inputLag.value : 3) || 3;
      const expected = calculateExpectedPaymentDate(dateVal, lagVal, customDateVal);
      if (labelExpected) {
        labelExpected.textContent = customDateVal
          ? `${formatDateBR(expected)} (Manual)`
          : formatDateBR(expected);
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
          ? `Dedução: ${formatCurrency(deduction)} (${taxRate.toFixed(1)}%)`
          : 'Líquido em conta';
      }
      updateHourlyRateBadge();
      updateInstallmentsPreview();
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
            ? `Dedução: ${formatCurrency(deduction)} (${taxRate.toFixed(1)}%)`
            : 'Líquido em conta';
        }
      }
      updateHourlyRateBadge();
      updateInstallmentsPreview();
    };

    // Initial badge and installments update
    updateHourlyRateBadge();
    updateInstallmentsPreview();

    // Tax slider volume control
    if (inputTaxSlider) {
      inputTaxSlider.addEventListener("input", () => {
        const rate = parseFloat(inputTaxSlider.value) || 6;
        if (inputTaxRate) inputTaxRate.value = rate;
        if (labelTaxSliderDisplay) labelTaxSliderDisplay.textContent = `${rate.toFixed(1)}%`;
        recalcFromGross();
      });
    }

    if (btnToggleCustom && customDateContainer) {
      btnToggleCustom.addEventListener("click", () => {
        const isHidden = customDateContainer.classList.contains("hidden");
        if (isHidden) {
          customDateContainer.classList.remove("hidden");
          btnToggleCustom.innerHTML = `${renderIcon("rule", "text-[14px]")} <span>Usar Regra 80/20 Padrão</span>`;
          if (inputCustomDate && !inputCustomDate.value) {
            inputCustomDate.value = calculateExpectedPaymentDate(inputDate.value || getLocalDateString(new Date()), 3);
          }
        } else {
          customDateContainer.classList.add("hidden");
          btnToggleCustom.innerHTML = `${renderIcon("tune", "text-[14px]")} <span>Data Manual Específica</span>`;
          if (inputCustomDate) inputCustomDate.value = "";
        }
        updateInstallmentsPreview();
      });
    }

    if (inputCustomDate) {
      inputCustomDate.addEventListener("change", updateInstallmentsPreview);
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

    if (inputDate) inputDate.addEventListener("change", updateInstallmentsPreview);

    // Quick hospital pills
    document.querySelectorAll(".quick-hospital-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const hosp = pill.getAttribute("data-hospital");
        const inputHosp = document.getElementById("input-shift-hospital");
        if (inputHosp) inputHosp.value = hosp;
        document.querySelectorAll(".quick-hospital-pill").forEach(p => {
          p.classList.remove("bg-secondary-fixed", "text-on-secondary-fixed-variant", "shadow-sm");
          p.classList.add("bg-surface-container-low", "text-on-surface-variant");
        });
        pill.classList.add("bg-secondary-fixed", "text-on-secondary-fixed-variant", "shadow-sm");
        pill.classList.remove("bg-surface-container-low", "text-on-surface-variant");
      });
    });

    // Quick add custom hospital without wiping form inputs
    const btnAddHospPill = document.querySelector(".quick-add-hospital-pill");
    if (btnAddHospPill) {
      btnAddHospPill.addEventListener("click", () => {
        const name = prompt("Digite o nome da maternidade ou local de trabalho:");
        if (name && name.trim()) {
          const cleanName = name.trim();
          state.store.addWorkLocation(cleanName);
          const inputHosp = document.getElementById("input-shift-hospital");
          if (inputHosp) inputHosp.value = cleanName;

          // Deselect existing quick hospital pills
          document.querySelectorAll(".quick-hospital-pill").forEach(p => {
            p.classList.remove("bg-secondary-fixed", "text-on-secondary-fixed-variant", "shadow-sm");
            p.classList.add("bg-surface-container-low", "text-on-surface-variant");
          });

          // Dynamically insert new active pill before the "+ Outro Local" button
          const newPill = document.createElement("button");
          newPill.type = "button";
          newPill.className = "quick-hospital-pill py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm";
          newPill.setAttribute("data-hospital", cleanName);
          newPill.textContent = cleanName.length > 20 ? cleanName.slice(0, 18) + '...' : cleanName;
          newPill.addEventListener("click", () => {
            if (inputHosp) inputHosp.value = cleanName;
            document.querySelectorAll(".quick-hospital-pill").forEach(p => {
              p.classList.remove("bg-secondary-fixed", "text-on-secondary-fixed-variant", "shadow-sm");
              p.classList.add("bg-surface-container-low", "text-on-surface-variant");
            });
            newPill.classList.add("bg-secondary-fixed", "text-on-secondary-fixed-variant", "shadow-sm");
            newPill.classList.remove("bg-surface-container-low", "text-on-surface-variant");
          });

          if (btnAddHospPill.parentNode) {
            btnAddHospPill.parentNode.insertBefore(newPill, btnAddHospPill);
          }
          showToast(`Local "${cleanName}" cadastrado com sucesso! 🏥`);
        }
      });
    }

    formShift.addEventListener("submit", (e) => {
      e.preventDefault();
      const hospital = document.getElementById("input-shift-hospital").value.trim();
      const shiftDate = document.getElementById("input-shift-date").value;
      const shiftType = document.getElementById("input-shift-type").value;
      const workType = document.getElementById("input-shift-work-type")?.value || "Plantão em Maternidade";
      const sector = document.getElementById("input-shift-sector")?.value || "UTI Neonatal";
      const taxRate = parseFloat(document.getElementById("input-shift-tax-rate")?.value) || 6;
      const taxRegime = `${taxRate}% Personalizado`;
      const notes = document.getElementById("input-shift-notes")?.value.trim() || "";
      const grossValue = parseFloat(document.getElementById("input-shift-gross").value) || 0;
      const netValue = parseFloat(document.getElementById("input-shift-net").value) || (grossValue * (1 - taxRate / 100));
      const paymentLagMonths = 3;
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
        workType,
        sector,
        taxRegime,
        taxRate,
        notes,
        grossValue,
        netValue,
        paymentLagMonths,
        customPaymentDate,
        splitPayment: !customPaymentDate
      };

      const isEdit = Boolean(state.editingItem && (state.editingItem.type === "shift" || state.editingItem.type === "plantao") && state.editingItem.data && state.editingItem.data.id);

      if (isEdit) {
        state.store.updateShift(state.editingItem.data.id, shiftPayload);
        showToast(`Plantão do ${hospital} atualizado! 🌸`);
      } else {
        state.store.addShift(shiftPayload);
        showToast(`Plantão do ${hospital} salvo no radar! 🌸`);
      }

      closeBottomSheet();
      renderCurrentView();

      // Pediatric visual reaction: baby smiling + hearts
      showBabyReaction({
        type: 'income',
        title: isEdit ? 'Plantão Atualizado! 👶💖' : 'Plantão Salvo no Radar! 👶💖',
        message: 'Previsão de recebimento calculada: 80% em 60 dias (D+60) e 20% em 90 dias (D+90)!',
        amount: netValue
      });
    });
  }

  // Voice Recognition Button in bottom sheet header
  const btnVoiceSheet = document.getElementById("btn-voice-log-sheet");
  if (btnVoiceSheet) {
    btnVoiceSheet.addEventListener("click", () => {
      startVoiceLogging();
    });
  }

  // Consultation Form submit & live hourly recalculation
  const formConsultation = document.getElementById("form-consultation");
  if (formConsultation) {
    const inputVal = document.getElementById("input-consultation-value");
    const inputDur = document.getElementById("input-consultation-duration");
    const labelHourly = document.getElementById("label-live-consultation-hourly");

    const updateHourly = () => {
      const v = parseFloat(inputVal?.value || 0) || 0;
      const d = parseInt(inputDur?.value || 60, 10) || 60;
      const rate = Math.round(v / (d / 60));
      if (labelHourly) labelHourly.textContent = `R$ ${rate}/h`;
    };

    if (inputVal) inputVal.addEventListener("input", updateHourly);
    if (inputDur) inputDur.addEventListener("change", updateHourly);

    formConsultation.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("input-consultation-id")?.value;
      const patientName = document.getElementById("input-consultation-patient").value.trim();
      const consultationType = document.getElementById("input-consultation-type").value;
      const puericulturaMonth = document.getElementById("input-consultation-puericultura-month").value;
      const date = document.getElementById("input-consultation-date").value;
      const durationMinutes = parseInt(document.getElementById("input-consultation-duration").value, 10) || 60;
      const value = parseFloat(document.getElementById("input-consultation-value").value) || 0;
      const paymentMethod = document.getElementById("input-consultation-payment-method").value;
      const paid = document.getElementById("input-consultation-paid").checked;
      const notes = document.getElementById("input-consultation-notes").value.trim();
      const isPackage = consultationType === "Pacote Puericultura Anual";

      if (!patientName || !date || value <= 0) {
        showToast("Preencha o nome do paciente, data e valor válido.", "warning");
        return;
      }

      const payload = {
        patientName,
        consultationType,
        puericulturaMonth,
        isPackage,
        date,
        durationMinutes,
        value,
        paymentMethod,
        paid,
        notes
      };

      if (id) {
        state.store.updateConsultation(id, payload);
        showToast(`Atendimento de ${patientName} atualizado! 🩺`);
      } else {
        state.store.addConsultation(payload);
        showToast(`Consulta de ${patientName} salva! 🩺`);
      }

      closeBottomSheet();
      renderCurrentView();

      showBabyReaction({
        type: 'income',
        title: id ? 'Consulta Atualizada! 👶🩺' : 'Consulta Registrada! 👶🩺',
        message: `Honorário de R$ ${value.toFixed(2)} registrado com sucesso!`,
        amount: value
      });
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

      showBabyReaction({
        type: 'income',
        title: 'Salário Fixo Salvo! 👶💖',
        message: 'Renda fixa mensal contabilizada no seu planejamento financeiro.',
        amount: value
      });
    });
  }

  // Expense form submit & PF/PJ scope toggles & custom categories
  const formExpense = document.getElementById("form-expense");
  if (formExpense) {
    const inputScope = document.getElementById("input-expense-scope");
    const inputCat = document.getElementById("input-expense-category");
    const pickerTrigger = document.getElementById("btn-category-picker-trigger");
    const pickerMenu = document.getElementById("category-picker-menu");
    const catSearchInput = document.getElementById("input-category-search");
    const btnClearSearch = document.getElementById("btn-clear-cat-search");
    const btnUseTyped = document.getElementById("btn-use-typed-category");
    const textUseTyped = document.getElementById("text-use-typed-category");
    let activeMenuScope = "all";

    const closeCategoryPicker = () => {
      if (pickerMenu) pickerMenu.classList.add("hidden");
      if (pickerTrigger) pickerTrigger.classList.remove("active");
    };

    const openCategoryPicker = () => {
      if (!pickerMenu) return;
      pickerMenu.classList.remove("hidden");
      if (pickerTrigger) pickerTrigger.classList.add("active");
      renderCategoryList(catSearchInput ? catSearchInput.value : "", activeMenuScope);
      setTimeout(() => catSearchInput?.focus(), 80);
    };

    const setSelectedCategory = (chosenCat) => {
      if (!chosenCat) return;
      const trimmed = chosenCat.trim();
      if (!trimmed || trimmed === "__new__") return;
      const catScope = state.store.getCategoryScope ? state.store.getCategoryScope(trimmed) : getCategoryScope(trimmed);
      const catColor = state.store.getCategoryColor ? state.store.getCategoryColor(trimmed) : "#B80F55";
      const catIcon = state.store.getCategoryIcon ? state.store.getCategoryIcon(trimmed) : "receipt_long";

      // Ensure option exists in native select for form serialization
      if (inputCat) {
        let opt = Array.from(inputCat.options).find(o => o.value.toLowerCase() === trimmed.toLowerCase());
        if (!opt) {
          opt = new Option(trimmed, trimmed, true, true);
          inputCat.add(opt);
        }
        inputCat.value = opt.value;
      }

      // Update trigger display
      const dispText = document.getElementById("category-display-text");
      const dispIcon = document.getElementById("category-display-icon");
      const dispIconBg = document.getElementById("category-display-icon-bg");
      const dispBadge = document.getElementById("category-display-badge");
      const scopeLabel = document.getElementById("category-scope-label");

      if (dispText) dispText.textContent = trimmed;
      if (dispIcon) dispIcon.innerHTML = renderIcon(catIcon, 'text-[14px]');
      if (dispIconBg) {
        dispIconBg.style.backgroundColor = catColor + '25';
        dispIconBg.style.color = catColor;
      }
      if (dispBadge) {
        dispBadge.textContent = catScope.toUpperCase();
        dispBadge.className = `text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${catScope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}`;
      }
      if (scopeLabel) {
        scopeLabel.textContent = catScope === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física';
      }

      // Auto-sync scope hidden input and scope buttons
      if (inputScope) inputScope.value = catScope;
      document.querySelectorAll(".expense-scope-btn").forEach(b => {
        const s = b.getAttribute("data-scope");
        if (s === catScope) {
          b.classList.add("bg-secondary", "text-white", "shadow-sm");
          b.classList.remove("bg-surface-container-low", "text-on-surface-variant");
        } else {
          b.classList.remove("bg-secondary", "text-white", "shadow-sm");
          b.classList.add("bg-surface-container-low", "text-on-surface-variant");
        }
      });

      refreshQuickPills(catScope, trimmed);
      closeCategoryPicker();
    };

    const renderCategoryList = (query = "", filterScope = "all") => {
      const listEl = document.getElementById("category-menu-items-list");
      if (!listEl) return;
      const currentVal = (inputCat ? inputCat.value : "").toLowerCase();
      const pfList = state.store.getExpenseCategories ? state.store.getExpenseCategories("pf") : EXPENSE_CATEGORIES_PF;
      const pjList = state.store.getExpenseCategories ? state.store.getExpenseCategories("pj") : EXPENSE_CATEGORIES_PJ;

      let items = [];
      if (filterScope === "pf" || filterScope === "all") {
        pfList.forEach(name => items.push({ name, scope: "pf" }));
      }
      if (filterScope === "pj" || filterScope === "all") {
        pjList.forEach(name => {
          if (!items.find(i => i.name.toLowerCase() === name.toLowerCase())) {
            items.push({ name, scope: "pj" });
          }
        });
      }

      const q = query.trim().toLowerCase();
      if (q) {
        items = items.filter(i => i.name.toLowerCase().includes(q));
      }

      // Update button to use typed category
      if (btnUseTyped && textUseTyped) {
        const exactMatch = items.some(i => i.name.toLowerCase() === q);
        if (q && !exactMatch) {
          textUseTyped.textContent = `Usar categoria "${query.trim()}" (Criar nova)`;
          btnUseTyped.classList.remove("hidden");
        } else {
          btnUseTyped.classList.add("hidden");
        }
      }

      if (items.length === 0) {
        listEl.innerHTML = `
          <div class="py-4 px-3 text-center text-[12px] text-on-surface-variant">
            Nenhuma categoria padrão com "<span class="font-bold text-secondary">${query}</span>".<br/>
            <span class="text-primary font-semibold">Clique no botão acima para criar e usar "${query}"! ✨</span>
          </div>
        `;
        return;
      }

      listEl.innerHTML = items.map(i => {
        const isSelected = currentVal === i.name.toLowerCase();
        const color = state.store.getCategoryColor ? state.store.getCategoryColor(i.name) : "#B80F55";
        const icon = state.store.getCategoryIcon ? state.store.getCategoryIcon(i.name) : "receipt_long";
        return `
          <div
            class="category-menu-item ${isSelected ? 'active' : ''}"
            data-category="${i.name}"
            data-scope="${i.scope}"
          >
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="background-color: ${color}20; color: ${color};">
                ${renderIcon(icon, 'text-[14px]')}
              </div>
              <span class="font-bold text-[12.5px] truncate">${i.name}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${i.scope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}">${i.scope.toUpperCase()}</span>
              ${isSelected ? renderIcon('check', 'text-[16px] text-secondary') : ''}
            </div>
          </div>
        `;
      }).join("");

      listEl.querySelectorAll(".category-menu-item").forEach(item => {
        item.addEventListener("click", () => {
          const chosen = item.getAttribute("data-category");
          setSelectedCategory(chosen);
        });
      });
    };

    const attachPillEvents = () => {
      document.querySelectorAll(".quick-category-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const chosenCat = pill.getAttribute("data-category");
          setSelectedCategory(chosenCat);
        });
      });

      document.getElementById("btn-pill-add-category")?.addEventListener("click", triggerAddCategoryFlow);
    };

    const refreshQuickPills = (targetScope, activeCategory) => {
      const pillsContainer = document.getElementById("quick-category-pills-container");
      if (!pillsContainer) return;
      const currentCat = activeCategory || (inputCat ? inputCat.value : "");
      const categories = state.store.getExpenseCategories ? state.store.getExpenseCategories(targetScope) : (targetScope === "pj" ? EXPENSE_CATEGORIES_PJ : EXPENSE_CATEGORIES_PF);

      pillsContainer.innerHTML = `
        ${categories.map(c => `
          <button
            type="button"
            class="quick-category-pill py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${currentCat === c ? 'bg-secondary text-white shadow-sm font-bold' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
            data-category="${c}"
          >
            ${c}
          </button>
        `).join("")}
        <button
          type="button"
          id="btn-pill-add-category"
          class="py-1 px-2.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-primary-fixed/50 text-primary hover:bg-primary-fixed flex items-center gap-0.5 transition-all active:scale-95 cursor-pointer"
        >
          ${renderIcon('add', 'text-[13px]')} Outra Categoria
        </button>
      `;

      attachPillEvents();
    };

    const triggerAddCategoryFlow = () => {
      const curScope = inputScope ? inputScope.value : "pf";
      openCategoryModal({
        mode: "add",
        initialData: { scope: curScope },
        onSave: ({ name, scope }) => {
          state.store.addExpenseCategory({ name, scope });
          setSelectedCategory(name);
          showToast(`Categoria '${name}' adicionada com sucesso! ✨`);
        },
        onCancel: () => {}
      });
    };

    // Category Trigger Toggle
    pickerTrigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (pickerMenu && !pickerMenu.classList.contains("hidden")) {
        closeCategoryPicker();
      } else {
        openCategoryPicker();
      }
    });

    // Close when clicking outside category selector
    document.addEventListener("click", (e) => {
      const selectorContainer = document.getElementById("category-selector-container");
      if (selectorContainer && !selectorContainer.contains(e.target)) {
        closeCategoryPicker();
      }
    });

    // Live search input
    catSearchInput?.addEventListener("input", () => {
      const q = catSearchInput.value;
      if (btnClearSearch) {
        if (q.trim()) btnClearSearch.classList.remove("hidden");
        else btnClearSearch.classList.add("hidden");
      }
      renderCategoryList(q, activeMenuScope);
    });

    btnClearSearch?.addEventListener("click", () => {
      if (catSearchInput) {
        catSearchInput.value = "";
        catSearchInput.focus();
      }
      btnClearSearch.classList.add("hidden");
      renderCategoryList("", activeMenuScope);
    });

    btnUseTyped?.addEventListener("click", () => {
      const q = catSearchInput ? catSearchInput.value.trim() : "";
      if (q) {
        const curScope = inputScope ? inputScope.value : "pf";
        const detectedScope = state.store.getCategoryScope ? state.store.getCategoryScope(q) : curScope;
        state.store.addExpenseCategory({ name: q, scope: detectedScope });
        setSelectedCategory(q);
        showToast(`Categoria '${q}' criada e selecionada! ✨`);
      }
    });

    catSearchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = catSearchInput.value.trim();
        if (q) {
          const curScope = inputScope ? inputScope.value : "pf";
          const detectedScope = state.store.getCategoryScope ? state.store.getCategoryScope(q) : curScope;
          state.store.addExpenseCategory({ name: q, scope: detectedScope });
          setSelectedCategory(q);
          showToast(`Categoria '${q}' selecionada! ✨`);
        }
      }
    });

    // Scope tabs inside menu
    document.querySelectorAll(".cat-menu-scope-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.stopPropagation();
        activeMenuScope = tab.getAttribute("data-scope") || "all";
        document.querySelectorAll(".cat-menu-scope-tab").forEach(t => {
          t.classList.remove("bg-secondary", "text-white");
          t.classList.add("bg-surface-container-low", "text-on-surface-variant");
        });
        tab.classList.add("bg-secondary", "text-white");
        tab.classList.remove("bg-surface-container-low", "text-on-surface-variant");
        renderCategoryList(catSearchInput ? catSearchInput.value : "", activeMenuScope);
      });
    });

    document.getElementById("btn-menu-add-category")?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeCategoryPicker();
      triggerAddCategoryFlow();
    });

    attachPillEvents();
    document.getElementById("btn-quick-add-category")?.addEventListener("click", triggerAddCategoryFlow);

    // Scope buttons
    document.querySelectorAll(".expense-scope-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const scope = btn.getAttribute("data-scope");
        if (inputScope) inputScope.value = scope;
        document.querySelectorAll(".expense-scope-btn").forEach(b => {
          b.classList.remove("bg-secondary", "text-white", "shadow-sm");
          b.classList.add("bg-surface-container-low", "text-on-surface-variant");
        });
        btn.classList.add("bg-secondary", "text-white", "shadow-sm");
        btn.classList.remove("bg-surface-container-low", "text-on-surface-variant");

        // Update scope label
        const scopeLabel = document.getElementById("category-scope-label");
        if (scopeLabel) {
          scopeLabel.textContent = scope === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física';
        }

        // Auto align category if current is in other scope
        const currentCat = inputCat ? inputCat.value : "";
        const currentCatScope = state.store.getCategoryScope ? state.store.getCategoryScope(currentCat) : getCategoryScope(currentCat);
        let nextCat = currentCat;
        if (currentCatScope !== scope) {
          const scopeList = state.store.getExpenseCategories ? state.store.getExpenseCategories(scope) : (scope === "pj" ? EXPENSE_CATEGORIES_PJ : EXPENSE_CATEGORIES_PF);
          nextCat = scopeList[0] || (scope === "pj" ? "Consultório/Sublocação" : "Alimentação");
          setSelectedCategory(nextCat);
        } else {
          refreshQuickPills(scope, currentCat);
        }
      });
    });

    // Auto sync scope if user chooses category from another optgroup in native select
    if (inputCat) {
      inputCat.addEventListener("change", () => {
        const cat = inputCat.value;
        if (cat === "__new__") {
          triggerAddCategoryFlow();
          return;
        }
        setSelectedCategory(cat);
      });
    }

    formExpense.addEventListener("submit", (e) => {
      e.preventDefault();
      const description = document.getElementById("input-expense-desc").value.trim();
      let category = document.getElementById("input-expense-category").value;
      const type = document.getElementById("input-expense-type").value;
      const scope = document.getElementById("input-expense-scope")?.value || (state.store.getCategoryScope ? state.store.getCategoryScope(category) : getCategoryScope(category));
      const value = parseFloat(document.getElementById("input-expense-value").value) || 0;
      const dueDate = document.getElementById("input-expense-duedate").value;
      const isPaid = document.getElementById("input-expense-paid").checked;

      // If user typed a category into search input but didn't click apply
      const pendingTyped = catSearchInput ? catSearchInput.value.trim() : "";
      if (pendingTyped && (!category || category === "__new__" || category === "Alimentação" || category === "Lazer")) {
        category = pendingTyped;
        state.store.addExpenseCategory({ name: category, scope });
      }

      if (!description || value <= 0 || !dueDate) {
        showToast("Preencha todos os campos obrigatórios da despesa.", "warning");
        return;
      }

      if (category === "__new__" || !category) {
        showToast("Selecione ou crie uma categoria válida.", "warning");
        return;
      }

      const isEdit = Boolean(state.editingItem && (state.editingItem.type === "despesa" || state.editingItem.type === "expense") && state.editingItem.data && state.editingItem.data.id);

      if (isEdit) {
        state.store.updateExpense(state.editingItem.data.id, {
          description,
          category,
          type,
          scope,
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
          scope,
          value,
          dueDate,
          isPaid
        });
        showToast(`Despesa '${description}' registrada com sucesso! 🧾`);
      }

      closeBottomSheet();
      renderCurrentView();

      // Pediatric visual reaction: baby crying gently with caring advice
      showBabyReaction({
        type: 'expense',
        title: isEdit ? 'Despesa Atualizada! 🍼🥺' : 'Despesa Anotada! 🍼🥺',
        message: 'O bebê chora com a saída financeira, mas o orçamento continua impecável e sob controle!',
        amount: value
      });
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
    initThemeSystem();
    initSpotlightSearch();
    checkOnboarding();

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
        if (dom.spotlightOverlay && dom.spotlightOverlay.classList.contains("active")) {
          closeSpotlightSearch();
        } else if (dom.dialogContainer && dom.dialogContainer.classList.contains("active")) {
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
    console.error("Critical error starting Finanças Pediatria:", err);
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
  try {
    Object.defineProperty(window, "APP_CREATOR", {
      value: APP_CREATOR,
      writable: false,
      configurable: false
    });
  } catch (e) {}

  bootApp();
  window.pediatricApp = {
    state,
    openBottomSheet,
    closeBottomSheet,
    openDialog,
    closeDialog,
    openTrashDialog,
    openDoctorProfileDialog,
    openCategoryModal,
    showBabyReaction,
    showToast,
    switchTab,
    initApp,
    renderCurrentView,
    bootApp,
    applyTheme,
    openSpotlightSearch,
    closeSpotlightSearch,
    startVoiceLogging,
    openSBARDialog,
    openDREDialog,
    openReconciliationDialog,
    openAccountantKitDialog,
    openFIREDialog,
    openOnboardingDialog
  };
}
