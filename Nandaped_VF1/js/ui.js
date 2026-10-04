/**
 * Finanças Pediatria V4_Cloud - UI Controller & View Manager
 * Design System: "Silk & Rose Gold" para Médica
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 * 
 * Invariantes & Princípios Arquiteturais:
 * 1. Mobile-First iPhone 16 Plus (Safe-Areas & Anti-Zoom Shield >= 16px).
 * 2. In-Flow Expansion Anti-Crop para Modais (position: relative !important).
 * 3. Pure Inline SVGs (Anti-Blowout de ligaduras de fontes no iOS Safari).
 * 4. 3 Abas Essenciais: Início (Dashboard), Ganhos (Plantões), Despesas (com 6 Macro-Grupos).
 * 5. Pré-Seleção Rápida de Maternidades (Maternidade Principal, Maternidade Secundária, Hospital Pediátrico) em 1 toque.
 * 6. Visual Sync Badge com 5 estados (guest, synced, syncing, offline, error).
 */

export const APP_CREATOR = 'FChNeto';
export const APP_VERSION = '4.0.0';

import {
  CANONICAL_CATEGORIES,
  DEFAULT_CATEGORIES,
  MACRO_GROUPS,
  DEFAULT_HOSPITALS,
  formatCurrency,
  formatDateBR,
  formatMonthYear,
  getLocalDateString,
  addMonthsToDateString,
  calculateShiftInstallments,
  generateExpenseInstallments,
  getMacroGroupForCategory
} from './store.js';

import { isGuestMode, isOfflineMode } from './config.js';

// ============================================================================
// 1. SISTEMA DE ÍCONES SVG EMBUTIDOS (BLINDAGEM ANTI-BLOWOUT COM FALLBACK)
// ============================================================================

export const FALLBACK_SVGS = {
  stethoscope: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3"/><path d="M9 12.5v3.5a4 4 0 0 0 8 0v-2"/><circle cx="17" cy="12" r="2"/><circle cx="4.5" cy="3" r="1.5"/><circle cx="13.5" cy="3" r="1.5"/></svg>',
  hospital: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 10h6"/><path d="M12 7v6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  delete: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  dollar: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  home: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0"/><path d="M2 9.5h20"/><circle cx="16" cy="14" r="1.5"/></svg>',
  credit_card: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>',
  tag: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
  sync: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
  alert: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
};

// ============================================================================
// SANITIZAÇÃO DE HTML & BLINDAGEM CONTRA DOM XSS
// ============================================================================

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getIconSvg(name, options = {}) {
  const size = typeof options === 'number' ? options : (options?.size || 20);
  const color = options?.color || 'currentColor';
  const extraClass = options?.className || options?.extraClass || '';

  const hasIcon = Object.prototype.hasOwnProperty.call(FALLBACK_SVGS, name) && typeof FALLBACK_SVGS[name] === 'string';
  const rawSvg = hasIcon ? FALLBACK_SVGS[name] : FALLBACK_SVGS.tag;
  return rawSvg
    .replace(/width="[^"]*"/, `width="${size}"`)
    .replace(/height="[^"]*"/, `height="${size}"`)
    .replace('<svg ', `<svg class="${extraClass}" style="${color !== 'currentColor' ? `color: ${color}; stroke: ${color};` : ''}" `);
}

// ============================================================================
// 2. CLASSE CONTROLADORA DA INTERFACE DE USUÁRIO (PediatricUI)
// ============================================================================

export class PediatricUI {
  constructor(store) {
    this.store = store;
    this.currentTab = 'home'; // 'home' | 'income' | 'expenses'
    this.activeExpenseFilter = 'all'; // 'all' | macroId
    this.activeModal = null;
    this.prefilledHospital = '';

    this.initDOMReferences();
    this.bindGlobalEvents();
  }

  initDOMReferences() {
    this.viewHome = document.getElementById('view-home');
    this.viewIncome = document.getElementById('view-income');
    this.viewExpenses = document.getElementById('view-expenses');
    this.syncBadge = document.getElementById('sync-badge');
    this.toastContainer = document.getElementById('toast-container');
    this.monthTitle = document.getElementById('current-month-title');
    this.regimePill = document.getElementById('current-regime-pill');
    this.doctorNameHeader = document.getElementById('header-doctor-name');
    this.doctorRoleHeader = document.getElementById('header-doctor-role');
    this.avatarImg = document.getElementById('doctor-avatar-img');
    this.avatarFallback = document.getElementById('doctor-avatar-fallback');
  }

