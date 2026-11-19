/**
 * Finanças Pediatria /v8/ - UI: Delegação de eventos globais (zero handlers inline)
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { formatDateBR } from '../store.js';
import { escapeHtml } from './helpers.js';

export class EventsMethods {
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
        this.selectedMicroFilter = 'all';
        this.renderExpensesView();
        return;
      }

      // 7b. Filtro por Subgrupo (micro) dentro do grupo escolhido
      const microFilterBtn = e.target.closest('[data-micro-filter]');
      if (microFilterBtn) {
        this.selectedMicroFilter = microFilterBtn.getAttribute('data-micro-filter');
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

          // 1) Pré-visualiza sem tocar nos dados atuais
          const preview = this.storage.previewBackup(text);
          if (!preview.success) {
            this.showToast(`Erro na restauração: ${preview.error}`, 'error');
            return;
          }

          // 2) Pede confirmação mostrando o que será substituído
          const cur = this.store.data;
          const nf = (n, one, many) => `${n} ${n === 1 ? one : many}`;
          const when = preview.exportedAt ? ` (gerado em ${formatDateBR(preview.exportedAt.slice(0, 10))})` : '';
          const ok = await this.confirmDialog({
            badge: 'Restaurar backup',
            title: 'Substituir os dados atuais?',
            message: `O arquivo${when} tem ${nf(preview.countShifts, 'plantão', 'plantões')} e ${nf(preview.countExpenses, 'despesa', 'despesas')}.\n\nSeus dados atuais (${nf((cur.shifts || []).length, 'plantão', 'plantões')} e ${nf((cur.expenses || []).length, 'despesa', 'despesas')}) serão substituídos. Logo após restaurar, você poderá desfazer.`,
            confirmLabel: 'Restaurar',
            cancelLabel: 'Cancelar',
            danger: true
          });
          if (!ok) return;

          // 3) Cópia de segurança do estado atual (IndexedDB) e importação
          await this.storage.saveSafetySnapshot(JSON.parse(JSON.stringify(cur)));
          const result = this.storage.importBackup(text, this.store);
          if (result.success) {
            const previous = result.previousState;
            this.render();
            this.showToastWithUndo(
              `Backup restaurado! ${nf(result.countShifts, 'plantão', 'plantões')} e ${nf(result.countExpenses, 'despesa', 'despesas')}.`,
              () => {
                this.store.init(previous);
                this.store.save();
                this.render();
                this.showToast('Restauração desfeita: seus dados anteriores voltaram.');
              },
              12000
            );
          } else {
            this.showToast(`Erro na restauração: ${result.error}`, 'error');
          }
        } catch (err) {
          this.showToast(`Falha ao ler arquivo: ${err.message}`, 'error');        } finally {
          fileInput.value = '';
        }
      });
    }

    // Tecla Escape fecha modais e gavetas
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeDrawer();
      } else if (e.key === 'Tab') {
        this._trapTab(e);
      }
    });
  }
}
