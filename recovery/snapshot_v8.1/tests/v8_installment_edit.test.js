/**
 * Finanças Pediatria /v8/ - Edição de parcelas de plantão (data, valor, recebimento real e Desfazer)
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PediatricStore } from '../js/store.js';

const makeStore = () => {
  const s = new PediatricStore({ saveSync() {}, saveAsync: async () => true });
  s.init();
  s.data.shifts = [];
  const shift = s.addShift({ hospital: 'Maternidade Principal', net_value: 2000, date: '2026-09-10' });
  return { s, shift };
};
const sum = (shift) => Math.round(shift.installments.reduce((a, i) => a + i.value, 0) * 100) / 100;

describe('v8 - Edição de parcelas de plantão', () => {
  it('muda a data prevista e o dinheiro passa a cair no mês novo (caixa)', () => {
    const { s, shift } = makeStore();
    assert.equal(shift.installments[0].date, '2026-11-10');
    assert.equal(s.getMonthSummary('2026-11', 'caixa').totalIncome, 1500);

    const res = s.updateShiftInstallment(shift.id, 1, { date: '2026-12-02' });
    assert.equal(res.updated, true);
    assert.equal(s.getMonthSummary('2026-11', 'caixa').totalIncome, 0, 'saiu de novembro');
    // dezembro já recebia a 2ª parcela (500); a 1ª (1500) passou para lá
    assert.equal(s.getMonthSummary('2026-12', 'caixa').totalIncome, 2000, 'entrou em dezembro (1ª parcela + 2ª que já era de dezembro)');
    assert.equal(shift.installments[0].edited, true);
  });

  it('marcar como recebido guarda a data real; voltar a pendente limpa; sem data usa hoje', () => {
    const { s, shift } = makeStore();
    s.updateShiftInstallment(shift.id, 1, { status: 'received', paidDate: '2026-11-14' });
    assert.equal(shift.installments[0].status, 'received');
    assert.equal(shift.installments[0].paidDate, '2026-11-14');
    assert.equal(s.getMonthSummary('2026-11', 'caixa').shiftInflowRealized, 1500);

    s.updateShiftInstallment(shift.id, 1, { status: 'pending' });
    assert.equal(shift.installments[0].paidDate, null);

    s.updateShiftInstallment(shift.id, 2, { status: 'received' });
    assert.match(shift.installments[1].paidDate, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('com "balance" a outra parcela fecha o total; percentuais acompanham', () => {
    const { s, shift } = makeStore();
    const res = s.updateShiftInstallment(shift.id, 1, { value: 1200, balance: true });
    assert.equal(res.updated, true);
    assert.equal(shift.installments[0].value, 1200);
    assert.equal(shift.installments[1].value, 800);
    assert.equal(sum(shift), 2000);
    assert.equal(shift.installments[0].percentage, 60);
    assert.equal(shift.installments[1].percentage, 40);
    assert.equal(shift.installments[1].edited, true);

    // editando a 2ª, a 1ª é a ajustada
    s.updateShiftInstallment(shift.id, 2, { value: 500.5, balance: true });
    assert.equal(shift.installments[0].value, 1499.5);
    assert.equal(sum(shift), 2000);
  });

  it('sem "balance" só a parcela muda (soma pode divergir do líquido, de forma consciente)', () => {
    const { s, shift } = makeStore();
    s.updateShiftInstallment(shift.id, 1, { value: 1400 });
    assert.equal(shift.installments[1].value, 500, 'outra parcela intacta');
    assert.equal(sum(shift), 1900);
  });

  it('validações: valor/data/recebimento inválidos não alteram nada', () => {
    const { s, shift } = makeStore();
    const before = JSON.stringify(shift.installments);
    for (const bad of [
      { value: 0 }, { value: -10 }, { value: 'abc' }, { value: '' },
      { date: '2026-02-30' }, { date: '10/11/2026' }, { date: '' },
      { status: 'received', paidDate: 'ontem' }
    ]) {
      const res = s.updateShiftInstallment(shift.id, 1, bad);
      assert.equal(res.updated, false, JSON.stringify(bad));
      assert.ok(res.error);
    }
    assert.equal(JSON.stringify(shift.installments), before, 'estado intacto após entradas inválidas');
    assert.equal(s.updateShiftInstallment('nao-existe', 1, { value: 10 }).updated, false);
    assert.equal(s.updateShiftInstallment(shift.id, 9, { value: 10 }).updated, false);
  });

  it('ajuste que estoura o total é recusado', () => {
    const { s, shift } = makeStore();
    const res = s.updateShiftInstallment(shift.id, 1, { value: 2000, balance: true });
    assert.equal(res.updated, false);
    assert.match(res.error, /excede/);
    assert.equal(shift.installments[0].value, 1500);
  });

  it('Desfazer devolve exatamente as parcelas anteriores', () => {
    const { s, shift } = makeStore();
    const original = JSON.stringify(shift.installments);
    const res = s.updateShiftInstallment(shift.id, 1, { value: 1000, balance: true, date: '2027-01-05', status: 'received', paidDate: '2027-01-06' });
    assert.notEqual(JSON.stringify(shift.installments), original);
    assert.equal(s.restoreShiftInstallments(shift.id, res.previous), true);
    assert.equal(JSON.stringify(shift.installments), original);
    assert.equal(s.restoreShiftInstallments('nao-existe', res.previous), false);
  });

  it('editar só observações do plantão não apaga datas/valores editados da parcela', () => {
    const { s, shift } = makeStore();
    s.updateShiftInstallment(shift.id, 1, { date: '2027-01-15', value: 1000, balance: true });
    s.updateShift(shift.id, { hospital: 'Maternidade Principal', date: shift.date, netValue: shift.net_value, notes: 'obs' });
    assert.equal(shift.installments[0].date, '2027-01-15');
    assert.equal(shift.installments[0].value, 1000);
  });
});