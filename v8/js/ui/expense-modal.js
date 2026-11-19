/**
 * Finanças Pediatria /v8/ - UI: Modal de despesa (nova, parcelada e edição em 1 toque)
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { getLocalDateString } from '../store.js';
import { getIconSvg } from '../icons.js';
import { escapeHtml } from './helpers.js';
import { buildCategoryTree, filterCategoryTree, getQuickCategories, renderTreeHtml, renderQuickHtml, renderTriggerHtml } from './category-picker.js';

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
    // Seletor em grupos (macro) e subgrupos (micro); o <select> nativo continua como fonte do valor do formulário
    const tree = buildCategoryTree(categories);
    const selectedCat = categories.find(c => c.name === defaultCat) || null;
    const selectedMacro = tree.find(t => t.subgroups.some(s => s.categories.some(c => c.name === defaultCat)));
    const quickChipsHtml = renderQuickHtml(getQuickCategories(this.store.data.expenses, categories), defaultCat);
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

      <div class="form-group cat-picker" id="exp-cat-picker">
        <label id="exp-category-label" for="exp-category-trigger">Categoria de Despesa</label>
        <select id="exp-category-input" name="category" class="cat-native-select" tabindex="-1" aria-hidden="true">
          ${categories.map(c => `
            <option value="${escapeHtml(c.name)}" ${c.name === defaultCat ? 'selected' : ''}>${escapeHtml(c.name)}</option>
          `).join('')}
        </select>
        <button type="button" id="exp-category-trigger" class="cat-trigger" aria-expanded="false" aria-controls="exp-category-panel">
          <span class="cat-trigger-main">${renderTriggerHtml(selectedCat, selectedMacro?.name)}</span>
          <span class="cat-chevron" aria-hidden="true">${getIconSvg('chevron_down', { size: 18 })}</span>
        </button>
        <div class="cat-quick-row" id="exp-cat-chips-container" aria-label="Categorias mais usadas">
          ${quickChipsHtml}
        </div>
        <div id="exp-category-panel" class="cat-panel hidden" role="group" aria-label="Escolher categoria de despesa">
          <input type="search" id="exp-cat-search" class="form-input silk-input cat-search" placeholder="Buscar categoria…" autocomplete="off" aria-label="Buscar categoria" />
          <div id="exp-cat-tree" class="cat-tree">${renderTreeHtml(tree, defaultCat)}</div>
          <p id="exp-cat-empty" class="cat-empty hidden">Nenhuma categoria encontrada. Tente outra palavra.</p>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="exp-amount-input">Valor (R$)</label>
          <input 
            type="number" inputmode="decimal" 
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

    // ---- Seletor de categoria (grupos > subgrupos) ----
    const catSelect = form.querySelector('#exp-category-input');
    const trigger = form.querySelector('#exp-category-trigger');
    const panel = form.querySelector('#exp-category-panel');
    const treeEl = form.querySelector('#exp-cat-tree');
    const searchEl = form.querySelector('#exp-cat-search');
    const emptyEl = form.querySelector('#exp-cat-empty');
    const quickEl = form.querySelector('#exp-cat-chips-container');

    const setPanelOpen = (open) => {
      panel.classList.toggle('hidden', !open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      trigger.classList.toggle('open', open);
      if (open) {
        // Painel se expande no fluxo do modal (sem posição absoluta) e o item escolhido fica visível
        const sel = treeEl.querySelector('.cat-tile.selected');
        if (sel && typeof sel.scrollIntoView === 'function') sel.scrollIntoView({ block: 'nearest' });
      }
    };

    const renderTree = () => {
      const q = searchEl.value;
      const filtered = filterCategoryTree(tree, q);
      treeEl.innerHTML = renderTreeHtml(filtered, catSelect.value, { expandAll: Boolean(q.trim()) });
      emptyEl.classList.toggle('hidden', filtered.length > 0);
    };

    const chooseCategory = (name, src) => {
      const cat = categories.find(c => c.name === name);
      if (!cat) return;
      catSelect.value = cat.name;
      const macro = tree.find(t => t.subgroups.some(s => s.categories.some(c => c.name === cat.name)));
      trigger.querySelector('.cat-trigger-main').innerHTML = renderTriggerHtml(cat, macro?.name);
      quickEl.querySelectorAll('.cat-quick').forEach(b => b.classList.toggle('selected', b.getAttribute('data-cat-chip') === cat.name));
      renderTree();

      const defAmt = parseFloat(src.getAttribute('data-default-amount'));
      const amtInput = form.querySelector('#exp-amount-input');
      if (amtInput && defAmt > 0 && !amtInput.value) {
        amtInput.value = defAmt.toFixed(2);
      }
    };

    trigger.addEventListener('click', () => setPanelOpen(panel.classList.contains('hidden')));

    panel.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-cat-macro-toggle]');
      if (toggle) {
        const section = toggle.closest('.cat-macro');
        const open = !section.classList.contains('open');
        // Sanfona: abrir um grupo recolhe os demais (lista curta e fácil de percorrer)
        panel.querySelectorAll('.cat-macro').forEach(s => {
          const shouldOpen = s === section ? open : false;
          s.classList.toggle('open', shouldOpen);
          s.querySelector('[data-cat-macro-toggle]').setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
          const body = s.querySelector('.cat-macro-body');
          if (shouldOpen) body.removeAttribute('hidden'); else body.setAttribute('hidden', '');
        });
        if (open && typeof section.scrollIntoView === 'function') section.scrollIntoView({ block: 'nearest' });
        return;
      }
      const tile = e.target.closest('[data-cat-pick]');
      if (tile) {
        chooseCategory(tile.getAttribute('data-cat-pick'), tile);
        setPanelOpen(false);
        trigger.focus();
      }
    });

    searchEl.addEventListener('input', renderTree);

    // Esc fecha só a lista (não o modal inteiro)
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setPanelOpen(false);
        trigger.focus();
      }
    });

    // Atalhos "mais usadas": 1 toque preenche categoria e valor padrão
    quickEl.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cat-chip]');
      if (chip) chooseCategory(chip.getAttribute('data-cat-chip'), chip);
    });
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
