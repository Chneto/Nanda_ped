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
  MACRO_GROUPS,
  APP_CREATOR,
  APP_VERSION
} from './store.js';

import { getIconSvg } from './icons.js';
import {
  renderForecastChart,
  renderDonutExpenses,
  renderComparisonVisual,
  renderMonthCalendarVisual,
  renderNetBalanceVisual
} from './charts.js';

export class PediatricApp {
  constructor() {
    this.store = new PediatricStore();
    this.currentTab = 'home'; // 'home' | 'income' | 'expenses'
    this.activeModalTab = 'shift'; // 'shift' | 'expense' | 'salary'
    this.prefilledHospital = '';
    this.activeExpenseFilter = 'all'; // 'all' | macro group id


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

      // Perfil no Cabeçalho (Avatar e Saudação Médica)
      const headerProfile = e.target.closest('#btn-header-profile');
      if (headerProfile) {
        this.openProfileModal();
        return;
      }

      // 6. Itens do Drawer
      const drawerItemProfile = e.target.closest('#drawer-item-profile');
      if (drawerItemProfile) {
        this.closeDrawer();
        this.openProfileModal();
        return;
      }

      const drawerItemCategories = e.target.closest('#drawer-item-categories');
      if (drawerItemCategories) {
        this.closeDrawer();
        this.openCategoriesModal();
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

      // Filtro de Macro-Grupos na Aba de Despesas
      const macroFilterBtn = e.target.closest('[data-macro-filter]');
      if (macroFilterBtn) {
        const filterId = macroFilterBtn.getAttribute('data-macro-filter');
        this.activeExpenseFilter = filterId;
        this.render();
        return;
      }

      // Silk Select: Toggle do Menu Dropdown / Dropup
      const selectTrigger = e.target.closest('.silk-select-trigger');
      if (selectTrigger) {
        const container = selectTrigger.closest('.silk-select-container');
        const menu = container ? container.querySelector('.silk-select-menu') : null;
        if (menu) {
          const wasOpen = menu.classList.contains('open');
          document.querySelectorAll('.silk-select-menu.open').forEach(m => m.classList.remove('open'));
          document.querySelectorAll('.silk-select-trigger.open').forEach(t => t.classList.remove('open'));
          if (!wasOpen) {
            menu.classList.add('open');
            selectTrigger.classList.add('open');
          }
        }
        return;
      }

      // Silk Select: Seleção de Item
      const selectItem = e.target.closest('.silk-select-item');
      if (selectItem) {
        const val = selectItem.getAttribute('data-value');
        const label = selectItem.getAttribute('data-label') || val;
        const icon = selectItem.getAttribute('data-icon') || '';
        const color = selectItem.getAttribute('data-color') || '';
        const container = selectItem.closest('.silk-select-container');
        if (container) {
          const input = container.querySelector('input[type="hidden"]');
          if (input) input.value = val;
          const labelSpan = container.querySelector('.trigger-label');
          if (labelSpan) labelSpan.textContent = label;
          const iconSpan = container.querySelector('.trigger-icon');
          if (iconSpan && icon) {
            iconSpan.innerHTML = getIconSvg(icon, { size: 16, color: color || '#EC407A' });
            if (color) iconSpan.style.backgroundColor = `${color}15`;
          }
          container.querySelectorAll('.silk-select-item').forEach(i => i.classList.remove('selected'));
          selectItem.classList.add('selected');

          const menu = container.querySelector('.silk-select-menu');
          if (menu) menu.classList.remove('open');
          const trig = container.querySelector('.silk-select-trigger');
          if (trig) trig.classList.remove('open');
        }
        return;
      }

      // Acordeão de Subcategorias no Modal de Categorização
      const macroCardHeader = e.target.closest('.macro-category-header');
      if (macroCardHeader) {
        const card = macroCardHeader.closest('.macro-category-card');
        if (card) {
          const list = card.querySelector('.macro-subcat-list');
          if (list) list.classList.toggle('open');
        }
        return;
      }

      // Botão "Filtrar no Extrato" vindo do Modal de Categorização
      const btnFilterMacroFromModal = e.target.closest('[data-filter-macro-from-modal]');
      if (btnFilterMacroFromModal) {
        const macroId = btnFilterMacroFromModal.getAttribute('data-filter-macro-from-modal');
        this.activeExpenseFilter = macroId;
        this.closeModal();
        this.switchTab('expenses');
        return;
      }

      // Clicou fora de qualquer Silk Select: fecha menus
      if (!e.target.closest('.silk-select-container')) {
        document.querySelectorAll('.silk-select-menu.open').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.silk-select-trigger.open').forEach(t => t.classList.remove('open'));
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
  // MODAL DE CATEGORIZAÇÃO DAS DESPESAS POR TIPO (MACRO-GRUPOS)
  // -------------------------------------------------------------
  openCategoriesModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    modal.classList.add('open');

    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'none';

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const summary = this.store.getMonthSummary(currentMonth, 'caixa');
    const monthExpenses = this.store.data.expenses.filter(e => e.date.startsWith(currentMonth));

    let macroCardsHtml = '';
    MACRO_GROUPS.forEach(mg => {
      const groupExpenses = monthExpenses.filter(e => {
        const g = getMacroGroupForCategory(e.category);
        return g.id === mg.id;
      });
      const groupTotal = groupExpenses.reduce((s, e) => s + e.value, 0);
      const groupPct = summary.totalExpenses > 0 ? (groupTotal / summary.totalExpenses) * 100 : 0;

      // Subcategorias dentro deste grupo
      const subcatMap = {};
      groupExpenses.forEach(e => {
        subcatMap[e.category] = (subcatMap[e.category] || 0) + e.value;
      });
      const subcatRows = Object.keys(subcatMap).map(cName => `
        <div class="macro-subcat-item">
          <span>${cName}</span>
          <strong>${formatCurrency(subcatMap[cName])}</strong>
        </div>
      `).join('');

      macroCardsHtml += `
        <div class="macro-category-card">
          <div class="macro-category-header" title="Toque para ver detalhes">
            <div class="macro-category-left">
              <div class="macro-category-icon" style="background: ${mg.bgColor}; color: ${mg.color};">
                ${getIconSvg(mg.icon, { size: 22, color: mg.color })}
              </div>
              <div class="macro-category-info">
                <h4>${mg.name}</h4>
                <span>${groupExpenses.length} ${groupExpenses.length === 1 ? 'gasto' : 'gastos'} computados</span>
              </div>
            </div>
            <div class="macro-category-right">
              <span class="macro-category-val">${formatCurrency(groupTotal)}</span>
              <span class="macro-category-pct">${groupPct.toFixed(1)}% do orçamento</span>
            </div>
          </div>

          <div class="macro-progress-track">
            <div class="macro-progress-fill" style="width: ${groupPct.toFixed(1)}%; background: ${mg.color};"></div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
            <button class="section-action-btn" data-filter-macro-from-modal="${mg.id}" style="font-size: 0.72rem; padding: 4px 10px;">
              Filtrar no Extrato
            </button>
            <span style="font-size: 0.72rem; color: var(--text-muted); cursor: pointer;">
              ${Object.keys(subcatMap).length > 0 ? 'Ver subcategorias ▼' : 'Sem despesas neste grupo'}
            </span>
          </div>

          ${Object.keys(subcatMap).length > 0 ? `
            <div class="macro-subcat-list">
              ${subcatRows}
            </div>
          ` : ''}
        </div>
      `;
    });

    body.innerHTML = `
      <div style="padding: 6px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.18rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              ${getIconSvg('layers', { size: 22, color: '#EC407A' })}
              Categorização de Gastos por Tipo
            </h3>
            <p style="font-size: 0.78rem; color: var(--text-muted);">
              Macro-Grupos inspirados em bancos digitais (${formatMonthYear(currentMonth).split(' de ')[0]})
            </p>
          </div>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 20 })}
          </button>
        </div>

        <div style="margin-bottom: 14px; background: var(--hero-gradient); border: 1px solid var(--rose-gold); border-radius: var(--radius-md); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Total Despesas</span>
            <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--coral-expense);">
              ${formatCurrency(summary.totalExpenses)}
            </div>
          </div>
          <button class="section-action-btn" id="btn-modal-goto-expenses" style="background: var(--bg-card); color: var(--primary-pink); border-color: var(--rose-gold);">
            + Nova Despesa
          </button>
        </div>

        <div class="macro-cards-container">
          ${macroCardsHtml}
        </div>
      </div>
    `;

    const btnGoExp = document.getElementById('btn-modal-goto-expenses');
    if (btnGoExp) {
      btnGoExp.onclick = () => {
        this.openModal('expense');
      };
    }
  }

  // -------------------------------------------------------------
  // MODAL HUB DE FINANÇAS VISUAL (5 REPRESENTAÇÕES VISUAIS)
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
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.18rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              ${getIconSvg('analytics', { size: 22, color: '#EC407A' })}
              Hub de Finanças Visual
            </h3>
            <p style="font-size: 0.78rem; color: var(--text-muted);">
              Gráficos completos e representações visuais de ${formatMonthYear(currentMonth).split(' de ')[0]}
            </p>
          </div>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 20 })}
          </button>
        </div>

        <!-- 1. Balanço Líquido e Taxa de Poupança -->
        <div style="margin-bottom: 18px;">
          <div id="hub-net-balance-container"></div>
        </div>

        <!-- 2. Comparativo Caixa Real vs Produção Represada -->
        <div style="margin-bottom: 18px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
            Comparativo de Liquidez
          </h4>
          <div id="hub-comparison-container"></div>
        </div>

        <!-- 3. Distribuição de Gastos Donut -->
        <div style="margin-bottom: 18px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
            Distribuição de Gastos
          </h4>
          <div id="hub-donut-container"></div>
        </div>

        <!-- 4. Mini-Calendário Visual do Mês -->
        <div style="margin-bottom: 18px;">
          <div id="hub-calendar-container"></div>
        </div>

        <!-- 5. Previsão de 6 Meses -->
        <div>
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
            Projeção de 6 Meses de Fluxo
          </h4>
          <div id="hub-forecast-container"></div>
        </div>
      </div>
    `;

    renderNetBalanceVisual('hub-net-balance-container', summary, formatMonthYear(currentMonth));
    renderComparisonVisual('hub-comparison-container', summary.totalIncome, summary.workedThisMonthTotal, formatMonthYear(currentMonth));
    
    const chartViewMode = this.store.data.preferences.chartViewMode || 'macro';
    const donutData = chartViewMode === 'macro' ? summary.macroBreakdown : summary.categoryBreakdown;
    renderDonutExpenses(
      'hub-donut-container',
      donutData,
      summary.totalExpenses,
      chartViewMode,
      (newMode) => {
        this.store.data.preferences.chartViewMode = newMode;
        this.store.save();
        this.openHubModal();
      }
    );

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
              <div style="display: flex; flex-direction: column; text-align: left; gap: 2px;">
                <span>Editar Perfil Médico</span>
                <small style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">CRM, Especialidade e Bolsa</small>
              </div>
              <div style="margin-left: auto; color: var(--text-muted);">
                ${getIconSvg('chevron_right', { size: 16 })}
              </div>
            </button>

            <button class="drawer-menu-item" id="drawer-item-categories">
              ${getIconSvg('layers', { size: 20, color: '#FF7043' })}
              <div style="display: flex; flex-direction: column; text-align: left; gap: 2px;">
                <span>Categorização por Tipo</span>
                <small style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">6 Macro-Grupos (Alimentação, etc.)</small>
              </div>
              <div style="margin-left: auto; color: var(--text-muted);">
                ${getIconSvg('chevron_right', { size: 16 })}
              </div>
            </button>

            <button class="drawer-menu-item" id="drawer-item-hub">
              ${getIconSvg('analytics', { size: 20, color: '#26A69A' })}
              <div style="display: flex; flex-direction: column; text-align: left; gap: 2px;">
                <span>Hub de Finanças Visual</span>
                <small style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">5 Representações gráficas ricas</small>
              </div>
              <div style="margin-left: auto; color: var(--text-muted);">
                ${getIconSvg('chevron_right', { size: 16 })}
              </div>
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
                <span class="inst-title">75% em D+60 (${formatDateBR(s.installment1.expectedDate)})</span>
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
                <span class="inst-title">25% em D+90 (${formatDateBR(s.installment2.expectedDate)})</span>
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
  // -------------------------------------------------------------
  // ABA: DESPESAS (COM TODAS AS CATEGORIAS, FILTROS & SPARKLINES)
  // -------------------------------------------------------------
  renderExpensesTab(summary, currentMonth) {
    const allMonthExpenses = this.store.data.expenses
      .filter(e => e.date.startsWith(currentMonth))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filtro por Macro-Grupo ativo
    const activeFilter = this.activeExpenseFilter || 'all';
    const monthExpenses = activeFilter === 'all'
      ? allMonthExpenses
      : allMonthExpenses.filter(e => getMacroGroupForCategory(e.category).id === activeFilter);

    const filteredTotal = monthExpenses.reduce((s, e) => s + e.value, 0);

    // Barra de Filtros por Macro-Grupo (Estilo Apps Bancários)
    const filterPillsHtml = `
      <div class="macro-filter-bar">
        <button class="macro-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-macro-filter="all">
          <span>Todas</span>
          <span class="pill-count">${allMonthExpenses.length}</span>
        </button>
        ${MACRO_GROUPS.map(mg => {
          const count = allMonthExpenses.filter(e => getMacroGroupForCategory(e.category).id === mg.id).length;
          return `
            <button class="macro-filter-pill ${activeFilter === mg.id ? 'active' : ''}" data-macro-filter="${mg.id}">
              ${getIconSvg(mg.icon, { size: 14, color: mg.color })}
              <span>${mg.name}</span>
              ${count > 0 ? `<span class="pill-count">${count}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;

    let expensesHtml = '';
    if (monthExpenses.length === 0) {
      expensesHtml = `
        <div class="empty-donut-state">
          <div class="empty-icon-circle">
            ${getIconSvg('cart', { size: 28, color: '#FF7043' })}
          </div>
          <p class="empty-text">Nenhuma despesa encontrada ${activeFilter !== 'all' ? 'neste macro-grupo' : 'para este mês'}</p>
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
              <span class="sparkline-pct">${pctOfTotal.toFixed(1)}% do mês</span>
            </div>
          </div>
        `;
      }).join('');
    }

    const activeMacroObj = MACRO_GROUPS.find(m => m.id === activeFilter);
    const filterTitle = activeFilter === 'all' ? 'Lançamentos' : `Gastos em ${activeMacroObj.name}`;

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
          ${formatCurrency(activeFilter === 'all' ? summary.totalExpenses : filteredTotal)}
        </div>
        <span style="font-size: 0.78rem; color: var(--text-muted);">
          ${activeFilter === 'all' ? 'Despesas do mês incluindo compras parceladas vigentes' : `Filtrado por ${activeMacroObj.name} (${monthExpenses.length} itens)`}
        </span>
      </section>

      <!-- Barra de Filtros Estilo Apps Bancários -->
      <section class="card-section" style="padding-bottom: 8px;">
        <div class="section-header" style="margin-bottom: 8px;">
          <h3 style="font-size: 0.86rem; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            ${getIconSvg('filter', { size: 16, color: '#EC407A' })}
            Filtrar por Macro-Grupo
          </h3>
          ${activeFilter !== 'all' ? `
            <button class="section-action-btn" data-macro-filter="all" style="font-size: 0.72rem; padding: 4px 8px;">
              Limpar Filtro
            </button>
          ` : ''}
        </div>
        ${filterPillsHtml}
      </section>

      <!-- Lista Detalhada de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>${filterTitle} (${formatMonthYear(currentMonth).split(' de ')[0]})</h2>
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
  // SISTEMA SILK SELECT: RENDERIZADOR DE DROPDOWN & DROPUP
  // -------------------------------------------------------------
  renderCustomSelect({ id, name, value, options, isDropup = false, grouped = false, placeholder = 'Selecione...' }) {
    let selectedOption = null;
    if (grouped) {
      for (const grp of options) {
        const found = grp.items.find(i => i.value === value);
        if (found) { selectedOption = found; break; }
      }
    } else {
      selectedOption = options.find(i => i.value === value);
    }

    const currentLabel = selectedOption ? selectedOption.label : placeholder;
    const currentIcon = selectedOption ? (selectedOption.icon || 'tag') : 'tag';
    const currentColor = selectedOption ? (selectedOption.color || '#EC407A') : '#EC407A';

    let menuContent = '';
    if (grouped) {
      menuContent = options.map(grp => `
        <div class="silk-select-group-header" style="color: ${grp.color};">
          ${getIconSvg(grp.icon, { size: 14, color: grp.color })}
          <span>${grp.groupName}</span>
        </div>
        ${grp.items.map(item => `
          <div class="silk-select-item ${item.value === value ? 'selected' : ''}" data-value="${item.value}" data-label="${item.label}" data-icon="${item.icon}" data-color="${item.color}">
            <div class="silk-select-item-left">
              <span class="silk-select-badge" style="background: ${item.color}15; color: ${item.color};">
                ${getIconSvg(item.icon, { size: 14, color: item.color })}
              </span>
              <span>${item.label}</span>
            </div>
            ${item.value === value ? getIconSvg('check', { size: 14, color: '#EC407A' }) : ''}
          </div>
        `).join('')}
      `).join('');
    } else {
      menuContent = options.map(item => `
        <div class="silk-select-item ${item.value === value ? 'selected' : ''}" data-value="${item.value}" data-label="${item.label}" data-icon="${item.icon || 'tag'}" data-color="${item.color || '#EC407A'}">
          <div class="silk-select-item-left">
            ${item.icon ? `
              <span class="silk-select-badge" style="background: ${item.color || '#EC407A'}15; color: ${item.color || '#EC407A'};">
                ${getIconSvg(item.icon, { size: 14, color: item.color || '#EC407A' })}
              </span>
            ` : ''}
            <span>${item.label}</span>
          </div>
          ${item.value === value ? getIconSvg('check', { size: 14, color: '#EC407A' }) : ''}
        </div>
      `).join('');
    }

    return `
      <div class="silk-select-container ${isDropup ? 'silk-dropup' : ''}" id="container-select-${id}">
        <input type="hidden" name="${name}" id="input-${id}" value="${value}" />
        <div class="silk-select-trigger" data-silk-select="${id}" tabindex="0">
          <div class="trigger-content">
            <span class="trigger-icon" style="background: ${currentColor}15; color: ${currentColor};">
              ${getIconSvg(currentIcon, { size: 16, color: currentColor })}
            </span>
            <span class="trigger-label">${currentLabel}</span>
          </div>
          <span class="trigger-arrow">
            ${getIconSvg('chevron_down', { size: 18 })}
          </span>
        </div>
        <div class="silk-select-menu ${isDropup ? 'dropup' : ''}" id="menu-${id}">
          ${menuContent}
        </div>
      </div>
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

      const shiftTypeOptions = [
        { value: 'Sala de Parto', label: 'Sala de Parto (D+60 75% / D+90 25%)', icon: 'baby', color: '#EC407A' },
        { value: '12h Noturno', label: '12h Noturno (Plantão Noturno)', icon: 'moon', color: '#AB47BC' },
        { value: '12h Diurno', label: '12h Diurno (Plantão Diurno)', icon: 'sun', color: '#FFA726' },
        { value: '24h', label: '24h (Plantão 24 Horas)', icon: 'hospital', color: '#26A69A' },
        { value: 'Sobreaviso', label: 'Sobreaviso (Disponibilidade Médica)', icon: 'stethoscope', color: '#42A5F5' }
      ];

      const customShiftTypeSelect = this.renderCustomSelect({
        id: 'shift-type',
        name: 'shiftType',
        value: 'Sala de Parto',
        options: shiftTypeOptions,
        isDropup: false
      });

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
              ${customShiftTypeSelect}
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
            ✨ Divisão automática do plantão médico: <strong>75% em 2 meses (D+60)</strong> e <strong>25% em 3 meses (D+90)</strong>.
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
        const shiftType = fd.get('shiftType') || document.getElementById('input-shift-type')?.value || 'Sala de Parto';

        this.store.saveShift({
          hospital: fd.get('hospital'),
          date: fd.get('date'),
          shiftType,
          netValue: net,
          grossValue: gross
        });

        this.closeModal();
        this.showToast('Plantão registrado com sucesso! 🩺✨');
      };
    } else if (this.activeModalTab === 'expense') {
      const today = getLocalDateString();

      // Opções agrupadas pelos 6 Macro-Grupos com ícones e cores
      const groupedCategoryOptions = MACRO_GROUPS.map(mg => {
        const catItems = mg.categories.map(cName => {
          const cDef = this.store.data.categories.find(c => c.name === cName) || { icon: 'tag', color: mg.color };
          return {
            value: cName,
            label: cName,
            icon: cDef.icon || 'tag',
            color: cDef.color || mg.color
          };
        });
        return {
          groupName: mg.name,
          icon: mg.icon,
          color: mg.color,
          items: catItems
        };
      });

      const customCategorySelect = this.renderCustomSelect({
        id: 'expense-category',
        name: 'category',
        value: 'Mercantil',
        options: groupedCategoryOptions,
        grouped: true,
        isDropup: true // Dropup no formulário para ergonomia anti-crop
      });

      const installmentOptions = [
        { value: '2', label: '2x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '3', label: '3x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '4', label: '4x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '5', label: '5x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '6', label: '6x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '10', label: '10x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '12', label: '12x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '24', label: '24x Parcelas', icon: 'credit_card', color: '#8D6E63' }
      ];

      const customInstallmentSelect = this.renderCustomSelect({
        id: 'expense-installments',
        name: 'totalInstallments',
        value: '3',
        options: installmentOptions,
        isDropup: true
      });

      body.innerHTML = `
        <form id="form-new-expense">
          <div class="form-group">
            <label>Descrição do Gasto</label>
            <input type="text" name="description" class="form-input" placeholder="Ex: Supermercado, Aluguel, Farmácia" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoria (por Macro-Grupo)</label>
              ${customCategorySelect}
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
              ${customInstallmentSelect}
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
        const totalInstVal = fd.get('totalInstallments') || document.getElementById('input-expense-installments')?.value || '2';
        const totalInst = isInst ? parseInt(totalInstVal, 10) : 1;
        const categoryVal = fd.get('category') || document.getElementById('input-expense-category')?.value || 'Mercantil';

        this.store.saveExpense({
          description: fd.get('description'),
          category: categoryVal,
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

      const activeStatusOptions = [
        { value: 'true', label: 'Bolsa Ativa', icon: 'check', color: '#26A69A' },
        { value: 'false', label: 'Pausada', icon: 'close', color: '#FF7043' }
      ];

      const customActiveSelect = this.renderCustomSelect({
        id: 'salary-active',
        name: 'active',
        value: curSal.active ? 'true' : 'false',
        options: activeStatusOptions
      });

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
              ${customActiveSelect}
            </div>
          </div>

          <button type="submit" class="submit-btn">Atualizar Bolsa</button>
        </form>
      `;

      const form = document.getElementById('form-salary');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const activeVal = fd.get('active') || document.getElementById('input-salary-active')?.value || 'true';
        this.store.updateResidencySalary({
          value: fd.get('value'),
          dayOfMonth: fd.get('dayOfMonth'),
          active: activeVal === 'true'
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
