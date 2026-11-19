/**
 * Finanças Pediatria /v8/ - Gráfico Caixa × Competência (série mensal, dinheiro a caminho, SVG e textos)
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PediatricStore } from '../js/store.js';
import {
  compactBRL, niceCeil, describeCashVsAccrual, describePipeline, renderCashAccrualSvg, renderCashAccrualHtml
} from '../js/ui/cash-accrual.js';

const makeStore = () => {
  const s = new PediatricStore({ saveSync() {}, saveAsync: async () => true });
  s.init(); s.data.shifts = []; s.data.expenses = [];
  s.data.residencySalary = { value: 4000, dayOfMonth: 5, active: true, description: 'Bolsa' };
  return s;
};
const nbsp = (s) => s.replace(/\u00a0/g, ' ');

describe('v8 - Caixa × Competência', () => {
  it('série: 6 meses (2 antes, atual, 3 depois), um único mês ativo e valores iguais ao resumo de cada regime', () => {
    const s = makeStore();
    s.addShift({ hospital: 'A', net_value: 2000, date: '2026-09-10' });
    s.addShift({ hospital: 'B', net_value: 3000, date: '2026-11-03' });
    const series = s.getCashVsAccrualSeries('2026-11');
    assert.deepEqual(series.map(x => x.month), ['2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02']);
    assert.deepEqual(series.map(x => x.label), ['Setembro', 'Outubro', 'Novembro', 'Dezembro', 'Janeiro', 'Fevereiro']);
    assert.equal(series.filter(x => x.isActive).length, 1);
    assert.equal(series.find(x => x.isActive).month, '2026-11');
    for (const p of series) {
      assert.equal(p.cash, s.getMonthSummary(p.month, 'caixa').totalIncome, `caixa ${p.month}`);
      assert.equal(p.accrual, s.getMonthSummary(p.month, 'competencia').totalIncome, `competência ${p.month}`);
      assert.equal(p.gap, Math.round((p.accrual - p.cash) * 100) / 100);
    }
    // novembro: produziu 3000 (+4000 bolsa); caixa recebe 75% de setembro (1500) + bolsa
    const nov = series.find(x => x.month === '2026-11');
    assert.deepEqual([nov.cash, nov.accrual, nov.gap], [5500, 7000, 1500]);
  });

  it('série atravessa a virada de ano em qualquer direção', () => {
    const s = makeStore();
    assert.deepEqual(s.getCashVsAccrualSeries('2026-12').map(x => x.month), ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03']);
    assert.deepEqual(s.getCashVsAccrualSeries('2026-01').map(x => x.month), ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04']);
    assert.equal(s.getCashVsAccrualSeries('2026-05', 0, 0).length, 1);
  });

  it('dinheiro a caminho: soma pendentes, conta atrasadas e acha a próxima data (recebidas ficam de fora)', () => {
    const s = makeStore();
    s.addShift({ hospital: 'A', net_value: 2000, date: '2026-06-10' });  // parcelas 10/08 (1500) e 10/09 (500)
    s.addShift({ hospital: 'B', net_value: 1000, date: '2026-11-03' });  // 03/01/2027 (750) e 03/02/2027 (250)
    s.data.shifts.find(x => x.date === '2026-06-10').installments[0].status = 'received';
    const p = s.getReceivablesPipeline('2026-11-19');
    assert.deepEqual(p, { total: 1500, count: 3, overdueTotal: 500, overdueCount: 1, nextDate: '2026-09-10' });
    assert.equal(makeStore().getReceivablesPipeline('2026-11-19').count, 0);
    assert.equal(makeStore().getReceivablesPipeline().nextDate, null);
  });

  it('formatadores: eixo compacto em pt-BR e teto redondo do eixo', () => {
    assert.deepEqual([compactBRL(0), compactBRL(800), compactBRL(1000), compactBRL(2500), compactBRL(10000)], ['R$ 0', 'R$ 800', 'R$ 1 mil', 'R$ 2,5 mil', 'R$ 10 mil']);
    assert.deepEqual([niceCeil(0), niceCeil(-5), niceCeil(730), niceCeil(1900), niceCeil(2300), niceCeil(4100), niceCeil(8500)], [1000, 1000, 1000, 2000, 2500, 5000, 10000]);
  });

  it('frases: produção maior, caixa maior e iguais; pipeline com e sem atraso', () => {
    const base = { month: '2026-11', cash: 5950, accrual: 8500 };
    assert.match(nbsp(describeCashVsAccrual({ ...base, gap: 2550 })), /produziu R\$ 8\.500,00, mas só R\$ 5\.950,00 cai na conta: R\$ 2\.550,00 ainda estão a caminho/);
    assert.match(nbsp(describeCashVsAccrual({ month: '2026-12', cash: 7000, accrual: 4000, gap: -3000 })), /entram R\$ 7\.000,00 .* R\$ 3\.000,00 vêm de plantões de meses anteriores/);
    assert.match(nbsp(describeCashVsAccrual({ month: '2026-12', cash: 4000, accrual: 4000, gap: 0 })), /são iguais: R\$ 4\.000,00/);
    assert.equal(describeCashVsAccrual(null), '');
    assert.equal(describePipeline({ count: 0 }), '');
    assert.match(nbsp(describePipeline({ total: 1500, count: 1, overdueTotal: 0, overdueCount: 0, nextDate: '2026-12-05' })), /R\$ 1\.500,00 em 1 parcela, a próxima em 05\/12\/2026\.$/);
    assert.match(nbsp(describePipeline({ total: 2000, count: 3, overdueTotal: 500, overdueCount: 2, nextDate: null })), /Em atraso: R\$ 500,00 \(2 parcelas\)\.$/);
  });

  it('SVG: 6 grupos, 12 barras, alternativa textual completa e nenhuma coordenada inválida (NaN)', () => {
    const s = makeStore();
    s.addShift({ hospital: 'A', net_value: 2000, date: '2026-11-03' });
    const svg = renderCashAccrualSvg(s.getCashVsAccrualSeries('2026-11'));
    assert.equal((svg.match(/class="cac-group/g) || []).length, 6);
    assert.equal((svg.match(/class="cac-bar /g) || []).length, 12);
    assert.equal((svg.match(/cac-group active/g) || []).length, 1);
    assert.match(svg, /role="img" aria-labelledby="cac-title cac-desc"/);
    assert.ok(svg.includes('<title id="cac-title">') && svg.includes('<desc id="cac-desc">'));
    assert.ok(nbsp(svg).includes('Novembro de 2026: caixa R$ 4.000,00, competência R$ 6.000,00'));
    assert.ok(!/NaN|undefined|Infinity/.test(svg), 'sem valores inválidos');
    assert.ok(!/NaN|undefined|Infinity/.test(renderCashAccrualSvg(makeStore().getCashVsAccrualSeries('2026-11'))), 'mês sem dados também gera SVG válido');
    // as barras nunca passam da área do gráfico
    for (const m of svg.matchAll(/class="cac-bar [a-z]+" x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)"/g)) {
      assert.ok(Number(m[1]) >= 12 - 0.01 && Number(m[1]) + Number(m[2]) <= 162 + 0.5, `barra fora da área: y=${m[1]} h=${m[2]}`);
    }
  });

  it('HTML do cartão: legenda não depende só de cor, tabela com 6 linhas e cabeçalhos, mês atual marcado, atraso destacado', () => {
    const s = makeStore();
    s.addShift({ hospital: 'A', net_value: 2000, date: '2026-06-10' });
    const html = renderCashAccrualHtml(s.getCashVsAccrualSeries('2026-11'), s.getReceivablesPipeline('2026-11-19'));
    assert.equal((html.match(/<tr/g) || []).length, 7, '1 cabeçalho + 6 meses');
    assert.ok(html.includes('<th scope="row">') && html.includes('<th scope="col"'));
    assert.ok(html.includes('aria-current="date"') && html.includes('>atual<'));
    assert.ok(html.includes('Caixa (cai na conta)') && html.includes('Competência (produção)'));
    assert.ok(html.includes('class="cac-pipeline overdue"'), 'parcelas atrasadas destacadas');
    // setembro recebe a 2ª parcela (R$ 500) sem produzir nada: diferença negativa, mostrada com sinal e classe própria
    assert.match(nbsp(html), /class="num gap neg">−R\$ 500,00</);
    assert.match(nbsp(html), /class="num gap ">R\$ 0,00</, 'meses sem diferença não ganham sinal nem cor');
    assert.ok(!/<script|onerror=/i.test(html));
  });
});