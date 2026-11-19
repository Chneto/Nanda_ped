/**
 * Finanças Pediatria /v8/ - UI: Navegação de abas/meses e renderização das telas
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { formatCurrency, formatDateBR, formatMonthYear, getLocalDateString, getCategoryKey, MACRO_GROUPS } from '../store.js';
import { getIconSvg, sanitizeColor } from '../icons.js';
import { escapeHtml } from './helpers.js';

export class ViewMethods {
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
}
