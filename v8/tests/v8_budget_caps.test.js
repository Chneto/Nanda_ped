/**
 * Finanças Pediatria /v8/ - Tetos mensais por categoria (status, impacto ao lançar, edição e renderização)
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PediatricStore } from '../js/store.js';
import {
  budgetLineText, budgetStatusText, renderBudgetCardHtml, renderBudgetAlertHtml, describeBudgetImpact
} from '../js/ui/budget.js';

const makeStore = () => {
  const s = new PediatricStore({ saveSync() {}, saveAsync: async () => true });
  s.init();
  s.data.expenses = [];
  return s;
};
const idOf = (s, name) => s.data.categories.find(c => c.name === name).id;
const cap = (s, name, v) => s.setCategoryBudgetCap(idOf(s, name), v);
const spend = (s, category, amount, date = '2026-11-05') => s.addExpense({ description: `${category} ${amount}`, category, amount, date });

describe('v8 - Tetos mensais por categoria', () => {
  it('getBudgetStatus: ok < 80%, warn de 80% a 100%, over acima de 100%; ordena os piores primeiro', () => {
    const s = makeStore();
    // Academia já vem com um teto padrão de 200: zere para isolar o teste
    cap(s, 'Academia', null);
    cap(s, 'Mercantil', 300); cap(s, 'Energia', 200); cap(s, 'Uber', 400); cap(s, 'Remédios', 100);
    spend(s, 'Mercantil', 330);   // 110% -> over
    spend(s, 'Energia', 170);     // 85%  -> warn
    spend(s, 'Uber', 60);         // 15%  -> ok
    spend(s, 'Remédios', 80);     // 80% exato -> warn
    const st = s.getBudgetStatus('2026-11');
    assert.deepEqual(st.map(x => [x.name, x.status, x.pct]), [
      ['Mercantil', 'over', 110], ['Remédios', 'warn', 80], ['Energia', 'warn', 85], ['Uber', 'ok', 15]
    ].sort((a, b) => ['over', 'warn', 'ok'].indexOf(a[1]) - ['over', 'warn', 'ok'].indexOf(b[1]) || b[2] - a[2]));
    assert.equal(st[0].remaining, -30);
    assert.equal(st.find(x => x.name === 'Energia').remaining, 30);
  });

  it('exatamente 100% não é "acima"; um centavo a mais é', () => {
    const s = makeStore(); cap(s, 'Academia', null);
    cap(s, 'Mercantil', 300);
    spend(s, 'Mercantil', 300);
    assert.equal(s.getBudgetStatus('2026-11')[0].status, 'warn');
    spend(s, 'Mercantil', 0.01);
    assert.equal(s.getBudgetStatus('2026-11')[0].status, 'over');
  });

  it('só conta despesas do mês consultado e ignora categorias sem teto', () => {
    const s = makeStore(); cap(s, 'Academia', null);
    cap(s, 'Mercantil', 300);
    spend(s, 'Mercantil', 100, '2026-10-30');
    spend(s, 'Mercantil', 50, '2026-11-02');
    spend(s, 'Uber', 999, '2026-11-02'); // sem teto
    const nov = s.getBudgetStatus('2026-11');
    assert.equal(nov.length, 1);
    assert.equal(nov[0].spent, 50);
    assert.equal(s.getBudgetStatus('2026-10')[0].spent, 100);
    assert.equal(s.getBudgetStatus('2026-12')[0].spent, 0);
  });

  it('compras parceladas contam só a parcela de cada mês', () => {
    const s = makeStore(); cap(s, 'Academia', null);
    cap(s, 'Mercantil', 300);
    s.addExpense({ description: 'Geladeira', category: 'Mercantil', amount: 900, date: '2026-11-10', total_installments: 3 });
    assert.equal(s.getBudgetStatus('2026-11')[0].spent, 300);
    assert.equal(s.getBudgetStatus('2026-12')[0].spent, 300);
    assert.equal(s.getBudgetStatus('2026-11')[0].status, 'warn');
  });

  it('getBudgetImpact: prevê o efeito do lançamento e desconta o valor antigo ao editar', () => {
    const s = makeStore(); cap(s, 'Academia', null);
    cap(s, 'Mercantil', 300);
    spend(s, 'Mercantil', 230);
    let i = s.getBudgetImpact('Mercantil', '2026-11', 100);
    assert.deepEqual([i.hasCap, i.spentBefore, i.spentAfter, i.pctAfter, i.overBy, i.status], [true, 230, 330, 110, 30, 'over']);
    i = s.getBudgetImpact('Mercantil', '2026-11', 50);
    assert.deepEqual([i.spentAfter, i.remainingAfter, i.status], [280, 20, 'warn']);
    i = s.getBudgetImpact('Mercantil', '2026-11', 40, 230); // editando a despesa de 230 para 40
    assert.deepEqual([i.spentBefore, i.spentAfter, i.status], [0, 40, 'ok']);
    assert.equal(s.getBudgetImpact('Uber', '2026-11', 10).hasCap, false);
    assert.equal(s.getBudgetImpact('Inexistente', '2026-11', 10).hasCap, false);
  });

  it('setCategoryBudgetCap: define, altera, remove (vazio/0/null) e rejeita valores inválidos', () => {
    const s = makeStore();
    const id = idOf(s, 'Mercantil');
    assert.equal(s.setCategoryBudgetCap(id, '300,5'.replace(',', '.')).cap, 300.5);
    assert.equal(s.setCategoryBudgetCap(id, 450).previous, 300.5);
    for (const empty of [null, undefined, '', '   ', 0, '0']) {
      s.setCategoryBudgetCap(id, 100);
      assert.equal(s.setCategoryBudgetCap(id, empty).cap, null, `valor "${empty}" remove o teto`);
      assert.equal(s.data.categories.find(c => c.id === id).monthly_budget_cap, null);
    }
    for (const bad of [-5, 'abc', NaN, Infinity]) {
      s.setCategoryBudgetCap(id, 200);
      assert.equal(s.setCategoryBudgetCap(id, bad).updated, false, `valor ${bad}`);
      assert.equal(s.data.categories.find(c => c.id === id).monthly_budget_cap, 200, 'inválido não altera');
    }
    assert.equal(s.setCategoryBudgetCap('nao-existe', 10).updated, false);
  });

  it('restaurar categorias padrão preserva os tetos definidos pela usuária', () => {
    const s = makeStore();
    cap(s, 'Mercantil', 321); cap(s, 'Academia', null);
    s.restoreDefaultCategories();
    assert.equal(s.data.categories.find(c => c.name === 'Mercantil').monthly_budget_cap, 321);
    assert.equal(s.data.categories.find(c => c.name === 'Academia').monthly_budget_cap, null, 'teto removido continua removido');
  });

  it('renderizadores: cartão com barra acessível, aviso da Início e mensagens de impacto (tudo escapado)', () => {
    const s = makeStore(); cap(s, 'Academia', null);
    cap(s, 'Mercantil', 300); cap(s, 'Energia', 200); cap(s, 'Uber', 400);
    spend(s, 'Mercantil', 330); spend(s, 'Energia', 170); spend(s, 'Uber', 60);
    const items = s.getBudgetStatus('2026-11');

    const card = renderBudgetCardHtml(items);
    assert.equal((card.match(/role="progressbar"/g) || []).length, 3);
    assert.match(card, /aria-valuenow="100"[^>]*aria-valuetext="Mercantil: 110% do teto\. Acima do teto\."/);
    assert.ok(card.includes('Acima do teto') && card.includes('Perto do teto') && card.includes('Dentro do teto'), 'estado dito em texto, não só por cor');
    assert.ok(card.includes('1 acima • 1 perto'));
    assert.ok(card.includes('data-action="open-categories"'));
    assert.match(renderBudgetCardHtml([]), /Definir tetos/);

    const alert = renderBudgetAlertHtml(items);
    assert.ok(alert.includes('1 categoria acima do teto') && alert.includes('Mercantil (110%), Energia (85%)'));
    assert.ok(alert.includes('data-goto-tab="expenses"') && !alert.includes('data-tab='), 'não pode reutilizar data-tab da barra de navegação');
    assert.equal(renderBudgetAlertHtml(items.filter(i => i.status === 'ok')), '', 'sem aviso quando está tudo certo');

    assert.equal(budgetStatusText('over'), 'Acima do teto');
    const nbsp = (s) => s.replace(/\u00a0/g, ' ');
    assert.equal(nbsp(budgetLineText(items[0])), 'R$ 330,00 de R$ 300,00 • R$ 30,00 acima');
    const evil = renderBudgetCardHtml([{ id: 'x', name: '<img src=x onerror=1>', icon: 'tag', color: 'red;background:url(javascript:1)', cap: 10, spent: 5, remaining: 5, pct: 50, status: 'ok' }]);
    assert.ok(!evil.includes('<img') && !evil.includes('javascript:'));

    const msg = describeBudgetImpact(s.getBudgetImpact('Mercantil', '2026-11', 100));
    assert.equal(msg.level, 'over');
    // já gasto 330 + este lançamento de 100 = 430 (143%) -> 130 acima do teto de 300
    assert.ok(nbsp(msg.text).includes('R$ 130,00 acima do teto'), msg.text);
    assert.equal(describeBudgetImpact({ hasCap: false }), null);
  });
});