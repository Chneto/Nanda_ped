/**
 * Finanças Pediatria v5.0 - Application Controller (SPA)
 * Design System "Silk & Rose Gold"
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */

import {
  PediatricStore,
  formatCurrency,
  formatDateBR,
  getLocalDateString,
  addMonthsToDateString,
  DEFAULT_CATEGORIES,
  DEFAULT_HOSPITALS,
  MACRO_GROUPS,
  getMacroGroupForCategory,
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
    this.donutViewMode = 'macro'; // 'macro' | 'detailed'

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
      console.warn('Container #app-container não encontrado, buscando body');
      this.appEl = document.body;
    }
  }

  bindLifecycleEvents() {
    const persistHandler = () => {
      this.store.save();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', persistHandler);
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          persistHandler();
        }
      });
      window.addEventListener('beforeunload', persistHandler);
    }
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
      }
    });
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  }

  navigateMonth(direction) {
    const cur = this.store.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const newMonth = addMonthsToDateString(`${cur}-01`, direction).substring(0, 7);
    this.store.data.preferences.currentMonth = newMonth;
    this.store.save();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const cur = this.store.data.preferences.theme || 'light';
    const next = cur === 'light' ? 'dark' : 'light';
    this.store.data.preferences.theme = next;
    this.applyTheme(next);
    this.store.save();
    this.showToast(next === 'dark' ? 'Modo Veludo Escuro Ativado 🌙' : 'Modo Silk Claro Ativado ☀️');
  }

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  openDrawer() {
    const drawer = document.getElementById('drawer-menu');
    if (drawer) drawer.classList.add('open');
  }

  closeDrawer() {
    const drawer = document.getElementById('drawer-menu');
    if (drawer) drawer.classList.remove('open');
  }

  openModal(tab = 'shift') {
    this.activeModalTab = tab;
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  openModalWithHospital(hospitalName) {
    this.prefilledHospital = hospitalName;
    this.activeModalTab = 'shift';
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  closeModal() {
    const modal = document.getElementById('action-modal');
    if (modal) modal.classList.remove('open');
    this.prefilledHospital = '';
  }

  switchModalTab(tab) {
    this.activeModalTab = tab;
    this.renderModalContent();
  }

  handleExportBackup() {
    const jsonStr = this.store.exportBackup();
    if (navigator.share) {
      const file = new File([jsonStr], `backup_financas_pediatria_${getLocalDateString()}.json`, { type: 'application/json' });
      navigator.share({
        title: 'Backup Finanças Pediatria Dra. Fernanda Ch.',
        files: [file]
      }).catch(() => {
        this.store.triggerDirectBackupDownload();
      });
    } else {
      this.store.triggerDirectBackupDownload();
    }
    this.showToast('Backup gerado e salvo com sucesso! 📦');
  }

  handleTwoStageDataReset() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;

    modal.classList.add('open');
    const body = modal.querySelector('.modal-card-body');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'none';

    body.innerHTML = `
      <div style="text-align: center; padding: 10px 0;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: #FFEBEE; color: #D32F2F; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
          ${getIconSvg('trash', { size: 30, color: '#D32F2F' })}
        </div>
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
          Zerar Dados do Aplicativo
        </h3>
        <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 18px;">
          Um <strong>backup preventivo (.json)</strong> será baixado automaticamente para o seu dispositivo antes de qualquer exclusão.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="drawer-menu-item" id="btn-reset-transactions" style="justify-content: center; background: #FFF3E0; border-color: #FFE082; color: #E65100;">
            ${getIconSvg('receipt', { size: 18, color: '#E65100' })} Limpar Apenas Lançamentos (Mantém Perfil)
          </button>
          <button class="drawer-menu-item danger" id="btn-reset-factory" style="justify-content: center;">
            ${getIconSvg('trash', { size: 18, color: '#D32F2F' })} Restauração de Fábrica Total
          </button>
          <button class="submit-btn" id="btn-reset-cancel" style="background: var(--bg-card-subtle); color: var(--text-main); box-shadow: none; border: 1px solid var(--silk-border);">
            Cancelar
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-reset-transactions').onclick = () => {
      this.store.resetAllData({ keepProfile: true, downloadBackup: true });
      this.closeModal();
      this.showToast('Lançamentos zerados. Perfil da médica preservado! 🩺✨');
    };

    document.getElementById('btn-reset-factory').onclick = () => {
      this.store.resetAllData({ keepProfile: false, downloadBackup: true });
      this.closeModal();
      this.showToast('Aplicativo restaurado ao estado inicial com sucesso! 🌸');
    };

    document.getElementById('btn-reset-cancel').onclick = () => {
      this.closeModal();
    };
  }

  openProfileModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;

    modal.classList.add('open');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'none';

    const body = modal.querySelector('.modal-card-body');
    const doc = this.store.data;

    body.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            ${getIconSvg('user', { size: 22, color: '#EC407A' })} Perfil da Médica Pediatra
          </h3>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 22 })}
          </button>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;">
          <div class="avatar-badge" style="width: 80px; height: 80px; border-width: 3px; margin-bottom: 10px;">
            ${doc.doctorPhoto ? `<img src="${doc.doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 38, color: '#EC407A' })}
          </div>
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--primary-pink); cursor: pointer; display: flex; align-items: center; gap: 6px;">
            ${getIconSvg('camera', { size: 16, color: '#EC407A' })} Alterar Foto de Perfil
            <input type="file" id="doctor-photo-input" accept="image/*" style="display: none;" />
          </label>
        </div>

        <form id="form-doctor-profile">
          <div class="form-group">
            <label>Nome Completo da Médica</label>
            <input type="text" name="name" class="form-input" value="${doc.doctorName || 'Dra. Fernanda Ch.'}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Registro Profissional (CRM)</label>
              <input type="text" name="crm" class="form-input" value="${doc.doctorCRM || 'CRM/RN'}" required />
            </div>
            <div class="form-group">
              <label>Especialidade</label>
              <input type="text" name="specialty" class="form-input" value="${doc.doctorSpecialty || 'Pediatria & Sala de Parto'}" required />
            </div>
          </div>

          <button type="submit" class="submit-btn">Salvar Perfil</button>
        </form>
      </div>
    `;

    // Processamento de Foto com Compressão via Canvas
    const photoInput = document.getElementById('doctor-photo-input');
    if (photoInput) {
      photoInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const maxSize = 200;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > maxSize) {
                  height *= maxSize / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width *= maxSize / height;
                  height = maxSize;
                }
              }

              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);

              const compressedData = canvas.toDataURL('image/jpeg', 0.82);
              this.store.updateDoctorProfile({ photo: compressedData });
              this.openProfileModal();
              this.showToast('Foto de perfil atualizada! 🌸');
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
    }

    const form = document.getElementById('form-doctor-profile');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        this.store.updateDoctorProfile({
          name: fd.get('name'),
          crm: fd.get('crm'),
          specialty: fd.get('specialty')
        });
        this.closeModal();
        this.showToast('Perfil da médica salvo com sucesso! 🩺✨');
      };
    }
  }

  openCategoriesModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;

    modal.classList.add('open');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'none';

    const body = modal.querySelector('.modal-card-body');

    let groupsHtml = '';
    MACRO_GROUPS.forEach(mg => {
      let subcatsHtml = '';
      mg.categories.forEach(cName => {
        const catDef = this.store.data.categories.find(c => c.name === cName) || { icon: 'tag', color: mg.color };
        subcatsHtml += `
          <div class="macro-subcat-item">
            <span class="macro-subcat-icon" style="background: ${catDef.color}15; color: ${catDef.color};">
              ${getIconSvg(catDef.icon || 'tag', { size: 14, color: catDef.color })}
            </span>
            <span class="macro-subcat-name">${cName}</span>
          </div>
        `;
      });

      groupsHtml += `
        <div class="macro-category-card" style="border-left: 4px solid ${mg.color}; margin-bottom: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-sm); padding: 12px 14px; border-top: 1px solid var(--silk-border); border-right: 1px solid var(--silk-border); border-bottom: 1px solid var(--silk-border);">
          <div class="macro-category-header" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; border-radius: var(--radius-pill); background: ${mg.color}18; color: ${mg.color}; display: flex; align-items: center; justify-content: center;">
                ${getIconSvg(mg.icon, { size: 18, color: mg.color })}
              </div>
              <div>
                <h4 style="font-family: var(--font-heading); font-size: 0.94rem; font-weight: 700; color: var(--text-main); margin: 0;">${mg.name}</h4>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">${mg.categories.length} Categorias Pediátricas</span>
              </div>
            </div>
            <button class="section-action-btn" data-filter-macro-from-modal="${mg.id}" style="font-size: 0.72rem; padding: 4px 10px;">
              Ver Extrato
            </button>
          </div>
          <div class="macro-subcat-list" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--silk-border);">
            ${subcatsHtml}
          </div>
        </div>
      `;
    });

    body.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0;">
              Macro-Grupos de Despesas
            </h3>
            <p style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
              Organização inspirada no Nubank & Revolut com as 22 categorias obrigatórias
            </p>
          </div>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 22 })}
          </button>
        </div>

        <div style="max-height: 60vh; overflow-y: auto; padding-right: 4px;">
          ${groupsHtml}
        </div>
      </div>
    `;
  }

  openHubModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;

    modal.classList.add('open');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'none';

    const body = modal.querySelector('.modal-card-body');
    const currentMonth = this.store.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const summary = this.store.getMonthlySummary(currentMonth);

    body.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            ${getIconSvg('calendar', { size: 22, color: '#EC407A' })} Calendário & Previsão Mensal
          </h3>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 22 })}
          </button>
        </div>

        <div id="hub-calendar-container" style="margin-bottom: 16px;"></div>

        <div id="hub-net-result-container"></div>
      </div>
    `;

    renderMonthCalendarVisual('hub-calendar-container', currentMonth, this.store.data.shifts, this.store.data.expenses);
    renderNetBalanceVisual('hub-net-result-container', summary, this.store.formatMonthLabel(currentMonth));
  }

  renderCustomSelect({ id, name, value = '', options = [], grouped = false, isDropup = false }) {
    let triggerLabel = 'Selecione...';
    let triggerIcon = '';
    let triggerColor = '#EC407A';

    let itemsHtml = '';
    if (!grouped) {
      options.forEach(opt => {
        const isSelected = String(opt.value) === String(value);
        if (isSelected) {
          triggerLabel = opt.label;
          triggerIcon = opt.icon || '';
          triggerColor = opt.color || '#EC407A';
        }
        itemsHtml += `
          <div class="silk-select-item ${isSelected ? 'selected' : ''}" data-value="${opt.value}" data-label="${opt.label}" data-icon="${opt.icon || ''}" data-color="${opt.color || ''}">
            ${opt.icon ? `<span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: ${opt.color || '#EC407A'}18; color: ${opt.color || '#EC407A'};">${getIconSvg(opt.icon, { size: 14, color: opt.color || '#EC407A' })}</span>` : ''}
            <span>${opt.label}</span>
          </div>
        `;
      });
    } else {
      options.forEach(group => {
        itemsHtml += `
          <div class="silk-select-group-header" style="color: ${group.color || '#EC407A'};">
            ${group.icon ? getIconSvg(group.icon, { size: 14, color: group.color }) : ''}
            <span>${group.groupName}</span>
          </div>
        `;
        group.items.forEach(opt => {
          const isSelected = String(opt.value) === String(value);
          if (isSelected) {
            triggerLabel = opt.label;
            triggerIcon = opt.icon || '';
            triggerColor = opt.color || '#EC407A';
          }
          itemsHtml += `
            <div class="silk-select-item ${isSelected ? 'selected' : ''}" data-value="${opt.value}" data-label="${opt.label}" data-icon="${opt.icon || ''}" data-color="${opt.color || ''}" style="padding-left: 20px;">
              ${opt.icon ? `<span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: ${opt.color || '#EC407A'}15; color: ${opt.color || '#EC407A'};">${getIconSvg(opt.icon, { size: 12, color: opt.color || '#EC407A' })}</span>` : ''}
              <span>${opt.label}</span>
            </div>
          `;
        });
      });
    }

    return `
      <div class="silk-select-container ${isDropup ? 'is-dropup' : ''}" id="container-select-${id}">
        <input type="hidden" name="${name}" id="input-${id}" value="${value}" />
        <div class="silk-select-trigger" id="trigger-select-${id}">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="trigger-icon" style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: ${triggerColor}18; color: ${triggerColor};">
              ${triggerIcon ? getIconSvg(triggerIcon, { size: 14, color: triggerColor }) : ''}
            </span>
            <span class="trigger-label">${triggerLabel}</span>
          </div>
          ${getIconSvg('chevron_down', { size: 16, color: '#A59BAE' })}
        </div>
        <div class="silk-select-menu" id="menu-select-${id}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  render() {
    if (!this.appEl) return;

    const currentMonth = this.store.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const summary = this.store.getMonthlySummary(currentMonth);
    const doc = this.store.data;
    const isCaixa = (doc.preferences.regime || 'caixa') === 'caixa';

    // 1. Cabeçalho com Saudação, Foto e Menu Hambúrguer
    const headerHtml = `
      <header class="app-header">
        <div class="doctor-greeting" id="btn-header-profile" title="Ver Perfil">
          <div class="avatar-badge">
            ${doc.doctorPhoto ? `<img src="${doc.doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 24, color: '#EC407A' })}
          </div>
          <div class="greeting-text">
            <h1>${doc.doctorName || 'Dra. Fernanda Ch.'}</h1>
            <p>${doc.doctorSpecialty || 'Pediatria & Sala de Parto'} • ${doc.doctorCRM || 'CRM/RN'}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn hamburger-btn" id="btn-hamburger-menu" title="Menu Principal">
            ${getIconSvg('menu', { size: 22, color: '#EC407A' })}
          </button>
        </div>
      </header>
    `;

    // 2. Barra de Navegação de Mês
    const monthBarHtml = `
      <div class="month-selector-bar">
        <button class="nav-month-btn" id="btn-prev-month" title="Mês Anterior">
          ${getIconSvg('chevron_left', { size: 20 })}
        </button>
        <div class="month-label-display">
          <span class="month-title">${this.store.formatMonthLabel(currentMonth)}</span>
          <span class="month-year-badge">${isCaixa ? 'Regime de Caixa' : 'Regime de Competência'}</span>
        </div>
        <button class="nav-month-btn" id="btn-next-month" title="Próximo Mês">
          ${getIconSvg('chevron_right', { size: 20 })}
        </button>
      </div>
    `;

    // 3. Seletor de Regime
    const regimeToggleHtml = `
      <div class="regime-toggle-wrapper">
        <button class="regime-btn ${isCaixa ? 'active' : ''}" data-regime="caixa">
          ${getIconSvg('wallet', { size: 16 })} Regime de Caixa (Entradas Reais)
        </button>
        <button class="regime-btn ${!isCaixa ? 'active' : ''}" data-regime="competencia">
          ${getIconSvg('stethoscope', { size: 16 })} Competência (Produção)
        </button>
      </div>
    `;

    // 4. Chips de Maternidade (Acesso Rápido)
    const quickHospitalsHtml = `
      <div class="quick-hospitals-bar">
        <button class="quick-hospital-chip highlight" data-quick-hospital="Maternidade Araken">
          ${getIconSvg('hospital', { size: 15, color: '#EC407A' })}
          + Araken
        </button>
        <button class="quick-hospital-chip highlight" data-quick-hospital="Maternidade Leide Morais">
          ${getIconSvg('hospital', { size: 15, color: '#EC407A' })}
          + Leide Morais
        </button>
        <button class="quick-hospital-chip" data-quick-hospital="MEJEC">
          + MEJEC
        </button>
        <button class="quick-hospital-chip" data-quick-hospital="Hospital da Criança">
          + Hosp. da Criança
        </button>
      </div>
    `;

    // 5. Botões de Lançamento Rápido Direto
    const quickActionsRowHtml = `
      <div class="quick-actions-row">
        <button class="quick-action-btn coral" id="btn-quick-add-expense">
          ${getIconSvg('cart', { size: 18, color: '#FFFFFF' })}
          + Nova Despesa
        </button>
        <button class="quick-action-btn pink" id="btn-quick-add-shift">
          ${getIconSvg('stethoscope', { size: 18, color: '#FFFFFF' })}
          + Novo Plantão
        </button>
      </div>
    `;

    // 6. Conteúdo Dinâmico das Abas
    let tabContentHtml = '';
    if (this.currentTab === 'home') {
      tabContentHtml = this.renderHomeTab(summary, currentMonth, isCaixa);
    } else if (this.currentTab === 'income') {
      tabContentHtml = this.renderIncomeTab(summary, currentMonth, isCaixa);
    } else if (this.currentTab === 'expenses') {
      tabContentHtml = this.renderExpensesTab(summary, currentMonth);
    }

    // 7. Barra Inferior de Navegação Fixa
    const bottomNavHtml = `
      <nav class="bottom-nav-bar">
        <button class="nav-tab-btn ${this.currentTab === 'home' ? 'active' : ''}" data-tab="home">
          ${getIconSvg('home', { size: 22, color: this.currentTab === 'home' ? '#EC407A' : '#7E7485' })}
          <span>Início</span>
        </button>
        <button class="nav-tab-btn ${this.currentTab === 'income' ? 'active' : ''}" data-tab="income">
          ${getIconSvg('payments', { size: 22, color: this.currentTab === 'income' ? '#EC407A' : '#7E7485' })}
          <span>Ganhos</span>
        </button>
        <button class="floating-add-btn" id="fab-add-btn" title="Novo Lançamento">
          ${getIconSvg('add', { size: 28, color: '#FFFFFF' })}
        </button>
        <button class="nav-tab-btn ${this.currentTab === 'expenses' ? 'active' : ''}" data-tab="expenses">
          ${getIconSvg('receipt', { size: 22, color: this.currentTab === 'expenses' ? '#EC407A' : '#7E7485' })}
          <span>Despesas</span>
        </button>
        <button class="nav-tab-btn" id="btn-nav-hub" onclick="window.app.openHubModal()">
          ${getIconSvg('calendar', { size: 22, color: '#7E7485' })}
          <span>Agenda</span>
        </button>
      </nav>
    `;

    // 8. Drawer Lateral Hambúrguer
    const drawerHtml = `
      <div class="drawer-overlay" id="drawer-menu">
        <div class="drawer-card">
          <div class="drawer-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="avatar-badge" style="width: 42px; height: 42px;">
                ${doc.doctorPhoto ? `<img src="${doc.doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 22, color: '#EC407A' })}
              </div>
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin: 0;">${doc.doctorName}</h3>
                <span style="font-size: 0.74rem; color: var(--text-muted);">${doc.doctorSpecialty}</span>
              </div>
            </div>
            <button class="icon-btn" id="btn-close-drawer">
              ${getIconSvg('close', { size: 20 })}
            </button>
          </div>

          <div class="drawer-menu-list">
            <button class="drawer-menu-item" id="drawer-item-profile">
              ${getIconSvg('user', { size: 18, color: '#EC407A' })} Editar Perfil da Médica
            </button>
            <button class="drawer-menu-item" id="drawer-item-categories">
              ${getIconSvg('tag', { size: 18, color: '#AB47BC' })} 6 Macro-Grupos de Despesas
            </button>
            <button class="drawer-menu-item" id="drawer-item-hub">
              ${getIconSvg('calendar', { size: 18, color: '#26A69A' })} Calendário & Previsão de Caixa
            </button>
            <button class="drawer-menu-item" id="drawer-item-theme">
              ${getIconSvg(doc.preferences.theme === 'dark' ? 'sun' : 'moon', { size: 18, color: '#FFA726' })}
              ${doc.preferences.theme === 'dark' ? 'Modo Claro (Silk)' : 'Modo Escuro (Veludo)'}
            </button>
            
            <div style="height: 1px; background: var(--silk-border); margin: 8px 0;"></div>

            <button class="drawer-menu-item" id="drawer-item-backup">
              ${getIconSvg('download', { size: 18, color: '#42A5F5' })} Fazer Backup ("Salvar no iPhone")
            </button>
            <button class="drawer-menu-item" id="drawer-item-restore">
              ${getIconSvg('upload', { size: 18, color: '#7E57C2' })} Restaurar Arquivo de Backup
            </button>
            <input type="file" id="backup-file-input" accept=".json,application/json" style="display: none;" />

            <div style="height: 1px; background: var(--silk-border); margin: 8px 0;"></div>

            <button class="drawer-menu-item danger" id="drawer-item-reset">
              ${getIconSvg('trash', { size: 18, color: '#D32F2F' })} Zerar Dados (Com Backup Prévio)
            </button>
          </div>

          <div class="drawer-footer">
            <p>Finanças Pediatria v${APP_VERSION} • Silk & Rose Gold</p>
            <p>Desenvolvido com carinho por <span class="creator-tag">${APP_CREATOR}</span></p>
          </div>
        </div>
      </div>
    `;

    // 9. Modal Central Unificado
    const modalHtml = `
      <div class="modal-overlay" id="action-modal">
        <div class="modal-card">
          <div class="modal-handle-bar"></div>
          <div class="modal-tabs-header">
            <button class="modal-tab-btn ${this.activeModalTab === 'shift' ? 'active' : ''}" data-modal-tab="shift">
              Plantão Médico
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'expense' ? 'active' : ''}" data-modal-tab="expense">
              Nova Despesa
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'salary' ? 'active' : ''}" data-modal-tab="salary">
              Bolsa Residência
            </button>
          </div>
          <div class="modal-card-body">
            <!-- Conteúdo injetado via renderModalContent -->
          </div>
        </div>
      </div>
    `;

    this.appEl.innerHTML = `
      ${headerHtml}
      ${monthBarHtml}
      ${regimeToggleHtml}
      ${quickHospitalsHtml}
      ${quickActionsRowHtml}
      <main class="app-main-content">
        ${tabContentHtml}
      </main>
      ${bottomNavHtml}
      ${drawerHtml}
      ${modalHtml}
    `;

    // Executa renderização dos gráficos após montar o DOM
    this.postRenderCharts(summary, currentMonth);
  }

  renderHomeTab(summary, currentMonth, isCaixa) {
    const heroValue = isCaixa ? summary.netCashBalance : summary.netAccrualBalance;
    const heroInflow = isCaixa ? summary.totalCashInflow : summary.totalAccrualIncome;
    const heroExpenses = summary.totalExpenses;

    return `
      <!-- Hero Balance Card -->
      <section class="hero-balance-card">
        <span class="hero-balance-tag">
          ${getIconSvg('sparkles', { size: 14, color: '#EC407A' })}
          ${isCaixa ? 'Saldo Líquido em Caixa (Mês)' : 'Produção Líquida (Competência)'}
        </span>
        <div class="hero-main-value">
          ${formatCurrency(heroValue)}
        </div>
        <div class="hero-sub-stats">
          <div class="hero-stat-box">
            <span class="hero-stat-label">
              ${getIconSvg('trending_up', { size: 14, color: '#00897B' })}
              ${isCaixa ? 'Entradas (Bolsa + D+60/90)' : 'Produção do Mês'}
            </span>
            <span class="hero-stat-val mint">${formatCurrency(heroInflow)}</span>
          </div>
          <div class="hero-stat-box">
            <span class="hero-stat-label">
              ${getIconSvg('receipt', { size: 14, color: '#F4511E' })}
              Despesas do Mês
            </span>
            <span class="hero-stat-val coral">${formatCurrency(heroExpenses)}</span>
          </div>
        </div>
      </section>

      <!-- Gráfico de Rosca das Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('pie_chart', { size: 18, color: '#EC407A' })} Despesas por Macro-Grupos</h2>
          <button class="section-action-btn" onclick="window.app.switchTab('expenses')">Ver Todas</button>
        </div>
        <div id="home-donut-chart-container"></div>
      </section>

      <!-- Gráfico de Previsão de 6 Meses -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('trending_up', { size: 18, color: '#26A69A' })} Previsão de Fluxo de Caixa (6 Meses)</h2>
        </div>
        <div id="home-forecast-chart-container"></div>
      </section>

      <!-- Comparativo Caixa Real vs Produção Represada -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('wallet', { size: 18, color: '#AB47BC' })} Caixa Disponível vs Represado</h2>
        </div>
        <div id="home-comparison-container"></div>
      </section>
    `;
  }

  renderIncomeTab(summary, currentMonth, isCaixa) {
    const salary = this.store.data.residencySalary;
    
    // Plantões relevantes para o mês
    let relevantShifts = [];
    if (isCaixa) {
      relevantShifts = this.store.data.shifts.filter(s =>
        s.installments.some(inst => inst.targetMonth === currentMonth)
      );
    } else {
      relevantShifts = this.store.data.shifts.filter(s => s.date.startsWith(currentMonth));
    }

    let shiftsHtml = '';
    if (relevantShifts.length === 0) {
      shiftsHtml = `
        <div class="empty-chart-state" style="padding: 24px; text-align: center; color: var(--text-muted);">
          ${getIconSvg('stethoscope', { size: 34, color: '#E8A598' })}
          <p class="empty-text" style="font-weight: 700; margin-top: 8px;">Nenhum plantão registrado para este mês</p>
          <span class="empty-sub" style="font-size: 0.78rem;">Toque em "+ Novo Plantão" para lançar</span>
        </div>
      `;
    } else {
      shiftsHtml = relevantShifts.map(s => {
        const inst1 = s.installments.find(i => i.num === 1);
        const inst2 = s.installments.find(i => i.num === 2);

        return `
          <div class="shift-item-card">
            <div class="shift-header-row">
              <div>
                <h3 class="shift-hospital">${s.hospital}</h3>
                <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 500;">Plantão trabalhado em ${formatDateBR(s.date)}</span>
              </div>
              <div style="text-align: right; display: flex; align-items: center; gap: 8px;">
                <span class="shift-type-badge">${s.shiftType}</span>
                <button class="expense-del-btn" data-delete-shift="${s.id}" title="Excluir Plantão">
                  ${getIconSvg('trash', { size: 16 })}
                </button>
              </div>
            </div>

            <div class="shift-dates-row">
              <span>Produção Líquida Total: <strong>${formatCurrency(s.totalNetValue)}</strong></span>
            </div>

            <div class="shift-installments-box">
              <!-- Parcela 1: 75% em D+60 -->
              <div class="inst-pill">
                <div class="inst-pill-top">
                  <span>1ª Parcela (75%)</span>
                  <span>Previsto: ${inst1.targetMonth}</span>
                </div>
                <div class="inst-val">${formatCurrency(inst1.value)}</div>
                <button
                  class="inst-status-btn ${inst1.status}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="1"
                >
                  ${inst1.status === 'received' ? '✓ Recebido' : '⏳ Pendente (D+60)'}
                </button>
              </div>

              <!-- Parcela 2: 25% em D+90 -->
              <div class="inst-pill">
                <div class="inst-pill-top">
                  <span>2ª Parcela (25%)</span>
                  <span>Previsto: ${inst2.targetMonth}</span>
                </div>
                <div class="inst-val">${formatCurrency(inst2.value)}</div>
                <button
                  class="inst-status-btn ${inst2.status}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="2"
                >
                  ${inst2.status === 'received' ? '✓ Recebido' : '⏳ Pendente (D+90)'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <!-- Card da Bolsa Residência -->
      <section class="card-section" style="background: var(--hero-gradient); border-color: var(--rose-gold);">
        <div class="section-header">
          <h2>${getIconSvg('payments', { size: 18, color: '#EC407A' })} Bolsa Residência Médica</h2>
          <button class="section-action-btn" onclick="window.app.openModal('salary')">Editar</button>
        </div>
        <div style="display: flex; align-items: baseline; justify-content: space-between;">
          <div>
            <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--text-main);">
              ${salary.active ? formatCurrency(salary.value) : 'Pausada'}
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
              ${salary.active ? `Crédito regular todo dia ${salary.dayOfMonth || 5} do mês` : 'Bolsa temporariamente inativa'}
            </span>
          </div>
          <span class="shift-type-badge" style="background: #E8F5E9; color: #2E7D32;">
            ${salary.active ? 'Ativa' : 'Inativa'}
          </span>
        </div>
      </section>

      <!-- Lista de Plantões do Mês -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('stethoscope', { size: 18, color: '#EC407A' })} Plantões em Sala de Parto</h2>
          <button class="section-action-btn" id="btn-add-shift-quick">+ Novo Plantão</button>
        </div>
        ${shiftsHtml}
      </section>
    `;
  }

  renderExpensesTab(summary, currentMonth) {
    const expenses = summary.expensesList || [];
    
    // Filtro por Macro-Grupo se selecionado
    let filteredExpenses = expenses;
    if (this.activeExpenseFilter !== 'all') {
      filteredExpenses = expenses.filter(e => e.macroGroupId === this.activeExpenseFilter);
    }

    let expListHtml = '';
    if (filteredExpenses.length === 0) {
      expListHtml = `
        <div class="empty-chart-state" style="padding: 24px; text-align: center; color: var(--text-muted);">
          ${getIconSvg('cart', { size: 34, color: '#E8A598' })}
          <p class="empty-text" style="font-weight: 700; margin-top: 8px;">Nenhuma despesa para exibir neste filtro</p>
          <span class="empty-sub" style="font-size: 0.78rem;">Toque em "+ Nova Despesa" para registrar</span>
        </div>
      `;
    } else {
      expListHtml = filteredExpenses.map(e => {
        const catDef = this.store.data.categories.find(c => c.name === e.category) || { icon: 'tag', color: '#FF7043' };
        return `
          <div class="expense-item-row">
            <div class="expense-left">
              <div class="expense-icon-badge" style="background-color: ${catDef.color}15; color: ${catDef.color};">
                ${getIconSvg(catDef.icon, { size: 18, color: catDef.color })}
              </div>
              <div>
                <h4 class="expense-desc">${e.description}</h4>
                <span class="expense-cat-sub">${e.category} • ${formatDateBR(e.date)}</span>
              </div>
            </div>
            <div class="expense-right">
              <div class="expense-val">- ${formatCurrency(e.value)}</div>
              <button class="expense-del-btn" data-delete-expense="${e.id}" title="Excluir Despesa">
                ${getIconSvg('trash', { size: 16 })}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Filtros de Macro-Grupos
    const filterChipsHtml = `
      <div class="quick-hospitals-bar" style="margin: 0 0 14px 0;">
        <button class="quick-hospital-chip ${this.activeExpenseFilter === 'all' ? 'highlight' : ''}" data-macro-filter="all">
          Todos (${expenses.length})
        </button>
        ${MACRO_GROUPS.map(mg => {
          const count = expenses.filter(e => e.macroGroupId === mg.id).length;
          return `
            <button class="quick-hospital-chip ${this.activeExpenseFilter === mg.id ? 'highlight' : ''}" data-macro-filter="${mg.id}">
              ${getIconSvg(mg.icon, { size: 14, color: mg.color })}
              ${mg.name} (${count})
            </button>
          `;
        }).join('')}
      </div>
    `;

    return `
      <!-- Rosca de Despesas da Aba -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('pie_chart', { size: 18, color: '#FF7043' })} Distribuição de Gastos</h2>
          <button class="section-action-btn" id="btn-add-expense-quick">+ Nova Despesa</button>
        </div>
        <div id="expenses-tab-donut-container"></div>
      </section>

      <!-- Lista e Filtro de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('receipt', { size: 18, color: '#EC407A' })} Extrato de Gastos</h2>
          <button class="section-action-btn" data-macro-filter="all" style="font-size: 0.72rem; padding: 4px 8px;">Limpar Filtro</button>
        </div>
        ${filterChipsHtml}
        <div class="expenses-list-box">
          ${expListHtml}
        </div>
      </section>
    `;
  }

  postRenderCharts(summary, currentMonth) {
    if (this.currentTab === 'home') {
      const breakdown = this.donutViewMode === 'macro'
        ? this.store.getMacroGroupSummary(currentMonth)
        : this.store.getCategorySummary(currentMonth);

      renderDonutExpenses('home-donut-chart-container', breakdown, summary.totalExpenses, this.donutViewMode, (newMode) => {
        this.donutViewMode = newMode;
        this.render();
      });

      const forecast = this.store.get6MonthForecast(currentMonth);
      renderForecastChart('home-forecast-chart-container', forecast);

      const isCaixa = (this.store.data.preferences.regime || 'caixa') === 'caixa';
      const caixaReal = summary.totalCashInflow;
      const producaoRepresada = Math.max(0, summary.totalWorkedProduction - summary.shiftInflowExpected);
      renderComparisonVisual('home-comparison-container', caixaReal, producaoRepresada, this.store.formatMonthLabel(currentMonth));
    } else if (this.currentTab === 'expenses') {
      const breakdown = this.donutViewMode === 'macro'
        ? this.store.getMacroGroupSummary(currentMonth)
        : this.store.getCategorySummary(currentMonth);

      renderDonutExpenses('expenses-tab-donut-container', breakdown, summary.totalExpenses, this.donutViewMode, (newMode) => {
        this.donutViewMode = newMode;
        this.render();
      });
    }
  }

  renderModalContent() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    const body = modal.querySelector('.modal-card-body');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'flex';

    if (this.activeModalTab === 'shift') {
      const today = getLocalDateString();
      const defaultHospital = this.prefilledHospital || 'Maternidade Araken';

      const shiftTypeOptions = [
        { value: 'Sala de Parto', label: 'Sala de Parto (Padrão Pediátrico)', icon: 'baby', color: '#EC407A' },
        { value: '12h Noturno', label: '12h Noturno (Plantão Noturno)', icon: 'moon', color: '#AB47BC' },
        { value: '12h Diurno', label: '12h Diurno (Plantão Diurno)', icon: 'sun', color: '#FFA726' },
        { value: '24h', label: '24h (Plantão 24 Horas)', icon: 'hospital', color: '#26A69A' },
        { value: 'UTI Neonatal', label: 'UTI Neonatal', icon: 'stethoscope', color: '#42A5F5' }
      ];

      const customShiftTypeSelect = this.renderCustomSelect({
        id: 'shift-type',
        name: 'shiftType',
        value: 'Sala de Parto',
        options: shiftTypeOptions,
        isDropup: true
      });

      body.innerHTML = `
        <form id="form-new-shift">
          <div class="form-group">
            <label>Maternidade / Hospital</label>
            <input type="text" id="shift-hospital-input" name="hospital" class="form-input" value="${defaultHospital}" placeholder="Ex: Maternidade Araken" required />
            <div style="display: flex; gap: 6px; margin-top: 6px; overflow-x: auto; padding-bottom: 2px;">
              ${DEFAULT_HOSPITALS.map(h => `
                <button type="button" class="quick-hospital-chip modal-hosp-pill ${h === defaultHospital ? 'selected' : ''}" data-modal-hosp="${h}" style="font-size: 0.74rem; padding: 4px 10px;">
                  ${h}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data do Plantão</label>
              <input type="date" name="date" class="form-input" value="${today}" required />
            </div>
            <div class="form-group">
              <label>Valor Líquido Total (R$)</label>
              <input type="number" step="0.01" name="value" class="form-input" placeholder="Ex: 1950.00" required />
            </div>
          </div>

          <div class="form-group">
            <label>Tipo de Plantão</label>
            ${customShiftTypeSelect}
          </div>

          <div style="background: var(--bg-card-subtle); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--silk-border); margin-bottom: 14px; font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
            ✨ Divisão automática do plantão médico: <strong>75% em 2 meses (D+60)</strong> e <strong>25% em 3 meses (D+90)</strong>.
          </div>

          <button type="submit" class="submit-btn">Salvar Plantão</button>
        </form>
      `;

      const form = document.getElementById('form-new-shift');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const shiftType = fd.get('shiftType') || document.getElementById('input-shift-type')?.value || 'Sala de Parto';

        this.store.saveShift({
          hospital: fd.get('hospital'),
          date: fd.get('date'),
          value: parseFloat(fd.get('value')) || 0,
          shiftType
        });

        this.closeModal();
        this.showToast('Plantão registrado com sucesso! 🩺✨');
      };
    } else if (this.activeModalTab === 'expense') {
      const today = getLocalDateString();

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
        isDropup: true
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

// Inicialização resiliente e autônoma no navegador
function initPediatricApp() {
  if (typeof window !== 'undefined' && !window.app) {
    window.app = new PediatricApp();
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPediatricApp);
  } else {
    initPediatricApp();
  }
  window.addEventListener('load', initPediatricApp);
}