  bindGlobalEvents() {
    if (this._eventsBound) return;
    this._eventsBound = true;

    document.addEventListener('click', (e) => {
      // 1. Navegação de Abas Inferiores
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        this.switchTab(tab);
        return;
      }

      // 2. Chips de Pré-Seleção de Maternidades (Maternidade Principal, Maternidade Secundária, etc.)
      const hospChip = e.target.closest('[data-quick-hospital]');
      if (hospChip) {
        const hospitalName = hospChip.getAttribute('data-quick-hospital');
        this.selectHospitalChip(hospitalName);
        return;
      }

      // 3. Botão Flutuante Central FAB (+) e Botões de Ação Rápida
      const fabBtn = e.target.closest('#fab-add-btn');
      if (fabBtn) {
        this.openModal('#modal-shift');
        return;
      }

      const quickShiftBtn = e.target.closest('#btn-quick-add-shift');
      if (quickShiftBtn) {
        this.openModal('#modal-shift');
        return;
      }

      const quickExpenseBtn = e.target.closest('#btn-quick-add-expense');
      if (quickExpenseBtn) {
        this.openModal('#modal-expense');
        return;
      }

      // Seletores de Regime (Caixa vs Competência)
      const regimeBtn = e.target.closest('[data-regime]');
      if (regimeBtn) {
        const selectedRegime = regimeBtn.getAttribute('data-regime');
        if (selectedRegime && ['caixa', 'competencia'].includes(selectedRegime)) {
          this.store.data.preferences.regime = selectedRegime;
          this.store.save();
          this.showToast(`Modo alterado para ${selectedRegime === 'caixa' ? 'Regime de Caixa' : 'Regime de Competência'}.`, 'info');
          this.render();
        }
        return;
      }

      // Itens de Navegação do Drawer Hambúrguer
      const drawerItemCats = e.target.closest('#drawer-item-categories');
      if (drawerItemCats) {
        const drawer = document.getElementById('menu-drawer');
        if (drawer) drawer.classList.add('hidden');
        this.openModal('#modal-categories');
        return;
      }

      const drawerItemHub = e.target.closest('#drawer-item-hub');
      if (drawerItemHub) {
        const drawer = document.getElementById('menu-drawer');
        if (drawer) drawer.classList.add('hidden');
        this.openModal('#modal-hub');
        return;
      }

      // 4. Fechamento de Modais (Overlay ou Botão Fechar)
      const closeTrigger = e.target.closest('[data-close-modal]') || e.target.closest('.modal-close-btn');
      if (closeTrigger) {
        const modalTarget = closeTrigger.getAttribute('data-close-modal') || (this.activeModal ? `#${this.activeModal.id}` : null);
        if (modalTarget) {
          this.closeModal(modalTarget);
        } else {
          this.closeModal();
        }
        return;
      }

      // Fechar modal ao clicar no backdrop (fora da folha .modal-sheet)
      const backdrop = e.target.closest('.modal-backdrop');
      if (backdrop && e.target === backdrop) {
        this.closeModal(`#${backdrop.id}`);
        return;
      }

      // 5. Toggle de Parcela Recebida em Plantão (D+60 ou D+90)
      const toggleInstallmentBtn = e.target.closest('[data-toggle-installment]');
      if (toggleInstallmentBtn) {
        const shiftId = toggleInstallmentBtn.getAttribute('data-shift-id');
        const instNum = parseInt(toggleInstallmentBtn.getAttribute('data-toggle-installment'), 10);
        this.handleToggleShiftInstallment(shiftId, instNum);
        return;
      }

      // 6. Exclusão de Plantão
      const deleteShiftBtn = e.target.closest('[data-delete-shift]');
      if (deleteShiftBtn) {
        const shiftId = deleteShiftBtn.getAttribute('data-delete-shift');
        this.handleDeleteShift(shiftId);
        return;
      }

      // 7. Exclusão de Despesa
      const deleteExpenseBtn = e.target.closest('[data-delete-expense]');
      if (deleteExpenseBtn) {
        const expId = deleteExpenseBtn.getAttribute('data-delete-expense');
        this.handleDeleteExpense(expId);
        return;
      }

      // 8. Filtro de Macro-Grupos na Aba de Despesas
      const macroFilterChip = e.target.closest('[data-macro-filter]');
      if (macroFilterChip) {
        const macroId = macroFilterChip.getAttribute('data-macro-filter');
        this.setExpenseFilter(macroId);
        return;
      }

      // 9. Pills de Hospital dentro do Modal de Plantão
      const modalHospPill = e.target.closest('[data-modal-hosp]');
      if (modalHospPill) {
        const hospValue = modalHospPill.getAttribute('data-modal-hosp');
        const input = document.getElementById('shift-hospital-input');
        if (input) {
          input.value = hospValue;
          document.querySelectorAll('.modal-hosp-pill').forEach(p => p.classList.remove('selected'));
          modalHospPill.classList.add('selected');
        }
        return;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal(`#${this.activeModal.id}`);
      }
    });
  }

  // ==========================================================================
  // 3. NAVEGAÇÃO DE ABAS PRIMÁRIAS
  // ==========================================================================

  switchTab(tabName) {
    if (!['home', 'income', 'expenses'].includes(tabName)) return;

    this.currentTab = tabName;

    document.querySelectorAll('.nav-tab').forEach((btn) => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    if (this.viewHome) {
      if (tabName === 'home') {
        this.viewHome.classList.remove('hidden');
        this.viewHome.classList.add('active');
      } else {
        this.viewHome.classList.add('hidden');
        this.viewHome.classList.remove('active');
      }
    }

    if (this.viewIncome) {
      if (tabName === 'income') {
        this.viewIncome.classList.remove('hidden');
        this.viewIncome.classList.add('active');
      } else {
        this.viewIncome.classList.add('hidden');
        this.viewIncome.classList.remove('active');
      }
    }

    if (this.viewExpenses) {
      if (tabName === 'expenses') {
        this.viewExpenses.classList.remove('hidden');
        this.viewExpenses.classList.add('active');
      } else {
        this.viewExpenses.classList.add('hidden');
        this.viewExpenses.classList.remove('active');
      }
    }

    this.render();

    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('v4_cloud_tab_changed', {
        detail: { tab: tabName }
      }));
    }
  }

  // ==========================================================================
  // 4. GESTÃO DE MODAIS COM ARQUITETURA IN-FLOW EXPANSION (ANTI-CROP)
  // ==========================================================================

  openModal(modalSelector, options = {}) {
    const modalEl = document.querySelector(modalSelector);
    if (!modalEl) {
      console.warn(`[PediatricUI] Modal ${modalSelector} não encontrado no DOM.`);
      return;
    }

    this.activeModal = modalEl;
    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('role', 'dialog');

    // Blindagem In-Flow Expansion no .modal-sheet
    const sheet = modalEl.querySelector('.modal-sheet');
    if (sheet && sheet.style) {
      if (typeof sheet.style.setProperty === 'function') {
        sheet.style.setProperty('position', 'relative', 'important');
      } else {
        sheet.style.position = 'relative';
      }
    }

    if (modalSelector === '#modal-shift') {
      const hospitalPrefill = options.hospital || this.prefilledHospital || 'Maternidade Principal';
      this.renderShiftModalContent(hospitalPrefill);
      this.prefilledHospital = '';
    } else if (modalSelector === '#modal-expense') {
      this.renderExpenseModalContent();
    } else if (modalSelector === '#modal-doctor-profile') {
      this.renderProfileModalContent();
    } else if (modalSelector === '#modal-categories') {
      this.renderCategoriesModalContent();
    }

    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden';
    }

    const firstInput = modalEl.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 80);
    }
  }

  closeModal(modalSelector = null) {
    let modalEl = null;
    if (modalSelector) {
      modalEl = document.querySelector(modalSelector);
    } else if (this.activeModal) {
      modalEl = this.activeModal;
    } else {
      modalEl = document.querySelector('.modal-backdrop:not(.hidden)');
    }

    if (modalEl) {
      modalEl.classList.add('hidden');
      modalEl.setAttribute('aria-hidden', 'true');
    }

    this.activeModal = null;

    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
    }
  }

  // ==========================================================================
  // 5. PRÉ-SELEÇÃO RÁPIDA DE MATERNIDADES (1 TOQUE)
  // ==========================================================================

  selectHospitalChip(hospitalName) {
    if (!hospitalName) return;
    this.prefilledHospital = hospitalName;

    document.querySelectorAll('.hospital-chip').forEach((chip) => {
      if (chip.getAttribute('data-quick-hospital') === hospitalName) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    this.openModal('#modal-shift', { hospital: hospitalName });
  }

  // ==========================================================================
  // 6. FORMULÁRIOS DINÂMICOS & CÁLCULOS MATEMÁTICOS EM TEMPO REAL
  // ==========================================================================

  renderShiftModalContent(defaultHospital = 'Maternidade Principal') {
    const container = document.getElementById('modal-shift-content');
    if (!container) return;

    const todayStr = getLocalDateString();
    const installments = calculateShiftInstallments(0, todayStr);

    container.innerHTML = `
      <form id="form-new-shift" class="modal-form" novalidate>
        <div class="input-field-group">
          <label for="shift-hospital-input" class="silk-input-label">Maternidade / Hospital</label>
          <input 
            type="text" 
            id="shift-hospital-input" 
            name="hospital" 
            class="silk-input" 
            value="${escapeHtml(defaultHospital)}" 
            required 
            placeholder="Ex: Maternidade Principal"
          />
        </div>

        <div class="modal-hosp-chips-row">
          <button type="button" class="modal-hosp-pill ${defaultHospital.includes('Maternidade Principal') ? 'selected' : ''}" data-modal-hosp="Maternidade Principal">Maternidade Principal</button>
          <button type="button" class="modal-hosp-pill ${defaultHospital.includes('Maternidade Secundária') ? 'selected' : ''}" data-modal-hosp="Maternidade Secundária">Maternidade Secundária</button>
          <button type="button" class="modal-hosp-pill ${defaultHospital === 'Hospital Pediátrico' ? 'selected' : ''}" data-modal-hosp="Hospital Pediátrico">Hospital Pediátrico</button>
          <button type="button" class="modal-hosp-pill" data-modal-hosp="Hospital Pediátrico">Hosp. Criança</button>
          <button type="button" class="modal-hosp-pill" data-modal-hosp="Hospital Geral">Hospital Geral</button>
        </div>

        <div class="form-row-2">
          <div class="input-field-group">
            <label for="shift-date-input" class="silk-input-label">Data Trabalhada</label>
            <input 
              type="date" 
              id="shift-date-input" 
              name="date" 
              class="silk-input" 
              value="${todayStr}" 
              required 
            />
          </div>

          <div class="input-field-group">
            <label for="shift-type-input" class="silk-input-label">Escala / Turno</label>
            <select id="shift-type-input" name="shiftType" class="silk-input">
              <option value="12h Noturno" selected>12h Noturno</option>
              <option value="12h Diurno">12h Diurno</option>
              <option value="24h Plantão">24h Plantão</option>
              <option value="Sobreaviso">Sobreaviso</option>
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="input-field-group">
            <label for="shift-gross-input" class="silk-input-label">Valor Bruto (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              id="shift-gross-input" 
              name="grossValue" 
              class="silk-input" 
              value="" 
              placeholder="0,00"
            />
          </div>

          <div class="input-field-group">
            <label for="shift-net-input" class="silk-input-label">Valor Líquido (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              id="shift-net-input" 
              name="netValue" 
              class="silk-input" 
              value="" 
              placeholder="0,00"
            />
          </div>
        </div>

        <div class="shift-split-preview-card" id="shift-split-preview">
          <div class="split-preview-header">
            <span class="preview-badge">Regra Sala de Parto</span>
            <small>Projeção Automática de Recebimento</small>
          </div>
          <div class="split-preview-grid">
            <div class="split-preview-col">
              <span class="split-percent">75% (D+60)</span>
              <strong id="preview-val-75" class="split-val">${formatCurrency(installments.installment1.value)}</strong>
              <small id="preview-date-75" class="split-date">Previsão: ${formatDateBR(installments.installment1.date)}</small>
            </div>
            <div class="split-preview-divider"></div>
            <div class="split-preview-col">
              <span class="split-percent">25% (D+90)</span>
              <strong id="preview-val-25" class="split-val">${formatCurrency(installments.installment2.value)}</strong>
              <small id="preview-date-25" class="split-date">Previsão: ${formatDateBR(installments.installment2.date)}</small>
            </div>
          </div>
        </div>

        <div class="input-field-group">
          <label for="shift-notes-input" class="silk-input-label">Observações (Opcional)</label>
          <input 
            type="text" 
            id="shift-notes-input" 
            name="notes" 
            class="silk-input" 
            placeholder="Observação opcional"
          />
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn-silk-text-danger" data-close-modal="#modal-shift">Cancelar</button>
          <button type="submit" class="btn-silk-primary">Salvar Plantão</button>
        </div>
      </form>
    `;

    const grossInput = document.getElementById('shift-gross-input');
    const netInput = document.getElementById('shift-net-input');
    const dateInput = document.getElementById('shift-date-input');

    const updatePreview = () => {
      const rawNet = parseFloat(netInput?.value) || 0;
      const rawGross = parseFloat(grossInput?.value) || 0;
      const effectiveNet = rawNet > 0 ? rawNet : rawGross;
      const dateVal = dateInput?.value || getLocalDateString();
      const calc = calculateShiftInstallments(effectiveNet, dateVal);

      const val75El = document.getElementById('preview-val-75');
      const date75El = document.getElementById('preview-date-75');
      const val25El = document.getElementById('preview-val-25');
      const date25El = document.getElementById('preview-date-25');

      if (val75El) val75El.textContent = formatCurrency(calc.installment1.value);
      if (date75El) date75El.textContent = `Previsão: ${formatDateBR(calc.installment1.date)}`;
      if (val25El) val25El.textContent = formatCurrency(calc.installment2.value);
      if (date25El) date25El.textContent = `Previsão: ${formatDateBR(calc.installment2.date)}`;
    };

    if (netInput) netInput.addEventListener('input', updatePreview);
    if (grossInput) grossInput.addEventListener('input', updatePreview);
    if (dateInput) dateInput.addEventListener('change', updatePreview);

    const form = document.getElementById('form-new-shift');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const hospital = fd.get('hospital')?.trim() || 'Maternidade Principal';
        const date = fd.get('date') || getLocalDateString();
        const shiftType = fd.get('shiftType') || '12h Noturno';
        const grossValue = parseFloat(fd.get('grossValue')) || 0;
        const netValue = parseFloat(fd.get('netValue')) || 0;
        const effectiveNet = netValue > 0 ? netValue : grossValue;
        const effectiveGross = grossValue > 0 ? grossValue : effectiveNet;
        const notes = fd.get('notes')?.trim() || '';

        if (effectiveNet <= 0) {
          this.showToast('Informe ao menos o valor bruto ou o valor líquido do plantão.', 'warning');
          return;
        }

        this.store.saveShift({
          hospital,
          date,
          shiftType,
          grossValue: effectiveGross,
          netValue: effectiveNet,
          notes
        });

        this.closeModal('#modal-shift');
        this.showToast('Plantão médico registrado com sucesso! 🩺✨', 'success');
        this.render();
      });
    }
  }

  renderExpenseModalContent() {
    const container = document.getElementById('modal-expense-content');
    if (!container) return;

    const todayStr = getLocalDateString();
    const allCategories = (this.store && typeof this.store.getAllCategories === 'function')
      ? this.store.getAllCategories()
      : CANONICAL_CATEGORIES.map(name => ({ name }));

    const categoryOptionsHtml = allCategories.map(catObj => {
      const cat = typeof catObj === 'string' ? catObj : catObj.name;
      const macro = getMacroGroupForCategory(cat, this.store?.data?.customCategories);
      const isCustomBadge = catObj.isCustom ? ' (Personalizada)' : '';
      return `<option value="${escapeHtml(cat)}" data-macro="${escapeHtml(macro.name)}">${escapeHtml(cat)} (${escapeHtml(macro.name)})${isCustomBadge}</option>`;
    }).join('');

    container.innerHTML = `
      <form id="form-new-expense" class="modal-form" novalidate>
        <div class="input-field-group">
          <label for="expense-description-input" class="silk-input-label">Descrição do Gasto</label>
          <input 
            type="text" 
            id="expense-description-input" 
            name="description" 
            class="silk-input" 
            placeholder="Ex: Livro de Neonatologia, Supermercado" 
            required 
          />
        </div>

        <div class="form-row-2">
          <div class="input-field-group">
            <label for="expense-amount-input" class="silk-input-label">Valor (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              id="expense-amount-input" 
              name="amount" 
              class="silk-input" 
              placeholder="0,00" 
              required 
            />
          </div>

          <div class="input-field-group">
            <label for="expense-date-input" class="silk-input-label">Data da Despesa</label>
            <input 
              type="date" 
              id="expense-date-input" 
              name="date" 
              class="silk-input" 
              value="${todayStr}" 
              required 
            />
          </div>
        </div>

        <div class="input-field-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label for="expense-category-select" class="silk-input-label" style="margin: 0;">Categoria Canônica</label>
            <button type="button" id="btn-quick-new-category" class="btn-silk-text" style="font-size: 0.78rem; padding: 2px 6px; color: var(--rose-primary, #EC407A); font-weight: 600;">+ Nova Categoria</button>
          </div>
          <select id="expense-category-select" name="category" class="silk-input">
            ${categoryOptionsHtml}
          </select>
        </div>

        <div class="macro-badge-row" id="macro-badge-container">
          <span class="silk-pill-badge" id="macro-preview-badge">Macro-Grupo: Alimentação</span>
        </div>

        <div class="installment-toggle-row">
          <label class="installment-checkbox-label">
            <input type="checkbox" id="expense-is-installment-checkbox" name="isInstallment" />
            <span>Compra Parcelada no Cartão?</span>
          </label>
        </div>

        <div id="installment-selector-group" class="input-field-group hidden">
          <label for="expense-installments-select" class="silk-input-label">Número de Parcelas</label>
          <select id="expense-installments-select" name="totalInstallments" class="silk-input">
            ${Array.from({ length: 23 }, (_, i) => i + 2).map(n => `<option value="${n}">${n}x</option>`).join('')}
          </select>
          <small id="installment-calculation-preview" class="silk-input-hint"></small>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn-silk-text-danger" data-close-modal="#modal-expense">Cancelar</button>
          <button type="submit" class="btn-silk-primary">Salvar Despesa</button>
        </div>
      </form>
    `;

    const catSelect = document.getElementById('expense-category-select');
    const macroBadge = document.getElementById('macro-preview-badge');
    if (catSelect && macroBadge) {
      catSelect.addEventListener('change', () => {
        const selected = catSelect.value;
        const macro = getMacroGroupForCategory(selected);
        macroBadge.textContent = `Macro-Grupo: ${macro.name}`;
      });
    }

    const btnQuickCat = document.getElementById('btn-quick-new-category');
    if (btnQuickCat) {
      btnQuickCat.addEventListener('click', () => {
        this.openModal('#modal-categories');
      });
    }

    const instCheck = document.getElementById('expense-is-installment-checkbox');
    const instGroup = document.getElementById('installment-selector-group');
    const amountInput = document.getElementById('expense-amount-input');
    const instSelect = document.getElementById('expense-installments-select');
    const instPreview = document.getElementById('installment-calculation-preview');

    const updateInstallmentPreview = () => {
      if (!instCheck?.checked) return;
      const amt = parseFloat(amountInput?.value) || 0;
      const count = parseInt(instSelect?.value, 10) || 2;
      if (amt > 0 && count > 1) {
        const items = generateExpenseInstallments({ description: '', amount: amt, date: todayStr }, count);
        const p1 = items[0]?.amount || 0;
        const pOther = items[1]?.amount || 0;
        if (instPreview) {
          instPreview.textContent = `1ª parcela: ${formatCurrency(p1)} + ${count - 1}x de ${formatCurrency(pOther)}`;
        }
      } else if (instPreview) {
        instPreview.textContent = '';
      }
    };

    if (instCheck && instGroup) {
      instCheck.addEventListener('change', () => {
        if (instCheck.checked) {
          instGroup.classList.remove('hidden');
          updateInstallmentPreview();
        } else {
          instGroup.classList.add('hidden');
        }
      });
    }

    if (amountInput) amountInput.addEventListener('input', updateInstallmentPreview);
    if (instSelect) instSelect.addEventListener('change', updateInstallmentPreview);

    const form = document.getElementById('form-new-expense');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const description = fd.get('description')?.trim();
        const amount = parseFloat(fd.get('amount')) || 0;
        const date = fd.get('date') || getLocalDateString();
        const category = fd.get('category') || 'Outros';
        const isInstallment = Boolean(instCheck?.checked);
        const totalInstallments = isInstallment ? parseInt(fd.get('totalInstallments'), 10) : 1;

        if (!description) {
          this.showToast('Informe a descrição da despesa.', 'warning');
          return;
        }

        if (amount <= 0) {
          this.showToast('Informe um valor válido para a despesa.', 'warning');
          return;
        }

        this.store.saveExpense({
          description,
          amount,
          date,
          category,
          isInstallment,
          totalInstallments
        });

        this.closeModal('#modal-expense');
        this.showToast('Despesa registrada com sucesso! 💳🌸', 'success');
        this.render();
      });
    }
  }

  renderProfileModalContent() {
    let modalEl = document.getElementById('modal-doctor-profile');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'modal-doctor-profile';
      modalEl.className = 'modal-backdrop hidden';
      modalEl.setAttribute('role', 'dialog');
      modalEl.setAttribute('aria-modal', 'true');
      modalEl.innerHTML = `
        <div class="modal-sheet">
          <header class="modal-header">
            <div class="modal-title-wrap">
              <span class="silk-pill-badge">Perfil Médico</span>
              <h3>Médica</h3>
            </div>
            <button class="modal-close-btn" data-close-modal="#modal-doctor-profile" aria-label="Fechar">
              ${getIconSvg('close', 20)}
            </button>
          </header>
          <div id="modal-doctor-profile-content"></div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    const container = document.getElementById('modal-doctor-profile-content');
    if (!container) return;

    const data = this.store.data;
    const salaryVal = data.residencySalary?.value || 0.00;

    container.innerHTML = `
      <form id="form-edit-doctor-profile" class="modal-form" novalidate>
        <div class="input-field-group">
          <label for="profile-name-input" class="silk-input-label">Nome Completo</label>
          <input 
            type="text" 
            id="profile-name-input" 
            name="doctorName" 
            class="silk-input" 
            value="${escapeHtml(data.doctorName || 'Médica')}" 
            required 
          />
        </div>

        <div class="form-row-2">
          <div class="input-field-group">
            <label for="profile-crm-input" class="silk-input-label">CRM / UF</label>
            <input 
              type="text" 
              id="profile-crm-input" 
              name="crm" 
              class="silk-input" 
              value="${escapeHtml(data.crm || 'CRM/TESTE')}" 
            />
          </div>

          <div class="input-field-group">
            <label for="profile-specialty-input" class="silk-input-label">Especialidade</label>
            <input 
              type="text" 
              id="profile-specialty-input" 
              name="specialty" 
              class="silk-input" 
              value="${escapeHtml(data.specialty || 'Pediatria (R3)')}" 
            />
          </div>
        </div>

        <div class="input-field-group">
          <label for="profile-salary-input" class="silk-input-label">Bolsa Residência Médica Mensal (R$)</label>
          <input 
            type="number" 
            step="0.01" 
            id="profile-salary-input" 
            name="salaryValue" 
            class="silk-input" 
            value="${escapeHtml(salaryVal)}" 
            required 
          />
        </div>

        <div class="modal-actions-row">
          <button type="button" class="btn-silk-text-danger" data-close-modal="#modal-doctor-profile">Cancelar</button>
          <button type="submit" class="btn-silk-primary">Salvar Perfil</button>
        </div>
      </form>
    `;

    const form = document.getElementById('form-edit-doctor-profile');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const doctorName = fd.get('doctorName')?.trim() || 'Médica';
        const crm = fd.get('crm')?.trim();
        const specialty = fd.get('specialty')?.trim();
        const salaryValue = parseFloat(fd.get('salaryValue')) || 0.00;

        this.store.updateDoctorProfile({
          doctorName,
          crm,
          specialty,
          salaryValue
        });

        this.closeModal('#modal-doctor-profile');
        this.showToast('Perfil médico atualizado! 🩺✨', 'success');
        this.render();
      });
    }
  }

  renderCategoriesModalContent() {
    const container = document.getElementById('categories-modal-body');
    if (!container) return;

    const customCats = (this.store?.data?.customCategories || []);
    const macroOptions = MACRO_GROUPS.map(mg => `<option value="${escapeHtml(mg.name)}">${escapeHtml(mg.name)}</option>`).join('');

    const formHtml = `
      <div class="category-create-card" style="margin-bottom: 16px; padding: 14px; border-radius: var(--radius-card, 16px); background: var(--bg-card, #FFF9FA); border: 1.5px dashed var(--rose-primary, #EC407A);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <span style="font-size: 1.1rem;">✨</span>
          <strong style="font-size: 0.95rem; color: var(--text-main, #333);">Criar Nova Categoria / Subcategoria</strong>
        </div>
        <form id="form-new-custom-category" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="input-field-group" style="margin-bottom: 0;">
            <label for="new-cat-name-input" class="silk-input-label">Nome da Categoria</label>
            <input type="text" id="new-cat-name-input" name="name" class="silk-input" placeholder="Ex: Fisioterapia Respiratória, Pilates, Congresso SBP" required />
          </div>
          <div class="input-field-group" style="margin-bottom: 0;">
            <label for="new-cat-macro-select" class="silk-input-label">Macro-Grupo Vinculado</label>
            <select id="new-cat-macro-select" name="macroGroup" class="silk-input">
              ${macroOptions}
            </select>
          </div>
          <button type="submit" class="btn-silk-primary" style="height: 42px; font-size: 0.88rem; margin-top: 4px;">
            <span>Adicionar Categoria</span>
          </button>
        </form>
      </div>
    `;

    const groupsHtml = MACRO_GROUPS.map(mg => {
      const groupCategories = [...new Set([
        ...mg.categories,
        ...customCats.filter(c => (c.macroGroup || c.macro_group) === mg.name).map(c => c.name)
      ])];

      return `
        <div class="category-group-card" style="margin-bottom: 12px; padding: 14px; border-radius: var(--radius-card, 16px); background: var(--bg-card, #FFF9FA); border: 1px solid var(--silk-border, #FCE4EC);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <strong style="color: ${mg.color || '#333'}; font-size: 0.95rem;">${escapeHtml(mg.name)}</strong>
            <span class="silk-badge" style="background: rgba(236, 64, 122, 0.1); color: #EC407A; font-size: 0.75rem; padding: 2px 8px; border-radius: 12px;">${groupCategories.length} categorias</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${groupCategories.map(c => {
              const isCustom = customCats.some(cust => cust.name.toLowerCase() === c.toLowerCase());
              return `
                <span style="font-size: 0.8rem; background: ${isCustom ? 'rgba(236,64,122,0.1)' : 'var(--bg-body, #FFF)'}; border: 1px solid ${isCustom ? '#EC407A' : 'var(--silk-border, #F8BBD0)'}; border-radius: 12px; padding: 3px 8px; color: var(--text-main, #333); display: inline-flex; align-items: center; gap: 4px;">
                  ${escapeHtml(c)}
                  ${isCustom ? `<button type="button" class="btn-del-custom-cat" data-cat-name="${escapeHtml(c)}" style="border: none; background: transparent; cursor: pointer; color: #EF5350; font-size: 11px; padding: 0 2px; line-height: 1;" title="Excluir categoria">✕</button>` : ''}
                </span>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = formHtml + groupsHtml;

    const formNewCat = document.getElementById('form-new-custom-category');
    if (formNewCat) {
      formNewCat.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('new-cat-name-input');
        const macroSelect = document.getElementById('new-cat-macro-select');
        const name = nameInput?.value?.trim();
        const macroGroup = macroSelect?.value || 'Pessoal, Lazer & Outros';

        if (!name) {
          this.showToast('Informe o nome da categoria.', 'warning');
          return;
        }

        if (this.store && typeof this.store.addCategory === 'function') {
          this.store.addCategory({ name, macroGroup });
          this.showToast(`Categoria "${name}" criada com sucesso! ✨`, 'success');
          this.renderCategoriesModalContent();
          this.renderExpenseModalContent();
        }
      });
    }

    container.querySelectorAll('.btn-del-custom-cat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const catName = btn.getAttribute('data-cat-name');
        if (catName && this.store && typeof this.store.deleteCustomCategory === 'function') {
          this.store.deleteCustomCategory(catName);
          this.showToast(`Categoria "${catName}" removida.`, 'info');
          this.renderCategoriesModalContent();
          this.renderExpenseModalContent();
        }
      });
    });
  }

  // ==========================================================================
  // 7. NOTIFICAÇÕES FLUTUANTES (TOAST STACK)
  // ==========================================================================

  showToast(message, type = 'info', duration = 3200) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-stack';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `silk-toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    let iconSvg = getIconSvg('sparkles', { size: 18, color: '#EC407A' });
    if (type === 'success') iconSvg = getIconSvg('check', { size: 18, color: '#26A69A' });
    if (type === 'warning') iconSvg = getIconSvg('alert', { size: 18, color: '#FFA726' });
    if (type === 'error') iconSvg = getIconSvg('close', { size: 18, color: '#EF5350' });

    toast.innerHTML = `
      <div class="toast-icon-wrap">${iconSvg}</div>
      <div class="toast-text">${escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  // ==========================================================================
  // 8. ATUALIZADOR VISUAL DO SYNC BADGE
  // ==========================================================================

  updateSyncBadge(status, details = {}) {
    const badge = document.getElementById('sync-badge');
    if (!badge) return;

    badge.className = 'sync-badge';
    const dot = badge.querySelector('.sync-dot');
    const text = badge.querySelector('.sync-text');

    if (status === 'guest' || isGuestMode()) {
      badge.classList.add('guest');
      if (text) text.textContent = 'Modo Local';
      badge.title = 'Modo Hospitalar Local (sem conexão com a nuvem)';
    } else if (status === 'syncing') {
      badge.classList.add('syncing');
      if (text) text.textContent = 'Sincronizando...';
      badge.title = 'Transmitindo plantões e despesas para o Supabase';
    } else if (status === 'offline' || isOfflineMode()) {
      badge.classList.add('offline');
      if (text) text.textContent = 'Offline';
      badge.title = 'Sem rede. Mutações gravadas no IndexedDB local.';
    } else if (status === 'error') {
      badge.classList.add('error');
      if (text) text.textContent = 'Erro de Sync';
      badge.title = details.message || 'Falha ao sincronizar com a nuvem.';
    } else {
      badge.classList.add('synced');
      if (text) text.textContent = 'Sincronizado';
      badge.title = 'Nuvem Supabase atualizada e protegida por RLS.';
    }
  }

  // ==========================================================================
  // 9. RENDERIZAÇÃO DO APLICATIVO E DAS 3 ABAS PRIMÁRIAS
  // ==========================================================================

  render() {
    const data = this.store.data;
    const currentMonth = data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const currentRegime = data.preferences.regime || 'caixa';

    if (this.doctorNameHeader) this.doctorNameHeader.textContent = data.doctorName || 'Médica';
    if (this.doctorRoleHeader) this.doctorRoleHeader.textContent = data.specialty || 'Pediatria (R3)';
    if (this.monthTitle) this.monthTitle.textContent = formatMonthYear(currentMonth);
    if (this.regimePill) this.regimePill.textContent = currentRegime === 'caixa' ? 'Regime de Caixa' : 'Regime de Competência';

    if (typeof document !== 'undefined' && document.querySelectorAll) {
      const regimeBtns = document.querySelectorAll('[data-regime]');
      if (regimeBtns && regimeBtns.forEach) {
        regimeBtns.forEach(btn => {
          if (btn.getAttribute('data-regime') === currentRegime) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
    }

    if (data.doctorPhoto && this.avatarImg) {
      this.avatarImg.src = data.doctorPhoto;
      this.avatarImg.classList.remove('hidden');
      if (this.avatarFallback) this.avatarFallback.classList.add('hidden');
    } else if (this.avatarFallback) {
      this.avatarFallback.classList.remove('hidden');
      if (this.avatarImg) this.avatarImg.classList.add('hidden');
    }

    if (this.currentTab === 'home') {
      this.renderHomeView();
    } else if (this.currentTab === 'income') {
      this.renderIncomeView();
    } else if (this.currentTab === 'expenses') {
      this.renderExpensesView();
    }
  }

  renderHomeView() {
    if (!this.viewHome) return;

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const currentRegime = this.store.data.preferences.regime || 'caixa';
    const summary = this.store.getMonthSummary(currentMonth, currentRegime);

    const upcomingHtml = summary.upcomingDisbursements && summary.upcomingDisbursements.length > 0
      ? summary.upcomingDisbursements.map(d => `
          <div class="disbursement-card">
            <div class="disbursement-info">
              <span class="disbursement-hospital">${escapeHtml(d.hospital)}</span>
              <span class="disbursement-rule">${escapeHtml(d.label)}</span>
              <small class="disbursement-date">Previsão: ${formatDateBR(d.expectedDate)}</small>
            </div>
            <div class="disbursement-action">
              <span class="disbursement-val">${formatCurrency(d.value)}</span>
              <button 
                class="btn-toggle-received ${d.status === 'received' ? 'received' : ''}" 
                data-shift-id="${escapeHtml(d.shiftId)}" 
                data-toggle-installment="${escapeHtml(d.installmentNum)}"
                title="${d.status === 'received' ? 'Marcar como Pendente' : 'Marcar como Recebido'}"
              >
                ${d.status === 'received' ? 'Recebido' : 'Receber'}
              </button>
            </div>
          </div>
        `).join('')
      : '<p class="empty-state-text">Nenhum repasse de plantão agendado para este mês.</p>';

    this.viewHome.innerHTML = `
      <section class="hero-balance-card" aria-label="Balanço do Mês">
        <span class="hero-badge">Resumo Mensal • ${currentRegime === 'caixa' ? 'Regime de Caixa' : 'Regime de Competência'}</span>
        <h2 class="hero-balance-val ${summary.balance < 0 ? 'text-danger' : ''}">${formatCurrency(summary.balance)}</h2>
        <p class="hero-balance-label">Saldo Líquido Estimado</p>

        <div class="hero-metrics-row">
          <div class="hero-metric-item">
            <span class="metric-dot green"></span>
            <div>
              <small>Entradas</small>
              <strong>${formatCurrency(summary.totalIncome)}</strong>
            </div>
          </div>
          <div class="hero-metric-divider"></div>
          <div class="hero-metric-item">
            <span class="metric-dot coral"></span>
            <div>
              <small>Saídas</small>
              <strong>${formatCurrency(summary.totalExpenses)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="section-card" aria-label="Repasses de Plantão Previstos">
        <div class="section-header">
          <h3>Repasses de Plantões no Mês</h3>
          <span class="section-tag">${summary.upcomingDisbursements?.length || 0} repasses</span>
        </div>
        <div class="disbursements-list">
          ${upcomingHtml}
        </div>
      </section>

      <section class="quick-add-cards-row">
        <button class="quick-add-card income" data-open-shift-modal type="button" onclick="window.v4App?.ui?.openModal('#modal-shift')">
          <div class="card-icon-halo pink">${getIconSvg('stethoscope', { size: 24, color: '#EC407A' })}</div>
          <div>
            <strong>Novo Plantão</strong>
            <small>75% D+60 / 25% D+90</small>
          </div>
        </button>
        <button class="quick-add-card expense" data-open-expense-modal type="button" onclick="window.v4App?.ui?.openModal('#modal-expense')">
          <div class="card-icon-halo coral">${getIconSvg('cart', { size: 24, color: '#FF7043' })}</div>
          <div>
            <strong>Nova Despesa</strong>
            <small>6 Macro-Grupos</small>
          </div>
        </button>
      </section>
    `;
  }

  renderIncomeView() {
    if (!this.viewIncome) return;

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const shiftsInMonth = this.store.data.shifts.filter(s => s.date && s.date.startsWith(currentMonth));
    const totalWorked = shiftsInMonth.reduce((acc, s) => acc + (s.netValue || 0), 0);

    const shiftCardsHtml = shiftsInMonth.length > 0
      ? shiftsInMonth.map(s => `
          <div class="shift-item-card">
            <div class="shift-card-header">
              <div>
                <h4 class="shift-hospital-title">${escapeHtml(s.hospital)}</h4>
                <small class="shift-meta-text">${formatDateBR(s.date)} • ${escapeHtml(s.shiftType)}</small>
              </div>
              <strong class="shift-net-val">${formatCurrency(s.netValue)}</strong>
            </div>

            <div class="shift-installments-row">
              <div class="shift-inst-badge ${s.installment1?.status === 'received' ? 'paid' : 'pending'}">
                <span>75% (D+60): ${formatCurrency(s.installment1?.value || 0)}</span>
                <small>${formatDateBR(s.installment1?.date || s.installment1_date)}</small>
              </div>
              <div class="shift-inst-badge ${s.installment2?.status === 'received' ? 'paid' : 'pending'}">
                <span>25% (D+90): ${formatCurrency(s.installment2?.value || 0)}</span>
                <small>${formatDateBR(s.installment2?.date || s.installment2_date)}</small>
              </div>
            </div>

            <div class="shift-card-actions">
              <button class="btn-delete-item" data-delete-shift="${escapeHtml(s.id)}" title="Excluir Plantão">
                ${getIconSvg('delete', { size: 16 })}
                <span>Excluir</span>
              </button>
            </div>
          </div>
        `).join('')
      : '<p class="empty-state-text">Nenhum plantão registrado em ' + formatMonthYear(currentMonth) + '.</p>';

    this.viewIncome.innerHTML = `
      <section class="section-card">
        <div class="section-header">
          <div>
            <h3>Plantões Trabalhados</h3>
            <small>Produção Médica: ${formatCurrency(totalWorked)}</small>
          </div>
          <button class="btn-silk-primary btn-sm" onclick="window.v4App?.ui?.openModal('#modal-shift')">
            + Plantão
          </button>
        </div>
        <div class="shifts-list-container">
          ${shiftCardsHtml}
        </div>
      </section>
    `;
  }

  renderExpensesView() {
    if (!this.viewExpenses) return;

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    let expensesInMonth = this.store.data.expenses.filter(e => e.date && e.date.startsWith(currentMonth));

    if (this.activeExpenseFilter !== 'all') {
      expensesInMonth = expensesInMonth.filter(e => {
        const mg = getMacroGroupForCategory(e.category, this.store.data.customCategories);
        return mg.id === this.activeExpenseFilter;
      });
    }

    const totalFiltered = expensesInMonth.reduce((acc, e) => acc + (e.amount || 0), 0);

    const macroChipsHtml = `
      <button class="macro-chip ${this.activeExpenseFilter === 'all' ? 'active' : ''}" data-macro-filter="all">Todos</button>
      ${MACRO_GROUPS.map(mg => `
        <button class="macro-chip ${this.activeExpenseFilter === mg.id ? 'active' : ''}" data-macro-filter="${escapeHtml(mg.id)}">${escapeHtml(mg.name)}</button>
      `).join('')}
    `;

    const expenseCardsHtml = expensesInMonth.length > 0
      ? expensesInMonth.map(e => {
          const mg = getMacroGroupForCategory(e.category, this.store.data.customCategories);
          return `
            <div class="expense-item-card">
              <div class="expense-card-left">
                <span class="expense-desc">${escapeHtml(e.description)}</span>
                <div class="expense-tags-row">
                  <span class="cat-pill" style="border-color: ${escapeHtml(mg.color)}40; color: ${escapeHtml(mg.color)}; background: ${escapeHtml(mg.bgColor)};">${escapeHtml(e.category)}</span>
                  ${e.installmentNumber ? `<span class="inst-pill">Parcela ${escapeHtml(e.installmentNumber)}/${escapeHtml(e.totalInstallments)}</span>` : ''}
                  <small class="expense-date">${formatDateBR(e.date)}</small>
                </div>
              </div>
              <div class="expense-card-right">
                <strong class="expense-amount-val">${formatCurrency(e.amount)}</strong>
                <button class="btn-delete-item icon-only" data-delete-expense="${escapeHtml(e.id)}" title="Excluir Despesa">
                  ${getIconSvg('delete', { size: 16 })}
                </button>
              </div>
            </div>
          `;
        }).join('')
      : '<p class="empty-state-text">Nenhuma despesa encontrada para este filtro.</p>';

    this.viewExpenses.innerHTML = `
      <section class="section-card">
        <div class="section-header">
          <div>
            <h3>Despesas do Mês</h3>
            <small>Total: ${formatCurrency(totalFiltered)}</small>
          </div>
          <button class="btn-silk-primary btn-sm" onclick="window.v4App?.ui?.openModal('#modal-expense')">
            + Despesa
          </button>
        </div>

        <div class="macro-chips-scroll">
          ${macroChipsHtml}
        </div>

        <div class="expenses-list-container">
          ${expenseCardsHtml}
        </div>
      </section>
    `;
  }

  // ==========================================================================
  // 10. AÇÕES DE ITENS INDIVIDUAIS (TOGGLE / DELETE)
  // ==========================================================================

  handleToggleShiftInstallment(shiftId, installmentNum) {
    this.store.toggleShiftInstallment(shiftId, installmentNum);
    this.showToast('Status da parcela atualizado com sucesso! ✨', 'info');
    this.render();
  }

  handleDeleteShift(shiftId) {
    if (confirm('Deseja realmente excluir este plantão?')) {
      this.store.deleteShift(shiftId);
      this.showToast('Plantão removido.', 'info');
      this.render();
    }
  }

  handleDeleteExpense(expenseId) {
    if (confirm('Deseja realmente excluir esta despesa?')) {
      this.store.deleteExpense(expenseId);
      this.showToast('Despesa removida.', 'info');
      this.render();
    }
  }

  setExpenseFilter(macroId) {
    this.activeExpenseFilter = macroId;
    this.renderExpensesView();
  }
}