/**
 * Finanças Pediatria /v8/ - UI: Modal de despesa (nova, parcelada e edição em 1 toque)
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { getLocalDateString } from '../store.js';
import { escapeHtml } from './helpers.js';

export class ExpenseModalMethods {
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
}
