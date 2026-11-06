/**
 * Finanças Pediatria /v8/ - Camada de Apresentação e UI Ergonomicamente Blindada
 * Standalone Local-First • Anti-XSS Sanitization • Microinterações Acolhedoras
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { APP_CREATOR, formatCurrency, formatDateBR, formatMonthYear, getLocalDateString, addMonthsToDateString, getCategoryKey, normalizeCategoryName, MACRO_GROUPS } from './store.js';
import { getIconSvg, sanitizeColor } from './icons.js';

/**
 * Sanitiza strings para inserção segura no DOM (Previne DOM XSS)
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class PediatricUI {
  constructor(store, storage) {
    this.store = store;
    this.storage = storage;
    this.activeTab = 'home';
    this.selectedMacroFilter = 'all';
    this.editingShiftId = null;
    this.editingExpenseId = null;
    this.undoToastTimer = null;
  }

  init() {
    this.bindGlobalEvents();
    this.render();
  }

  // =========================================================================
  // DELEGAÇÃO DE EVENTOS GLOBAIS (ZERO HANDLERS INLINE NO HTML)
  // =========================================================================

  bindGlobalEvents() {
    // 1. Navegação por Abas (Inferior)
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        this.switchTab(tab);
        return;
      }

      // 2. Modais: Abertura e Fechamento
      const openModalBtn = e.target.closest('[data-open-modal]');
      if (openModalBtn) {
        const target = openModalBtn.getAttribute('data-open-modal');
        this.openModal(target);
        return;
      }

      const closeModalBtn = e.target.closest('[data-close-modal]');
      if (closeModalBtn) {
        const target = closeModalBtn.getAttribute('data-close-modal');
        this.closeModal(target);
        return;
      }

      // 3. Regime Contábil: Caixa vs Competência
      const regimeBtn = e.target.closest('[data-regime]');
      if (regimeBtn) {
        const regime = regimeBtn.getAttribute('data-regime');
        this.store.data.preferences.regime = regime;
        this.store.save();
        this.render();
        return;
      }

      // 4. Navegação de Mês
      const prevMonthBtn = e.target.closest('#btn-prev-month');
      if (prevMonthBtn) {
        this.changeMonth(-1);
        return;
      }

      const nextMonthBtn = e.target.closest('#btn-next-month');
      if (nextMonthBtn) {
        this.changeMonth(1);
        return;
      }

      // 5. Botões de Ação Rápida no Topo
      if (e.target.closest('#btn-quick-add-shift') || e.target.closest('#btn-add-shift-quick')) {
        this.openShiftModal();
        return;
      }

      if (e.target.closest('#btn-quick-add-expense') || e.target.closest('#btn-add-expense-quick')) {
        this.openExpenseModal();
        return;
      }

      if (e.target.closest('#fab-add-btn')) {
        if (this.activeTab === 'income') {
          this.openShiftModal();
        } else {
          this.openExpenseModal();
        }
        return;
      }

      // 6. Chips de Lançamento Rápido no Topo da Home
      const quickChip = e.target.closest('[data-quick-hospital]');
      if (quickChip) {
        const hosp = quickChip.getAttribute('data-quick-hospital');
        this.openShiftModal({ hospital: hosp });
        return;
      }

      // 7. Filtro por Macro-Grupo na Aba Despesas
      const macroFilterBtn = e.target.closest('[data-macro-filter]');
      if (macroFilterBtn) {
        this.selectedMacroFilter = macroFilterBtn.getAttribute('data-macro-filter');
        this.renderExpensesView();
        return;
      }

      // 8. Toque em Item de Plantão (Single-Tap Edit ou Toggle de Parcela)
      const toggleInstallmentBtn = e.target.closest('[data-toggle-installment]');
      if (toggleInstallmentBtn) {
        e.stopPropagation();
        const shiftId = toggleInstallmentBtn.getAttribute('data-shift-id');
        const instNum = parseInt(toggleInstallmentBtn.getAttribute('data-toggle-installment'), 10);
        this.store.toggleShiftInstallment(shiftId, instNum);
        this.render();
        return;
      }

      const deleteShiftBtn = e.target.closest('[data-delete-shift]');
      if (deleteShiftBtn) {
        e.stopPropagation();
        const shiftId = deleteShiftBtn.getAttribute('data-delete-shift');
        const deleted = this.store.deleteShift(shiftId);
        if (deleted) {
          this.showToastWithUndo(`Plantão ${escapeHtml(deleted.source_name_snapshot)} excluído`, () => {
            this.store.restoreShift(deleted);
            this.render();
          });
          this.render();
        }
        return;
      }

      const shiftCard = e.target.closest('[data-shift-card-id]');
      if (shiftCard && !e.target.closest('button')) {
        const shiftId = shiftCard.getAttribute('data-shift-card-id');
        this.openShiftModal({ shiftId });
        return;
      }

      // 9. Toque em Item de Despesa (Single-Tap Edit ou Exclusão)
      const deleteExpenseBtn = e.target.closest('[data-delete-expense]');
      if (deleteExpenseBtn) {
        e.stopPropagation();
        const expId = deleteExpenseBtn.getAttribute('data-delete-expense');
        const deleted = this.store.deleteExpense(expId);
        if (deleted) {
          this.showToastWithUndo(`Despesa "${escapeHtml(deleted.description)}" excluída`, () => {
            this.store.restoreExpense(deleted);
            this.render();
          });
          this.render();
        }
        return;
      }

      const expenseCard = e.target.closest('[data-expense-card-id]');
      if (expenseCard && !e.target.closest('button')) {
        const expId = expenseCard.getAttribute('data-expense-card-id');
        this.openExpenseModal({ expenseId: expId });
        return;
      }

      // 10. Drawer Menu Hambúrguer
      if (e.target.closest('#btn-header-menu')) {
        this.openDrawer();
        return;
      }

      if (e.target.closest('#btn-close-drawer') || (e.target.id === 'drawer-menu' && !e.target.closest('.drawer-panel'))) {
        this.closeDrawer();
        return;
      }

      // 11. Itens do Drawer
      if (e.target.closest('#drawer-item-profile') || e.target.closest('#btn-header-profile')) {
        this.closeDrawer();
        this.openProfileModal();
        return;
      }

      if (e.target.closest('#drawer-item-income-sources')) {
        this.closeDrawer();
        this.openIncomeSourcesModal();
        return;
      }

      if (e.target.closest('#drawer-item-categories')) {
        this.closeDrawer();
        this.openCategoriesModal();
        return;
      }

      if (e.target.closest('#drawer-item-hub')) {
        this.closeDrawer();
        this.openHubModal();
        return;
      }

      if (e.target.closest('#drawer-item-theme') || e.target.closest('#btn-header-theme')) {
        this.toggleTheme();
        return;
      }

      if (e.target.closest('#drawer-item-backup')) {
        this.closeDrawer();
        this.exportBackup();
        return;
      }

      if (e.target.closest('#drawer-item-restore')) {
        this.closeDrawer();
        const fileInput = document.getElementById('backup-file-input');
        if (fileInput) fileInput.click();
        return;
      }

      if (e.target.closest('#drawer-item-reset')) {
        this.closeDrawer();
        this.openResetConfirmModal();
        return;
      }

      // Fechamento de backdrop de modal ao clicar fora
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.add('hidden');
      }
    });

    // Submissão de Formulários
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'form-new-shift') {
        e.preventDefault();
        this.handleSaveShift(e.target);
        return;
      }

      if (e.target.id === 'form-new-expense') {
        e.preventDefault();
        this.handleSaveExpense(e.target);
        return;
      }

      if (e.target.id === 'form-profile') {
        e.preventDefault();
        this.handleSaveProfile(e.target);
        return;
      }

      if (e.target.id === 'form-add-income-source') {
        e.preventDefault();
        this.handleAddIncomeSource(e.target);
        return;
      }

      if (e.target.id === 'form-add-category') {
        e.preventDefault();
        this.handleAddCategory(e.target);
        return;
      }
    });

    // Importação de Arquivo de Backup
    const fileInput = document.getElementById('backup-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const result = this.storage.importBackup(text, this.store);
          if (result.success) {
            this.showToast(`Backup restaurado! ${result.countShifts} plantões e ${result.countExpenses} despesas recuperadas.`);
            this.render();
          } else {
            this.showToast(`Erro na restauração: ${result.error}`, 'error');
          }
        } catch (err) {
          this.showToast(`Falha ao ler arquivo: ${err.message}`, 'error');
        } finally {
          fileInput.value = '';
        }
      });
    }

    // Tecla Escape fecha modais e gavetas
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeDrawer();
      }
    });
  }

  // =========================================================================
  // NAVEGAÇÃO DE ABAS & MESES
  // =========================================================================

  switchTab(tabName) {
    if (!['home', 'income', 'expenses'].includes(tabName)) return;
    this.activeTab = tabName;

    // Atualiza botões da barra inferior
    document.querySelectorAll('.bottom-nav-bar .nav-tab').forEach(btn => {
      const isMatch = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', isMatch);
    });

    // Atualiza views
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.add('hidden');
    });

    const targetView = document.getElementById(`view-${tabName}`);
    if (targetView) targetView.classList.remove('hidden');

    this.render();
  }

  changeMonth(delta) {
    const current = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const parts = current.split('-');
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10) - 1 + delta;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;

    const nextMonth = `${y}-${String(m + 1).padStart(2, '0')}`;
    this.store.data.preferences.activeMonth = nextMonth;
    this.store.save();
    this.render();
  }

  // =========================================================================
  // RENDERIZAÇÃO PRINCIPAL DO APLICATIVO
  // =========================================================================

  render() {
    const activeMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const regime = this.store.data.preferences.regime || 'caixa';
    const summary = this.store.getMonthSummary(activeMonth, regime);

    // 1. Cabeçalho e Mês Atual
    const monthTitle = document.getElementById('current-month-title');
    if (monthTitle) monthTitle.textContent = formatMonthYear(activeMonth);

    const heroMonthLabel = document.getElementById('hero-month-label');
    if (heroMonthLabel) heroMonthLabel.textContent = formatMonthYear(activeMonth);

    const regimePill = document.getElementById('current-regime-pill');
    if (regimePill) {
      regimePill.textContent = regime === 'caixa' ? 'Regime de Caixa' : 'Regime de Competência';
    }

    // Toggle de botões de regime
    document.querySelectorAll('.regime-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-regime') === regime);
    });

    // 2. Perfil da Médica no Cabeçalho
    const doctorName = document.getElementById('header-doctor-name');
    if (doctorName) doctorName.textContent = escapeHtml(this.store.data.doctorName || 'Médica');

    const doctorRole = document.getElementById('header-doctor-role');
    if (doctorRole) doctorRole.textContent = escapeHtml(this.store.data.doctorRole || 'Pediatra (R3)');

    const avatarImg = document.getElementById('doctor-avatar-img');
    const avatarFallback = document.getElementById('doctor-avatar-fallback');
    if (avatarImg && avatarFallback) {
      if (this.store.data.doctorPhoto) {
        avatarImg.src = this.store.data.doctorPhoto;
        avatarImg.classList.remove('hidden');
        avatarFallback.classList.add('hidden');
      } else {
        avatarImg.classList.add('hidden');
        avatarFallback.classList.remove('hidden');
      }
    }

    // 3. Renderiza a Aba Ativa
    if (this.activeTab === 'home') {
      this.renderHomeView(summary);
    } else if (this.activeTab === 'income') {
      this.renderIncomeView(summary);
    } else if (this.activeTab === 'expenses') {
      this.renderExpensesView(summary);
    }

    // 4. Renderiza Chips de Topo
    this.renderTopMaternityChips();
  }

  // =========================================================================
  // ABA 1: INÍCIO (DASHBOARD & BALANÇO PEDIÁTRICO)
  // =========================================================================

  renderHomeView(summary) {
    // Saldo e Totais
    const balanceEl = document.getElementById('hero-balance-value');
    if (balanceEl) {
      balanceEl.textContent = formatCurrency(summary.balance);
      balanceEl.classList.toggle('negative', summary.balance < 0);
    }

    const totalIncomeEl = document.getElementById('stat-total-income');
    if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(summary.totalIncome);

    const totalExpensesEl = document.getElementById('stat-total-expenses');
    if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(summary.totalExpenses);

    // Representação Visual 1: Previsão de 6 Meses
    const forecastContainer = document.getElementById('home-forecast-container');
    if (forecastContainer) {
      const forecast = this.store.getForecast6Months(this.store.data.preferences.activeMonth);
      forecastContainer.innerHTML = this.renderForecastChart(forecast);
    }

    // Representação Visual 2: Donut de Gastos
    const donutContainer = document.getElementById('home-donut-container');
    const donutBadge = document.getElementById('donut-item-count');
    if (donutContainer) {
      if (donutBadge) donutBadge.textContent = `${summary.expensesCount} lançamentos`;
      donutContainer.innerHTML = this.renderDonutChart(summary.categoryBreakdown, summary.totalExpenses);
    }

    // Representação Visual 3: Comparativo Caixa vs Competência
    const compContainer = document.getElementById('home-comparison-container');
    if (compContainer) {
      compContainer.innerHTML = `
        <div class="comp-box">
          <div class="comp-row">
            <span>Caixa Real Efetivado (Recebido):</span>
            <strong style="color: #26A69A;">${formatCurrency(summary.shiftInflowRealized)}</strong>
          </div>
          <div class="comp-row">
            <span>A Receber em Aberto (D+60/D+90):</span>
            <strong style="color: #FFA726;">${formatCurrency(summary.shiftInflowPending)}</strong>
          </div>
          <div class="comp-row">
            <span>Produção Realizada no Mês:</span>
            <strong style="color: #EC407A;">${formatCurrency(summary.shiftProductionTotal)}</strong>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // ABA 2: GANHOS & PLANTÕES
  // =========================================================================

  renderIncomeView(summary) {
    // Card da Bolsa Residência
    const salary = this.store.data.residencySalary;
    const salaryDisplay = document.getElementById('salary-display-value');
    const salaryBadge = document.getElementById('salary-status-badge');
    if (salaryDisplay) {
      salaryDisplay.textContent = formatCurrency(salary?.value || 0);
    }
    if (salaryBadge) {
      const active = Boolean(salary?.active);
      salaryBadge.textContent = active ? 'Ativa' : 'Pausada';
      salaryBadge.className = `badge-status-pill ${active ? 'mint' : 'muted'}`;
    }

    // Lista de Plantões
    const container = document.getElementById('shifts-list-container');
    if (!container) return;

    const activeMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const isCaixa = this.store.data.preferences.regime === 'caixa';

    // Filtra plantões aplicáveis ao mês
    const shifts = this.store.data.shifts.filter(s => {
      if (isCaixa) {
        return (s.installments || []).some(i => i.date && i.date.startsWith(activeMonth));
      }
      return s.date && s.date.startsWith(activeMonth);
    });

    if (shifts.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          ${getIconSvg('stethoscope', 40, '#EC407A')}
          <h4>Nenhum plantão registrado</h4>
          <p>Registre seus plantões em sala de parto ou consultas com cálculo automático de D+60 e D+90.</p>
          <button class="btn-silk-primary" data-action="quick-add-shift" type="button" style="margin-top: 12px;">+ Adicionar Plantão</button>
        </div>
      `;
      const quickBtn = container.querySelector('[data-action="quick-add-shift"]');
      if (quickBtn) quickBtn.addEventListener('click', () => this.openShiftModal());
      return;
    }

    container.innerHTML = shifts.map(shift => {
      const installmentsHtml = (shift.installments || []).map((inst, idx) => {
        const isReceived = inst.status === 'received';
        const num = idx + 1;
        const inThisMonth = inst.date && inst.date.startsWith(activeMonth);

        return `
          <div class="installment-pill ${isReceived ? 'paid' : 'pending'} ${inThisMonth ? 'current-month-highlight' : ''}">
            <div class="inst-info">
              <span class="inst-label">${num}ª Parcela (${inst.percentage}%)</span>
              <span class="inst-date">${formatDateBR(inst.date)}</span>
            </div>
            <div class="inst-action">
              <strong class="inst-val">${formatCurrency(inst.value)}</strong>
              <button 
                type="button" 
                class="btn-toggle-status ${isReceived ? 'received' : 'pending'}" 
                data-shift-id="${shift.id}" 
                data-toggle-installment="${num}"
                title="${isReceived ? 'Marcar como Pendente' : 'Marcar como Recebido'}"
              >
                ${isReceived ? getIconSvg('check_circle', 18, '#26A69A') : getIconSvg('payments', 18, '#FFA726')}
                <span>${isReceived ? 'Recebido' : 'Pendente'}</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="shift-card" data-shift-card-id="${shift.id}" tabindex="0" role="button" aria-label="Editar plantão ${escapeHtml(shift.source_name_snapshot)}">
          <div class="shift-card-header">
            <div class="shift-hospital-wrap">
              <span class="hospital-icon-badge" style="background: rgba(236, 64, 122, 0.12); color: #EC407A;">
                ${getIconSvg('hospital', 18)}
              </span>
              <div>
                <h3 class="shift-hospital-title">${escapeHtml(shift.source_name_snapshot)}</h3>
                <span class="shift-date-sub">${formatDateBR(shift.date)} • ${escapeHtml(shift.shiftType || 'Sala de Parto')}</span>
              </div>
            </div>
            <div class="shift-card-actions">
              <strong class="shift-net-value">${formatCurrency(shift.net_value)}</strong>
              <button class="btn-icon-delete" type="button" data-delete-shift="${shift.id}" title="Excluir Plantão">
                ${getIconSvg('trash', 16, '#EF5350')}
              </button>
            </div>
          </div>
          <div class="shift-installments-row">
            ${installmentsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // ABA 3: DESPESAS & MACRO-GRUPOS
  // =========================================================================

  renderExpensesView(summary = null) {
    const activeMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    if (!summary) summary = this.store.getMonthSummary(activeMonth);

    // Total
    const totalEl = document.getElementById('expenses-total-value');
    if (totalEl) totalEl.textContent = formatCurrency(summary.totalExpenses);

    const countBadge = document.getElementById('expenses-count-badge');
    if (countBadge) countBadge.textContent = `${summary.expensesCount} itens`;

    // Barra de Filtros de Macro-Grupos
    const filterBar = document.getElementById('macro-filter-bar');
    const clearBtn = document.getElementById('btn-clear-macro-filter');
    if (filterBar) {
      filterBar.innerHTML = `
        <button class="macro-chip ${this.selectedMacroFilter === 'all' ? 'active' : ''}" data-macro-filter="all" type="button">
          Todas
        </button>
        ${MACRO_GROUPS.map(mg => `
          <button class="macro-chip ${this.selectedMacroFilter === mg.name ? 'active' : ''}" data-macro-filter="${escapeHtml(mg.name)}" type="button">
            ${escapeHtml(mg.name)}
          </button>
        `).join('')}
      `;
    }
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', this.selectedMacroFilter === 'all');
    }

    // Lista de Despesas
    const container = document.getElementById('expenses-list-container');
    if (!container) return;

    let expenses = this.store.data.expenses.filter(e => e.date && e.date.startsWith(activeMonth));
    if (this.selectedMacroFilter !== 'all') {
      expenses = expenses.filter(e => (e.macro_group_snapshot || e.macro_group) === this.selectedMacroFilter);
    }

    if (expenses.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          ${getIconSvg('cart', 40, '#FF7043')}
          <h4>Nenhuma despesa registrada</h4>
          <p>Organize suas compras à vista e parceladas com mapeamento automático de categorias.</p>
          <button class="btn-silk-primary" data-action="quick-add-exp" type="button" style="margin-top: 12px;">+ Adicionar Despesa</button>
        </div>
      `;
      const quickBtn = container.querySelector('[data-action="quick-add-exp"]');
      if (quickBtn) quickBtn.addEventListener('click', () => this.openExpenseModal());
      return;
    }

    container.innerHTML = expenses.map(exp => {
      const cat = this.store.getActiveCategories().find(c => getCategoryKey(c.name) === getCategoryKey(exp.category_name_snapshot));
      const icon = cat?.icon || 'tag';
      const color = sanitizeColor(cat?.color || '#FF7043');
      const isInst = Boolean(exp.is_installment || exp.total_installments > 1);

      return `
        <div class="expense-card" data-expense-card-id="${exp.id}" tabindex="0" role="button" aria-label="Editar despesa ${escapeHtml(exp.description)}">
          <div class="expense-icon-badge" style="background: ${color}18; color: ${color};">
            ${getIconSvg(icon, 18, color)}
          </div>
          <div class="expense-info-wrap">
            <h4 class="expense-desc-title">${escapeHtml(exp.description)}</h4>
            <div class="expense-meta-tags">
              <span class="category-pill" style="border-color: ${color}40; color: ${color};">
                ${escapeHtml(exp.category_name_snapshot)}
              </span>
              ${isInst ? `<span class="inst-counter-pill">${exp.current_installment}/${exp.total_installments}</span>` : ''}
              <span class="expense-date-sub">${formatDateBR(exp.date)}</span>
            </div>
          </div>
          <div class="expense-amount-wrap">
            <strong class="expense-amount-val">${formatCurrency(exp.amount)}</strong>
            <button class="btn-icon-delete" type="button" data-delete-expense="${exp.id}" title="Excluir Despesa">
              ${getIconSvg('trash', 16, '#EF5350')}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // CHIPS DE TOPO (MATERNIDADES / FONTES FREQUENTES)
  // =========================================================================

  renderTopMaternityChips() {
    const scrollContainer = document.querySelector('.maternity-chips-scroll');
    if (!scrollContainer) return;

    const sources = this.store.getActiveIncomeSources();
    scrollContainer.innerHTML = sources.map((s, idx) => `
      <button 
        class="hospital-chip ${idx < 2 ? 'highlight' : ''}" 
        data-quick-hospital="${escapeHtml(s.name)}" 
        type="button"
      >
        + ${escapeHtml(s.name)}
      </button>
    `).join('');
  }

  // =========================================================================
  // MODAIS: NOVO PLANTÃO E EDIÇÃO EM 1 TOQUE
  // =========================================================================

  openShiftModal(options = {}) {
    this.closeAllModals();
    const modal = document.getElementById('modal-shift');
    if (!modal) return;

    const titleEl = document.getElementById('modal-shift-title');
    const form = document.getElementById('form-new-shift');
    if (!form) return;

    this.editingShiftId = options.shiftId || null;
    const isEdit = Boolean(this.editingShiftId);

    if (titleEl) {
      titleEl.textContent = isEdit ? 'Editar Plantão Pediátrico' : 'Novo Plantão Pediátrico';
    }

    let defaultHosp = options.hospital || 'Maternidade Principal';
    let defaultNet = '';
    let defaultGross = '';
    let defaultDate = getLocalDateString();
    let defaultType = 'Sala de Parto';
    let defaultNotes = '';

    if (isEdit) {
      const shift = this.store.data.shifts.find(s => s.id === this.editingShiftId);
      if (shift) {
        defaultHosp = shift.source_name_snapshot;
        defaultNet = shift.net_value;
        defaultGross = shift.gross_value;
        defaultDate = shift.date;
        defaultType = shift.shiftType;
        defaultNotes = shift.notes || '';
      }
    } else if (options.hospital) {
      const matched = this.store.getActiveIncomeSources().find(s => getCategoryKey(s.name) === getCategoryKey(options.hospital));
      if (matched && matched.defaultAmount > 0) {
        defaultNet = matched.defaultAmount;
      }
    }

    // Renderiza o corpo do formulário com chips rápidos no topo
    const sources = this.store.getActiveIncomeSources();
    const quickChipsHtml = sources.map(s => `
      <button 
        type="button" 
        class="modal-hosp-pill ${s.name === defaultHosp ? 'selected' : ''}" 
        data-source-chip="${escapeHtml(s.name)}" 
        data-default-amount="${s.defaultAmount}"
        data-source-type="${escapeHtml(s.typeLabel || s.type)}"
      >
        ${escapeHtml(s.name)}
      </button>
    `).join('');

    form.innerHTML = `
      <div class="form-group">
        <label for="shift-hospital-input">Hospital / Maternidade</label>
        <input 
          type="text" 
          id="shift-hospital-input" 
          name="hospital" 
          class="form-input silk-input" 
          value="${escapeHtml(defaultHosp)}" 
          placeholder="Ex: Maternidade Principal" 
          required 
        />
        <div class="modal-hospital-pills" id="shift-source-chips-container">
          ${quickChipsHtml}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="shift-date-input">Data do Plantão</label>
          <input 
            type="date" 
            id="shift-date-input" 
            name="date" 
            class="form-input silk-input" 
            value="${escapeHtml(defaultDate)}" 
            required 
          />
        </div>
        <div class="form-group">
          <label for="shift-type-input">Tipo de Plantão</label>
          <input 
            type="text" 
            id="shift-type-input" 
            name="shiftType" 
            class="form-input silk-input" 
            value="${escapeHtml(defaultType)}" 
            placeholder="Ex: Sala de Parto, 12h UTI" 
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="shift-net-input">Valor Líquido (R$)</label>
          <input 
            type="number" 
            id="shift-net-input" 
            name="netValue" 
            class="form-input silk-input" 
            step="0.01" 
            min="0" 
            value="${defaultNet}" 
            placeholder="0,00" 
            required 
          />
        </div>
        <div class="form-group">
          <label for="shift-gross-input">Valor Bruto (Opcional)</label>
          <input 
            type="number" 
            id="shift-gross-input" 
            name="grossValue" 
            class="form-input silk-input" 
            step="0.01" 
            min="0" 
            value="${defaultGross}" 
            placeholder="0,00" 
          />
        </div>
      </div>

      <div class="form-group">
        <label for="shift-notes-input">Observações Clínicas / Maternidade</label>
        <textarea 
          id="shift-notes-input" 
          name="notes" 
          class="form-input silk-input" 
          rows="2" 
          placeholder="Anotações opcionais (sem dados nominais de pacientes)"
        >${escapeHtml(defaultNotes)}</textarea>
      </div>

      <div class="modal-actions-row">
        <button type="button" class="btn-silk-secondary" data-close-modal="#modal-shift">
          Cancelar
        </button>
        <button type="submit" class="btn-silk-primary">
          ${isEdit ? 'Atualizar Plantão' : 'Salvar Plantão'}
        </button>
      </div>
    `;

    // Chip click preenche em 1 toque
    const chipsContainer = form.querySelector('#shift-source-chips-container');
    if (chipsContainer) {
      chipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-source-chip]');
        if (!chip) return;
        chipsContainer.querySelectorAll('.modal-hosp-pill').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');

        const hospInput = form.querySelector('#shift-hospital-input');
        const netInput = form.querySelector('#shift-net-input');
        const typeInput = form.querySelector('#shift-type-input');

        if (hospInput) hospInput.value = chip.getAttribute('data-source-chip');
        const defAmt = parseFloat(chip.getAttribute('data-default-amount'));
        if (netInput && defAmt > 0) netInput.value = defAmt.toFixed(2);
        if (typeInput) typeInput.value = chip.getAttribute('data-source-type');
      });
    }

    modal.classList.remove('hidden');
  }

  handleSaveShift(form) {
    const hosp = normalizeCategoryName(form.hospital.value);
    const date = form.date.value || getLocalDateString();
    const net = parseFloat(form.netValue.value) || 0;
    const gross = parseFloat(form.grossValue.value) || net;
    const shiftType = form.shiftType.value || 'Sala de Parto';
    const notes = form.notes.value || '';

    if (!hosp || net <= 0) {
      this.showToast('Informe o hospital e o valor líquido do plantão', 'error');
      return;
    }

    if (this.editingShiftId) {
      this.store.updateShift(this.editingShiftId, {
        hospital: hosp,
        date,
        netValue: net,
        grossValue: gross,
        shiftType,
        notes
      });
      this.showToast('Plantão atualizado com sucesso!');
    } else {
      this.store.addShift({
        hospital: hosp,
        date,
        netValue: net,
        grossValue: gross,
        shiftType,
        notes
      });
      this.showToast('Plantão cadastrado com sucesso!');
    }

    this.closeModal('#modal-shift');
    this.render();
  }

  // =========================================================================
  // MODAIS: NOVA DESPESA E EDIÇÃO EM 1 TOQUE
  // =========================================================================

  openExpenseModal(options = {}) {
    this.closeAllModals();
    const modal = document.getElementById('modal-expense');
    if (!modal) return;

    const titleEl = document.getElementById('modal-expense-title');
    const form = document.getElementById('form-new-expense');
    if (!form) return;

    this.editingExpenseId = options.expenseId || null;
    const isEdit = Boolean(this.editingExpenseId);

    if (titleEl) {
      titleEl.textContent = isEdit ? 'Editar Despesa' : 'Nova Despesa Pediátrica';
    }

    let defaultDesc = '';
    let defaultAmount = '';
    let defaultDate = getLocalDateString();
    let defaultCat = 'Mercantil';
    let defaultInstallments = 1;

    if (isEdit) {
      const exp = this.store.data.expenses.find(e => e.id === this.editingExpenseId);
      if (exp) {
        defaultDesc = exp.description;
        defaultAmount = exp.amount;
        defaultDate = exp.date;
        defaultCat = exp.category_name_snapshot;
        defaultInstallments = exp.total_installments || 1;
      }
    }

    const categories = this.store.getActiveCategories();
    const quickChipsHtml = categories.slice(0, 8).map(c => `
      <button 
        type="button" 
        class="modal-hosp-pill ${c.name === defaultCat ? 'selected' : ''}" 
        data-cat-chip="${escapeHtml(c.name)}" 
        data-default-amount="${c.default_amount || ''}"
        data-default-payment="${c.default_payment_type || 'a_vista'}"
      >
        ${escapeHtml(c.name)}
      </button>
    `).join('');

    form.innerHTML = `
      <div class="form-group">
        <label for="exp-desc-input">Descrição do Gasto</label>
        <input 
          type="text" 
          id="exp-desc-input" 
          name="description" 
          class="form-input silk-input" 
          value="${escapeHtml(defaultDesc)}" 
          placeholder="Ex: Mercantil semanal, Estetoscópio" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="exp-category-input">Categoria de Despesa</label>
        <select id="exp-category-input" name="category" class="form-input silk-input">
          ${categories.map(c => `
            <option value="${escapeHtml(c.name)}" ${c.name === defaultCat ? 'selected' : ''}>
              ${escapeHtml(c.name)} (${escapeHtml(c.macro_group)})
            </option>
          `).join('')}
        </select>
        <div class="modal-hospital-pills" id="exp-cat-chips-container" style="margin-top: 8px;">
          ${quickChipsHtml}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="exp-amount-input">Valor (R$)</label>
          <input 
            type="number" 
            id="exp-amount-input" 
            name="amount" 
            class="form-input silk-input" 
            step="0.01" 
            min="0" 
            value="${defaultAmount}" 
            placeholder="0,00" 
            required 
          />
        </div>
        <div class="form-group">
          <label for="exp-date-input">Data da Compra</label>
          <input 
            type="date" 
            id="exp-date-input" 
            name="date" 
            class="form-input silk-input" 
            value="${escapeHtml(defaultDate)}" 
            required 
          />
        </div>
      </div>

      ${!isEdit ? `
        <div class="form-group">
          <label for="exp-installments-input">Condição de Pagamento</label>
          <select id="exp-installments-input" name="totalInstallments" class="form-input silk-input">
            <option value="1">À Vista (1x)</option>
            ${Array.from({ length: 23 }, (_, i) => i + 2).map(n => `
              <option value="${n}">Parcelado em ${n}x no Cartão</option>
            `).join('')}
          </select>
        </div>
      ` : ''}

      <div class="modal-actions-row">
        <button type="button" class="btn-silk-secondary" data-close-modal="#modal-expense">
          Cancelar
        </button>
        <button type="submit" class="btn-silk-primary">
          ${isEdit ? 'Atualizar Despesa' : 'Salvar Despesa'}
        </button>
      </div>
    `;

    // Chip de categoria preenche em 1 toque
    const chipsContainer = form.querySelector('#exp-cat-chips-container');
    if (chipsContainer) {
      chipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-cat-chip]');
        if (!chip) return;
        chipsContainer.querySelectorAll('.modal-hosp-pill').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');

        const catSelect = form.querySelector('#exp-category-input');
        if (catSelect) catSelect.value = chip.getAttribute('data-cat-chip');

        const defAmt = parseFloat(chip.getAttribute('data-default-amount'));
        const amtInput = form.querySelector('#exp-amount-input');
        if (amtInput && defAmt > 0 && !amtInput.value) {
          amtInput.value = defAmt.toFixed(2);
        }
      });
    }

    modal.classList.remove('hidden');
  }

  handleSaveExpense(form) {
    const desc = form.description.value.trim() || 'Despesa';
    const cat = form.category.value;
    const amt = parseFloat(form.amount.value) || 0;
    const date = form.date.value || getLocalDateString();
    const inst = parseInt(form.totalInstallments?.value || 1, 10);

    if (amt <= 0) {
      this.showToast('Informe um valor válido para a despesa', 'error');
      return;
    }

    if (this.editingExpenseId) {
      this.store.updateExpense(this.editingExpenseId, {
        description: desc,
        category: cat,
        amount: amt,
        date
      });
      this.showToast('Despesa atualizada com sucesso!');
    } else {
      this.store.addExpense({
        description: desc,
        category: cat,
        amount: amt,
        date,
        totalInstallments: inst
      });
      this.showToast(inst > 1 ? `Compra parcelada em ${inst}x gerada com sucesso!` : 'Despesa registrada com sucesso!');
    }

    this.closeModal('#modal-expense');
    this.render();
  }

  // =========================================================================
  // GESTÃO DINÂMICA DE FONTES DE RENDA (MODAL)
  // =========================================================================

  openIncomeSourcesModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-income-sources');
    if (!modal) return;

    const body = document.getElementById('income-sources-modal-body');
    if (!body) return;

    const sources = this.store.getAllIncomeSources();

    body.innerHTML = `
      <div class="management-toolbar">
        <h4>Fontes de Renda & Hospitais</h4>
        <button type="button" class="btn-silk-secondary" id="btn-restore-income-sources">Restaurar Padrões</button>
      </div>

      <div class="management-list" id="sources-management-list">
        ${sources.map(s => `
          <div class="management-item ${s.active === false ? 'archived' : ''}">
            <div class="mgmt-info">
              <strong class="mgmt-name">${escapeHtml(s.name)}</strong>
              <span class="mgmt-sub">${escapeHtml(s.typeLabel || s.type)} • Padrão: ${formatCurrency(s.defaultAmount || 0)}</span>
              <span class="mgmt-rule">${escapeHtml(s.paymentRule?.label || 'D+0')}</span>
            </div>
            <div class="mgmt-actions">
              ${s.active !== false ? `
                <button type="button" class="btn-icon-delete" data-delete-source="${s.id}" title="Excluir ou Arquivar Fonte">
                  ${getIconSvg('trash', 16, '#EF5350')}
                </button>
              ` : `
                <span class="badge-status-pill muted">Arquivada</span>
              `}
            </div>
          </div>
        `).join('')}
      </div>

      <form id="form-add-income-source" class="management-add-form">
        <h5>+ Nova Fonte de Renda</h5>
        <div class="form-group">
          <input type="text" name="name" class="form-input silk-input" placeholder="Nome da Maternidade ou Consultório" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <select name="type" class="form-input silk-input">
              <option value="plantao">Plantão em Sala de Parto / UTI</option>
              <option value="salario_fixo">Salário Fixo / Bolsa</option>
              <option value="consulta_puericultura">Consulta Particular</option>
              <option value="outros">Outros Rendimentos</option>
            </select>
          </div>
          <div class="form-group">
            <input type="number" name="defaultAmount" class="form-input silk-input" step="0.01" min="0" placeholder="Valor padrão (R$)" />
          </div>
        </div>
        <div class="form-group">
          <select name="paymentRuleType" class="form-input silk-input">
            <option value="parturition_75_60_25_90">Sala de Parto: 75% D+60 / 25% D+90</option>
            <option value="d30_100">D+30: 100% no mês seguinte</option>
            <option value="d0_100">D+0: À Vista no ato</option>
          </select>
        </div>
        <button type="submit" class="btn-silk-primary" style="width: 100%; margin-top: 8px;">Adicionar Fonte de Renda</button>
      </form>
    `;

    // Ações na lista
    body.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-delete-source]');
      if (delBtn) {
        const id = delBtn.getAttribute('data-delete-source');
        const res = this.store.deleteIncomeSource(id, { forceArchive: true });
        if (res.deleted) {
          this.showToast(res.archived ? 'Fonte arquivada com salvaguarda de histórico' : 'Fonte removida!');
          this.openIncomeSourcesModal();
          this.render();
        }
        return;
      }

      if (e.target.closest('#btn-restore-income-sources')) {
        this.store.restoreDefaultIncomeSources();
        this.showToast('Fontes de renda padrão restauradas!');
        this.openIncomeSourcesModal();
        this.render();
      }
    });

    modal.classList.remove('hidden');
  }

  handleAddIncomeSource(form) {
    const name = form.name.value;
    const type = form.type.value;
    const defaultAmount = parseFloat(form.defaultAmount.value) || 0;
    const ruleType = form.paymentRuleType.value;

    let paymentRule = {
      type: 'parturition_75_60_25_90',
      label: 'Sala de Parto (75% D+60 / 25% D+90)',
      splits: [{ percentage: 75, lagMonths: 2 }, { percentage: 25, lagMonths: 3 }]
    };

    if (ruleType === 'd30_100') {
      paymentRule = {
        type: 'd30_100',
        label: 'D+30 (100% no mês seguinte)',
        splits: [{ percentage: 100, lagMonths: 1 }]
      };
    } else if (ruleType === 'd0_100') {
      paymentRule = {
        type: 'd0_100',
        label: 'D+0 (À Vista no ato)',
        splits: [{ percentage: 100, lagMonths: 0 }]
      };
    }

    const added = this.store.addIncomeSource({
      name,
      type,
      defaultAmount,
      paymentRule
    });

    if (added) {
      this.showToast('Fonte de renda adicionada com sucesso!');
      this.openIncomeSourcesModal();
      this.render();
    } else {
      this.showToast('Já existe uma fonte de renda com esse nome', 'error');
    }
  }

  // =========================================================================
  // GESTÃO DINÂMICA DE CATEGORIAS DE DESPESAS (MODAL)
  // =========================================================================

  openCategoriesModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-categories');
    if (!modal) return;

    const body = document.getElementById('categories-modal-body');
    if (!body) return;

    const categories = this.store.getAllCategories();

    body.innerHTML = `
      <div class="management-toolbar">
        <h4>23 Categorias Canônicas & Personalizadas</h4>
        <button type="button" class="btn-silk-secondary" id="btn-restore-categories">Restaurar 23 Padrões</button>
      </div>

      <div class="categories-grouped-list">
        ${MACRO_GROUPS.map(mg => {
          const groupCats = categories.filter(c => (c.macro_group || c.macroGroup) === mg.name);
          return `
            <div class="macro-group-block">
              <div class="mg-header" style="color: ${mg.color};">
                ${getIconSvg(mg.icon, 18, mg.color)}
                <strong>${escapeHtml(mg.name)}</strong>
              </div>
              <div class="mg-cats-list">
                ${groupCats.map(c => `
                  <div class="cat-item-row ${c.active === false ? 'archived' : ''}">
                    <span class="cat-name">${escapeHtml(c.name)}</span>
                    <div class="cat-actions">
                      ${c.isCustom && c.active !== false ? `
                        <button type="button" class="btn-icon-delete" data-delete-cat="${c.id}" title="Excluir Categoria">
                          ${getIconSvg('trash', 14, '#EF5350')}
                        </button>
                      ` : c.active === false ? `
                        <span class="badge-status-pill muted">Arquivada</span>
                      ` : `
                        <span class="badge-status-pill safe">Canônica</span>
                      `}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <form id="form-add-category" class="management-add-form" style="margin-top: 16px;">
        <h5>+ Adicionar Nova Categoria</h5>
        <div class="form-group">
          <input type="text" name="name" class="form-input silk-input" placeholder="Nome da Categoria (ex: Fisioterapia Respiratória)" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <select name="macro_group" class="form-input silk-input">
              ${MACRO_GROUPS.map(mg => `<option value="${escapeHtml(mg.name)}">${escapeHtml(mg.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <input type="number" name="monthly_budget_cap" class="form-input silk-input" step="0.01" min="0" placeholder="Teto Mensal (Opcional)" />
          </div>
        </div>
        <button type="submit" class="btn-silk-primary" style="width: 100%;">Cadastrar Categoria</button>
      </form>
    `;

    body.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-delete-cat]');
      if (delBtn) {
        const id = delBtn.getAttribute('data-delete-cat');
        const res = this.store.deleteCustomCategory(id, { forceArchive: true });
        if (res.deleted) {
          this.showToast(res.archived ? 'Categoria arquivada com salvaguarda' : 'Categoria removida!');
          this.openCategoriesModal();
          this.render();
        }
        return;
      }

      if (e.target.closest('#btn-restore-categories')) {
        this.store.restoreDefaultCategories();
        this.showToast('As 23 categorias canônicas foram restauradas!');
        this.openCategoriesModal();
        this.render();
      }
    });

    modal.classList.remove('hidden');
  }

  handleAddCategory(form) {
    const name = form.name.value;
    const macro_group = form.macro_group.value;
    const monthly_budget_cap = parseFloat(form.monthly_budget_cap.value) || null;

    const added = this.store.addCategory({
      name,
      macro_group,
      monthly_budget_cap
    });

    if (added) {
      this.showToast('Categoria adicionada com sucesso!');
      this.openCategoriesModal();
      this.render();
    } else {
      this.showToast('Já existe uma categoria com esse nome', 'error');
    }
  }

  // =========================================================================
  // MODAL DE PERFIL MÉDICO
  // =========================================================================

  openProfileModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-profile');
    if (!modal) return;

    const form = document.getElementById('form-profile');
    if (!form) return;

    const p = this.store.getProfile();

    form.innerHTML = `
      <div class="form-group">
        <label for="prof-name">Nome da Médica</label>
        <input type="text" id="prof-name" name="doctorName" class="form-input silk-input" value="${escapeHtml(p.doctorName)}" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="prof-role">Especialidade / Ano</label>
          <input type="text" id="prof-role" name="doctorRole" class="form-input silk-input" value="${escapeHtml(p.doctorRole)}" />
        </div>
        <div class="form-group">
          <label for="prof-crm">CRM</label>
          <input type="text" id="prof-crm" name="doctorCrm" class="form-input silk-input" value="${escapeHtml(p.doctorCrm)}" placeholder="Ex: 12345/RN" />
        </div>
      </div>

      <div class="form-group">
        <label for="prof-salary">Bolsa Residência Fixa (R$ / mês)</label>
        <input type="number" id="prof-salary" name="salaryValue" class="form-input silk-input" step="0.01" min="0" value="${p.residencySalary?.value || 0}" />
      </div>

      <div class="form-group">
        <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
          <input type="checkbox" name="salaryActive" ${p.residencySalary?.active ? 'checked' : ''} />
          <span>Ativar recebimento mensal da Bolsa no dia 5</span>
        </label>
      </div>

      <div class="form-group">
        <label for="prof-photo-file">Foto de Perfil (Compactada no Aparelho)</label>
        <input type="file" id="prof-photo-file" accept="image/*" class="form-input silk-input" />
      </div>

      <div class="modal-actions-row">
        <button type="button" class="btn-silk-secondary" data-close-modal="#modal-profile">Cancelar</button>
        <button type="submit" class="btn-silk-primary">Salvar Perfil</button>
      </div>
    `;

    // Listener para foto com compressão Canvas < 25KB
    const photoInput = form.querySelector('#prof-photo-file');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 150;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            this.tempPhoto = compressed;
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    modal.classList.remove('hidden');
  }

  handleSaveProfile(form) {
    const doctorName = form.doctorName.value;
    const doctorRole = form.doctorRole.value;
    const doctorCrm = form.doctorCrm.value;
    const salaryVal = parseFloat(form.salaryValue.value) || 0;
    const salaryActive = form.salaryActive.checked;

    const changes = {
      doctorName,
      doctorRole,
      doctorCrm,
      residencySalary: {
        value: salaryVal,
        active: salaryActive
      }
    };

    if (this.tempPhoto) {
      changes.doctorPhoto = this.tempPhoto;
      this.tempPhoto = null;
    }

    this.store.updateProfile(changes);
    this.showToast('Perfil atualizado com sucesso!');
    this.closeModal('#modal-profile');
    this.render();
  }

  // =========================================================================
  // HUB DE FINANÇAS VISUAL (GRÁFICOS AMPLIADOS)
  // =========================================================================

  openHubModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-hub');
    if (!modal) return;

    const body = document.getElementById('hub-modal-body');
    if (!body) return;

    const activeMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const summary = this.store.getMonthSummary(activeMonth);
    const forecast = this.store.getForecast6Months(activeMonth);

    body.innerHTML = `
      <div class="card-section">
        <h3>Previsão Semestral</h3>
        ${this.renderForecastChart(forecast)}
      </div>

      <div class="card-section" style="margin-top: 14px;">
        <h3>Composição de Gastos por Categoria</h3>
        ${this.renderDonutChart(summary.categoryBreakdown, summary.totalExpenses)}
      </div>

      <div class="card-section" style="margin-top: 14px;">
        <h3>Detalhamento por Macro-Grupo</h3>
        <div class="macro-bars-list">
          ${summary.macroGroupBreakdown.map(mg => `
            <div class="macro-bar-item">
              <div class="macro-bar-label">
                <span>${escapeHtml(mg.name)}</span>
                <strong>${formatCurrency(mg.amount)} (${mg.percentage}%)</strong>
              </div>
              <div class="macro-bar-track">
                <div class="macro-bar-fill" style="width: ${Math.min(100, mg.percentage)}%; background: ${mg.color};"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  // =========================================================================
  // MODAL DE CONFIRMAÇÃO DE RESET COM BACKUP PRÉVIO
  // =========================================================================

  openResetConfirmModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-reset-confirm');
    if (!modal) return;

    const body = document.getElementById('reset-confirm-body');
    if (body) {
      body.innerHTML = `
        <div class="warning-box" style="padding: 16px; background: rgba(239, 83, 80, 0.1); border-radius: 16px; margin-bottom: 16px;">
          <p style="color: #D32F2F; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">
            Atenção: Ação Irreversível
          </p>
          <p style="font-size: 14px; color: var(--text-muted); margin: 0;">
            Isso limpará todos os plantões e despesas registrados neste aparelho. Um backup automático será baixado imediatamente para sua segurança.
          </p>
        </div>
        <div class="modal-actions-row">
          <button type="button" class="btn-silk-secondary" data-close-modal="#modal-reset-confirm">Cancelar</button>
          <button type="button" class="btn-silk-text-danger" id="btn-do-reset" style="background: #EF5350; color: #fff;">
            Confirmar e Zerar Dados
          </button>
        </div>
      `;

      const doResetBtn = body.querySelector('#btn-do-reset');
      if (doResetBtn) {
        doResetBtn.addEventListener('click', () => {
          this.exportBackup();
          this.store.resetAllData({ createBackup: true });
          this.showToast('Dados limpos com backup preventivo salvo.');
          this.closeModal('#modal-reset-confirm');
          this.render();
        });
      }
    }

    modal.classList.remove('hidden');
  }

  // =========================================================================
  // CONTROLE DE GAVETA HAMBÚRGUER & TEMA
  // =========================================================================

  openDrawer() {
    const drawer = document.getElementById('drawer-menu');
    if (drawer) drawer.classList.remove('hidden');
  }

  closeDrawer() {
    const drawer = document.getElementById('drawer-menu');
    if (drawer) drawer.classList.add('hidden');
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    this.store.data.preferences.theme = nextTheme;
    this.store.save();

    const label = document.getElementById('theme-toggle-label');
    if (label) label.textContent = nextTheme === 'dark' ? 'Modo Claro' : 'Modo UTI Neonatal';

    this.showToast(nextTheme === 'dark' ? 'Modo UTI Neonatal ativado 🌙' : 'Modo Claro ativado ☀️');
  }

  // =========================================================================
  // TOASTS COM DESFAZER (UNDO)
  // =========================================================================

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-silk ${type}`;
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  showToastWithUndo(message, onUndo, duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-silk toast-undo';
    toast.innerHTML = `
      <div class="toast-content">
        <span>${escapeHtml(message)}</span>
        <button type="button" class="btn-toast-undo">Desfazer</button>
      </div>
      <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
    `;

    const undoBtn = toast.querySelector('.btn-toast-undo');
    let timer = null;

    const dismiss = () => {
      if (timer) clearTimeout(timer);
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 250);
    };

    undoBtn.addEventListener('click', () => {
      dismiss();
      if (typeof onUndo === 'function') onUndo();
    }, { once: true });

    timer = setTimeout(dismiss, duration);
    container.appendChild(toast);
  }

  // =========================================================================
  // BACKUP EXPORT & MODAL UTILITIES
  // =========================================================================

  async exportBackup() {
    const res = await this.storage.exportBackup(this.store.data);
    if (res.success) {
      this.showToast(`Backup salvo com sucesso (${res.method === 'share' ? 'iCloud/Arquivos' : 'Download'})!`);
    } else {
      this.showToast(`Falha ao exportar: ${res.error}`, 'error');
    }
  }

  openModal(selector) {
    const el = document.querySelector(selector);
    if (el) el.classList.remove('hidden');
  }

  closeModal(selector) {
    const el = document.querySelector(selector);
    if (el) el.classList.add('hidden');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
  }

  // =========================================================================
  // GRÁFICOS SVG NATIVOS (100% OFFLINE, ZERO LIBS)
  // =========================================================================

  renderForecastChart(forecast) {
    if (!forecast || forecast.length === 0) return '<p>Sem dados para projeção</p>';

    const maxVal = Math.max(...forecast.map(f => Math.max(f.income, f.expenses)), 1000);
    const height = 120;

    const bars = forecast.map(f => {
      const incH = Math.max(4, Math.round((f.income / maxVal) * height));
      const expH = Math.max(4, Math.round((f.expenses / maxVal) * height));

      return `
        <div class="forecast-col">
          <div class="forecast-bars-wrap">
            <div class="f-bar income" style="height: ${incH}px;" title="Entradas: ${formatCurrency(f.income)}"></div>
            <div class="f-bar expense" style="height: ${expH}px;" title="Saídas: ${formatCurrency(f.expenses)}"></div>
          </div>
          <span class="forecast-col-label">${escapeHtml(f.label)}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="forecast-chart-container">
        <div class="forecast-chart-grid">${bars}</div>
        <div class="forecast-legend">
          <span class="f-legend-item"><span class="dot mint"></span> Entradas</span>
          <span class="f-legend-item"><span class="dot coral"></span> Despesas</span>
        </div>
      </div>
    `;
  }

  renderDonutChart(categories, total) {
    if (!categories || categories.length === 0 || total <= 0) {
      return `
        <div class="donut-empty-wrap" style="text-align: center; padding: 20px; color: var(--text-muted);">
          <p>Nenhuma despesa para exibir no gráfico neste mês.</p>
        </div>
      `;
    }

    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercentage = 0;
    const segments = categories.slice(0, 6).map(c => {
      const p = c.amount / total;
      const strokeDashoffset = circumference * (1 - p);
      const rotation = accumulatedPercentage * 360;
      accumulatedPercentage += p;

      return `
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${radius}" 
          fill="none" 
          stroke="${sanitizeColor(c.color)}" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${circumference}" 
          stroke-dashoffset="${strokeDashoffset}" 
          transform="rotate(${rotation - 90} ${size / 2} ${size / 2})"
        />
      `;
    }).join('');

    const legend = categories.slice(0, 5).map(c => `
      <div class="donut-legend-row">
        <span class="donut-dot" style="background: ${sanitizeColor(c.color)};"></span>
        <span class="donut-cat-name">${escapeHtml(c.name)}</span>
        <strong class="donut-cat-pct">${c.percentage}%</strong>
      </div>
    `).join('');

    return `
      <div class="donut-chart-flex">
        <div class="donut-svg-wrap">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="rgba(200,200,200,0.15)" stroke-width="${strokeWidth}" />
            ${segments}
          </svg>
          <div class="donut-center-text">
            <span>Total</span>
            <strong>${formatCurrency(total)}</strong>
          </div>
        </div>
        <div class="donut-legend-wrap">
          ${legend}
        </div>
      </div>
    `;
  }
}
