/**
 * Finanças Pediatria v4.0 - Application Controller (SPA)
 * Design System "Silk & Rose Gold"
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import {
  PediatricStore,
  formatCurrency,
  formatDateBR,
  formatMonthYear,
  getLocalDateString,
  getMacroGroupForCategory,
  APP_CREATOR,
  APP_VERSION
} from './store.js';

import { getIconSvg } from './icons.js';
import {
  renderForecastChart,
  renderDonutExpenses,
  renderComparisonVisual,
  renderMonthCalendarVisual
} from './charts.js';

export class PediatricApp {
  constructor() {
    this.store = new PediatricStore();
    this.currentTab = 'home'; // 'home' | 'income' | 'expenses'
    this.activeModalTab = 'shift'; // 'shift' | 'expense' | 'salary'
    this.prefilledHospital = '';

    this.initDOM();
    this.bindEvents();
    this.applyTheme(this.store.data.preferences.theme || 'light');
    this.render();

    // Re-renderização reativa em alterações da store
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
    document.addEventListener('click', (e) => {
      // 1. Navegação de Abas Inferiores
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        this.switchTab(tab);
        return;
      }

      // 2. Botão Flutuante Central (+)
      const fabBtn = e.target.closest('#fab-add-btn');
      if (fabBtn) {
        this.openModal('shift');
        return;
      }

      // 3. Botões de Lançamento Rápido Direto
      const quickAddExpense = e.target.closest('#btn-quick-add-expense') || e.target.closest('#btn-add-expense-quick');
      if (quickAddExpense) {
        this.openModal('expense');
        return;
      }

      const quickAddShift = e.target.closest('#btn-quick-add-shift') || e.target.closest('#btn-add-shift-quick');
      if (quickAddShift) {
        this.openModal('shift');
        return;
      }

      // 4. Chips de Pré-Seleção de Maternidades (Araken & Leide Morais)
      const hospChip = e.target.closest('[data-quick-hospital]');
      if (hospChip) {
        const hospName = hospChip.getAttribute('data-quick-hospital');
        this.openModalWithHospital(hospName);
        return;
      }

      // 5. Menu Hambúrguer Drawer
      const burgerBtn = e.target.closest('#btn-hamburger-menu');
      if (burgerBtn) {
        this.openDrawer();
        return;
      }

      const closeDrawerBtn = e.target.closest('#btn-close-drawer') || (e.target.classList.contains('drawer-overlay') && e.target);
      if (closeDrawerBtn) {
        this.closeDrawer();
        return;
      }

      // 6. Itens do Drawer
      const drawerItemProfile = e.target.closest('#drawer-item-profile');
      if (drawerItemProfile) {
        this.closeDrawer();
        this.openProfileModal();
        return;
      }

      const drawerItemHub = e.target.closest('#drawer-item-hub');
      if (drawerItemHub) {
        this.closeDrawer();
        this.openHubModal();
        return;
      }

      const drawerItemReset = e.target.closest('#drawer-item-reset');
      if (drawerItemReset) {
        this.closeDrawer();
        this.handleTwoStageDataReset();
        return;
      }

      const drawerItemTheme = e.target.closest('#drawer-item-theme');
      if (drawerItemTheme) {
        this.toggleTheme();
        return;
      }

      const drawerItemBackup = e.target.closest('#drawer-item-backup');
      if (drawerItemBackup) {
        this.handleExportBackup();
        return;
      }

      const drawerItemRestore = e.target.closest('#drawer-item-restore');
      if (drawerItemRestore) {
        const fileInput = document.getElementById('backup-file-input');
        if (fileInput) fileInput.click();
        return;
      }

      // 7. Fechar Modais (Overlay ou Botão Fechar)
      const closeOverlay = e.target.closest('.modal-overlay');
      if (closeOverlay && (e.target === closeOverlay || e.target.closest('.btn-modal-close'))) {
        this.closeModal();
        return;
      }

      // 8. Abas do Modal
      const modalTabBtn = e.target.closest('[data-modal-tab]');
      if (modalTabBtn) {
        const mTab = modalTabBtn.getAttribute('data-modal-tab');
        this.switchModalTab(mTab);
        return;
      }

      // 9. Pills de Hospital dentro do Modal
      const modalHospPill = e.target.closest('[data-modal-hosp]');
      if (modalHospPill) {
        const val = modalHospPill.getAttribute('data-modal-hosp');
        const input = document.getElementById('shift-hospital-input');
        if (input) {
          input.value = val;
          document.querySelectorAll('.modal-hosp-pill').forEach(p => p.classList.remove('selected'));
          modalHospPill.classList.add('selected');
        }
        return;
      }

      // 10. Seletor de Regime (Caixa vs Competência)
      const regimeBtn = e.target.closest('[data-regime]');
      if (regimeBtn) {
        const reg = regimeBtn.getAttribute('data-regime');
        this.store.data.preferences.regime = reg;
        this.store.save();
        return;
      }

      // 11. Navegação de Mês
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

      // 12. Toggle de Parcela de Plantão (Recebido / Pendente)
      const toggleInstBtn = e.target.closest('[data-toggle-installment]');
      if (toggleInstBtn) {
        const shiftId = toggleInstBtn.getAttribute('data-shift-id');
        const instNum = parseInt(toggleInstBtn.getAttribute('data-inst-num'), 10);
        this.store.toggleShiftInstallment(shiftId, instNum);
        this.showToast('Status da parcela atualizado com sucesso! ✨');
        return;
      }

      // 13. Excluir Plantão
      const delShiftBtn = e.target.closest('[data-delete-shift]');
      if (delShiftBtn) {
        const shiftId = delShiftBtn.getAttribute('data-delete-shift');
        if (confirm('Deseja realmente remover este plantão?')) {
          this.store.deleteShift(shiftId);
          this.showToast('Plantão removido.');
        }
        return;
      }

      // 14. Excluir Despesa
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
              this.showToast('Dados restaurados com perfeição! 🌸');
            } else {
              alert('Erro ao restaurar arquivo: ' + res.error);
            }
          };
          reader.readAsText(file);
        }
        e.target.value = '';
      }
    });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const nextTheme = this.store.data.preferences.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    this.store.data.preferences.theme = nextTheme;
    this.store.save();
    this.showToast(nextTheme === 'dark' ? 'Modo Escuro ativado 🌙' : 'Modo Claro ativado ☀️');
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

  openDrawer() {
    const drawer = document.getElementById('hamburger-drawer');
    if (drawer) drawer.classList.add('open');
  }

  closeDrawer() {
    const drawer = document.getElementById('hamburger-drawer');
    if (drawer) drawer.classList.remove('open');
  }

  openModal(tab = 'shift') {
    this.activeModalTab = tab;
    this.prefilledHospital = '';
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  openModalWithHospital(hospitalName) {
    this.activeModalTab = 'shift';
    this.prefilledHospital = hospitalName;
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  closeModal() {
    const modal = document.getElementById('action-modal');
    if (modal) modal.classList.remove('open');
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
      this.showToast('Cópia de segurança salva com sucesso! 📱');
    }
  }

  // -------------------------------------------------------------
  // ZERAR DADOS (FORMATAR) COM SEGURANÇA EM 2 ETAPAS
  // -------------------------------------------------------------
  async handleTwoStageDataReset() {
    // Etapa 1: Download automático imediato do backup preventivo
    await this.store.exportBackupToFile('financas_pediatria_backup_preventivo');
    this.showToast('Backup preventivo salvo com segurança! 💾');

    // Etapa 2: Modal de confirmação segura
    this.openResetConfirmModal();
  }

  openResetConfirmModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    modal.classList.add('open');

    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'none';

    body.innerHTML = `
      <div style="text-align: center; padding: 10px 0;">
        <div style="width: 56px; height: 56px; border-radius: var(--radius-pill); background: var(--coral-expense-light); color: var(--coral-expense); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          ${getIconSvg('trash', { size: 30, color: 'currentColor' })}
        </div>
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; margin-bottom: 6px;">
          Zerar Dados da Aplicação
        </h3>
        <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 18px;">
          Seu arquivo de backup preventivo já foi gerado e baixado. Escolha abaixo como deseja proceder:
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="drawer-menu-item" id="btn-reset-transactions" style="justify-content: center; background: #FFF3E0; border-color: #FFE082; color: #E65100;">
            Zerar Apenas Lançamentos (Mantém Perfil)
          </button>
          <button class="drawer-menu-item danger" id="btn-reset-factory" style="justify-content: center;">
            Reset de Fábrica Total (Limpar Tudo)
          </button>
          <button class="submit-btn" id="btn-reset-cancel" style="background: var(--bg-card-subtle); color: var(--text-main); box-shadow: none; border: 1px solid var(--silk-border);">
            Cancelar
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-reset-transactions').onclick = () => {
      this.store.resetData('transactions_only');
      this.closeModal();
      this.showToast('Lançamentos zerados com sucesso! ✨');
    };

    document.getElementById('btn-reset-factory').onclick = () => {
      this.store.resetData('full_factory');
      this.closeModal();
      this.showToast('Aplicação restaurada ao estado original de fábrica! 🌸');
    };

    document.getElementById('btn-reset-cancel').onclick = () => {
      this.closeModal();
    };
  }

  // -------------------------------------------------------------
  // MODAL DE PERFIL MÉDICO
  // -------------------------------------------------------------
  openProfileModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    modal.classList.add('open');

    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'none';

    const p = this.store.data;
    const salary = p.residencySalary?.value || 4106.09;

    body.innerHTML = `
      <div style="padding: 6px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800;">
            Perfil da Médica Pediatra
          </h3>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 20 })}
          </button>
        </div>

        <form id="form-edit-profile">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 18px;">
            <div class="avatar-badge" style="width: 64px; height: 64px;">
              ${p.doctorPhoto ? `<img src="${p.doctorPhoto}" class="avatar-img" id="profile-preview-img" />` : getIconSvg('stethoscope', { size: 30, color: '#EC407A' })}
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 4px;">Foto de Perfil</label>
              <input type="file" id="input-doctor-photo" accept="image/*" style="font-size: 0.8rem;" />
            </div>
          </div>

          <div class="form-group">
            <label>Nome Completo da Médica</label>
            <input type="text" name="doctorName" class="form-input" value="${p.doctorName || 'Dra. Fernanda Ch.'}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>CRM / UF</label>
              <input type="text" name="crm" class="form-input" value="${p.crm || 'CRM/RN 12345'}" />
            </div>
            <div class="form-group">
              <label>Especialidade / Ano</label>
              <input type="text" name="specialty" class="form-input" value="${p.specialty || 'Pediatria (R3)'}" />
            </div>
          </div>

          <div class="form-group">
            <label>Bolsa Residência Mensal Líquida (R$)</label>
            <input type="number" step="0.01" name="salaryValue" class="form-input" value="${salary}" required />
          </div>

          <button type="submit" class="submit-btn">Salvar Perfil</button>
        </form>
      </div>
    `;

    // Processamento de Foto com compressão suave via Canvas
    let photoBase64 = p.doctorPhoto;
    const photoInput = document.getElementById('input-doctor-photo');
    if (photoInput) {
      photoInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxDim = 240;
              let w = img.width;
              let h = img.height;
              if (w > h && w > maxDim) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else if (h > maxDim) {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              photoBase64 = canvas.toDataURL('image/jpeg', 0.85);

              // Atualiza o preview
              const preview = document.getElementById('profile-preview-img');
              if (preview) {
                preview.src = photoBase64;
              }
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
    }

    const form = document.getElementById('form-edit-profile');
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      this.store.updateDoctorProfile({
        doctorName: fd.get('doctorName'),
        crm: fd.get('crm'),
        specialty: fd.get('specialty'),
        doctorPhoto: photoBase64,
        salaryValue: fd.get('salaryValue')
      });
      this.closeModal();
      this.showToast('Perfil atualizado com sucesso! 🩺✨');
    };
  }

  // -------------------------------------------------------------
  // MODAL HUB DE FINANÇAS VISUAL
  // -------------------------------------------------------------
  openHubModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    modal.classList.add('open');

    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'none';

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const summary = this.store.getMonthSummary(currentMonth, 'caixa');

    body.innerHTML = `
      <div style="padding: 6px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            ${getIconSvg('analytics', { size: 22, color: '#EC407A' })}
            Hub de Finanças Visual
          </h3>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 20 })}
          </button>
        </div>

        <!-- 1. Comparativo Caixa Real vs Produção Represada -->
        <div style="margin-bottom: 18px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
            Comparativo de Liquidez
          </h4>
          <div id="hub-comparison-container"></div>
        </div>

        <!-- 2. Mini-Calendário Visual do Mês -->
        <div style="margin-bottom: 18px;">
          <div id="hub-calendar-container"></div>
        </div>

        <!-- 3. Previsão de 6 Meses -->
        <div>
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
            Projeção de 6 Meses
          </h4>
          <div id="hub-forecast-container"></div>
        </div>
      </div>
    `;

    renderComparisonVisual('hub-comparison-container', summary.totalIncome, summary.workedThisMonthTotal, formatMonthYear(currentMonth));
    renderMonthCalendarVisual('hub-calendar-container', currentMonth, this.store.data.shifts, this.store.data.expenses);
    const forecast = this.store.getForecast6Months(currentMonth);
    renderForecastChart('hub-forecast-container', forecast);
  }

  // -------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL DO APP
  // -------------------------------------------------------------
  render() {
    if (!this.appEl) return;

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const currentRegime = this.store.data.preferences.regime || 'caixa';
    const chartViewMode = this.store.data.preferences.chartViewMode || 'macro';
    const summary = this.store.getMonthSummary(currentMonth, currentRegime);

    let contentHtml = '';
    if (this.currentTab === 'home') {
      contentHtml = this.renderHomeTab(summary, currentMonth, currentRegime);
    } else if (this.currentTab === 'income') {
      contentHtml = this.renderIncomeTab(summary, currentMonth);
    } else if (this.currentTab === 'expenses') {
      contentHtml = this.renderExpensesTab(summary, currentMonth);
    }

    const doctorPhoto = this.store.data.doctorPhoto;

    this.appEl.innerHTML = `
      <!-- Cabeçalho Editorial com Foto e Menu Hambúrguer -->
      <header class="app-header">
        <div class="doctor-greeting" id="btn-header-profile" title="Ver Perfil">
          <div class="avatar-badge">
            ${doctorPhoto ? `<img src="${doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 24, color: '#EC407A' })}
          </div>
          <div class="greeting-text">
            <h1>${this.store.data.doctorName}</h1>
            <p>${this.store.data.specialty || 'Pediatria'}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn hamburger-btn" id="btn-hamburger-menu" title="Menu Principal">
            ${getIconSvg('menu', { size: 22 })}
          </button>
        </div>
      </header>

      <!-- Barra de Navegação de Mês -->
      <div class="month-selector-bar">
        <button class="nav-month-btn" id="btn-prev-month" title="Mês Anterior">
          ${getIconSvg('chevron_left', { size: 20, color: 'currentColor' })}
        </button>
        <div class="current-month-label">
          ${getIconSvg('calendar', { size: 18, color: '#EC407A' })}
          <span>${formatMonthYear(currentMonth)}</span>
        </div>
        <button class="nav-month-btn" id="btn-next-month" title="Próximo Mês">
          ${getIconSvg('chevron_right', { size: 20, color: 'currentColor' })}
        </button>
      </div>

      <!-- Seletor de Regime Caixa vs Competência -->
      <div class="regime-toggle-pill">
        <button class="regime-btn ${currentRegime === 'caixa' ? 'active' : ''}" data-regime="caixa">
          Regime de Caixa (Depósitos D+60/D+90)
        </button>
        <button class="regime-btn ${currentRegime === 'competencia' ? 'active' : ''}" data-regime="competencia">
          Regime de Competência (Produção)
        </button>
      </div>

      <!-- Barra de Pré-Seleção Rápida de Maternidades (Araken & Leide Morais) -->
      <div class="quick-hospitals-bar">
        <button class="quick-hospital-chip highlight" data-quick-hospital="Maternidade Araken">
          ${getIconSvg('hospital', { size: 16, color: '#EC407A' })}
          + Araken
        </button>
        <button class="quick-hospital-chip highlight" data-quick-hospital="Maternidade Leide Morais">
          ${getIconSvg('hospital', { size: 16, color: '#EC407A' })}
          + Leide Morais
        </button>
        <button class="quick-hospital-chip" data-quick-hospital="MEJEC">
          + MEJEC
        </button>
        <button class="quick-hospital-chip" data-quick-hospital="Hospital da Criança">
          + Hosp. Criança
        </button>
      </div>

      <!-- Botões de Ação Rápida Direta -->
      <div class="quick-actions-row">
        <button class="quick-action-btn coral" id="btn-quick-add-expense">
          ${getIconSvg('cart', { size: 18, color: '#FF7043' })}
          + Nova Despesa
        </button>
        <button class="quick-action-btn pink" id="btn-quick-add-shift">
          ${getIconSvg('stethoscope', { size: 18, color: '#EC407A' })}
          + Novo Plantão
        </button>
      </div>

      <!-- Conteúdo da Aba Atual -->
      <main id="main-content">
        ${contentHtml}
      </main>

      <!-- Barra de Navegação Inferior Fixa -->
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

      <!-- Drawer Lateral do Menu Hambúrguer -->
      <div class="drawer-overlay" id="hamburger-drawer">
        <div class="drawer-panel">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Menu</span>
            <button class="icon-btn" id="btn-close-drawer">
              ${getIconSvg('close', { size: 20 })}
            </button>
          </div>

          <div class="drawer-profile-card">
            <div class="avatar-badge" style="width: 52px; height: 52px;">
              ${doctorPhoto ? `<img src="${doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 26, color: '#EC407A' })}
            </div>
            <div>
              <strong style="font-family: var(--font-heading); font-size: 1.05rem; display: block; color: var(--text-main);">
                ${this.store.data.doctorName}
              </strong>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${this.store.data.crm || 'Médica Pediatra'}</span>
            </div>
          </div>

          <div class="drawer-menu-list">
            <button class="drawer-menu-item" id="drawer-item-profile">
              ${getIconSvg('user', { size: 20, color: '#EC407A' })}
              <span>Editar Perfil Médico</span>
            </button>

            <button class="drawer-menu-item" id="drawer-item-hub">
              ${getIconSvg('analytics', { size: 20, color: '#26A69A' })}
              <span>Hub de Finanças Visual</span>
            </button>

            <button class="drawer-menu-item" id="drawer-item-theme">
              ${getIconSvg('dark_mode', { size: 20, color: '#AB47BC' })}
              <span>Alternar Tema Claro / Escuro</span>
            </button>

            <button class="drawer-menu-item" id="drawer-item-backup">
              ${getIconSvg('save_iphone', { size: 20, color: '#FF7043' })}
              <span>Salvar Backup no iPhone</span>
            </button>

            <button class="drawer-menu-item" id="drawer-item-restore">
              ${getIconSvg('refresh', { size: 20, color: '#42A5F5' })}
              <span>Restaurar Arquivo de Backup</span>
            </button>

            <button class="drawer-menu-item danger" id="drawer-item-reset">
              ${getIconSvg('trash', { size: 20, color: '#F4511E' })}
              <span>Zerar Dados (Formatar)</span>
            </button>
          </div>

          <div class="drawer-creator-badge">
            <p>Finanças Pediatria <strong>v${APP_VERSION}</strong></p>
            <p>Criado com carinho por <strong>${APP_CREATOR}</strong></p>
          </div>
        </div>
      </div>

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

      <!-- Input Oculto de Arquivo de Backup -->
      <input type="file" id="backup-file-input" accept=".json" style="display: none;" />
    `;

    // Renderiza gráficos da aba Início
    if (this.currentTab === 'home') {
      const forecast = this.store.getForecast6Months(currentMonth);
      renderForecastChart('forecast-chart-container', forecast);

      // Renderiza Donut com o modo ativo (Macro vs Detalhado)
      const donutData = chartViewMode === 'macro' ? summary.macroBreakdown : summary.categoryBreakdown;
      renderDonutExpenses(
        'donut-chart-container',
        donutData,
        summary.totalExpenses,
        chartViewMode,
        (newMode) => {
          this.store.data.preferences.chartViewMode = newMode;
          this.store.save();
        }
      );

      // Renderiza Comparativo Caixa Real vs Produção Represada
      renderComparisonVisual(
        'comparison-chart-container',
        summary.totalIncome,
        summary.workedThisMonthTotal,
        formatMonthYear(currentMonth)
      );
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
            <div class="stat-icon mint">
              ${getIconSvg('mint_income', { size: 20, color: '#FFFFFF' })}
            </div>
            <div class="stat-info">
              <span>Total Entradas</span>
              <strong>${formatCurrency(summary.totalIncome)}</strong>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon coral">
              ${getIconSvg('coral_expense', { size: 20, color: '#FFFFFF' })}
            </div>
            <div class="stat-info">
              <span>Total Despesas</span>
              <strong>${formatCurrency(summary.totalExpenses)}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Gráfico de Previsão de 6 Meses -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('chart', { size: 20, color: '#EC407A' })}
            Previsão dos Próximos 6 Meses
          </h2>
        </div>
        <div id="forecast-chart-container"></div>
      </section>

      <!-- Gráfico de Rosca de Despesas com Macro-Grupos -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('pie', { size: 20, color: '#FF7043' })}
            Distribuição de Gastos
          </h2>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
            ${summary.expensesCount} lançamentos
          </span>
        </div>
        <div id="donut-chart-container"></div>
      </section>

      <!-- Comparativo Caixa Real vs Produção Represada -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('analytics', { size: 20, color: '#26A69A' })}
            Caixa Real vs Produção em Aberto
          </h2>
        </div>
        <div id="comparison-chart-container"></div>
      </section>
    `;
  }

  // -------------------------------------------------------------
  // ABA: GANHOS (RESIDÊNCIA & PLANTÕES EM SALA DE PARTO)
  // -------------------------------------------------------------
  renderIncomeTab(summary, currentMonth) {
    const salary = this.store.data.residencySalary;
    const isCaixa = this.store.data.preferences.regime === 'caixa';

    let relevantShifts = [];
    if (isCaixa) {
      relevantShifts = this.store.data.shifts.filter(s =>
        (s.installment1 && s.installment1.expectedDate.startsWith(currentMonth)) ||
        (s.installment2 && s.installment2.expectedDate.startsWith(currentMonth))
      );
    } else {
      relevantShifts = this.store.data.shifts.filter(s => s.date.startsWith(currentMonth));
    }

    let shiftsHtml = '';
    if (relevantShifts.length === 0) {
      shiftsHtml = `
        <div class="empty-donut-state">
          <div class="empty-icon-circle">
            ${getIconSvg('stethoscope', { size: 28, color: '#EC407A' })}
          </div>
          <p class="empty-text">Nenhum plantão registrado para este mês</p>
          <span class="empty-sub">Toque em "+ Novo Plantão" para lançar</span>
        </div>
      `;
    } else {
      shiftsHtml = relevantShifts.map(s => {
        const isInst1ThisMonth = s.installment1?.expectedDate.startsWith(currentMonth);
        const isInst2ThisMonth = s.installment2?.expectedDate.startsWith(currentMonth);

        return `
          <div class="shift-item-card">
            <div class="shift-header-row">
              <div>
                <h3 class="shift-hospital">${s.hospital}</h3>
                <span style="font-size: 0.76rem; color: var(--text-muted);">${formatDateBR(s.date)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="shift-type-badge">${s.shiftType}</span>
                <button class="expense-del-btn" data-delete-shift="${s.id}" title="Excluir Plantão">
                  ${getIconSvg('delete', { size: 16, color: 'currentColor' })}
                </button>
              </div>
            </div>

            <div class="shift-dates-row">
              <span>Valor Líquido: <strong>${formatCurrency(s.netValue)}</strong></span>
              ${s.grossValue && s.grossValue !== s.netValue ? `<span>Bruto: ${formatCurrency(s.grossValue)}</span>` : ''}
            </div>

            <div class="shift-installments-box">
              <div class="installment-col">
                <span class="inst-title">80% em D+60 (${formatDateBR(s.installment1.expectedDate)})</span>
                <strong class="inst-val">${formatCurrency(s.installment1.value)}</strong>
                <button
                  class="inst-status-btn ${s.installment1.status}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="1"
                >
                  ${s.installment1.status === 'received' ? getIconSvg('check', { size: 14 }) + ' Recebido' : 'Pendente (D+60)'}
                </button>
              </div>

              <div class="installment-col">
                <span class="inst-title">20% em D+90 (${formatDateBR(s.installment2.expectedDate)})</span>
                <strong class="inst-val">${formatCurrency(s.installment2.value)}</strong>
                <button
                  class="inst-status-btn ${s.installment2.status}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="2"
                >
                  ${s.installment2.status === 'received' ? getIconSvg('check', { size: 14 }) + ' Recebido' : 'Pendente (D+90)'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <!-- Card da Bolsa Residência -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('wallet', { size: 20, color: '#26A69A' })}
            Bolsa Residência Fixa
          </h2>
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--mint-income);">
            ${salary.active ? 'Ativa' : 'Inativa'}
          </span>
        </div>
        <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
          <span style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--mint-income);">
            ${formatCurrency(salary.value)}
          </span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">/ mês</span>
        </div>
        <span style="font-size: 0.78rem; color: var(--text-muted);">
          Creditada mensalmente todo dia ${salary.dayOfMonth || 5} sem impostos retidos
        </span>
      </section>

      <!-- Lista de Plantões do Mês -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('hospital', { size: 20, color: '#EC407A' })}
            Plantões em Sala de Parto
          </h2>
          <button class="section-action-btn" id="btn-add-shift-quick">+ Novo Plantão</button>
        </div>
        ${shiftsHtml}
      </section>
    `;
  }

  // -------------------------------------------------------------
  // ABA: DESPESAS (COM TODAS AS CATEGORIAS & SPARKLINES)
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
            ${getIconSvg('cart', { size: 28, color: '#FF7043' })}
          </div>
          <p class="empty-text">Nenhuma despesa para este mês</p>
          <span class="empty-sub">Toque em "+ Nova Despesa" para cadastrar</span>
        </div>
      `;
    } else {
      expensesHtml = monthExpenses.map(e => {
        const catInfo = this.store.data.categories.find(c => c.name === e.category) || { icon: 'tag', color: '#AB47BC' };
        const macro = getMacroGroupForCategory(e.category);
        const pctOfTotal = summary.totalExpenses > 0 ? (e.value / summary.totalExpenses) * 100 : 0;

        return `
          <div class="expense-item-row">
            <div class="expense-item-main">
              <div class="expense-left">
                <div class="expense-icon-badge" style="background: ${catInfo.color}15; color: ${catInfo.color};">
                  ${getIconSvg(catInfo.icon, { size: 20, color: catInfo.color })}
                </div>
                <div class="expense-texts">
                  <span class="expense-desc">${e.description}</span>
                  <div class="expense-meta">
                    <span class="expense-macro-tag" style="background: ${macro.bgColor}; color: ${macro.color};">
                      ${macro.name}
                    </span>
                    <span>${e.category} • ${formatDateBR(e.date)}</span>
                  </div>
                </div>
              </div>
              <div class="expense-right">
                <span class="expense-val">${formatCurrency(e.value)}</span>
                <button class="expense-del-btn" data-delete-expense="${e.id}" title="Excluir Despesa">
                  ${getIconSvg('delete', { size: 16, color: 'currentColor' })}
                </button>
              </div>
            </div>

            <!-- Mini Sparkline do Impacto no Orçamento do Mês -->
            <div class="expense-sparkline-box">
              <div class="sparkline-track">
                <div class="sparkline-fill" style="width: ${pctOfTotal.toFixed(1)}%; background: ${catInfo.color};"></div>
              </div>
              <span class="sparkline-pct">${pctOfTotal.toFixed(1)}%</span>
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
            ${getIconSvg('cart', { size: 20, color: '#FF7043' })}
            Total de Despesas
          </h2>
          <button class="section-action-btn" id="btn-add-expense-quick">+ Nova Despesa</button>
        </div>
        <div style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; color: var(--coral-expense); margin-bottom: 4px;">
          ${formatCurrency(summary.totalExpenses)}
        </div>
        <span style="font-size: 0.78rem; color: var(--text-muted);">
          Despesas do mês incluindo compras parceladas vigentes
        </span>
      </section>

      <!-- Lista Detalhada de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>Lançamentos de ${formatMonthYear(currentMonth).split(' de ')[0]}</h2>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700;">
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
  // FORMULÁRIOS DO MODAL (IN-FLOW EXPANSION ANTI-CROP)
  // -------------------------------------------------------------
  renderModalContent() {
    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'flex';
    if (!body) return;

    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-modal-tab') === this.activeModalTab);
    });

    if (this.activeModalTab === 'shift') {
      const today = getLocalDateString();
      const defaultHospital = this.prefilledHospital || 'Maternidade Araken';

      body.innerHTML = `
        <form id="form-new-shift">
          <div class="form-group">
            <label>Hospital / Maternidade</label>
            <input type="text" id="shift-hospital-input" name="hospital" class="form-input" value="${defaultHospital}" placeholder="Ex: Maternidade Araken" required />
            <div class="modal-hospital-pills">
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'Maternidade Araken' ? 'selected' : ''}" data-modal-hosp="Maternidade Araken">Araken</button>
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'Maternidade Leide Morais' ? 'selected' : ''}" data-modal-hosp="Maternidade Leide Morais">Leide Morais</button>
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'MEJEC' ? 'selected' : ''}" data-modal-hosp="MEJEC">MEJEC</button>
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'Hospital da Criança' ? 'selected' : ''}" data-modal-hosp="Hospital da Criança">Hosp. Criança</button>
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'Hospital Mater Dei' ? 'selected' : ''}" data-modal-hosp="Hospital Mater Dei">Mater Dei</button>
            </div>
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
                <option value="Sala de Parto" selected>Sala de Parto</option>
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

          <div style="background: var(--lilac-light); padding: 12px 14px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--lilac-accent); margin-bottom: 14px; border: 1px solid rgba(171, 71, 188, 0.2);">
            ✨ Divisão automática do plantão médico: <strong>80% em 2 meses (D+60)</strong> e <strong>20% em 3 meses (D+90)</strong>.
          </div>

          <button type="submit" class="submit-btn">Salvar Plantão</button>
        </form>
      `;

      const form = document.getElementById('form-new-shift');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const net = parseFloat(fd.get('netValue')) || 0;
        const gross = parseFloat(fd.get('grossValue')) || net;

        this.store.saveShift({
          hospital: fd.get('hospital'),
          date: fd.get('date'),
          shiftType: fd.get('shiftType'),
          netValue: net,
          grossValue: gross
        });

        this.closeModal();
        this.showToast('Plantão registrado com sucesso! 🩺✨');
      };
    } else if (this.activeModalTab === 'expense') {
      const today = getLocalDateString();
      const categoriesOptions = this.store.data.categories.map(c => `
        <option value="${c.name}">${c.name}</option>
      `).join('');

      body.innerHTML = `
        <form id="form-new-expense">
          <div class="form-group">
            <label>Descrição do Gasto</label>
            <input type="text" name="description" class="form-input" placeholder="Ex: Supermercado, Aluguel, Farmácia" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoria</label>
              <select name="category" class="form-select">
                ${categoriesOptions}
              </select>
            </div>
            <div class="form-group">
              <label>Valor (R$)</label>
              <input type="number" step="0.01" name="value" class="form-input" placeholder="Ex: 150.00" required />
            </div>
          </div>

          <div class="form-group">
            <label>Data</label>
            <input type="date" name="date" class="form-input" value="${today}" required />
          </div>

          <div style="background: var(--bg-card-subtle); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--silk-border); margin-bottom: 14px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; font-weight: 700; cursor: pointer;">
              <input type="checkbox" id="check-is-installment" name="isInstallment" style="width: 18px; height: 18px; accent-color: var(--primary-pink);" />
              Compra Parcelada no Cartão
            </label>

            <div id="installment-fields" style="display: none; margin-top: 10px;">
              <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">
                Número de Parcelas
              </label>
              <select name="totalInstallments" class="form-select">
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
                <option value="5">5x</option>
                <option value="6">6x</option>
                <option value="10">10x</option>
                <option value="12">12x</option>
                <option value="24">24x</option>
              </select>
            </div>
          </div>

          <button type="submit" class="submit-btn">Salvar Despesa</button>
        </form>
      `;

      const checkInst = document.getElementById('check-is-installment');
      const instFields = document.getElementById('installment-fields');
      checkInst.onchange = () => {
        instFields.style.display = checkInst.checked ? 'block' : 'none';
      };

      const form = document.getElementById('form-new-expense');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const isInst = checkInst.checked;
        const totalInst = isInst ? parseInt(fd.get('totalInstallments'), 10) : 1;

        this.store.saveExpense({
          description: fd.get('description'),
          category: fd.get('category'),
          value: parseFloat(fd.get('value')) || 0,
          date: fd.get('date'),
          isInstallment: isInst,
          totalInstallments: totalInst
        });

        this.closeModal();
        this.showToast('Despesa cadastrada! 🌸');
      };
    } else if (this.activeModalTab === 'salary') {
      const curSal = this.store.data.residencySalary;

      body.innerHTML = `
        <form id="form-salary">
          <div class="form-group">
            <label>Valor Mensal Líquido da Bolsa (R$)</label>
            <input type="number" step="0.01" name="value" class="form-input" value="${curSal.value}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Dia de Pagamento no Mês</label>
              <input type="number" min="1" max="31" name="dayOfMonth" class="form-input" value="${curSal.dayOfMonth || 5}" required />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select name="active" class="form-select">
                <option value="true" ${curSal.active ? 'selected' : ''}>Ativo</option>
                <option value="false" ${!curSal.active ? 'selected' : ''}>Pausado</option>
              </select>
            </div>
          </div>

          <button type="submit" class="submit-btn">Atualizar Bolsa</button>
        </form>
      `;

      const form = document.getElementById('form-salary');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        this.store.updateResidencySalary({
          value: fd.get('value'),
          dayOfMonth: fd.get('dayOfMonth'),
          active: fd.get('active') === 'true'
        });

        this.closeModal();
        this.showToast('Bolsa residência atualizada! 🩺');
      };
    }
  }
}

// Inicialização automática no navegador
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new PediatricApp();
  });
}
