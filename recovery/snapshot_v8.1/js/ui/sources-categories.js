/**
 * Finanças Pediatria /v8/ - UI: Gestão dinâmica de fontes de renda e categorias
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { formatCurrency } from '../store.js';
import { getIconSvg } from '../icons.js';
import { escapeHtml } from './helpers.js';
import { buildCategoryTree, renderManageTreeHtml, renderMacroRadiosHtml } from './category-picker.js';

export class SourcesCategoriesMethods {
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
    const activeCount = categories.filter(c => c.active !== false).length;
    const customCount = categories.filter(c => c.isCustom && c.active !== false).length;
    const archivedCount = categories.filter(c => c.active === false).length;
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    const summary = [plural(activeCount, 'categoria', 'categorias')];
    if (customCount) summary.push(customCount === 1 ? '1 criada por você' : `${customCount} criadas por você`);
    if (archivedCount) summary.push(plural(archivedCount, 'arquivada', 'arquivadas'));

    const titleEl = document.getElementById('modal-categories-title');
    if (titleEl) titleEl.textContent = `${plural(activeCount, 'Categoria', 'Categorias')} de Gastos`;

    body.innerHTML = `
      <div class="management-toolbar">
        <h4>${escapeHtml(summary.join(' · '))}</h4>
        <button type="button" class="btn-silk-secondary" id="btn-restore-categories">Restaurar 23 Padrões</button>
      </div>

      <div class="categories-grouped-list cat-tree">
        ${renderManageTreeHtml(buildCategoryTree(categories))}
      </div>
      <form id="form-add-category" class="management-add-form" style="margin-top: 16px;">
        <h5>+ Adicionar Nova Categoria</h5>
        <div class="form-group">
          <input type="text" name="name" class="form-input silk-input" placeholder="Nome da Categoria (ex: Fisioterapia Respiratória)" required />
        </div>
        <div class="form-group">
          <label id="newcat-group-label">Em qual grupo ela fica?</label>
          <div class="macro-radio-grid" role="radiogroup" aria-labelledby="newcat-group-label">
            ${renderMacroRadiosHtml()}
          </div>
        </div>
        <div class="form-group">
          <input type="number" name="monthly_budget_cap" class="form-input silk-input" step="0.01" min="0" placeholder="Teto Mensal (Opcional)" />
        </div>
        <button type="submit" class="btn-silk-primary" style="width: 100%;">Cadastrar Categoria</button>
      </form>
    `;

    if (this._catBodyHandler) body.removeEventListener('click', this._catBodyHandler);
    this._catBodyHandler = (e) => {
      const toggle = e.target.closest('[data-cat-macro-toggle]');
      if (toggle) {
        const section = toggle.closest('.cat-macro');
        const open = !section.classList.contains('open');
        body.querySelectorAll('.cat-macro').forEach(s => {
          const shouldOpen = s === section ? open : false;
          s.classList.toggle('open', shouldOpen);
          s.querySelector('[data-cat-macro-toggle]').setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
          const mb = s.querySelector('.cat-macro-body');
          if (shouldOpen) mb.removeAttribute('hidden'); else mb.setAttribute('hidden', '');
        });
        return;
      }

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
    };
    body.addEventListener('click', this._catBodyHandler);

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
}
