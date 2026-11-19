/**
 * Finanças Pediatria /v8/ - UI: Tetos mensais por categoria (cartão, aviso na Início, aviso ao lançar, edição do teto)
 * Funções puras (renderizadores) + métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { formatCurrency, getLocalDateString } from '../store.js';
import { getIconSvg, sanitizeColor } from '../icons.js';
import { escapeHtml } from './helpers.js';

const STATUS_TEXT = {
  ok: 'Dentro do teto',
  warn: 'Perto do teto',
  over: 'Acima do teto'
};

export function budgetStatusText(status) {
  return STATUS_TEXT[status] || STATUS_TEXT.ok;
}

/** Texto curto de uma linha de teto: "R$ 230,00 de R$ 300,00 • restam R$ 70,00" */
export function budgetLineText(item, fmt = formatCurrency) {
  const base = `${fmt(item.spent)} de ${fmt(item.cap)}`;
  return item.status === 'over'
    ? `${base} • ${fmt(Math.abs(item.remaining))} acima`
    : `${base} • restam ${fmt(item.remaining)}`;
}

function bubble(item) {
  return `<span class="cat-icon" style="--cat-color: ${sanitizeColor(item.color, '#AB47BC')};">${getIconSvg(item.icon || 'tag', { size: 18 })}</span>`;
}

function statusIcon(status) {
  return getIconSvg(status === 'ok' ? 'check_circle' : 'alert', { size: 14 });
}

/** Cartão "Tetos do mês" da aba Despesas */
export function renderBudgetCardHtml(items, fmt = formatCurrency) {
  if (!items.length) {
    return `
      <div class="section-header">
        <h2>Tetos do mês</h2>
      </div>
      <p class="budget-empty">Defina um teto mensal para as categorias em que você quer controlar os gastos. O app avisa quando estiver perto de estourar.</p>
      <button type="button" class="btn-silk-secondary budget-empty-btn" data-action="open-categories">Definir tetos</button>`;
  }
  const over = items.filter(i => i.status === 'over').length;
  const warn = items.filter(i => i.status === 'warn').length;
  const summary = over || warn
    ? [over ? `${over} acima` : '', warn ? `${warn} perto` : ''].filter(Boolean).join(' • ')
    : 'Tudo dentro do teto';
  return `
    <div class="section-header">
      <h2>Tetos do mês</h2>
      <button type="button" class="section-action-btn" data-action="open-categories">Editar tetos</button>
    </div>
    <p class="budget-summary ${over ? 'over' : warn ? 'warn' : 'ok'}">${statusIcon(over ? 'over' : warn ? 'warn' : 'ok')} ${escapeHtml(summary)}</p>
    <ul class="budget-list">
      ${items.map(i => `
        <li class="budget-row ${i.status}">
          ${bubble(i)}
          <div class="budget-main">
            <div class="budget-head">
              <strong class="budget-name">${escapeHtml(i.name)}</strong>
              <span class="budget-badge ${i.status}">${statusIcon(i.status)} ${budgetStatusText(i.status)}</span>
            </div>
            <div class="budget-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
              aria-valuenow="${Math.min(100, Math.round(i.pct))}"
              aria-valuetext="${escapeHtml(`${i.name}: ${Math.round(i.pct)}% do teto. ${budgetStatusText(i.status)}.`)}"
              aria-label="${escapeHtml(`Teto de ${i.name}`)}">
              <span class="budget-bar-fill ${i.status}" style="width: ${Math.max(2, Math.min(100, i.pct))}%;"></span>
            </div>
            <div class="budget-foot">
              <span>${escapeHtml(budgetLineText(i, fmt))}</span>
              <span class="budget-pct">${Math.round(i.pct)}%</span>
            </div>
          </div>
        </li>`).join('')}
    </ul>`;
}

/** Aviso compacto da Início: só aparece quando há categorias perto ou acima do teto */
export function renderBudgetAlertHtml(items) {
  const hot = items.filter(i => i.status !== 'ok');
  if (!hot.length) return '';
  const over = hot.filter(i => i.status === 'over');
  const level = over.length ? 'over' : 'warn';
  const names = hot.slice(0, 3).map(i => `${i.name} (${Math.round(i.pct)}%)`).join(', ');
  const more = hot.length > 3 ? ` e mais ${hot.length - 3}` : '';
  const title = over.length
    ? (over.length === 1 ? '1 categoria acima do teto' : `${over.length} categorias acima do teto`)
    : (hot.length === 1 ? '1 categoria perto do teto' : `${hot.length} categorias perto do teto`);
  return `
    <div class="budget-alert ${level}" role="status">
      <span class="budget-alert-icon" aria-hidden="true">${getIconSvg('alert', { size: 20 })}</span>
      <div class="budget-alert-text">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(names + more)}</span>
      </div>
      <button type="button" class="budget-alert-btn" data-goto-tab="expenses">Ver tetos</button>
    </div>`;
}

/** Mensagem exibida ao lançar uma despesa em categoria com teto */
export function describeBudgetImpact(impact, fmt = formatCurrency) {
  if (!impact || !impact.hasCap) return null;
  const head = `Teto de ${impact.name}: ${fmt(impact.cap)}/mês.`;
  if (impact.status === 'over') {
    return { level: 'over', text: `${head} Com este lançamento você chega a ${fmt(impact.spentAfter)} (${Math.round(impact.pctAfter)}%): ${fmt(impact.overBy)} acima do teto.` };
  }
  if (impact.status === 'warn') {
    return { level: 'warn', text: `${head} Com este lançamento: ${fmt(impact.spentAfter)} (${Math.round(impact.pctAfter)}%), restam ${fmt(impact.remainingAfter)}.` };
  }
  return { level: 'ok', text: `${head} Com este lançamento: ${fmt(impact.spentAfter)} (${Math.round(impact.pctAfter)}%), restam ${fmt(impact.remainingAfter)}.` };
}

