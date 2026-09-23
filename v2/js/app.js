/**
 * Finanças Pediatria v2.0 - Application Controller (SPA)
 * Interface Mobile-First limpa, intuitiva e sem poluição visual
 * Criado por: FChNeto
 */

import {
  PediatricStore,
  formatCurrency,
  formatDateBR,
  formatMonthYear,
  getLocalDateString
} from './store.js';
import { getIconSvg } from './icons.js';
import { renderForecastChart, renderDonutExpenses } from './charts.js';

class PediatricApp {
  constructor() {
    this.store = new PediatricStore();
    this.currentTab = 'home'; // 'home' | 'income' | 'expenses'
    this.activeModalTab = 'shift'; // 'shift' | 'expense' | 'salary'

    this.initDOM();
    this.bindEvents();
    this.applyTheme(this.store.data.preferences.theme || 'light');
    this.render();

    // Inscrição para re-render reativo em qualquer alteração
    this.store.subscribe(() => this.render());

    // Proteção de ciclo de vida do iOS WebKit
    this.bindLifecycleEvents();
  }

  initDOM() {
    this.appEl = document.getElementById('app-container');
    if (!this.appEl) {
      console.error('Container #app-container não encontrado');
    }
  }

  bindLifecycleEvents() {
    // Salva imediatamente quando o usuário minimiza ou sai do app no iPhone
    const persistHandler = () => {
      this.store.save();
    };
    window.addEventListener('pagehide', persistHandler);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        persistHandler();
      }
    });
    window.addEventListener('beforeunload', persistHandler);
  }

  bindEvents() {
    // Delegação de cliques para botões principais
    document.addEventListener('click', (e) => {
      // 1. Navegação de Abas
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        this.switchTab(tab);
        return;
      }

      // 2. Botão Flutuante (+)
      const fabBtn = e.target.closest('#fab-add-btn');
      if (fabBtn) {
        this.openModal();
        return;
      }

      // 3. Fechar Modal (clique no overlay ou botão fechar)
      const closeOverlay = e.target.closest('.modal-overlay');
      if (closeOverlay && e.target === closeOverlay) {
        this.closeModal();
        return;
      }

      // 4. Abas do Modal
      const modalTabBtn = e.target.closest('[data-modal-tab]');
      if (modalTabBtn) {
        const mTab = modalTabBtn.getAttribute('data-modal-tab');
        this.switchModalTab(mTab);
        return;
      }

      // 5. Seletor de Regime (Caixa vs Competência)
      const regimeBtn = e.target.closest('[data-regime]');
      if (regimeBtn) {
        const reg = regimeBtn.getAttribute('data-regime');
        this.store.data.preferences.regime = reg;
        this.store.save();
        return;
      }

      // 6. Navegação de Mês
      const prevMonthBtn = e.target.closest('#btn-prev-month');
      if (prevMonthBtn) {
        this.navigateMonth(-1);
        return;
      }
      const nextMonthBtn = e.target.closest('#btn-next-month');
      if (nextMonthBtn) {
        this.navigateMonth(1);
        return;
      }

      // 7. Toggle Tema Escuro/Claro
      const themeBtn = e.target.closest('#btn-theme-toggle');
      if (themeBtn) {
        const nextTheme = this.store.data.preferences.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(nextTheme);
        this.store.data.preferences.theme = nextTheme;
        this.store.save();
        return;
      }

      // 8. Botão Backup "Salvar no Meu iPhone"
      const backupBtn = e.target.closest('#btn-backup-iphone');
      if (backupBtn) {
        this.handleExportBackup();
        return;
      }

      // 9. Botão Restaurar Backup
      const restoreBtn = e.target.closest('#btn-restore-backup');
      if (restoreBtn) {
        const fileInput = document.getElementById('backup-file-input');
        if (fileInput) fileInput.click();
        return;
      }

      // 10. Toggle de Parcela de Plantão (Recebido / Pendente)
      const toggleInstBtn = e.target.closest('[data-toggle-installment]');
      if (toggleInstBtn) {
        const shiftId = toggleInstBtn.getAttribute('data-shift-id');
        const instNum = parseInt(toggleInstBtn.getAttribute('data-inst-num'), 10);
        this.store.toggleShiftInstallment(shiftId, instNum);
        this.showToast('Status do plantão atualizado! ✨');
        return;
      }

      // 11. Excluir Plantão
      const delShiftBtn = e.target.closest('[data-delete-shift]');
      if (delShiftBtn) {
        const shiftId = delShiftBtn.getAttribute('data-delete-shift');
        if (confirm('Deseja realmente excluir este plantão?')) {
          this.store.deleteShift(shiftId);
          this.showToast('Plantão removido.');
        }
        return;
      }

      // 12. Excluir Despesa
      const delExpBtn = e.target.closest('[data-delete-expense]');
      if (delExpBtn) {
        const expId = delExpBtn.getAttribute('data-delete-expense');
        if (confirm('Deseja excluir este lançamento de despesa?')) {
          this.store.deleteExpense(expId);
          this.showToast('Despesa removida.');
        }
        return;
      }
    });

    // Listener para o input de arquivo de restauração
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'backup-file-input') {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const res = this.store.importBackupFromFile(event.target.result);
            if (res.success) {
              this.showToast('Dados restaurados com sucesso! 🌸');
            } else {
              alert('Erro ao restaurar arquivo: ' + res.error);
            }
          };
          reader.readAsText(file);
        }
        e.target.value = ''; // Limpa o input
      }
    });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateMonth(delta) {
    const cur = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const parts = cur.split('-');
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10) - 1 + delta;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    const newMonth = `${y}-${String(m + 1).padStart(2, '0')}`;
    this.store.data.preferences.activeMonth = newMonth;
    this.store.save();
  }

  openModal(tab = 'shift') {
    this.activeModalTab = tab;
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  closeModal() {
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.remove('open');
    }
  }

  switchModalTab(tab) {
    this.activeModalTab = tab;
    this.renderModalContent();
  }

  showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span>🌸</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  async handleExportBackup() {
    const res = await this.store.exportBackupToFile();
    if (res.success) {
      this.showToast('Cópia de segurança gerada com sucesso! 📱');
    }
  }

  // -------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL
  // -------------------------------------------------------------
  render() {
    if (!this.appEl) return;

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const currentRegime = this.store.data.preferences.regime || 'caixa';
    const summary = this.store.getMonthSummary(currentMonth, currentRegime);

    let contentHtml = '';

    if (this.currentTab === 'home') {
      contentHtml = this.renderHomeTab(summary, currentMonth, currentRegime);
    } else if (this.currentTab === 'income') {
      contentHtml = this.renderIncomeTab(summary, currentMonth);
    } else if (this.currentTab === 'expenses') {
      contentHtml = this.renderExpensesTab(summary, currentMonth);
    }

    this.appEl.innerHTML = `
      <!-- Cabeçalho Minimalista -->
      <header class="app-header">
        <div class="doctor-greeting">
          <div class="avatar-badge">
            ${getIconSvg('stethoscope', { size: 24, color: '#D81B60' })}
          </div>
          <div class="greeting-text">
            <h1>${this.store.data.doctorName}</h1>
            <p>Controle Financeiro Pediátrico</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn" id="btn-backup-iphone" title="Salvar no Meu iPhone">
            ${getIconSvg('save_iphone', { size: 20, color: 'currentColor' })}
          </button>
          <button class="icon-btn" id="btn-theme-toggle" title="Alternar Tema">
            ${getIconSvg('moon', { size: 20, color: 'currentColor' })}
          </button>
          <button class="icon-btn" id="btn-restore-backup" title="Restaurar Backup">
            ${getIconSvg('refresh', { size: 20, color: 'currentColor' })}
          </button>
          <input type="file" id="backup-file-input" accept=".json" style="display: none;" />
        </div>
      </header>

      <!-- Barra de Navegação de Mês -->
      <div class="month-selector-bar">
        <button class="nav-month-btn" id="btn-prev-month" title="Mês Anterior">
          ${getIconSvg('chevron_left', { size: 20, color: 'currentColor' })}
        </button>
        <div class="current-month-label">
          ${getIconSvg('calendar', { size: 18, color: '#AB47BC' })}
          <span>${formatMonthYear(currentMonth)}</span>
        </div>
        <button class="nav-month-btn" id="btn-next-month" title="Próximo Mês">
          ${getIconSvg('chevron_right', { size: 20, color: 'currentColor' })}
        </button>
      </div>

      <!-- Toggle Regime Caixa vs Competência -->
      <div class="regime-toggle-pill">
        <button class="regime-btn ${currentRegime === 'caixa' ? 'active' : ''}" data-regime="caixa">
          Regime de Caixa (Depósito D+60/D+90)
        </button>
        <button class="regime-btn ${currentRegime === 'competencia' ? 'active' : ''}" data-regime="competencia">
          Regime de Competência (Produção)
        </button>
      </div>

      <!-- Conteúdo da Aba Atual -->
      <main id="main-content">
        ${contentHtml}
      </main>

      <!-- Barra de Navegação Inferior -->
      <nav class="bottom-nav">
        <button class="nav-tab-btn ${this.currentTab === 'home' ? 'active' : ''}" data-tab="home">
          ${getIconSvg('home', { size: 22 })}
          <span>Início</span>
        </button>

        <button class="floating-add-btn" id="fab-add-btn" title="Novo Lançamento">
          ${getIconSvg('add', { size: 28, color: '#FFFFFF' })}
        </button>

        <button class="nav-tab-btn ${this.currentTab === 'income' ? 'active' : ''}" data-tab="income">
          ${getIconSvg('stethoscope', { size: 22 })}
          <span>Ganhos</span>
        </button>

        <button class="nav-tab-btn ${this.currentTab === 'expenses' ? 'active' : ''}" data-tab="expenses">
          ${getIconSvg('cart', { size: 22 })}
          <span>Despesas</span>
        </button>
      </nav>

      <!-- Modal Bottom Sheet -->
      <div class="modal-overlay" id="action-modal">
        <div class="modal-sheet">
          <div class="modal-drag-indicator"></div>
          <div class="modal-header-tabs">
            <button class="modal-tab-btn ${this.activeModalTab === 'shift' ? 'active' : ''}" data-modal-tab="shift">
              Plantão Médico
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'expense' ? 'active' : ''}" data-modal-tab="expense">
              Despesa
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'salary' ? 'active' : ''}" data-modal-tab="salary">
              Bolsa Residência
            </button>
          </div>
          <div id="modal-body-content"></div>
        </div>
      </div>
    `;

    // Renderiza gráficos após a injeção do HTML
    if (this.currentTab === 'home') {
      const forecast = this.store.getForecast6Months(currentMonth);
      renderForecastChart('forecast-chart-container', forecast);
      renderDonutExpenses('donut-chart-container', summary.categoryBreakdown, summary.totalExpenses);
    }
  }

  // -------------------------------------------------------------
  // ABA: INÍCIO (DASHBOARD)
  // -------------------------------------------------------------
  renderHomeTab(summary, currentMonth, currentRegime) {
    const isCaixa = currentRegime === 'caixa';

    return `
      <!-- Hero Card de Saldo -->
      <section class="hero-balance-card">
        <div class="balance-title">
          <span>${isCaixa ? 'Saldo Projetado de Caixa' : 'Produção Líquida do Mês'}</span>
          <span>${formatMonthYear(currentMonth).split(' de ')[0]}</span>
        </div>
        <div class="balance-value">${formatCurrency(summary.balance)}</div>
        <div class="balance-stats-row">
          <div class="stat-item">
            <div class="stat-icon">
              ${getIconSvg('mint_income', { size: 20, color: '#FFFFFF' })}
            </div>
            <div class="stat-info">
              <span>Total Entradas</span>
              <strong>${formatCurrency(summary.totalIncome)}</strong>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              ${getIconSvg('coral_expense', { size: 20, color: '#FFFFFF' })}
            </div>
            <div class="stat-info">
              <span>Total Despesas</span>
              <strong>${formatCurrency(summary.totalExpenses)}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Banner de Dica de Persistência no iPhone -->
      <div class="card-section" style="padding: 12px 16px; margin-bottom: 14px;">
        <div class="ios-backup-banner" style="margin-bottom: 0;">
          <div class="banner-text">
            <h4>Proteção Total no iPhone 📱</h4>
            <p>Seus dados estão protegidos no aparelho. Faça backup para o iCloud a qualquer momento.</p>
          </div>
          <button class="banner-action-btn" id="btn-backup-iphone">Salvar</button>
        </div>
      </div>

      <!-- Gráfico de Previsão de 6 Meses -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('chart', { size: 20, color: '#AB47BC' })}
            Previsão dos Próximos 6 Meses
          </h2>
        </div>
        <div id="forecast-chart-container"></div>
      </section>

      <!-- Gráfico de Rosca de Despesas por Categoria -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('pie', { size: 20, color: '#EC407A' })}
            Distribuição de Gastos
          </h2>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
            ${summary.expensesCount} lançamentos
          </span>
        </div>
        <div id="donut-chart-container"></div>
      </section>
    `;
  }

  // -------------------------------------------------------------
  // ABA: GANHOS (RESIDÊNCIA & PLANTÕES EM SALA DE PARTO)
  // -------------------------------------------------------------
  renderIncomeTab(summary, currentMonth) {
    const salary = this.store.data.residencySalary;
    const isCaixa = this.store.data.preferences.regime === 'caixa';

    // Lista de plantões relevantes para o mês
    let relevantShifts = [];
    if (isCaixa) {
      // Plantões que têm parcela caindo neste mês
      relevantShifts = this.store.data.shifts.filter(s =>
        (s.installment1 && s.installment1.expectedDate.startsWith(currentMonth)) ||
        (s.installment2 && s.installment2.expectedDate.startsWith(currentMonth))
      );
    } else {
      // Plantões trabalhados neste mês
      relevantShifts = this.store.data.shifts.filter(s => s.date.startsWith(currentMonth));
    }

    let shiftsHtml = '';
    if (relevantShifts.length === 0) {
      shiftsHtml = `
        <div class="empty-donut-state">
          <div class="empty-icon-circle">
            ${getIconSvg('stethoscope', { size: 28, color: '#AB47BC' })}
          </div>
          <p class="empty-text">Nenhum plantão para este mês</p>
          <span class="empty-sub">Toque em "+" para cadastrar seus plantões de Sala de Parto</span>
        </div>
      `;
    } else {
      shiftsHtml = relevantShifts.map(s => {
        const isInst1ThisMonth = s.installment1?.expectedDate.startsWith(currentMonth);
        const isInst2ThisMonth = s.installment2?.expectedDate.startsWith(currentMonth);

        return `
          <div class="shift-item-card">
            <div class="shift-card-top">
              <div>
                <h3 class="shift-hospital">${s.hospital}</h3>
                <span class="shift-date-badge">Trabalhado em: ${formatDateBR(s.date)}</span>
              </div>
              <button class="expense-del-btn" data-delete-shift="${s.id}" title="Excluir Plantão">
                ${getIconSvg('delete', { size: 18, color: 'currentColor' })}
              </button>
            </div>

            <div class="shift-values-line">
              <span class="shift-type-pill">${s.shiftType}</span>
              <span class="shift-net-val">${formatCurrency(s.netValue)}</span>
            </div>

            <!-- As 2 Parcelas Pediátricas: D+60 e D+90 -->
            <div class="installments-timeline">
              <div class="installment-box" style="${isInst1ThisMonth ? 'border-left: 2px solid var(--mint-income); padding-left: 4px;' : ''}">
                <div class="inst-header">
                  <span>80% (D+60)</span>
                  <span>${formatDateBR(s.installment1?.expectedDate)}</span>
                </div>
                <div class="inst-val">${formatCurrency(s.installment1?.value)}</div>
                <button
                  class="inst-status-tag ${s.installment1?.status === 'received' ? 'received' : 'pending'}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="1"
                >
                  ${s.installment1?.status === 'received' ? '✓ Recebido' : '⏳ Pendente'}
                </button>
              </div>

              <div class="installment-box" style="${isInst2ThisMonth ? 'border-left: 2px solid var(--mint-income); padding-left: 4px;' : ''}">
                <div class="inst-header">
                  <span>20% (D+90)</span>
                  <span>${formatDateBR(s.installment2?.expectedDate)}</span>
                </div>
                <div class="inst-val">${formatCurrency(s.installment2?.value)}</div>
                <button
                  class="inst-status-tag ${s.installment2?.status === 'received' ? 'received' : 'pending'}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="2"
                >
                  ${s.installment2?.status === 'received' ? '✓ Recebido' : '⏳ Pendente'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <!-- Card do Salário Fixo da Residência -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('hospital', { size: 20, color: '#D81B60' })}
            Bolsa Residência Médica
          </h2>
          <button class="section-action-btn" id="btn-edit-salary">Ajustar</button>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${salary.description} (Dia ${salary.dayOfMonth})</span>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--mint-income);">
              ${formatCurrency(salary.value)}
            </div>
          </div>
          <span style="font-size: 0.75rem; background: var(--mint-income-light); color: var(--mint-income); padding: 4px 10px; border-radius: var(--radius-pill); font-weight: 700;">
            Fixo Mensal
          </span>
        </div>
      </section>

      <!-- Lista de Plantões em Sala de Parto -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('stethoscope', { size: 20, color: '#AB47BC' })}
            Plantões em Sala de Parto
          </h2>
          <button class="section-action-btn" id="btn-add-shift-quick">+ Novo Plantão</button>
        </div>
        <div style="margin-bottom: 12px; font-size: 0.78rem; color: var(--text-muted);">
          Regra Pediátrica: <strong>80% pago em 2 meses (D+60)</strong> e <strong>20% no 3º mês (D+90)</strong>.
        </div>
        ${shiftsHtml}
      </section>
    `;
  }

  // -------------------------------------------------------------
  // ABA: DESPESAS (COM TODAS AS 22 CATEGORIAS & PARCELAMENTOS)
  // -------------------------------------------------------------
  renderExpensesTab(summary, currentMonth) {
    const monthExpenses = this.store.data.expenses
      .filter(e => e.date.startsWith(currentMonth))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let expensesHtml = '';
    if (monthExpenses.length === 0) {
      expensesHtml = `
        <div class="empty-donut-state">
          <div class="empty-icon-circle">
            ${getIconSvg('cart', { size: 28, color: '#AB47BC' })}
          </div>
          <p class="empty-text">Nenhuma despesa para este mês</p>
          <span class="empty-sub">Toque em "+" para lançar despesas à vista ou parceladas</span>
        </div>
      `;
    } else {
      expensesHtml = monthExpenses.map(e => {
        const catInfo = this.store.data.categories.find(c => c.name === e.category) || { icon: 'tag', color: '#AB47BC' };

        return `
          <div class="expense-item-row">
            <div class="expense-left">
              <div class="expense-icon-badge" style="background: ${catInfo.color}15; color: ${catInfo.color};">
                ${getIconSvg(catInfo.icon, { size: 20, color: catInfo.color })}
              </div>
              <div class="expense-texts">
                <span class="expense-desc">${e.description}</span>
                <span class="expense-cat-date">${e.category} • ${formatDateBR(e.date)}</span>
              </div>
            </div>
            <div class="expense-right">
              <span class="expense-val">${formatCurrency(e.value)}</span>
              <button class="expense-del-btn" data-delete-expense="${e.id}" title="Excluir Despesa">
                ${getIconSvg('delete', { size: 16, color: 'currentColor' })}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <!-- Resumo de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('cart', { size: 20, color: '#F4511E' })}
            Total de Despesas do Mês
          </h2>
          <button class="section-action-btn" id="btn-add-expense-quick">+ Nova Despesa</button>
        </div>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--coral-expense); margin-bottom: 4px;">
          ${formatCurrency(summary.totalExpenses)}
        </div>
        <span style="font-size: 0.78rem; color: var(--text-muted);">
          Inclui custos fixos, gastos diários e compras parceladas vigentes
        </span>
      </section>

      <!-- Lista Detalhada de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>Lançamentos de ${formatMonthYear(currentMonth).split(' de ')[0]}</h2>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
            ${monthExpenses.length} itens
          </span>
        </div>
        <div class="expenses-list">
          ${expensesHtml}
        </div>
      </section>
    `;
  }

  // -------------------------------------------------------------
  // FORMULÁRIOS DO MODAL
  // -------------------------------------------------------------
  renderModalContent() {
    const body = document.getElementById('modal-body-content');
    if (!body) return;

    if (this.activeModalTab === 'shift') {
      const today = getLocalDateString();
      const hospitalOptions = this.store.data.hospitals.map(h => `<option value="${h}">${h}</option>`).join('');

      body.innerHTML = `
        <form id="form-new-shift">
          <div class="form-group">
            <label>Hospital / Local</label>
            <input list="hospitals-list" name="hospital" class="form-input" placeholder="Ex: Maternidade Araken" required />
            <datalist id="hospitals-list">
              ${hospitalOptions}
            </datalist>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data do Plantão</label>
              <input type="date" name="date" class="form-input" value="${today}" required />
            </div>
            <div class="form-group">
              <label>Tipo de Plantão</label>
              <select name="shiftType" class="form-select">
                <option value="12h Noturno">12h Noturno</option>
                <option value="12h Diurno">12h Diurno</option>
                <option value="24h">24h</option>
                <option value="Sala de Parto">Sala de Parto</option>
                <option value="Sobreaviso">Sobreaviso</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor Líquido (R$)</label>
              <input type="number" step="0.01" name="netValue" class="form-input" placeholder="Ex: 2100.00" required />
            </div>
            <div class="form-group">
              <label>Valor Bruto (R$)</label>
              <input type="number" step="0.01" name="grossValue" class="form-input" placeholder="Opcional" />
            </div>
          </div>

          <div style="background: var(--lilac-light); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--lilac-dark); margin-bottom: 12px;">
            ✨ O sistema dividirá automaticamente este plantão em: <strong>80% em 2 meses</strong> e <strong>20% em 3 meses</strong>.
          </div>

          <button type="submit" class="submit-btn">Salvar Plantão</button>
        </form>
      `;

      const form = document.getElementById('form-new-shift');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const hospital = fd.get('hospital');
        const date = fd.get('date');
        const shiftType = fd.get('shiftType');
        const netValue = parseFloat(fd.get('netValue')) || 0;
        const grossValue = parseFloat(fd.get('grossValue')) || netValue;

        this.store.saveShift({
          hospital,
          date,
          shiftType,
          netValue,
          grossValue
        });

        this.closeModal();
        this.showToast(`Plantão no ${hospital} registrado com sucesso! 🌸`);
      };

    } else if (this.activeModalTab === 'expense') {
      const today = getLocalDateString();
      const catOptions = this.store.data.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

      body.innerHTML = `
        <form id="form-new-expense">
          <div class="form-group">
            <label>Categoria</label>
            <select name="category" class="form-select" required>
              ${catOptions}
            </select>
          </div>

          <div class="form-group">
            <label>Descrição do Gasto</label>
            <input type="text" name="description" class="form-input" placeholder="Ex: Supermercado, Aluguel, Farmácia..." required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor Total (R$)</label>
              <input type="number" step="0.01" name="value" class="form-input" placeholder="Ex: 350.00" required />
            </div>
            <div class="form-group">
              <label>Data</label>
              <input type="date" name="date" class="form-input" value="${today}" required />
            </div>
          </div>

          <div class="form-group" style="margin-top: 4px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="check-is-installment" name="isInstallment" style="width: 18px; height: 18px;" />
              <span>Compra Parcelada no Cartão?</span>
            </label>
          </div>

          <div class="form-group" id="group-installments-count" style="display: none;">
            <label>Quantidade de Parcelas</label>
            <select name="totalInstallments" class="form-select">
              <option value="2">2x</option>
              <option value="3">3x</option>
              <option value="4">4x</option>
              <option value="5">5x</option>
              <option value="6">6x</option>
              <option value="8">8x</option>
              <option value="10">10x</option>
              <option value="12">12x</option>
              <option value="18">18x</option>
              <option value="24">24x</option>
            </select>
          </div>

          <button type="submit" class="submit-btn">Salvar Despesa</button>
        </form>
      `;

      const checkInst = document.getElementById('check-is-installment');
      const groupCount = document.getElementById('group-installments-count');
      checkInst.onchange = () => {
        groupCount.style.display = checkInst.checked ? 'flex' : 'none';
      };

      const form = document.getElementById('form-new-expense');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const category = fd.get('category');
        const description = fd.get('description');
        const value = parseFloat(fd.get('value')) || 0;
        const date = fd.get('date');
        const isInstallment = checkInst.checked;
        const totalInstallments = isInstallment ? parseInt(fd.get('totalInstallments'), 10) : 1;

        this.store.saveExpense({
          category,
          description,
          value,
          date,
          isInstallment,
          totalInstallments
        });

        this.closeModal();
        this.showToast('Despesa computada com sucesso! 🌸');
      };

    } else if (this.activeModalTab === 'salary') {
      const sal = this.store.data.residencySalary;

      body.innerHTML = `
        <form id="form-edit-salary">
          <div class="form-group">
            <label>Descrição do Salário / Bolsa</label>
            <input type="text" name="description" class="form-input" value="${sal.description}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor Mensal (R$)</label>
              <input type="number" step="0.01" name="value" class="form-input" value="${sal.value}" required />
            </div>
            <div class="form-group">
              <label>Dia do Depósito</label>
              <input type="number" min="1" max="31" name="dayOfMonth" class="form-input" value="${sal.dayOfMonth}" required />
            </div>
          </div>

          <button type="submit" class="submit-btn">Atualizar Bolsa Residência</button>
        </form>
      `;

      const form = document.getElementById('form-edit-salary');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const description = fd.get('description');
        const value = parseFloat(fd.get('value')) || 0;
        const dayOfMonth = parseInt(fd.get('dayOfMonth'), 10) || 5;

        this.store.updateResidencySalary({
          description,
          value,
          dayOfMonth,
          active: true
        });

        this.closeModal();
        this.showToast('Bolsa da Residência atualizada! 🌸');
      };
    }
  }
}

// Inicia aplicação com verificação segura de readyState para módulos diferidos
function initApp() {
  if (window.pediatricApp) return;
  window.pediatricApp = new PediatricApp();

  // Configuração rápida de atalhos para abrir modais específicos
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-edit-salary')) {
      window.pediatricApp.openModal('salary');
    }
    if (e.target.closest('#btn-add-shift-quick')) {
      window.pediatricApp.openModal('shift');
    }
    if (e.target.closest('#btn-add-expense-quick')) {
      window.pediatricApp.openModal('expense');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

