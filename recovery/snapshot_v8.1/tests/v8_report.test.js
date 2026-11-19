/**
 * Finanças Pediatria /v8/ - Relatório mensal (dados, planilha CSV segura e HTML imprimível)
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PediatricStore } from '../js/store.js';
import { PediatricStorage } from '../js/storage.js';
import { buildMonthlyReport, reportToCsv, renderReportHtml, reportFileName, csvText } from '../js/ui/report.js';

const NOW = new Date('2026-11-19T12:00:00');
const seed = () => {
  const s = new PediatricStore({ saveSync() {}, saveAsync: async () => true });
  s.init();
  s.data.shifts = []; s.data.expenses = [];
  s.data.doctorName = 'Dra. Teste'; s.data.doctorRole = 'Pediatra (R3)';
  s.data.residencySalary = { value: 4000, dayOfMonth: 5, active: true, description: 'Bolsa' };
  s.addShift({ hospital: 'Maternidade Secundária', net_value: 1500, date: '2026-09-05' });   // 1ª parcela vence em nov
  s.data.shifts[0].installments[0].status = 'received';
  s.data.shifts[0].installments[0].paidDate = '2026-11-12';
  s.addShift({ hospital: 'Maternidade Principal', net_value: 2000, date: '2026-11-03' });    // trabalhado em nov, paga depois
  s.addShift({ hospital: 'Fora do mês', net_value: 900, date: '2026-01-10' });               // não entra
  const id = (n) => s.data.categories.find(c => c.name === n).id;
  s.setCategoryBudgetCap(id('Mercantil'), 300);
  s.addExpense({ description: 'Feira', category: 'Mercantil', amount: 330, date: '2026-11-05' });
  s.addExpense({ description: 'Aluguel', category: 'Aluguel', amount: 2100, date: '2026-11-05' });
  s.addExpense({ description: 'Geladeira', category: 'Compras Parceladas', amount: 900, date: '2026-11-10', total_installments: 3 });
  s.addExpense({ description: 'Mês passado', category: 'Uber', amount: 77, date: '2026-10-30' });
  return s;
};

describe('v8 - Relatório mensal', () => {
  it('buildMonthlyReport bate com o resumo do mês nos dois regimes e filtra plantões/despesas do mês', () => {
    const s = seed();
    const r = buildMonthlyReport(s, '2026-11', NOW);
    const cx = s.getMonthSummary('2026-11', 'caixa');
    const cp = s.getMonthSummary('2026-11', 'competencia');
    assert.equal(r.monthLabel, 'Novembro de 2026');
    assert.equal(r.generatedAt, '2026-11-19');
    assert.deepEqual([r.summary.incomeCash, r.summary.incomeAccrual, r.summary.expenses, r.summary.balanceCash, r.summary.balanceAccrual],
      [cx.totalIncome, cp.totalIncome, cx.totalExpenses, cx.balance, cp.balance]);
    assert.equal(r.summary.receivedCash, 1125);
    assert.equal(r.summary.production, 2000);
    assert.deepEqual(r.shifts.map(x => x.hospital), ['Maternidade Secundária', 'Maternidade Principal'], 'plantão de janeiro fica de fora');
    assert.equal(r.shifts[0].installments[0].dueThisMonth, true);
    assert.equal(r.shifts[1].workedThisMonth, true);
    assert.deepEqual(r.expenses.map(e => e.description).sort(), ['Aluguel', 'Feira', 'Geladeira (1/3)']);
    assert.ok(!r.expenses.some(e => e.description === 'Mês passado'), 'despesa de outubro não entra');
    assert.equal(r.expenses.find(e => e.description.startsWith('Geladeira')).parcel, '1/3');
    assert.equal(r.budgets[0].name, 'Mercantil');
    assert.equal(r.budgets[0].status, 'over');
  });

  it('mês vazio gera relatório válido (sem quebrar)', () => {
    const s = new PediatricStore({ saveSync() {}, saveAsync: async () => true });
    s.init(); s.data.shifts = []; s.data.expenses = [];
    const r = buildMonthlyReport(s, '2030-02', NOW);
    assert.equal(r.shifts.length, 0); assert.equal(r.expenses.length, 0);
    const csv = reportToCsv(r);
    assert.ok(csv.includes('Despesas do mês;0'));
    const html = renderReportHtml(r);
    assert.ok(html.includes('Nenhum plantão trabalhado') && html.includes('Nenhuma despesa neste mês'));
  });

  it('CSV: separador ";", vírgula decimal, datas dd/mm/aaaa, CRLF, sem BOM embutido e seções completas', () => {
    const csv = reportToCsv(buildMonthlyReport(seed(), '2026-11', NOW));
    assert.ok(!csv.startsWith('\uFEFF'), 'o BOM é acrescentado só ao salvar');
    assert.ok(csv.includes('\r\n') && !/[^\r]\n/.test(csv), 'quebras de linha CRLF');
    for (const section of ['RESUMO', 'PLANTÕES E PARCELAS', 'DESPESAS', 'DESPESAS POR GRUPO', 'DESPESAS POR CATEGORIA', 'TETOS MENSAIS']) assert.ok(csv.includes(`\r\n${section}\r\n`) || csv.includes(`${section}\r\n`), section);
    assert.ok(csv.includes('Bolsa de residência;4000'));
    assert.ok(csv.includes('Saldo - regime de caixa;'));
    assert.ok(csv.includes('05/09/2026;Maternidade Secundária;Sala de Parto;1500;1ª (75%);05/11/2026;1125;Recebido;12/11/2026;Sim'));
    assert.ok(csv.includes('Mercantil;300;330;-30;110;Acima do teto'));
    assert.ok(/Total;;;;\d+(,\d+)?;/.test(csv));
    assert.ok(!/\d\.\d{2};/.test(csv.replace(/\d{2}\/\d{2}\/\d{4}/g, '')), 'sem ponto decimal');
    const widths = csv.split('\r\n').filter(l => l.startsWith('05/11/2026;'));
    assert.ok(widths.length >= 1);
  });

  it('CSV: aspas, ponto e vírgula e quebras de linha preservados; fórmulas são neutralizadas (injeção)', () => {
    assert.equal(csvText('simples'), 'simples');
    assert.equal(csvText('a;b'), '"a;b"');
    assert.equal(csvText('diz "oi"'), '"diz ""oi"""');
    assert.equal(csvText('linha1\nlinha2'), '"linha1\nlinha2"');
    for (const evil of ['=1+1', '+SOMA(A1)', '-2+3', '@cmd', '\t=1', '\r=1']) assert.ok(csvText(evil).replace(/^"/, '').startsWith("'"), `fórmula "${JSON.stringify(evil)}" deve virar texto`);
    assert.equal(csvText(null), '');
    const s = seed();
    s.addExpense({ description: '=HYPERLINK("http://x";"a")', category: 'Uber', amount: 10, date: '2026-11-20' });
    const csv = reportToCsv(buildMonthlyReport(s, '2026-11', NOW));
    assert.ok(csv.includes(`"'=HYPERLINK(""http://x"";""a"")"`), 'texto malicioso fica entre aspas e prefixado');
    assert.ok(!/(^|;)=/m.test(csv), 'nenhuma célula começa com "="');
  });

  it('HTML: escapa dados do usuário, usa tabelas com legenda e cabeçalhos e não carrega recursos externos', () => {
    const s = seed();
    s.data.doctorName = '<img src=x onerror=alert(1)>';
    s.addExpense({ description: '<script>alert(1)</script>', category: 'Uber', amount: 1, date: '2026-11-21' });
    const html = renderReportHtml(buildMonthlyReport(s, '2026-11', NOW));
    assert.ok(!html.includes('<script') && !html.includes('<img src=x'), 'sem HTML injetado');
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok((html.match(/<caption>/g) || []).length >= 4);
    assert.ok((html.match(/<th scope="col"/g) || []).length >= 10);
    assert.ok(html.includes('aria-label="Relatório de Novembro de 2026"'));
    assert.ok(html.includes('criado por FChNeto'));
    assert.ok(!/(src|href)=["']https?:/i.test(html), 'sem recursos externos');
  });

  it('nome do arquivo e saveTextFile (download como alternativa ao compartilhamento nativo)', async () => {
    assert.equal(reportFileName({ month: '2026-11' }, 'csv'), 'relatorio_financas_pediatria_2026-11.csv');
    const names = ['navigator', 'document', 'URL'];
    const saved = Object.fromEntries(names.map(n => [n, Object.getOwnPropertyDescriptor(globalThis, n)]));
    const set = (n, value) => Object.defineProperty(globalThis, n, { value, configurable: true, writable: true });
    let clicked = null;
    set('navigator', {});
    set('document', {
      body: { appendChild() {}, removeChild() {} },
      createElement: () => ({ click() { clicked = this; } })
    });
    set('URL', Object.assign(function URLShim() {}, { createObjectURL: () => 'blob:x', revokeObjectURL() {} }));
    try {
      const res = await new PediatricStorage().saveTextFile('a.csv', 'x;y', 'text/csv;charset=utf-8', 'T');
      assert.deepEqual([res.success, res.method, res.fileName], [true, 'download', 'a.csv']);
      assert.equal(clicked.download, 'a.csv');
    } finally {
      for (const n of names) { if (saved[n]) Object.defineProperty(globalThis, n, saved[n]); else delete globalThis[n]; }
    }
  });});