export class BudgetMethods {
  _budgetMonth() {
    return this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
  }

  /** Cartão da aba Despesas */
  renderBudgetCard() {
    const el = document.getElementById('budget-caps-container');
    if (!el) return;
    el.innerHTML = renderBudgetCardHtml(this.store.getBudgetStatus(this._budgetMonth()));
  }

  /** Aviso da aba Início */
  renderBudgetAlert() {
    const el = document.getElementById('home-budget-alert');
    if (!el) return;
    el.innerHTML = renderBudgetAlertHtml(this.store.getBudgetStatus(this._budgetMonth()));
  }

  /** Mostra, ao lançar uma despesa, quanto do teto da categoria ela consome */
  updateExpenseBudgetHint(form) {
    const hint = form?.querySelector('#exp-budget-hint');
    if (!hint) return;
    const category = form.querySelector('#exp-category-input')?.value;
    const date = form.querySelector('#exp-date-input')?.value || getLocalDateString();
    const total = parseFloat(form.querySelector('#exp-amount-input')?.value) || 0;
    const n = Math.max(1, parseInt(form.querySelector('#exp-installments-input')?.value || '1', 10) || 1);

    // Em compra parcelada, só a 1ª parcela cai no mês da compra (a 1ª recebe o arredondamento)
    const part = Math.floor((total / n) * 100) / 100;
    const thisMonth = n > 1 ? Math.round((total - part * (n - 1)) * 100) / 100 : total;

    // Edição: desconta o valor antigo se a despesa já estava neste mês e categoria
    let replace = 0;
    const editing = this.editingExpenseId && this.store.data.expenses.find(e => e.id === this.editingExpenseId);
    if (editing && editing.date && editing.date.slice(0, 7) === date.slice(0, 7) && editing.category_name_snapshot === category) {
      replace = parseFloat(editing.amount) || 0;
    }

    const info = describeBudgetImpact(this.store.getBudgetImpact(category, date.slice(0, 7), thisMonth, replace));
    if (!info) { hint.textContent = ''; hint.className = 'budget-hint hidden'; return; }
    const suffix = n > 1 ? ' (considerando só a 1ª parcela deste mês)' : '';
    hint.className = `budget-hint ${info.level}`;
    hint.innerHTML = `<span aria-hidden="true">${getIconSvg(info.level === 'ok' ? 'check_circle' : 'alert', { size: 16 })}</span><span>${escapeHtml(info.text + suffix)}</span>`;
  }

  /** Modal para definir/remover o teto de qualquer categoria */
  openCategoryCapModal(categoryId) {
    const cat = this.store.getAllCategories().find(c => c.id === categoryId);
    const form = document.getElementById('form-category-cap');
    if (!cat || !form) return;
    this.closeAllModals();
    form.setAttribute('data-category-id', categoryId);
    const titleEl = document.getElementById('modal-category-cap-title');
    if (titleEl) titleEl.textContent = `Teto de ${cat.name}`;
    const status = this.store.getBudgetStatus(this._budgetMonth()).find(s => s.id === categoryId);
    const spentNow = this.store.data.expenses
      .filter(e => e.date && e.date.startsWith(this._budgetMonth()) && (e.category_id === categoryId || e.category_name_snapshot === cat.name))
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    form.innerHTML = `
      <p class="inst-modal-context">
        <strong>${escapeHtml(cat.name)}</strong> • ${escapeHtml(cat.macro_group || '')}<br>
        Gasto neste mês: <strong>${formatCurrency(Math.round(spentNow * 100) / 100)}</strong>${status ? ` (${Math.round(status.pct)}% do teto atual)` : ''}
      </p>
      <div class="form-group">
        <label for="cap-value-input">Teto mensal (R$)</label>
        <input type="number" id="cap-value-input" name="cap" class="form-input silk-input" step="0.01" min="0" inputmode="decimal"
          value="${cat.monthly_budget_cap ? cat.monthly_budget_cap : ''}" placeholder="Sem teto" />
        <small class="cap-help">Deixe em branco para não ter teto nesta categoria. O app avisa a partir de 80%.</small>
      </div>
      <div class="modal-actions-row">
        <button type="button" class="btn-silk-secondary" data-close-modal="#modal-category-cap">Cancelar</button>
        <button type="submit" class="btn-silk-primary">Salvar teto</button>
      </div>
    `;
    this.openModal('#modal-category-cap');
  }

  handleSaveCategoryCap(form) {
    const id = form.getAttribute('data-category-id');
    const res = this.store.setCategoryBudgetCap(id, form.cap.value);
    if (!res.updated) {
      this.showToast(res.error || 'Não foi possível salvar o teto', 'error');
      return;
    }
    this.closeModal('#modal-category-cap');
    this.render();
    const name = res.category.name;
    const message = res.cap ? `Teto de ${name}: ${formatCurrency(res.cap)}/mês` : `Teto de ${name} removido`;
    this.showToastWithUndo(message, () => {
      this.store.setCategoryBudgetCap(id, res.previous);
      this.render();
      this.showToast('Alteração do teto desfeita');
    });
    this.openCategoriesModal();
  }
}
